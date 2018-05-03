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

use oat\oatbox\filesystem\File;
use oat\taoTests\models\import\AbstractTestImporter;

/**
 * Class QtiTestImport
 * @package oat\taoQtiTest\models\metadata
 * @author Aleh Hutnikau, <hutnikau@1pt.com>
 */
class QtiTestImporter extends AbstractTestImporter
{
    const IMPORTER_ID = 'taoQtiTest';

    /**
     * @param File $file
     * @param \core_kernel_classes_Class $class
     * @param bool $enableMetadataGuardians
     * @param bool $enableValidators
     * @param bool $itemMustExist
     * @param bool $itemMustBeOverwritten
     * @return \common_report_Report
     */
    public function import(File $file, \core_kernel_classes_Class $class = null, $enableMetadataGuardians = true, $enableValidators = true, $itemMustExist = false, $itemMustBeOverwritten = false)
    {
        \common_ext_ExtensionsManager::singleton()->getExtensionById('taoQtiTest');
        $service = \taoQtiTest_models_classes_CrudQtiTestsService::singleton();
        return $service->importQtiTest($file, $class, $enableMetadataGuardians, $enableValidators, $itemMustExist, $itemMustBeOverwritten);
    }
}
