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
 * Copyright (c) 2022 (original work) Open Assessment Technologies SA;
 */

declare(strict_types=1);

namespace oat\taoQtiTest\models\export\Formats\Package2p2;

use core_kernel_classes_Resource as Resource;
use oat\taoQtiTest\models\export\AbstractTestExport;
use oat\taoQtiTest\models\export\QtiTestExporterInterface;
use taoQtiTest_models_classes_QtiTestServiceException as QtiTestServiceException;

final class TestPackageExport extends AbstractTestExport
{
    protected const VERSION = '2.2';

    public function getLabel(): string
    {
        return __('QTI Test Package %s', self::VERSION);
    }

    protected function getFormTitle(): string
    {
        return __('Export QTI %s Test Package', self::VERSION);
    }

    /**
     * @throws QtiTestServiceException
     */
    protected function getTestExporter(Resource $test): QtiTestExporterInterface
    {
        return new QtiTestExporter($test, $this->getZip(), $this->getManifest());
    }
}
