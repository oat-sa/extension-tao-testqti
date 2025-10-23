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
 * Copyright (c) 2022 (original work) Open Assessment Technologies SA;
 */
define([
    'lodash',
    'taoQtiTest/controller/creator/helpers/testPartCategory'
], function(_, testPartCategory) {
    'use strict';

    const _testPartModel = {
        'qti-type': 'testPart',
        assessmentSections: [
            {
                'qti-type': 'assessmentSection',
                sectionParts: [
                    {
                        'qti-type': 'assessmentItemRef',
                        categories: ['A', 'B']
                    },
                    {
                        'qti-type': 'assessmentItemRef',
                        categories: ['A', 'B']
                    }
                ]
            },
            {
                'qti-type': 'assessmentSection',
                sectionParts: [
                    {
                        'qti-type': 'assessmentItemRef',
                        categories: ['A', 'B', 'C', 'D']
                    },
                    {
                        'qti-type': 'assessmentItemRef',
                        categories: ['A', 'B', 'D', 'E', 'F']
                    }
                ]
            },
        ]
    };

    const _testPartModelNested = {
        'qti-type': 'testPart',
        assessmentSections: [
            {
                'qti-type': 'assessmentSection',
                sectionParts: [
                    {
                        'qti-type': 'assessmentSection',
                        sectionParts: [
                            {
                                'qti-type': 'assessmentItemRef',
                                categories: ['A', 'B']
                            },
                            {
                                'qti-type': 'assessmentItemRef',
                                categories: ['A', 'B']
                            }
                        ]
                    },
                ]
            },
            {
                'qti-type': 'assessmentSection',
                sectionParts: [
                    {
                        'qti-type': 'assessmentItemRef',
                        categories: ['A', 'B', 'C', 'D']
                    },
                    {
                        'qti-type': 'assessmentItemRef',
                        categories: ['A', 'B', 'D', 'E', 'F']
                    }
                ]
            },
        ]
    };

    QUnit.test('isValidTestPartModel', function(assert) {
        assert.ok(testPartCategory.isValidTestPartModel(_testPartModel));

        assert.ok(testPartCategory.isValidTestPartModel(_testPartModelNested));

        assert.notOk(testPartCategory.isValidTestPartModel({
            'qti-type': 'assessmentItemRef',
            categories: ['A', 'B', 'C', 'D']
        }));

        assert.notOk(testPartCategory.isValidTestPartModel({
            'qti-type': 'assessmentSection',
            sectionParts: []
        }));

        assert.notOk(testPartCategory.isValidTestPartModel({
            'qti-type': 'testPart',
            assessmentSections: null
        }));

        assert.notOk(testPartCategory.isValidTestPartModel({
            'qti-type': 'testPart',
            assessmentSections: [
                {
                    'qti-type': 'assessmentSection',
                    sectionParts: null
                }
            ]
        }));
    });

    QUnit.cases.init([
        { title: 'not nested', testPartModel: _.cloneDeep(_testPartModel) },
        { title: 'nested', testPartModel: _.cloneDeep(_testPartModelNested) }
    ]).test('getCategories ', function(data, assert) {
        const categories = testPartCategory.getCategories(_.cloneDeep(data.testPartModel));
        assert.deepEqual(categories.all, ['A', 'B', 'C', 'D', 'E', 'F'], 'all categories found');
        assert.deepEqual(categories.propagated, ['A', 'B'], 'propagated categories found');
        assert.deepEqual(categories.partial, ['C', 'D', 'E', 'F'], 'partial categories found');
    });

    QUnit.cases.init([
        { title: 'not nested', testPartModel: _.cloneDeep(_testPartModel) },
        { title: 'nested', testPartModel: _.cloneDeep(_testPartModelNested) }
    ]).test('addCategories ', function(data, assert) {
        const testPartModel = _.cloneDeep(data.testPartModel);
        let categories = testPartCategory.getCategories(testPartModel);

        assert.deepEqual(categories.all, ['A', 'B', 'C', 'D', 'E', 'F'], 'all categories found');
        assert.deepEqual(categories.propagated, ['A', 'B'], 'propagated categories found');
        assert.deepEqual(categories.partial, ['C', 'D', 'E', 'F'], 'partial categories found');

        //Add a new category
        testPartCategory.addCategories(testPartModel, ['G']);
        categories = testPartCategory.getCategories(testPartModel);
        assert.deepEqual(categories.all, ['A', 'B', 'G', 'C', 'D', 'E', 'F'], 'all categories found');
        assert.deepEqual(categories.propagated, ['A', 'B', 'G'], 'propagated categories found');
        assert.deepEqual(categories.partial, ['C', 'D', 'E', 'F'], 'partial categories found');

        //Try adding an exiting one
        testPartCategory.addCategories(testPartModel, ['A', 'C']);
        assert.deepEqual(categories.all, ['A', 'B', 'G', 'C', 'D', 'E', 'F'], 'all categories found');
        assert.deepEqual(categories.propagated, ['A', 'B', 'G'], 'propagated categories found');
        assert.deepEqual(categories.partial, ['C', 'D', 'E', 'F'], 'partial categories found');
    });

    QUnit.cases.init([
        { title: 'not nested', testPartModel: _.cloneDeep(_testPartModel) },
        { title: 'nested', testPartModel: _.cloneDeep(_testPartModelNested) }
    ]).test('removeCategories ', function(data, assert) {
        const testPartModel = _.cloneDeep(data.testPartModel);
        let categories = testPartCategory.getCategories(testPartModel);

        assert.deepEqual(categories.all, ['A', 'B', 'C', 'D', 'E', 'F'], 'all categories found');
        assert.deepEqual(categories.propagated, ['A', 'B'], 'propagated categories found');
        assert.deepEqual(categories.partial, ['C', 'D', 'E', 'F'], 'partial categories found');

        //Remove one element from the propagated categories
        testPartCategory.removeCategories(testPartModel, ['A']);
        categories = testPartCategory.getCategories(testPartModel);
        assert.deepEqual(categories.all, ['B', 'C', 'D', 'E', 'F'], 'all categories found');
        assert.deepEqual(categories.propagated, ['B'], 'propagated categories found');
        assert.deepEqual(categories.partial, ['C', 'D', 'E', 'F'], 'partial categories found');

        //Remove one element from the partial categories
        testPartCategory.removeCategories(testPartModel, ['F']);
        categories = testPartCategory.getCategories(testPartModel);
        assert.deepEqual(categories.all, ['B', 'C', 'D', 'E'], 'all categories found');
        assert.deepEqual(categories.propagated, ['B'], 'propagated categories found');
        assert.deepEqual(categories.partial, ['C', 'D', 'E'], 'partial categories found');

        //Remove one element on each group of categories (propagated+partial)
        testPartCategory.removeCategories(testPartModel, ['B', 'D']);
        categories = testPartCategory.getCategories(testPartModel);
        assert.deepEqual(categories.all, ['C', 'E'], 'all categories found');
        assert.deepEqual(categories.propagated, [], 'propagated categories found');
        assert.deepEqual(categories.partial, ['C', 'E'], 'partial categories found');
    });

    QUnit.cases.init([
        { title: 'not nested', testPartModel: _.cloneDeep(_testPartModel) },
        { title: 'nested', testPartModel: _.cloneDeep(_testPartModelNested) }
    ]).test('setCategories ', function(data, assert) {
        const testPartModel = _.cloneDeep(data.testPartModel);
        let categories = testPartCategory.getCategories(testPartModel);

        assert.deepEqual(categories.all, ['A', 'B', 'C', 'D', 'E', 'F'], 'all categories found');
        assert.deepEqual(categories.propagated, ['A', 'B'], 'propagated categories found');
        assert.deepEqual(categories.partial, ['C', 'D', 'E', 'F'], 'partial categories found');

        //Remove B, E and F and add G
        testPartCategory.setCategories(testPartModel, ['A', 'G'], ['C', 'D']);

        //Check result
        categories = testPartCategory.getCategories(testPartModel);
        assert.deepEqual(categories.all, ['A', 'G', 'C', 'D'], 'all categories found');
        assert.deepEqual(categories.propagated, ['A', 'G'], 'propagated categories found');
        assert.deepEqual(categories.partial, ['C', 'D'], 'partial categories found');
    });

    QUnit.test('setCategories: handle indeterminated/partial add and removal', function(assert) {
        const testPartModel = _.cloneDeep(_testPartModel);
        let categories = testPartCategory.getCategories(testPartModel);

        assert.deepEqual(categories.all, ['A', 'B', 'C', 'D', 'E', 'F'], 'all categories found');
        assert.deepEqual(categories.propagated, ['A', 'B'], 'propagated categories found');
        assert.deepEqual(categories.partial, ['C', 'D', 'E', 'F'], 'partial categories found');

        // Remove A, propagate C, remove F, add G
        testPartCategory.setCategories(testPartModel, ['B', 'C', 'G'], ['D', 'E']);

        //Check result
        categories = testPartCategory.getCategories(testPartModel);
        assert.deepEqual(categories.all, ['B', 'C', 'G', 'D', 'E'], 'all categories found');
        assert.deepEqual(categories.propagated, ['B', 'C', 'G'], 'propagated categories found');
        assert.deepEqual(categories.partial, ['D', 'E'], 'partial categories found');
    });
});
