<?php

namespace oat\taoQtiTest\test\unit\models\classes\runner\synchronisation\action;

use common_exception_InconsistentData;
use Exception;
use oat\generis\test\TestCase;
use oat\oatbox\event\EventManager;
use oat\taoQtiTest\models\event\ItemOfflineEvent;
use oat\taoQtiTest\models\runner\config\RunnerConfig;
use oat\taoQtiTest\models\runner\QtiRunnerService;
use oat\taoQtiTest\models\runner\QtiRunnerServiceContext;
use oat\taoQtiTest\models\runner\RunnerServiceContext;
use oat\taoQtiTest\models\runner\session\TestSession;
use oat\taoQtiTest\models\runner\synchronisation\action\Pause;
use oat\generis\test\MockObject;
use PHPUnit\Framework\MockObject\Rule\InvokedCount as InvokedCountMatcher;

class PauseTest extends TestCase
{
    /** @var QtiRunnerService|MockObject */
    private $qtiRunnerService;

    /** @var QtiRunnerServiceContext|MockObject */
    private $qtiRunnerServiceContext;

    /** @var TestSession|MockObject */
    private $testSession;

    /** @var EventManager|MockObject */
    private $eventManager;

    /**
     * @var RunnerConfig|MockObject
     */
    private $testConfigMock;

    protected function setUp(): void
    {
        parent::setUp();

        $this->qtiRunnerService = $this->createMock(QtiRunnerService::class);
        $this->qtiRunnerServiceContext = $this->createMock(QtiRunnerServiceContext::class);
        $this->testSession = $this->createMock(TestSession::class);
        $this->eventManager = $this->createMock(EventManager::class);
        $this->testConfigMock = $this->createMock(RunnerConfig::class);

        $this->qtiRunnerService
            ->method('getServiceContext')
            ->willReturn($this->qtiRunnerServiceContext);
        $this->qtiRunnerService
            ->method('getTestConfig')
            ->willReturn($this->testConfigMock);

        $this->qtiRunnerServiceContext
            ->method('getTestSession')
            ->willReturn($this->testSession);
    }

    public function testValidationExceptionIfRequestParametersAreMissing(): void
    {
        $this->expectException(common_exception_InconsistentData::class);
        $this->expectExceptionMessage('Some parameters are missing. Required parameters are : testDefinition, testCompilation, serviceCallId');
        $this->createSubjectWithParameters(['missing parameters'])->process();
    }

    public function testUnsuccessfulResponse(): void
    {
        $this->qtiRunnerService
            ->method('pause')
            ->willThrowException(new Exception('oops'));

        $this->assertEquals([
            'success' => false,
            'type' => 'exception',
            'code' => 0,
            'message' => 'An error occurred!',
        ], $this->createSubjectWithParameters($this->getRequiredRequestParameters())->process());
    }

    public function testSuccessfulResponse(): void
    {
        $this->qtiRunnerService
            ->method('pause')
            ->willReturn(true);

        $this->assertEquals([
            'success' => true,
        ], $this->createSubjectWithParameters($this->getRequiredRequestParameters())->process());
    }

    public function testItTriggersItemOfflineEvent(): void
    {
        $requestParameters = [
                'offline' => true,
                'itemDefinition' => 'expectedItemDefinition',
            ] + $this->getRequiredRequestParameters();

        $this->eventManager
            ->expects($this->once())
            ->method('trigger')
            ->willReturnCallback(
                function (ItemOfflineEvent $itemOfflineEvent) {
                    return $itemOfflineEvent->getName() === 'expectedItemDefinition'
                        && $itemOfflineEvent->getSession() === $this->testSession;
                }
            );

        $this->createSubjectWithParameters($requestParameters)->process();
    }

    public function testItSavesToolStates(): void
    {
        $rawToolStates = [
            ['testTool1' => 'testStatus1'],
            ['testTool2' => 'testStatus2'],
        ];

        $requestParameters = $this->getRequiredRequestParameters();
        $requestParameters['toolStates'] = json_encode($rawToolStates);

        $expectedToolStates = [
            json_encode(['testTool1' => 'testStatus1']),
            json_encode(['testTool2' => 'testStatus2']),
        ];

        $this->qtiRunnerService
            ->expects($this->once())
            ->method('setToolsStates')
            ->willReturnCallback(
                function (RunnerServiceContext $runnerServiceContext, $toolStates) use ($expectedToolStates) {
                    return $runnerServiceContext === $this->qtiRunnerServiceContext
                        && $toolStates === $expectedToolStates;
                }
            );

        $this->createSubjectWithParameters($requestParameters)->process();
    }

    /**
     * @param bool $testTerminated
     * @param string $timerTarget
     * @param $itemDuration
     * @param callable $expectedCalls
     *
     * @dataProvider dataProviderTestPause_WhenRequired_EndItemTimer
     */
    public function testPause_WhenRequired_EndItemTimer(
        bool $testTerminated,
        string $timerTarget,
        $itemDuration,
        InvokedCountMatcher $expectedCalls
    ): void {
        $this->testConfigMock
            ->method('getConfigValue')
            ->with('timer.target')
            ->willReturn($timerTarget);

        $this->qtiRunnerService
            ->method('isTerminated')
            ->willReturn($testTerminated);

        $this->qtiRunnerService
            ->expects($expectedCalls)
            ->method('endTimer');

        $requestParameters = $this->getRequiredRequestParameters();
        $requestParameters["itemDuration"] = $itemDuration;

        $this->createSubjectWithParameters($requestParameters)->process();
    }

    /**
     * @dataProvider dataProviderTestSaveItemStateIfNeeded
     */
    public function testSaveItemStateIfNeeded(
        bool $testTerminated,
        $itemDefinition,
        $itemState,
        InvokedCountMatcher $expectedCalls
    ): void {
        $this->qtiRunnerService
            ->method('isTerminated')
            ->willReturn($testTerminated);

        $this->qtiRunnerService
            ->expects($expectedCalls)
            ->method('setItemState');

        $requestParameters = $this->getRequiredRequestParameters();
        $requestParameters["itemDefinition"] = $itemDefinition;
        $requestParameters["itemState"] = $itemState;

        $this->createSubjectWithParameters($requestParameters)->process();
    }

    /**
     * @param array $requestParameters
     *
     * @return Pause
     */
    private function createSubjectWithParameters($requestParameters = []): Pause
    {
        $subject = new Pause('test', microtime(), $requestParameters);

        $services = [
            QtiRunnerService::SERVICE_ID => $this->qtiRunnerService,
            EventManager::SERVICE_ID => $this->eventManager,
        ];

        return $subject->setServiceLocator($this->getServiceLocatorMock($services));
    }

    /**
     * @param mixed $testDefinition
     * @param mixed $testCompilation
     * @param mixed $serviceCallId
     *
     * @return array
     */
    private function getRequiredRequestParameters(
        $testDefinition = null,
        $testCompilation = null,
        $serviceCallId = null
    ) {
        return [
            'testDefinition' => $testDefinition,
            'testCompilation' => $testCompilation,
            'serviceCallId' => $serviceCallId,
        ];
    }

    public function dataProviderTestPause_WhenRequired_EndItemTimer(): array
    {
        return [
            'Test terminated - target client' => [
                'testTerminated' => true,
                'timerTarget' => 'client',
                'itemDuration' => null,
                'expectedCalls' => self::never()
            ],
            'Test terminated - target server' => [
                'testTerminated' => true,
                'timerTarget' => 'server',
                'itemDuration' => null,
                'expectedCalls' => self::never()
            ],
            'Test not terminated - target client - empty duration' => [
                'testTerminated' => false,
                'timerTarget' => 'client',
                'itemDuration' => null,
                'expectedCalls' => self::never()
            ],
            'Test not terminated - target client - not empty duration' => [
                'testTerminated' => false,
                'timerTarget' => 'client',
                'itemDuration' => 100,
                'expectedCalls' => self::once()
            ],
            'Test not terminated - target server - empty duration' => [
                'testTerminated' => false,
                'timerTarget' => 'server',
                'itemDuration' => null,
                'expectedCalls' => self::never()
            ],
            'Test not terminated - target server - not empty duration' => [
                'testTerminated' => false,
                'timerTarget' => 'server',
                'itemDuration' => 100,
                'expectedCalls' => self::never()
            ]
        ];
    }

    public function dataProviderTestSaveItemStateIfNeeded(): array
    {
        return [
            'Test terminated' => [
                'testTerminated' => true,
                'itemDefinition' => 'item',
                'itemState' => '[]',
                'expectedCalls' => self::never()
            ],
            'Test not terminated - itemState provided' => [
                'testTerminated' => false,
                'itemDefinition' => false,
                'itemState' => '[]',
                'expectedCalls' => self::never()
            ],
            'Test not terminated - itemDefinition provided' => [
                'testTerminated' => false,
                'itemDefinition' => 'item',
                'itemState' => false,
                'expectedCalls' => self::never()
            ],
            'Test not terminated - itemDefinition and itemState provided' => [
                'testTerminated' => false,
                'itemDefinition' => 'item',
                'itemState' => '[]',
                'expectedCalls' => self::once()
            ]
        ];
    }
}
