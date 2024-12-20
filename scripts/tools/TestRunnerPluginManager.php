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

namespace oat\taoQtiTest\scripts\tools;

use oat\oatbox\extension\script\ScriptAction;
use oat\oatbox\reporting\Report;
use oat\taoQtiTest\model\Service\PluginManagerService;

class TestRunnerPluginManager extends ScriptAction
{
    protected function provideOptions()
    {
        return [
            'disablePlugins' => [
                'prefix' => 'd',
                'longPrefix' => 'disable',
                'required' => false,
                'description' => 'List of plugins to be disabled, separated by comma',
            ],
            'enablePlugins' => [
                'prefix' => 'e',
                'longPrefix' => 'enable',
                'required' => false,
                'description' => 'List of plugins to be enabled, separated by comma',
            ],
        ];
    }

    protected function provideDescription()
    {
        return 'Manage test runner plugins';
    }

    protected function run()
    {
        if (empty($this->getOption('disablePlugins')) && empty($this->getOption('enablePlugins'))) {
            return new Report(Report::TYPE_ERROR, 'No action provided');
        }

        $report = new Report(Report::TYPE_INFO, 'Plugins have been managed successfully');

        $disablePlugins = $this->getOption('disablePlugins')
            ? explode(',', $this->getOption('disablePlugins'))
            : [];

        $enablePlugins = $this->getOption('enablePlugins') !== null
            ? explode(',', $this->getOption('enablePlugins'))
            : [];

        if (!empty($disablePlugins)) {
            $this->getPluiginManagerService()->disablePlugin($disablePlugins, $report);
        }

        if (!empty($enablePlugins)) {
            $this->getPluiginManagerService()->enablePlugin($enablePlugins, $report);
        }

        return $report;
    }

    private function getPluiginManagerService(): PluginManagerService
    {
        return $this->getServiceManager()->getContainer()->get(PluginManagerService::class);
    }
}
