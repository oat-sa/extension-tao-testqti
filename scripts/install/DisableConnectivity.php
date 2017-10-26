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

namespace oat\taoQtiTest\scripts\install;

use oat\oatbox\extension\InstallAction;
use oat\taoTests\models\runner\plugins\PluginRegistry;

class DisableConnectivity extends InstallAction
{
    /**
     * @param $params
     * @return \common_report_Report
     */
    public function __invoke($params)
    {

        $registry = PluginRegistry::getRegistry();
        $connectivity = $registry->get('taoQtiTest/runner/plugins/controls/connectivity/connectivity');
        $connectivity['active'] = false;
        $registry->set('taoQtiTest/runner/plugins/controls/connectivity/connectivity', $connectivity);
        return \common_report_Report::createSuccess('Connectivity correctly disable');
    }
}