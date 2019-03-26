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
 * Copyright (c) 2019 (original work) Open Assessment Technologies SA ;
 */
/**
 * @author Péter Halász <peter@taotesting.com>
 */

namespace oat\taoQtiTest\scripts\install;

use oat\oatbox\AbstractRegistry;
use oat\oatbox\service\ConfigurableService;
use oat\tao\model\ClientLibConfigRegistry;

class SetOfflineTestRunnerConfig extends \common_ext_action_InstallAction
{
    private $unsupportedPlugins = [
        'taoQtiTest/runner/plugins/controls/connectivity/connectivity',
    ];

    /**
     * @param $params
     * @return \common_report_Report
     * @throws \oat\oatbox\service\exception\InvalidServiceManagerException
     * @throws \common_ext_ExtensionException
     * @throws \common_exception_Error
     */
    public function __invoke($params)
    {
        $this->updateTestRunnerConfig();
        $this->registerOfflineProxy();
        $this->disableUnsupportedTestRunnerPlugins();

        return new \common_report_Report(
            \common_report_Report::TYPE_SUCCESS,
            'Offline Test Runner configuration set.'
        );
    }

    /**
     * @throws \common_exception_Error
     * @throws \common_ext_ExtensionException
     * @throws \oat\oatbox\service\exception\InvalidServiceManagerException
     */
    private function updateTestRunnerConfig()
    {
        /** @var \common_ext_Extension $taoQtiTestExtension */
        $taoQtiTestExtension = $this->getExtensionsManagerService()->getExtensionById('taoQtiTest');
        $config = array_merge_recursive($taoQtiTestExtension->getConfig('testRunner'), [
            'allow-browse-next-item' => true,
            'bootstrap' => [
                'serviceExtension' => 'taoQtiTest',
                'serviceController' => 'OfflineRunner',
                'communication' => [
                    'enabled' => true,
                    'type' => 'poll',
                    'extension' => 'taoQtiTest',
                    'controller' => 'OfflineRunner',
                    'action' => 'messages',
                    'syncActions' => [
                        'move',
                        'skip',
                        'storeTraceData',
                        'timeout',
                        'exitTest',
                    ],
                ],
            ],
        ]);

        $taoQtiTestExtension->setConfig('testRunner', $config);
    }

    private function registerOfflineProxy()
    {
        $this->getRegistry()->register('taoQtiTest/runner/proxy/loader', [
            'providerName' => 'offlineProxy',
            'module'       => 'taoQtiTest/runner/proxy/offline/proxy'
        ]);
    }

    private function disableUnsupportedTestRunnerPlugins()
    {
        /** @var \common_ext_Extension $taoTestsExtension */
        $taoTestsExtension = $this->getExtensionsManagerService()->getExtensionById('taoTests');

        $config = array_filter($taoTestsExtension->getConfig('test_runner_plugin_registry'), function($plugin) {
            return !in_array($plugin['module'], $this->unsupportedPlugins, false);
        });

        $taoTestsExtension->setConfig('test_runner_plugin_registry', $config);
    }

    /**
     * @return ClientLibConfigRegistry|AbstractRegistry
     */
    private function getRegistry()
    {
        return ClientLibConfigRegistry::getRegistry();
    }

    /**
     * @return \common_ext_ExtensionsManager|ConfigurableService
     * @throws \oat\oatbox\service\exception\InvalidServiceManagerException
     */
    private function getExtensionsManagerService()
    {
        return $this->getServiceManager()->get(\common_ext_ExtensionsManager::SERVICE_ID);
    }
}

