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
 * Copyright (c) 2021-2025 (original work) Open Assessment Technologies SA;
 */

declare(strict_types=1);

namespace oat\taoQtiTest\test\unit\model\Service;

use oat\generis\test\TestCase;
use oat\taoQtiTest\model\Domain\Model\ItemResponseRepositoryInterface;
use oat\taoQtiTest\model\Domain\Model\ToolsStateRepositoryInterface;
use oat\taoQtiTest\model\Service\ActionResponse;
use oat\taoQtiTest\model\Service\TimeoutCommand;
use oat\taoQtiTest\model\Service\TimeoutService;
use oat\taoQtiTest\models\runner\QtiRunnerService;
use oat\taoQtiTest\models\runner\QtiRunnerServiceContext;
use oat\taoQtiTest\models\runner\RunnerService;
use oat\taoQtiTest\models\runner\RunnerServiceContext;
use oat\taoQtiTest\models\runner\session\TestSession;
use PHPUnit\Framework\MockObject\MockObject;

class TimeoutServiceTest extends TestCase
{
    /**
     * @var TimeoutService
     */
    private $subject;

    /**
     * @var RunnerService|MockObject
     */
    private $runnerService;

    /**
     * @var RunnerServiceContext|MockObject
     */
    private $serviceContext;

    /**
     * @var ItemResponseRepositoryInterface|MockObject
     */
    private $itemResponseRepository;

    /**
     * @var ToolsStateRepositoryInterface|MockObject
     */
    private $toolsStateRepository;

    protected function setUp(): void
    {
        parent::setUp();

        $this->runnerService = $this->createMock(RunnerService::class);
        $this->serviceContext = $this->createMock(QtiRunnerServiceContext::class);
        $this->itemResponseRepository = $this->createMock(ItemResponseRepositoryInterface::class);
        $this->toolsStateRepository = $this->createMock(ToolsStateRepositoryInterface::class);

        $testSession = $this->createMock(TestSession::class);

        $this->serviceContext
            ->method('getTestSession')
            ->willReturn($testSession);

        $this->subject = new TimeoutService(
            $this->runnerService,
            $this->itemResponseRepository,
            $this->toolsStateRepository
        );
    }

    public function testHandlesTimeout(): void
    {
        $this->expectTestContext(['itemIdentifier' => 'item-2']);

        $expectedResponse = ActionResponse::success(['itemIdentifier' => 'item-2']);

        $response = $this->executeAction();

        $this->assertEquals($expectedResponse->toArray(), $response->toArray());
    }

    public function testAllowsLateSubmission(): void
    {
        $command = $this->createCommand(false, true);

        $this->runnerService->expects($this->once())
            ->method('timeout')
            ->with(
                $this->serviceContext,
                $command->getScope(),
                $command->getRef(),
                true
            );

        $this->executeAction($command);
    }

    public function testSavesItemResponse(): void
    {
        $this->expectTestContext(['itemIdentifier' => 'item-2']);

        $this->itemResponseRepository->expects($this->once())
            ->method('save');

        $this->executeAction($this->createCommand(lateSubmissionAllowed: true));
    }

    public function testSkipsItemResponse(): void
    {
        $this->expectTestContext(['itemIdentifier' => 'item-2']);

        $this->itemResponseRepository->expects($this->never())
            ->method('save');

        $this->executeAction();
    }

    public function testSavesToolsState(): void
    {
        $this->expectTestContext(['itemIdentifier' => 'item-2']);

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
        $this->runnerService->method('timeout')
            ->willReturn(false);

        $expectedResponse = ActionResponse::empty();

        $response = $this->executeAction();

        $this->assertEquals($expectedResponse->toArray(), $response->toArray());
    }

    public function testInitializesServiceContextBeforeTimingOut(): void
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

        $exitTest = new TimeoutService(
            $persistableRunnerService,
            $this->itemResponseRepository,
            $this->toolsStateRepository
        );

        $exitTest($this->createCommand());
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

    private function createCommand(
        bool $hasStartTimer = false,
        bool $lateSubmissionAllowed = false,
        bool $permanentLateSubmission = false
    ): TimeoutCommand {
        $command = new TimeoutCommand(
            $this->serviceContext,
            $hasStartTimer,
            $lateSubmissionAllowed,
            $permanentLateSubmission
        );

        $command->setNavigationContext('', 'item', null);

        return $command;
    }

    protected function executeAction(?TimeoutCommand $command = null): ActionResponse
    {
        if ($command === null) {
            $command = $this->createCommand();
        }

        return $this->subject->__invoke($command);
    }
}
