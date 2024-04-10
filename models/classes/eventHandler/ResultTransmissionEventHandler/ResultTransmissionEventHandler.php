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

use oat\oatbox\service\ServiceNotFoundException;
use oat\tao\model\service\InjectionAwareService;
use oat\taoDelivery\model\execution\DeliveryServerService;
use oat\taoQtiTest\models\classes\event\ResultTestVariablesTransmissionEvent;
use oat\taoQtiTest\models\event\ResultItemVariablesTransmissionEvent;
use taoQtiCommon_helpers_ResultTransmitter;
use oat\oatbox\service\exception\InvalidServiceManagerException;

class ResultTransmissionEventHandler extends InjectionAwareService implements
    Api\ResultTransmissionEventHandlerInterface
{
    /**
     * @throws \taoQtiCommon_helpers_ResultTransmissionException
     */
    public function transmitResultItemVariable(ResultItemVariablesTransmissionEvent $event): void
    {
        $this->buildTransmitter($event->getDeliveryExecutionId())->transmitItemVariable(
            $event->getVariables(),
            $event->getTransmissionId(),
            $event->getItemUri(),
            $event->getTestUri()
        );
    }

    /**
     * @param ResultTestVariablesTransmissionEvent $event
     * @throws InvalidServiceManagerException
     * @throws ServiceNotFoundException
     * @throws \taoQtiCommon_helpers_ResultTransmissionException
     */
    public function transmitResultTestVariable(ResultTestVariablesTransmissionEvent $event): void
    {
        $this->buildTransmitter($event->getDeliveryExecutionId())->transmitTestVariable(
            $event->getVariables(),
            $event->getTransmissionId(),
            $event->getTestUri()
        );
    }

    /**
     * @param $deliveryExecutionIdigcicd
     * @return taoQtiCommon_helpers_ResultTransmitter
     * @throws InvalidServiceManagerException
     * @throws \oat\oatbox\service\ServiceNotFoundException
     */
    private function buildTransmitter($deliveryExecutionId): taoQtiCommon_helpers_ResultTransmitter
    {
        /** @var DeliveryServerService $deliveryServerService */
        $deliveryServerService = $this->getServiceManager()->get(DeliveryServerService::SERVICE_ID);
        $resultStore = $deliveryServerService->getResultStoreWrapper($deliveryExecutionId);

        return new taoQtiCommon_helpers_ResultTransmitter($resultStore);
    }
}
