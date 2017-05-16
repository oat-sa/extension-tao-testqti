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

use function FastRoute\TestFixtures\empty_options_cached;
use oat\oatbox\task\AbstractTaskAction;
use oat\oatbox\service\ServiceManager;
use oat\oatbox\task\Queue;
use oat\oatbox\task\Task;
use oat\tao\model\import\ImportersService;
use \oat\taoQtiTest\models\import\QtiTestImporter;
/**
 * Class ImportQtiTest
 * @package oat\taoQtiTest\models\tasks
 * @author Aleh Hutnikau, <hutnikau@1pt.com>
 */
class ImportQtiTest extends AbstractTaskAction implements \JsonSerializable
{
    const FILE_DIR = 'ImportQtiTestTask';

    protected $service;

    /**
     * @param $params
     * @throws \common_exception_MissingParameter
     * @return \common_report_Report
     */
    public function __invoke($params)
    {
        if (!isset($params['file'])) {
            throw new \common_exception_MissingParameter('Missing parameter `file` in ' . self::class);
        }
        \common_ext_ExtensionsManager::singleton()->getExtensionById('taoQtiTest');

        $file = $this->getFileReferenceSerializer()->unserializeFile($params['file']);
        /** @var ImportersService $importersService */
        $importersService = $this->getServiceManager()->get(ImportersService::SERVICE_ID);
        $importer = $importersService->getImporter(QtiTestImporter::IMPORTER_ID);

        $class = null;
        if (isset($params['class'])) {
            $class = new \core_kernel_classes_Class($params['class']);
        }

        /** @var \common_report_Report $report */
        $report = $importer->import($file, $class);

        if (isset($params['resource']) && !empty($params['resource'])) {
            if ($report->getType() === \common_report_Report::TYPE_SUCCESS) {
                $testResourcePlaceholder = new \core_kernel_classes_Resource($params['resource']);
                $testResourcePlaceholder->delete(true);
            } else {
                $taskResources = self::getTaskClass()->searchInstances([
                    Task::PROPERTY_LINKED_RESOURCE => $params['resource']
                ]);
                foreach ($taskResources as $taskResource) {
                    $taskResource->setPropertyValue(
                        new \core_kernel_classes_Property(Task::PROPERTY_REPORT),
                        json_encode($report)
                    );
                }
            }
        }

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
     * @return Task created task id
     */
    public static function createTask($packageFile, \core_kernel_classes_Class $class = null)
    {
        if ($class === null) {
            $class = new \core_kernel_classes_Class(TAO_TEST_CLASS);
        }
        $testResource = \taoQtiTest_models_classes_QtiTestService::singleton()->createInstance($class);
        $action = new self();
        $action->setServiceLocator(ServiceManager::getServiceManager());

        $fileUri = $action->saveFile($packageFile['tmp_name'], $packageFile['name']);
        $queue = ServiceManager::getServiceManager()->get(Queue::SERVICE_ID);

        $task = $queue->createTask($action, [
            'file' => $fileUri,
            'class' => $class->getUri(),
            'resource' => $testResource->getUri()
        ]);
        $taskResource = self::getTaskClass()->createInstance('', '', $task->getId());

        $taskResource->setPropertyValue(
            new \core_kernel_classes_Property(Task::PROPERTY_LINKED_RESOURCE),
            $testResource->getUri()
        );

        return $task;
    }

}