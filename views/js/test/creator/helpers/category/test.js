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
 * Copyright (c) 2017 (original work) Open Assessment Technologies SA ;
 */
/**
 * @author Jean-Sébastien Conan <jean-sebastien@taotesting.com>
 */
define([
    'lodash',
    'taoQtiTest/controller/creator/helpers/category',
    'json!taoQtiTest/test/creator/samples/categories.json'
], function (_,
             categoryHelper,
             testModelSample) {
    'use strict';

    var categoryHelperApi = [
        {title: 'eachCategories'},
        {title: 'listCategories'},
        {title: 'listOptions'}
    ];


    QUnit.module('helpers/category');


    QUnit.test('module', function (assert) {
        QUnit.expect(1);
        assert.equal(typeof categoryHelper, 'object', "The category helper module exposes an object");
    });


    QUnit
        .cases(categoryHelperApi)
        .test('helpers/category API ', function (data, assert) {
            QUnit.expect(1);
            assert.equal(typeof categoryHelper[data.title], 'function', 'The category helper exposes a "' + data.title + '" function');
        });


    QUnit.test('helpers/category.eachCategories()', function (assert) {
        var path = [{
            category: 'history',
            item: 'item-1'
        }, {
            category: 'x-tao-option-reviewScreen',
            item: 'item-1'
        }, {
            category: 'math',
            item: 'item-3'
        }, {
            category: 'x-tao-option-reviewScreen',
            item: 'item-3'
        }, {
            category: 'math',
            item: 'item-2'
        }, {
            category: 'x-tao-option-reviewScreen',
            item: 'item-2'
        }, {
            category: 'x-tao-option-calculator',
            item: 'item-2'
        }, {
            category: 'history',
            item: 'item-4'
        }, {
            category: 'history',
            item: 'item-5'
        }, {
            category: 'math',
            item: 'item-6'
        }];
        var pointer = 0;

        categoryHelper.eachCategories(testModelSample, function(category, itemRef) {
            assert.equal(category, path[pointer].category, 'The category helper loop over the right category');
            assert.equal(itemRef.identifier, path[pointer].item, 'The category helper loop over the right item ref');
            pointer ++;
        });

        QUnit.expect(1 + path.length * 2);

        assert.equal(pointer, path.length, 'The category helper returns the right categories');
    });


    QUnit.test('helpers/category.listCategories()', function (assert) {
        var expectedCategories = ['history', 'math'];
        var categories = categoryHelper.listCategories(testModelSample);

        categories.sort();
        expectedCategories.sort();

        QUnit.expect(1);

        assert.deepEqual(categories, expectedCategories, 'The category helper returns the right categories');
    });


    QUnit.test('helpers/category.listOptions()', function (assert) {
        var expectedOptions = ['x-tao-option-calculator', 'x-tao-option-reviewScreen'];
        var options = categoryHelper.listOptions(testModelSample);

        options.sort();
        expectedOptions.sort();

        QUnit.expect(1);

        assert.deepEqual(options, expectedOptions, 'The category helper returns the right options');
    });

});
