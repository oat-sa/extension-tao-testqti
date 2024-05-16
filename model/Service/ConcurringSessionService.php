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
use oat\taoDelivery\model\execution\StateServiceInterface;
use oat\taoDelivery\model\RuntimeService;
use oat\taoQtiTest\models\container\QtiTestDeliveryContainer;
use oat\taoQtiTest\models\runner\QtiRunnerService;
use oat\taoQtiTest\models\runner\QtiRunnerServiceContext;
use oat\taoQtiTest\models\runner\time\TimerAdjustmentServiceInterface;
use oat\taoQtiTest\models\TestSessionService;
use PHPSession;
use Psr\Log\LoggerInterface;
use qtism\common\datatypes\QtiDuration;
use qtism\data\AssessmentItemRef;
use Throwable;

class ConcurringSessionService
{
    private const PAUSE_REASON_CONCURRENT_TEST = 'PAUSE_REASON_CONCURRENT_TEST';
    /**
     * @var string Controls whether a delivery execution state should be kept as is or reset each time it starts.
     *             `false` – the state will be reset on each restart.
     *             `true` – the state will be maintained upon a restart.
     *
     * phpcs:disable Generic.Files.LineLength
     */
    private const FEATURE_FLAG_MAINTAIN_RESTARTED_DELIVERY_EXECUTION_STATE = 'FEATURE_FLAG_MAINTAIN_RESTARTED_DELIVERY_EXECUTION_STATE';
    private LoggerInterface $logger;
    private QtiRunnerService $qtiRunnerService;
    private RuntimeService $runtimeService;
    private DeliveryExecutionService $deliveryExecutionService;
    private FeatureFlagCheckerInterface $featureFlagChecker;
    private StateServiceInterface $stateService;
    private ?PHPSession $currentSession;
    private ?TestSessionService $testSessionService;
    private ?TimerAdjustmentServiceInterface $timerAdjustmentService;

    public function __construct(
        LoggerInterface $logger,
        QtiRunnerService $qtiRunnerService,
        RuntimeService $runtimeService,
        DeliveryExecutionService $deliveryExecutionService,
        FeatureFlagCheckerInterface $featureFlagChecker,
        StateServiceInterface $stateService,
        PHPSession $currentSession = null,
        TestSessionService $testSessionService = null,
        TimerAdjustmentServiceInterface $timerAdjustmentService = null
    ) {
        $this->logger = $logger;
        $this->qtiRunnerService = $qtiRunnerService;
        $this->runtimeService = $runtimeService;
        $this->deliveryExecutionService = $deliveryExecutionService;
        $this->featureFlagChecker = $featureFlagChecker;
        $this->stateService = $stateService;
        $this->currentSession = $currentSession ?? PHPSession::singleton();
        $this->testSessionService = $testSessionService;
        $this->timerAdjustmentService = $timerAdjustmentService;
    }

    public function pauseActiveDeliveryExecutionsForUser($activeExecution): void
    {
        if ($activeExecution instanceof DeliveryExecution) {
            $this->pauseConcurrentSessions($activeExecution);

            if ($activeExecution->getState()->getUri() === DeliveryExecution::STATE_PAUSED) {
                $this->adjustTimers($activeExecution);
            }

            $this->clearConcurringSession($activeExecution);
            $this->resetDeliveryExecutionState($activeExecution);
        }
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

        if ($testSession && $testSession->getCurrentAssessmentItemRef()) {
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

            $ids = array_unique([
                $execution->getIdentifier(),
                $execution->getOriginalIdentifier()
            ]);

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

                    $this->getTimerAdjustmentService()->increase(
                        $testSession,
                        $delta,
                        TimerAdjustmentServiceInterface::TYPE_TIME_ADJUSTMENT
                    );

                    $testSession->suspend();
                    $this->getTestSessionService()->persist($testSession);
                }
            }
        }
    }

    private function resetDeliveryExecutionState(DeliveryExecution $activeExecution = null): void
    {
        if (
            null === $activeExecution
            || !$this->isDeliveryExecutionStateResetEnabled()
            || $activeExecution->getState()->getUri() === DeliveryExecution::STATE_PAUSED
        ) {
            return;
        }

        $this->stateService->pause($activeExecution);
    }

    private function isDeliveryExecutionStateResetEnabled(): bool
    {
        return !$this->featureFlagChecker->isEnabled(
            static::FEATURE_FLAG_MAINTAIN_RESTARTED_DELIVERY_EXECUTION_STATE
        );
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

    private function getTimerAdjustmentService(): TimerAdjustmentServiceInterface
    {
        if (!$this->timerAdjustmentService instanceof TimerAdjustmentServiceInterface) {
            /** @noinspection PhpFieldAssignmentTypeMismatchInspection */
            $this->timerAdjustmentService = ServiceManager::getServiceManager()->get(
                TimerAdjustmentServiceInterface::SERVICE_ID
            );
        }

        return $this->timerAdjustmentService;
    }

    private function getTestSessionService(): TestSessionService
    {
        if (!$this->testSessionService instanceof TestSessionService) {
            /** @noinspection PhpFieldAssignmentTypeMismatchInspection */
            $this->testSessionService = ServiceManager::getServiceManager()->get(
                TestSessionService::SERVICE_ID
            );
        }

        return $this->testSessionService;
    }
}
