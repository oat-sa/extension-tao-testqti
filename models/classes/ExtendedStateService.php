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
use oat\taoDelivery\model\execution\ServiceProxy;
use oat\taoQtiTest\models\runner\StorageManager;

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

    protected $cache = null;
    protected $deliveryExecutions = null;

    /**
     * @var StateStorage
     */
    protected $storageService;

    /**
     * Gets the StateStorage service
     * @return StateStorage
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
     * Retrieves extended state information
     * @param string $testSessionId
     * @return array
     * @throws \common_Exception
     */
    protected function getExtra($testSessionId)
    {
        if (!isset($this->cache[$testSessionId])) {
            $userUri = $this->getSessionUserUri($testSessionId);
            $callId = self::getStorageKeyFromTestSessionId($testSessionId);
            $data = $this->getStorageService()->get($userUri, $callId);
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
            $this->cache[$testSessionId] = $data;
        }
        return $this->cache[$testSessionId];
    }

    /**
     * Stores extended state information
     * @param string $testSessionId
     * @param array $extra
     * @throws \common_Exception
     */
    protected function saveExtra($testSessionId, $extra)
    {
        $this->cache[$testSessionId] = $extra;
        $userUri = $this->getSessionUserUri($testSessionId);
        $callId = self::getStorageKeyFromTestSessionId($testSessionId);
        $this->getStorageService()->set($userUri, $callId, json_encode($extra));
    }

    /**
     * Persists the extended state
     * @param string $testSessionId
     * @throws \common_exception_Error
     */
    public function persist($testSessionId)
    {
        $userUri = $this->getSessionUserUri($testSessionId);
        $callId = self::getStorageKeyFromTestSessionId($testSessionId);
        $this->getStorageService()->persist($userUri, $callId);
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
        $extra = $this->getExtra($testSessionId);
        $extra[self::VAR_REVIEW][$itemRef] = $flag;

        $this->saveExtra($testSessionId, $extra);
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
        $extra = $this->getExtra($testSessionId);
        return isset($extra[self::VAR_REVIEW][$itemRef])
            ? $extra[self::VAR_REVIEW][$itemRef]
            : false;
    }

    /**
     * Sets the name of the client store used for the timer
     * @param string $testSessionId
     * @param string $storeId
     * @throws \common_Exception
     */
    public function setStoreId($testSessionId, $storeId)
    {
        $extra = $this->getExtra($testSessionId);
        $extra[self::VAR_STORE_ID] = $storeId;
        $this->saveExtra($testSessionId, $extra);
    }

    /**
     * Gets the name of the client store used for the timer
     * @param string $testSessionId
     * @return bool
     * @throws \common_Exception
     */
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
     * @throws \common_Exception
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
     * @throws \common_Exception
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
     * @throws \common_Exception
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
     * @throws \common_Exception
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
     * @throws \common_Exception
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
     * @throws \common_Exception
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
     * @throws \common_Exception
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
     * @param string $testSessionId
     * @param string $assessmentSectionId
     * @param string $key
     * @return string
     * @throws \common_Exception
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
     * @throws \common_Exception
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
