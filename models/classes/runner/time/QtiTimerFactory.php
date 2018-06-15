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

namespace oat\taoQtiTest\models\runner\time;

use oat\oatbox\service\ConfigurableService;
use oat\taoDelivery\model\execution\Delete\DeliveryExecutionDelete;
use oat\taoDelivery\model\execution\Delete\DeliveryExecutionDeleteRequest;
use oat\taoQtiTest\models\runner\StorageManager;
use oat\taoQtiTest\models\runner\time\storageFormat\QtiTimeStorageJsonFormat;
use oat\taoTests\models\runner\time\Timer;
use oat\taoTests\models\runner\time\TimeStorage;

/**
 * Class QtiTimerFactory
 * @package oat\taoQtiTest\models\runner\time
 * @author Jean-Sébastien Conan <jean-sebastien@taotesting.com>
 */
class QtiTimerFactory extends ConfigurableService implements DeliveryExecutionDelete
{
    const SERVICE_ID = 'taoQtiTest/QtiTimerFactory';
    
    const OPTION_TIMER_CLASS = 'timer-class';
    const OPTION_STORAGE_CLASS = 'storage-class';
    const OPTION_STORAGE_FORMAT_CLASS = 'storage-format';

    /**
     * @return string
     */
    public function getTimerClass()
    {
        $timerClass = $this->getOption(self::OPTION_TIMER_CLASS);
        if (!$timerClass) {
            $timerClass = QtiTimer::class;
        }
        return $timerClass;
    }

    /**
     * @return string
     */
    public function getStorageClass()
    {
        $storageClass = $this->getOption(self::OPTION_STORAGE_CLASS);
        if (!$storageClass) {
            $storageClass = QtiTimeStorage::class;
        }
        return $storageClass;
    }

    /**
     * @return string
     */
    public function getStorageFormatClass()
    {
        $storageFormat = $this->getOption(self::OPTION_STORAGE_FORMAT_CLASS);
        if (!$storageFormat) {
            $storageFormat = QtiTimeStorageJsonFormat::class;
        }
        return $storageFormat;
    }

    /**
     * @param string $testSessionId
     * @param string $userUri
     * @return Timer
     * @throws \Exception
     */
    public function getTimer($testSessionId, $userUri)
    {
        /* @var TimeStorage $timerStorage */
        $storageClass = $this->getStorageClass();
        $timerStorage = new $storageClass($testSessionId, $userUri);
        $timerStorage->setStorageService($this->getServiceLocator()->get(StorageManager::SERVICE_ID));
        
        if ($timerStorage instanceof QtiTimeStorageFormatAware) {
            $storageFormatClass = $this->getStorageFormatClass();
            $timerStorage->setStorageFormat(new $storageFormatClass());
        }
        
        /* @var Timer $timer */
        $timerClass = $this->getTimerClass();
        $timer = new $timerClass();
        $timer->setStorage($timerStorage);
        $timer->load();
        
        return $timer;
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
        $timer = $this->getTimer($sessionId, $request->getDeliveryExecution()->getUserIdentifier());
        return $timer->delete();
    }
}
