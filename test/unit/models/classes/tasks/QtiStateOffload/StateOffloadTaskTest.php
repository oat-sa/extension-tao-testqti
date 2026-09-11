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
 * Foundation, Inc., 31 Milk St # 960789 Boston, MA 02196 USA
 *
 * Copyright (c) 2026 (original work) Open Assessment Technologies SA;
 */

declare(strict_types=1);

namespace oat\taoQtiTest\test\unit\models\classes\tasks\QtiStateOffload;

use oat\generis\test\ServiceManagerMockTrait;
use oat\oatbox\reporting\Report;
use oat\tao\model\state\StateMigration;
use oat\tao\model\taskQueue\QueueDispatcherInterface;
use oat\taoQtiTest\models\classes\tasks\QtiStateOffload\AbstractQtiStateManipulationTask;
use oat\taoQtiTest\models\classes\tasks\QtiStateOffload\StateOffloadTask;
use oat\taoQtiTest\models\classes\tasks\QtiStateOffload\StateRemovalTask;
use PHPUnit\Framework\MockObject\MockObject;
use PHPUnit\Framework\TestCase;
use Psr\Log\LoggerInterface;
use RuntimeException;

class StateOffloadTaskTest extends TestCase
{
    use ServiceManagerMockTrait;

    private const USER_ID = 'd250fc6f:S_XX99929000004:01925ab3-7497-478e-8f2f-626d267a3eea';
    private const CALL_ID = 'kve_de_http://example.org#i6a98';
    private const STATE_LABEL = 'Test';

    /** @var StateMigration|MockObject */
    private $stateMigration;

    /** @var QueueDispatcherInterface|MockObject */
    private $queueDispatcher;

    /** @var LoggerInterface|MockObject */
    private $logger;

    private StateOffloadTask $subject;

    protected function setUp(): void
    {
        $this->stateMigration = $this->createMock(StateMigration::class);
        $this->queueDispatcher = $this->createMock(QueueDispatcherInterface::class);
        $this->logger = $this->createMock(LoggerInterface::class);

        $this->subject = new StateOffloadTask();
        $this->subject->setLogger($this->logger);
        $this->subject->setServiceLocator($this->getServiceManagerMock([
            StateMigration::SERVICE_ID => $this->stateMigration,
            QueueDispatcherInterface::SERVICE_ID => $this->queueDispatcher,
        ]));
    }

    public function testInvokeEnqueuesRemovalOnSuccessfulArchive(): void
    {
        $this->stateMigration
            ->expects($this->once())
            ->method('archive')
            ->with(self::USER_ID, self::CALL_ID)
            ->willReturn(true);

        $this->queueDispatcher
            ->expects($this->once())
            ->method('createTask')
            ->with(
                $this->isInstanceOf(StateRemovalTask::class),
                [
                    AbstractQtiStateManipulationTask::PARAM_USER_ID_KEY => self::USER_ID,
                    AbstractQtiStateManipulationTask::PARAM_CALL_ID_KEY => self::CALL_ID,
                    AbstractQtiStateManipulationTask::PARAM_STATE_LABEL_KEY => self::STATE_LABEL,
                ]
            );

        $this->logger->expects($this->once())->method('info');

        $report = ($this->subject)($this->params());

        $this->assertSame(Report::TYPE_SUCCESS, $report->getType());
        $this->assertStringContainsString('successfully archived', $report->getMessage());
    }

    public function testInvokeReturnsInfoAndSkipsRemovalWhenNoState(): void
    {
        $this->stateMigration
            ->expects($this->once())
            ->method('archive')
            ->willReturn(false);

        $this->queueDispatcher->expects($this->never())->method('createTask');
        $this->logger->expects($this->once())->method('info');
        $this->logger->expects($this->never())->method('warning');

        $report = ($this->subject)($this->params());

        $this->assertSame(Report::TYPE_INFO, $report->getType());
        $this->assertStringContainsString('no Test state found to archive', $report->getMessage());
    }

    public function testInvokeReturnsErrorAndSkipsRemovalWhenWriteFails(): void
    {
        $this->stateMigration
            ->expects($this->once())
            ->method('archive')
            ->willThrowException(new RuntimeException('unable to write'));

        $this->queueDispatcher->expects($this->never())->method('createTask');
        $this->logger
            ->expects($this->once())
            ->method('warning')
            ->with(
                'Failed to archive Test state',
                $this->callback(static function (array $context): bool {
                    return $context['exception'] === 'unable to write'
                        && $context['userId'] === self::USER_ID
                        && $context['callId'] === self::CALL_ID;
                })
            );

        $report = ($this->subject)($this->params());

        $this->assertSame(Report::TYPE_ERROR, $report->getType());
        $this->assertStringContainsString('state archiving failed', $report->getMessage());
    }

    private function params(): array
    {
        return [
            AbstractQtiStateManipulationTask::PARAM_USER_ID_KEY => self::USER_ID,
            AbstractQtiStateManipulationTask::PARAM_CALL_ID_KEY => self::CALL_ID,
            AbstractQtiStateManipulationTask::PARAM_STATE_LABEL_KEY => self::STATE_LABEL,
        ];
    }
}
