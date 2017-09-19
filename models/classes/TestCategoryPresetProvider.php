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

    public function register($presetGroup, $presets) {
        if (array_key_exists($presetGroup, $this->allPresets)) {
            if (! is_array($presets)) {
                $presets = [$presets];
            }
            $this->allPresets[$presetGroup]['presets'] = array_merge(
                $this->allPresets[$presetGroup]['presets'],
                $presets
            );
        }
    }

}
