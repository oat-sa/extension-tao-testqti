<?php

namespace oat\taoQtiTest\test\models\runner\synchronisation\action;

use oat\generis\test\TestCase;
use oat\taoQtiTest\models\runner\config\RunnerConfig;
use oat\taoQtiTest\models\runner\QtiRunnerService;
use oat\taoQtiTest\models\runner\QtiRunnerServiceContext;
use oat\taoQtiTest\models\runner\session\TestSession;
use oat\taoQtiTest\models\runner\synchronisation\action\NextItemData;
use PHPUnit_Framework_MockObject_MockObject;
use stdClass;

class NextItemDataTest extends TestCase
{
    /** @var QtiRunnerService|PHPUnit_Framework_MockObject_MockObject */
    private $qtiRunnerService;

    /** @var QtiRunnerServiceContext|PHPUnit_Framework_MockObject_MockObject */
    private $qtiRunnerServiceContext;

    /** @var TestSession|PHPUnit_Framework_MockObject_MockObject */
    private $testSession;

    protected function setUp()
    {
        parent::setUp();

        $this->qtiRunnerService = $this->createMock(QtiRunnerService::class);
        $this->qtiRunnerServiceContext = $this->createMock(QtiRunnerServiceContext::class);
        $this->testSession = $this->createMock(TestSession::class);

        $this->qtiRunnerService
            ->method('getServiceContext')
            ->willReturn($this->qtiRunnerServiceContext);

        $this->qtiRunnerServiceContext
            ->method('getTestSession')
            ->willReturn($this->testSession);
    }

    /**
     * @expectedException \common_exception_InconsistentData
     * @expectedExceptionMessage Some parameters are missing. Required parameters are : testDefinition, testCompilation, serviceCallId, itemDefinition
     */
    public function testValidationExceptionIfRequestParametersAreMissing()
    {
        $this->createSubjectWithParameters(['missing parameters'])->process();
    }

    public function testErrorResponse()
    {
        $this->setItemCacheEnabledConfigExpectation(false);
        $subject = $this->createSubjectWithParameters($this->getRequiredRequestParameters());

        $this->assertEquals([
            'success' => false,
            'type' => 'exception',
            'code' => 403,
            'message' => 'You are not authorized to perform this operation',
        ], $subject->process());
    }

    public function testSuccessfulResponse()
    {
        $this->setItemCacheEnabledConfigExpectation(true);

        $requestParameters = ['itemDefinition' => 'expectedItemDefinition'] + $this->getRequiredRequestParameters();
        $subject = $this->createSubjectWithParameters($requestParameters);

        $this->assertEquals([
            'items' => [
                [
                    'baseUrl' => null,
                    'itemData' => null,
                    'itemState' => new stdClass(),
                    'itemIdentifier' => 'expectedItemDefinition',
                ]
            ],
            'success' => true,
        ], $subject->process());
    }

    /**
     * @param array $requestParameters
     *
     * @return NextItemData
     */
    private function createSubjectWithParameters($requestParameters = [])
    {
        $subject = new NextItemData('test', microtime(), $requestParameters);

        $services = [
            QtiRunnerService::SERVICE_ID => $this->qtiRunnerService,
        ];

        return $subject->setServiceLocator($this->getServiceLocatorMock($services));
    }

    /**
     * @param mixed $testDefinition
     * @param mixed $testCompilation
     * @param mixed $serviceCallId
     * @param mixed $itemDefinition
     *
     * @return array
     */
    private function getRequiredRequestParameters(
        $testDefinition = null,
        $testCompilation = null,
        $serviceCallId = null,
        $itemDefinition = null
    ) {
        return [
            'testDefinition' => $testDefinition,
            'testCompilation' => $testCompilation,
            'serviceCallId' => $serviceCallId,
            'itemDefinition' => $itemDefinition,
        ];
    }

    /**
     * @param bool $isEnabled
     */
    private function setItemCacheEnabledConfigExpectation($isEnabled)
    {
        $runnerConfig = $this->createMock(RunnerConfig::class);
        $runnerConfig
            ->expects($this->once())
            ->method('getConfigValue')
            ->with('itemCaching.enabled')
            ->willReturn($isEnabled);

        $this->qtiRunnerService
            ->method('getTestConfig')
            ->willReturn($runnerConfig);
    }
}
