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
use oat\taoQtiTest\models\event\TraceVariableStored;
use oat\taoQtiTest\models\runner\map\QtiRunnerMap;
use oat\taoQtiTest\models\runner\QtiRunnerService;
use oat\taoQtiTest\models\runner\QtiRunnerServiceContext;
use oat\taoQtiTest\models\runner\session\TestSession;
use oat\taoQtiTest\models\runner\synchronisation\action\StoreTraceData;
use PHPUnit_Framework_MockObject_MockObject;

class StoreTraceDataTest extends TestCase
{
    /** @var QtiRunnerService|PHPUnit_Framework_MockObject_MockObject */
    private $qtiRunnerService;

    /** @var QtiRunnerServiceContext|PHPUnit_Framework_MockObject_MockObject */
    private $qtiRunnerServiceContext;

    /** @var TestSession|PHPUnit_Framework_MockObject_MockObject */
    private $testSession;

    /** @var EventManager|PHPUnit_Framework_MockObject_MockObject */
    private $eventManager;

    /** @var QtiRunnerMap|PHPUnit_Framework_MockObject_MockObject */
    private $qtiRunnerMap;

    protected function setUp()
    {
        parent::setUp();

        $this->qtiRunnerService = $this->createMock(QtiRunnerService::class);
        $this->qtiRunnerServiceContext = $this->createMock(QtiRunnerServiceContext::class);
        $this->testSession = $this->createMock(TestSession::class);
        $this->eventManager = $this->createMock(EventManager::class);
        $this->qtiRunnerMap = $this->createMock(QtiRunnerMap::class);

        $this->qtiRunnerService
            ->method('getServiceContext')
            ->willReturn($this->qtiRunnerServiceContext);

        $this->qtiRunnerServiceContext
            ->method('getTestSession')
            ->willReturn($this->testSession);
    }

    /**
     * @expectedException \common_exception_InconsistentData
     * @expectedExceptionMessage Some parameters are missing. Required parameters are : testDefinition, testCompilation, serviceCallId, traceData
     */
    public function testValidationExceptionIfRequestParametersAreMissing()
    {
        $this->createSubjectWithParameters(['missing parameters'])->process();
    }

    public function testUnsuccessfulResponse()
    {
        $this->qtiRunnerService
            ->expects($this->once())
            ->method('storeTraceVariable')
            ->willReturn(false);

        $subject = $this->createSubjectWithParameters($this->getRequiredRequestParameters(['traceData']));

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
        $requestParameters = [
            'itemDefinition' => 'expectedItemIdentifier'
        ] + $this->getRequiredRequestParameters(['expectedIdentifier' => 'expectedValue']);

        $this->qtiRunnerMap
            ->expects($this->once())
            ->method('getItemHref')
            ->with($this->qtiRunnerServiceContext, 'expectedItemIdentifier')
            ->willReturn('expectedItemHref');

        $this->qtiRunnerService
            ->method('storeTraceVariable')
            ->with($this->qtiRunnerServiceContext, 'expectedItemHref', 'expectedIdentifier', 'expectedValue')
            ->willReturn(true);

        $subject = $this->createSubjectWithParameters($requestParameters);

        $this->assertEquals(['success' => true], $subject->process());
    }

    public function testItTriggersTraceVariableStoredEvent()
    {
        $this->qtiRunnerService
            ->method('storeTraceVariable')
            ->willReturn(true);

        $this->testSession
            ->expects($this->once())
            ->method('getSessionId')
            ->willReturn('expectedSessionId');

        $this->eventManager
            ->expects($this->once())
            ->method('trigger')
            ->willReturnCallback(function (TraceVariableStored $event) {
                return $event->getName() === 'expectedSessionId'
                    && $event->getTraceData() === ['expectedTraceData'];
            });

        $this->createSubjectWithParameters($this->getRequiredRequestParameters(['expectedTraceData']))->process();
    }

    /**
     * @param array $requestParameters
     *
     * @return StoreTraceData
     */
    private function createSubjectWithParameters($requestParameters = [])
    {
        $subject = new StoreTraceData('test', microtime(), $requestParameters);

        $services = [
            QtiRunnerService::SERVICE_ID => $this->qtiRunnerService,
            EventManager::SERVICE_ID => $this->eventManager,
            QtiRunnerMap::SERVICE_ID => $this->qtiRunnerMap,
        ];

        return $subject->setServiceLocator($this->getServiceLocatorMock($services));
    }

    /**
     * @param array $traceData
     * @param mixed $testDefinition
     * @param mixed $testCompilation
     * @param mixed $serviceCallId
     *
     * @return array
     */
    private function getRequiredRequestParameters(
        $traceData = [],
        $testDefinition = null,
        $testCompilation = null,
        $serviceCallId = null
    ) {
        return [
            'testDefinition' => $testDefinition,
            'testCompilation' => $testCompilation,
            'serviceCallId' => $serviceCallId,
            'traceData' => json_encode($traceData),
        ];
    }
}
