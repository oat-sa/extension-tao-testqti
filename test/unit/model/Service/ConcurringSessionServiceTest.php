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
 * Copyright (c) 2023-2024 (original work) Open Assessment Technologies SA.
 */

declare(strict_types=1);

namespace oat\taoQtiTest\test\unit\model\Service;

use core_kernel_classes_Resource;
use oat\tao\model\featureFlag\FeatureFlagCheckerInterface;
use oat\taoDelivery\model\execution\DeliveryExecution;
use oat\taoDelivery\model\execution\DeliveryExecutionService;
use oat\taoDelivery\model\execution\StateServiceInterface;
use oat\taoDelivery\model\RuntimeService;
use oat\taoQtiTest\model\Service\ConcurringSessionService;
use oat\taoQtiTest\models\container\QtiTestDeliveryContainer;
use oat\taoQtiTest\models\runner\QtiRunnerService;
use oat\taoQtiTest\models\runner\QtiRunnerServiceContext;
use oat\taoQtiTest\models\runner\session\TestSession;
use oat\taoQtiTest\models\runner\time\TimerAdjustmentServiceInterface;
use oat\taoQtiTest\models\TestSessionService;
use oat\taoTests\models\runner\time\TimePoint;
use PHPSession;
use PHPUnit\Framework\TestCase;
use Psr\Log\LoggerInterface;
use qtism\common\datatypes\QtiDuration;
use qtism\data\AssessmentItemRef;

class ConcurringSessionServiceTest extends TestCase
{
    private QtiRunnerService $qtiRunnerService;
    private RuntimeService $runtimeService;
    private DeliveryExecutionService $deliveryExecutionService;
    private FeatureFlagCheckerInterface $featureFlagChecker;
    private PHPSession $currentSession;
    private ConcurringSessionService $subject;
    private StateServiceInterface $stateService;
    private TestSessionService $testSessionService;
    private TimerAdjustmentServiceInterface $timerAdjustmentService;

    protected function setUp(): void
    {
        $this->qtiRunnerService = $this->createMock(QtiRunnerService::class);
        $this->runtimeService = $this->createMock(RuntimeService::class);
        $this->deliveryExecutionService = $this->createMock(DeliveryExecutionService::class);
        $this->featureFlagChecker = $this->createMock(FeatureFlagCheckerInterface::class);
        $this->currentSession = $this->createMock(PHPSession::class);
        $this->stateService = $this->createMock(StateServiceInterface::class);
        $this->testSessionService = $this->createMock(TestSessionService::class);
        $this->timerAdjustmentService = $this->createMock(TimerAdjustmentServiceInterface::class);

        $this->subject = new ConcurringSessionService(
            $this->createMock(LoggerInterface::class),
            $this->qtiRunnerService,
            $this->runtimeService,
            $this->deliveryExecutionService,
            $this->featureFlagChecker,
            $this->stateService,
            $this->currentSession,
            $this->testSessionService,
            $this->timerAdjustmentService
        );
    }

    public function testDoesNothingIfTheFeatureFlagIsDisabled(): void
    {
        $this->featureFlagChecker
            ->expects($this->once())
            ->method('isEnabled')
            ->with('FEATURE_FLAG_PAUSE_CONCURRENT_SESSIONS')
            ->willReturn(false);

        $this->qtiRunnerService
            ->expects($this->never())
            ->method('endTimer');
        $this->qtiRunnerService
            ->expects($this->never())
            ->method('pause');

        $execution = $this->createMock(DeliveryExecution::class);
        $execution
            ->expects($this->never())
            ->method('getUserIdentifier');

        $this->subject->pauseConcurrentSessions($execution);
    }

    /**
     * @dataProvider doesNothingIfTheExecutionIsForAnAnonymousUserDataProvider
     */
    public function testDoesNothingIfTheExecutionIsForAnAnonymousUser(?string $userId): void
    {
        $this->featureFlagChecker
            ->expects($this->once())
            ->method('isEnabled')
            ->with('FEATURE_FLAG_PAUSE_CONCURRENT_SESSIONS')
            ->willReturn(true);

        $this->qtiRunnerService
            ->expects($this->never())
            ->method('endTimer');
        $this->qtiRunnerService
            ->expects($this->never())
            ->method('pause');

        $execution = $this->createMock(DeliveryExecution::class);
        $execution
            ->expects($this->once())
            ->method('getUserIdentifier')
            ->willReturn($userId);

        $this->subject->pauseConcurrentSessions($execution);
    }

    public function doesNothingIfTheExecutionIsForAnAnonymousUserDataProvider(): array
    {
        return [
            'Null user identifier' => [null],
            'Empty user identifier' => [''],
            'User identifier provided as "anonymous"' => ['anonymous'],
        ];
    }

    public function testPausesExecutionsForOtherDeliveries(): void
    {
        $this->featureFlagChecker
            ->expects($this->once())
            ->method('isEnabled')
            ->with('FEATURE_FLAG_PAUSE_CONCURRENT_SESSIONS')
            ->willReturn(true);

        $otherDeliveryResource = $this->createMock(core_kernel_classes_Resource::class);
        $executionDomainObject = $this->createMock(DeliveryExecution::class);
        $otherExecutionDomainObject = $this->createMock(DeliveryExecution::class);

        $executionDomainObject
            ->expects($this->atLeastOnce())
            ->method('getOriginalIdentifier')
            ->willReturn('https://example.com/execution/1');

        $otherExecutionDomainObject
            ->expects($this->atLeastOnce())
            ->method('getDelivery')
            ->willReturn($otherDeliveryResource);
        $otherExecutionDomainObject
            ->expects($this->atLeastOnce())
            ->method('getOriginalIdentifier')
            ->willReturn('https://example.com/execution/2');
        $otherExecutionDomainObject
            ->expects($this->atLeastOnce())
            ->method('getIdentifier')
            ->willReturn('https://example.com/execution/2');

        $this->deliveryExecutionService
            ->expects($this->atLeastOnce())
            ->method('getDeliveryExecutionsByStatus')
            ->willReturn([$executionDomainObject, $otherExecutionDomainObject]);

        $otherDeliveryResource
            ->expects($this->once())
            ->method('getUri')
            ->willReturn('https://example.com/delivery/2');

        $execution = $this->createMock(DeliveryExecution::class);
        $execution
            ->expects($this->atLeastOnce())
            ->method('getOriginalIdentifier')
            ->willReturn('https://example.com/execution/1');
        $execution
            ->expects($this->atLeastOnce())
            ->method('getUserIdentifier')
            ->willReturn('https://example.com/user/1');

        $qtiTestDeliveryContainer = $this->createMock(QtiTestDeliveryContainer::class);
        $qtiTestDeliveryContainer
            ->expects($this->once())
            ->method('getPrivateDirId')
            ->with($execution)
            ->willReturn('privateDirId');
        $qtiTestDeliveryContainer
            ->expects($this->once())
            ->method('getPublicDirId')
            ->with($execution)
            ->willReturn('publicDirId');
        $qtiTestDeliveryContainer
            ->expects($this->once())
            ->method('getSourceTest')
            ->with($execution)
            ->willReturn('http://example.com/sourceTest/1');

        $this->runtimeService
            ->expects($this->once())
            ->method('getDeliveryContainer')
            ->with('https://example.com/delivery/2')
            ->willReturn($qtiTestDeliveryContainer);

        $itemRef = $this->createMock(AssessmentItemRef::class);
        $itemRef
            ->expects($this->once())
            ->method('getIdentifier')
            ->willReturn('itemRef');

        $duration = $this->createMock(QtiDuration::class);
        $duration
            ->expects($this->exactly(2))
            ->method('getSeconds')
            ->with(true)
            ->willReturn(123);

        $testSession = $this->createMock(TestSession::class);
        $testSession
            ->expects($this->once())
            ->method('getCurrentAssessmentItemRef')
            ->willReturn($itemRef);
        $testSession
            ->expects($this->once())
            ->method('getTimerTarget')
            ->willReturn(TimePoint::TARGET_SERVER);
        $testSession
            ->expects($this->once())
            ->method('getTimerDuration')
            ->with('itemRef', TimePoint::TARGET_SERVER)
            ->willReturn($duration);

        $context = $this->createMock(QtiRunnerServiceContext::class);
        $context
            ->expects($this->exactly(2))
            ->method('getTestSession')
            ->willReturn($testSession);

        $this->qtiRunnerService
            ->expects($this->once())
            ->method('getServiceContext')
            ->with(
                'http://example.com/sourceTest/1',
                'privateDirId|publicDirId',
                'https://example.com/execution/2'
            )->willReturn($context);

        $this->currentSession
            ->expects($this->exactly(2))
            ->method('setAttribute')
            ->withConsecutive(
                [
                    'pauseReason-https://example.com/execution/2',
                    'PAUSE_REASON_CONCURRENT_TEST'
                ],
                [
                    'itemDuration-https://example.com/execution/2',
                    123
                ]
            )->willReturn(null);

        $this->qtiRunnerService
            ->expects($this->once())
            ->method('endTimer')
            ->with($context);
        $this->qtiRunnerService
            ->expects($this->once())
            ->method('pause')
            ->with($context);

        $this->subject->pauseConcurrentSessions($execution);
    }

    public function testPauseActiveDeliveryExecutionsForUser(): void
    {
        $this->featureFlagChecker
            ->method('isEnabled')
            ->withConsecutive(
                ['FEATURE_FLAG_PAUSE_CONCURRENT_SESSIONS'],
                ['FEATURE_FLAG_MAINTAIN_RESTARTED_DELIVERY_EXECUTION_STATE']
            )
            ->willReturn(true);

        $otherDeliveryResource = $this->createMock(core_kernel_classes_Resource::class);
        $executionDomainObject = $this->createMock(DeliveryExecution::class);
        $otherExecutionDomainObject = $this->createMock(DeliveryExecution::class);

        $executionDomainObject
            ->expects($this->atLeastOnce())
            ->method('getOriginalIdentifier')
            ->willReturn('https://example.com/execution/1');

        $otherExecutionDomainObject
            ->expects($this->atLeastOnce())
            ->method('getDelivery')
            ->willReturn($otherDeliveryResource);
        $otherExecutionDomainObject
            ->expects($this->atLeastOnce())
            ->method('getOriginalIdentifier')
            ->willReturn('https://example.com/execution/2');
        $otherExecutionDomainObject
            ->expects($this->atLeastOnce())
            ->method('getIdentifier')
            ->willReturn('https://example.com/execution/2');

        $this->deliveryExecutionService
            ->expects($this->atLeastOnce())
            ->method('getDeliveryExecutionsByStatus')
            ->willReturn([$executionDomainObject, $otherExecutionDomainObject]);

        $otherDeliveryResource
            ->expects($this->once())
            ->method('getUri')
            ->willReturn('https://example.com/delivery/2');

        $executionState = $this->createMock(core_kernel_classes_Resource::class);
        $executionState
            ->method('getUri')
            ->willReturn(DeliveryExecution::STATE_ACTIVE);

        $execution = $this->createMock(DeliveryExecution::class);
        $execution
            ->expects($this->atLeastOnce())
            ->method('getOriginalIdentifier')
            ->willReturn('https://example.com/execution/1');
        $execution
            ->expects($this->atLeastOnce())
            ->method('getUserIdentifier')
            ->willReturn('https://example.com/user/1');
        $execution
            ->method('getState')
            ->willReturn($executionState);

        $qtiTestDeliveryContainer = $this->createMock(QtiTestDeliveryContainer::class);
        $qtiTestDeliveryContainer
            ->expects($this->once())
            ->method('getPrivateDirId')
            ->with($execution)
            ->willReturn('privateDirId');
        $qtiTestDeliveryContainer
            ->expects($this->once())
            ->method('getPublicDirId')
            ->with($execution)
            ->willReturn('publicDirId');
        $qtiTestDeliveryContainer
            ->expects($this->once())
            ->method('getSourceTest')
            ->with($execution)
            ->willReturn('http://example.com/sourceTest/1');

        $this->runtimeService
            ->expects($this->once())
            ->method('getDeliveryContainer')
            ->with('https://example.com/delivery/2')
            ->willReturn($qtiTestDeliveryContainer);

        $itemRef = $this->createMock(AssessmentItemRef::class);
        $itemRef
            ->expects($this->once())
            ->method('getIdentifier')
            ->willReturn('itemRef');

        $duration = $this->createMock(QtiDuration::class);
        $duration
            ->expects($this->exactly(2))
            ->method('getSeconds')
            ->with(true)
            ->willReturn(123);

        $testSession = $this->createMock(TestSession::class);
        $testSession
            ->expects($this->once())
            ->method('getCurrentAssessmentItemRef')
            ->willReturn($itemRef);
        $testSession
            ->expects($this->once())
            ->method('getTimerTarget')
            ->willReturn(TimePoint::TARGET_SERVER);
        $testSession
            ->expects($this->once())
            ->method('getTimerDuration')
            ->with('itemRef', TimePoint::TARGET_SERVER)
            ->willReturn($duration);

        $context = $this->createMock(QtiRunnerServiceContext::class);
        $context
            ->expects($this->exactly(2))
            ->method('getTestSession')
            ->willReturn($testSession);

        $this->qtiRunnerService
            ->expects($this->once())
            ->method('getServiceContext')
            ->with(
                'http://example.com/sourceTest/1',
                'privateDirId|publicDirId',
                'https://example.com/execution/2'
            )->willReturn($context);

        $this->currentSession
            ->expects($this->exactly(2))
            ->method('setAttribute')
            ->withConsecutive(
                [
                    'pauseReason-https://example.com/execution/2',
                    'PAUSE_REASON_CONCURRENT_TEST'
                ],
                [
                    'itemDuration-https://example.com/execution/2',
                    123
                ]
            )->willReturn(null);

        $this->qtiRunnerService
            ->expects($this->once())
            ->method('endTimer')
            ->with($context);
        $this->qtiRunnerService
            ->expects($this->once())
            ->method('pause')
            ->with($context);

        $this->subject->pauseActiveDeliveryExecutionsForUser($execution);
    }

    public function testAdjustTimersAddsAPositiveAdjustment(): void
    {
        $execution = $this->createMock(DeliveryExecution::class);
        $execution
            ->expects($this->atLeastOnce())
            ->method('getIdentifier')
            ->willReturn('https://example.com/execution/1');
        $execution
            ->expects($this->atLeastOnce())
            ->method('getOriginalIdentifier')
            ->willReturn('https://example.com/execution/1');

        $itemRef = $this->createMock(AssessmentItemRef::class);
        $itemRef
            ->expects($this->once())
            ->method('getIdentifier')
            ->willReturn('itemRef');

        $duration = $this->createMock(QtiDuration::class);
        $duration
            ->expects($this->atLeastOnce())
            ->method('getSeconds')
            ->with(true)
            ->willReturn(4);

        $testSession = $this->createMock(TestSession::class);
        $testSession
            ->expects($this->exactly(2))
            ->method('getCurrentAssessmentItemRef')
            ->willReturn($itemRef);
        $testSession
            ->expects($this->once())
            ->method('getTimerTarget')
            ->willReturn(TimePoint::TARGET_SERVER);
        $testSession
            ->expects($this->once())
            ->method('getTimerDuration')
            ->with('itemRef', TimePoint::TARGET_SERVER)
            ->willReturn($duration);

        $this->testSessionService
            ->expects($this->once())
            ->method('getTestSession')
            ->with($execution)
            ->willReturn($testSession);

        $this->currentSession
            ->expects($this->once())
            ->method('hasAttribute')
            ->with('itemDuration-https://example.com/execution/1')
            ->willReturn(true);

        $this->currentSession
            ->expects($this->once())
            ->method('getAttribute')
            ->with('itemDuration-https://example.com/execution/1')
            ->willReturn(1.5);

        $this->currentSession
            ->expects($this->once())
            ->method('removeAttribute')
            ->with('itemDuration-https://example.com/execution/1');

        $this->timerAdjustmentService
            ->expects($this->once())
            ->method('increase')
            ->with(
                $testSession,
                ceil(2.5),
                TimerAdjustmentServiceInterface::TYPE_TIME_ADJUSTMENT
            );

        $testSession
            ->expects($this->once())
            ->method('suspend');

        $this->testSessionService
            ->expects($this->once())
            ->method('persist')
            ->with($testSession);

        $this->subject->adjustTimers($execution);
    }

    public function testAdjustTimersSkipsAdjustmentIfNoTestSessionExists(): void
    {
        $execution = $this->createMock(DeliveryExecution::class);
        $execution
            ->method('getIdentifier')
            ->willReturn('https://example.com/execution/1');

        $this->testSessionService
            ->expects($this->once())
            ->method('getTestSession')
            ->with($execution)
            ->willReturn(null);

        $this->currentSession
            ->expects($this->never())
            ->method('removeAttribute');

        $this->timerAdjustmentService
            ->expects($this->never())
            ->method('increase');

        $this->testSessionService
            ->expects($this->never())
            ->method('persist');

        $this->subject->adjustTimers($execution);
    }
}
