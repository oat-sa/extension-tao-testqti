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
use oat\taoQtiTest\model\Domain\Model\ItemResponse;
use oat\taoQtiTest\model\Domain\Model\ItemResponseRepositoryInterface;
use oat\taoQtiTest\model\Service\ActionResponse;
use oat\taoQtiTest\model\Service\PauseCommand;
use oat\taoQtiTest\model\Service\PauseService;
use oat\taoQtiTest\models\runner\config\RunnerConfig;
use oat\taoQtiTest\models\runner\QtiRunnerServiceContext;
use oat\taoQtiTest\models\runner\RunnerService;
use oat\taoQtiTest\models\runner\RunnerServiceContext;
use PHPUnit\Framework\MockObject\MockObject;

class PauseServiceTest extends TestCase
{
    /** @var PauseService */
    private $subject;

    /** @var RunnerService|MockObject */
    private $runnerService;

    /** @var RunnerServiceContext|MockObject */
    private $serviceContext;

    /** @var ItemResponseRepositoryInterface|MockObject */
    private $itemResponseRepository;

    /** @var RunnerConfig|MockObject */
    private $runnerConfig;

    protected function setUp(): void
    {
        parent::setUp();

        $this->runnerService = $this->createMock(RunnerService::class);
        $this->serviceContext = $this->createMock(QtiRunnerServiceContext::class);
        $this->itemResponseRepository = $this->createMock(ItemResponseRepositoryInterface::class);
        $this->runnerConfig = $this->createMock(RunnerConfig::class);

        $this->runnerService->method('getTestConfig')
            ->willReturn($this->runnerConfig);

        $this->subject = new PauseService(
            $this->runnerService,
            $this->itemResponseRepository
        );
    }

    public function testPausesTheTest(): void
    {
        $expectedResponse = ActionResponse::success();

        $response = $this->executeAction();

        $this->assertEquals($expectedResponse->toArray(), $response->toArray());
    }

    public function testPauseActionIsSuccessfulForAlreadyPausedSessions()
    {
        $this->runnerService->expects($this->never())->method('check');

        $expectedResponse = ActionResponse::success();

        $response = $this->executeAction();

        $this->assertEquals($expectedResponse->toArray(), $response->toArray());
    }

    public function testSavesItemResponse(): void
    {
        $this->itemResponseRepository->expects($this->once())
            ->method('save');

        $this->executeAction();
    }

    public function testInitializesServiceContextBeforePausing(): void
    {
        $this->serviceContext->expects($this->once())
            ->method('init');

        $this->executeAction();
    }

    public function testRemovesDurationOfItemResponseWhenTimerTargetIsConfiguredAsServer(): void
    {
        $expectedResponse = ActionResponse::success();
        $expectedItemResponse = new ItemResponse('item-1', null, null, null);

        $this->itemResponseRepository->expects($this->once())
            ->method('save')
            ->with($expectedItemResponse, $this->serviceContext);

        $this->runnerConfig->method('getConfigValue')
            ->with('timer.target')
            ->willReturn('server');

        $command = $this->createCommand();

        $command->setItemContext('item-1', null, 50.10, null);

        $response = $this->executeAction($command);

        $this->assertEquals($expectedResponse, $response);
    }

    public function testDoesNotSaveItemResponseWhenTestIsTerminated(): void
    {
        $this->itemResponseRepository->expects($this->never())
            ->method('save');

        $this->runnerService->method('isTerminated')
            ->willReturn(true);

        $this->executeAction();
    }

    public function testReturnsEmptyResponseWhenRunnerServiceReturnsFalse(): void
    {
        $this->runnerService->method('pause')
            ->willReturn(false);

        $response = $this->executeAction();

        $this->assertEquals(ActionResponse::empty(), $response);
    }

    private function createCommand(): PauseCommand
    {
        return new PauseCommand($this->serviceContext);
    }

    protected function executeAction(?PauseCommand $command = null): ActionResponse
    {
        if ($command === null) {
            $command = $this->createCommand();
        }

        return $this->subject->__invoke($command);
    }
}
