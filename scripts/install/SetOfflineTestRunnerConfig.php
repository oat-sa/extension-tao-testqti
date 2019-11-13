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
use oat\taoTests\models\runner\plugins\PluginRegistry;
use oat\taoTests\models\runner\providers\ProviderRegistry;
use oat\taoTests\models\runner\providers\TestProvider;
use oat\tao\model\modules\DynamicModule;

class SetOfflineTestRunnerConfig extends \common_ext_action_InstallAction
{
    private $unsupportedPlugins = [
        'taoTestRunnerPlugins/runner/plugins/connectivity/disconnectedTestSaver',
    ];

    /**
     * @param $params
     * @return \common_report_Report
     * @throws \oat\oatbox\service\exception\InvalidServiceManagerException
     * @throws \common_ext_ExtensionException
     * @throws \common_exception_Error
     * @throws \common_exception_InconsistentData
     */
    public function __invoke($params)
    {
        $this->updateTestRunnerConfig();
        if (!$this->registerOfflineProxy()) {
            return new \common_report_Report(
                \common_report_Report::TYPE_ERROR,
                "Unable to register the proxy."
            );
        }
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
        $config = array_merge($taoQtiTestExtension->getConfig('testRunner'), [
            'allow-browse-next-item' => true,
            'bootstrap' => [
                'serviceExtension' => 'taoQtiTest',
                'serviceController' => 'OfflineRunner',
                'communication' => [
                    'enabled' => true,
                    'type' => 'request',
                    'extension' => 'taoQtiTest',
                    'controller' => 'OfflineRunner',
                    'action' => 'messages',
                    'syncActions' => [
                        'move',
                        'skip',
                        'storeTraceData',
                        'timeout',
                        'exitTest',
                        'getNextItemData',
                    ],
                ],
            ],
        ]);

        $taoQtiTestExtension->setConfig('testRunner', $config);
    }

    private function registerOfflineProxy()
    {
        $providerRegistry = $this->getProviderRegistry();
        $providerRegistry->removeByCategory('proxy');
        $providerRegistry->register(TestProvider::fromArray([
            'id'       => 'offlineProxy',
            'module'   => 'taoQtiTest/runner/proxy/offline/proxy',
            'bundle'   => 'taoQtiTest/loader/taoQtiTestRunner.min',
            'category' => 'proxy'
        ]));
        return $providerRegistry->isRegistered('taoQtiTest/runner/proxy/offline/proxy');
    }

    /**
     * @throws \common_exception_InconsistentData
     */
    private function disableUnsupportedTestRunnerPlugins()
    {
        /** @var PluginRegistry $pluginRegistry */
        $pluginRegistry = PluginRegistry::getRegistry();

        foreach ($this->unsupportedPlugins as $unsupportedPluginId) {
            if ($pluginRegistry->isRegistered($unsupportedPluginId)) {
                /** @var array $plugin */
                $plugin = $pluginRegistry->get($unsupportedPluginId);
                $plugin['active'] = false;

                $pluginRegistry->register(DynamicModule::fromArray($plugin));
            }
        }
    }

    /**
     * @return ProviderRegistry|AbstractRegistry
     */
    private function getProviderRegistry()
    {
        return ProviderRegistry::getRegistry();
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

