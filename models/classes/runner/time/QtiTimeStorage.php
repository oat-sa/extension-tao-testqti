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
 * Copyright (c) 2016 (original work) Open Assessment Technologies SA ;
 */
/**
 * @author Jean-Sébastien Conan <jean-sebastien.conan@vesperiagroup.com>
 */

namespace oat\taoQtiTest\models\runner\time;

use oat\taoTests\models\runner\time\InvalidDataException;
use oat\taoTests\models\runner\time\TimeStorage;

/**
 * Class QtiTimeStorage
 * @package oat\taoQtiTest\models\runner\time
 */
class QtiTimeStorage implements TimeStorage
{
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
     * @throws \common_exception_Error
     */
    protected function getUserKey()
    {
        return $this->userId;
    }

    /**
     * Gets the StateStorage service
     * @return \tao_models_classes_service_StateStorage
     */
    protected function getStorageService()
    {
        return \tao_models_classes_service_StateStorage::singleton();
    }

    /**
     * Stores the timer data
     * @param string $data
     * @return TimeStorage
     * @throws InvalidDataException
     * @throws \common_exception_Error
     */
    public function store($data)
    {
        if (!is_string($data)) {
            throw new InvalidDataException('The timer data to store are not valid!');
        }

        $this->cache[$this->testSessionId] = $data;

        $this->getStorageService()->set($this->getUserKey(), $this->getStorageKey(), $data);

        return $this;
    }

    /**
     * Loads the timer data from the storage
     * @return string
     * @throws \common_exception_Error
     */
    public function load()
    {
        if (!isset($this->cache[$this->testSessionId])) {
            $this->cache[$this->testSessionId] = $this->getStorageService()->get($this->getUserKey(), $this->getStorageKey());
        }

        return $this->cache[$this->testSessionId];
    }
}
