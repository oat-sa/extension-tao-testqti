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
 * Copyright (c) 2015 (original work) Open Assessment Technologies SA (under the project TAO-PRODUCT);
 *
 */
namespace oat\taoAct\model\export;

use oat\oatbox\service\ConfigurableService;
use oat\taoFrontOffice\model\Delivery;
use oat\taoOutcomeUi\model\ResultsService;
/**
 * The OdsFactory
 */
class OdsFactory extends ConfigurableService
{
    const OPTION_STORAGE = 'storage';
    
    const KEY_CACHEINFO_PREFIX = 'ods_cacheinfo_';
    
    /**
     * Returns the date of the last data generation
     * 
     * @param Delivery $delivery
     * @return string timestamp UTC
     */
    public function getCacheDate(Delivery $delivery)
    {
        $date = $this->getStorage()->get(self::KEY_CACHEINFO_PREFIX.$delivery->getId());
        return $date;
    }

    public function getDelivery(Delivery $delivery)
    {
        \helpers_TimeOutHelper::setTimeOutLimit(\helpers_TimeOutHelper::LONG);
        $results = array();
        foreach ($this->getFinishedExecutions($delivery) as $deliveryExecution) {
            try {
                $results[] = OdsPayload::loadFromStorage($this->getStorage(), $deliveryExecution);
            } catch (\common_cache_NotFoundException $e) {
                // delivery execution not cached
            }
        }
        return $results;
        \helpers_TimeOutHelper::reset();
    }
    
    /**
     * @param taoDelivery_models_classes_execution_OntologyDeliveryExecution[] $deliveryExecutons
     * @return \oat\taoAct\model\export\OdsPayload
     */
    private function generatePayload(array $deliveryExecutons)
    {
        $cache = $this->getStorage();
        $result = array();
        foreach ($deliveryExecutons as $deliveryExecuton) {
            $payload = new OdsPayload($deliveryExecuton);
            $payload->setStorage($cache);
            $payload->getPayload();
            $result[] = $payload;
        }
        return $result;
    }
    
    public function generatePayloadForDelivery(Delivery $delivery)
    {
        $storage = $this->getStorage();
        $deliveryExecutions = $this->getFinishedExecutions($delivery);
        if (!empty($deliveryExecutions)) {
            foreach ($deliveryExecutions as $deliveryExecuton) {
                $payload = new OdsPayload($deliveryExecuton);
                $payload->setStorage($storage);
                // get or generates the storage
                $payload->getPayload();
            }
            $this->getStorage()->set(self::KEY_CACHEINFO_PREFIX.$delivery->getId(), time());
        }
        return true;
    }
    
    protected function getFinishedExecutions(Delivery $delivery)
    {
        // use result service to find delivery executions
        $resultsService = ResultsService::singleton()->getReadableImplementation($delivery);
        $deliveryExecutionService = \taoDelivery_models_classes_execution_ServiceProxy::singleton();
        
        $deliveryExecutions = array();
        foreach ($resultsService->getResultByDelivery(array($delivery->getUri())) as $result) {
            $de = $deliveryExecutionService->getDeliveryExecution($result['deliveryResultIdentifier']);
            if ($de->getState()->getUri() == INSTANCE_DELIVERYEXEC_FINISHED) {
                $deliveryExecutions[] = $de;
            }
        }
        
        return $deliveryExecutions;
    }
    
    /**
     * Get the ods payload storage
     * 
     * @return \common_persistence_KeyValuePersistence
     */
    protected function getStorage() {
        return \common_persistence_KeyValuePersistence::getPersistence($this->getOption(self::OPTION_STORAGE));
    }

}