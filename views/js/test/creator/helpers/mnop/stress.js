/**
 * MNOP Stress Tests - Simplified Synchronous Version
 * 
 * These tests evaluate MNOP calculation performance with large datasets
 * by directly mocking the score cache (no API calls).
 */
define([
    'lodash',
    'taoQtiTest/controller/creator/helpers/mnop'
], function(_, mnopHelper) {
    'use strict';

    QUnit.module('MNOP Stress Tests', {
        beforeEach: function() {
            mnopHelper.clearCache();
        }
    });

    /**
     * Generate test model with N items
     */
    function generateTestModel(itemCount, options) {
        options = options || {};
        var itemsPerSection = options.itemsPerSection || 10;
        var useWeights = options.useWeights || false;
        var categoryCount = options.categoryCount || 5;
        var categoriesPerItem = options.categoriesPerItem || 3;

        var categories = [];
        for (var c = 0; c < categoryCount; c++) {
            categories.push('Category' + (c + 1));
        }

        var items = [];
        for (var i = 0; i < itemCount; i++) {
            var itemCategories = [];
            for (var cat = 0; cat < categoriesPerItem && cat < categoryCount; cat++) {
                itemCategories.push(categories[(i + cat) % categoryCount]);
            }

            var item = {
                'qti-type': 'assessmentItemRef',
                identifier: 'item-' + (i + 1),
                href: 'item-' + (i + 1) + '.xml',
                categories: itemCategories
            };

            if (useWeights) {
                item.weights = [{
                    identifier: 'coefficient',
                    value: 1 + (i % 5) * 0.5  // 1.0, 1.5, 2.0, 2.5, 3.0
                }];
            }

            items.push(item);
        }

        // Organize into sections
        var sectionCount = Math.ceil(itemCount / itemsPerSection);
        var sections = [];

        for (var s = 0; s < sectionCount; s++) {
            var startIdx = s * itemsPerSection;
            var endIdx = Math.min(startIdx + itemsPerSection, itemCount);
            sections.push({
                'qti-type': 'assessmentSection',
                identifier: 'section-' + (s + 1),
                sectionParts: items.slice(startIdx, endIdx)
            });
        }

        return {
            'qti-type': 'assessmentTest',
            identifier: 'stress-test',
            testParts: [{
                'qti-type': 'testPart',
                identifier: 'testpart-1',
                assessmentSections: sections
            }]
        };
    }

    /**
     * Mock score cache (no API calls)
     */
    function mockScores(testModel) {
        var cache = {};
        var idx = 0;

        _.forEach(testModel.testParts, function(testPart) {
            _.forEach(testPart.assessmentSections, function(section) {
                _.forEach(section.sectionParts, function(item) {
                    if (item['qti-type'] === 'assessmentItemRef') {
                        cache[item.href] = 1.0 + (idx % 5);  // 1-5 points
                        idx++;
                    }
                });
            });
        });

        mnopHelper._maxScoreCache = cache;
    }

    // Test 1: 50 items
    QUnit.test('50 items - basic performance', function(assert) {
        var model = generateTestModel(50);
        mockScores(model);

        var start = performance.now();
        var mnop = mnopHelper.computeTestMNOP(model, null, []);
        var time = performance.now() - start;

        console.log('[Stress] 50 items: ' + time.toFixed(2) + 'ms, Total=' + mnop.Total);

        assert.ok(mnop.Total > 0, '50 items calculated');
        assert.ok(time < 100, 'Under 100ms');
    });

    // Test 2: 100 items with categories
    QUnit.test('100 items with categories', function(assert) {
        var model = generateTestModel(100, {categoryCount: 5, categoriesPerItem: 3});
        mockScores(model);
        var cats = ['Category1', 'Category2', 'Category3', 'Category4', 'Category5'];

        var start = performance.now();
        var mnop = mnopHelper.computeTestMNOP(model, null, cats);
        var time = performance.now() - start;

        console.log('[Stress] 100 items + categories: ' + time.toFixed(2) + 'ms');

        assert.ok(mnop.Total > 0, '100 items calculated');
        assert.ok(mnop.Category_Category1 !== undefined, 'Categories calculated');
        assert.ok(time < 200, 'Under 200ms');
    });

    // Test 3: 500 items
    QUnit.test('500 items - large dataset', function(assert) {
        var model = generateTestModel(500, {itemsPerSection: 25});
        mockScores(model);

        var start = performance.now();
        var mnop = mnopHelper.computeTestMNOP(model, null, []);
        var time = performance.now() - start;

        console.log('[Stress] 500 items: ' + time.toFixed(2) + 'ms, Total=' + mnop.Total);

        assert.ok(mnop.Total > 0, '500 items calculated');
        assert.ok(time < 500, 'Under 500ms');
    });

    // Test 4: 1000 items
    QUnit.test('1000 items - extreme stress', function(assert) {
        var model = generateTestModel(1000, {itemsPerSection: 50});
        mockScores(model);

        var start = performance.now();
        var mnop = mnopHelper.computeTestMNOP(model, null, []);
        var time = performance.now() - start;

        console.log('[Stress] 1000 items: ' + time.toFixed(2) + 'ms, Total=' + mnop.Total);

        assert.ok(mnop.Total > 0, '1000 items calculated');
        assert.ok(time < 1000, 'Under 1000ms');
    });

    // Test 5: Sequential calculations (cache test)
    QUnit.test('Sequential calculations - cache performance', function(assert) {
        var model = generateTestModel(200);
        mockScores(model);

        var times = [];
        for (var i = 0; i < 10; i++) {
            var start = performance.now();
            mnopHelper.computeTestMNOP(model, null, []);
            times.push(performance.now() - start);
        }

        var avg = _.mean(times);
        var max = _.max(times);

        console.log('[Stress] 10 calculations: avg=' + avg.toFixed(2) + 'ms, max=' + max.toFixed(2) + 'ms');

        assert.ok(avg < 50, 'Average under 50ms');
        assert.ok(max < 100, 'Max under 100ms');
    });

    // Test 6: With weights
    QUnit.test('100 items with weights', function(assert) {
        var model = generateTestModel(100, {useWeights: true});
        mockScores(model);

        var start = performance.now();
        var mnop = mnopHelper.computeTestMNOP(model, 'coefficient', []);
        var time = performance.now() - start;

        console.log('[Stress] 100 items + weights: ' + time.toFixed(2) + 'ms, Weighted=' + mnop.Weighted);

        assert.ok(mnop.Weighted > mnop.Total, 'Weights applied');
        assert.ok(time < 200, 'Under 200ms');
    });

    // Test 7: Real-world scenario
    QUnit.test('250 items - real-world complexity', function(assert) {
        var model = generateTestModel(250, {
            itemsPerSection: 25,
            useWeights: true,
            categoryCount: 7,
            categoriesPerItem: 3
        });
        mockScores(model);
        var cats = ['Category1', 'Category2', 'Category3', 'Category4', 'Category5', 'Category6', 'Category7'];

        var start = performance.now();
        var mnop = mnopHelper.computeTestMNOP(model, 'coefficient', cats);
        var time = performance.now() - start;

        console.log('[Stress] 250 items (full complexity): ' + time.toFixed(2) + 'ms');
        console.log('  Total=' + mnop.Total + ', Weighted=' + mnop.Weighted);

        assert.ok(mnop.Total > 0, 'Complex calculation works');
        assert.ok(mnop.Weighted > mnop.Total, 'Weights work');
        assert.ok(mnop.Category_Category1 > 0, 'Categories work');
        assert.ok(time < 500, 'Under 500ms');
    });
});
