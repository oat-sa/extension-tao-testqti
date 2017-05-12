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
define([
    'jquery',
    'taoQtiTest/controller/creator/helpers/categorySelector'
], function ($, categorySelectorFactory) {
    'use strict';

    var allPresets = [{
        groupId: 'group1',
        groupLabel: 'group1',
        presets: [
            {
                id: 'preset1.1',
                label: 'preset1.1',
                qtiCategory : 'x-tao-option-preset1.1',
                description : 'Description of preset1.1'
            },
            {
                id: 'preset1.2',
                label: 'preset1.2',
                qtiCategory : 'x-tao-option-preset1.2',
                description : 'Description of preset1.2'
            },
            {
                id: 'preset1.3',
                label: 'preset1.3',
                qtiCategory : 'x-tao-option-preset1.3',
                description : 'Description of preset1.3'
            }
        ]
    }, {
        groupId: 'group2',
        groupLabel: 'group2',
        presets: [
            {
                id: 'preset2.1',
                label: 'preset2.1',
                qtiCategory : 'x-tao-option-preset2.1',
                description : 'Description of preset2.1'
            },
            {
                id: 'preset2.2',
                label: 'preset2.2',
                qtiCategory : 'x-tao-option-preset2.2',
                description : 'Description of preset2.2'
            },
            {
                id: 'preset2.3',
                label: 'preset2.3',
                qtiCategory : 'x-tao-option-preset2.3',
                description : 'Description of preset2.3'
            }
        ]
    }];

    categorySelectorFactory.setPresets(allPresets);

    QUnit.module('plugin');

    QUnit.test('module', function (assert) {
        QUnit.expect(1);

        assert.ok(typeof categorySelectorFactory === 'function', 'The module expose a function');
    });

    QUnit
        .cases([
            { title: 'createForm' },
            { title: 'updateFormState' }
        ])
        .test('API', function(data, assert) {
            var categorySelector = categorySelectorFactory($('<div>'));
            QUnit.expect(1);

            assert.ok(typeof categorySelector[data.title] === 'function', 'module has an ' + data.title + ' method');
        });

    QUnit.module('Category Selector');

    QUnit.test('.createForm() creates the preset checkboxes', function(assert) {
        var $container = $('#qunit-fixture'),
            categorySelector = categorySelectorFactory($container),
            $presets;

        QUnit.expect(9);

        categorySelector.createForm();

        assert.equal($container.find('h4').length, 2, 'correct number of category groups have been rendered');

        $presets = $container.find('.category-preset-group-group1 .category-preset');
        assert.equal($presets.length, 3, 'group 1 contains the right number of presets');
        assert.equal($presets.find('input').eq(0).val(), 'x-tao-option-preset1.1', 'preset 1.1 has the right value');
        assert.equal($presets.find('input').eq(1).val(), 'x-tao-option-preset1.2', 'preset 1.2 has the right value');
        assert.equal($presets.find('input').eq(2).val(), 'x-tao-option-preset1.3', 'preset 1.3 has the right value');

        $presets = $container.find('.category-preset-group-group2 .category-preset');
        assert.equal($presets.length, 3, 'group 2 contains the right number of presets');
        assert.equal($presets.find('input').eq(0).val(), 'x-tao-option-preset2.1', 'preset 2.1 has the right value');
        assert.equal($presets.find('input').eq(1).val(), 'x-tao-option-preset2.2', 'preset 2.2 has the right value');
        assert.equal($presets.find('input').eq(2).val(), 'x-tao-option-preset2.3', 'preset 2.3 has the right value');
    });

    QUnit.test('.updateFormState() sets the right state at item level', function(assert) {
        var $container = $('#qunit-fixture'),
            categorySelector = categorySelectorFactory($container),
            selected = [
                'x-tao-option-preset1.1',
                'x-tao-option-preset1.2',
                'x-tao-option-preset2.3',
                'custom1',
                'custom2'
            ];

        QUnit.expect(7);

        categorySelector.createForm();
        categorySelector.updateFormState(selected);

        assert.equal($container.find('input[value="x-tao-option-preset1.1"]').prop('checked'), true, 'preset 1.1 is checked');
        assert.equal($container.find('input[value="x-tao-option-preset1.2"]').prop('checked'), true, 'preset 1.2 is checked');
        assert.equal($container.find('input[value="x-tao-option-preset1.3"]').prop('checked'), false, 'preset 1.3 is NOT checked');
        assert.equal($container.find('input[value="x-tao-option-preset2.1"]').prop('checked'), false, 'preset 2.1 is NOT checked');
        assert.equal($container.find('input[value="x-tao-option-preset2.2"]').prop('checked'), false, 'preset 2.2 is NOT checked');
        assert.equal($container.find('input[value="x-tao-option-preset2.3"]').prop('checked'), true, 'preset 2.3 is checked');

        assert.equal($container.find('input[name="category-custom"]').val(), 'custom1,custom2', 'custom categories have been set');
    });

    QUnit.test('.updateFormState() sets the right state at section level', function(assert) {
        var $container = $('#qunit-fixture'),
            categorySelector = categorySelectorFactory($container),
            selected = [
                'x-tao-option-preset1.1',
                'x-tao-option-preset2.3',
                'custom1',
                'custom3'
            ],
            indeterminate = [
                'x-tao-option-preset1.2',
                'x-tao-option-preset2.2',
                'custom2'
            ],
            $customCategories;

        QUnit.expect(19);

        categorySelector.createForm();
        categorySelector.updateFormState(selected, indeterminate);

        assert.equal($container.find('input[value="x-tao-option-preset1.1"]').prop('checked'), true, 'preset 1.1 is checked');
        assert.equal($container.find('input[value="x-tao-option-preset1.2"]').prop('checked'), false, 'preset 1.2 is NOT checked');
        assert.equal($container.find('input[value="x-tao-option-preset1.3"]').prop('checked'), false, 'preset 1.3 is NOT checked');
        assert.equal($container.find('input[value="x-tao-option-preset2.1"]').prop('checked'), false, 'preset 2.1 is NOT checked');
        assert.equal($container.find('input[value="x-tao-option-preset2.2"]').prop('checked'), false, 'preset 2.2 is NOT checked');
        assert.equal($container.find('input[value="x-tao-option-preset2.3"]').prop('checked'), true, 'preset 2.3 is checked');

        assert.equal($container.find('input[value="x-tao-option-preset1.1"]').prop('indeterminate'), false, 'preset 1.1 is NOT indeterminate');
        assert.equal($container.find('input[value="x-tao-option-preset1.2"]').prop('indeterminate'), true, 'preset 1.2 is indeterminate');
        assert.equal($container.find('input[value="x-tao-option-preset1.3"]').prop('indeterminate'), false, 'preset 1.3 is NOT indeterminate');
        assert.equal($container.find('input[value="x-tao-option-preset2.1"]').prop('indeterminate'), false, 'preset 2.1 is NOT indeterminate');
        assert.equal($container.find('input[value="x-tao-option-preset2.2"]').prop('indeterminate'), true, 'preset 2.2 is indeterminate');
        assert.equal($container.find('input[value="x-tao-option-preset2.3"]').prop('indeterminate'), false, 'preset 2.3 is NOT indeterminate');

        assert.equal($container.find('input[name="category-custom"]').val(), 'custom1,custom3,custom2', 'custom categories have been set');

        $customCategories = $container.find('.select2-search-choice');
        assert.equal($customCategories.eq(0).text().trim(), 'custom1', 'custom1 has been rendered');
        assert.equal($customCategories.eq(0).hasClass('partial'), false, 'custom1 is NOT indeterminate');
        assert.equal($customCategories.eq(1).text().trim(), 'custom3', 'custom3 has been rendered');
        assert.equal($customCategories.eq(1).hasClass('partial'), false, 'custom3 is NOT indeterminate');
        assert.equal($customCategories.eq(2).text().trim(), 'custom2', 'custom2 has been rendered');
        assert.equal($customCategories.eq(2).hasClass('partial'), true, 'custom2 is indeterminate');
    });

    QUnit.asyncTest('Transmit the correct state following user selection', function(assert) {
        var $container = $('#qunit-fixture'),
            categorySelector = categorySelectorFactory($container),
            selected = [
                'x-tao-option-preset1.1',
                'x-tao-option-preset2.3',
                'custom1',
                'custom3'
            ],
            indeterminate = [
                'x-tao-option-preset1.2',
                'x-tao-option-preset2.2',
                'custom2'
            ],
            $preset,
            $customCategories,
            changeCounter = 0;

        QUnit.expect(12);

        categorySelector.createForm();
        categorySelector.updateFormState(selected, indeterminate);

        categorySelector.after('category-change', function(newSelected, newIndeterminate) {
            var expectedSelected,
                expectedIndeterminate;

            changeCounter++;

            switch (changeCounter) {
                case 1: {
                    expectedSelected = [
                        'x-tao-option-preset2.3',
                        'custom1',
                        'custom3'
                    ];
                    assert.deepEqual(newSelected, expectedSelected, 'x-tao-option-preset1.1 category has been removed');
                    assert.deepEqual(newIndeterminate, indeterminate, 'indeterminate have not changed');

                    // add back x-tao-option-preset1.1
                    $preset = $container.find('input[value="x-tao-option-preset1.1"]');
                    $preset.click();

                    break;
                }
                case 2: {
                    expectedSelected = [
                        'x-tao-option-preset1.1',
                        'x-tao-option-preset2.3',
                        'custom1',
                        'custom3'
                    ];
                    assert.deepEqual(newSelected, expectedSelected, 'x-tao-option-preset1.1 category has been added again');
                    assert.deepEqual(newIndeterminate, indeterminate, 'indeterminate have not changed');

                    // add ex-indeterminate x-tao-option-preset1.2
                    $preset = $container.find('input[value="x-tao-option-preset1.2"]');
                    $preset.click();

                    break;
                }
                case 3: {
                    expectedSelected = [
                        'x-tao-option-preset1.1',
                        'x-tao-option-preset1.2',
                        'x-tao-option-preset2.3',
                        'custom1',
                        'custom3'
                    ];
                    expectedIndeterminate = [
                        'x-tao-option-preset2.2',
                        'custom2'
                    ];
                    assert.deepEqual(newSelected, expectedSelected, 'x-tao-option-preset2.2 category has been added');
                    assert.deepEqual(newIndeterminate, expectedIndeterminate, 'x-tao-option-preset2.2 has been removed from indeterminate');

                    // remove ex-indeterminate x-tao-option-preset1.2
                    $preset = $container.find('input[value="x-tao-option-preset1.2"]');
                    $preset.click();

                    break;
                }
                case 4: {
                    expectedSelected = [
                        'x-tao-option-preset1.1',
                        'x-tao-option-preset2.3',
                        'custom1',
                        'custom3'
                    ];
                    expectedIndeterminate = [
                        'x-tao-option-preset2.2',
                        'custom2'
                    ];
                    assert.deepEqual(newSelected, expectedSelected, 'x-tao-option-preset2.2 category has been removed');
                    assert.deepEqual(newIndeterminate, expectedIndeterminate, 'x-tao-option-preset2.2 has been removed from indeterminate');

                    // remove indeterminate custom2
                    $customCategories.val('custom1,custom3');
                    $customCategories.trigger('change');

                    break;
                }
                case 5: {
                    expectedSelected = [
                        'x-tao-option-preset1.1',
                        'x-tao-option-preset2.3',
                        'custom1',
                        'custom3'
                    ];
                    expectedIndeterminate = [
                        'x-tao-option-preset2.2'
                    ];
                    assert.deepEqual(newSelected, expectedSelected, 'nothing has changed here');
                    assert.deepEqual(newIndeterminate, expectedIndeterminate, 'custom2 has been removed from indeterminate');

                    // add back custom2
                    $customCategories.val('custom1,custom2,custom3');
                    $customCategories.trigger('change');

                    break;
                }
                case 6: {
                    expectedSelected = [
                        'x-tao-option-preset1.1',
                        'x-tao-option-preset2.3',
                        'custom1',
                        'custom2',
                        'custom3'
                    ];
                    expectedIndeterminate = [
                        'x-tao-option-preset2.2'
                    ];
                    assert.deepEqual(newSelected, expectedSelected, 'custom2 has been added to selected');
                    assert.deepEqual(newIndeterminate, expectedIndeterminate, 'custom2 has been removed from indeterminate');

                    $customCategories.val('custom1,custom2,custom3');
                    $customCategories.trigger('change');

                    QUnit.start();

                    break;
                }
            }
        });

        $customCategories = $container.find('input[name="category-custom"]');

        // remove x-tao-option-preset1.1
        $preset = $container.find('input[value="x-tao-option-preset1.1"]');
        $preset.click();

    });

});