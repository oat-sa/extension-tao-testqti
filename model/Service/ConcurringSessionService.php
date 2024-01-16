<?php

/**
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU General Public License
 * as published by the Free Software Foundation; under version 2
 * of the License (non-upgradable).
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program; if not, write to the Free Software
 * Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301, USA.
 *
 * Copyright (c) 2023-2024 (original work) Open Assessment Technologies SA;
 */

declare(strict_types=1);

namespace oat\taoQtiTest\model\Service;

use common_Exception;
use core_kernel_classes_Resource;
use oat\generis\model\data\Ontology;
use oat\oatbox\service\ServiceManager;
use oat\tao\model\featureFlag\FeatureFlagCheckerInterface;
use oat\taoDelivery\model\execution\DeliveryExecution;
use oat\taoDelivery\model\execution\DeliveryExecutionInterface;
use oat\taoDelivery\model\execution\DeliveryExecutionService;
use oat\taoDelivery\model\RuntimeService;
use oat\taoQtiTest\models\container\QtiTestDeliveryContainer;
use oat\taoQtiTest\models\runner\QtiRunnerService;
use oat\taoQtiTest\models\runner\QtiRunnerServiceContext;
use oat\taoQtiTest\models\runner\session\TestSession;
use oat\taoQtiTest\models\runner\time\QtiTimer;
use oat\taoQtiTest\models\runner\time\QtiTimerFactory;
use oat\taoQtiTest\models\runner\time\TimerAdjustmentService;
use oat\taoQtiTest\models\runner\time\TimerAdjustmentServiceInterface;
use oat\taoQtiTest\models\TestSessionService;
use PHPSession;
use Psr\Log\LoggerInterface;
use qtism\data\QtiIdentifiable;
use qtism\runtime\tests\RouteItem;
use DateTime;
use Throwable;

class ConcurringSessionService
{
    private const PAUSE_REASON_CONCURRENT_TEST = 'PAUSE_REASON_CONCURRENT_TEST';

    private LoggerInterface $logger;
    private QtiRunnerService $qtiRunnerService;
    private RuntimeService $runtimeService;
    private Ontology $ontology;
    private DeliveryExecutionService $deliveryExecutionService;
    private FeatureFlagCheckerInterface $featureFlagChecker;
    private ?PHPSession $currentSession;

    public function __construct(
        LoggerInterface $logger,
        QtiRunnerService $qtiRunnerService,
        RuntimeService $runtimeService,
        Ontology $ontology,
        DeliveryExecutionService $deliveryExecutionService,
        FeatureFlagCheckerInterface $featureFlagChecker,
        PHPSession $currentSession = null
    ) {
        $this->logger = $logger;
        $this->qtiRunnerService = $qtiRunnerService;
        $this->runtimeService = $runtimeService;
        $this->ontology = $ontology;
        $this->deliveryExecutionService = $deliveryExecutionService;
        $this->featureFlagChecker = $featureFlagChecker;
        $this->currentSession = $currentSession ?? PHPSession::singleton();
    }

    public function pauseConcurrentSessions(DeliveryExecution $activeExecution): void
    {
        if (!$this->featureFlagChecker->isEnabled('FEATURE_FLAG_PAUSE_CONCURRENT_SESSIONS')) {
            return;
        }

        $now = $_SERVER['REQUEST_TIME_FLOAT'] ?? microtime(true);
        $userIdentifier = $activeExecution->getUserIdentifier();

        if (empty($userIdentifier) || $userIdentifier === 'anonymous') {
            return;
        }

        /** @var DeliveryExecutionInterface[] $userExecutions */
        $userExecutions = $this->deliveryExecutionService->getDeliveryExecutionsByStatus(
            $activeExecution->getUserIdentifier(),
            DeliveryExecutionInterface::STATE_ACTIVE
        );

        foreach ($userExecutions as $execution) {
            if ($execution->getOriginalIdentifier() !== $activeExecution->getOriginalIdentifier()) {
                try {
                    $this->setConcurringSession($execution->getOriginalIdentifier());

                    $context = $this->getContextByDeliveryExecution($execution);

                    $this->qtiRunnerService->endTimer($context);
                    $this->qtiRunnerService->pause($context);
                } catch (Throwable $e) {
                    $this->logger->warning(
                        sprintf(
                            '%s: Unable to pause delivery execution %s: %s',
                            self::class,
                            $execution->getOriginalIdentifier(),
                            $e->getMessage()
                        )
                    );
                }
                    /*$this->pauseSingleExecution($execution, $now);
                }
            } catch (Throwable $e) {
                $this->logger->warning(
                    sprintf(
                        '%s: Unable to pause delivery execution %s: %s',
                        self::class,
                        $executionId,
                        $e->getMessage()
                    )
                );*/
            }
        }
    }

    public function isConcurringSession(DeliveryExecution $execution): bool
    {
        $key = "pauseReason-{$execution->getOriginalIdentifier()}";

        return $this->currentSession->hasAttribute($key)
            && $this->currentSession->getAttribute($key) === self::PAUSE_REASON_CONCURRENT_TEST;
    }

    public function clearConcurringSession(DeliveryExecution $execution): void
    {
        $this->currentSession->removeAttribute("pauseReason-{$execution->getOriginalIdentifier()}");
    }

    public function setConcurringSession(string $executionId): void
    {
        $this->currentSession->setAttribute(
            "pauseReason-{$executionId}",
            self::PAUSE_REASON_CONCURRENT_TEST
        );
    }

    public function adjustTimers(DeliveryExecution $execution): void
    {
        $this->logger->info(
            sprintf("Adjusting timers on test restart, current ts is %f", microtime(true))
        );

        $testSession = $this->getTestSessionService()->getTestSession($execution);

        if ($testSession instanceof TestSession) {
            $timer = $testSession->getTimer();
        } else {
            $timer = $this->getQtiTimerFactory()->getTimer(
                $execution->getIdentifier(),
                $execution->getUserIdentifier()
            );
        }

        $executionId = $execution->getIdentifier();

        if ($this->currentSession->hasAttribute("pausedAt-{$executionId}")) {
            $last = $this->currentSession->getAttribute("pausedAt-{$executionId}");
            $this->currentSession->removeAttribute("pausedAt-{$executionId}");

            $this->logger->info(
                sprintf("Adjusting timers based on timestamp stored in session: %f", $last)
            );
        }

        if (!isset($last) && $testSession instanceof TestSession) {
            $last = $this->getHighestItemTimestamp($testSession, $timer);

            $this->logger->info(
                sprintf("Adjusting timers based on highest item timestamp: %f", $last)
            );
        }

        if (isset($last) && $last > 0) {
            $delta = (new DateTime('now'))->format('U') - $last;
            $this->logger->info(sprintf("Adjusting by %.2f s", $delta));

            $this->getTimerAdjustmentService()->increase(
                $testSession,
                (int) $delta,
                TimerAdjustmentServiceInterface::TYPE_TIME_ADJUSTMENT,
                $this->getAdjustmentPlace($testSession)
            );

            $testSession->suspend();
            $this->getTestSessionService()->persist($testSession);
        }
    }

    private function getAdjustmentPlace(TestSession $testSession): ?QtiIdentifiable
    {
        $test = $testSession->getAssessmentTest();
        $testPart = $testSession->getCurrentTestPart();
        $section = $testSession->getCurrentAssessmentSection();
        $itemRef = $testSession->getCurrentAssessmentItemRef();

        if ($itemRef && $itemRef->hasTimeLimits()) {
            $this->logger->info('Adjusting at the item level');

            return $itemRef;
        }

        if ($testPart && $testPart->hasTimeLimits()) {
            $this->logger->info('Adjusting at the test part level');

            return $testPart;
        }

        if ($section && $section->hasTimeLimits()) {
            $this->logger->info('Adjusting at the section level');

            return $section;
        }

        if ($test && $test->hasTimeLimits()) {
            $this->logger->info('Adjusting at the test level');

            return $section;
        }

        $this->logger->info('Adjusting at the test session level');

        return null;
    }

    private function getHighestItemTimestamp(TestSession $testSession, QtiTimer $timer): ?float
    {
        $timestamps = [];

        foreach ($testSession->getRoute()->getAllRouteItems() as $item) {
            /* @var $item RouteItem */
            $timestamp = $timer->getLastTimestamp(
                $testSession->getItemTags($item)
            );

            if($timestamp > 0) {
                $timestamps[] = $timestamp;
            }
        }

        if (empty($timestamps)) {
            return null;
        }

        return max($timestamps);
    }

    private function getDeliveryIdByExecutionId(string $executionId): ?string
    {
        $executionClass = $this->ontology->getClass(DeliveryExecutionInterface::CLASS_URI);
        $deliveryProperty = $this->ontology->getProperty(DeliveryExecutionInterface::PROPERTY_DELIVERY);

        $executionInstance = $executionClass->getResource($executionId);
        $deliveryUri = $executionInstance->getUniquePropertyValue($deliveryProperty);

        if ($deliveryUri instanceof core_kernel_classes_Resource) {
            $deliveryUri = $deliveryUri->getUri();
        }

        if ($deliveryUri) {
            return (string)$deliveryUri;
        }

        return null;
    }

    /**
     * @return string[]
     */
    private function getExecutionIdsForOtherDeliveries(string $userUri, string $currentExecutionId): array
    {
        $currentDeliveryUri = (string)$this->getDeliveryIdByExecutionId($currentExecutionId);
        $executions = $this->getActiveDeliveryExecutionsByUser($userUri);

        $this->logger->debug(
            sprintf(
                '%s: userUri=%s currentExecutionId=%s currentDeliveryUri=%s',
                __FUNCTION__,
                $userUri,
                $currentExecutionId,
                $currentDeliveryUri
            )
        );

        $executionIdsForOtherDeliveries = [];

        foreach ($executions as $execution) {
            if (
                $execution->getIdentifier() !== $currentExecutionId
                && $execution->getDelivery()->getUri() !== $currentDeliveryUri
            ) {
                $executionIdsForOtherDeliveries[] = $execution->getIdentifier();

                $this->logger->debug(
                    sprintf(
                        '%s: execution %s belongs to other delivery "%s" != "%s"',
                        __FUNCTION__,
                        $execution->getIdentifier(),
                        $execution->getDelivery()->getUri(),
                        $currentDeliveryUri
                    )
                );
            }
        }

        return $executionIdsForOtherDeliveries;
    }

    /**
     * @return DeliveryExecutionInterface[]
     */
    private function getActiveDeliveryExecutionsByUser(string $userUri): array
    {
        $executionClass = $this->ontology->getClass(DeliveryExecutionInterface::CLASS_URI);
        $executionInstances = $executionClass->searchInstances([
            DeliveryExecutionInterface::PROPERTY_SUBJECT => $userUri,
            DeliveryExecutionInterface::PROPERTY_STATUS => DeliveryExecutionInterface::STATE_ACTIVE,
        ], [
            'like' => false
        ]);

        $executions = [];

        foreach ($executionInstances as $executionInstance) {
            $executions[] = $this->deliveryExecutionService->getDeliveryExecution(
                $executionInstance->getUri()
            );
        }

        return $executions;
    }

    private function pauseSingleExecution(DeliveryExecution $execution, float $timestamp): void
    {
        $executionId = $execution->getIdentifier();

        if ($execution->getState()->getUri() !== DeliveryExecutionInterface::STATE_ACTIVE) {
            $this->logger->debug(sprintf('%s is not active, not pausing', $executionId));

            return;
        }

        $this->logger->info(sprintf('Pausing execution %s', $executionId));

        $this->setConcurringSession($executionId);

        $context = $this->getContextByDeliveryExecution($execution);
        $this->qtiRunnerService->endTimer($context);
        $this->qtiRunnerService->pause($context);

        $this->pauseTimers($execution, $timestamp);

        $this->currentSession->setAttribute("pausedAt-{$executionId}", $timestamp);
    }

    private function pauseTimers(DeliveryExecution $execution, float $timestamp): void
    {
        $assessmentTestSession = $this->getTestSessionService()->getTestSession($execution);

        if (!$assessmentTestSession instanceof TestSession) {
            $this->logger->warning(
                sprintf(
                    'Test session for %s is not a TestSession instance (%s)',
                    $execution->getIdentifier(),
                    get_class($assessmentTestSession)
                )
            );

            return;
        }

        $tags = $assessmentTestSession->getItemTags(
            $assessmentTestSession->getRoute()->current()
        );

        $assessmentTestSession->getTimer()->end($tags, $timestamp)->save();
        $this->logger->debug(
            sprintf('Pushed the current time on test suspension: %f', $timestamp)
        );
    }

    private function getContextByDeliveryExecution(DeliveryExecutionInterface $execution): QtiRunnerServiceContext
    {
        $delivery = $execution->getDelivery();
        $container = $this->runtimeService->getDeliveryContainer($delivery->getUri());

        if (!$container instanceof QtiTestDeliveryContainer) {
            throw new common_Exception(
                sprintf(
                    'Non QTI test container %s in qti test runner',
                    get_class($container)
                )
            );
        }

        $testDefinition = $container->getSourceTest($execution);
        $testCompilation = sprintf(
            '%s|%s',
            $container->getPrivateDirId($execution),
            $container->getPublicDirId($execution)
        );

        return $this->qtiRunnerService->getServiceContext(
            $testDefinition,
            $testCompilation,
            $execution->getOriginalIdentifier()
        );
    }

    private function getQtiTimerFactory(): QtiTimerFactory
    {
        /** @noinspection PhpIncompatibleReturnTypeInspection */
        return $this->getServiceManager()->get(QtiTimerFactory::SERVICE_ID);
    }

    private function getTimerAdjustmentService(): TimerAdjustmentService
    {
        /** @noinspection PhpIncompatibleReturnTypeInspection */
        return $this->getServiceManager()->get(TimerAdjustmentService::SERVICE_ID);
    }

    private function getTestSessionService(): TestSessionService
    {
        /** @noinspection PhpIncompatibleReturnTypeInspection */
        return $this->getServiceManager()->get(TestSessionService::SERVICE_ID);
    }

    private function getServiceManager()
    {
        return ServiceManager::getServiceManager();
    }
}
