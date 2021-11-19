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
use oat\taoQtiTest\model\Domain\Model\ItemResponseRepositoryInterface;
use oat\taoQtiTest\model\Domain\Model\ToolsStateRepositoryInterface;
use oat\taoQtiTest\model\Service\ActionResponse;
use oat\taoQtiTest\model\Service\ExitTestCommand;
use oat\taoQtiTest\model\Service\ExitTestService;
use oat\taoQtiTest\models\runner\QtiRunnerService;
use oat\taoQtiTest\models\runner\QtiRunnerServiceContext;
use oat\taoQtiTest\models\runner\RunnerService;
use oat\taoQtiTest\models\runner\RunnerServiceContext;
use PHPUnit\Framework\MockObject\MockObject;

class ExitTestServiceTest extends TestCase
{
    /** @var ExitTestService */
    private $subject;

    /** @var RunnerService|MockObject */
    private $runnerService;

    /** @var RunnerServiceContext|MockObject */
    private $serviceContext;

    /** @var ItemResponseRepositoryInterface|MockObject */
    private $itemResponseRepository;

    /** @var ToolsStateRepositoryInterface|MockObject */
    private $toolsStateRepository;

    protected function setUp(): void
    {
        parent::setUp();

        $this->runnerService = $this->createMock(RunnerService::class);
        $this->serviceContext = $this->createMock(QtiRunnerServiceContext::class);
        $this->itemResponseRepository = $this->createMock(ItemResponseRepositoryInterface::class);
        $this->toolsStateRepository = $this->createMock(ToolsStateRepositoryInterface::class);

        $this->subject = new ExitTestService(
            $this->runnerService,
            $this->itemResponseRepository,
            $this->toolsStateRepository
        );
    }

    public function testExitsTest(): void
    {
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

    public function testSavesToolsState(): void
    {
        $this->toolsStateRepository->expects($this->once())
            ->method('save');

        $this->executeAction();
    }

    public function testInitializesServiceContextBeforeExiting(): void
    {
        $this->serviceContext->expects($this->once())
            ->method('init');

        $this->executeAction();
    }

    public function testPersistsServiceContextForPersistableRunnerService(): void
    {
        $persistableRunnerService = $this->createMock(QtiRunnerService::class);

        $persistableRunnerService->expects($this->once())
            ->method('persist');

        $exitTest = new ExitTestService(
            $persistableRunnerService,
            $this->itemResponseRepository,
            $this->toolsStateRepository
        );

        $exitTest($this->createCommand());
    }

    private function createCommand(): ExitTestCommand
    {
        return new ExitTestCommand($this->serviceContext);
    }

    protected function executeAction(?ExitTestCommand $command = null): ActionResponse
    {
        if ($command === null) {
            $command = $this->createCommand();
        }

        return $this->subject->__invoke($command);
    }
}
