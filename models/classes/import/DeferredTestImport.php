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
 * Copyright (c) 2017 (original work) Open Assessment Technologies SA;
 *
 */

namespace oat\taoQtiTest\models\import;

use oat\oatbox\PhpSerializable;
use oat\oatbox\PhpSerializeStateless;
use oat\taoQtiTest\models\tasks\ImportQtiTest;
use oat\tao\model\upload\UploadService;
use Zend\ServiceManager\ServiceLocatorAwareTrait;
use Zend\ServiceManager\ServiceLocatorAwareInterface;

/**
 * Import handler for import QTI packages using task queue
 *
 * Class taoQtiTest_models_classes_import_TestImport
 * @package oat\taoQtiTest\models\import
 * @author Aleh Hutnikau, <hutnikau@1pt.com>
 */
class DeferredTestImport implements \tao_models_classes_import_ImportHandler, PhpSerializable, ServiceLocatorAwareInterface
{
    use PhpSerializeStateless;
    use ServiceLocatorAwareTrait;

    const PROPERTY_LINKED_TASK = 'http://www.tao.lu/Ontologies/TAOTest.rdf#LinkedTask';

    /**
     * @return string
     */
    public function getLabel()
    {
        return __('Deferred import of QTI/APIP Test Package');
    }

    /**
     * @return \tao_helpers_form_Form
     */
    public function getForm()
    {
        $form = new \taoQtiTest_models_classes_import_TestImportForm();
        return $form->getForm();
    }

    /**
     * @param \core_kernel_classes_Class $class
     * @param \tao_helpers_form_Form $form
     * @return mixed
     */
    public function import($class, $form)
    {
//        try {
//            $fileInfo = $form->getValue('source');
//
//            if(isset($fileInfo['uploaded_file'])){
//
//                /** @var  UploadService $uploadService */
//                $uploadService = ServiceManager::getServiceManager()->get(UploadService::SERVICE_ID);
//                $uploadedFile = $uploadService->getUploadedFile($fileInfo['uploaded_file']);
//
//                // The zip extraction is a long process that can exceed the 30s timeout
//                helpers_TimeOutHelper::setTimeOutLimit(helpers_TimeOutHelper::LONG);
//
//                $report = taoQtiTest_models_classes_QtiTestService::singleton()->importMultipleTests($class, $uploadedFile);
//
//                helpers_TimeOutHelper::reset();
//                $uploadService->remove($uploadService->getUploadedFlyFile($fileInfo['uploaded_file']));
//            } else {
//                throw new common_exception_Error('No source file for import');
//            }
//            return $report;
//        }
//        catch (Exception $e) {
//            return common_report_Report::createFailure($e->getMessage());
//        }


        try {
            $fileInfo = $form->getValue('source');
            if (isset($fileInfo['uploaded_file'])) {

                /** @var  UploadService $uploadService */
                $uploadService = $this->getServiceLocator()->get(UploadService::SERVICE_ID);
                $uploadedFile = $uploadService->getUploadedFile($fileInfo['uploaded_file']);

                // The zip extraction is a long process that can exceed the 30s timeout
                \helpers_TimeOutHelper::setTimeOutLimit(\helpers_TimeOutHelper::LONG);
                $task = ImportQtiTest::createTask([
                    'tmp_name' => $uploadedFile,
                    'name' => $fileInfo['name'],
                ], null);
//
                $report = $task->getReport();
                if (empty($report)) {
                    $report = \common_report_Report::createInfo(__('Import of test package successfully scheduled'));
                }

                \helpers_TimeOutHelper::reset();
                $uploadService->remove($uploadService->getUploadedFlyFile($fileInfo['uploaded_file']));
            } else {
                throw new \common_exception_Error('No source file for import');
            }
            return $report;
        }
        catch (\Exception $e) {
            return \common_report_Report::createFailure($e->getMessage());
        }
    }
}
