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
 * Copyright (c) 2020 (original work) Open Assessment Technologies SA ;
 */

declare(strict_types=1);

namespace oat\taoQtiTest\scripts\install;

use oat\oatbox\filesystem\FileSystemService;
use oat\oatbox\reporting\Report;
use oat\tao\helpers\FileHelperService;
use oat\taoQtiTest\helpers\QtiPackageExporter;
use oat\oatbox\extension\InstallAction;
use oat\taoQtiTest\models\export\Formats\Package2p2\TestPackageExport;

class RegisterQtiPackageExporter extends InstallAction
{
    public function __invoke($params): Report
    {
        $serviceManager = $this->getServiceManager();

        $serviceManager->register(
            QtiPackageExporter::SERVICE_ID,
            new QtiPackageExporter(
                new TestPackageExport(),
                $serviceManager->get(FileSystemService::SERVICE_ID),
                $serviceManager->get(FileHelperService::class)
            )
        );

        return Report::createSuccess('QtiPackageExporter successfully registered.');
    }
}
