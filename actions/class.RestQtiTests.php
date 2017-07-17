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
 */

use oat\taoQtiTest\models\tasks\ImportQtiTest;
use oat\oatbox\task\Task;
use oat\tao\model\TaskQueueActionTrait;

/**
 *
 * @author Absar Gilani & Rashid - PCG Team - {absar.gilani6@gmail.com}
 */
class taoQtiTest_actions_RestQtiTests extends \tao_actions_RestController
{
    use TaskQueueActionTrait {
        getTask as parentGetTask;
        getTaskData as traitGetTaskData;
    }

    const TASK_ID_PARAM = 'id';

    private static $accepted_types = array(
        'application/zip',
        'application/x-zip-compressed',
        'multipart/x-zip',
        'application/x-compressed'
    );

    public function index()
    {
        $this->returnFailure(new \common_exception_NotImplemented('This API does not support this call.'));
    }

    public function __construct()
    {
        parent::__construct();
        // The service that implements or inherits get/getAll/getRootClass ... for that particular type of resources
        $this->service = taoQtiTest_models_classes_CrudQtiTestsService::singleton();
    }

    /**
     * Import file entry point by using $this->service
     * Check POST method & get valid uploaded file
     */
    public function import()
    {
        try {
            $fileUploadName = "qtiPackage";
            if ($this->getRequestMethod() != Request::HTTP_POST) {
                throw new \common_exception_NotImplemented('Only post method is accepted to import Qti package.');
            }
            if (!tao_helpers_Http::hasUploadedFile($fileUploadName)) {
                throw new common_exception_RestApi(__('Missed test package file'));
            }
            $file = tao_helpers_Http::getUploadedFile($fileUploadName);
            $mimeType = tao_helpers_File::getMimeType($file['tmp_name']);
            if (!in_array($mimeType, self::$accepted_types)) {
                throw new \common_exception_RestApi(__('Wrong file mime type'));
            }
            $report = $this->service->importQtiTest($file['tmp_name'], $this->getTestClass());
            if ($report->getType() === common_report_Report::TYPE_SUCCESS) {
                $data = array();
                foreach ($report as $r) {
                    $values = $r->getData();
                    $testid = $values->rdfsResource->getUri();
                    foreach ($values->items as $item) {
                        $itemsid[] = $item->getUri();
                    }
                    $data[] = array(
                        'testId' => $testid,
                        'testItems' => $itemsid);
                }
                return $this->returnSuccess($data);
            } else {
                throw new \common_exception_RestApi($report->getMessage());
            }
        } catch (\common_exception_RestApi $e) {
            return $this->returnFailure($e);
        }
    }

    /**
     * Import test package through the task queue.
     * Check POST method & get valid uploaded file
     */
    public function importDeferred()
    {
        try {
            $fileUploadName = "qtiPackage";
            if ($this->getRequestMethod() != Request::HTTP_POST) {
                throw new \common_exception_NotImplemented('Only post method is accepted to import Qti package.');
            }
            if (!tao_helpers_Http::hasUploadedFile($fileUploadName)) {
                throw new common_exception_RestApi(__('Missed test package file'));
            }

            $file = tao_helpers_Http::getUploadedFile($fileUploadName);
            $mimeType = tao_helpers_File::getMimeType($file['tmp_name']);
            if (!in_array($mimeType, self::$accepted_types)) {
                throw new \common_exception_RestApi(__('Wrong file mime type'));
            }
            $task = ImportQtiTest::createTask($file, $this->getTestClass());
            $result = [
                'reference_id' => $task->getId()
            ];
            $report = $task->getReport();
            if (!empty($report)) {
                if ($report instanceof \common_report_Report) {
                    //serialize report to array
                    $report = json_encode($report);
                    $report = json_decode($report);
                }
                $result['report'] = $report;
            }
            return $this->returnSuccess($result);
        } catch (\common_exception_RestApi $e) {
            return $this->returnFailure($e);
        }
    }

    /**
     * Action to retrieve test import status from queue
     */
    public function getStatus()
    {
        try {
            if (!$this->hasRequestParameter(self::TASK_ID_PARAM)) {
                throw new \common_exception_MissingParameter(self::TASK_ID_PARAM, $this->getRequestURI());
            }
            $data = $this->getTaskData($this->getRequestParameter(self::TASK_ID_PARAM));
            $this->returnSuccess($data);
        } catch (\Exception $e) {
            $this->returnFailure($e);
        }
    }

    /**
     * Create a Test Class
     *
     * Label parameter is mandatory
     * If parent class parameter is an uri of valid test class, new class will be created under it
     * If not parent class parameter is provided, class will be created under root class
     * Comment parameter is not mandatory, used to describe new created class
     *
     * @return \core_kernel_classes_Class
     */
    public function createClass()
    {
        try {
            $class = $this->createSubClass(new \core_kernel_classes_Class(TAO_TEST_CLASS));

            $result = [
                'message' => __('Class successfully created.'),
                'class-uri' => $class->getUri(),
            ];

            $this->returnSuccess($result);
        } catch (\common_exception_ClassAlreadyExists $e) {
            $result = [
                'message' => $e->getMessage(),
                'class-uri' => $e->getClass()->getUri(),
            ];
            $this->returnSuccess($result);
        } catch (\Exception $e) {
            $this->returnFailure($e);
        }
    }

    /**
     * @param $taskId
     * @return array
     */
    protected function getTaskData($taskId)
    {
        $data = $this->traitGetTaskData($taskId);
        $task = $this->getTask($taskId);
        $report = \common_report_Report::jsonUnserialize($task->getReport());
        if ($report) {
            $plainReport = $this->getPlainReport($report);
            //the third report is report of import test
            if (isset($plainReport[2]) && isset($plainReport[2]->getData()['rdfsResource'])) {
                $data['testId'] = $plainReport[2]->getData()['rdfsResource']['uriResource'];
            }
        }

        return $data;
    }

    /**
     * @param Task $taskId
     * @return Task
     * @throws common_exception_BadRequest
     */
    protected function getTask($taskId)
    {
        $task = $this->parentGetTask($taskId);
        if ($task->getInvocable() !== 'oat\taoQtiTest\models\tasks\ImportQtiTest') {
            throw new \common_exception_BadRequest("Wrong task type");
        }
        return $task;
    }

    /**
     * @param Task $task
     * @return string
     */
    protected function getTaskStatus(Task $task)
    {
        $report = $task->getReport();
        if (in_array(
            $task->getStatus(),
            [Task::STATUS_CREATED, Task::STATUS_RUNNING, Task::STATUS_STARTED])
        ) {
            $result = 'In Progress';
        } else if ($report) {
            $report = \common_report_Report::jsonUnserialize($report);
            $plainReport = $this->getPlainReport($report);
            $success = true;
            foreach ($plainReport as $r) {
                $success = $success && $r->getType() != \common_report_Report::TYPE_ERROR;
            }
            $result = $success ? 'Success' : 'Failed';
        }
        return $result;
    }

    /**
     * @param Task $task
     * @return array
     */
    protected function getTaskReport(Task $task)
    {
        $report = \common_report_Report::jsonUnserialize($task->getReport());
        $result = [];
        if ($report) {
            $plainReport = $this->getPlainReport($report);
            foreach ($plainReport as $r) {
                $result[] = [
                    'type' => $r->getType(),
                    'message' => $r->getMessage(),
                ];
            }
        }
        return $result;
    }

    /**
     * Get class instance to import test
     * @throws \common_exception_RestApi
     * @return \core_kernel_classes_Class
     */
    private function getTestClass()
    {
        return $this->getClassFromRequest(new \core_kernel_classes_Class(TAO_TEST_CLASS));
    }
}
