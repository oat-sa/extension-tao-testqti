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
 * Copyright (c) 2014 (original work) Open Assessment Technologies SA (under the project TAO-PRODUCT);
 *
 */

namespace oat\taoQtiTest\models;

use oat\oatbox\service\ServiceManager;
use qtism\common\datatypes\File;
use qtism\common\datatypes\files\FileManager;
use qtism\common\datatypes\files\FileSystemFile;
use qtism\runtime\tests\AssessmentTestSession;

class StateStorageQtiFileManager implements FileManager
{
    /**
     * Service to store file variable
     * @var \tao_models_classes_service_StateStorage
     */
    protected $storageService;

    /**
     * Test session
     * @var Uri string
     */
    protected $testId;

    /**
     * User session
     * @var Uri string
     */
    protected $userId;

    public function __construct($testId, $userId)
    {
        $this->storageService = ServiceManager::getServiceManager()->get('tao/stateStorage');
        $this->testId = $testId;
        $this->userId = $userId;
    }

    public function createFromFile($path, $mimeType, $filename = '')
    {
        \common_Logger::i(__FUNCTION__);
    }

    public function createFromData($data, $mimeType, $filename = '')
    {
        $data = base64_encode($data);
        $key = $this->generateUniqKey($this->testId);
        \common_Logger::i($key);

        $this->storageService->set($this->userId, $key, $data);
        \common_Logger::e(base64_decode($this->storageService->get($this->userId, $key)));
        return new StateStorageQtiFile($key, $mimeType, $filename);
    }

    public function retrieve($identifier)
    {
        return new StateStorageQtiFile($identifier);
    }

    public function delete(File $file)
    {
        \common_Logger::i(__FUNCTION__);
    }

    protected function generateUniqKey($prefix='')
    {
        return md5(uniqid($prefix, true));
    }

}