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
    const SERVICE_ID = 'taoQtiTest/ExtendedState';
    
    const STORAGE_PREFIX = 'extra_';

    const VAR_REVIEW = 'review';
    const VAR_SECURITY_TIMESTAMP = 'security_timestamp';
    const VAR_SECURITY_TOKEN = 'security_token';
    const VAR_SESSION_TOKEN = 'session_token';
    const VAR_STORE_ID = 'client_store_id';

    private static $cache = null;

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
            $userUri = \common_session_SessionManager::getSession()->getUserUri();

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
        $userUri = \common_session_SessionManager::getSession()->getUserUri();

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

    /**
     * Gets the security token that validates the session.
     * It will be also stored into the PHP session to ensure the test execution is processed by the right test taker.
     * @param string $testSessionId
     * @return string
     * @throws \common_exception_InconsistentData
     */
    public function getSessionToken($testSessionId)
    {
        return $this->getValue($testSessionId, self::VAR_SESSION_TOKEN);
    }

    /**
     * Gets the current security token
     * @param string $testSessionId
     * @return string
     * @throws \common_exception_InconsistentData
     */
    public function getSecurityToken($testSessionId)
    {
        return $this->getValue($testSessionId, self::VAR_SECURITY_TOKEN);
    }

    /**
     * Gets the current security timestamp
     * @param string $testSessionId
     * @return int
     * @throws \common_exception_InconsistentData
     */
    public function getSecurityTimestamp($testSessionId)
    {
        return $this->getValue($testSessionId, self::VAR_SECURITY_TIMESTAMP);
    }

    /**
     * Sets the current security token
     * @param string $testSessionId
     * @param string $token
     * @throws \common_exception_InconsistentData
     */
    public function setSecurityToken($testSessionId, $token)
    {
        $extra = $this->getExtra($testSessionId);
        $extra[self::VAR_SECURITY_TOKEN] = (string)$token;
        $extra[self::VAR_SECURITY_TIMESTAMP] = time();
        $this->saveExtra($testSessionId, $extra);
    }

    /**
     * Resets the current security context
     * @param string $testSessionId
     * @throws \common_exception_InconsistentData
     */
    public function resetSecurity($testSessionId)
    {
        $extra = $this->getExtra($testSessionId);
        
        unset(
            $extra[self::VAR_SECURITY_TOKEN],
            $extra[self::VAR_SECURITY_TIMESTAMP]
        );
        
        $extra[self::VAR_SESSION_TOKEN] = uniqid('', true);
        
        $this->saveExtra($testSessionId, $extra);
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
}
