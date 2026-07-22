<?php

declare(strict_types=1);

namespace oat\taoQtiTest\test\unit\models\classes\runner;

use oat\generis\test\TestCase;
use oat\ltiDeliveryProvider\model\events\LtiAgsListener;
use oat\ltiDeliveryProvider\model\execution\LtiContextRepositoryInterface;
use oat\oatbox\event\EventManager;
use oat\tao\model\taskQueue\QueueDispatcherInterface;
use oat\taoDelivery\model\execution\DeliveryExecution;
use oat\taoDelivery\model\execution\DeliveryExecutionInterface;
use oat\taoDelivery\model\execution\ServiceProxy as TaoDeliveryServiceProxy;
use oat\taoLti\models\classes\LtiLaunchData;
use oat\taoOutcomeRds\model\RdsResultStorage;
use oat\taoQtiTest\models\event\DeliveryExecutionFinish;
use oat\taoQtiTest\models\ExtendedStateService;
use oat\taoQtiTest\models\runner\QtiRunnerService;
use oat\taoQtiTest\models\runner\QtiRunnerServiceContext;
use oat\taoQtiTest\models\runner\session\TestSession;
use oat\taoResultServer\models\classes\implementation\ResultServerService;
use OAT\Library\Lti1p3Core\Message\Payload\Claim\AgsClaim;
use Psr\Log\LoggerInterface;
use qtism\data\NavigationMode;
use qtism\runtime\tests\AssessmentItemSession;
use qtism\runtime\tests\AssessmentItemSessionState;
use qtism\runtime\tests\AssessmentTestSessionException;
use tao_models_classes_Service;
use taoResultServer_models_classes_OutcomeVariable as OutcomeVariableModel;

class QtiRunnerServiceContinueInteractionTest extends TestCase
{
    private bool $serviceSingletonBackupTaken = false;

    private ?array $serviceSingletonBackup = null;

    protected function tearDown(): void
    {
        if ($this->serviceSingletonBackupTaken) {
            $property = new \ReflectionProperty(tao_models_classes_Service::class, 'instances');
            $property->setAccessible(true);
            $property->setValue(null, $this->serviceSingletonBackup);
            $this->serviceSingletonBackupTaken = false;
            $this->serviceSingletonBackup = null;
        }

        $sessionProperty = new \ReflectionProperty(\common_session_SessionManager::class, 'session');
        $sessionProperty->setAccessible(true);
        $sessionProperty->setValue(null, null);

        parent::tearDown();
    }
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

    private function createServiceWithRealOnTimeout(EventManager $eventManager): QtiRunnerService
    {
        $service = $this->getMockBuilder(QtiRunnerService::class)
            ->onlyMethods(['finish'])
            ->getMock();

        $service->setLogger($this->createMock(LoggerInterface::class));
        $service->setServiceLocator($this->getServiceLocatorMock([
            EventManager::SERVICE_ID => $eventManager,
        ]));
        $service->expects($this->never())->method('finish');

        return $service;
    }

    private function createSessionContinuingAfterTimeoutTransition(
        AssessmentTestSessionException $timeoutException,
        string $transitionMethod
    ): TestSession {
        $itemSession = $this->createMock(AssessmentItemSession::class);
        $itemSession->method('getState')->willReturn(AssessmentItemSessionState::INTERACTING);
        $itemSession->method('getRemainingAttempts')->willReturn(0);

        $session = $this->createMock(TestSession::class);
        $session->method('isRunning')->willReturn(true);
        // isTimeout() is evaluated in both the if and elseif guards on each entry.
        $session->method('isTimeout')->willReturnOnConsecutiveCalls(true, true, false);
        $session->method('checkTimeLimits')
            ->with(false, true, false)
            ->willThrowException($timeoutException);
        $session->method('getCurrentNavigationMode')->willReturn(NavigationMode::LINEAR);
        $session->method('getCurrentAssessmentItemSession')->willReturn($itemSession);
        $session->expects($this->once())->method($transitionMethod);

        return $session;
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

        $session = $this->createSessionContinuingAfterTimeoutTransition(
            $timeoutException,
            'moveNextTestPart'
        );

        $context = $this->createMock(QtiRunnerServiceContext::class);
        $context->method('getTestSession')->willReturn($session);

        $eventManager = $this->createMock(EventManager::class);
        $eventManager->expects($this->exactly(3))->method('trigger');

        $service = $this->createServiceWithRealOnTimeout($eventManager);

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

        $session = $this->createSessionContinuingAfterTimeoutTransition(
            $timeoutException,
            'moveNextAssessmentSection'
        );

        $context = $this->createMock(QtiRunnerServiceContext::class);
        $context->method('getTestSession')->willReturn($session);

        $eventManager = $this->createMock(EventManager::class);
        $eventManager->expects($this->exactly(3))->method('trigger');

        $service = $this->createServiceWithRealOnTimeout($eventManager);

        $this->assertFalse($this->invokeContinueInteraction($service, $context));
    }

    public function testContinueInteractionMovesToNextItemOnItemTimeoutWithoutFinish(): void
    {
        $timeoutException = new AssessmentTestSessionException(
            'Maximum duration of assessmentItem timedItem not respected.',
            AssessmentTestSessionException::ASSESSMENT_ITEM_DURATION_OVERFLOW
        );

        $session = $this->createSessionContinuingAfterTimeoutTransition(
            $timeoutException,
            'moveNextAssessmentItem'
        );

        $context = $this->createMock(QtiRunnerServiceContext::class);
        $context->method('getTestSession')->willReturn($session);

        $eventManager = $this->createMock(EventManager::class);
        $eventManager->expects($this->exactly(3))->method('trigger');

        $service = $this->createServiceWithRealOnTimeout($eventManager);

        $this->assertFalse($this->invokeContinueInteraction($service, $context));
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

    public function testContinueInteractionContinuesWhenTimeoutRevalidationPasses(): void
    {
        $itemSession = $this->createMock(AssessmentItemSession::class);
        $itemSession->method('getState')->willReturn(AssessmentItemSessionState::INTERACTING);
        $itemSession->method('getRemainingAttempts')->willReturn(0);

        $session = $this->createMock(TestSession::class);
        $session->method('isRunning')->willReturn(true);
        $session->method('isTimeout')->willReturn(true);
        $session->expects($this->once())
            ->method('checkTimeLimits')
            ->with(false, true, false);
        $session->method('getCurrentAssessmentItemSession')->willReturn($itemSession);

        $context = $this->createMock(QtiRunnerServiceContext::class);
        $context->method('getTestSession')->willReturn($session);

        $eventManager = $this->createMock(EventManager::class);
        $eventManager->expects($this->once())->method('trigger');

        $service = $this->createService();
        $service->setServiceLocator($this->getServiceLocatorMock([
            EventManager::SERVICE_ID => $eventManager,
        ]));
        $service->expects($this->never())->method('onTimeout');
        $service->expects($this->never())->method('finish');

        $this->assertTrue($this->invokeContinueInteraction($service, $context));
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

    public function testContinueInteractionTimeoutFinishEmitsAgsPayloadWithOutcomeScores(): void
    {
        if (!class_exists(LtiAgsListener::class)) {
            $this->markTestSkipped('This test needs ' . LtiAgsListener::class);
        }

        $timeoutException = new AssessmentTestSessionException(
            'Maximum duration of assessmentTest timedTest not respected.',
            AssessmentTestSessionException::ASSESSMENT_TEST_DURATION_OVERFLOW
        );

        $scoreTotal = 7.0;
        $scoreTotalMax = 10.0;
        $executionId = 'http://execution/id';
        $userUri = 'http://user/id';
        $persistedVariables = [];
        $operationOrder = [];

        $runningSession = $this->createMock(TestSession::class);
        $runningSession->method('isRunning')->willReturn(true);
        $runningSession->method('isTimeout')->willReturnOnConsecutiveCalls(true, true);
        $runningSession->method('getCurrentNavigationMode')->willReturn(NavigationMode::LINEAR);
        $runningSession->method('checkTimeLimits')
            ->with(false, true, false)
            ->willThrowException($timeoutException);
        $runningSession->expects($this->once())
            ->method('moveThroughAndEndTestSession')
            ->willReturnCallback(function () use (
                &$persistedVariables,
                &$operationOrder,
                $scoreTotal,
                $scoreTotalMax
            ): void {
                $operationOrder[] = 'persistOutcomes';
                $persistedVariables = $this->createDeliveryOutcomeVariables($scoreTotal, $scoreTotalMax);
            });

        $closedSession = $this->createMock(TestSession::class);
        $closedSession->method('isRunning')->willReturn(false);
        $closedSession->method('isManualScored')->willReturn(false);

        $callCount = 0;
        $context = $this->createMock(QtiRunnerServiceContext::class);
        $context->method('getTestExecutionUri')->willReturn($executionId);
        $context->method('getTestSession')
            ->willReturnCallback(static function () use ($runningSession, $closedSession, &$callCount) {
                return (++$callCount <= 2) ? $runningSession : $closedSession;
            });

        $deliveryExecution = $this->createMock(DeliveryExecution::class);
        $deliveryExecution->method('getUserIdentifier')->willReturn($userUri);
        $deliveryExecution->method('getIdentifier')->willReturn($executionId);
        $deliveryExecution->method('getFinishTime')->willReturn(1234567890.1234);
        $deliveryExecution->expects($this->once())->method('setState')->willReturn(true);

        $this->injectDeliveryExecutionServiceProxy($deliveryExecution);
        $this->injectSessionUserUri($userUri);

        $agsPayload = null;
        $queueDispatcher = $this->createMock(QueueDispatcherInterface::class);
        $queueDispatcher->expects($this->once())
            ->method('createTask')
            ->willReturnCallback(static function ($task, array $body) use (&$agsPayload) {
                $agsPayload = $body;

                return null;
            });

        $agsClaim = $this->createMock(AgsClaim::class);
        $agsClaim->method('normalize')->willReturn(['lineItem' => 'test-line-item']);

        $launchData = $this->createMock(LtiLaunchData::class);
        $launchData->method('hasVariable')->with(LtiLaunchData::AGS_CLAIMS)->willReturn(true);
        $launchData->method('getVariable')->willReturnCallback(
            static function (string $key) use ($agsClaim, $userUri) {
                return match ($key) {
                    LtiLaunchData::AGS_CLAIMS => $agsClaim,
                    LtiLaunchData::TOOL_CONSUMER_INSTANCE_ID => 'registration-id',
                    default => $userUri,
                };
            }
        );
        $launchData->method('getUserID')->willReturn($userUri);

        $ltiContextRepository = $this->createLtiContextRepositoryStub($launchData, $executionId);

        $resultStorage = $this->createMock(RdsResultStorage::class);
        $resultStorage->expects($this->once())
            ->method('getDeliveryVariables')
            ->with($executionId)
            ->willReturnCallback(function () use (&$persistedVariables, &$operationOrder) {
                $operationOrder[] = 'readOutcomes';
                $this->assertNotEmpty(
                    $persistedVariables,
                    'SCORE_TOTAL outcomes must be persisted before finish reads delivery variables'
                );

                return $persistedVariables;
            });

        $resultServerService = $this->createMock(ResultServerService::class);
        $resultServerService->method('getResultStorage')->willReturn($resultStorage);

        $extendedStateService = $this->createMock(ExtendedStateService::class);
        $extendedStateService->expects($this->once())->method('clearEvents')->with($executionId);

        $eventManager = new EventManager();
        $agsListener = new LtiAgsListener();
        $eventManager->attach(DeliveryExecutionFinish::class, [$agsListener, 'onDeliveryExecutionFinish']);

        $serviceManager = $this->getServiceLocatorMock([
            EventManager::SERVICE_ID => $eventManager,
            ResultServerService::SERVICE_ID => $resultServerService,
            ExtendedStateService::SERVICE_ID => $extendedStateService,
            QueueDispatcherInterface::SERVICE_ID => $queueDispatcher,
            LtiContextRepositoryInterface::class => $ltiContextRepository,
        ]);
        $eventManager->setServiceLocator($serviceManager);
        $agsListener->setServiceLocator($serviceManager);

        $service = new QtiRunnerService();
        $service->setLogger($this->createMock(LoggerInterface::class));
        $service->setServiceLocator($serviceManager);

        $this->assertFalse($this->invokeContinueInteraction($service, $context));
        $this->assertSame(['persistOutcomes', 'readOutcomes'], $operationOrder);
        $this->assertNotNull($agsPayload);
        $this->assertSame($scoreTotal, $agsPayload['data']['scoreGiven']);
        $this->assertSame($scoreTotalMax, $agsPayload['data']['scoreMaximum']);
        $this->assertSame($executionId, $agsPayload['deliveryExecutionId']);
    }

    private function createDeliveryOutcomeVariables(float $scoreTotal, float $scoreTotalMax): array
    {
        return [
            1 => [(object)['variable' => $this->createOutcomeVariable('SCORE_TOTAL', $scoreTotal)]],
            2 => [(object)['variable' => $this->createOutcomeVariable('SCORE_TOTAL_MAX', $scoreTotalMax)]],
        ];
    }

    private function createOutcomeVariable(string $identifier, float $value): OutcomeVariableModel
    {
        return (new OutcomeVariableModel())
            ->setIdentifier($identifier)
            ->setValue((string)$value)
            ->setEpoch('1234567890.1234');
    }

    private function injectDeliveryExecutionServiceProxy(DeliveryExecution $deliveryExecution): void
    {
        $proxy = $this->createMock(TaoDeliveryServiceProxy::class);
        $proxy->method('getDeliveryExecution')->willReturn($deliveryExecution);

        $property = new \ReflectionProperty(tao_models_classes_Service::class, 'instances');
        $property->setAccessible(true);
        $this->serviceSingletonBackup = $property->getValue();
        $this->serviceSingletonBackupTaken = true;
        $instances = $this->serviceSingletonBackup ?? [];
        $instances[TaoDeliveryServiceProxy::class] = $proxy;
        $property->setValue(null, $instances);
    }

    private function injectSessionUserUri(string $userUri): void
    {
        $session = $this->createMock(\common_session_Session::class);
        $session->method('getUserUri')->willReturn($userUri);

        $property = new \ReflectionProperty(\common_session_SessionManager::class, 'session');
        $property->setAccessible(true);
        $property->setValue(null, $session);
    }

    private function createLtiContextRepositoryStub(
        LtiLaunchData $launchData,
        string $executionId
    ): LtiContextRepositoryInterface {
        return new class ($launchData, $executionId) implements LtiContextRepositoryInterface {
            public function __construct(
                private LtiLaunchData $launchData,
                private string $executionId
            ) {
            }

            public function findByDeliveryExecutionId(string $deliveryExecutionId): ?LtiLaunchData
            {
                return $deliveryExecutionId === $this->executionId ? $this->launchData : null;
            }

            public function findByDeliveryExecution(DeliveryExecutionInterface $deliveryExecution): ?LtiLaunchData
            {
                return $this->findByDeliveryExecutionId($deliveryExecution->getIdentifier());
            }

            public function save(LtiLaunchData $ltiLaunchData, DeliveryExecutionInterface $deliveryExecution): void
            {
            }
        };
    }
}
