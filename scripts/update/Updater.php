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
 * Copyright (c) 2015 (original work) Open Assessment Technologies SA;
 */

namespace oat\taoQtiTest\scripts\update;

use oat\taoQtiTest\models\TestRunnerClientConfigRegistry;

/**
 *
 * @author Jean-S�bastien Conan <jean-sebastien.conan@vesperiagroup.com>
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

        if ($currentVersion === '2.7.0') {
            $registry = TestRunnerClientConfigRegistry::getRegistry();
            
            $registry->registerQtiTools('markForReview', array(
                'label' => 'Mark for review',
                'icon' => 'anchor',
                'hook' => 'taoQtiTest/testRunner/actionBar/markForReview'
            ));
            
            $currentVersion = '2.8.0';
        }
        
        return $currentVersion;
    }
}
