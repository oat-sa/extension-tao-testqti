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
 * Copyright (c) 2013 (original work) Open Assessment Technologies SA (under the project TAO-PRODUCT);
 *
 */

use oat\oatbox\event\EventManagerAwareTrait;
use oat\oatbox\PhpSerializable;
use oat\oatbox\PhpSerializeStateless;
use oat\tao\model\featureFlag\FeatureFlagChecker;
use oat\tao\model\import\ImportHandlerHelperTrait;
use oat\tao\model\import\TaskParameterProviderInterface;
use oat\tao\model\upload\UploadService;
use oat\taoQtiTest\models\classes\metadata\MetadataLomService;
use oat\taoQtiTest\models\event\QtiTestImportEvent;
use Zend\ServiceManager\ServiceLocatorAwareInterface;
use taoQtiTest_models_classes_import_TestImportForm as TestImportForm;

/**
 * Import handler for QTI packages
 *
 * @access  public
 * @author  Joel Bout, <joel@taotesting.com>
 * @package taoQTI
 */
class taoQtiTest_models_classes_import_TestImport implements
    tao_models_classes_import_ImportHandler,
    PhpSerializable,
    ServiceLocatorAwareInterface,
    TaskParameterProviderInterface
{
    use PhpSerializeStateless;
    use EventManagerAwareTrait;
    use ImportHandlerHelperTrait;

    /**
     * (non-PHPdoc)
     * @see tao_models_classes_import_ImportHandler::getLabel()
     */
    public function getLabel()
    {
        return __('QTI/APIP Test Content Package');
    }

    /**
     * (non-PHPdoc)
     * @see tao_models_classes_import_ImportHandler::getForm()
     */
    public function getForm()
    {
        $form = new taoQtiTest_models_classes_import_TestImportForm([], $this->getFormOptions());

        return $form->getForm();
    }

    /**
     * @param core_kernel_classes_Class   $class
     * @param tao_helpers_form_Form|array $form
     * @param string|null $userId owner of the resource
     * @return common_report_Report
     */
    public function import($class, $form, $userId = null)
    {
        try {
            $uploadedFile = $this->fetchUploadedFile($form);

            // The zip extraction is a long process that can exceed the 30s timeout
            helpers_TimeOutHelper::setTimeOutLimit(helpers_TimeOutHelper::LONG);

            $report = taoQtiTest_models_classes_QtiTestService::singleton()
                ->importMultipleTests($class, $uploadedFile,
                    false,
                    $form[TestImportForm::ITEM_CLASS_DESTINATION_FIELD] ?? null,
                    $form
                );

            helpers_TimeOutHelper::reset();

            $this->getUploadService()->remove($uploadedFile);

            if (common_report_Report::TYPE_SUCCESS == $report->getType()) {
                $this->getEventManager()->trigger(new QtiTestImportEvent($report));
            }

            return $report;
        } catch (Exception $e) {
            return common_report_Report::createFailure($e->getMessage());
        }
    }
    public function getTaskParameters(tao_helpers_form_Form $importForm)
    {
        $file = $this->getUploadService()->getUploadedFlyFile($importForm->getValue('importFile')
            ?: $importForm->getValue('source')['uploaded_file']);

        return [
            'uploaded_file' => $file->getPrefix(), // because of Async, we need the full path of the uploaded file
            TestImportForm::METADATA_FORM_ELEMENT_NAME => $importForm->getValue(
                TestImportForm::METADATA_FORM_ELEMENT_NAME
            ),
            TestImportForm::ITEM_CLASS_DESTINATION_FIELD => $importForm->getValue(
                TestImportForm::ITEM_CLASS_DESTINATION_FIELD
            )
        ];
    }

    private function getFeatureFlagChecker(): FeatureFlagChecker
    {
        return $this->serviceLocator->getContainer()->get(FeatureFlagChecker::class);
    }

    private function getFormOptions(): array
    {
        $options = [];
        if (!$this->getFeatureFlagChecker()->isEnabled(MetadataLomService::FEATURE_FLAG)) {
            $options[taoQtiTest_models_classes_import_TestImportForm::DISABLED_FIELDS][] = taoQtiTest_models_classes_import_TestImportForm::METADATA_FIELD;
            $options[taoQtiTest_models_classes_import_TestImportForm::DISABLED_FIELDS][] = taoQtiTest_models_classes_import_TestImportForm::ITEM_CLASS_DESTINATION_FIELD;
        }
        return $options;
    }
    private function getUploadService()
    {
        return $this->serviceLocator->get(UploadService::SERVICE_ID);
    }
}
