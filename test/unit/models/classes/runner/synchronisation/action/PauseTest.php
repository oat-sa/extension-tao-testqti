<?php

namespace oat\taoQtiTest\test\unit\models\classes\runner\synchronisation\action;

use Exception;
use oat\generis\test\TestCase;
use oat\oatbox\event\EventManager;
use oat\taoQtiTest\models\event\ItemOfflineEvent;
use oat\taoQtiTest\models\runner\QtiRunnerService;
use oat\taoQtiTest\models\runner\QtiRunnerServiceContext;
use oat\taoQtiTest\models\runner\RunnerServiceContext;
use oat\taoQtiTest\models\runner\session\TestSession;
use oat\taoQtiTest\models\runner\synchronisation\action\Pause;
use PHPUnit_Framework_MockObject_MockObject;

class PauseTest extends TestCase
{
    /** @var QtiRunnerService|PHPUnit_Framework_MockObject_MockObject */
    private $qtiRunnerService;

    /** @var QtiRunnerServiceContext|PHPUnit_Framework_MockObject_MockObject */
    private $qtiRunnerServiceContext;

    /** @var TestSession|PHPUnit_Framework_MockObject_MockObject */
    private $testSession;

    /** @var EventManager|PHPUnit_Framework_MockObject_MockObject */
    private $eventManager;

    protected function setUp()
    {
        parent::setUp();

        $this->qtiRunnerService = $this->createMock(QtiRunnerService::class);
        $this->qtiRunnerServiceContext = $this->createMock(QtiRunnerServiceContext::class);
        $this->testSession = $this->createMock(TestSession::class);
        $this->eventManager = $this->createMock(EventManager::class);

        $this->qtiRunnerService
            ->method('getServiceContext')
            ->willReturn($this->qtiRunnerServiceContext);

        $this->qtiRunnerServiceContext
            ->method('getTestSession')
            ->willReturn($this->testSession);
    }

    /**
     * @expectedException \common_exception_InconsistentData
     * @expectedExceptionMessage Some parameters are missing. Required parameters are : testDefinition, testCompilation, serviceCallId
     */
    public function testValidationExceptionIfRequestParametersAreMissing()
    {
        $this->createSubjectWithParameters(['missing parameters'])->process();
    }

    public function testUnsuccessfulResponse()
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

    public function testSuccessfulResponse()
    {
        $this->qtiRunnerService
            ->method('pause')
            ->willReturn(true);

        $this->assertEquals([
            'success' => true,
        ], $this->createSubjectWithParameters($this->getRequiredRequestParameters())->process());
    }

    public function testItTriggersItemOfflineEvent()
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

    public function testItSavesToolStates()
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
     * @param array $requestParameters
     *
     * @return Pause
     */
    private function createSubjectWithParameters($requestParameters = [])
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
}
