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
     * @param string $key
     * @return mixed
     * @throws \common_Exception
     */
    protected function load($testSessionId, $key = '')
    {
        $storageKey = self::getStorageKeyFromTestSessionId($testSessionId, $key);
        if (!isset($this->cache[$storageKey])) {
            $sessionUri = $this->getSessionUserUri($testSessionId);
            $data = $this->getStorageService()->get($sessionUri, $storageKey);

            if (is_null($data) && $key) {
                $data = json_decode($this->getStorageService()->get($sessionUri, self::getStorageKeyFromTestSessionId($testSessionId)), true);
                if ($data && isset($data[$key])) {
                    $this->cache[$storageKey] = $data[$key];
                } else {
                    $this->cache[$storageKey] = null;
                }
            } else {
                $this->cache[$storageKey] = json_decode($data, true);
            }
        }
        return $this->cache[$storageKey];
    }

    /**
     * Stores extended state information
     * @param string $testSessionId
     * @param mixed $data
     * @param string $key
     * @throws \common_exception_Error
     */
    protected function save($testSessionId, $data, $key = '')
    {
        $storageKey = self::getStorageKeyFromTestSessionId($testSessionId, $key);
        $this->cache[$storageKey] = $data;
        $this->getStorageService()->set($this->getSessionUserUri($testSessionId), $storageKey, json_encode($data));
    }

    /**
     * Storage Key from Test Session Id
     *
     * Returns the Storage Key corresponding to a given $testSessionId
     *
     * @param string $testSessionId
     * @param string $key
     * @return string
     */
    public static function getStorageKeyFromTestSessionId($testSessionId, $key = '')
    {
        return self::STORAGE_PREFIX . $key . $testSessionId;
    }

    /**
     * Set the marked for review state of an item
     * @param string $testSessionId
     * @param string $itemRef
     * @param boolean $flag
     * @throws \common_Exception
     * @throws \common_exception_Error
     */
    public function setItemFlag($testSessionId, $itemRef, $flag)
    {
        $flags = $this->load($testSessionId, self::VAR_REVIEW);
        $flags[$itemRef] = $flag;
        $this->save($testSessionId, $flags, self::VAR_REVIEW);
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
        $flags = $this->load($testSessionId, self::VAR_REVIEW);
        return isset($flags[$itemRef]) ? $flags[$itemRef] : false;
    }

    /**
     * @param string $testSessionId
     * @param string $storeId
     * @throws \common_exception_Error
     * @throws \common_Exception
     * @throws \common_exception_Error
     */
    public function setStoreId($testSessionId, $storeId)
    {
        $data = $this->load($testSessionId);
        $data[self::VAR_STORE_ID] = $storeId;
        $this->save($testSessionId, $data);
    }

    /**
     * @param string $testSessionId
     * @return bool
     * @throws \common_Exception
     */
    public function getStoreId($testSessionId)
    {
        $data = $this->load($testSessionId);
        return isset($data[self::VAR_STORE_ID]) ? $data[self::VAR_STORE_ID] : false;
    }

    /**
     * Add an event on top of the queue
     * @param string $testSessionId
     * @param string $eventName
     * @param mixed $data
     * @return string
     * @throws \common_Exception
     * @throws \common_exception_Error
     */
    public function addEvent($testSessionId, $eventName, $data = null)
    {
        $eventId = uniqid('event', true);
        $events = $this->load($testSessionId, self::VAR_EVENTS_QUEUE);
        $events[$eventId] = [
            'id' => $eventId,
            'timestamp' => microtime(true),
            'user' => \common_session_SessionManager::getSession()->getUserUri(),
            'type' => $eventName,
            'data' => $data,
        ];
        $this->save($testSessionId, $events, self::VAR_EVENTS_QUEUE);
        return $eventId;
    }

    /**
     * Gets all events from the queue
     * @param string $testSessionId
     * @return array
     * @throws \common_Exception
     */
    public function getEvents($testSessionId)
    {
        $events = $this->load($testSessionId, self::VAR_EVENTS_QUEUE);
        if (!$events) {
            $events = [];
        }
        return $events;
    }

    /**
     * Removes particular events from the queue
     * @param string $testSessionId
     * @param array $ids
     * @throws \common_Exception
     * @throws \common_exception_Error
     */
    public function removeEvents($testSessionId, $ids = [])
    {
        $events = $this->load($testSessionId, self::VAR_EVENTS_QUEUE);
        if ($events) {
            foreach ($ids as $id) {
                if (isset($events[$id])) {
                    unset($events[$id]);
                }
            }
        }
        $this->save($testSessionId, $events, self::VAR_EVENTS_QUEUE);
    }

    /**
     * Removes all events from the queue
     * @param string $testSessionId
     * @throws \common_exception_Error
     */
    public function clearEvents($testSessionId)
    {
        $this->save($testSessionId, [], self::VAR_EVENTS_QUEUE);
    }

    /**
     * Stores the table that maps the items identifiers to item reference
     * Fallback index in case of the delivery was compiled without the index of item href
     * @param string $testSessionId
     * @param array $table
     * @throws \common_exception_Error
     */
    public function storeItemHrefIndex($testSessionId, $table)
    {
        $this->save($testSessionId, $table, self::VAR_HREF_INDEX);
    }

    /**
     * Loads the table that maps the items identifiers to item reference
     * Fallback index in case of the delivery was compiled without the index of item href
     * @param string $testSessionId
     * @return array
     * @throws \common_Exception
     */
    public function loadItemHrefIndex($testSessionId)
    {
        $index = $this->load($testSessionId, self::VAR_HREF_INDEX);
        if (!$index) {
            $index = [];
        }
        return $index;
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
     * @throws \common_exception_Error
     */
    public function setCatValue($testSessionId, $assessmentSectionId, $key, $value)
    {
        $data = $this->load($testSessionId, self::VAR_CAT);
        $data[$assessmentSectionId][$key] = $value;
        $this->save($testSessionId, $data, self::VAR_CAT);
    }

    /**
     * Get a CAT Value
     *
     * Get a CAT value from the Extended State.
     *
     * @param string $testSessionId
     * @param string $assessmentSectionId
     * @param string $key
     * @return mixed
     * @throws \common_Exception
     */
    public function getCatValue($testSessionId, $assessmentSectionId, $key)
    {
        $data = $this->load($testSessionId, self::VAR_CAT);
        return ($data && isset($data[$assessmentSectionId]) && isset($data[$assessmentSectionId][$key])) ? $data[$assessmentSectionId][$key] : null;
    }

    /**
     * Remove a CAT value from the ExtendedState.
     *
     * @param string $testSessionId
     * @param string $assessmentSectionId
     * @param string $key
     * @throws \common_Exception
     * @throws \common_exception_Error
     */
    public function removeCatValue($testSessionId, $assessmentSectionId, $key)
    {
        $data = $this->load($testSessionId, self::VAR_CAT);
        if ($data && isset($data[$assessmentSectionId]) && isset($data[$assessmentSectionId][$key])) {
            unset($data[$assessmentSectionId][$key]);
        }

        $this->save($testSessionId, $data, self::VAR_CAT);
    }
}
