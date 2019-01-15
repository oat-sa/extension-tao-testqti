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
use oat\taoQtiTest\models\runner\QtiRunnerService;
use oat\taoQtiTest\models\runner\QtiRunnerServiceContext;
use oat\taoQtiTest\models\runner\RunnerServiceContext;
use oat\taoQtiTest\models\runner\session\TestSession;
use oat\taoQtiTest\models\runner\synchronisation\action\ExitTest;
use PHPUnit_Framework_MockObject_MockObject;

class ExitTestTest extends TestCase
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
     * @expectedExceptionMessage Some parameters are missing. Required parameters are : testDefinition, testCompilation, serviceCallId
     */
    public function testValidationExceptionIfRequestParametersAreMissing()
    {
        $this->createSubjectWithParameters(['missing parameters'])->process();
    }

    public function testUnsuccessfulResponse()
    {
        $this->qtiRunnerService
            ->expects($this->once())
            ->method('exitTest')
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
            ->method('exitTest')
            ->willReturn(true);

        $subject = $this->createSubjectWithParameters($this->getRequiredRequestParameters());

        $this->assertEquals(['success' => true], $subject->process());
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

    /**
     * @param array $requestParameters
     *
     * @return ExitTest
     */
    private function createSubjectWithParameters($requestParameters = [])
    {
        $subject = new ExitTest('test', microtime(), $requestParameters);

        $services = [
            QtiRunnerService::SERVICE_ID => $this->qtiRunnerService,
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
