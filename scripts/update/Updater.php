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
 * Copyright (c) 2015-2016 (original work) Open Assessment Technologies SA;
 */

namespace oat\taoQtiTest\scripts\update;

use oat\oatbox\service\ServiceNotFoundException;
use oat\taoQtiTest\models\ExtendedStateService;
use oat\taoQtiTest\models\QtiTestListenerService;
use oat\taoQtiTest\models\runner\QtiRunnerMessageService;
use oat\taoQtiTest\models\export\metadata\TestExporter;
use oat\taoQtiTest\models\export\metadata\TestMetadataExporter;
use oat\taoQtiTest\models\runner\config\QtiRunnerConfig;
use oat\taoQtiTest\models\SessionStateService;
use oat\taoQtiTest\models\TestModelService;
use oat\taoQtiTest\models\TestCategoryRulesService;
use oat\taoQtiTest\models\TestCategoryRulesGenerator;
use oat\taoQtiTest\models\TestRunnerClientConfigRegistry;
use oat\taoQtiTest\models\runner\QtiRunnerService;
use oat\taoQtiTest\models\runner\communicator\QtiCommunicationService;
use oat\taoQtiTest\models\runner\communicator\TestStateChannel;
use oat\taoQtiTest\models\TestSessionService;
use oat\taoQtiTest\scripts\install\RegisterTestRunnerPlugins;
use oat\taoQtiTest\scripts\install\SetupEventListeners;
use oat\taoTests\models\runner\plugins\PluginRegistry;
use oat\taoTests\models\runner\plugins\TestPlugin;
use oat\tao\scripts\update\OntologyUpdater;
use oat\oatbox\filesystem\FileSystemService;
use oat\taoQtiTest\models\files\QtiFlysystemFileManager;
use oat\tao\model\import\ImportersService;
use oat\taoQtiTest\models\import\QtiTestImporter;

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

        $currentVersion = $initialVersion;

        // add testrunner config
        if ($currentVersion == '2.6') {

            \common_ext_ExtensionsManager::singleton()->getExtensionById('taoQtiTest')->setConfig('testRunner', array(
                'progress-indicator' => 'percentage',
                'timerWarning' => array(
                    'assessmentItemRef' => null,
                    'assessmentSection' => 300,
                    'testPart' => null
                )
            ));

            $currentVersion = '2.6.1';
        }

        if ($currentVersion == '2.6.1') {
            $config = \common_ext_ExtensionsManager::singleton()->getExtensionById('taoQtiTest')->getConfig('testRunner');
            $config['exitButton'] = false;
            \common_ext_ExtensionsManager::singleton()->getExtensionById('taoQtiTest')->setConfig('testRunner', $config);

            $currentVersion = '2.6.2';
        }

        // add testrunner review screen config
        if ($currentVersion == '2.6.2') {
            $extension = \common_ext_ExtensionsManager::singleton()->getExtensionById('taoQtiTest');
            $config = $extension->getConfig('testRunner');
            $extension->setConfig('testRunner', array_merge($config, array(
                'test-taker-review' => false,
                'test-taker-review-region' => 'left',
                'test-taker-review-section-only' => false,
                'test-taker-review-prevents-unseen' => true,
            )));

            $currentVersion = '2.6.3';
        }

        // adjust testrunner config
        if ($currentVersion == '2.6.3') {
            $defaultConfig = array(
                'timerWarning' => array(
                    'assessmentItemRef' => null,
                    'assessmentSection' => null,
                    'testPart'          => null
                ),
                'progress-indicator' => 'percentage',
                'progress-indicator-scope' => 'testSection',
                'test-taker-review' => false,
                'test-taker-review-region' => 'left',
                'test-taker-review-section-only' => false,
                'test-taker-review-prevents-unseen' => true,
                'exitButton' => false
            );

            $extension = \common_ext_ExtensionsManager::singleton()->getExtensionById('taoQtiTest');
            $config = $extension->getConfig('testRunner');
            foreach($defaultConfig as $key => $value) {
                if (!isset($config[$key])) {
                    $config[$key] = $value;
                }
            }
            $extension->setConfig('testRunner', $config);

            $currentVersion = '2.6.4';
        }

        if ($currentVersion == '2.6.4') {
            $currentVersion = '2.7.0';
        }

        // add markForReview button
        if ($currentVersion === '2.7.0') {
            $registry = TestRunnerClientConfigRegistry::getRegistry();

            $registry->registerQtiTools('markForReview', array(
                'label' => 'Mark for review',
                'icon' => 'anchor',
                'hook' => 'taoQtiTest/testRunner/actionBar/markForReview'
            ));

            $currentVersion = '2.8.0';
         }

        // adjust testrunner config: set the review scope
        if ($currentVersion == '2.8.0') {
            $extension = \common_ext_ExtensionsManager::singleton()->getExtensionById('taoQtiTest');
            $config = $extension->getConfig('testRunner');
            $config['test-taker-review-scope'] = 'test';
            unset($config['test-taker-review-section-only']);
            $extension->setConfig('testRunner', $config);

            $currentVersion = '2.9.0';
        }

       // add show/hide button
        // adjust testrunner config: set the "can collapse" option
        if ($currentVersion == '2.9.0') {
            $registry = TestRunnerClientConfigRegistry::getRegistry();

            $registry->registerQtiTools('collapseReview', array(
                'title' => 'Show/Hide the review screen',
                'label' => 'Review',
                'icon' => 'mobile-menu',
                'hook' => 'taoQtiTest/testRunner/actionBar/collapseReview',
                'order' => -1
            ));

            $extension = \common_ext_ExtensionsManager::singleton()->getExtensionById('taoQtiTest');
            $config = $extension->getConfig('testRunner');
            $config['test-taker-review-can-collapse'] = false;
            $extension->setConfig('testRunner', $config);

            $currentVersion = '2.10.0';
        }

        // adjust testrunner config: set the item sequence number options
        if ($currentVersion == '2.10.0') {
            $extension = \common_ext_ExtensionsManager::singleton()->getExtensionById('taoQtiTest');
            $config = $extension->getConfig('testRunner');
            $config['test-taker-review-force-title'] = false;
            $config['test-taker-review-item-title'] = 'Item %d';
            $extension->setConfig('testRunner', $config);

            $currentVersion = '2.11.0';
        }

        if ($currentVersion == '2.11.0') {
            $currentVersion = '2.11.1';
        }

        // adjust testrunner config: set the force progress indicator display
        if ($currentVersion == '2.11.1') {
            $extension = \common_ext_ExtensionsManager::singleton()->getExtensionById('taoQtiTest');
            $config = $extension->getConfig('testRunner');
            $config['progress-indicator-forced'] = false;
            $extension->setConfig('testRunner', $config);

            $currentVersion = '2.12.0';
        }

        // update the test taker review action buttons
        if ($currentVersion == '2.12.0') {
            $registry = TestRunnerClientConfigRegistry::getRegistry();

            $registry->registerQtiTools('collapseReview', array(
                'hook' => 'taoQtiTest/testRunner/actionBar/collapseReview',
                'order' => 'first',
                'title' => null,
                'label' => null,
                'icon' => null,
            ));

            $registry->registerQtiTools('markForReview', array(
                'hook' => 'taoQtiTest/testRunner/actionBar/markForReview',
                'order' => 'last',
                'title' => null,
                'label' => null,
                'icon' => null,
            ));

            $currentVersion = '2.13.0';
        }

        // adjust testrunner config: set the next section button display
        if ($currentVersion == '2.13.0') {
            $extension = \common_ext_ExtensionsManager::singleton()->getExtensionById('taoQtiTest');
            $config = $extension->getConfig('testRunner');
            $config['next-section'] = false;
            $extension->setConfig('testRunner', $config);

            $currentVersion = '2.14.0';
        }

        if ($currentVersion === '2.14.0') {
            try {
                $this->getServiceManager()->get('taoQtiTest/SessionStateService');
            } catch (ServiceNotFoundException $e) {
                $sessionStateService = new SessionStateService();
                $sessionStateService->setServiceManager($this->getServiceManager());

                $this->getServiceManager()->register('taoQtiTest/SessionStateService', $sessionStateService);
            }

            $currentVersion = '2.15.0';
        }

        if ($currentVersion === '2.15.0') {
            $registry = TestRunnerClientConfigRegistry::getRegistry();
            $registry->registerQtiTools('comment', array(
                'hook' => 'taoQtiTest/testRunner/actionBar/comment'
            ));

            $currentVersion = '2.16.0';
        }

        $this->setVersion($currentVersion);

        if ($this->isBetween('2.16.0','2.17.0')) {
            $proctorRole = new \core_kernel_classes_Resource('http://www.tao.lu/Ontologies/TAO.rdf#DeliveryRole');
            $accessService = \funcAcl_models_classes_AccessService::singleton();
            $accessService->grantModuleAccess($proctorRole, 'taoQtiTest', 'Runner');

            try {
                $this->getServiceManager()->get(QtiRunnerService::CONFIG_ID);
            } catch (ServiceNotFoundException $e) {
                $service = new QtiRunnerService();
                $service->setServiceManager($this->getServiceManager());

                $this->getServiceManager()->register(QtiRunnerService::CONFIG_ID, $service);
            }

            $this->setVersion('2.17.0');
        }

        $this->skip('2.17.0','2.19.1');

        if ($this->isVersion('2.19.1')) {
            // sets default plugin options
            $extension = \common_ext_ExtensionsManager::singleton()->getExtensionById('taoQtiTest');
            $config = $extension->getConfig('testRunner');
            if (!array_key_exists('plugins', $config)) {
                $config['plugins'] = null;
            }
            $extension->setConfig('testRunner', $config);

            $this->setVersion('2.20.0');
        }

        $this->skip('2.20.0','2.21.1');

        if ($this->isVersion('2.21.1')) {
            $extension = \common_ext_ExtensionsManager::singleton()->getExtensionById('taoQtiTest');
            $config = $extension->getConfig('testRunner');
            $extension->setConfig('testRunner', array_merge($config, array(
                'csrf-token' => true
            )));

            $this->setVersion('2.22.0');
        }

        if ($this->isVersion('2.22.0')) {
            $extension = \common_ext_ExtensionsManager::singleton()->getExtensionById('taoQtiTest');
            $config = $extension->getConfig('testRunner');
            $config['timer']['target'] = 'server';
            $extension->setConfig('testRunner', $config);

            $this->setVersion('2.23.0');
        }

        $this->skip('2.23.0','2.24.0');

        if ($this->isVersion('2.24.0')) {
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
            $ext = \common_ext_ExtensionsManager::singleton()->getExtensionById('taoQtiTest');
            $uri = $ext->getConfig(\taoQtiTest_models_classes_QtiTestService::CONFIG_QTITEST_FILESYSTEM);
            $dir = new \core_kernel_file_File($uri);

            $fs = $dir->getFileSystem();
            \taoQtiTest_models_classes_QtiTestService::singleton()->setQtiTestFileSystem($fs->getUri());

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
    }
}
