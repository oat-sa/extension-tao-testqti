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
 * Copyright (c) 2016-2018 (original work) Open Assessment Technologies SA;
 *
 *
 */

namespace oat\taoQtiTest\models\tasks;

use oat\oatbox\task\AbstractTaskAction;
use oat\oatbox\service\ServiceManager;
use oat\tao\model\import\ImportersService;
use oat\tao\model\TaoOntology;
use oat\tao\model\taskQueue\QueueDispatcherInterface;
use oat\tao\model\taskQueue\Task\TaskInterface;
use \oat\taoQtiTest\models\import\QtiTestImporter;

/**
 * Class ImportQtiTest
 * @package oat\taoQtiTest\models\tasks
 * @author Aleh Hutnikau, <hutnikau@1pt.com>
 */
class ImportQtiTest extends AbstractTaskAction implements \JsonSerializable
{
    const FILE_DIR = 'ImportQtiTestTask';
    const PARAM_CLASS_URI = 'class_uri';
    const PARAM_FILE = 'file';
    const PARAM_ENABLE_GUARDIANS = 'enable_guardians';
    const PARAM_ENABLE_VALIDATORS = 'enable_validators';
    const PARAM_ITEM_MUST_EXIST = 'item_must_exist';
    const PARAM_ITEM_MUST_BE_OVERWRITTEN = 'item_must_be_overwritten';

    protected $service;

    /**
     * @param $params
     * @throws \common_exception_MissingParameter
     * @return \common_report_Report
     */
    public function __invoke($params)
    {
        if (!isset($params[self::PARAM_FILE])) {
            throw new \common_exception_MissingParameter('Missing parameter `' . self::PARAM_FILE . '` in ' . self::class);
        }

        \common_ext_ExtensionsManager::singleton()->getExtensionById('taoQtiTest');

        $file = $this->getFileReferenceSerializer()->unserializeFile($params['file']);

        /** @var ImportersService $importersService */
        $importersService = $this->getServiceManager()->get(ImportersService::SERVICE_ID);

        /** @var QtiTestImporter $importer */
        $importer = $importersService->getImporter(QtiTestImporter::IMPORTER_ID);

        return $importer->import(
            $file,
            $this->getClass($params),
            isset($params[self::PARAM_ENABLE_GUARDIANS]) ? $params[self::PARAM_ENABLE_GUARDIANS] : true,
            isset($params[self::PARAM_ENABLE_VALIDATORS]) ? $params[self::PARAM_ENABLE_VALIDATORS] : true,
            isset($params[self::PARAM_ITEM_MUST_EXIST]) ? $params[self::PARAM_ITEM_MUST_EXIST] : false,
            isset($params[self::PARAM_ITEM_MUST_BE_OVERWRITTEN]) ? $params[self::PARAM_ITEM_MUST_BE_OVERWRITTEN] : false
        );
    }

    /**
     * @return string
     */
    public function jsonSerialize()
    {
        return __CLASS__;
    }

    /**
     * Create task in queue
     * @param array $packageFile uploaded file
     * @param \core_kernel_classes_Class $class uploaded file
     * @param bool $enableGuardians Flag that marks use or not metadata guardians during the import.
     * @param bool $enableValidators Flag that marks use or not metadata validators during the import.
     * @param bool $itemMustExist Flag to indicate that all items must exist in database (via metadata guardians) to make the test import successful.
     * @param bool $itemMustBeOverwritten Flag to indicate that items found by metadata guardians will be overwritten.
     * @return TaskInterface
     */
    public static function createTask($packageFile, \core_kernel_classes_Class $class, $enableGuardians = true, $enableValidators = true, $itemMustExist = false, $itemMustBeOverwritten = false)
    {
        $action = new self();
        $action->setServiceLocator(ServiceManager::getServiceManager());

        $fileUri = $action->saveFile($packageFile['tmp_name'], $packageFile['name']);

        /** @var QueueDispatcherInterface $queueDispatcher */
        $queueDispatcher = ServiceManager::getServiceManager()->get(QueueDispatcherInterface::SERVICE_ID);

        return $queueDispatcher->createTask(
            $action,
            [
                self::PARAM_FILE => $fileUri,
                self::PARAM_CLASS_URI => $class->getUri(),
                self::PARAM_ENABLE_GUARDIANS => $enableGuardians,
                self::PARAM_ENABLE_VALIDATORS => $enableValidators,
                self::PARAM_ITEM_MUST_EXIST => $itemMustExist,
                self::PARAM_ITEM_MUST_BE_OVERWRITTEN => $itemMustBeOverwritten

            ],
            __('Import QTI TEST into "%s"', $class->getLabel())
        );
    }

    /**
     * @param array $taskParams
     * @return \core_kernel_classes_Class
     */
    private function getClass(array $taskParams)
    {
        $class = null;
        if (isset($taskParams[self::PARAM_CLASS_URI])) {
            $class = new \core_kernel_classes_Class($taskParams[self::PARAM_CLASS_URI]);
        }
        if ($class === null || !$class->exists()) {
            $class = new \core_kernel_classes_Class(TaoOntology::CLASS_URI_TEST);
        }
        return $class;
    }
}
