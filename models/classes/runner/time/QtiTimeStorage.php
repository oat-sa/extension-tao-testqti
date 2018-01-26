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
 * Copyright (c) 2016-2017 (original work) Open Assessment Technologies SA ;
 */

namespace oat\taoQtiTest\models\runner\time;

use oat\tao\model\state\StateStorage;
use oat\taoQtiTest\models\runner\StorageManager;
use oat\taoTests\models\runner\time\TimeStorage;

/**
 * Class QtiTimeStorage
 * @package oat\taoQtiTest\models\runner\time
 * @author Jean-Sébastien Conan <jean-sebastien.conan@taotesting.com>
 */
class QtiTimeStorage implements TimeStorage, QtiTimeStorageFormatAware
{
    use QtiTimeStorageFormatAwareTrait;
    
    /**
     * Prefix used to identify the data slot in the storage
     */
    const STORAGE_PREFIX = 'timer_';

    /**
     * Local cache used to maintain data in memory while the request is running
     * @var array
     */
    protected $cache = null;

    /**
     * The assessment test session identifier
     * @var string
     */
    protected $testSessionId;

    /**
     * The assessment test user identifier
     * @var string
     */
    protected $userId;
    
    /**
     * @var StateStorage
     */
    protected $storageService;

    /**
     * QtiTimeStorage constructor.
     * @param string $testSessionId
     * @param string $userId
     */
    public function __construct($testSessionId, $userId)
    {
        $this->testSessionId = $testSessionId;
        $this->userId = $userId;
    }

    /**
     * Gets the key identifying the storage for the provided user
     * @return string
     */
    protected function getStorageKey()
    {
        return self::getStorageKeyFromTestSessionId($this->testSessionId);
    }
    
    /**
     * Storage Key from Test Session Id
     * 
     * Returns the Storage Key corresponding to a fiven $testSessionId
     * 
     * @param string $testSessionId
     * @return string
     */
    public static function getStorageKeyFromTestSessionId($testSessionId)
    {
        return self::STORAGE_PREFIX . $testSessionId;
    }

    /**
     * Gets the user key to access the storage
     * @return string
     */
    protected function getUserKey()
    {
        return $this->userId;
    }

    /**
     * Gets the StateStorage service
     * @return StateStorage
     */
    public function getStorageService()
    {
        if (!$this->storageService) {
            $this->storageService = \tao_models_classes_service_StateStorage::singleton();
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
     * Stores the timer data
     * @param array $data
     * @return TimeStorage
     */
    public function store($data)
    {
        $this->cache[$this->testSessionId] = &$data;
        $encodedData = $this->getStorageFormat()->encode($data);
        
        $this->getStorageService()->set($this->getUserKey(), $this->getStorageKey(), $encodedData);
        \common_Logger::d(sprintf('QtiTimer: Stored %d bytes into state storage', strlen($encodedData)));

        return $this;
    }

    /**
     * Loads the timer data from the storage
     * @return array
     */
    public function load()
    {
        if (!isset($this->cache[$this->testSessionId])) {
            $encodedData = $this->getStorageService()->get($this->getUserKey(), $this->getStorageKey());
            \common_Logger::d(sprintf('QtiTimer: Loaded %d bytes from state storage', strlen($encodedData)));

            $this->cache[$this->testSessionId] = $this->getStorageFormat()->decode($encodedData);
        }

        return $this->cache[$this->testSessionId];
    }

    /**
     * @inheritdoc
     */
    public function delete()
    {
        $storage = $this->getStorageService();
        $result = $this->getStorageService()->del($this->getUserKey(), $this->getStorageKey());
        if ($storage instanceof StorageManager) {
            $result = $storage->persist($this->getUserKey());
        }
        return $result;
    }
}
