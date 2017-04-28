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

    private static $cache = null;
    private static $deliveryExecutions = null;

    /**
     * @param string $testSessionId
     * @return string
     */
    protected function getSessionUserUri($testSessionId)
    {
        if (!isset(self::$deliveryExecutions[$testSessionId])) {
            self::$deliveryExecutions[$testSessionId] = \taoDelivery_models_classes_execution_ServiceProxy::singleton()->getDeliveryExecution($testSessionId);
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

            $data = $storageService->get($userUri, self::STORAGE_PREFIX.$testSessionId);
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

        $storageService->set($userUri, self::STORAGE_PREFIX.$testSessionId, json_encode($extra));
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

        if (isset($extra[self::VAR_EVENTS_QUEUE])) {
            foreach ($ids as $id) {
                if (isset($extra[self::VAR_EVENTS_QUEUE][$id])) {
                    unset($extra[self::VAR_EVENTS_QUEUE][$id]);
                }
            }
        }

        $this->saveExtra($testSessionId, $extra);
    }
    
    /**
     * Removes all events from the queue
     * @param $testSessionId
     */
    public function clearEvents($testSessionId)
    {
        $extra = $this->getExtra($testSessionId);

        $extra[self::VAR_EVENTS_QUEUE] = [];

        $this->saveExtra($testSessionId, $extra);
    }
}
