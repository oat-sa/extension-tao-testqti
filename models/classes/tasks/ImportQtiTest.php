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
 * Copyright (c) 2016 (original work) Open Assessment Technologies SA;
 *
 *
 */

namespace oat\taoQtiTest\models\tasks;

use oat\oatbox\action\Action;
use oat\oatbox\service\ServiceManager;
use oat\oatbox\task\Queue;
use oat\oatbox\task\Task;
use oat\oatbox\filesystem\FileSystemService;
use oat\generis\model\fileReference\ResourceFileSerializer;

/**
 * Class ImportQtiTest
 * @package oat\taoQtiTest\models\tasks
 * @author Aleh Hutnikau, <hutnikau@1pt.com>
 */
class ImportQtiTest implements Action, \JsonSerializable
{
    const FILE_DIR = 'ImportQtiTestTask';

    protected $service;

    /**
     * @param $params
     * @throws \common_exception_MissingParameter
     */
    public function __invoke($params)
    {
        if (!isset($params['file'])) {
            throw new \common_exception_MissingParameter('Missing parameter `file` in ' . self::class);
        }
        \common_ext_ExtensionsManager::singleton()->getExtensionById('taoQtiTest');

        $this->service = \taoQtiTest_models_classes_CrudQtiTestsService::singleton();
        $file = $this->getFileReferenceSerializer()->unserializeFile($params['file']);

        $report = $this->service->importQtiTest($file);
        return $report;
    }

    /**
     * @return string
     */
    public function jsonSerialize()
    {
        return __CLASS__;
    }

    /**
     * ImportQtiTest constructor.
     * @param array $packageFile uploaded file
     * @return Task created task id
     */
    public static function createTask($packageFile)
    {
        $serviceManager = ServiceManager::getServiceManager();
        $action = new self();

        $filename = $action->getUniqueFilename($packageFile['name']);

        /** @var \oat\oatbox\filesystem\Directory $dir */
        $dir = $serviceManager->get(FileSystemService::SERVICE_ID)
            ->getDirectory(Queue::FILE_SYSTEM_ID);
        /** @var \oat\oatbox\filesystem\FileSystem $filesystem */
        $filesystem = $dir->getFileSystem();

        $stream = fopen($packageFile['tmp_name'], 'r+');
        $filesystem->writeStream($filename, $stream);
        fclose($stream);

        $file = $dir->getFile($filename);
        $fileUri = $action->getFileReferenceSerializer()->serialize($file);

        $queue = ServiceManager::getServiceManager()->get(Queue::CONFIG_ID);
        $task = $queue->createTask($action, ['file' => $fileUri]);
        return $task;
    }

    /**
     * Create a new unique filename based on an existing filename
     *
     * @param string $fileName
     * @return string
     */
    protected function getUniqueFilename($fileName)
    {
        $value = uniqid(md5($fileName));
        $ext = pathinfo($fileName, PATHINFO_EXTENSION);
        if (!empty($ext)){
            $value .= '.' . $ext;
        }
        return self::FILE_DIR . '/' . $value;
    }

    /**
     * Get serializer to persist filesystem object
     * @return ResourceFileSerializer
     */
    protected function getFileReferenceSerializer()
    {
        $serviceManager = ServiceManager::getServiceManager();
        return $serviceManager->get(ResourceFileSerializer::SERVICE_ID);
    }
}