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
use oat\oatbox\service\ServiceManager;
use oat\tao\model\import\ImportHandlerHelperTrait;
use oat\tao\model\import\TaskParameterProviderInterface;
use oat\tao\model\upload\UploadService;
use oat\taoQtiTest\models\event\QtiTestImportEvent;
use Zend\ServiceManager\ServiceLocatorAwareInterface;

/**
 * Import handler for QTI packages
 *
 * @access  public
 * @author  Joel Bout, <joel@taotesting.com>
 * @package taoQTI
 */
class taoQtiTest_models_classes_import_TestImport implements tao_models_classes_import_ImportHandler, PhpSerializable, ServiceLocatorAwareInterface, TaskParameterProviderInterface
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
        $form = new taoQtiTest_models_classes_import_TestImportForm();

        return $form->getForm();
    }

    /**
     * @param core_kernel_classes_Class   $class
     * @param tao_helpers_form_Form|array $form
     * @return common_report_Report
     */
    public function import($class, $form)
    {
        try {
            $uploadedFile = $this->fetchUploadedFile($form);

            // The zip extraction is a long process that can exceed the 30s timeout
            helpers_TimeOutHelper::setTimeOutLimit(helpers_TimeOutHelper::LONG);

            $report = taoQtiTest_models_classes_QtiTestService::singleton()->importMultipleTests($class, $uploadedFile);

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
}
