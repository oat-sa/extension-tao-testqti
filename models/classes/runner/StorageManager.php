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
 * Copyright (c) 2017 (original work) Open Assessment Technologies SA ;
 *
 */

namespace oat\taoQtiTest\models\runner;

use oat\oatbox\service\ConfigurableService;
use oat\tao\model\state\StateStorage;

/**
 * Class StorageManager
 * 
 * Manage the storage in order to centralize its access.
 * The reading of data can be done at any time, the first call will put the data in memory cache.
 * Each change will only update the cache, and mark it to be processed upon persisting.
 * The actual writing should be done once, at the end of the request, by invoking the `persist()` method.
 * 
 * @package oat\taoQtiTest\models\classes\runner
 * @author Jean-Sébastien Conan <jean-sebastien@taotesting.com>
 */
class StorageManager extends ConfigurableService
{
    const SERVICE_ID = 'taoQtiTest/StorageManager';

    /**
     * The data does not exist in the storage
     */
    const STATE_NOT_FOUND = -1;

    /**
     * The data is aligned with the storage
     */
    const STATE_ALIGNED = 0;

    /**
     * The data is pending write to the storage
     */
    const STATE_PENDING_WRITE = 1;

    /**
     * The data is pending delete from the storage
     */
    const STATE_PENDING_DELETE = 2;

    /**
     * Link to the actual storage adapter
     * @var StateStorage
     */
    protected $storage;

    /**
     * In memory cache for read/pending data
     * @var array
     */
    protected $cache = [];

    /**
     * Gets a key that will be used to cache data.
     *
     * @param string $userId
     * @param string $callId
     * @return string
     */
    protected function getCacheKey($userId, $callId)
    {
        return $userId . '/' . $callId;
    }

    /**
     * Puts data in the cache. Maintain the link to the userId/callId pair.
     * Also keep the dirty state that will be used when persisting the data to the actual storage.
     *
     * @param string $key
     * @param string $userId
     * @param string $callId
     * @param string $data
     * @param int $state
     */
    protected function putInCache($key, $userId, $callId, $data, $state = self::STATE_ALIGNED)
    {
        $this->cache[$key] = [
            'userId' => $userId,
            'callId' => $callId,
            'state' => $state,
            'data' => $data
        ];
    }

    /**
     * Checks if a dataset exists for the provided key.
     *
     * @param string $key
     * @return bool
     */
    protected function exists($key)
    {
        return isset($this->cache[$key]) && in_array($this->cache[$key]['state'], [self::STATE_ALIGNED, self::STATE_PENDING_WRITE]);
    }

    /**
     * Gets a dataset from the cache.
     *
     * @param string $key
     * @return mixed
     */
    protected function getFromCache($key)
    {
        if ($this->exists($key)) {
            return $this->cache[$key]['data'];
        }
        return null;
    }

    /**
     * Persists a cache entry and update its status.
     *
     * @param string $key
     * @return bool
     */
    protected function persistCacheEntry($key)
    {
        $success = true;
        if (isset($this->cache[$key])) {
            $cache = $this->cache[$key];

            switch ($cache['state']) {
                case self::STATE_PENDING_WRITE:
                    $success = $this->getStorage()->set($cache['userId'], $cache['callId'], $cache['data']);
                    if (!$success) {
                        throw new \common_exception_Error('Can\'t write into test runner state storage at '.static::class);
                    }
                    $this->cache[$key]['state'] = self::STATE_ALIGNED;
                    break;

                case self::STATE_PENDING_DELETE:
                    $success = $this->getStorage()->del($cache['userId'], $cache['callId']);
                    if ($success) {
                        unset($this->cache[$key]);
                    }
                    break;
            }
        }
        return $success;
    }

    /**
     * @return StateStorage
     */
    public function getStorage()
    {
        if (!$this->storage) {
            $this->storage = $this->getServiceLocator()->get(StateStorage::SERVICE_ID);
        }
        return $this->storage;
    }

    /**
     * @param StateStorage $storage
     * @return StorageManager
     */
    public function setStorage(StateStorage $storage)
    {
        $this->storage = $storage;
        return $this;
    }

    /**
     * Applies a dataset to be stored.
     *
     * @param string $userId
     * @param string $callId
     * @param string $data
     * @return boolean
     */
    public function set($userId, $callId, $data)
    {
        $key = $this->getCacheKey($userId, $callId);
        $cache = $this->getFromCache($key);
        if (is_null($cache) || $cache != $data) {
            $this->putInCache($key, $userId, $callId, $data, self::STATE_PENDING_WRITE);
        }
        return true;
    }

    /**
     * Gets a dataset from the store using the provided keys.
     * Will return null if the dataset doesn't exist.
     *
     * @param string $userId
     * @param string $callId
     * @return string
     */
    public function get($userId, $callId)
    {
        $key = $this->getCacheKey($userId, $callId);
        if (!isset($this->cache[$key])) {
            $data = $this->getStorage()->get($userId, $callId);
            $state = is_null($data) ? self::STATE_NOT_FOUND : self::STATE_ALIGNED;
            $this->putInCache($key, $userId, $callId, $data, $state);
        }

        return $this->getFromCache($key);
    }

    /**
     * Whenever or not a dataset exists.
     *
     * @param string $userId
     * @param string $callId
     * @return boolean
     */
    public function has($userId, $callId)
    {
        $key = $this->getCacheKey($userId, $callId);
        if (!isset($this->cache[$key])) {
            return $this->getStorage()->has($userId, $callId);
        }
        return $this->exists($key);
    }

    /**
     * Marks the the dataset to be removed from the storage.
     *
     * @param string $userId
     * @param string $callId
     * @return boolean
     */
    public function del($userId, $callId)
    {
        $key = $this->getCacheKey($userId, $callId);
        $this->putInCache($key, $userId, $callId, null, self::STATE_PENDING_DELETE);
        return true;
    }

    /**
     * Sends the changes to the storage.
     *
     * @param string $userId
     * @param string $callId
     * @return bool
     */
    public function persist($userId = null, $callId = null)
    {
        if ($userId && $callId) {
            $keys = [$this->getCacheKey($userId, $callId)];
        } else {
            $keys = array_keys($this->cache);
        }

        $success = true;
        foreach ($keys as $key) {
            if (!$this->persistCacheEntry($key)) {
                $success = false;
            }
        }
        return $success;
    }
}
