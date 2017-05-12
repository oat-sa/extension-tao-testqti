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
 * Copyright (c) 2013-2016 (original work) Open Assessment Technologies SA (under the project TAO-PRODUCT);
 *
 *
 */

/**
 * Export Handler for QTI tests.
 *
 * @access public
 * @author Joel Bout, <joel@taotesting.com>
 * @package taoQtiTest
 */
class taoQtiTest_models_classes_export_TestExport22 extends taoQtiTest_models_classes_export_TestExport
{

    /**
     * (non-PHPdoc)
     * @see tao_models_classes_export_ExportHandler::getLabel()
     */
    public function getLabel()
    {
        return __('QTI Test Package 2.2');
    }
    
    protected function createExporter(core_kernel_classes_Resource $testResource, ZipArchive $zip, DOMDocument $manifest)
    {
        return new taoQtiTest_models_classes_export_QtiTestExporter22($testResource, $zip, $manifest);
    }
    
    protected function createManifest()
    {
        return taoQtiTest_helpers_Utils::emptyImsManifest('2.2');
    }

    public function getExportForm(core_kernel_classes_Resource $resource)
    {
        if ($resource instanceof core_kernel_classes_Class) {
            $formData = array('class' => $resource);
        } else {
            $formData = array('instance' => $resource);
        }
        $form = new taoQtiTest_models_classes_export_QtiTest22ExportForm($formData);

        return $form->getForm();
    }
}
