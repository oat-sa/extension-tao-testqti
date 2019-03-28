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
 * Copyright (c) 2017 (original work) Open Assessment Technologies SA ;
 */

namespace oat\taoQtiTest\test\unit\models\classes\runner\synchronisation\action;

use Exception;
use oat\generis\test\TestCase;
use oat\oatbox\event\EventManager;
use oat\taoQtiTest\models\event\ItemOfflineEvent;
use oat\taoQtiTest\models\runner\QtiRunnerService;
use oat\taoQtiTest\models\runner\QtiRunnerServiceContext;
use oat\taoQtiTest\models\runner\RunnerServiceContext;
use oat\taoQtiTest\models\runner\session\TestSession;
use oat\taoQtiTest\models\runner\synchronisation\action\Timeout;
use PHPUnit_Framework_MockObject_MockObject;

class TimeoutTest extends TestCase
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
     * @expectedExceptionMessage Some parameters are missing. Required parameters are : testDefinition, testCompilation, serviceCallId, scope
     */
    public function testValidationExceptionIfRequestParametersAreMissing()
    {
        $this->createSubjectWithParameters(['missing parameters'])->process();
    }

    public function testUnsuccessfulResponse()
    {
        $this->qtiRunnerService
            ->expects($this->once())
            ->method('timeout')
            ->willReturn(false);

        $subject = $this->createSubjectWithParameters($this->getRequiredRequestParameters());

        $this->assertEquals(['success' => false], $subject->process());
    }

    public function testErrorResponse()
    {
        $this->qtiRunnerService
            ->method('getServiceContext')
            ->willThrowException(new Exception('Error message', 100));

        $subject = $this->createSubjectWithParameters($this->getRequiredRequestParameters());

        $this->assertEquals([
            'success' => false,
            'type' => 'exception',
            'code' => 100,
            'message' => 'An error occurred!',
        ], $subject->process());
    }

    public function testSuccessfulResponse()
    {
        $this->qtiRunnerService
            ->expects($this->once())
            ->method('timeout')
            ->willReturn(true);

        $subject = $this->createSubjectWithParameters($this->getRequiredRequestParameters());

        $this->assertEquals([
            'success' => true,
            'testContext' => null,
        ], $subject->process());
    }

    public function testItReturnsTestContextWithSuccessfulResponse()
    {
        $subject = $this->createSubjectWithParameters($this->getRequiredRequestParameters());

        $this->qtiRunnerService
            ->expects($this->once())
            ->method('timeout')
            ->willReturn(true);

        $this->qtiRunnerService
            ->expects($this->once())
            ->method('getTestContext')
            ->with($this->qtiRunnerServiceContext)
            ->willReturn(['expectedTestContext']);

        $this->assertEquals([
            'success' => true,
            'testContext' => ['expectedTestContext'],
        ], $subject->process());
    }

    public function testItReturnsTestMapWhenServiceContextContainsAdaptiveContent()
    {
        $subject = $this->createSubjectWithParameters($this->getRequiredRequestParameters());

        $this->qtiRunnerService
            ->expects($this->once())
            ->method('timeout')
            ->willReturn(true);

        $this->qtiRunnerServiceContext
            ->expects($this->once())
            ->method('containsAdaptive')
            ->willReturn(true);

        $this->qtiRunnerService
            ->expects($this->once())
            ->method('getTestMap')
            ->with($this->qtiRunnerServiceContext)
            ->willReturn(['expectedTestMap']);

        $this->assertEquals([
            'success' => true,
            'testContext' => null,
            'testMap' => ['expectedTestMap'],
        ], $subject->process());
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

    public function testItTimeoutsItemWithExpectedParameters()
    {
        $requestParameters = $this->getRequiredRequestParameters(
            'expectedDefinition',
            'testCompilation',
            'testServiceCallId',
            'expectedScope'
        ) + ['start' => true, 'ref' => 'expectedRef'];

        $subject = $this->createSubjectWithParameters($requestParameters);

        $this->qtiRunnerService
            ->expects($this->once())
            ->method('timeout')
            ->with($this->qtiRunnerServiceContext, 'expectedScope', 'expectedRef');

        $subject->process();
    }

    public function testItEndsTimerAndSavesItemStateIfRunnerIsNotTerminated()
    {
        $expectedDecodedItemState = ['item' => 'expectedItemState'];
        $requestParameters = [
            'itemDuration' => 1000,
            'itemDefinition' => 'expectedItemDefinition',
            'itemState' => json_encode($expectedDecodedItemState),
        ] + $this->getRequiredRequestParameters();

        $subject = $this->createSubjectWithParameters($requestParameters);

        $expectedTime = microtime(true);
        $subject->setTime($expectedTime);

        $this->qtiRunnerService
            ->method('isTerminated')
            ->willReturn(false);

        $this->qtiRunnerService
            ->expects($this->once())
            ->method('endTimer')
            ->with($this->qtiRunnerServiceContext, 1000, $expectedTime);

        $this->qtiRunnerService
            ->expects($this->once())
            ->method('setItemState')
            ->with($this->qtiRunnerServiceContext, 'expectedItemDefinition', $expectedDecodedItemState);

        $subject->process();
    }

    public function testItSavesItemResponses()
    {
        $expectedItemResponse = ['item' => 'response'];
        $requestParameters = [
                'itemDefinition' => 'expectedItemDefinition',
                'itemResponse' => json_encode($expectedItemResponse),
            ] + $this->getRequiredRequestParameters();

        $this->qtiRunnerService
            ->expects($this->once())
            ->method('parsesItemResponse')
            ->with($this->qtiRunnerServiceContext, 'expectedItemDefinition', $expectedItemResponse)
            ->willReturn($expectedItemResponse);

        $this->qtiRunnerService
            ->expects($this->once())
            ->method('storeItemResponse')
            ->with($this->qtiRunnerServiceContext, 'expectedItemDefinition', $expectedItemResponse);

        $this->createSubjectWithParameters($requestParameters)->process();
    }

    /**
     * @param array $requestParameters
     *
     * @return Timeout
     */
    private function createSubjectWithParameters($requestParameters = [])
    {
        $subject = new Timeout('test', microtime(), $requestParameters);

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
     * @param mixed $scope
     *
     * @return array
     */
    private function getRequiredRequestParameters(
        $testDefinition = null,
        $testCompilation = null,
        $serviceCallId = null,
        $scope = null
    ) {
        return [
            'testDefinition' => $testDefinition,
            'testCompilation' => $testCompilation,
            'serviceCallId' => $serviceCallId,
            'scope' => $scope,
        ];
    }
}
