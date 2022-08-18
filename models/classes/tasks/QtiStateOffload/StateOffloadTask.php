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
 * Copyright (c) 2022 (original work) Open Assessment Technologies SA;
 */

declare(strict_types=1);

namespace oat\taoQtiTest\models\classes\tasks\QtiStateOffload;

use InvalidArgumentException;
use oat\oatbox\extension\AbstractAction;
use common_report_Report as Report;
use oat\oatbox\service\exception\InvalidServiceManagerException;
use oat\tao\model\state\StateMigration;
use oat\tao\model\taskQueue\QueueDispatcherInterface;
use oat\tao\model\taskQueue\Task\TaskAwareInterface;
use oat\tao\model\taskQueue\Task\TaskAwareTrait;
use Psr\Container\ContainerExceptionInterface;
use Psr\Container\NotFoundExceptionInterface;

class StateOffloadTask extends AbstractQtiStateManipulationTask
{
    protected function manipulateState(string $userId, string $callId, string $stateLabel): Report
    {
        $logContext = [
            'userId' => $userId,
            'callId' => $callId,
            'stateType' => $stateLabel
        ];

        if (!$this->getStateMigrationService()->archive($userId, $callId)) {
            $this->getLogger()->warning(
                sprintf('Failed to archive %s state', $stateLabel),
                $logContext
            );
            return Report::createFailure(
                sprintf(
                    '[%s] - %s state archiving failed for user %s',
                    $callId,
                    $stateLabel,
                    $userId
                )
            );
        }

        $this->enqueueStateRemovalTask($userId, $callId, $stateLabel);

        $this->getLogger()->info(sprintf('%s state has been archived', $stateLabel), $logContext);

        return Report::createSuccess(
            sprintf(
                '[%s] - %s state was successfully archived for user %s',
                $callId,
                $stateLabel,
                $userId
            )
        );
    }

    private function enqueueStateRemovalTask(string $userId, string $callId, string $stateLabel): void
    {
        $this->getQueueDispatcher()->createTask(new StateRemovalTask(), [
            AbstractQtiStateManipulationTask::PARAM_USER_ID_KEY => $userId,
            AbstractQtiStateManipulationTask::PARAM_CALL_ID_KEY => $callId,
            AbstractQtiStateManipulationTask::PARAM_STATE_LABEL_KEY => $stateLabel
        ]);
    }

    private function getQueueDispatcher(): QueueDispatcherInterface
    {
        return $this->getServiceLocator()->get(QueueDispatcherInterface::SERVICE_ID);
    }
}
