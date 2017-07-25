<?php
/**
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU General Public License
 * as published by the Free Software Foundation; under version 2
 * of the License (non-upgradable).
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program; if not, write to the Free Software
 * Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA 02110-1301, USA.
 *
 * Copyright (c) 2017 (original work) Open Assessment Technologies SA (under the project TAO-PRODUCT);
 *
 */

namespace oat\taoQtiTest\scripts\install;

use oat\oatbox\extension\InstallAction;
use oat\taoQtiTest\models\cat\CatService;

/**
 * Class RegisterCatService.
 * To register the Cat Service into configuration
 *
 * @package oat\taoQtiTest\scripts\install
 */
class RegisterCatService extends InstallAction
{
    public function __invoke($params)
    {
        if ($this->getServiceLocator()->has(CatService::SERVICE_ID)) {
            return \common_report_Report::createSuccess('CAT service already registered.');
        }
        $this->registerService(CatService::SERVICE_ID, new CatService());
        return \common_report_Report::createSuccess('CAT service successfully registered');
    }

}