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

namespace oat\taoQtiTest\models\runner;

use oat\oatbox\service\ServiceManagerAwareInterface;
use oat\oatbox\service\ServiceManagerAwareTrait;
use oat\taoDelivery\model\execution\Delete\DeliveryExecutionDelete;
use oat\taoDelivery\model\execution\Delete\DeliveryExecutionDeleteRequest;

/**
 * Manage the flagged items
 */
class ExtendedState implements ServiceManagerAwareInterface, DeliveryExecutionDelete
{
    use ServiceManagerAwareTrait;
    
    const STORAGE_PREFIX = 'extra_';
    const VAR_REVIEW = 'review';
    const VAR_STORE_ID = 'client_store_id';
    const VAR_EVENTS_QUEUE = 'events_queue';
    const VAR_CAT = 'cat';
    const VAR_HREF_INDEX = 'item_href_index';

    /**
     * @var string
     */
    protected $testSessionId;

    /**
     * @var string
     */
    protected $userId;

    /**
     * @var array
     */
    protected $state = [];

    /**
     * @var StorageManager
     */
    protected $storage;

    /**
     * ExtendedState constructor.
     * @param string $testSessionId
     * @param string $userId
     */
    public function __construct($testSessionId = '', $userId = '')
    {
        $this->setTestSessionId($testSessionId);
        $this->setUserId($userId);
    }

    /**
     * @return string
     */
    public function getTestSessionId()
    {
        return $this->testSessionId;
    }

    /**
     * @param string $testSessionId
     * @return ExtendedState
     */
    public function setTestSessionId($testSessionId)
    {
        $this->testSessionId = $testSessionId;
        return $this;
    }

    /**
     * @return string
     */
    public function getUserId()
    {
        return $this->userId;
    }

    /**
     * @param string $userId
     * @return ExtendedState
     */
    public function setUserId($userId)
    {
        $this->userId = $userId;
        return $this;
    }
    
    /**
     * Gets the StorageManager service
     * @return StorageManager
     */
    public function getStorage()
    {
        if (!$this->storage) {
            $this->storage = $this->getServiceLocator()->get(StorageManager::SERVICE_ID);
        }
        return $this->storage;
    }

    /**
     * Sets the StorageManager service
     * @param StorageManager $storage
     * @return ExtendedState
     */
    public function setStorage($storage)
    {
        $this->storage = $storage;
        return $this;
    }

    /**
     * Gets the storage key based on the provided Test Session Id.
     * @param string $testSessionId
     * @return string
     */
    public static function getStorageKeyFromTestSessionId($testSessionId)
    {
        return self::STORAGE_PREFIX . $testSessionId;
    }

    /**
     * Gets the storage key based on the nested Test Session Id.
     * @return string
     */
    public function getStorageKey()
    {
        return self::getStorageKeyFromTestSessionId($this->testSessionId);
    }

    /**
     * Loads the extended state from the storage
     * @return bool
     */
    public function load()
    {
        $storage = $this->getStorage();
        if ($storage) {
            $data = $storage->get($this->userId, $this->getStorageKey());
            if ($data) {
                $this->state = json_decode($data, true);
            } else {
                $this->state = [];
            }
            $success = is_array($this->state);
        } else {
            $success = false;    
        }
        return $success;
    }

    /**
     * Saves the extended state into the storage
     * @return bool
     */
    public function save()
    {
        $storage = $this->getStorage();
        if ($storage) {
            $success = $storage->set($this->userId, $this->getStorageKey(), json_encode($this->state));
        } else {
            $success = false;
        }
        return $success;
    }

    /**
     * Set the marked for review state of an item
     * @param string $itemRef
     * @param bool $flag
     * @return ExtendedState
     */
    public function setItemFlag($itemRef, $flag)
    {
        $this->state[self::VAR_REVIEW][$itemRef] = $flag;
        return $this;
    }

    /**
     * Gets the marked for review state of an item
     * @param string $itemRef
     * @return bool
     */
    public function getItemFlag($itemRef)
    {
        return isset($this->state[self::VAR_REVIEW]) && isset($this->state[self::VAR_REVIEW][$itemRef])
            ? $this->state[self::VAR_REVIEW][$itemRef]
            : false;
    }

    /**
     * Sets the name of the client store used for the timer
     * @param string $storeId
     * @return ExtendedState
     */
    public function setStoreId($storeId)
    {
        $this->state[self::VAR_STORE_ID] = $storeId;
        return $this;
    }

    /**
     * Gets the name of the client store used for the timer
     * @return bool
     */
    public function getStoreId()
    {
        return isset($this->state[self::VAR_STORE_ID]) ? $this->state[self::VAR_STORE_ID] : false;
    }

    /**
     * Add an event on top of the queue
     * @param string $eventName
     * @param mixed $data
     * @return string
     * @throws \common_Exception
     */
    public function addEvent($eventName, $data = null)
    {
        $eventId = uniqid('event', true);
        $this->state[self::VAR_EVENTS_QUEUE][$eventId] = [
            'id' => $eventId,
            'timestamp' => microtime(true),
            'user' => \common_session_SessionManager::getSession()->getUserUri(),
            'type' => $eventName,
            'data' => $data,
        ];
        return $eventId;
    }

    /**
     * Gets all events from the queue
     * @return array
     */
    public function getEvents()
    {
        if (isset($this->state[self::VAR_EVENTS_QUEUE])) {
            $events = $this->state[self::VAR_EVENTS_QUEUE];
        } else {
            $events = [];
        }
        return $events;
    }

    /**
     * Removes particular events from the queue
     * @param array $ids
     * @return bool
     */
    public function removeEvents($ids = [])
    {
        $removed = false;
        if (isset($this->state[self::VAR_EVENTS_QUEUE])) {
            foreach ($ids as $id) {
                if (isset($this->state[self::VAR_EVENTS_QUEUE][$id])) {
                    unset($this->state[self::VAR_EVENTS_QUEUE][$id]);
                    $removed = true;
                }
            }
        }
        return $removed;
    }

    /**
     * Removes all events from the queue
     * @return ExtendedState
     */
    public function clearEvents()
    {
        $this->state[self::VAR_EVENTS_QUEUE] = [];
        return $this;
    }

    /**
     * Stores the table that maps the items identifiers to item reference
     * Fallback index in case of the delivery was compiled without the index of item href
     * @param array $table
     * @return ExtendedState
     */
    public function setItemHrefIndex($table)
    {
        $this->state[self::VAR_HREF_INDEX] = $table;
        return $this;
    }

    /**
     * Loads the table that maps the items identifiers to item reference
     * Fallback index in case of the delivery was compiled without the index of item href
     * @return array
     */
    public function getItemHrefIndex()
    {
        if (isset($this->state[self::VAR_HREF_INDEX])) {
            $table = $this->state[self::VAR_HREF_INDEX];
        } else {
            $table = [];
        }
        return $table;
    }

    /**
     * Sets a CAT value in the Extended State.
     * @param string $assessmentSectionId
     * @param string $key
     * @param string $value
     * @return ExtendedState
     */
    public function setCatValue($assessmentSectionId, $key, $value)
    {
        $this->state[self::VAR_CAT][$assessmentSectionId][$key] = $value;
        return $this;
    }

    /**
     * Gets a CAT value from the Extended State.
     * @param string $assessmentSectionId
     * @param string $key
     * @return string
     */
    public function getCatValue($assessmentSectionId, $key)
    {
        return (isset($this->state[self::VAR_CAT]) && isset($this->state[self::VAR_CAT][$assessmentSectionId]) && isset($this->state[self::VAR_CAT][$assessmentSectionId][$key])) ? $this->state[self::VAR_CAT][$assessmentSectionId][$key] : null;
    }

    /**
     * Removes a CAT value from the ExtendedState.
     * @param string $assessmentSectionId
     * @param string $key
     * @return ExtendedState
     */
    public function removeCatValue($assessmentSectionId, $key)
    {
        if (isset($this->state[self::VAR_CAT]) && isset($this->state[self::VAR_CAT][$assessmentSectionId]) && isset($this->state[self::VAR_CAT][$assessmentSectionId][$key])) {
            unset($this->state[self::VAR_CAT][$assessmentSectionId][$key]);
        }
        return $this;
    }

    /**
     * @inheritdoc
     */
    public function deleteDeliveryExecutionData(DeliveryExecutionDeleteRequest $request)
    {
        $storage = $this->getStorage();
        if ($storage) {
            return $storage->del($this->userId, $this->getStorageKey());
        }

        return false;
    }
}
