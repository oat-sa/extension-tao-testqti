<?php

declare(strict_types=1);

namespace oat\taoQtiTest\test\unit\models\classes\runner;

use oat\generis\test\TestCase;
use oat\oatbox\event\EventManager;
use oat\taoQtiTest\models\runner\QtiRunnerService;
use oat\taoQtiTest\models\runner\QtiRunnerServiceContext;
use oat\taoQtiTest\models\runner\session\TestSession;
use Psr\Log\LoggerInterface;
use qtism\runtime\tests\AssessmentItemSession;
use qtism\runtime\tests\AssessmentItemSessionState;
use qtism\runtime\tests\AssessmentTestSessionException;

class QtiRunnerServiceContinueInteractionTest extends TestCase
{
    private function invokeContinueInteraction(QtiRunnerService $service, QtiRunnerServiceContext $context): bool
    {
        $method = new \ReflectionMethod(QtiRunnerService::class, 'continueInteraction');
        $method->setAccessible(true);

        return $method->invoke($service, $context);
    }

    private function createService(array $onlyMethods = ['onTimeout', 'finish']): QtiRunnerService
    {
        $service = $this->getMockBuilder(QtiRunnerService::class)
            ->onlyMethods($onlyMethods)
            ->getMock();

        $service->setLogger($this->createMock(LoggerInterface::class));

        return $service;
    }

    public function testContinueInteractionBeginsInteractionWhenRunningAndNotTimedOut(): void
    {
        $itemSession = $this->createMock(AssessmentItemSession::class);
        $itemSession->method('getState')->willReturn(AssessmentItemSessionState::INTERACTING);
        $itemSession->method('getRemainingAttempts')->willReturn(0);

        $session = $this->createMock(TestSession::class);
        $session->method('isRunning')->willReturn(true);
        $session->method('isTimeout')->willReturn(false);
        $session->method('getCurrentAssessmentItemSession')->willReturn($itemSession);

        $context = $this->createMock(QtiRunnerServiceContext::class);
        $context->method('getTestSession')->willReturn($session);

        $eventManager = $this->createMock(EventManager::class);
        $eventManager->expects($this->once())->method('trigger');

        $service = $this->createService(['finish', 'onTimeout']);
        $service->setServiceLocator($this->getServiceLocatorMock([
            EventManager::SERVICE_ID => $eventManager,
        ]));
        $service->expects($this->never())->method('finish');
        $service->expects($this->never())->method('onTimeout');

        $this->assertTrue($this->invokeContinueInteraction($service, $context));
    }

    public function testContinueInteractionInvokesOnTimeoutWhenRunningAndTimedOut(): void
    {
        $timeoutException = new AssessmentTestSessionException(
            'Maximum duration of testPart timedPart not respected.',
            AssessmentTestSessionException::TEST_PART_DURATION_OVERFLOW
        );

        $session = $this->createMock(TestSession::class);
        $session->method('isRunning')->willReturn(true);
        $session->method('isTimeout')->willReturn(true);
        $session->expects($this->once())
            ->method('checkTimeLimits')
            ->with(false, true, false)
            ->willThrowException($timeoutException);

        $context = $this->createMock(QtiRunnerServiceContext::class);
        $context->method('getTestSession')->willReturn($session);

        $service = $this->createService();
        $service->expects($this->once())
            ->method('onTimeout')
            ->with($context, $timeoutException);
        $service->expects($this->never())->method('finish');

        $this->assertFalse($this->invokeContinueInteraction($service, $context));
    }

    public function testContinueInteractionFinishesWhenSessionIsNotRunning(): void
    {
        $session = $this->createMock(TestSession::class);
        $session->method('isRunning')->willReturn(false);

        $context = $this->createMock(QtiRunnerServiceContext::class);
        $context->method('getTestSession')->willReturn($session);

        $service = $this->createService();
        $service->expects($this->once())->method('finish')->with($context);
        $service->expects($this->never())->method('onTimeout');

        $this->assertFalse($this->invokeContinueInteraction($service, $context));
    }

    public function testContinueInteractionDoesNotFinishOnTimeoutBoundaryNavigation(): void
    {
        $timeoutException = new AssessmentTestSessionException(
            'Maximum duration of assessmentSection timedSection not respected.',
            AssessmentTestSessionException::ASSESSMENT_SECTION_DURATION_OVERFLOW
        );

        $session = $this->createMock(TestSession::class);
        $session->method('isRunning')->willReturn(true);
        $session->method('isTimeout')->willReturn(true);
        $session->method('checkTimeLimits')
            ->with(false, true, false)
            ->willThrowException($timeoutException);

        $context = $this->createMock(QtiRunnerServiceContext::class);
        $context->method('getTestSession')->willReturn($session);

        $service = $this->createService();
        $service->expects($this->once())->method('onTimeout');
        $service->expects($this->never())->method('finish');

        $this->invokeContinueInteraction($service, $context);
    }

    public function testContinueInteractionRepeatedTimeoutHandlingIsIdempotentAtBranchLevel(): void
    {
        $timeoutException = new AssessmentTestSessionException(
            'Maximum duration of testPart timedPart not respected.',
            AssessmentTestSessionException::TEST_PART_DURATION_OVERFLOW
        );

        $session = $this->createMock(TestSession::class);
        $session->method('isRunning')->willReturn(true);
        $session->method('isTimeout')->willReturn(true);
        $session->method('checkTimeLimits')
            ->with(false, true, false)
            ->willThrowException($timeoutException);

        $context = $this->createMock(QtiRunnerServiceContext::class);
        $context->method('getTestSession')->willReturn($session);

        $service = $this->createService();
        $service->expects($this->exactly(2))
            ->method('onTimeout')
            ->with($context, $timeoutException);
        $service->expects($this->never())->method('finish');

        $this->assertFalse($this->invokeContinueInteraction($service, $context));
        $this->assertFalse($this->invokeContinueInteraction($service, $context));
    }

    public function testContinueInteractionHandlesTestLevelTimeout(): void
    {
        $timeoutException = new AssessmentTestSessionException(
            'Maximum duration of assessmentTest timedTest not respected.',
            AssessmentTestSessionException::ASSESSMENT_TEST_DURATION_OVERFLOW
        );

        $session = $this->createMock(TestSession::class);
        $session->method('isRunning')->willReturn(true);
        $session->method('isTimeout')->willReturn(true);
        $session->method('checkTimeLimits')
            ->with(false, true, false)
            ->willThrowException($timeoutException);

        $context = $this->createMock(QtiRunnerServiceContext::class);
        $context->method('getTestSession')->willReturn($session);

        $service = $this->createService();
        $service->expects($this->once())
            ->method('onTimeout')
            ->with($context, $timeoutException);
        $service->expects($this->never())->method('finish');

        $this->assertFalse($this->invokeContinueInteraction($service, $context));
    }

    public function testOnTimeoutMovesToNextTestPartForLinearTestPartOverflow(): void
    {
        $timeoutException = new AssessmentTestSessionException(
            'Maximum duration of testPart timedPart not respected.',
            AssessmentTestSessionException::TEST_PART_DURATION_OVERFLOW
        );

        $session = $this->createMock(TestSession::class);
        $session->method('getCurrentNavigationMode')->willReturn(\qtism\data\NavigationMode::LINEAR);
        $session->expects($this->once())->method('moveNextTestPart');
        $session->expects($this->never())->method('moveThroughAndEndTestSession');

        $context = $this->createMock(QtiRunnerServiceContext::class);
        $context->method('getTestSession')->willReturn($session);

        $eventManager = $this->createMock(EventManager::class);
        $eventManager->expects($this->exactly(2))->method('trigger');

        $service = $this->getMockBuilder(QtiRunnerService::class)
            ->onlyMethods(['continueInteraction'])
            ->getMock();
        $service->setLogger($this->createMock(LoggerInterface::class));
        $service->setServiceLocator($this->getServiceLocatorMock([
            EventManager::SERVICE_ID => $eventManager,
        ]));
        $service->expects($this->once())->method('continueInteraction')->with($context);

        $method = new \ReflectionMethod(QtiRunnerService::class, 'onTimeout');
        $method->setAccessible(true);
        $method->invoke($service, $context, $timeoutException);
    }

    public function testOnTimeoutEndsSessionForTestLevelOverflow(): void
    {
        $timeoutException = new AssessmentTestSessionException(
            'Maximum duration of assessmentTest timedTest not respected.',
            AssessmentTestSessionException::ASSESSMENT_TEST_DURATION_OVERFLOW
        );

        $session = $this->createMock(TestSession::class);
        $session->method('getCurrentNavigationMode')->willReturn(\qtism\data\NavigationMode::LINEAR);
        $session->expects($this->once())->method('moveThroughAndEndTestSession');
        $session->expects($this->never())->method('moveNextTestPart');

        $context = $this->createMock(QtiRunnerServiceContext::class);
        $context->method('getTestSession')->willReturn($session);

        $eventManager = $this->createMock(EventManager::class);
        $eventManager->expects($this->exactly(2))->method('trigger');

        $service = $this->getMockBuilder(QtiRunnerService::class)
            ->onlyMethods(['continueInteraction'])
            ->getMock();
        $service->setLogger($this->createMock(LoggerInterface::class));
        $service->setServiceLocator($this->getServiceLocatorMock([
            EventManager::SERVICE_ID => $eventManager,
        ]));
        $service->expects($this->once())->method('continueInteraction')->with($context);

        $method = new \ReflectionMethod(QtiRunnerService::class, 'onTimeout');
        $method->setAccessible(true);
        $method->invoke($service, $context, $timeoutException);
    }

    public function testContinueInteractionFinishesOnlyAfterSessionEnds(): void
    {
        $timeoutException = new AssessmentTestSessionException(
            'Maximum duration of assessmentTest timedTest not respected.',
            AssessmentTestSessionException::ASSESSMENT_TEST_DURATION_OVERFLOW
        );

        $runningSession = $this->createMock(TestSession::class);
        $runningSession->method('isRunning')->willReturn(true);
        $runningSession->method('isTimeout')->willReturn(true);
        $runningSession->method('getCurrentNavigationMode')->willReturn(\qtism\data\NavigationMode::LINEAR);
        $runningSession->method('checkTimeLimits')
            ->with(false, true, false)
            ->willThrowException($timeoutException);

        $closedSession = $this->createMock(TestSession::class);
        $closedSession->method('isRunning')->willReturn(false);

        $callCount = 0;
        $context = $this->createMock(QtiRunnerServiceContext::class);
        $context->method('getTestSession')
            ->willReturnCallback(static function () use ($runningSession, $closedSession, &$callCount) {
                return (++$callCount <= 2) ? $runningSession : $closedSession;
            });

        $eventManager = $this->createMock(EventManager::class);
        $eventManager->method('trigger');

        $service = $this->getMockBuilder(QtiRunnerService::class)
            ->onlyMethods(['finish'])
            ->getMock();
        $service->setLogger($this->createMock(LoggerInterface::class));
        $service->setServiceLocator($this->getServiceLocatorMock([
            EventManager::SERVICE_ID => $eventManager,
        ]));
        $runningSession->expects($this->once())->method('moveThroughAndEndTestSession');
        $service->expects($this->once())->method('finish')->with($context);

        $this->assertFalse($this->invokeContinueInteraction($service, $context));
    }
}
