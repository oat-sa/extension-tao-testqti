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
 * Copyright (c) 2024 (original work) Open Assessment Technologies SA;
 */

declare(strict_types=1);

namespace oat\taoQtiTest\models\classes\render;

use oat\oatbox\reporting\Report;
use oat\oatbox\service\ConfigurableService;
use oat\taoQtiTest\models\render\QtiPackageImportPreprocessing;
use ZipArchive;

class QTI3PackagePreprocessing extends ConfigurableService implements QtiPackageImportPreprocessing
{
    public function run($file): Report
    {
        $content = $file->read();
        $this->getZip()->open();
        $content = str_replace(
            'http://www.imsglobal.org/xsd/imsqtiasi_v3p0',
            'http://www.imsglobal.org/xsd/imscp_v1p1',
            $content
        );

        $file->write($content);

        return new Report(Report::TYPE_INFO, 'QTI3 package preprocessing done');
    }

    private function getZip(): ZipArchive
    {
        return new ZipArchive();
    }
}
