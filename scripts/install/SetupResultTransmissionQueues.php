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
use oat\taoQtiTest\models\classes\tasks\ResultTransmission\ResultItemVariableTransmissionTask;
use oat\taoQtiTest\models\classes\tasks\ResultTransmission\ResultTestVariableTransmissionTask;

class SetupResultTransmissionQueues extends InstallAction
{

    public function __invoke($params): Report
    {
        $queueDispatcher = $this->getQueueDispatcher();
        $existingQueues = $queueDispatcher->getOption(QueueDispatcherInterface::OPTION_QUEUES);
        $existingQueues[] = new Queue(
            ResultItemVariableTransmissionTask::QUEUE_NAME,
            new InMemoryQueueBroker(5)
        );
        $existingQueues[] = new Queue(
            ResultTestVariableTransmissionTask::QUEUE_NAME,
            new InMemoryQueueBroker(5)
        );

        $existingOptions = $queueDispatcher->getOptions();
        $existingOptions[QueueDispatcherInterface::OPTION_QUEUES] = $existingQueues;

        $queueDispatcher->setOptions($existingOptions);
        $this->getServiceManager()->register(QueueDispatcherInterface::SERVICE_ID, $queueDispatcher);

        return Report::createSuccess(sprintf(
            'Setup queues "%s" and "%s" successfully',
            ResultItemVariableTransmissionTask::QUEUE_NAME,
            ResultTestVariableTransmissionTask::QUEUE_NAME
        ));
    }

    private function getQueueDispatcher(): QueueDispatcherInterface
    {
        return $this->getServiceManager()->get(QueueDispatcherInterface::SERVICE_ID);
    }
}
