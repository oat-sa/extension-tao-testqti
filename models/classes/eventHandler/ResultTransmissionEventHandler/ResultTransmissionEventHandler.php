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

use oat\oatbox\event\EventManager;
use oat\oatbox\service\ServiceManager;
use oat\tao\model\service\InjectionAwareService;
use oat\taoDelivery\model\execution\DeliveryServerService;
use oat\taoQtiTest\models\classes\event\ResultTestVariablesTransmissionEvent;
use oat\taoQtiTest\models\event\ResultItemVariablesTransmissionEvent;
use oat\taoQtiTest\models\event\TestVariablesRecorded;
use taoQtiCommon_helpers_ResultTransmitter;
use oat\oatbox\service\exception\InvalidServiceManagerException;
use oat\taoResultServer\models\classes\implementation\ResultServerService;
use taoResultServer_models_classes_ReadableResultStorage as ReadableResultStorage;

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
     * @throws \taoQtiCommon_helpers_ResultTransmissionException
     */
    public function transmitResultTestVariable(ResultTestVariablesTransmissionEvent $event): void
    {
        $this->buildTransmitter($event->getDeliveryExecutionId())->transmitTestVariable(
            $event->getVariables(),
            $event->getTransmissionId(),
            $event->getTestUri()
        );

        if (empty($this->containsScoreTotal($event))) {
            return;
        }

        $this->triggerTestVariablesRecorded($event);
    }

    private function buildTransmitter($deliveryExecutionId): taoQtiCommon_helpers_ResultTransmitter
    {
        /** @var DeliveryServerService $deliveryServerService */
        $deliveryServerService = $this->getServiceManager()->get(DeliveryServerService::SERVICE_ID);
        $resultStore = $deliveryServerService->getResultStoreWrapper($deliveryExecutionId);

        return new taoQtiCommon_helpers_ResultTransmitter($resultStore);
    }

    public function getEventManager()
    {
        return $this->getServiceLocator()->get(EventManager::SERVICE_ID);
    }

    public function getServiceLocator()
    {
        return ServiceManager::getServiceManager();
    }

    /**
     * @throws common_exception_Error
     * @throws InvalidServiceManagerException
     */
    private function getResultsStorage(): ReadableResultStorage
    {
        $resultServerService = $this->getServiceLocator()->get(ResultServerService::SERVICE_ID);
        $storage = $resultServerService->getResultStorage();

        if (!$storage instanceof ReadableResultStorage) {
            throw new common_exception_Error('Configured result storage is not writable.');
        }

        return $storage;
    }

    /**
     * @param ResultTestVariablesTransmissionEvent $event
     * @return array
     */
    private function containsScoreTotal(ResultTestVariablesTransmissionEvent $event): array
    {
        return array_filter(
            $event->getVariables(),
            function ($item) {
                return $item->getIdentifier() === 'SCORE_TOTAL';
            }
        );
    }

    /**
     * @param ResultTestVariablesTransmissionEvent $event
     * @return void
     * @throws InvalidServiceManagerException
     */
    private function triggerTestVariablesRecorded(ResultTestVariablesTransmissionEvent $event): void
    {
        $outcomeVariables = $this->getResultsStorage()->getDeliveryVariables($event->getDeliveryExecutionId());
        $this->getEventManager()->trigger(new TestVariablesRecorded(
            $event->getDeliveryExecutionId(),
            $outcomeVariables,
            $event->isManualScored()
        ));
    }
}
