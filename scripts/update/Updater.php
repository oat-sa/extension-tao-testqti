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
 * Copyright (c) 2015-2017 (original work) Open Assessment Technologies SA;
 */

namespace oat\taoQtiTest\scripts\update;

use oat\oatbox\service\ServiceNotFoundException;
use oat\tao\model\accessControl\func\AccessRule;
use oat\tao\model\accessControl\func\AclProxy;
use oat\tao\model\taskQueue\TaskLogInterface;
use oat\tao\model\user\TaoRoles;
use oat\taoQtiTest\models\creator\CreatorItems;
use oat\taoQtiTest\models\runner\map\QtiRunnerMap;
use oat\taoQtiTest\models\runner\rubric\QtiRunnerRubric;
use oat\taoQtiTest\models\runner\StorageManager;
use oat\taoQtiTest\models\runner\synchronisation\action\Pause;
use oat\taoQtiTest\models\runner\synchronisation\action\NextItemData;
use oat\taoQtiTest\models\runner\synchronisation\SynchronisationService;
use oat\taoQtiTest\models\runner\time\QtiTimer;
use oat\taoQtiTest\models\runner\time\QtiTimerFactory;
use oat\taoQtiTest\models\runner\time\QtiTimeStorage;
use oat\taoQtiTest\models\runner\time\storageFormat\QtiTimeStoragePackedFormat;
use oat\taoQtiTest\models\runner\time\TimerLabelFormatterService;
use oat\taoQtiTest\models\runner\toolsStates\NoStorage;
use oat\taoQtiTest\models\runner\toolsStates\ToolsStateStorage;
use oat\taoQtiTest\models\SectionPauseService;
use oat\taoQtiTest\models\export\metadata\TestMetadataByClassExportHandler;
use oat\taoQtiTest\models\tasks\ImportQtiTest;
use oat\taoQtiTest\models\TestCategoryPresetProvider;
use oat\taoQtiTest\models\ExtendedStateService;
use oat\taoQtiTest\models\QtiTestListenerService;
use oat\taoQtiTest\models\runner\QtiRunnerMessageService;
use oat\taoQtiTest\models\export\metadata\TestExporter;
use oat\taoQtiTest\models\export\metadata\TestMetadataExporter;
use oat\taoQtiTest\models\runner\config\QtiRunnerConfig;
use oat\taoQtiTest\models\TestCategoryPresetRegistry;
use oat\taoQtiTest\models\TestModelService;
use oat\taoQtiTest\models\TestCategoryRulesService;
use oat\taoQtiTest\models\TestCategoryRulesGenerator;
use oat\taoQtiTest\models\TestRunnerClientConfigRegistry;
use oat\taoQtiTest\models\runner\communicator\QtiCommunicationService;
use oat\taoQtiTest\models\runner\communicator\TestStateChannel;
use oat\taoQtiTest\models\TestSessionService;
use oat\taoQtiTest\scripts\install\RegisterCreatorServices;
use oat\taoQtiTest\scripts\install\RegisterTestRunnerPlugins;
use oat\taoQtiTest\scripts\install\SetSynchronisationService;
use oat\taoQtiTest\scripts\install\SetupEventListeners;
use oat\taoQtiTest\scripts\install\SyncChannelInstaller;
use oat\taoTests\models\runner\plugins\PluginRegistry;
use oat\taoTests\models\runner\plugins\TestPlugin;
use oat\taoQtiTest\models\PhpCodeCompilationDataService;
use oat\tao\scripts\update\OntologyUpdater;
use oat\oatbox\filesystem\FileSystemService;
use oat\taoQtiTest\models\files\QtiFlysystemFileManager;
use oat\tao\model\import\ImportersService;
use oat\taoQtiTest\models\import\QtiTestImporter;
use oat\taoDelivery\model\container\delivery\DeliveryContainerRegistry;
use oat\taoQtiTest\models\container\QtiTestDeliveryContainer;
use oat\taoQtiTest\models\cat\CatService;
use oat\libCat\custom\EchoAdaptEngine;
use oat\taoTests\models\runner\providers\ProviderRegistry;
use oat\taoTests\models\runner\providers\TestProvider;
use oat\taoQtiTest\models\compilation\CompilationService;
use oat\taoTests\models\runner\time\TimePoint;

/**
 *
 * @author Jean-Sébastien Conan <jean-sebastien.conan@vesperiagroup.com>
 */
class Updater extends \common_ext_ExtensionUpdater {

    /**
     *
     * @param string $initialVersion
     * @return string $versionUpdatedTo
     */
    public function update($initialVersion) {

        if ($this->isBetween('0.0.0', '2.23.0')) {
            throw new \common_exception_NotImplemented('Updates from versions prior to Tao 3.1 are not longer supported, please update to Tao 3.1 first');
        }
        $this->skip('2.23.0','2.24.2');

        if ($this->isVersion('2.24.2')) {
            $className = \taoQtiTest_helpers_SessionManager::DEFAULT_TEST_SESSION;
            try {
                $deliveryConfig = \common_ext_ExtensionsManager::singleton()->getExtensionById('taoDelivery')->getConfig('deliveryServer');
                if ($deliveryConfig) {
                    $deliveryContainer = $deliveryConfig->getOption('deliveryContainer');
                    if (false !== strpos($deliveryContainer, 'DeliveryClientContainer')) {
                        $className = 'oat\\taoQtiTest\\models\\runner\\session\\TestSession';
                    }
                }
            } catch(\common_ext_ExtensionException $e) {
            }

            $extension = \common_ext_ExtensionsManager::singleton()->getExtensionById('taoQtiTest');
            $config = $extension->getConfig('testRunner');
            $config['test-session'] = $className;
            $extension->setConfig('testRunner', $config);

            $this->setVersion('2.25.0');
        }

        if ($this->isVersion('2.25.0')) {
            $extension = \common_ext_ExtensionsManager::singleton()->getExtensionById('taoQtiTest');
            $config = $extension->getConfig('testRunner');
            $config['plugins']['overlay']['full'] = false;
            $extension->setConfig('testRunner', $config);

            $this->setVersion('2.26.0');
        }

        $this->skip('2.26.0', '2.27.0');

        if ($this->isVersion('2.27.0')) {
            $serviceExtension = 'taoQtiTest';
            $serviceController = 'Runner';
            try {
                $deliveryConfig = \common_ext_ExtensionsManager::singleton()->getExtensionById('taoDelivery')->getConfig('testRunner');
                if ($deliveryConfig) {
                    $serviceExtension = $deliveryConfig['serviceExtension'];
                    $serviceController = $deliveryConfig['serviceController'];
                }
            } catch(\common_ext_ExtensionException $e) {
            }

            $extension = \common_ext_ExtensionsManager::singleton()->getExtensionById('taoQtiTest');
            $config = $extension->getConfig('testRunner');
            $config['bootstrap'] = [
                'serviceExtension' => $serviceExtension,
                'serviceController' => $serviceController,
                'communication' => [
                    'enabled' => false,
                    'type' => 'poll',
                    'extension' => null,
                    'controller' => null,
                    'action' => 'messages',
                    'service' => null,
                    'params' => []
                ]
            ];
            $extension->setConfig('testRunner', $config);

            try {
                $this->getServiceManager()->get(QtiCommunicationService::CONFIG_ID);
            } catch (ServiceNotFoundException $e) {
                $service = new QtiCommunicationService();
                $service->setServiceManager($this->getServiceManager());
                $this->getServiceManager()->register(QtiCommunicationService::CONFIG_ID, $service);
            }

            $this->setVersion('2.28.0');
        }

        if ($this->isVersion('2.28.0')) {
            $testRunnerConfig = \common_ext_ExtensionsManager::singleton()->getExtensionById('taoQtiTest')->getConfig('testRunner');

            if (array_key_exists('timerWarning', $testRunnerConfig)) {
                foreach ($testRunnerConfig['timerWarning'] as &$value) {
                    if ($value !== null && is_int($value)) {
                        $value = [$value => 'warning'];
                    }
                }

                \common_ext_ExtensionsManager::singleton()->getExtensionById('taoQtiTest')->setConfig('testRunner', $testRunnerConfig);
            }

            $this->setVersion('2.29.0');
        }

        if ($this->isVersion('2.29.0')) {
            $extension = \common_ext_ExtensionsManager::singleton()->getExtensionById('taoQtiTest');
            $config = $extension->getConfig('testRunner');
            $config['bootstrap']['timeout'] = 0;
            $extension->setConfig('testRunner', $config);

            $this->setVersion('2.30.0');
        }

        if ($this->isVersion('2.30.0')) {
            try {
                $service = $this->getServiceManager()->get(QtiCommunicationService::CONFIG_ID);
            } catch (ServiceNotFoundException $e) {
                $service = new QtiCommunicationService();
            }

            $service->setServiceManager($this->getServiceManager());

            $service->attachChannel(new TestStateChannel(), QtiCommunicationService::CHANNEL_TYPE_OUTPUT);

            $this->getServiceManager()->register(QtiCommunicationService::CONFIG_ID, $service);

            $this->setVersion('2.31.0');
        }

        if ($this->isVersion('2.31.0')) {
            $extension = \common_ext_ExtensionsManager::singleton()->getExtensionById('taoQtiTest');
            $config = $extension->getConfig('testRunner');
            if (!isset($config['bootstrap']) || (isset($config['bootstrap']['timeout']) && count($config['bootstrap']) == 1)) {

                $config['bootstrap'] = array_merge($config['bootstrap'], [
                    'serviceExtension' => 'taoQtiTest',
                    'serviceController' => 'Runner',
                    'communication' => [
                        'enabled' => false,
                        'type' => 'poll',
                        'extension' => null,
                        'controller' => null,
                        'action' => 'messages',
                        'service' => null,
                        'params' => []
                    ],
                ]);

                $extension->setConfig('testRunner', $config);
            }

            $this->setVersion('2.31.1');
        }

        $this->skip('2.31.1', '3.0.0');

        if ($this->isVersion('3.0.0')) {
            $extension = \common_ext_ExtensionsManager::singleton()->getExtensionById('taoQtiTest');
            $config = $extension->getConfig('testRunner');
            $config['enable-allow-skipping'] = false;
            $extension->setConfig('testRunner', $config);

            $this->setVersion('3.1.0');
        }

        $this->skip('3.1.0', '3.4.0');

        if ($this->isVersion('3.4.0')) {
            $ext = $this->getServiceManager()->get(\common_ext_ExtensionsManager::SERVICE_ID)->getExtensionById('taoQtiTest');
            $uri = $ext->getConfig(\taoQtiTest_models_classes_QtiTestService::CONFIG_QTITEST_FILESYSTEM);
            $fileResource = new \core_kernel_classes_Resource($uri);
            if ($fileResource->exists()) {
                $fileSystem = $fileResource->getOnePropertyValue(new \core_kernel_classes_Property('http://www.tao.lu/Ontologies/generis.rdf#FileRepository'));
                if (!empty($fileSystem) && $fileSystem instanceof \core_kernel_classes_Literal) {
                    \taoQtiTest_models_classes_QtiTestService::singleton()->setQtiTestFileSystem((string) $fileSystem);
                }
            }
            $this->setVersion('4.0.0');
        }

        $this->skip('4.0.0', '4.6.0');

        if ($this->isVersion('4.6.0')) {

            $registry = TestRunnerClientConfigRegistry::getRegistry();
            $runnerConfig = $registry->get(TestRunnerClientConfigRegistry::RUNNER);
            if(isset($runnerConfig['plugins']) && is_array($runnerConfig['plugins']) ) {
                foreach($runnerConfig['plugins'] as $plugin){
                    //if the plugin is registered
                    if($plugin['module'] == 'taoQtiTest/runner/plugins/controls/disableRightClick'){
                        //we migrate the category
                        $registry->removePlugin('taoQtiTest/runner/plugins/controls/disableRightClick', 'controls', null);
                        $registry->registerPlugin('taoQtiTest/runner/plugins/security/disableRightClick', 'security', null);
                        break;
                    }
                }
            }

            $this->setVersion('4.7.0');
        }

        $this->skip('4.7.0', '4.8.2');

        if ($this->isVersion('4.8.2')) {

            //regsiter the core plugins into taoTests
            $registerCorePlugins = new RegisterTestRunnerPlugins();
            $registerCorePlugins([]);

            $registry = PluginRegistry::getRegistry();

            //list the installed plugins
            $oldRegistry = TestRunnerClientConfigRegistry::getRegistry();
            $runnerConfig = $oldRegistry->get(TestRunnerClientConfigRegistry::RUNNER);
            if(isset($runnerConfig['plugins']) && is_array($runnerConfig['plugins']) ) {
                foreach($runnerConfig['plugins'] as $plugin){

                    //if they are not yet in the config, migrate them automatically
                    if( ! $registry->isRegistered($plugin['module']) ) {
                        $pluginId = basename($plugin['module']);
                        $pluginName = ucfirst(join(preg_split('/(?=[A-Z])/', $pluginId), ' '));
                        $registry->register(TestPlugin::fromArray([
                            'id'       => $pluginId,
                            'name'     => $pluginName,
                            'module'   => $plugin['module'],
                            'category' => $plugin['category'],
                            'position' => $plugin['position'],
                            'active'   => true
                        ]));
                    }
                }
            }

            //then remove the old config
            $registry->remove(TestRunnerClientConfigRegistry::RUNNER);
            $registry->remove(TestRunnerClientConfigRegistry::RUNNER_PROD);

            $this->setVersion('5.0.0');
        }

        $this->skip('5.0.0', '5.4.0');

        if ($this->isVersion('5.4.0')) {

            $extension = \common_ext_ExtensionsManager::singleton()->getExtensionById('taoQtiTest');
            $config = $extension->getConfig('testRunner');
            $config['plugins']['collapser'] = [
                'collapseTools' => true,
                'collapseNavigation' => false,
                'hover' => false
            ];
            $extension->setConfig('testRunner', $config);

            $this->setVersion('5.5.0');
        }

        $this->skip('5.5.0', '5.5.3');

        if ($this->isVersion('5.5.3')) {

            $extension = \common_ext_ExtensionsManager::singleton()->getExtensionById('taoQtiTest');

            $config = $extension->getConfig('testRunner');
            $config['force-branchrules'] = false;
            $config['force-preconditions'] = false;
            $config['path-tracking'] = false;

            $extension->setConfig('testRunner', $config);

            $this->setVersion('5.6.0');
        }

        if ($this->isVersion('5.6.0')) {
            $extension = \common_ext_ExtensionsManager::singleton()->getExtensionById('taoQtiTest');

            $config = $extension->getConfig('testRunner');
            $config['always-allow-jumps'] = false;

            $extension->setConfig('testRunner', $config);

            $this->setVersion('5.7.0');
        }

        $this->skip('5.7.0', '5.8.4');

        if ($this->isVersion('5.8.4')) {
            OntologyUpdater::syncModels();
            $testModelService = new TestModelService(array(
                'exportHandlers' => array(
                    new \taoQtiTest_models_classes_export_TestExport(),
                    new \taoQtiTest_models_classes_export_TestExport22()
                ),
                'importHandlers' => array(
                    new \taoQtiTest_models_classes_import_TestImport()
                )
            ));
            $testModelService->setServiceManager($this->getServiceManager());

            $this->getServiceManager()->register(TestModelService::SERVICE_ID, $testModelService);
            $this->setVersion('5.9.0');
        }

        $this->skip('5.9.0', '5.10.2');

        if ($this->isVersion('5.10.2')) {
            $extension = \common_ext_ExtensionsManager::singleton()->getExtensionById('taoQtiTest');

            $config = $extension->getConfig('testRunner');
            $config['check-informational'] = false;

            $extension->setConfig('testRunner', $config);

            $this->setVersion('5.11.0');
        }

        if ($this->isVersion('5.11.0')) {
            $registry = PluginRegistry::getRegistry();
            $registry->register(TestPlugin::fromArray([
                'id' => 'modalFeedback',
                'name' => 'QTI modal feedbacks',
                'module' => 'taoQtiTest/runner/plugins/content/modalFeedback/modalFeedback',
                'description' => 'Display Qti modalFeedback element',
                'category' => 'content',
                'active' => true,
                'tags' => [ 'core', 'qti', 'required' ]
            ]));
            $this->setVersion('5.12.0');
        }

        $this->skip('5.12.0', '5.16.2');

        if ($this->isVersion('5.16.2')) {
            $service = new TestExporter();
            $service->setServiceManager($this->getServiceManager());
            $this->getServiceManager()->register(TestMetadataExporter::SERVICE_ID, $service);
            $this->setVersion('5.17.0');
        }

        $this->skip('5.17.0', '5.17.3');

        if ($this->isVersion('5.17.3')) {

            \common_ext_ExtensionsManager::singleton()->getExtensionById('taoQtiTest')->setConfig('TestCompiler', array(
                'enable-category-rules-generation' => false
            ));

            $categoryRulesService = new TestCategoryRulesService(
                array(
                    'score-variable-identifier' => 'SCORE',
                    'weight-identifier' => 'WEIGHT',
                    'category-exclusions' => array(
                        '/x-tao-/'
                    ),
                    'flags' => TestCategoryRulesGenerator::COUNT | TestCategoryRulesGenerator::CORRECT | TestCategoryRulesGenerator::SCORE
                )
            );
            $categoryRulesService->setServiceManager($this->getServiceManager());

            $this->getServiceManager()->register(TestCategoryRulesService::SERVICE_ID, $categoryRulesService);

            $this->setVersion('5.18.0');
        }

        $this->skip('5.18.0', '5.23.0');

        if ($this->isVersion('5.23.0')) {
            $ext = \common_ext_ExtensionsManager::singleton()->getExtensionById('taoQtiTest');
            $uri = $ext->getConfig(\taoQtiTest_models_classes_QtiTestService::CONFIG_QTITEST_FILESYSTEM);
            if (!is_string($uri)) {
                if (is_object($uri) && $uri instanceof \core_kernel_classes_Resource) {
                    \taoQtiTest_models_classes_QtiTestService::singleton()->setQtiTestFileSystem($uri->getUri());
                } else {
                    throw new \common_exception_InconsistentData('Invalid qti test storage directory configuration');
                }
            }
            $this->setVersion('5.23.1');
        }

        $this->skip('5.23.1', '5.25.1');

        if ($this->isVersion('5.25.1')) {

            $extension = \common_ext_ExtensionsManager::singleton()->getExtensionById('taoQtiTest');

            $config = $extension->getConfig('testRunner');
            $config['test-taker-unanswered-items-message'] = true;

            $extension->setConfig('testRunner', $config);


            $this->setVersion('5.26.0');
        }

        if ($this->isVersion('5.26.0')) {
            $registry = PluginRegistry::getRegistry();
            $registry->register(TestPlugin::fromArray([
                'id' => 'documentViewer',
                'name' => 'Document Viewer',
                'module' => 'taoQtiTest/runner/plugins/tools/documentViewer/documentViewer',
                'description' => 'Display a document as requested by an event',
                'category' => 'tools',
                'active' => false,
                'tags' => []
            ]));
            $this->setVersion('5.27.0');
        }

        if ($this->isVersion('5.27.0')) {

            $extension = \common_ext_ExtensionsManager::singleton()->getExtensionById('taoQtiTest');

            $config = $extension->getConfig('testRunner');
            $config['keep-timer-up-to-timeout'] = false;

            $extension->setConfig('testRunner', $config);

            $this->setVersion('5.28.0');
        }

        $this->skip('5.28.0', '5.30.1');

        if ($this->isVersion('5.30.1')) {

            $extension = \common_ext_ExtensionsManager::singleton()->getExtensionById('taoQtiTest');

            $config = $extension->getConfig('testRunner');
            $config['allow-shortcuts'] = true;

            $extension->setConfig('testRunner', $config);

            $this->setVersion('5.31.0');
        }

        $this->skip('5.31.0', '5.31.1');

        if ($this->isVersion('5.31.1')) {

            $extension = \common_ext_ExtensionsManager::singleton()->getExtensionById('taoQtiTest');

            $config = $extension->getConfig('testRunner');
            $config['shortcuts'] = [
                'calculator' => [
                    'toggle' => 'C',
                ],
                'zoom' => [
                    'in' => 'I',
                    'out' => 'O'
                ],
                'comment' => [
                    'toggle' => 'A',
                ],
                'itemThemeSwitcher' => [
                    'toggle' => 'T',
                ],
                'review' => [
                    'toggle' => 'R',
                    'flag' => 'M'
                ]
            ];

            $extension->setConfig('testRunner', $config);

            $this->setVersion('5.32.0');
        }

        $this->skip('5.32.0', '5.32.1');

        if ($this->isVersion('5.32.1')) {

            $extension = \common_ext_ExtensionsManager::singleton()->getExtensionById('taoQtiTest');

            $config = $extension->getConfig('testRunner');

            $config['shortcuts']['next'] = [
                'trigger' => 'J',
            ];
            $config['shortcuts']['previous'] = [
                'trigger' => 'K',
            ];

            $extension->setConfig('testRunner', $config);

            $this->setVersion('5.33.0');
        }

        if ($this->isVersion('5.33.0')) {

            $registry = PluginRegistry::getRegistry();
            $registry->register(TestPlugin::fromArray([
                'id' => 'responsesAccess',
                'name' => 'Shortcuts to access the item responses',
                'module' => 'taoQtiTest/runner/plugins/content/accessibility/responsesAccess',
                'description' => 'Provide a way to navigate between item responses using the keyboard',
                'category' => 'content',
                'active' => true,
                'tags' => [ 'core', 'qti' ]
            ]));

            $extension = \common_ext_ExtensionsManager::singleton()->getExtensionById('taoQtiTest');

            $config = $extension->getConfig('testRunner');
            $config['shortcuts']['responsesAccess'] = [
                'previous' => 'Shift+Tab',
                'next' => 'Tab'
            ];

            $extension->setConfig('testRunner', $config);

            $this->setVersion('5.34.0');
        }

        $this->skip('5.34.0', '5.36.0');

        if ($this->isVersion('5.36.0')) {
            $registry = PluginRegistry::getRegistry();
            $registry->register(TestPlugin::fromArray([
                'id' => 'highlighter',
                'name' => 'Text Highlighter',
                'module' => 'taoQtiTest/runner/plugins/tools/highlighter/plugin',
                'description' => 'Allows the test taker to highlight text',
                'category' => 'tools',
                'active' => true,
                'tags' => []
            ]));
            $this->setVersion('5.37.0');
        }

        if ($this->isVersion('5.37.0')) {

            $extension = \common_ext_ExtensionsManager::singleton()->getExtensionById('taoQtiTest');

            $config = $extension->getConfig('testRunner');

            $config['shortcuts']['itemThemeSwitcher'] = [
                'toggle' => 'T',
                'loop' => 'Y',
                'select' => 'U'
            ];

            $extension->setConfig('testRunner', $config);

            $this->setVersion('5.37.1');
        }

        $this->skip('5.37.1', '5.38.1');

        if ($this->isVersion('5.38.1')) {
            $registry = PluginRegistry::getRegistry();
            $registry->register(TestPlugin::fromArray([
                'id' => 'highlighter',
                'name' => 'Text Highlighter',
                'module' => 'taoQtiTest/runner/plugins/tools/highlighter/plugin',
                'description' => 'Allows the test taker to highlight text',
                'category' => 'tools',
                'active' => false,
                'tags' => []
            ]));
            $this->setVersion('5.38.2');
        }

        $this->skip('5.38.2', '5.40.0');

        if ($this->isVersion('5.40.0')) {

            $registry = PluginRegistry::getRegistry();
            $registry->remove('taoQtiTest/runner/plugins/content/accessibility/responsesAccess');
            $registry->register(TestPlugin::fromArray([
                'id' => 'keyNavigation',
                'name' => 'Using key to navigate item content',
                'module' => 'taoQtiTest/runner/plugins/content/accessibility/keyNavigation',
                'description' => 'Provide a way to navigate within item with the keyboard',
                'category' => 'content',
                'active' => true,
                'tags' => [ 'core', 'qti' ]
            ]));

            $extension = \common_ext_ExtensionsManager::singleton()->getExtensionById('taoQtiTest');

            $config = $extension->getConfig('testRunner');
            unset($config['shortcuts']['responsesAccess']);
            $config['shortcuts']['keyNavigation'] = [
                'previous' => 'Shift+Tab',
                'next' => 'Tab'
            ];

            $extension->setConfig('testRunner', $config);

            $this->setVersion('5.41.0');
        }

        if ($this->isVersion('5.41.0')) {
            $fsService = $this->getServiceManager()->get(FileSystemService::SERVICE_ID);
            $fsService->createFileSystem('taoQtiTestSessionFilesystem');
            $this->getServiceManager()->register(FileSystemService::SERVICE_ID, $fsService);

            $service = new QtiFlysystemFileManager();
            $service->setServiceManager($this->getServiceManager());
            $this->getServiceManager()->register(QtiFlysystemFileManager::SERVICE_ID, $service);

            $this->setVersion('5.42.0');
        }

        $this->skip('5.42.0', '5.44.0');

        if ($this->isVersion('5.44.0')) {
            $registry = PluginRegistry::getRegistry();
            $registry->register(TestPlugin::fromArray([
                'id' => 'magnifier',
                'name' => 'Magnifier',
                'module' => 'taoQtiTest/runner/plugins/tools/magnifier/magnifier',
                'description' => 'Gives student access to a magnification tool',
                'category' => 'tools',
                'active' => false,
                'tags' => [  ]
            ]));

            $extension = \common_ext_ExtensionsManager::singleton()->getExtensionById('taoQtiTest');

            $config = $extension->getConfig('testRunner');

            $config['shortcuts']['magnifier'] = [
                'toggle' => 'L',
                'in' => 'Shift+I',
                'out' => 'Shift+O',
                'close' => 'esc'
            ];

            $config['plugins']['magnifier'] = [
                'zoomMin' => 2,
                'zoomMax' => 8,
                'zoomStep' => .5
            ];

            $extension->setConfig('testRunner', $config);

            $this->setVersion('5.45.0');
        }

        $this->skip('5.45.0', '5.46.2');

        if ($this->isVersion('5.46.2')) {
            $extension = \common_ext_ExtensionsManager::singleton()->getExtensionById('taoQtiTest');

            $config = $extension->getConfig('testRunner');

            $config['shortcuts']['dialog'] = [
                'accept' => 'Enter',
                'reject' => 'Esc'
            ];

            $extension->setConfig('testRunner', $config);

            $this->setVersion('5.47.0');
        }

        if ($this->isVersion('5.47.0')) {

            $qtiTest = \common_ext_ExtensionsManager::singleton()->getExtensionById('taoQtiTest');
            $config = $qtiTest->getConfig('testRunner');
            $config = array_merge($config, array(
                'test-taker-review-show-legend' => true,
                'test-taker-review-default-open' => true,
            ));
            $qtiTest->setConfig('testRunner', $config);

            $this->setVersion('5.48.0');
        }

        $this->skip('5.48.0', '5.49.0');

        if ($this->isVersion('5.49.0')) {

            $extension = \common_ext_ExtensionsManager::singleton()->getExtensionById('taoQtiTest');

            $config = $extension->getConfig('testRunner');

            $config['shortcuts']['itemThemeSwitcher'] = [
                'toggle' => 'T',
                'up' => 'ArrowUp',
                'down' => 'ArrowDown',
                'select' => 'Enter'
            ];

            $extension->setConfig('testRunner', $config);

            $this->setVersion('5.49.1');
        }

        if ($this->isVersion('5.49.1')) {
            $extension = \common_ext_ExtensionsManager::singleton()->getExtensionById('taoQtiTest');

            $config = $extension->getConfig('testRunner');

            $config['test-taker-review-use-title'] = true;

            $extension->setConfig('testRunner', $config);

            $this->setVersion('5.50.0');
        }

        if ($this->isVersion('5.50.0')) {
            $registry = PluginRegistry::getRegistry();
            if (!$registry->isRegistered('taoQtiTest/runner/plugins/tools/magnifier/magnifier')) {
                $registry->register(TestPlugin::fromArray([
                    'id' => 'magnifier',
                    'name' => 'Magnifier',
                    'module' => 'taoQtiTest/runner/plugins/tools/magnifier/magnifier',
                    'description' => 'Gives student access to a magnification tool',
                    'category' => 'tools',
                    'active' => false,
                    'tags' => [  ]
                ]));
            }

            $this->setVersion('5.50.1');
        }

        $this->skip('5.50.1', '5.58.3');

        if ($this->isVersion('5.58.3')) {
            $extension = \common_ext_ExtensionsManager::singleton()->getExtensionById('taoQtiTest');

            $config = $extension->getConfig('testRunner');

            $config['shortcuts']['area-masking'] = [
                'toggle' => 'Y'
            ];

            $extension->setConfig('testRunner', $config);

            $this->setVersion('5.59.0');
        }

        $this->skip('5.59.0', '6.0.0');

        if($this->isVersion('6.0.0')){
            $registry = PluginRegistry::getRegistry();
            $registry->remove('taoQtiTest/runner/plugins/content/accessibility/responsesAccess');
            $registry->register(TestPlugin::fromArray([
                'id' => 'keyNavigation',
                'name' => 'Using key to navigate test runner',
                'module' => 'taoQtiTest/runner/plugins/content/accessibility/keyNavigation',
                'description' => 'Provide a way to navigate within the test runner with the keyboard',
                'category' => 'content',
                'active' => true,
                'tags' => [ 'core', 'qti' ]
            ]));
            $this->setVersion('6.1.0');
        }

        $this->skip('6.1.0', '6.3.0');

        if ($this->isVersion('6.3.0')) {

            $extension = \common_ext_ExtensionsManager::singleton()->getExtensionById('taoQtiTest');

            $config = $extension->getConfig('testRunner');

            $config['shortcuts']['itemThemeSwitcher'] = [
                'toggle' => 'T'
            ];

            $extension->setConfig('testRunner', $config);

            $this->setVersion('6.3.1');
        }

        $this->skip('6.3.1', '6.4.3');

        if ($this->isVersion('6.4.3')) {
            $service = new QtiRunnerConfig();
            $service->setServiceManager($this->getServiceManager());
            $this->getServiceManager()->register(QtiRunnerConfig::SERVICE_ID, $service);

            $this->setVersion('6.5.0');
        }

        $this->skip('6.5.0', '6.9.0');

        if ($this->isVersion('6.9.0')) {

            //removes the shortcut from dialog
            $extension = \common_ext_ExtensionsManager::singleton()->getExtensionById('taoQtiTest');
            $config = $extension->getConfig('testRunner');
            $config['shortcuts']['dialog'] = [];
            $extension->setConfig('testRunner', $config);

            $this->setVersion('6.10.0');
        }

        if ($this->isVersion('6.10.0')) {

            $extension = \common_ext_ExtensionsManager::singleton()->getExtensionById('taoQtiTest');
            $config = $extension->getConfig('testRunner');
            $config['test-session-storage'] = '\taoQtiTest_helpers_TestSessionStorage';
            $extension->setConfig('testRunner', $config);

            $this->setVersion('6.11.0');
        }

        $this->skip('6.11.0', '6.13.0');

        if ($this->isVersion('6.13.0')) {

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

            $this->setVersion('6.14.0');
        }

        $this->skip('6.14.0', '6.16.0');

        if($this->isVersion('6.16.0')){
            // Register line reader plugin
            $registry = PluginRegistry::getRegistry();
            $registry->remove('taoQtiTest/runner/plugins/content/accessibility/responsesAccess');
            $registry->register(TestPlugin::fromArray([
                'id' => 'lineReader',
                'name' => 'Line Reader',
                'module' => 'taoQtiTest/runner/plugins/tools/lineReader/plugin',
                'description' => 'Display a customisable mask with a customisable hole in it!',
                'category' => 'tools',
                'active' => true,
                'tags' => [  ]
            ]));

            // Register line reader shortcut
            $extension = \common_ext_ExtensionsManager::singleton()->getExtensionById('taoQtiTest');
            $config = $extension->getConfig('testRunner');
            $config['shortcuts']['line-reader'] = [
                'toggle' => 'G'
            ];
            $extension->setConfig('testRunner', $config);

            $this->setVersion('6.17.0');
        }

        $this->skip('6.17.0', '6.17.2');

        if ($this->isVersion('6.17.2')) {
            $this->getServiceManager()->register(ExtendedStateService::SERVICE_ID, new ExtendedStateService());
            $this->getServiceManager()->register(TestSessionService::SERVICE_ID, new TestSessionService());
            $this->getServiceManager()->register(QtiTestListenerService::SERVICE_ID, new QtiTestListenerService());
            $this->getServiceManager()->register(QtiRunnerMessageService::SERVICE_ID, new QtiRunnerMessageService());

            $this->runExtensionScript(SetupEventListeners::class);

            $this->setVersion(('6.18.0'));
        }

        $this->skip('6.18.0', '7.4.1');

        if($this->isVersion('7.4.1')){
            // Register item trace variables plugin
            $registry = PluginRegistry::getRegistry();
            $registry->remove('taoQtiTest/runner/plugins/controls/trace/itemTraceVariables');
            $registry->register(TestPlugin::fromArray([
                'id' => 'itemTraceVariables',
                'name' => 'Item trace variables',
                'module' => 'taoQtiTest/runner/plugins/controls/trace/itemTraceVariables',
                'description' => 'Send item trace variables',
                'category' => 'controls',
                'active' => false,
                'tags' => [ 'core', 'technical' ]
            ]));

            $this->setVersion('7.5.0');
        }

        $this->skip('7.5.0', '7.5.6');

        if ($this->isVersion('7.5.6')) {
            $extension = \common_ext_ExtensionsManager::singleton()->getExtensionById('taoQtiTest');
            $config = $extension->getConfig('testRunner');
            $config['test-taker-review-display-subsection-title'] = true;
            $extension->setConfig('testRunner', $config);
            $this->setVersion('7.6.0');
        }

        $this->skip('7.6.0', '8.0.0');

        if($this->isVersion('8.0.0')){
            // Register answer masking plugin
            $registry = PluginRegistry::getRegistry();
            $registry->register(TestPlugin::fromArray([
                'id' => 'answerMasking',
                'name' => 'Answer Masking',
                'module' => 'taoQtiTest/runner/plugins/tools/answerMasking/plugin',
                'description' => 'Hide all answers of a choice interaction and allow revealing them',
                'category' => 'tools',
                'active' => true,
                'tags' => [  ]
            ]));

            // Register answer masking shortcut
            $extension = \common_ext_ExtensionsManager::singleton()->getExtensionById('taoQtiTest');
            $config = $extension->getConfig('testRunner');
            $config['shortcuts']['answer-masking'] = [
                'toggle' => 'D'
            ];
            $extension->setConfig('testRunner', $config);

            $this->setVersion('8.1.0');
        }

        $this->skip('8.1.0', '9.1.3');

        if($this->isVersion('9.1.3')){
            $registry = PluginRegistry::getRegistry();
            foreach($registry->getMap() as $module => $plugin){
                if(preg_match("/^taoQtiTest/", $module) && is_null($plugin['bundle'])){
                    $plugin['bundle'] = 'taoQtiTest/loader/testPlugins.min';
                    $registry->register(TestPlugin::fromArray($plugin));
                }
            }
            $this->setVersion('9.2.0');
        }

        $this->skip('9.2.0', '9.3.2');

        if ($this->isVersion('9.3.2')) {
            if (!$this->getServiceManager()->has(TestCategoryPresetProvider::SERVICE_ID)) {
                $this->getServiceManager()->register(TestCategoryPresetProvider::SERVICE_ID, new TestCategoryPresetProvider());
            }
            $this->setVersion('9.3.3');
        }

        $this->skip('9.3.3', '9.5.0');

        // display 'item x' instead of 'item x of y' in the progress bar
        if ($this->isVersion('9.5.0')) {
            $extension = $this->getServiceManager()->get(\common_ext_ExtensionsManager::SERVICE_ID)->getExtensionById('taoQtiTest');
            $config = $extension->getConfig('testRunner');
            $config['progress-indicator-show-total'] = true;
            $extension->setConfig('testRunner', $config);
            $this->setVersion('9.6.0');
        }

        $this->skip('9.6.0', '9.9.1');

        if ($this->isVersion('9.9.1')) {
            $registry = TestCategoryPresetRegistry::getRegistry();
            $registry->set('taoQtiTest', '\oat\taoQtiTest\models\QtiCategoryPresetProvider');
            $this->setVersion('9.10.0');
        }

        $this->skip('9.10.0', '9.11.2');

        if ($this->isVersion('9.11.2')) {

            $testModelService = $this->getServiceManager()->get(TestModelService::SERVICE_ID);
            $exportHandlers = $testModelService->getOption('exportHandlers');
            array_unshift($exportHandlers, new TestMetadataByClassExportHandler());
            $testModelService->setOption('exportHandlers', $exportHandlers);
            $this->getServiceManager()->register(TestModelService::SERVICE_ID, $testModelService);

            $this->setVersion('9.12.0');
        }

        $this->skip('9.12.0', '9.14.1');

        if ($this->isVersion('9.14.1')) {
            /* deprecated as of 25.8.0
            $testModelService = $this->getServiceManager()->get(TestModelService::SERVICE_ID);
            $testModelService->setOption('testCompilerClass', 'taoQtiTest_models_classes_QtiTestCompiler');
            $this->getServiceManager()->register(TestModelService::SERVICE_ID, $testModelService);
            */
            $this->setVersion('9.15.0');
        }

        $this->skip('9.15.0', '9.17.0');

        if ($this->isVersion('9.17.0')) {
            $this->getServiceManager()->register(SectionPauseService::SERVICE_ID, new SectionPauseService());
            $this->setVersion('9.18.0');
        }

        $this->skip('9.18.0', '9.19.0');

        if( $this->isVersion('9.19.0') ){

            $registry = PluginRegistry::getRegistry();
            $registry->register(TestPlugin::fromArray([
                'id'          => 'preventSkipping',
                'name'        => 'Prevent Skipping',
                'module'      => 'taoQtiTest/runner/plugins/navigation/preventSkipping',
                'bundle'      => 'taoQtiTest/loader/testPlugins.min',
                'description' => 'Prevent to submit empty responses',
                'category'    => 'navigation',
                'active'      => true,
                'tags'        => [ 'core', 'qti' ]
            ]));

            $this->setVersion('10.0.0');
        }

        if ($this->isVersion('10.0.0')) {
            $service = new QtiRunnerMap();
            $this->getServiceManager()->propagate($service);
            $this->getServiceManager()->register(QtiRunnerMap::SERVICE_ID, $service);

            $extension = $this->getServiceManager()->get(\common_ext_ExtensionsManager::SERVICE_ID)->getExtensionById('taoQtiTest');
            $config = $extension->getConfig('testRunner');
            $config['item-cache-size'] = 3;
            $extension->setConfig('testRunner', $config);

            $this->setVersion('10.1.0');
        }

        $this->skip('10.1.0', '10.3.0');

        if ($this->isVersion('10.3.0')) {
            $registry = DeliveryContainerRegistry::getRegistry();
            $registry->setServiceLocator($this->getServiceManager());
            $registry->registerContainerType('qtiTest', new QtiTestDeliveryContainer());
            $this->setVersion('10.4.0');
        }

        $this->skip('10.4.0', '10.5.1');

        if ($this->isVersion('10.5.1')) {

            $registry = PluginRegistry::getRegistry();
            $registry->remove('taoQtiTest/runner/plugins/tools/highlighter/plugin');
            $registry->remove('taoQtiTest/runner/plugins/tools/magnifier/magnifier');
            $registry->register(TestPlugin::fromArray([
                'id' => 'highlighter',
                'name' => 'Text Highlighter',
                'module' => 'taoQtiTest/runner/plugins/tools/highlighter/plugin',
                'bundle' => 'taoQtiTest/loader/testPlugins.min',
                'description' => 'Allows the test taker to highlight text',
                'category' => 'tools',
                'active' => true,
                'tags' => [ ]
            ]));
            $registry->register(TestPlugin::fromArray([
                'id' => 'magnifier',
                'name' => 'Magnifier',
                'module' => 'taoQtiTest/runner/plugins/tools/magnifier/magnifier',
                'bundle' => 'taoQtiTest/loader/testPlugins.min',
                'description' => 'Gives student access to a magnification tool',
                'category' => 'tools',
                'active' => true,
                'tags' => [  ]
            ]));
            $registry->register(TestPlugin::fromArray([
                'id' => 'eliminator',
                'name' => 'Eliminate choices',
                'module' => 'taoQtiTest/runner/plugins/tools/answerElimination/eliminator',
                'bundle' => 'taoQtiTest/loader/testPlugins.min',
                'description' => 'Allows student to eliminate choices',
                'category' => 'tools',
                'active' => true,
                'tags' => [  ]
            ]));
            $registry->register(TestPlugin::fromArray([
                'id'          => 'area-masking',
                'name'        => 'Area Masking',
                'module'      => 'taoQtiTest/runner/plugins/tools/areaMasking/areaMasking',
                'bundle'      => 'taoQtiTest/loader/testPlugins.min',
                'description' => 'Mask areas of the item',
                'category'    => 'tools',
                'active'      => true,
                'tags'        => [  ]
            ]));
            $this->setVersion('10.6.0');
        }

        if ($this->isVersion('10.6.0')) {
            // Install the synchronisation service
            $this->runExtensionScript(SetSynchronisationService::class);

            // Install the Sync Channel
            $this->runExtensionScript(SyncChannelInstaller::class);

            $this->setVersion('10.7.0');
        }

        $this->skip('10.7.0', '10.10.0');

        if ($this->isVersion('10.10.0')) {
            $qtiListenerService = $this->getServiceManager()->get(QtiTestListenerService::SERVICE_ID);
            $qtiListenerService->setOption(QtiTestListenerService::OPTION_ARCHIVE_EXCLUDE, []);
            $this->getServiceManager()->register(QtiTestListenerService::SERVICE_ID, $qtiListenerService);

            $this->setVersion('10.11.0');
        }

        if ($this->isVersion('10.11.0')) {

            $registry = PluginRegistry::getRegistry();
            $registry->remove('taoQtiTest/runner/plugins/tools/zoom');
            $registry->register(TestPlugin::fromArray([
                'id' => 'zoom',
                'name' => 'Zoom',
                'module' => 'taoQtiTest/runner/plugins/tools/zoom',
                'bundle' => 'taoQtiTest/loader/testPlugins.min',
                'description' => 'Allows Test-taker to zoom in and out the item content',
                'category' => 'tools',
                'active' => true,
                'tags' => [ ]
            ]));
            $this->setVersion('10.11.1');
        }

        $this->skip('10.11.1', '10.14.1');

        if ($this->isVersion('10.14.1')) {

            // Default is now EchoAdapt. This should change in the futre.
            $catService = new CatService([
                CatService::OPTION_ENGINE_ENDPOINTS => [
                    'http://URL_SERVER/cat/api/' => [
                        CatService::OPTION_ENGINE_CLASS => EchoAdaptEngine::class,
                        CatService::OPTION_ENGINE_ARGS => []
                    ]
                ]
            ]);

            $this->getServiceManager()->register(CatService::SERVICE_ID, $catService);

            $this->setVersion('10.15.0');
        }

        $this->skip('10.15.0', '10.15.2');

        if ($this->isVersion('10.15.2')) {
            $this->getServiceManager()->register(QtiRunnerRubric::SERVICE_ID, new QtiRunnerRubric());
            $this->setVersion('10.16.0');
        }

        if ($this->isVersion('10.16.0')) {
            OntologyUpdater::syncModels();
            $this->setVersion('10.17.0');
        }

        $this->skip('10.17.0', '11.0.0');

        if ($this->isVersion('11.0.0')) {
            $registerCreatorService = new RegisterCreatorServices();
            $registerCreatorService->setServiceLocator($this->getServiceManager());
            $registerCreatorService([]);
            $this->setVersion('11.1.0');
        }

        $this->skip('11.1.0', '11.5.1');

        if ($this->isVersion('11.5.1')) {
            $extension = \common_ext_ExtensionsManager::singleton()->getExtensionById('taoQtiTest');
            $config = $extension->getConfig('testRunner');
            $config['enable-validate-responses'] = false;
            $extension->setConfig('testRunner', $config);

            $registry = PluginRegistry::getRegistry();

            $registry->remove('taoQtiTest/runner/plugins/navigation/preventSkipping');
            $registry->register(TestPlugin::fromArray([
                'id'          => 'allowSkipping',
                'name'        => 'Allow Skipping',
                'module'      => 'taoQtiTest/runner/plugins/navigation/allowSkipping',
                'bundle'      => 'taoQtiTest/loader/testPlugins.min',
                'description' => 'Allow submission of null/default responses',
                'category'    => 'navigation',
                'active'      => true,
                'tags'        => [ 'core', 'qti' ]
            ]));

            $registry->register(TestPlugin::fromArray([
                'id'          => 'validateResponses',
                'name'        => 'Validate Responses',
                'module'      => 'taoQtiTest/runner/plugins/navigation/validateResponses',
                'bundle'      => 'taoQtiTest/loader/testPlugins.min',
                'description' => 'Prevent submission of invalid responses',
                'category'    => 'navigation',
                'active'      => true,
                'tags'        => [ 'core', 'qti' ]
            ]));

            $this->setVersion('11.6.0');
        }

        $this->skip('11.6.0', '11.8.1');

        if($this->isVersion('11.8.1')){
            $registry = PluginRegistry::getRegistry();

            $registry->register(TestPlugin::fromArray([
                'id' => 'warnBeforeLeaving',
                'name' => 'Warn before leaving',
                'module' => 'taoQtiTest/runner/plugins/navigation/warnBeforeLeaving',
                'bundle' => 'taoQtiTest/loader/testPlugins.min',
                'description' => 'Warn the test taker when closing the browser',
                'category' => 'navigation',
                'active' => false, //registered by but activated
                'tags' => [ ]
            ]));
            $this->setVersion('11.9.0');
        }

        $this->skip('11.9.0', '11.16.0');

        if ($this->isVersion('11.16.0')) {
            /** @var CatService $catService */
            $catService = $this->getServiceManager()->get(CatService::SERVICE_ID);
            $engines = $catService->getOption(CatService::OPTION_ENGINE_ENDPOINTS);

            if (!isset($engines['http://YOUR_URL_OAUTH/cat/api/'])) {
                $oauthOptions = [
                    CatService::OPTION_ENGINE_CLASS => EchoAdaptEngine::class,
                    CatService::OPTION_ENGINE_ARGS => [
                        CatService::OPTION_ENGINE_VERSION => 'v1.1',
                        CatService::OPTION_ENGINE_CLIENT => [
                            'class' => 'oat\taoOauth\model\OAuthClient',
                            'options' => [
                                'client_id' => '',
                                'client_secret' => '',
                                'resource_owner_details_url' => false,
                                'authorize_url' => false,
                                'http_client_options' => array(),
                                'token_url' => '',
                                'token_key' => '',
                                'tokenParameters' => array(
                                    'audience' => ''
                                ),
                                'token_storage' => 'cache'
                            ]
                        ],
                    ]
                ];

                $engines['http://YOUR_URL_OAUTH/cat/api/']  = $oauthOptions;
                $catService->setOption(CatService::OPTION_ENGINE_ENDPOINTS, $engines);
                $this->getServiceManager()->register(CatService::SERVICE_ID, $catService);
            }

            $this->setVersion('12.0.0');
        }

        $this->skip('12.0.0', '13.1.0');

        if ($this->isVersion('13.1.0')) {
            $config = \common_ext_ExtensionsManager::singleton()->getExtensionById('taoQtiTest')->getConfig('TestCompiler');
            $config['enable-rubric-block-stylesheet-scoping'] = true;
            \common_ext_ExtensionsManager::singleton()->getExtensionById('taoQtiTest')->setConfig('TestCompiler', $config);

            $this->setVersion('13.2.0');
        }

        $this->skip('13.2.0', '14.1.4');

        if($this->isVersion('14.1.4')) {
            /** @var CreatorItems $creatorItemsService */
            $creatorItemsService = $this->getServiceManager()->get(CreatorItems::SERVICE_ID);
            $creatorItemsService->setOption(CreatorItems::ITEM_MODEL_SEARCH_OPTION, CreatorItems::ITEM_MODEL_QTI_URI);
            $creatorItemsService->setOption(CreatorItems::ITEM_CONTENT_SEARCH_OPTION, '*');

            $this->getServiceManager()->register(CreatorItems::SERVICE_ID, $creatorItemsService);

            $this->setVersion('14.1.5');
        }

        $this->skip('14.1.5', '16.0.1');

        if($this->isVersion('16.0.1')) {

            // Update the synchronisation service
            $this->runExtensionScript(SetSynchronisationService::class);

            $this->setVersion('16.1.0');
        }

        $this->skip('16.1.0', '16.1.1');

        if ($this->isVersion('16.1.1')) {
            $this->getServiceManager()->register(
                PhpCodeCompilationDataService::SERVICE_ID,
                new PhpCodeCompilationDataService()
            );

            $this->setVersion('16.2.0');
        }

        $this->skip('16.2.0', '16.3.3');

        if ($this->isVersion('16.3.3')) {
            $qtiTimerFactory = new QtiTimerFactory([
                QtiTimerFactory::OPTION_TIMER_CLASS => QtiTimer::class,
                QtiTimerFactory::OPTION_STORAGE_CLASS => QtiTimeStorage::class,
                QtiTimerFactory::OPTION_STORAGE_FORMAT_CLASS => QtiTimeStoragePackedFormat::class,
            ]);

            $this->getServiceManager()->register(QtiTimerFactory::SERVICE_ID, $qtiTimerFactory);

            $this->setVersion('17.0.0');
        }

        $this->skip('17.0.0', '17.1.0');

        if ($this->isVersion('17.1.0')) {
            $extension = \common_ext_ExtensionsManager::singleton()->getExtensionById('taoQtiTest');
            $config = $extension->getConfig('testRunner');
            $config['bootstrap']['communication']['syncActions'] = ['move', 'skip', 'storeTraceData', 'timeout', 'exitTest'];
            $extension->setConfig('testRunner', $config);
            $this->setVersion('17.2.0');
        }

        $this->skip('17.2.0', '17.5.1');

        if ($this->isVersion('17.5.1')) {
            $extension = $this->getServiceManager()->get(\common_ext_ExtensionsManager::SERVICE_ID)->getExtensionById('taoQtiTest');
            $config = $extension->getConfig('testRunner');
            $config['bootstrap']['communication']['syncActions'][] = 'getNextItemData';
            $extension->setConfig('testRunner', $config);

            /** @var SynchronisationService $synchronisationService */
            $synchronisationService = $this->getServiceManager()->get(SynchronisationService::SERVICE_ID);
            $actions = $synchronisationService->getAvailableActions();
            $actions['getNextItemData'] = NextItemData::class;
            $synchronisationService->setAvailableActions($actions);
            $this->getServiceManager()->register(SynchronisationService::SERVICE_ID, $synchronisationService);

            $this->setVersion('17.6.0');
        }

        $this->skip('17.6.0', '17.7.1');

        if ($this->isVersion('17.7.1')) {

            $registry = PluginRegistry::getRegistry();
            $registry->register(
                TestPlugin::fromArray(
                    [
                        'id' => 'collapser',
                        'name' => 'Collapser',
                        'module' => 'taoQtiTest/runner/plugins/content/responsiveness/collapser',
                        'description' => 'Reduce the size of the tools when the available space is not enough',
                        'category' => 'content',
                        'active' => true,
                        'tags' => [ 'core' ]
                    ]
                )
            );

            $this->setVersion('17.8.0');
        }

        $this->skip('17.8.0', '17.9.0');

        if ($this->isVersion('17.9.0')) {
            $storageManager = new StorageManager();
            $this->getServiceManager()->register(StorageManager::SERVICE_ID, $storageManager);
            $this->setVersion('17.10.0');
        }

        $this->skip('17.10.0', '17.16.0');

        if ($this->isVersion('17.16.0')) {

            $synchronisationService = $this->getServiceManager()->get(SynchronisationService::SERVICE_ID);
            $actions = $synchronisationService->getAvailableActions();
            $actions['pause'] = Pause::class;
            $synchronisationService->setAvailableActions($actions);
            $this->getServiceManager()->register(SynchronisationService::SERVICE_ID, $synchronisationService);

            $this->setVersion('17.17.0');
        }

        $this->skip('17.17.0', '17.17.6');

        if ($this->isVersion('17.17.6')) {
            $extension = $this->getServiceManager()->get(\common_ext_ExtensionsManager::SERVICE_ID)->getExtensionById('taoQtiTest');
            $config = $extension->getConfig('testRunner');
            $config['catEngineWarning'] = [
                'echoDelayUpdate' => 15,
                'echoPauseLimit' => 120,
                'echoExceptionName' => 'CatEngine'
            ];
            $extension->setConfig('testRunner', $config);

            $this->setVersion('17.18.0');
        }

        $this->skip('17.18.0', '17.18.2');

        if ($this->isVersion('17.18.2')) {
            $extension = $this->getServiceManager()->get(\common_ext_ExtensionsManager::SERVICE_ID)->getExtensionById('taoQtiTest');
            $config = $extension->getConfig('testRunner');
            unset($config['catEngineWarning']);
            $extension->setConfig('testRunner', $config);

            $this->setVersion('17.19.0');
        }

        $this->skip('17.19.0', '18.5.1');

        if ($this->isVersion('18.5.1')) {

            $registry = ProviderRegistry::getRegistry();
            $registry->register(
                TestProvider::fromArray(
                    [
                        'id' => 'qti',
                        'name' => 'QTI runner',
                        'module' => 'taoQtiTest/runner/provider/qti',
                        'bundle' => 'taoQtiTest/loader/qtiTestRunner.min',
                        'description' => 'QTI implementation of the test runner',
                        'category' => 'runner',
                        'active' => true,
                        'tags' => [ 'core', 'qti', 'runner' ]
                    ]
                )
            );

            $this->setVersion('18.6.0');
        }

        $this->skip('18.6.0', '18.9.4');

        if ($this->isVersion('18.9.4')) {
            AclProxy::applyRule(new AccessRule('grant', 'http://www.tao.lu/Ontologies/TAOTest.rdf#TestsManagerRole', array('ext'=>'taoQtiTest', 'mod' => 'RestQtiTests')));
            $this->setVersion('18.9.5');
        }

        $this->skip('18.9.5', '23.2.0');

        if ($this->isVersion('23.2.0')) {

            $registry = PluginRegistry::getRegistry();
            if ($registry->isRegistered('taoQtiTest/runner/plugins/tools/textToSpeech/plugin')) {
                $registry->remove('taoQtiTest/runner/plugins/tools/textToSpeech/plugin');
            }

            $this->setVersion('23.2.1');
        }

        $this->skip('23.2.1', '23.4.0');

        if ($this->isVersion('23.4.0')) {

            $extension = \common_ext_ExtensionsManager::singleton()->getExtensionById('taoQtiTest');
            $config = $extension->getConfig('testRunner');
            $config['guidedNavigation'] = false;

            $extension->setConfig('testRunner', $config);

            $registry = PluginRegistry::getRegistry();

            $registry->remove('taoQtiTest/runner/plugins/controls/timer/timer');
            $registry->register(TestPlugin::fromArray([
                'id' => 'timer',
                'name' => 'Timer indicator',
                'module' => 'taoQtiTest/runner/plugins/controls/timer/plugin',
                'bundle' => 'taoQtiTest/loader/testPlugins.min',
                'description' => 'Add countdown when remaining time',
                'category' => 'controls',
                'active' => true,
                'tags' => [ 'core', 'qti' ]
            ]));

            $this->setVersion('24.0.0');
        }

        $this->skip('24.0.0', '24.1.0');

        if ($this->isVersion('24.1.0')) {
            AclProxy::applyRule(new AccessRule('grant', TaoRoles::REST_PUBLISHER, array('ext'=>'taoQtiTest', 'mod' => 'RestQtiTests')));
            $this->setVersion('24.2.0');
        }

        $this->skip('24.2.0', '24.7.0');

        if ($this->isVersion('24.7.0')) {
            $extension = $this->getServiceManager()->get(\common_ext_ExtensionsManager::SERVICE_ID)->getExtensionById('taoQtiTest');
            $config = $extension->getConfig('testRunner');

            $config['progress-indicator-renderer'] = 'percentage';
            $config['progress-indicator-show-label'] = 'true';

            // as the percentage indicator now takes care of the scope, ensure the legacy is respected
            if ($config['progress-indicator'] == 'percentage') {
                $config['progress-indicator-scope'] = 'test';
            }
            $extension->setConfig('testRunner', $config);

            $this->setVersion('24.8.0');
        }

        $this->skip('24.8.0', '24.8.4');

        if ($this->isVersion('24.8.4')) {
            $extension = $this->getServiceManager()->get(\common_ext_ExtensionsManager::SERVICE_ID)->getExtensionById('taoQtiTest');
            $config = $extension->getConfig('testRunner');
            $config['progress-categories'] = [];
            $extension->setConfig('testRunner', $config);
            $this->setVersion('24.9.0');
        }

        $this->skip('24.9.0', '25.1.0');

        if ($this->isVersion('25.1.0')) {
            $registry = PluginRegistry::getRegistry();
            $registry->register(TestPlugin::fromArray([
                'id' => 'focusOnFirstField',
                'name' => 'Focus on first form field',
                'module'     => 'taoQtiTest/runner/plugins/content/accessibility/focusOnFirstField',
                'bundle'      => 'taoQtiTest/loader/testPlugins.min',
                'description' => 'Sets focus on first form field',
                'category' => 'content',
                'active' => true,
                'tags' => []
            ]));
            $this->setVersion('25.2.0');
        }
        $this->skip('25.2.0', '25.5.1');

        if ($this->isVersion('25.5.1')){
            $timerLabel = new TimerLabelFormatterService([
                TimerLabelFormatterService::OPTION_DEFAULT_TIMER_LABEL => 'Time Remaining'
            ]);

            $this->getServiceManager()->register(TimerLabelFormatterService::SERVICE_ID, $timerLabel);

            $this->setVersion('25.6.0');
        }

        $this->skip('25.6.0', '25.7.2');

        if ($this->isVersion('25.7.2')) {
            /** @var TimerLabelFormatterService $timerLabel */
            $timerLabel = $this->getServiceManager()->get(TimerLabelFormatterService::SERVICE_ID);
            $timerLabel->setOption(TimerLabelFormatterService::OPTION_DEFAULT_TIMER_LABEL, 'timer_name_translation_token');

            $this->getServiceManager()->register(TimerLabelFormatterService::SERVICE_ID, $timerLabel);
            $this->setVersion('25.7.3');
        }

        $this->skip('25.7.3', '25.7.5');

        if ($this->isVersion('25.7.5')) {
            $extension = $this->getServiceManager()->get(\common_ext_ExtensionsManager::SERVICE_ID)->getExtensionById('taoQtiTest');
            $config = $extension->getConfig('testRunner');
            $config['enable-allow-skipping'] = true;
            $extension->setConfig('testRunner', $config);

            $this->setVersion('25.7.6');
        }

        $this->skip('25.7.6', '25.8.0');

        if ($this->isVersion('25.8.0')) {
            /** @var TaskLogInterface|ConfigurableService $taskLogService */
            $taskLogService = $this->getServiceManager()->get(TaskLogInterface::SERVICE_ID);

            $taskLogService->linkTaskToCategory(ImportQtiTest::class, TaskLogInterface::CATEGORY_IMPORT);

            $this->getServiceManager()->register(TaskLogInterface::SERVICE_ID, $taskLogService);

            $this->setVersion('25.9.0');
        }

        $this->skip('25.9.0', '25.9.2');

        // test compiler settings refactoring
        if ($this->isVersion('25.9.2')) {
            $extension = $this->getServiceManager()->get(\common_ext_ExtensionsManager::SERVICE_ID)->getExtensionById('taoQtiTest');
            $config = $extension->getConfig('TestCompiler');

            $model = $this->getServiceManager()->get(TestModelService::SERVICE_ID);
            $model->setOption(TestModelService::SUBSERVICE_COMPILATION, new CompilationService([
                CompilationService::OPTION_RUBRIC_BLOCK_CSS_SCOPE => $config['enable-rubric-block-stylesheet-scoping']
            ]));
            $this->getServiceManager()->register(TestModelService::SERVICE_ID, $model);
            $this->setVersion('25.10.0');
        }

        if ($this->isVersion('25.10.0')) {
            $extension = $this->getServiceManager()->get(\common_ext_ExtensionsManager::SERVICE_ID)->getExtensionById('taoQtiTest');
            $config = $extension->getConfig('testRunner');
            $config['restore-timer-from-client'] = true;
            $extension->setConfig('testRunner', $config);

            $this->setVersion('25.10.1');
        }

        $this->skip('25.10.1', '26.1.1');

        if ($this->isVersion('26.1.1')){
            /** @var TimerLabelFormatterService $timerLabel */
            $timerLabel = $this->getServiceManager()->get(TimerLabelFormatterService::SERVICE_ID);
            $timerLabel->setOption(TimerLabelFormatterService::OPTION_DEFAULT_TIMER_LABEL, '');

            $this->getServiceManager()->register(TimerLabelFormatterService::SERVICE_ID, $timerLabel);

            $this->setVersion('26.1.2');
        }

        $this->skip('26.1.2', '29.6.1');

        if ($this->isVersion('29.6.1')) {
            $extension = $this->getServiceManager()->get(\common_ext_ExtensionsManager::SERVICE_ID)->getExtensionById('taoQtiTest');
            $config = $extension->getConfig('testRunner');
            $config['test-taker-review-skipahead'] = false;
            $extension->setConfig('testRunner', $config);

            $this->setVersion('29.7.0');
        }

        $this->skip('29.7.0', '29.7.3');

        if ($this->isVersion('29.7.3')) {
            $this->getServiceManager()->register(
                ToolsStateStorage::SERVICE_ID,
                new NoStorage([])
            );

            $extension = $this->getServiceManager()->get(\common_ext_ExtensionsManager::SERVICE_ID)->getExtensionById('taoQtiTest');
            $config = $extension->getConfig('testRunner');
            $config['tool-state-server-storage'] = [];
            $extension->setConfig('testRunner', $config);

            $this->setVersion('29.8.0');
        }

        $this->skip('29.8.0', '30.4.0');

        if ($this->isVersion('30.4.0')) {
            $registry = PluginRegistry::getRegistry();
            $registry->register(TestPlugin::fromArray([
                'id' => 'linearNextItemWarning',
                'name' => 'Linear next item warning',
                'module' => 'taoQtiTest/runner/plugins/navigation/next/linearNextItemWarning',
                'bundle' => 'taoQtiTest/loader/testPlugins.min',
                'description' => 'Displays a dialog before next item in linear test parts',
                'category' => 'navigation',
                'active' => false,
                'tags' => [ ]
            ]));

            $extension = $this->getServiceManager()->get(\common_ext_ExtensionsManager::SERVICE_ID)->getExtensionById('taoQtiTest');
            $config = $extension->getConfig('testRunner');
            $config['force-enable-linear-next-item-warning'] = false;
            $config['enable-linear-next-item-warning-checkbox'] = true;
            $extension->setConfig('testRunner', $config);

            $this->setVersion('30.5.0');
        }

       $this->skip('30.5.0', '30.5.3');

    }
}
