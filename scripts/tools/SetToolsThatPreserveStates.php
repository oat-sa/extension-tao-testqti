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
 * Copyright (c) 2019 (original work) Open Assessment Technologies SA;
 */

namespace oat\taoQtiTest\scripts\tools;

use common_report_Report as Report;
use oat\oatbox\extension\AbstractAction;

/**
 * Alters testRunner config with new 'tool-state-server-storage' value
 *
 * Class InstallRdsToolsStateStorage
 * @package oat\taoQtiTest\scripts\install
 */
class SetToolsThatPreserveStates extends AbstractAction
{
    /**
     * @param array $params
     * @return Report
     * @throws \common_Exception
     * @throws \oat\oatbox\service\exception\InvalidServiceManagerException
     */
    public function __invoke($params)
    {
        if (count($params) === 0) {
            return new Report(Report::TYPE_ERROR, 'Tool list is not provided');
        }

        $toolNamesCommaSeparated = current($params);
        $toolNames = explode(',', $toolNamesCommaSeparated);

        $extension = $this->getServiceManager()->get(\common_ext_ExtensionsManager::SERVICE_ID)->getExtensionById('taoQtiTest');
        $config = $extension->getConfig('testRunner');

        foreach ($toolNames as $toolName) {
            if (!array_key_exists($toolName, $config['plugins'])) {
                return new Report(Report::TYPE_ERROR, sprintf('Runner tool "%s" does not exist', $toolName));
            }
        }

        $config['tool-state-server-storage'] = $toolNames;
        $extension->setConfig('testRunner', $config);

        return new Report(Report::TYPE_SUCCESS, sprintf('The list consisting of %d tools that should preserve their states is registered', count($toolNames)));
    }
}
