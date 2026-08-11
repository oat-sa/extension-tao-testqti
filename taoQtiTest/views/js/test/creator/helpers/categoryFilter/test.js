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
 * Foundation, Inc., 31 Milk St # 960789 Boston, MA 02196 USA.
 *
 * Copyright (c) 2025 (original work) Open Assessment Technologies SA;
 */

define(['taoQtiTest/controller/creator/helpers/categoryFilter'], function(categoryFilter) {
    'use strict';

    var categoryFilterApi = [
        { title: 'getVisibleCategories' },
        { title: 'isVisibleCategory' },
        { title: 'countVisibleCategories' }
    ];

    QUnit.module('helpers/categoryFilter');

    QUnit.test('module', function(assert) {
        assert.expect(1);
        assert.equal(typeof categoryFilter, 'object', 'The categoryFilter helper module exposes an object');
    });

    QUnit.cases
        .init(categoryFilterApi)
        .test('helpers/categoryFilter API ', function(data, assert) {
            assert.expect(1);
            assert.equal(
                typeof categoryFilter[data.title],
                'function',
                'The categoryFilter helper exposes a "' + data.title + '" function'
            );
        });

    QUnit.test('helpers/categoryFilter.getVisibleCategories() - basic filtering', function(assert) {
        var categories = ['math', 'x-tao-option-calculator', 'history', 'x-tao-itemtype-qti', 'geography'];
        var result = categoryFilter.getVisibleCategories(categories);

        assert.expect(4);
        assert.equal(result.length, 3, 'Should return 3 visible categories');
        assert.ok(result.indexOf('math') !== -1, 'Should include "math"');
        assert.ok(result.indexOf('history') !== -1, 'Should include "history"');
        assert.ok(result.indexOf('geography') !== -1, 'Should include "geography"');
    });

    QUnit.test('helpers/categoryFilter.getVisibleCategories() - filters x-tao- prefix', function(assert) {
        var categories = ['x-tao-option-reviewScreen', 'x-tao-option-calculator', 'x-tao-itemtype-qti'];
        var result = categoryFilter.getVisibleCategories(categories);

        assert.expect(1);
        assert.equal(result.length, 0, 'Should filter out all x-tao- prefixed categories');
    });

    QUnit.test('helpers/categoryFilter.getVisibleCategories() - empty input', function(assert) {
        assert.expect(3);
        assert.deepEqual(categoryFilter.getVisibleCategories([]), [], 'Should return empty array for empty input');
        assert.deepEqual(categoryFilter.getVisibleCategories(null), [], 'Should return empty array for null');
        assert.deepEqual(categoryFilter.getVisibleCategories(undefined), [], 'Should return empty array for undefined');
    });

    QUnit.test('helpers/categoryFilter.getVisibleCategories() - invalid values', function(assert) {
        var categories = ['math', null, undefined, '', 'history', 123, {}, []];
        var result = categoryFilter.getVisibleCategories(categories);

        assert.expect(3);
        assert.equal(result.length, 2, 'Should filter out invalid values');
        assert.ok(result.indexOf('math') !== -1, 'Should include "math"');
        assert.ok(result.indexOf('history') !== -1, 'Should include "history"');
    });

    QUnit.test('helpers/categoryFilter.getVisibleCategories() - case insensitive', function(assert) {
        var categories = ['math', 'X-TAO-OPTION-TEST', 'X-tao-MixedCase', 'history'];
        var result = categoryFilter.getVisibleCategories(categories);

        assert.expect(3);
        assert.equal(result.length, 2, 'Should filter case-insensitively');
        assert.ok(result.indexOf('math') !== -1, 'Should include "math"');
        assert.ok(result.indexOf('history') !== -1, 'Should include "history"');
    });

    QUnit.test('helpers/categoryFilter.getVisibleCategories() - custom pattern', function(assert) {
        var categories = ['math', 'custom-internal-cat', 'history', 'custom-test'];
        var customPattern = /^custom-/;
        var result = categoryFilter.getVisibleCategories(categories, customPattern);

        assert.expect(3);
        assert.equal(result.length, 2, 'Should filter using custom pattern');
        assert.ok(result.indexOf('math') !== -1, 'Should include "math"');
        assert.ok(result.indexOf('history') !== -1, 'Should include "history"');
    });

    QUnit.test('helpers/categoryFilter.isVisibleCategory() - visible categories', function(assert) {
        assert.expect(3);
        assert.ok(categoryFilter.isVisibleCategory('math'), '"math" should be visible');
        assert.ok(categoryFilter.isVisibleCategory('history'), '"history" should be visible');
        assert.ok(categoryFilter.isVisibleCategory('geography-europe'), '"geography-europe" should be visible');
    });

    QUnit.test('helpers/categoryFilter.isVisibleCategory() - internal categories', function(assert) {
        assert.expect(4);
        assert.notOk(categoryFilter.isVisibleCategory('x-tao-option-calculator'), 'Should be hidden');
        assert.notOk(categoryFilter.isVisibleCategory('x-tao-itemtype-qti'), 'Should be hidden');
        assert.notOk(categoryFilter.isVisibleCategory('X-TAO-UPPERCASE'), 'Should be hidden (case insensitive)');
        assert.notOk(categoryFilter.isVisibleCategory('X-tao-MixedCase'), 'Should be hidden (case insensitive)');
    });

    QUnit.test('helpers/categoryFilter.isVisibleCategory() - invalid input', function(assert) {
        assert.expect(5);
        assert.notOk(categoryFilter.isVisibleCategory(null), 'null should return false');
        assert.notOk(categoryFilter.isVisibleCategory(undefined), 'undefined should return false');
        assert.notOk(categoryFilter.isVisibleCategory(''), 'empty string should return false');
        assert.notOk(categoryFilter.isVisibleCategory(123), 'number should return false');
        assert.notOk(categoryFilter.isVisibleCategory({}), 'object should return false');
    });

    QUnit.test('helpers/categoryFilter.isVisibleCategory() - custom pattern', function(assert) {
        var customPattern = /^internal-/;

        assert.expect(2);
        assert.ok(categoryFilter.isVisibleCategory('math', customPattern), '"math" should be visible');
        assert.notOk(
            categoryFilter.isVisibleCategory('internal-test', customPattern),
            '"internal-test" should be hidden with custom pattern'
        );
    });

    QUnit.test('helpers/categoryFilter.countVisibleCategories() - basic count', function(assert) {
        var categories = ['math', 'x-tao-option-calculator', 'history', 'x-tao-itemtype-qti'];
        var count = categoryFilter.countVisibleCategories(categories);

        assert.expect(1);
        assert.equal(count, 2, 'Should count 2 visible categories');
    });

    QUnit.test('helpers/categoryFilter.countVisibleCategories() - empty and invalid', function(assert) {
        assert.expect(3);
        assert.equal(categoryFilter.countVisibleCategories([]), 0, 'Should return 0 for empty array');
        assert.equal(categoryFilter.countVisibleCategories(null), 0, 'Should return 0 for null');
        assert.equal(categoryFilter.countVisibleCategories(undefined), 0, 'Should return 0 for undefined');
    });

    QUnit.test('helpers/categoryFilter.countVisibleCategories() - all internal', function(assert) {
        var categories = ['x-tao-option-a', 'x-tao-option-b', 'x-tao-itemtype-c'];
        var count = categoryFilter.countVisibleCategories(categories);

        assert.expect(1);
        assert.equal(count, 0, 'Should return 0 when all categories are internal');
    });

    QUnit.test('helpers/categoryFilter.countVisibleCategories() - all visible', function(assert) {
        var categories = ['math', 'history', 'geography', 'science'];
        var count = categoryFilter.countVisibleCategories(categories);

        assert.expect(1);
        assert.equal(count, 4, 'Should count all categories when none are internal');
    });
});
