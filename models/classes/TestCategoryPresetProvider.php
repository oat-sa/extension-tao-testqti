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
 */
/**
 * @author Christophe Noël <christophe@taotesting.com>
 */

namespace oat\taoQtiTest\models;


use oat\oatbox\service\ConfigurableService;
use oat\taoTests\models\runner\plugins\TestPluginService;

class TestCategoryPresetProvider extends ConfigurableService
{
    const SERVICE_ID = 'taoQtiTest/CategoryPresetProvider';

    const GROUP_NAVIGATION  = 'navigation';
    const GROUP_WARNING     = 'warning';
    const GROUP_TOOLS       = 'tools';

    private $allPresets;

    /**
     * TestCategoryPresetProvider constructor.
     * @param array $options
     * @param array $allPresets - allow override of preset list
     */
    public function __construct(array $options = [], $allPresets = []) {
        $this->allPresets = $allPresets;

       parent::__construct($options);
    }

    protected function getPresetGroups() {
        return [
            self::GROUP_NAVIGATION => [
                'groupId'    => self::GROUP_NAVIGATION,
                'groupLabel' => __('Test Navigation'),
                'groupOrder' => 100,
                'presets'    => []
            ],

            self::GROUP_WARNING => [
                'groupId'    => self::GROUP_WARNING,
                'groupLabel' => __('Navigation Warnings'),
                'groupOrder' => 200,
                'presets'    => []
            ],

            self::GROUP_TOOLS => [
                'groupId'    => self::GROUP_TOOLS,
                'groupLabel' => __('Test-Taker Tools'),
                'groupOrder' => 300,
                'presets'    => []
            ],
        ];
    }

    /**
     * Get all active presets
     * @return array - the sorted preset list
     */
    public function getPresets() {
        if (empty($this->allPresets)) {
            $this->loadPresetFromProviders();
        }

        $this->filterInactivePresets();
        $this->sortPresets();

        return $this->allPresets;
    }

    /**
     * Get all active presets matching the given config.
     *
     * If a preset is linked to a feature flag,
     * we add it only if the config value matching the flag is true.
     *
     * For example, if a $aPreset->featureFlag = 'foo';
     * The preset will be included only if $config['foo'] = true.
     *
     * If the config doesn't have a flag, we keep the preset.
     *
     * @param array $config a config flag list as  { key : string => value : boolean }
     * @return array the sorted preset list
     */
    public function getAvailablePresets($config = []) {
        //work on a clone
        $presets = array_merge([], $this->getPresets());

        foreach($presets as $groupId => &$presetGroup) {

            if(isset($presetGroup['presets'])){

                //filter presets based on the config value
                //if the config has the flag, we chek it's value
                //if the config doesn't have the flag, we keep the preset
                $presetGroup['presets'] = array_filter(
                    $presetGroup['presets'],
                    function($preset) use ($config) {
                        return !$this->isPresetAvailable($preset, $config);
                    }
                );

                //remove empty groups
                if(count($presetGroup['presets']) === 0){
                    unset($presets[$groupId]);
                }
            }
        }
        return $presets;
    }

    /**
     * Is a preset available according to a configuration (ie. based on it's featureFlag)
     *
     * @param TestCategoryPreset $preset the preset to test 
     * @param array $config the configuration
     * @return boolean true if available
     */
    private function isPresetAvailable(TestCategoryPreset $preset, $config = [])
    {
        if (!is_null($preset)) {
            $flag = $preset->getFeatureFlag();
            if ($flag && isset($config[$flag]) && $config[$flag] != true) {
                return true;
            }
        }
        return false;
    }

    private function loadPresetFromProviders() {
        $this->allPresets = $this->getPresetGroups();

        $providersRegistry = TestCategoryPresetRegistry::getRegistry();

        $allProviders = $providersRegistry->getMap();

        if (! empty($allProviders)) {
            foreach ($allProviders as $providerClass) {
                if (class_exists($providerClass)) {
                    $providerInstance = new $providerClass();
                    $providerInstance->registerPresets($this);
                }
            }
        }
    }

    private function filterInactivePresets() {
        $serviceLocator = $this->getServiceLocator();
        $pluginService = $serviceLocator->get(TestPluginService::SERVICE_ID);

        $allEmptyGroups = [];

        if (! empty($this->allPresets)) {
            foreach ($this->allPresets as $groupId => &$presetGroup) {

                if (! empty($presetGroup['presets'])) {

                    $presetGroup['presets'] = array_filter(
                        $presetGroup['presets'],
                        function($preset) use ($pluginService) {
                            $presetPluginId = $preset->getPluginId();

                            if (! empty($presetPluginId)) {
                                $presetPlugin = $pluginService->getPlugin($presetPluginId);
                                return ($presetPlugin !== null) ? $presetPlugin->isActive() : false;
                            }
                            return true;
                        }
                    );
                }

                if (empty($presetGroup['presets'])) {
                    $allEmptyGroups[] = $groupId;
                }
            }
        }

        // finally, remove empty groups, if any
        if (! empty($allEmptyGroups)) {
            foreach($allEmptyGroups as $emptyGroupId) {
                unset($this->allPresets[$emptyGroupId]);
            }
        }
    }

    private function sortPresets() {
        // sort presets groups
        usort($this->allPresets, function($a, $b) {
            return $this->compareNum($a['groupOrder'], $b['groupOrder']);
        });

        // sort presets
        foreach($this->allPresets as &$presetGroup) {
            if (!empty($presetGroup)) {
                usort($presetGroup['presets'], function($a, $b) {
                    return $this->compareNum($a->getOrder(), $b->getOrder());
                });
            }
        }
    }

    private function compareNum($a, $b) {
        if ($a == $b) {
            return 0;
        }
        return ($a < $b) ? -1 : 1;
    }

    /**
     * @param $presetGroup
     * @param $presets
     */
    public function register($presetGroup, $presets) {
        if (!array_key_exists($presetGroup, $this->allPresets)) {
            return;
        }
        if (!is_array($presets)) {
            $presets = [$presets];
        }
        foreach ($presets as $preset) {
            if (!in_array($preset, $this->allPresets[$presetGroup]['presets'])) {
                $this->allPresets[$presetGroup]['presets'][] = $preset;
            }
        }
    }
}
