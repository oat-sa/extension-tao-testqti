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
 */

namespace oat\taoQtiTest\helpers;

use League\Flysystem\Util;
use oat\oatbox\service\ConfigurableService;
use taoQtiTest_models_classes_export_TestExport22 as TestExporter;
use core_kernel_classes_Resource as RdfResource;
use tao_helpers_File as FileHelper;

class QtiPackageExporter extends ConfigurableService
{
    /**
     * @param RdfResource $test
     *
     * @return array
     * @throws \common_Exception
     * @throws \common_exception_Error
     */
    public function exportDeliveryQtiPackage(RdfResource $test)
    {
        $exportReport = $this->getTestExporter()->export([
            'filename' => Util::normalizePath('qti_package_'),
            'instances' => $test->getUri(),
            'uri' => $test->getUri()
        ],
            FileHelper::createTempDir());

        return $exportReport->getData();
    }

    /**
     * @return TestExporter
     */
    protected function getTestExporter()
    {
        return new TestExporter;
    }
}
