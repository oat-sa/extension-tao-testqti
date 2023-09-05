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
use oat\taoQtiTest\model\Service\SkipCommand;
use oat\taoQtiTest\model\Service\SkipService;
use oat\taoQtiTest\models\runner\QtiRunnerService;
use oat\taoQtiTest\models\runner\QtiRunnerServiceContext;
use oat\taoQtiTest\models\runner\RunnerService;
use oat\taoQtiTest\models\runner\RunnerServiceContext;
use PHPUnit\Framework\MockObject\MockObject;

class SkipServiceTest extends TestCase
{
    /** @var SkipService */
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

        $this->subject = new SkipService(
            $this->runnerService,
            $this->itemResponseRepository,
            $this->toolsStateRepository
        );
    }

    public function testSkipsToNextItem(): void
    {
        $this->expectTestContext(['itemIdentifier' => 'item-2']);

        $expectedResponse = ActionResponse::success(['itemIdentifier' => 'item-2']);

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

    public function testReturnsTestMapWhenTestIsAdaptive(): void
    {
        $this->serviceContext->method('containsAdaptive')
            ->willReturn(true);

        $this->expectTestContext(['itemIdentifier' => 'item-2']);
        $this->expectTestMap(['scope' => 'item']);

        $expectedResponse = ActionResponse::success(['itemIdentifier' => 'item-2'], ['scope' => 'item']);

        $response = $this->executeAction();

        $this->assertEquals($expectedResponse->toArray(), $response->toArray());
    }

    public function testStartsTimerWhenStartTimerIsRequested(): void
    {
        $this->runnerService->expects($this->once())
            ->method('startTimer');

        $this->expectTestContext(['itemIdentifier' => 'item-2']);

        $expectedResponse = ActionResponse::success(['itemIdentifier' => 'item-2']);

        $response = $this->executeAction($this->createCommand(true));

        $this->assertEquals($expectedResponse->toArray(), $response->toArray());
    }

    public function testReturnsEmptyResponseWhenRunnerServiceReturnsFalse(): void
    {
        $this->runnerService->method('skip')
            ->willReturn(false);

        $expectedResponse = ActionResponse::empty();

        $response = $this->executeAction();

        $this->assertEquals($expectedResponse->toArray(), $response->toArray());
    }

    public function testInitializesServiceContextBeforeSkipping(): void
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

        $skip = new SkipService(
            $persistableRunnerService,
            $this->itemResponseRepository,
            $this->toolsStateRepository
        );

        $skip($this->createCommand());
    }

    private function expectTestContext(array $testContext): void
    {
        $this->runnerService
            ->method('getTestContext')
            ->willReturn($testContext);
    }

    private function expectTestMap(array $testMap): void
    {
        $this->runnerService
            ->method('getTestMap')
            ->willReturn($testMap);
    }

    private function createCommand(bool $hastStartTimer = false): SkipCommand
    {
        $command = new SkipCommand($this->serviceContext, $hastStartTimer);

        $command->setNavigationContext('next', 'item', null);

        return $command;
    }

    protected function executeAction(?SkipCommand $command = null): ActionResponse
    {
        if ($command === null) {
            $command = $this->createCommand();
        }

        return $this->subject->__invoke($command);
    }
}
