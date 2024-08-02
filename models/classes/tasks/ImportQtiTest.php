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
 * Copyright (c) 2016-2024 (original work) Open Assessment Technologies SA;
 */

namespace oat\taoQtiTest\models\tasks;

use common_exception_Error;
use common_exception_MissingParameter;
use common_ext_ExtensionException;
use common_report_Report;
use oat\oatbox\service\exception\InvalidServiceManagerException;
use oat\oatbox\task\AbstractTaskAction;
use oat\oatbox\service\ServiceManager;
use oat\tao\model\import\ImporterNotFound;
use oat\tao\model\import\ImportersService;
use oat\tao\model\TaoOntology;
use oat\tao\model\taskQueue\QueueDispatcherInterface;
use oat\tao\model\taskQueue\Task\TaskInterface;
use oat\taoQtiTest\models\render\QtiPackageImportPreprocessing;
use oat\taoQtiTest\models\import\QtiTestImporter;

/**
 * Class ImportQtiTest
 * @package oat\taoQtiTest\models\tasks
 * @author Aleh Hutnikau, <hutnikau@1pt.com>
 */
class ImportQtiTest extends AbstractTaskAction implements \JsonSerializable
{
    public const FILE_DIR = 'ImportQtiTestTask';
    public const PARAM_CLASS_URI = 'class_uri';
    public const PARAM_FILE = 'file';
    public const PARAM_ENABLE_GUARDIANS = 'enable_guardians';
    public const PARAM_ENABLE_VALIDATORS = 'enable_validators';
    public const PARAM_ITEM_MUST_EXIST = 'item_must_exist';
    public const PARAM_ITEM_MUST_BE_OVERWRITTEN = 'item_must_be_overwritten';
    public const PARAM_ITEM_CLASS_URI = 'item_class_uri';
    public const PARAM_OVERWRITE_TEST_URI = 'overwrite_test_uri';

    protected $service;

    /**
     * @param $params
     * @return common_report_Report
     * @throws common_exception_Error
     * @throws common_exception_MissingParameter
     * @throws common_ext_ExtensionException
     * @throws InvalidServiceManagerException
     * @throws ImporterNotFound
     */
    public function __invoke($params)
    {
        if (!isset($params[self::PARAM_FILE])) {
            throw new common_exception_MissingParameter(
                'Missing parameter `' . self::PARAM_FILE . '` in ' . self::class
            );
        }

        \common_ext_ExtensionsManager::singleton()->getExtensionById('taoQtiTest');

        $file = $this->getFileReferenceSerializer()->unserializeFile($params['file']);

        /** @var ImportersService $importersService */
        $importersService = $this->getServiceManager()->get(ImportersService::SERVICE_ID);

        /** @var QtiTestImporter $importer */
        $importer = $importersService->getImporter(QtiTestImporter::IMPORTER_ID);

        $report = $importer->import(
            $file,
            $this->getClass($params),
            $params[self::PARAM_ENABLE_GUARDIANS] ?? true,
            $params[self::PARAM_ENABLE_VALIDATORS] ?? true,
            $params[self::PARAM_ITEM_MUST_EXIST] ?? false,
            $params[self::PARAM_ITEM_MUST_BE_OVERWRITTEN] ?? false,
            $params[self::PARAM_OVERWRITE_TEST_URI] ?? null,
            $params[self::PARAM_ITEM_CLASS_URI] ?? false
        );

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
     * Create task in queue
     * @param array $packageFile uploaded file
     * @param \core_kernel_classes_Class $class uploaded file
     * @param bool $enableGuardians Flag that marks use or not metadata guardians during the import.
     * @param bool $enableValidators Flag that marks use or not metadata validators during the import.
     * @param bool $itemMustExist Flag to indicate that all items must exist in database (via metadata guardians) to
     *                            make the test import successful.
     * @param bool $itemMustBeOverwritten Flag to indicate that items found by metadata guardians will be overwritten.
     * @return TaskInterface
     */
    public static function createTask(
        $packageFile,
        \core_kernel_classes_Class $class,
        $enableGuardians = true,
        $enableValidators = true,
        $itemMustExist = false,
        $itemMustBeOverwritten = false,
        ?string $overwriteTestUri = null,
        ?string $itemClassUri = null
    ) {
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
                self::PARAM_ITEM_MUST_BE_OVERWRITTEN => $itemMustBeOverwritten,
                self::PARAM_OVERWRITE_TEST_URI => $overwriteTestUri,
                self::PARAM_ITEM_CLASS_URI => $itemClassUri,
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
