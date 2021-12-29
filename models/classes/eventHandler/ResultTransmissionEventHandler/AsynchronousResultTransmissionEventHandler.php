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
 */

declare(strict_types=1);

namespace oat\taoQtiTest\models\classes\eventHandler\ResultTransmissionEventHandler;

use oat\oatbox\service\ServiceManager;
use oat\tao\model\service\InjectionAwareService;
use oat\tao\model\taskQueue\QueueDispatcher;
use oat\taoQtiTest\models\classes\event\ResultTestVariablesTransmissionEvent;
use oat\taoQtiTest\models\classes\tasks\ResultTransmission\AbstractResultTransmissionTask;
use oat\taoQtiTest\models\classes\tasks\ResultTransmission\ResultItemVariableTransmissionTask;
use oat\taoQtiTest\models\classes\tasks\ResultTransmission\ResultTestVariableTransmissionTask;
use oat\taoQtiTest\models\event\ResultItemVariablesTransmissionEvent;

class AsynchronousResultTransmissionEventHandler extends InjectionAwareService implements Api\ResultTransmissionEventHandlerInterface
{
    public function transmitResultItemVariable(ResultItemVariablesTransmissionEvent $event): void
    {
        $queueDispatcher = $this->getQueueDispatcher();

        $queueDispatcher->createTask(new ResultItemVariableTransmissionTask(), [
            AbstractResultTransmissionTask::EXECUTION_ID_PARAMETER_KEY => $event->getDeliveryExecutionId(),
            AbstractResultTransmissionTask::VARIABLES_PARAMETER_KEY => $this->packVariables($event->getVariables()),
            AbstractResultTransmissionTask::TRANSMISSION_ID_PARAMETER_KEY => $event->getTransmissionId(),
            AbstractResultTransmissionTask::ITEM_URI_PARAMETER_KEY => $event->getItemUri(),
            AbstractResultTransmissionTask::TEST_URI_PARAMETER_KEY => $event->getTestUri(),
        ]);
    }

    public function transmitResultTestVariable(ResultTestVariablesTransmissionEvent $event): void
    {
        $queueDispatcher = $this->getQueueDispatcher();
        $queueDispatcher->createTask(new ResultTestVariableTransmissionTask(), [
            AbstractResultTransmissionTask::EXECUTION_ID_PARAMETER_KEY => $event->getDeliveryExecutionId(),
            AbstractResultTransmissionTask::VARIABLES_PARAMETER_KEY => $this->packVariables($event->getVariables()),
            AbstractResultTransmissionTask::TRANSMISSION_ID_PARAMETER_KEY => $event->getTransmissionId(),
            AbstractResultTransmissionTask::TEST_URI_PARAMETER_KEY => $event->getTestUri(),
        ]);
    }

    private function getQueueDispatcher(): QueueDispatcher
    {
        return ServiceManager::getServiceManager()->get(QueueDispatcher::SERVICE_ID);
    }

    private function packVariables(array $variables): array
    {
        return array_map(static function ($record) {
            if (is_object($record)) {
                return serialize($record);
            }
            return $record;
        }, $variables);
    }
}
