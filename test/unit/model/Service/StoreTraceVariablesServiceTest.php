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
 * Copyright (c) 2021 (original work) Open Assessment Technologies SA;
 *
 * @author Ricardo Quintanilha <ricardo.quintanilha@taotesting.com>
 */

declare(strict_types=1);

namespace oat\taoQtiTest\test\unit\model\Service;

use oat\generis\test\TestCase;
use oat\oatbox\event\EventManager;
use oat\taoQtiTest\model\Service\ActionResponse;
use oat\taoQtiTest\model\Service\StoreTraceVariablesService;
use oat\taoQtiTest\model\Service\StoreTraceVariablesCommand;
use oat\taoQtiTest\models\event\TraceVariableStored;
use oat\taoQtiTest\models\runner\QtiRunnerServiceContext;
use oat\taoQtiTest\models\runner\RunnerService;
use oat\taoQtiTest\models\runner\session\TestSession;
use PHPUnit\Framework\MockObject\MockObject;

class StoreTraceVariablesServiceTest extends TestCase
{
    /** @var StoreTraceVariablesService */
    private $subject;

    /** @var RunnerService|MockObject */
    private $runnerService;

    /** @var QtiRunnerServiceContext|MockObject */
    private $serviceContext;

    /** @var EventManager|MockObject */
    private $eventManager;

    protected function setUp(): void
    {
        parent::setUp();

        $this->runnerService = $this->createMock(RunnerService::class);
        $this->serviceContext = $this->createMock(QtiRunnerServiceContext::class);
        $this->eventManager = $this->createMock(EventManager::class);

        $testSession = $this->createMock(TestSession::class);

        $this->serviceContext
            ->method('getTestSession')
            ->willReturn($testSession);

        $this->subject = new StoreTraceVariablesService(
            $this->runnerService,
            $this->eventManager
        );
    }

    public function testStoresTraceVariablesInTest(): void
    {
        $this->runnerService->expects($this->exactly(2))
            ->method('storeTraceVariable')
            ->withConsecutive(
                [$this->serviceContext, null, 'varA', '10'],
                [$this->serviceContext, null, 'varB', '20']
            );

        $expectedResponse = ActionResponse::success();

        $command = $this->createCommand(['varA' => '10', 'varB' => '20']);

        $response = $this->executeAction($command);

        $this->assertEquals($expectedResponse->toArray(), $response->toArray());
    }

    public function testStoresTraceVariablesInItem(): void
    {
        $this->runnerService->method('getItemHref')
            ->with($this->serviceContext, 'item-1')
            ->willReturn('#item-1');

        $this->runnerService->expects($this->exactly(2))
            ->method('storeTraceVariable')
            ->withConsecutive(
                [$this->serviceContext, '#item-1', 'varA', '10'],
                [$this->serviceContext, '#item-1', 'varB', '20']
            );

        $expectedResponse = ActionResponse::success();

        $command = $this->createCommand(
            ['varA' => '10', 'varB' => '20'],
            'item-1'
        );

        $response = $this->executeAction($command);

        $this->assertEquals($expectedResponse->toArray(), $response->toArray());
    }

    public function testTriggersTraceVariableStoredEvent(): void
    {
        $this->eventManager->expects($this->once())
            ->method('trigger')
            ->with(
                $this->isInstanceOf(TraceVariableStored::class)
            );

        $this->executeAction();
    }

    private function createCommand(array $traceVariables = [], ?string $itemIdentifier = null): StoreTraceVariablesCommand
    {
        return new StoreTraceVariablesCommand($this->serviceContext, $traceVariables, $itemIdentifier);
    }

    protected function executeAction(?StoreTraceVariablesCommand $command = null): ActionResponse
    {
        if ($command === null) {
            $command = $this->createCommand();
        }

        return $this->subject->__invoke($command);
    }
}
