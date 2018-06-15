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
 * Copyright (c) 2015-2017 (original work) Open Assessment Technologies SA;
 */

namespace oat\taoQtiTest\models;

use oat\oatbox\service\ConfigurableService;
use oat\tao\model\state\StateStorage;
use oat\taoDelivery\model\execution\ServiceProxy;
use oat\taoDelivery\model\execution\Delete\DeliveryExecutionDelete;
use oat\taoDelivery\model\execution\Delete\DeliveryExecutionDeleteRequest;
use oat\taoQtiTest\models\runner\ExtendedState;
use oat\taoQtiTest\models\runner\StorageManager;

/**
 * Manage the flagged items
 */
class ExtendedStateService extends ConfigurableService implements DeliveryExecutionDelete
{
    const SERVICE_ID = 'taoQtiTest/ExtendedStateService';

    protected $cache = [];
    protected $deliveryExecutions = [];

    /**
     * @var StateStorage
     */
    protected $storageService;

    /**
     * Gets the StateStorage service
     * @return StorageManager
     */
    public function getStorageService()
    {
        if (!$this->storageService) {
            $this->storageService = $this->getServiceLocator()->get(StorageManager::SERVICE_ID);
        }
        return $this->storageService;
    }

    /**
     * Sets the StateStorage service
     * @param StateStorage $storageService
     */
    public function setStorageService($storageService)
    {
        $this->storageService = $storageService;
    }

    /**
     * @param string $testSessionId
     * @return string
     * @throws \common_exception_Error
     */
    protected function getSessionUserUri($testSessionId)
    {
        if (!isset($this->deliveryExecutions[$testSessionId])) {
            $this->deliveryExecutions[$testSessionId] = ServiceProxy::singleton()->getDeliveryExecution($testSessionId);
        }
        if ($this->deliveryExecutions[$testSessionId]) {
            return $this->deliveryExecutions[$testSessionId]->getUserIdentifier();
        }
        return \common_session_SessionManager::getSession()->getUserUri();
    }

    /**
     * @param $testSessionId
     * @return ExtendedState
     * @throws \common_exception_Error
     */
    public function getExtendedState($testSessionId)
    {
        if (!isset($this->cache[$testSessionId])) {
            $extendedState = new ExtendedState($testSessionId, $this->getSessionUserUri($testSessionId));
            $this->getServiceManager()->propagate($extendedState);
            $extendedState->setStorage($this->getStorageService());
            $extendedState->load();
            $this->cache[$testSessionId] = $extendedState;
        }
        return $this->cache[$testSessionId];
    }

    /**
     * Persists the extended state
     * @param string $testSessionId
     * @throws \common_exception_Error
     */
    public function persist($testSessionId)
    {
        $extendedState = $this->getExtendedState($testSessionId);
        $extendedState->save();
        $this->getStorageService()->persist($extendedState->getUserId(), $extendedState->getStorageKey());
    }

    /**
     * Set the marked for review state of an item
     * @param string $testSessionId
     * @param string $itemRef
     * @param boolean $flag
     * @throws \common_Exception
     */
    public function setItemFlag($testSessionId, $itemRef, $flag)
    {
        $extendedState = $this->getExtendedState($testSessionId);
        $extendedState->setItemFlag($itemRef, $flag);
        $extendedState->save();
    }

    /**
     * Gets the marked for review state of an item
     * @param string $testSessionId
     * @param string $itemRef
     * @return bool
     * @throws \common_Exception
     */
    public function getItemFlag($testSessionId, $itemRef)
    {
        $extendedState = $this->getExtendedState($testSessionId);
        return $extendedState->getItemFlag($itemRef);
    }

    /**
     * Sets the name of the client store used for the timer
     * @param string $testSessionId
     * @param string $storeId
     * @throws \common_Exception
     */
    public function setStoreId($testSessionId, $storeId)
    {
        $extendedState = $this->getExtendedState($testSessionId);
        $extendedState->setStoreId($storeId);
        $extendedState->save();
    }

    /**
     * Gets the name of the client store used for the timer
     * @param string $testSessionId
     * @return bool
     * @throws \common_Exception
     */
    public function getStoreId($testSessionId)
    {
        $extendedState = $this->getExtendedState($testSessionId);
        return $extendedState->getStoreId();
    }

    /**
     * Add an event on top of the queue
     * @param string $testSessionId
     * @param string $eventName
     * @param mixed $data
     * @return string
     * @throws \common_Exception
     */
    public function addEvent($testSessionId, $eventName, $data = null)
    {
        $extendedState = $this->getExtendedState($testSessionId);
        $eventId = $extendedState->addEvent($eventName, $data);
        $extendedState->save();
        return $eventId;
    }

    /**
     * Gets all events from the queue
     * @param $testSessionId
     * @return array|mixed
     * @throws \common_Exception
     */
    public function getEvents($testSessionId)
    {
        $extendedState = $this->getExtendedState($testSessionId);
        return $extendedState->getEvents();
    }

    /**
     * Removes particular events from the queue
     * @param $testSessionId
     * @param array $ids
     * @throws \common_Exception
     */
    public function removeEvents($testSessionId, $ids = [])
    {
        $extendedState = $this->getExtendedState($testSessionId);
        $extendedState->removeEvents($ids);
        $extendedState->save();
    }

    /**
     * Removes all events from the queue
     * @param $testSessionId
     * @throws \common_Exception
     */
    public function clearEvents($testSessionId)
    {
        $extendedState = $this->getExtendedState($testSessionId);
        $extendedState->clearEvents();
        $extendedState->save();
    }

    /**
     * Stores the table that maps the items identifiers to item reference
     * Fallback index in case of the delivery was compiled without the index of item href
     * @param $testSessionId
     * @param array $table
     * @throws \common_Exception
     */
    public function storeItemHrefIndex($testSessionId, $table)
    {
        $extendedState = $this->getExtendedState($testSessionId);
        $extendedState->setItemHrefIndex($table);
        $extendedState->save();
    }

    /**
     * Loads the table that maps the items identifiers to item reference
     * Fallback index in case of the delivery was compiled without the index of item href
     * @param $testSessionId
     * @return array
     * @throws \common_Exception
     */
    public function loadItemHrefIndex($testSessionId)
    {
        $extendedState = $this->getExtendedState($testSessionId);
        return $extendedState->getItemHrefIndex();
    }

    /**
     * Set a CAT Value
     *
     * Set a CAT value in the Extended State.
     *
     * @param string $testSessionId
     * @param string $assessmentSectionId
     * @param string $key
     * @param string $value
     * @throws \common_Exception
     */
    public function setCatValue($testSessionId, $assessmentSectionId, $key, $value)
    {
        $extendedState = $this->getExtendedState($testSessionId);
        $extendedState->setCatValue($assessmentSectionId, $key, $value);
        $extendedState->save();
    }

    /**
     * Get a CAT Value
     *
     * Get a CAT value from the Extended State.
     *
     * @param string $testSessionId
     * @param string $assessmentSectionId
     * @param string $key
     * @return string
     * @throws \common_Exception
     */
    public function getCatValue($testSessionId, $assessmentSectionId, $key)
    {
        $extendedState = $this->getExtendedState($testSessionId);
        return $extendedState->getCatValue($assessmentSectionId, $key);
    }

    /**
     * Remove a CAT value from the ExtendedState.
     *
     * @param string $testSessionId
     * @param string $assessmentSectionId
     * @param string $key
     * @throws \common_Exception
     */
    public function removeCatValue($testSessionId, $assessmentSectionId, $key)
    {
        $extendedState = $this->getExtendedState($testSessionId);
        $extendedState->removeCatValue($assessmentSectionId, $key);
        $extendedState->save();
    }

    /**
     * @inheritdoc
     */
    public function deleteDeliveryExecutionData(DeliveryExecutionDeleteRequest $request)
    {
        if ($request->getSession() === null) {
            $sessionId = $request->getDeliveryExecution()->getIdentifier();
        } else {
            $sessionId = $request->getSession()->getSessionId();
        }
        $extendedState = $this->getExtendedState($sessionId);
        $extendedState->deleteDeliveryExecutionData($request);

        return $this->getStorageService()->persist($extendedState->getUserId(), $extendedState->getStorageKey());
    }
}
