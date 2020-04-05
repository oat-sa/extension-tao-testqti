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
 * Copyright (c) 2020 (original work) Open Assessment Technologies SA;
 *
 * @author Julien Sébire, <julien@taotesting.com>
 */

/**
 * Export Handler for QTI tests.
 */
class taoQtiTest_models_classes_export_TestExport30 extends taoQtiTest_models_classes_export_TestExport
{
    /**
     * @return string
     */
    public function getLabel()
    {
        return __('QTI Test Package 3.0');
    }

    /**
     * @param core_kernel_classes_Resource $testResource
     * @param ZipArchive $zip
     * @param DOMDocument $manifest
     * @return taoQtiTest_models_classes_export_QtiTestExporter|taoQtiTest_models_classes_export_QtiTestExporter30
     */
    protected function createExporter(core_kernel_classes_Resource $testResource, ZipArchive $zip, DOMDocument $manifest)
    {
        return new taoQtiTest_models_classes_export_QtiTestExporter30($testResource, $zip, $manifest);
    }

    /**
     * @return DOMDocument
     */
    protected function createManifest()
    {
        return taoQtiTest_helpers_Utils::emptyImsManifest('3.0');
    }

    /**
     * @param core_kernel_classes_Resource $resource
     * @return tao_helpers_form_Form
     */
    public function getExportForm(core_kernel_classes_Resource $resource)
    {
        $formData = $this->getFormData($resource);

        return (new taoQtiTest_models_classes_export_QtiTest30ExportForm($formData))->getForm();
    }
}
