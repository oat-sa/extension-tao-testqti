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

namespace oat\taoQtiTest\scripts\install;

use oat\oatbox\extension\InstallAction;
use oat\oatbox\reporting\Report;
use oat\tao\model\taskQueue\Queue;
use oat\tao\model\taskQueue\Queue\Broker\InMemoryQueueBroker;
use oat\tao\model\taskQueue\QueueDispatcherInterface;
use oat\tao\model\taskQueue\QueueInterface;
use oat\taoQtiTest\models\classes\tasks\QtiStateOffload\StateBackupRemovalTask;
use oat\taoQtiTest\models\classes\tasks\QtiStateOffload\StateOffloadTask;
use oat\taoQtiTest\models\classes\tasks\QtiStateOffload\StateRemovalTask;

class SetupStateOffloadQueue extends InstallAction
{
    public const QUEUE_NAME = 'state_management';

    public function __invoke($params): Report
    {
        $queueDispatcher = $this->getQueueDispatcher();

        if ($queueDispatcher->hasQueue(self::QUEUE_NAME)) {
            return Report::createWarning(
                sprintf(
                    'Queue %s already exists',
                    self::QUEUE_NAME
                )
            );
        }
        $newQueue = $this->buildNewQueue();
        $newQueue->initialize();

        $queueDispatcher->addQueue($newQueue);
        $queueDispatcher->linkTaskToQueue(StateBackupRemovalTask::class, self::QUEUE_NAME);
        $queueDispatcher->linkTaskToQueue(StateOffloadTask::class, self::QUEUE_NAME);
        $queueDispatcher->linkTaskToQueue(StateRemovalTask::class, self::QUEUE_NAME);

        $this->registerService(QueueDispatcherInterface::SERVICE_ID, $queueDispatcher);

        return Report::createSuccess(
            sprintf(
                'Setup of %s proceed successfully',
                self::QUEUE_NAME
            )
        );
    }

    private function buildNewQueue(): QueueInterface
    {
        return $this->propagate(
            new Queue(
                self::QUEUE_NAME,
                new InMemoryQueueBroker()
            )
        );
    }

    private function getQueueDispatcher(): QueueDispatcherInterface
    {
        return $this->getServiceLocator()->getContainer()->get(QueueDispatcherInterface::SERVICE_ID);
    }
}
