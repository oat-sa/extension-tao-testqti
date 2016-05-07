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

use qtism\common\datatypes\File;
use qtism\common\datatypes\files\FileManager;
use qtism\common\datatypes\files\FileManagerException;
use qtism\common\datatypes\files\FileSystemFile;
use qtism\runtime\tests\AssessmentTestSession;
use Zend\ServiceManager\ServiceLocatorAwareInterface;
use Zend\ServiceManager\ServiceLocatorAwareTrait;

class StateStorageQtiFileManager implements FileManager, ServiceLocatorAwareInterface
{
    use ServiceLocatorAwareTrait;

    /**
     * Service to store file variable
     * @var \tao_models_classes_service_StateStorage
     */
    protected $storageService;

    /**
     * Test session
     * @var string
     */
    protected $testId;

    /**
     * User session
     * @var string
     */
    protected $userId;

    /**
     * StateStorageQtiFileManager constructor.
     * @param $testId
     * @param $userId
     */
    public function __construct($testId, $userId)
    {
        $this->testId = $testId;
        $this->userId = $userId;
    }

    /**
     * Get state storage, retrieve it if empty
     * @return array|object|\tao_models_classes_service_StateStorage
     */
    public function getStateStorage()
    {
        if (empty($this->storageService)) {
            $this->storageService = $this->getServiceLocator()->get('tao/stateStorage');
        }
        return $this->storageService;
    }

    /**
     * Set storage service
     * @param $storageService
     */
    public function setStateStorage($storageService)
    {
        $this->storageService = $storageService;
    }

    /**
     * Create a StateStorageQtiFile by storing data in key=>value persistence
     * Compact metadata at the begining of data string
     * @param $filename
     * @param $mimeType
     * @param $data
     * @return StateStorageQtiFile
     */
    protected function create($filename, $mimeType, $data)
    {
        $key = $this->generateUniqKey($this->testId);

        if ($filename=='') {
            $filename = $key;
        }

        $stateStorageFile = new StateStorageQtiFile($key, $mimeType, $filename, $data);
        $content = $stateStorageFile->toBinary();

        //State storage update
        if (!$this->getStateStorage()->set($this->userId, $key, $content)) {
            throw new \RuntimeException('Unable to store file in state storage system');
        }
        return $stateStorageFile;
    }

    /**
     * Return a StateStorageQtiFile from content of file located at $path
     * @todo Access file as stream
     * @todo Check mime type?
     * @param string $path
     * @param string $mimeType
     * @param string $filename
     * @return StateStorageQtiFile
     * @throws FileManagerException
     */
    public function createFromFile($path, $mimeType, $filename='')
    {
        try {
            if (!is_file($path)) {
                throw new \RuntimeException('Unable to find source file at "' . $path . '".');
            }

            if (!is_readable($path)) {
                throw new \RuntimeException('Source file "' . $path . '" found but not readable.');
            }

            $pathinfo = pathinfo($path);
            $filename = ($filename=='') ? $pathinfo['filename'] . '.' . $pathinfo['extension'] : $filename;
            $data = file_get_contents($path);

            return $this->create($filename, $mimeType, $data);
        } catch (\RuntimeException $e) {
            throw new FileManagerException('An error occured while creating a StateStorageQtiFile object', 0, $e);
        }
    }

    /**
     * Return a StateStorageQtiFile from $data
     * @param string $data
     * @param string $mimeType
     * @param string $filename
     * @return StateStorageQtiFile
     * @throws FileManagerException
     */
    public function createFromData($data, $mimeType, $filename='')
    {
        try {
            return $this->create($filename, $mimeType, $data);
        } catch (\RuntimeException $e) {
            throw new FileManagerException('An error occured while creating a StateStorageQtiFile object', 0, $e);
        }
    }

    /**
     * Create a StateStorageQtiFile with identifier
     * @todo delete reference into test state storage
     * @param string $identifier
     * @return StateStorageQtiFile
     */
    public function retrieve($identifier)
    {
        return new StateStorageQtiFile($identifier);
    }

    /**
     * Delete file in key=>value storage
     * @param File $file
     * @return bool
     */
    public function delete(File $file)
    {
        $key = $file->getIdentifier();
        if (!$this->getStateStorage()->del($this->userId, $key)) {
            throw new \RuntimeException('Unable to delete file in state storage system');
        }
        return true;
    }

    /**
     * Generate a key as identifier to track file in state storage
     * @param string $prefix
     * @return string
     */
    protected function generateUniqKey($prefix='')
    {
        return uniqid($prefix, true);
    }
}