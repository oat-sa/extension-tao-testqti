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

use oat\tao\model\TaoOntology;
use oat\tao\model\taskQueue\TaskLog\Entity\EntityInterface;
use oat\tao\model\taskQueue\TaskLogInterface;
use oat\taoQtiTest\helpers\QtiPackageExporter;
use oat\taoQtiTest\models\tasks\ImportQtiTest;
use oat\taoQtiItem\controller\AbstractRestQti;
use core_kernel_classes_Resource as Resource;
use oat\taoTests\models\MissingTestmodelException;
use Slim\Http\StatusCode;

/**
 *
 * @author Absar Gilani & Rashid - PCG Team - <absar.gilani6@gmail.com>
 * @author Gyula Szucs <gyula@taotesting.com>
 */
class taoQtiTest_actions_RestQtiTests extends AbstractRestQti
{
    public const PARAM_PACKAGE_NAME = 'qtiPackage';

    private const PARAM_TEST_URI = 'testUri';

    private const ITEM_CLASS_URI = 'itemClassUri';

    /**
     * @deprecated Use taoQtiTest_actions_RestQtiTests::OVERWRITE_TEST_URI instead with the URI of the test to be
     *             replaced
     */
    private const OVERWRITE_TEST = 'overwriteTest';

    private const SUBCLASS_LABEL = 'subclassLabel';
    private const NEW_PACKAGE_LABEL = 'newPackageLabel';
    private const OVERWRITE_TEST_URI = 'overwriteTestUri';

    /**
     * @throws common_exception_NotImplemented
     */
    public function index()
    {
        $this->returnFailure(new \common_exception_NotImplemented('This API does not support this call.'));
    }

    /**
     * Method will return qti package encoded in base64 for delivery
     * @throws common_Exception
     * @throws common_exception_Error
     * @throws common_exception_NotImplemented
     */
    public function exportQtiPackage()
    {
        if ($this->getRequestMethod() !== Request::HTTP_GET) {
            throw new \common_exception_NotImplemented('Only post method is accepted to import Qti package.');
        }

        $params = $this->getPsrRequest()->getQueryParams();

        if (!isset($params[self::PARAM_TEST_URI]) || (!$testId = $params[self::PARAM_TEST_URI])) {
            return $this->returnFailure(new common_exception_MissingParameter());
        }

        $test = $this->getResource($testId);

        if (!$test->exists()) {
            return $this->returnFailure(new common_exception_ResourceNotFound('Resource not found'));
        }

        $exportReport = $this->getQtiPackageExporter()->exportDeliveryQtiPackage($test->getUri());

        $data[self::PARAM_PACKAGE_NAME] = base64_encode(file_get_contents($exportReport->getData()['path']));

        return $this->returnSuccess($data);
    }

    /**
     * Import file entry point by using $this->service
     * Check POST method & get valid uploaded file
     */
    public function import()
    {
        try {
            if ($this->getRequestMethod() != Request::HTTP_POST) {
                throw new \common_exception_NotImplemented('Only post method is accepted to import Qti package.');
            }

            $report = taoQtiTest_models_classes_CrudQtiTestsService::singleton()
                ->importQtiTest(
                    $this->getUploadedPackageData()['tmp_name'],
                    $this->getTestClass(),
                    $this->isMetadataGuardiansEnabled(),
                    $this->isMetadataValidatorsEnabled(),
                    $this->isItemMustExistEnabled(),
                    $this->isItemMustBeOverwrittenEnabled(),
                    $this->isOverwriteTest(),
                    $this->getItemClassUri(),
                    $this->getNewPackageLabel(),
                    $this->getOverwriteTestUri(),
                );

            if ($report->getType() === common_report_Report::TYPE_SUCCESS) {
                $data = [];
                foreach ($report as $r) {
                    $values = $r->getData();
                    $testid = $values->rdfsResource->getUri();
                    foreach ($values->items as $item) {
                        $itemsid[] = $item->getUri();
                    }
                    $data[] = [
                        'testId' => $testid,
                        'testItems' => $itemsid
                    ];
                }
                return $this->returnSuccess($data);
            } else {
                throw new common_exception_RestApi($report->getMessage());
            }
        } catch (common_exception_RestApi $e) {
            return $this->returnFailure($e);
        }
    }

    protected function getItemClassUri(): ?string
    {
        $itemClassUri = $this->getPostParameter(self::ITEM_CLASS_URI);
        $subclassLabel = $this->getSubclassLabel();

        if ($subclassLabel) {
            foreach ($this->getClass($itemClassUri)->getSubClasses() as $subclass) {
                if ($subclass === $subclassLabel) {
                    $itemClassUri = $subclass->getUri();
                }
            }
        }

        return $itemClassUri;
    }

    /**
     * @throws common_exception_RestApi
     */
    protected function isOverwriteTest(): bool
    {
        $isOverwriteTest = $this->getPostParameter(self::OVERWRITE_TEST);

        if (is_null($isOverwriteTest)) {
            return false;
        }

        if (!in_array($isOverwriteTest, ['true', 'false'])) {
            throw new \common_exception_RestApi(
                'isOverwriteTest parameter should be boolean (true or false).'
            );
        }

        return filter_var($isOverwriteTest, FILTER_VALIDATE_BOOLEAN);
    }

    /**
     * @inheritdoc
     */
    protected function getTaskName()
    {
        return ImportQtiTest::class;
    }

    /**
     * Import test package through the task queue.
     * Check POST method & get valid uploaded file
     */
    public function importDeferred()
    {
        try {
            if ($this->getRequestMethod() != Request::HTTP_POST) {
                throw new \common_exception_NotImplemented('Only post method is accepted to import Qti package.');
            }

            $task = ImportQtiTest::createTask(
                $this->getUploadedPackageData(),
                $this->getTestClass(),
                $this->isMetadataGuardiansEnabled(),
                $this->isMetadataValidatorsEnabled(),
                $this->isItemMustExistEnabled(),
                $this->isItemMustBeOverwrittenEnabled(),
                $this->isOverwriteTest(),
                $this->getItemClassUri(),
                $this->getNewPackageLabel(),
                $this->getOverwriteTestUri()
            );

            $result = [
                'reference_id' => $task->getId(),
            ];

            /** @var TaskLogInterface $taskLog */
            $taskLog = $this->getServiceManager()->get(TaskLogInterface::SERVICE_ID);

            if ($report = $taskLog->getReport($task->getId())) {
                $result['report'] = $report->toArray();
            }

            return $this->returnSuccess($result);
        } catch (common_exception_RestApi $e) {
            return $this->returnFailure($e);
        }
    }

    /**
     * @throws common_exception_NotImplemented
     */
    public function getItems(): void
    {
        $request = $this->getPsrRequest();
        $testUri = $request->getQueryParams()[self::PARAM_TEST_URI] ?? null;
        try {
            if ($request->getMethod() !== Request::HTTP_GET || empty($testUri)) {
                throw new common_exception_MissingParameter(self::PARAM_TEST_URI, $this->getRequestURI());
            }
            $testResource = $this->getResource($testUri);

            $this->returnSuccess(
                array_map(static function (Resource $item) {
                    return ['itemUri' => $item->getUri()];
                }, array_values($this->getQtiTestService()->getItems($testResource)))
            );
        } catch (MissingTestmodelException $e) {
            $this->returnFailure(new common_exception_NotFound(
                sprintf('Test %s not found', $testUri),
                StatusCode::HTTP_NOT_FOUND,
                $e
            ));
        } catch (Exception $e) {
            $this->returnFailure($e);
        }
    }

    /**
     * Add extra values to the JSON returned.
     *
     * @param EntityInterface $taskLogEntity
     * @return array
     */
    protected function addExtraReturnData(EntityInterface $taskLogEntity)
    {
        $data = [];

        if ($taskLogEntity->getReport()) {
            $plainReport = $this->getPlainReport($taskLogEntity->getReport());

            //the third report is report of import test
            if (isset($plainReport[2]) && isset($plainReport[2]->getData()['rdfsResource'])) {
                $data['testId'] = $plainReport[2]->getData()['rdfsResource']['uriResource'];
            }
        }

        return $data;
    }

    /**
     * Create a Test Class
     *
     * Label parameter is mandatory
     * If parent class parameter is an uri of valid test class, new class will be created under it
     * If not parent class parameter is provided, class will be created under root class
     * Comment parameter is not mandatory, used to describe new created class
     */
    public function createClass(): void
    {
        try {
            $class = $this->createSubClass(new core_kernel_classes_Class(TaoOntology::CLASS_URI_TEST));

            $this->returnSuccess([
                'message' => __('Class successfully created.'),
                'class-uri' => $class->getUri(),
            ]);
        } catch (common_exception_ClassAlreadyExists $e) {
            $this->returnSuccess([
                'message' => $e->getMessage(),
                'class-uri' => $e->getClass()->getUri(),
            ]);
        } catch (Exception $e) {
            $this->returnFailure($e);
        }
    }

    /**
     * @return array
     * @throws common_exception_Error
     * @throws common_exception_RestApi
     */
    private function getUploadedPackageData()
    {
        if (!tao_helpers_Http::hasUploadedFile(self::PARAM_PACKAGE_NAME)) {
            throw new common_exception_RestApi(__('Missed test package file'));
        }

        $fileData = tao_helpers_Http::getUploadedFile(self::PARAM_PACKAGE_NAME);

        $mimeType = tao_helpers_File::getMimeType($fileData['tmp_name']);

        if (!in_array($mimeType, self::$accepted_types)) {
            throw new common_exception_RestApi(__('Wrong file mime type'));
        }

        return $fileData;
    }

    /**
     * @return string
     * @throws common_exception_RestApi
     */
    private function getSubclassLabel(): string
    {
        $packageLocale = $this->getPostParameter(self::SUBCLASS_LABEL, '');

        if (!is_string($packageLocale)) {
            throw new common_exception_RestApi(
                sprintf('%s parameter should be string', self::SUBCLASS_LABEL)
            );
        }

        return $packageLocale;
    }

    /**
     * @return string
     * @throws common_exception_RestApi
     */
    private function getNewPackageLabel(): ?string
    {
        $packageLabel = $this->getPostParameter(self::NEW_PACKAGE_LABEL);

        if (!$packageLabel) {
            return null;
        }

        if (!is_string($packageLabel)) {
            throw new common_exception_RestApi(
                sprintf('%s parameter should be string', self::NEW_PACKAGE_LABEL)
            );
        }

        return $packageLabel;
    }

    /**
     * @return string|null
     * @throws common_exception_RestApi
     */
    private function getOverwriteTestUri(): ?string
    {
        $overwriteTestUri = $this->getPostParameter(self::OVERWRITE_TEST_URI);

        if (!is_null($overwriteTestUri) && !is_string($overwriteTestUri)) {
            throw new common_exception_RestApi(
                sprintf('%s parameter should be string', self::OVERWRITE_TEST_URI)
            );
        }

        return $overwriteTestUri;
    }

    /**
     * Get class instance to import test
     *
     * @throws common_exception_RestApi
     */
    private function getTestClass(): core_kernel_classes_Class
    {
        $testClass = $this->getClassFromRequest(new core_kernel_classes_Class(TaoOntology::CLASS_URI_TEST));
        $subclassLabel = $this->getSubclassLabel();

        if ($subclassLabel) {
            foreach ($testClass->getSubClasses() as $subClass) {
                if ($subClass->getLabel() === $subclassLabel) {
                    $testClass = $subClass;
                }
            }
        }

        return $testClass;
    }

    /**
     * @return QtiPackageExporter
     */
    private function getQtiPackageExporter(): QtiPackageExporter
    {
        return $this->getServiceLocator()->get(QtiPackageExporter::SERVICE_ID);
    }

    private function getQtiTestService(): taoQtiTest_models_classes_QtiTestService
    {
        return $this->getServiceLocator()->get(taoQtiTest_models_classes_QtiTestService::class);
    }
}
