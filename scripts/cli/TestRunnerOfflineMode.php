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

/**
 * @author Péter Halász <peter@taotesting.com>
 * @author Ivan Klimchuk <ivan@taotesting.com>
 */

namespace oat\taoQtiTest\scripts\cli;

use common_exception_Error;
use common_exception_InconsistentData;
use common_ext_Extension;
use common_ext_ExtensionException;
use common_ext_ExtensionsManager;
use common_report_Report as Report;
use oat\oatbox\AbstractRegistry;
use oat\oatbox\extension\script\ScriptAction;
use oat\oatbox\extension\script\ScriptException;
use oat\oatbox\service\ConfigurableService;
use oat\oatbox\service\exception\InvalidServiceManagerException;
use oat\taoTests\models\runner\plugins\PluginRegistry;
use oat\taoTests\models\runner\providers\ProviderRegistry;
use oat\taoTests\models\runner\providers\TestProvider;
use oat\tao\model\modules\DynamicModule;

/**
 * Class TestRunnerOfflineMode, replacement of old one SetOfflineTestRunnerConfig
 * @package oat\taoQtiTest\scripts\cli
 *
 * How to use: php index.php 'oat\taoQtiTest\scripts\cli\TestRunnerOfflineMode' --help
 */
class TestRunnerOfflineMode extends ScriptAction
{
    public const OPTION_ENABLE = 'enable';
    public const OPTION_DISABLE = 'disable';

    private const UNSUPPORTED_PLUGINS = [
        'taoTestRunnerPlugins/runner/plugins/security/autoPause',
        'taoTestRunnerPlugins/runner/plugins/connectivity/disconnectedTestSaver',
    ];

    /**
     * @param array $configuration
     *
     * @throws InvalidServiceManagerException
     * @throws common_exception_Error
     * @throws common_ext_ExtensionException
     */
    private function updateTestRunnerConfig($configuration = [])
    {
        /** @var common_ext_Extension $taoQtiTestExtension */
        $taoQtiTestExtension = $this->getExtensionsManagerService()->getExtensionById('taoQtiTest');
        $config = array_merge($taoQtiTestExtension->getConfig('testRunner'), $configuration);

        $taoQtiTestExtension->setConfig('testRunner', $config);
    }

    private function unregisterOfflineProxy()
    {
        $this->getProviderRegistry()->removeByCategory('proxy');
    }

    private function registerOfflineProxy()
    {
        $providerRegistry = $this->getProviderRegistry();
        $providerRegistry->removeByCategory('proxy');
        $providerRegistry->register(
            TestProvider::fromArray(
                [
                    'id' => 'offlineProxy',
                    'module' => 'taoQtiTest/runner/proxy/offline/proxy',
                    'bundle' => 'taoQtiTest/loader/taoQtiTestRunner.min',
                    'category' => 'proxy',
                ]
            )
        );

        return $providerRegistry->isRegistered('taoQtiTest/runner/proxy/offline/proxy');
    }

    /**
     * @param bool $active
     *
     * @throws common_exception_InconsistentData
     */
    private function handleUnsupportedTestRunnerPlugins($active)
    {
        /** @var PluginRegistry $pluginRegistry */
        $pluginRegistry = PluginRegistry::getRegistry();

        foreach (self::UNSUPPORTED_PLUGINS as $pluginId) {
            if ($pluginRegistry->isRegistered($pluginId)) {
                /** @var array $plugin */
                $plugin = $pluginRegistry->get($pluginId);
                $plugin['active'] = $active;

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
     * @return common_ext_ExtensionsManager|ConfigurableService
     * @throws InvalidServiceManagerException
     */
    private function getExtensionsManagerService()
    {
        return $this->getServiceManager()->get(common_ext_ExtensionsManager::SERVICE_ID);
    }

    /**
     * Turning on offline mode for test runner. It sets special proxy plugin that supports offline actions,
     * as well it deactivates plugins that unsupported in offline mode. Also, it adjusts test runner configuration.
     *
     * @return Report
     * @throws InvalidServiceManagerException
     * @throws common_exception_Error
     * @throws common_exception_InconsistentData
     * @throws common_ext_ExtensionException
     */
    private function enable()
    {
        $this->updateTestRunnerConfig(
            [
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
            ]
        );

        if (!$this->registerOfflineProxy()) {
            return new Report(Report::TYPE_ERROR, 'Unable to register the proxy.');
        }

        // set unsupported plugins as inactive
        $this->handleUnsupportedTestRunnerPlugins(false);

        return new Report(Report::TYPE_SUCCESS, 'Offline Test Runner mode was set.');
    }

    /**
     * Turning off the offline mode for test runner. It returns configuration to normal state,
     * as well returns disabled plugins to active state, if they were used.
     *
     * @return Report
     * @throws InvalidServiceManagerException
     * @throws common_exception_Error
     * @throws common_exception_InconsistentData
     * @throws common_ext_ExtensionException
     */
    private function disable()
    {
        $this->updateTestRunnerConfig(
            [
                'bootstrap' => [
                    'serviceExtension' => 'taoQtiTest',
                    'serviceController' => 'Runner',
                    'communication' => [
                        'type' => 'poll',
                        'extension' => null,
                        'controller' => null,
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
            ]
        );

        $this->unregisterOfflineProxy();

        // set unsupported plugins as active
        $this->handleUnsupportedTestRunnerPlugins(true);

        return new Report(Report::TYPE_SUCCESS, 'Offline Test Runner mode was unset.');
    }

    protected function provideOptions()
    {
        return [
            self::OPTION_ENABLE => [
                'prefix' => 'e',
                'flag' => true,
                'longPrefix' => 'enable',
                'description' => 'Enable offline mode for test runner',
            ],
            self::OPTION_DISABLE => [
                'prefix' => 'd',
                'flag' => true,
                'longPrefix' => 'disable',
                'description' => 'Disable offline mode for test runner',
            ],
        ];
    }

    protected function provideDescription()
    {
        return 'Script for enabling/disabling offline mode for TestRunner. It registers or unregisters specific plugins and sets proper configuration.';
    }

    protected function provideUsage()
    {
        return [
            'prefix' => 'h',
            'longPrefix' => 'help',
            'description' => 'Prints a help statement',
        ];
    }

    /**
     * @return Report
     * @throws InvalidServiceManagerException
     * @throws ScriptException
     * @throws common_exception_Error
     * @throws common_exception_InconsistentData
     * @throws common_ext_ExtensionException
     */
    protected function run()
    {
        $toEnable = $this->getOption(self::OPTION_ENABLE);
        $toDisable = $this->getOption(self::OPTION_DISABLE);

        if (!($toEnable || $toDisable)) {
            throw new ScriptException('Action is missed. Please, run this script with --help flag to see available parameters.');
        }

        if ($toEnable !== null && $toDisable !== null) {
            throw new ScriptException('Only one action (enable or disable) can be specified per one script call.');
        }

        if ($toEnable) {
            return $this->enable();
        }

        if ($toDisable) {
            return $this->disable();
        }
    }
}
