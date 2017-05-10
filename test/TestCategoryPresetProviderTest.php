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
 * Copyright (c) 2016 (original work) Open Assessment Technologies SA (under the project TAO-PRODUCT);
 *
 */
/**
 * @author Christophe Noël <christophe@taotesting.com>
 */
namespace oat\taoQtiTest\test;

use oat\taoQtiTest\models\TestCategoryPreset;
use oat\taoQtiTest\models\TestCategoryPresetProvider;

class TestCategoryPresetProviderTest extends \PHPUnit_Framework_TestCase
{
    public function testSort()
    {
        $allCategories = [
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
                'presets'    => []
            ],
            'group5' => [
                'groupId'    => 'group5',
                'groupLabel' => __('group5'),
                'groupOrder' => 5,
                'presets'    => []
            ],
            'group2' => [
                'groupId'    => 'group2',
                'groupLabel' => __('group2'),
                'groupOrder' => 2,
                'presets'    => []
            ]
        ];



        $presetProvider = new TestCategoryPresetProvider([], $allCategories);
        $sortedCategories = $presetProvider->getPresets();

        $this->assertCount(4, $sortedCategories, 'sortedCategories have the right size');
        $previousOrder = 0;
        forEach($sortedCategories as $group) {
            $this->assertTrue($group['groupOrder'] > $previousOrder, 'current group is sorted correctly');
            $previousOrder = $group['groupOrder'];
        }

        $allPresets = $sortedCategories[0]['presets'];

        $previousOrder = 0;
        forEach($allPresets as $preset) {
            $this->assertTrue($preset->getOrder() > $previousOrder, "preset {$preset->getId()} has a sort order > {$previousOrder}");
            $previousOrder = $preset->getOrder();
        }

    }

}

