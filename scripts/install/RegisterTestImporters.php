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
 */

namespace oat\taoQtiTest\scripts\install;

use oat\oatbox\extension\AbstractAction;
use oat\tao\model\import\ImportersService;
use oat\taoQtiTest\models\import\QtiTestImporter;


/**
 * @author Aleh Hutnikau, <hutnikau@1pt.com>
 */
class RegisterTestImporters extends AbstractAction
{

    public function __invoke($params)
    {
        /** @var ImportersService $importersService */
        $importersService = $this->getServiceManager()->get(ImportersService::SERVICE_ID);
        if ($importersService->hasOption(ImportersService::OPTION_IMPORTERS)) {
            $importers = $importersService->getOption(ImportersService::OPTION_IMPORTERS);
        } else {
            $importers = [];
        }
        $importers[QtiTestImporter::IMPORTER_ID] = QtiTestImporter::class;
        $importersService->setOption(ImportersService::OPTION_IMPORTERS, $importers);
        $this->getServiceManager()->register(ImportersService::SERVICE_ID, $importersService);
    }
}
