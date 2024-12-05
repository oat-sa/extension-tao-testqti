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

namespace oat\taoQtiTest\model\Service;

use common_ext_Extension;
use common_ext_ExtensionsManager as ExtensionsManager;
use oat\generis\model\data\Ontology;
use oat\oatbox\reporting\Report;

class PluginManagerService
{
    CONST PLUGIN_MAP = [
        'allowSkipping' => 'enable-allow-skipping',
        'validateResponses' => 'enable-validate-responses',
    ];
    private Ontology $ontology;
    private ExtensionsManager $extensionsManager;
    private common_ext_Extension $extension;
    private array $config;

    public function __construct(Ontology $ontology, ExtensionsManager $extensionsManager)
    {
        $this->ontology = $ontology;
        $this->extensionsManager = $extensionsManager;
        $this->extension = $this->extensionsManager->getExtensionById('taoQtiTest');
        $this->config = $this->extension->getConfig('testRunner') ?? [];
    }

    /**
     * @param string[] $disablePlugins
     * @param Report $report
     * @throws \common_exception_Error
     */
    public function disablePlugin(array $disablePlugins, Report $report): void
    {
        foreach ($disablePlugins as $plugin) {
            if (array_key_exists($plugin, self::PLUGIN_MAP)) {
                $report->add(new Report(Report::TYPE_INFO, 'Plugin ' . $plugin . ' has been disabled'));
                $this->config[self::PLUGIN_MAP[$plugin]] = false;
            }

            if (array_key_exists($plugin, $this->config)) {
                $report->add(new Report(Report::TYPE_INFO, 'Plugin ' . $plugin . ' has been disabled'));
                $this->config[$plugin] = false;
            }
        }
        $this->extension->setConfig('testRunner', $this->config);
    }

    public function enablePlugin(array $enablePlugins, Report $report): void
    {
        $config = $this->getConfig();

        foreach ($enablePlugins as $plugin) {
            if (array_key_exists($plugin, self::PLUGIN_MAP)) {
                $report->add(new Report(Report::TYPE_INFO, 'Plugin ' . $plugin . ' has been enabled'));
                $config[self::PLUGIN_MAP[$plugin]] = true;
            }

            if (array_key_exists($plugin, $config)) {
                $report->add(new Report(Report::TYPE_INFO, 'Plugin ' . $plugin . ' has been disabled'));
                $config[$plugin] = true;
            }
        }
        $this->extension->setConfig('testRunner', $config);
    }

    private function getConfig(): array
    {
        return $this->extensionsManager->getExtensionById('taoQtiTest')->getConfig('testRunner');
    }
}
