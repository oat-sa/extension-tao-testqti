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
 *
 */

use common_report_Report as Report;
use oat\oatbox\event\EventManagerAwareTrait;
use oat\oatbox\PhpSerializable;
use oat\oatbox\PhpSerializeStateless;
use oat\taoQtiTest\models\event\QtiTestExportEvent;

/**
 * Export Handler for QTI tests.
 *
 * @access  public
 * @author  Joel Bout, <joel@taotesting.com>
 * @package taoQtiTest
 */
class taoQtiTest_models_classes_export_TestExport implements tao_models_classes_export_ExportHandler, PhpSerializable
{
    use PhpSerializeStateless;
    use EventManagerAwareTrait;

    /**
     * @return string
     */
    public function getLabel()
    {
        return __('QTI Test Package 2.1');
    }

    /**
     * @param core_kernel_classes_Resource $resource
     * @return tao_helpers_form_Form
     */
    public function getExportForm(core_kernel_classes_Resource $resource)
    {
        if ($resource instanceof core_kernel_classes_Class) {
            $formData = ['class' => $resource];
        } else {
            $formData = ['instance' => $resource];
        }

        return (new taoQtiTest_models_classes_export_QtiTest21ExportForm($formData))
            ->getForm();
    }

    /**
     * @param array  $formValues
     * @param string $destination
     * @return Report
     * @throws common_Exception
     * @throws common_exception_Error
     */
    public function export($formValues, $destination)
    {
        if (!isset($formValues['filename'])) {
            return Report::createFailure('Missing filename for QTI Test export using ' . __CLASS__);
        }

        $instances = is_string($formValues['instances']) ? [$formValues['instances']] : $formValues['instances'];

        if (!count($instances)) {
            return Report::createFailure("No instance in form to export");
        }

        $report = Report::createSuccess();

        $fileName = $formValues['filename'] . '_' . time() . '.zip';
        $path = tao_helpers_File::concat([$destination, $fileName]);

        if (tao_helpers_File::securityCheck($path, true) === false) {
            throw new common_Exception('Unauthorized file name for QTI Test ZIP archive.');
        }
        // Create a new ZIP archive to store data related to the QTI Test.
        $zip = new ZipArchive();
        if ($zip->open($path, ZipArchive::CREATE) !== true) {
            throw new common_Exception("Unable to create ZIP archive for QTI Test at location '" . $path . "'.");
        }
        // Create an empty IMS Manifest as a basis.
        $manifest = $this->createManifest();

        foreach ($instances as $instance) {
            $testResource = new core_kernel_classes_Resource($instance);
            $testExporter = $this->createExporter($testResource, $zip, $manifest);
            $subReport = $testExporter->export();
            if ($report->getType() !== Report::TYPE_ERROR &&
                ($subReport->containsError() || $subReport->getType() === Report::TYPE_ERROR)
            ) {
                $report->setType(Report::TYPE_ERROR);
                $report->setMessage(__('Not all test could be exported'));
            }
            $report->add($subReport);
        }

        $zip->close();

        $subjectUri = isset($formValues['uri']) ? $formValues['uri'] : $formValues['classUri'];

        if (!$report->containsError() && $subjectUri) {
            $this->getEventManager()->trigger(new QtiTestExportEvent(new core_kernel_classes_Resource($subjectUri)));

            $report->setData($path);
            $report->setMessage(__('Resource(s) successfully exported.'));
        }

        return $report;
    }

    protected function createExporter(core_kernel_classes_Resource $testResource, ZipArchive $zip, DOMDocument $manifest)
    {
        return new taoQtiTest_models_classes_export_QtiTestExporter($testResource, $zip, $manifest);
    }

    protected function createManifest()
    {
        return taoQtiTest_helpers_Utils::emptyImsManifest('2.1');
    }
}
