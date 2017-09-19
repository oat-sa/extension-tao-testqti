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
 * Copyright (c) 2017 (original work) Open Assessment Technologies SA (under the project TAO-PRODUCT);
 *
 */
/**
 * @author Christophe Noël <christophe@taotesting.com>
 */
namespace oat\taoQtiTest\test;

use oat\oatbox\service\ServiceManager;
use oat\tao\model\plugins\PluginModule;
use oat\taoQtiTest\models\TestCategoryPreset;
use oat\taoQtiTest\models\TestCategoryPresetProvider;
use oat\taoTests\models\runner\plugins\PluginRegistry;

class TestCategoryPresetProviderTest extends \PHPUnit_Framework_TestCase
{
    public function testSort()
    {
        $allPresets = [
            'group3' => [
                'groupId'    => 'group3',
                'groupLabel' => __('group1'),
                'groupOrder' => 3,
                'presets'    => [
                    TestCategoryPreset::fromArray([
                        'id'            => 'preset45',
                        'label'         => __('preset45'),
                        'qtiCategory'   => 'x-tao-option-preset45',
                        'order'         => 45
                    ]),
                    TestCategoryPreset::fromArray([
                        'id'            => 'preset137',
                        'label'         => __('preset137'),
                        'qtiCategory'   => 'x-tao-option-preset137',
                        'order'         => 137
                    ]),
                    TestCategoryPreset::fromArray([
                        'id'            => 'preset8',
                        'label'         => __('preset8'),
                        'qtiCategory'   => 'x-tao-option-preset8',
                        'order'         => 8
                    ]),
                    TestCategoryPreset::fromArray([
                        'id'            => 'preset1',
                        'label'         => __('preset1'),
                        'qtiCategory'   => 'x-tao-option-preset1',
                        'order'         => 1
                    ]),
                    TestCategoryPreset::fromArray([
                        'id'            => 'preset23',
                        'label'         => __('preset23'),
                        'qtiCategory'   => 'x-tao-option-preset23',
                        'order'         => 23
                    ])
                ]
            ],
            'group1' => [
                'groupId'    => 'group1',
                'groupLabel' => __('group1'),
                'groupOrder' => 1,
                'presets'    => [
                    TestCategoryPreset::fromArray([
                        'id'            => 'presetX',
                        'label'         => __('presetX'),
                        'qtiCategory'   => 'x-tao-option-presetx',
                        'order'         => 1
                    ])
                ]
            ],
            'group5' => [
                'groupId'    => 'group5',
                'groupLabel' => __('group5'),
                'groupOrder' => 5,
                'presets'    => [
                    TestCategoryPreset::fromArray([
                        'id'            => 'presetX',
                        'label'         => __('presetX'),
                        'qtiCategory'   => 'x-tao-option-presetx',
                        'order'         => 1
                    ])
                ]
            ],
            'group2' => [
                'groupId'    => 'group2',
                'groupLabel' => __('group2'),
                'groupOrder' => 2,
                'presets'    => [
                    TestCategoryPreset::fromArray([
                        'id'            => 'presetX',
                        'label'         => __('presetX'),
                        'qtiCategory'   => 'x-tao-option-presetx',
                        'order'         => 1
                    ])
                ]
            ]
        ];

        $presetProvider = new TestCategoryPresetProvider([], $allPresets);
        $presetProvider->setServiceLocator(ServiceManager::getServiceManager());
        $sortedPresetGroups = $presetProvider->getPresets();

        $this->assertCount(4, $sortedPresetGroups, 'sortedPresetGroups have the right number of preset groups');
        $previousOrder = 0;
        foreach($sortedPresetGroups as $group) {
            $this->assertTrue($group['groupOrder'] > $previousOrder, 'current group is sorted correctly');
            $previousOrder = $group['groupOrder'];
        }

        $sortedPresets = $sortedPresetGroups[0]['presets'];

        $previousOrder = 0;
        foreach($sortedPresets as $preset) {
            $this->assertTrue($preset->getOrder() > $previousOrder, "preset {$preset->getId()} has a sort order > as previous order {$previousOrder}");
            $previousOrder = $preset->getOrder();
        }
    }


    public function testFilterByInactivePlugins()
    {
        $allPresets = [
            // group with presets: will stay
            'group1' => [
                'groupId'    => 'group1',
                'groupLabel' => __('group1'),
                'groupOrder' => 1,
                'presets'    => [
                    // related plugin is active: will stay
                    TestCategoryPreset::fromArray([
                        'id'            => 'preset1',
                        'label'         => __('preset1'),
                        'qtiCategory'   => 'x-tao-option-preset1',
                        'order'         => 1,
                        'pluginId'      => 'plugin1'
                    ]),
                    // related plugin is NOT active: will be removed
                    TestCategoryPreset::fromArray([
                        'id'            => 'preset2',
                        'label'         => __('preset2'),
                        'qtiCategory'   => 'x-tao-option-preset2',
                        'order'         => 2,
                        'pluginId'      => 'plugin2'
                    ]),
                    // related plugin does not exist or is not registered: will be removed
                    TestCategoryPreset::fromArray([
                        'id'            => 'preset3',
                        'label'         => __('preset3'),
                        'qtiCategory'   => 'x-tao-option-preset3',
                        'order'         => 3,
                        'pluginId'      => 'plugin3'
                    ]),
                    // no related plugin: will stay
                    TestCategoryPreset::fromArray([
                        'id'            => 'preset4',
                        'label'         => __('preset4'),
                        'qtiCategory'   => 'x-tao-option-preset4',
                        'order'         => 4
                    ])
                ]
            ],
            // group with a preset related to an inactive plugin: will be removed
            'group2' => [
                'groupId'    => 'group2',
                'groupLabel' => __('group2'),
                'groupOrder' => 2,
                'presets'    => [
                    // will be removed because plugin is inactive
                    TestCategoryPreset::fromArray([
                        'id'            => 'preset10',
                        'label'         => __('preset10'),
                        'qtiCategory'   => 'x-tao-option-preset10',
                        'order'         => 1,
                        'pluginId'      => 'plugin10'
                    ])
                ]
            ],
            // group without preset: will be removed
            'group3' => [
                'groupId'    => 'group3',
                'groupLabel' => __('group3'),
                'groupOrder' => 3,
                'presets'    => []
            ]
        ];

        $pluginRegistry = PluginRegistry::getRegistry();
        $pluginRegistry->register(PluginModule::fromArray([
                'id'          => 'plugin1',
                'module'      => 'test/plugin1',
                'category'    => 'plugins',
                'active'      => true
        ]));
        $pluginRegistry->register(PluginModule::fromArray([
                'id'          => 'plugin2',
                'module'      => 'test/plugin2',
                'category'    => 'plugins',
                'active'      => false
        ]));
        $pluginRegistry->register(PluginModule::fromArray([
                'id'          => 'plugin10',
                'module'      => 'test/plugin10',
                'category'    => 'plugins',
                'active'      => false
         ]));

        $presetProvider = new TestCategoryPresetProvider([], $allPresets);
        $presetProvider->setServiceLocator(ServiceManager::getServiceManager());
        $filteredPresetGroups = $presetProvider->getPresets();

        $this->assertCount(1, $filteredPresetGroups, 'filteredPresetGroups have the right number of preset groups');

        $filteredPresets = $filteredPresetGroups[0]['presets'];

        $this->assertCount(2, $filteredPresets, '$filteredPresets have the right number of presets');

        $this->assertEquals('preset1', $filteredPresets[0]->getId(), 'first remaining preset is the expected one');
        $this->assertEquals('preset4', $filteredPresets[1]->getId(), 'second remaining preset is the expected one');
    }

}

