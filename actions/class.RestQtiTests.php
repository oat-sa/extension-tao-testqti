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
use oat\tao\controller\api\TaskQueue as TaskQueueController;
use oat\oatbox\task\Task;

/**
 *
 * @author Absar Gilani & Rashid - PCG Team - {absar.gilani6@gmail.com}
 */
class taoQtiTest_actions_RestQtiTests extends TaskQueueController
{
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
    
    /**
     * Import file entry point by using $this->service
     * Check POST method & get valid uploaded file
     */
    public function import()
    {
        $fileUploadName = "qtiPackage";
        if ($this->getRequestMethod() != Request::HTTP_POST) {
            throw new \common_exception_NotImplemented('Only post method is accepted to import Qti package.');
        }
        if(tao_helpers_Http::hasUploadedFile($fileUploadName)) {
            $file = tao_helpers_Http::getUploadedFile($fileUploadName);
            $mimeType = tao_helpers_File::getMimeType($file['tmp_name']);
            if (!in_array($mimeType, self::$accepted_types)) {
                $this->returnFailure(new common_exception_BadRequest());
            } else {
                $task = ImportQtiTest::createTask($file);
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
            }
        } else {
            return $this->returnFailure(new common_exception_BadRequest());
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
     * @param Task $taskId
     * @return Task
     * @throws common_exception_BadRequest
     */
    protected function getTask($taskId)
    {
        $task =  parent::getTask($taskId);
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
        $plainReport = $this->getPlainReport($report);
        $result = [];
        foreach ($plainReport as $r) {
            $result[] = [
                'type' => $r->getType(),
                'message' => $r->getMessage(),
            ];
        }
        return $result;
    }

    /**
     * @param $report
     * @return array
     */
    private function getPlainReport($report)
    {
        $result = [];
        $result[] = $report;
        if ($report->hasChildren()) {
            foreach ($report as $r) {
                $result = array_merge($result, $this->getPlainReport($r));
            }
        }
        return $result;
    }
}
