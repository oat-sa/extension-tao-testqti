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
use oat\oatbox\service\ServiceManager;
use oat\tao\model\featureFlag\FeatureFlagCheckerInterface;
use oat\taoDelivery\model\execution\DeliveryExecution;
use oat\taoDelivery\model\execution\DeliveryExecutionInterface;
use oat\taoDelivery\model\execution\DeliveryExecutionService;
use oat\taoDelivery\model\RuntimeService;
use oat\taoQtiTest\models\container\QtiTestDeliveryContainer;
use oat\taoQtiTest\models\runner\QtiRunnerService;
use oat\taoQtiTest\models\runner\QtiRunnerServiceContext;
use oat\taoQtiTest\models\runner\time\TimerAdjustmentService;
use oat\taoQtiTest\models\TestSessionService;
use PHPSession;
use Psr\Log\LoggerInterface;
use qtism\common\datatypes\QtiDuration;
use qtism\data\AssessmentItemRef;
use Throwable;

class ConcurringSessionService
{
    private const PAUSE_REASON_CONCURRENT_TEST = 'PAUSE_REASON_CONCURRENT_TEST';

    private LoggerInterface $logger;
    private QtiRunnerService $qtiRunnerService;
    private RuntimeService $runtimeService;
    private DeliveryExecutionService $deliveryExecutionService;
    private FeatureFlagCheckerInterface $featureFlagChecker;
    private ?PHPSession $currentSession;

    public function __construct(
        LoggerInterface $logger,
        QtiRunnerService $qtiRunnerService,
        RuntimeService $runtimeService,
        DeliveryExecutionService $deliveryExecutionService,
        FeatureFlagCheckerInterface $featureFlagChecker,
        PHPSession $currentSession = null
    ) {
        $this->logger = $logger;
        $this->qtiRunnerService = $qtiRunnerService;
        $this->runtimeService = $runtimeService;
        $this->deliveryExecutionService = $deliveryExecutionService;
        $this->featureFlagChecker = $featureFlagChecker;
        $this->currentSession = $currentSession ?? PHPSession::singleton();
    }

    public function pauseConcurrentSessions(DeliveryExecution $activeExecution): void
    {
        if (!$this->featureFlagChecker->isEnabled('FEATURE_FLAG_PAUSE_CONCURRENT_SESSIONS')) {
            return;
        }

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
            $executionId = $execution->getOriginalIdentifier();

            if ($executionId !== $activeExecution->getOriginalIdentifier()) {
                try {
                    $this->setConcurringSession($executionId);

                    $context = $this->getContextByDeliveryExecution($execution);

                    $this->storeItemDuration($context, $executionId);
                    $this->qtiRunnerService->endTimer($context);
                    $this->qtiRunnerService->pause($context);
                } catch (Throwable $e) {
                    $this->logger->warning(
                        sprintf(
                            '%s: Unable to pause delivery execution %s: %s',
                            self::class,
                            $executionId,
                            $e->getMessage()
                        )
                    );
                }
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
        $this->logger->debug(
            sprintf(
                'Adjusting timers on execution %s restart',
                $execution->getIdentifier()
            )
        );

        $testSession = $this->getTestSessionService()->getTestSession($execution);

        if ($testSession->getCurrentAssessmentItemRef()) {
            $duration = $testSession->getTimerDuration(
                $testSession->getCurrentAssessmentItemRef()->getIdentifier(),
                $testSession->getTimerTarget()
            );

            $this->logger->debug(
                sprintf(
                    'Timer duration on execution %s timer adjustment = %f',
                    $execution->getIdentifier(),
                    $duration->getSeconds(true)
                )
            );

            $ids = [
                $execution->getIdentifier(),
                $execution->getOriginalIdentifier()
            ];

            foreach ($ids as $executionId) {
                $key = "itemDuration-{$executionId}";

                if (!$this->currentSession->hasAttribute($key)) {
                    continue;
                }

                $oldDuration = $this->currentSession->getAttribute($key);
                $this->currentSession->removeAttribute($key);

                $this->logger->debug(
                    sprintf(
                        'Timer duration on execution %s pause was %f',
                        $execution->getIdentifier(),
                        $oldDuration
                    )
                );

                $delta = (int) ceil($duration->getSeconds(true) - $oldDuration);

                if ($delta > 0) {
                    $this->logger->debug(sprintf('Adjusting timers by %d s', $delta));

                    $this->getTimerAdjustmentService()->increase($testSession, $delta);

                    $testSession->suspend();
                    $this->getTestSessionService()->persist($testSession);
                }
            }
        }
    }

    private function storeItemDuration(
        QtiRunnerServiceContext $context,
        string $executionId
    ): void {
        $testSession = $context->getTestSession();
        $itemRef = $testSession->getCurrentAssessmentItemRef();

        if ($itemRef instanceof AssessmentItemRef) {
            /** @var QtiDuration $duration */
            $duration = $context->getTestSession()->getTimerDuration(
                $itemRef->getIdentifier(),
                $testSession->getTimerTarget()
            );

            $this->logger->debug(
                sprintf(
                    'duration when execution %s was paused = %f',
                    $executionId,
                    $duration->getSeconds(true)
                )
            );

            $this->currentSession->setAttribute(
                "itemDuration-{$executionId}",
                $duration->getSeconds(true)
            );
        }
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

        $sessionId = $execution->getIdentifier();
        $testDefinitionUri = $container->getSourceTest($execution);
        $testCompilation = sprintf(
            '%s|%s',
            $container->getPrivateDirId($execution),
            $container->getPublicDirId($execution)
        );

        return $this->qtiRunnerService->getServiceContext(
            $testDefinitionUri,
            $testCompilation,
            $sessionId,
            $execution->getUserIdentifier()
        );
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
