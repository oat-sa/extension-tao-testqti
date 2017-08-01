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
 * Copyright (c) 2015 (original work) Open Assessment Technologies SA;
 *
 */

namespace oat\taoQtiTest\models;

use oat\oatbox\service\ConfigurableService;
use oat\taoDelivery\model\execution\ServiceProxy;

/**
 * Manage the flagged items
 */
class ExtendedStateService extends ConfigurableService
{
    const SERVICE_ID = 'taoQtiTest/ExtendedStateService';
    
    const STORAGE_PREFIX = 'extra_';

    const VAR_REVIEW = 'review';
    const VAR_STORE_ID = 'client_store_id';
    const VAR_EVENTS_QUEUE = 'events_queue';
    const VAR_CAT = 'cat';
    const VAR_HREF_INDEX = 'item_href_index';

    private static $cache = null;
    private static $deliveryExecutions = null;

    /**
     * @param string $testSessionId
     * @return string
     */
    protected function getSessionUserUri($testSessionId)
    {
        if (!isset(self::$deliveryExecutions[$testSessionId])) {
            self::$deliveryExecutions[$testSessionId] = ServiceProxy::singleton()->getDeliveryExecution($testSessionId);
        }
        if (self::$deliveryExecutions[$testSessionId]) {
            return self::$deliveryExecutions[$testSessionId]->getUserIdentifier();
        }
        return \common_session_SessionManager::getSession()->getUserUri();
    }

    /**
     * Retrieves extended state information
     * @param string $testSessionId
     * @throws \common_Exception
     * @return array
     */
    protected function getExtra($testSessionId)
    {
        if (!isset(self::$cache[$testSessionId])) {
            $storageService = \tao_models_classes_service_StateStorage::singleton();
            $userUri = $this->getSessionUserUri($testSessionId);

            $data = $storageService->get($userUri, self::getStorageKeyFromTestSessionId($testSessionId));
            if ($data) {
                $data = json_decode($data, true);
                if (is_null($data)) {
                    throw new \common_exception_InconsistentData('Unable to decode extra for test session '.$testSessionId);
                }
            } else {
                $data = array(
                    self::VAR_REVIEW => array()
                );
            }
            self::$cache[$testSessionId] = $data;
        }
        return self::$cache[$testSessionId];
    }

    /**
     * Stores extended state information
     * @param string $testSessionId
     * @param array $extra
     */
    protected function saveExtra($testSessionId, $extra)
    {

        self::$cache[$testSessionId] = $extra;

        $storageService = \tao_models_classes_service_StateStorage::singleton();
        $userUri = $this->getSessionUserUri($testSessionId);

        $storageService->set($userUri, self::getStorageKeyFromTestSessionId($testSessionId), json_encode($extra));
    }

    /**
     * Gets a value from the storage
     * @param string $testSessionId
     * @param string $name
     * @param null $default
     * @return mixed|null
     * @throws \common_exception_InconsistentData
     */
    protected function getValue($testSessionId, $name, $default = null)
    {
        $extra = $this->getExtra($testSessionId);
        return isset($extra[$name])
            ? $extra[$name]
            : $default;
    }

    /**
     * Set the marked for review state of an item
     * @param string $testSessionId
     * @param string $itemRef
     * @param boolean $flag
     */
    public function setItemFlag($testSessionId, $itemRef, $flag)
    {
        $extra = $this->getExtra($testSessionId);
        $extra[self::VAR_REVIEW][$itemRef] = $flag;

        $this->saveExtra($testSessionId, $extra);
    }

    /**
     * Gets the marked for review state of an item
     * @param string $testSessionId
     * @param string $itemRef
     * @return bool
     * @throws \common_exception_InconsistentData
     */
    public function getItemFlag($testSessionId, $itemRef)
    {
        $extra = $this->getExtra($testSessionId);
        return isset($extra[self::VAR_REVIEW][$itemRef])
            ? $extra[self::VAR_REVIEW][$itemRef]
            : false;
    }

    public function setStoreId($testSessionId, $storeId)
    {
        $extra = $this->getExtra($testSessionId);
        $extra[self::VAR_STORE_ID] = $storeId;
        $this->saveExtra($testSessionId, $extra);
    }

    public function getStoreId($testSessionId)
    {
        $extra = $this->getExtra($testSessionId);
        return isset($extra[self::VAR_STORE_ID]) ? $extra[self::VAR_STORE_ID] : false;
    }

    /**
     * Add an event on top of the queue
     * @param string $testSessionId
     * @param string $eventName
     * @param mixed $data
     * @return string
     */
    public function addEvent($testSessionId, $eventName, $data = null)
    {
        $extra = $this->getExtra($testSessionId);
        
        $eventId = uniqid('event', true);

        $extra[self::VAR_EVENTS_QUEUE][$eventId] = [
            'id' => $eventId,
            'timestamp' => microtime(true),
            'user' => \common_session_SessionManager::getSession()->getUserUri(),
            'type' => $eventName,
            'data' => $data,
        ];
        
        $this->saveExtra($testSessionId, $extra);
        
        return $eventId;
    }

    /**
     * Gets all events from the queue
     * @param $testSessionId
     * @return array|mixed
     */
    public function getEvents($testSessionId)
    {
        $extra = $this->getExtra($testSessionId);
        
        if (isset($extra[self::VAR_EVENTS_QUEUE])) {
            $events = $extra[self::VAR_EVENTS_QUEUE];
        } else {
            $events = [];
        }
        return $events;
    }

    /**
     * Removes particular events from the queue
     * @param $testSessionId
     * @param array $ids
     */
    public function removeEvents($testSessionId, $ids = [])
    {
        $extra = $this->getExtra($testSessionId);
        $toSave = false;
        if (isset($extra[self::VAR_EVENTS_QUEUE])) {
            foreach ($ids as $id) {
                if (isset($extra[self::VAR_EVENTS_QUEUE][$id])) {
                    unset($extra[self::VAR_EVENTS_QUEUE][$id]);
                    $toSave = true;
                }
            }
        }

        if($toSave){
            $this->saveExtra($testSessionId, $extra);
        }
    }
    
    /**
     * Removes all events from the queue
     * @param $testSessionId
     */
    public function clearEvents($testSessionId)
    {
        $extra = $this->getExtra($testSessionId);

        if(isset($extra[self::VAR_EVENTS_QUEUE]) && !empty($extra[self::VAR_EVENTS_QUEUE])){
            $extra[self::VAR_EVENTS_QUEUE] = [];
            $this->saveExtra($testSessionId, $extra);
        }

    }

    /**
     * Stores the table that maps the items identifiers to item reference
     * Fallback index in case of the delivery was compiled without the index of item href
     * @param $testSessionId
     * @param array $table
     */
    public function storeItemHrefIndex($testSessionId, $table)
    {
        $extra = $this->getExtra($testSessionId);
        $extra[self::VAR_HREF_INDEX] = $table;
        $this->saveExtra($testSessionId, $extra);
    }

    /**
     * Loads the table that maps the items identifiers to item reference
     * Fallback index in case of the delivery was compiled without the index of item href
     * @param $testSessionId
     * @return array
     */
    public function loadItemHrefIndex($testSessionId)
    {
        $extra = $this->getExtra($testSessionId);

        if (isset($extra[self::VAR_HREF_INDEX])) {
            $table = $extra[self::VAR_HREF_INDEX];
        } else {
            $table = [];
        }
        return $table;
    }


    /**
     * Storage Key from Test Session Id
     *
     * Returns the Storage Key corresponding to a given $testSessionId
     *
     * @param string $testSessionId
     * @return string
     */
    public static function getStorageKeyFromTestSessionId($testSessionId)
    {
        return self::STORAGE_PREFIX . $testSessionId;
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
     */
    public function setCatValue($testSessionId, $assessmentSectionId, $key, $value)
    {
        $extra = $this->getExtra($testSessionId);
        $extra[self::VAR_CAT][$assessmentSectionId][$key] = $value;
        $this->saveExtra($testSessionId, $extra);
    }
    
    /**
     * Get a CAT Value
     * 
     * Get a CAT value from the Extended State.
     * 
     * @return string
     */
    public function getCatValue($testSessionId, $assessmentSectionId, $key)
    {
        $extra = $this->getExtra($testSessionId);
        return (isset($extra[self::VAR_CAT]) && isset($extra[self::VAR_CAT][$assessmentSectionId]) && isset($extra[self::VAR_CAT][$assessmentSectionId][$key])) ? $extra[self::VAR_CAT][$assessmentSectionId][$key] : null;
    }
    
    /**
     * Remove a CAT value from the ExtendedState.
     * 
     * @param string $testSessionId
     * @param string $assessmentSectionId
     * @param string $key
     */
    public function removeCatValue($testSessionId, $assessmentSectionId, $key)
    {
        $extra = $this->getExtra($testSessionId);
        if (isset($extra[self::VAR_CAT]) && isset($extra[self::VAR_CAT][$assessmentSectionId]) && isset($extra[self::VAR_CAT][$assessmentSectionId][$key])) {
            unset($extra[self::VAR_CAT][$assessmentSectionId][$key]); 
        }
        
        $this->saveExtra($testSessionId, $extra);
    }
}
