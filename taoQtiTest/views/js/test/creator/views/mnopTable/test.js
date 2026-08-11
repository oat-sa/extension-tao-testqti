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
 * Copyright (c) 2025-2026 (original work) Open Assessment Technologies SA;
 */

/**
 * Test MNOP Table View Component
 *
 * @author Open Assessment Technologies SA
 */
define([
    'jquery',
    'lodash',
    'taoQtiTest/controller/creator/views/mnopTable'
], function($, _, mnopTableViewFactory) {
    'use strict';

    QUnit.module('MNOP Table View');

    QUnit.test('module', function(assert) {
        assert.expect(1);
        assert.equal(typeof mnopTableViewFactory, 'function', 'The module exposes a factory function');
    });

    QUnit.module('Template Data Preparation', {
        beforeEach: function() {
            this.$container = $('<div>');
            this.mockModelOverseer = {
                getModel: function() {
                    return {
                        scoring: {
                            categoryScore: true,
                            weightIdentifier: 'COEF'
                        },
                        testMeta: {
                            branchRules: false
                        },
                        testParts: []
                    };
                }
            };
            this.view = null;
        },
        afterEach: function() {
            // Destroy view instance if created
            if (this.view && typeof this.view.destroy === 'function') {
                this.view.destroy();
            }

            // Remove DOM container
            if (this.$container) {
                this.$container.remove();
            }

            // Clear references to prevent memory leaks
            this.view = null;
            this.$container = null;
            this.mockModelOverseer = null;
        }
    });

    QUnit.test('_prepareTemplateData - basic MNOP with no categories or weights', function(assert) {
        assert.expect(5);

        this.view = mnopTableViewFactory(this.$container, {}, this.mockModelOverseer);
        var mnop = {Total: 10, Weighted: 10};
        var testModel = {scoring: {}};

        var result = this.view._prepareTemplateData(mnop, testModel);

        assert.ok(result.hasData, 'Should have data when Total > 0');
        assert.notOk(result.hasCategories, 'Should not have categories when categoryScore is disabled');
        assert.notOk(result.hasWeighted, 'Should not have weighted column when Total equals Weighted');
        assert.equal(result.totalValue, '10.00', 'Total value should be formatted to 2 decimals');
        assert.equal(result.weightedValue, '10.00', 'Weighted value should be formatted to 2 decimals');
    });

    QUnit.test('_prepareTemplateData - MNOP with weighted scoring', function(assert) {
        assert.expect(3);

        this.view = mnopTableViewFactory(this.$container, {}, this.mockModelOverseer);
        var mnop = {Total: 10, Weighted: 15};
        var testModel = {
            scoring: {
                weightIdentifier: 'COEF'
            }
        };

        var result = this.view._prepareTemplateData(mnop, testModel);

        assert.ok(result.hasWeighted, 'Should have weighted column when Total differs from Weighted');
        assert.equal(result.totalValue, '10.00', 'Total value should be 10.00');
        assert.equal(result.weightedValue, '15.00', 'Weighted value should be 15.00');
    });

    QUnit.test('_prepareTemplateData - weighted scoring but values are equal', function(assert) {
        assert.expect(1);

        this.view = mnopTableViewFactory(this.$container, {}, this.mockModelOverseer);
        var mnop = {Total: 10, Weighted: 10};
        var testModel = {
            scoring: {
                weightIdentifier: 'COEF'
            }
        };

        var result = this.view._prepareTemplateData(mnop, testModel);

        assert.notOk(result.hasWeighted, 'Should not show weighted column when values are equal');
    });

    QUnit.test('_prepareTemplateData - no weightIdentifier set', function(assert) {
        assert.expect(1);

        this.view = mnopTableViewFactory(this.$container, {}, this.mockModelOverseer);
        var mnop = {Total: 10, Weighted: 15};
        var testModel = {
            scoring: {
                weightIdentifier: null
            }
        };

        var result = this.view._prepareTemplateData(mnop, testModel);

        assert.notOk(result.hasWeighted, 'Should not show weighted column when weightIdentifier is null');
    });

    QUnit.test('_prepareTemplateData - categories enabled with data', function(assert) {
        assert.expect(6);

        this.mockModelOverseer.getModel = function() {
            return {
                scoring: {
                    categoryScore: true
                },
                testMeta: {branchRules: false},
                testParts: [{
                    assessmentSections: [{
                        sectionParts: [
                            {
                                'qti-type': 'assessmentItemRef',
                                categories: ['math', 'science']
                            }
                        ]
                    }]
                }]
            };
        };

        this.view = mnopTableViewFactory(this.$container, {}, this.mockModelOverseer);
        var mnop = {
            Total: 10,
            Weighted: 10,
            Category_math: 6,
            Weighted_Category_math: 6,
            Category_science: 4,
            Weighted_Category_science: 4
        };
        var testModel = this.mockModelOverseer.getModel();

        var result = this.view._prepareTemplateData(mnop, testModel);

        assert.ok(result.hasCategories, 'Should have categories when categoryScore is enabled');
        assert.equal(result.categoryRows.length, 2, 'Should have 2 category rows');
        assert.equal(result.categoryRows[0].categoryName, 'math', 'First category should be math');
        assert.equal(result.categoryRows[0].total, '6.00', 'Math total should be 6.00');
        assert.equal(result.categoryRows[1].categoryName, 'science', 'Second category should be science');
        assert.equal(result.categoryRows[1].total, '4.00', 'Science total should be 4.00');
    });

    QUnit.test('_prepareTemplateData - categories with zero values are excluded', function(assert) {
        assert.expect(2);

        this.mockModelOverseer.getModel = function() {
            return {
                scoring: {
                    categoryScore: true
                },
                testMeta: {branchRules: false},
                testParts: [{
                    assessmentSections: [{
                        sectionParts: [
                            {
                                'qti-type': 'assessmentItemRef',
                                categories: ['math', 'science', 'history']
                            }
                        ]
                    }]
                }]
            };
        };

        this.view = mnopTableViewFactory(this.$container, {}, this.mockModelOverseer);
        var mnop = {
            Total: 10,
            Weighted: 10,
            Category_math: 10,
            Weighted_Category_math: 10,
            Category_science: 0,
            Weighted_Category_science: 0,
            Category_history: 0,
            Weighted_Category_history: 0
        };
        var testModel = this.mockModelOverseer.getModel();

        var result = this.view._prepareTemplateData(mnop, testModel);

        assert.equal(result.categoryRows.length, 1, 'Should only include categories with non-zero values');
        assert.equal(result.categoryRows[0].categoryName, 'math', 'Should only include math category');
    });

    QUnit.test('_prepareTemplateData - categories with weighted scoring', function(assert) {
        assert.expect(4);

        this.mockModelOverseer.getModel = function() {
            return {
                scoring: {
                    categoryScore: true,
                    weightIdentifier: 'COEF'
                },
                testMeta: {branchRules: false},
                testParts: [{
                    assessmentSections: [{
                        sectionParts: [
                            {
                                'qti-type': 'assessmentItemRef',
                                categories: ['math']
                            }
                        ]
                    }]
                }]
            };
        };

        this.view = mnopTableViewFactory(this.$container, {}, this.mockModelOverseer);
        var mnop = {
            Total: 10,
            Weighted: 20,
            Category_math: 10,
            Weighted_Category_math: 20
        };
        var testModel = this.mockModelOverseer.getModel();

        var result = this.view._prepareTemplateData(mnop, testModel);

        assert.ok(result.hasWeighted, 'Should show weighted column');
        assert.equal(result.categoryRows.length, 1, 'Should have 1 category row');
        assert.equal(result.categoryRows[0].total, '10.00', 'Category total should be 10.00');
        assert.equal(result.categoryRows[0].weighted, '20.00', 'Category weighted should be 20.00');
    });

    QUnit.test('_prepareTemplateData - empty MNOP (no data)', function(assert) {
        assert.expect(1);

        this.view = mnopTableViewFactory(this.$container, {}, this.mockModelOverseer);
        var mnop = {Total: 0, Weighted: 0};
        var testModel = {scoring: {}};

        var result = this.view._prepareTemplateData(mnop, testModel);

        assert.notOk(result.hasData, 'Should not have data when Total and Weighted are 0');
    });

    QUnit.test('_prepareTemplateData - categoryScore disabled', function(assert) {
        assert.expect(2);

        this.view = mnopTableViewFactory(this.$container, {}, this.mockModelOverseer);
        var mnop = {
            Total: 10,
            Weighted: 10,
            Category_math: 10
        };
        var testModel = {
            scoring: {
                categoryScore: false
            }
        };

        var result = this.view._prepareTemplateData(mnop, testModel);

        assert.notOk(result.hasCategories, 'Should not have categories when disabled');
        assert.equal(result.categoryRows.length, 0, 'Category rows should be empty');
    });

    QUnit.module('Category Extraction', {
        beforeEach: function() {
            this.$container = $('<div>');
            this.mockModelOverseer = {
                getModel: function() {
                    return {
                        scoring: {outcomeProcessing: 'total'},
                        testMeta: {branchRules: false},
                        testParts: []
                    };
                }
            };
            this.view = null;
        },
        afterEach: function() {
            // Destroy view instance if created
            if (this.view && typeof this.view.destroy === 'function') {
                this.view.destroy();
            }

            // Remove DOM container
            if (this.$container) {
                this.$container.remove();
            }

            // Clear references to prevent memory leaks
            this.view = null;
            this.$container = null;
            this.mockModelOverseer = null;
        }
    });

    QUnit.test('_extractVisibleCategories - simple structure', function(assert) {
        assert.expect(3);

        this.mockModelOverseer.getModel = function() {
            return {
                scoring: {categoryScore: true},
                testMeta: {branchRules: false},
                testParts: [{
                    assessmentSections: [{
                        sectionParts: [
                            {
                                'qti-type': 'assessmentItemRef',
                                categories: ['math', 'science']
                            }
                        ]
                    }]
                }]
            };
        };

        this.view = mnopTableViewFactory(this.$container, {}, this.mockModelOverseer);
        var testModel = this.mockModelOverseer.getModel();
        var categories = this.view._extractVisibleCategories(testModel);

        assert.equal(categories.length, 2, 'Should extract 2 categories');
        assert.ok(_.includes(categories, 'math'), 'Should include math');
        assert.ok(_.includes(categories, 'science'), 'Should include science');
    });

    QUnit.test('_extractVisibleCategories - nested sections (multiple levels)', function(assert) {
        assert.expect(4);

        this.mockModelOverseer.getModel = function() {
            return {
                scoring: {categoryScore: true},
                testMeta: {branchRules: false},
                testParts: [{
                    assessmentSections: [{
                        sectionParts: [
                            {
                                'qti-type': 'assessmentItemRef',
                                categories: ['math']
                            },
                            {
                                'qti-type': 'assessmentSection',
                                sectionParts: [
                                    {
                                        'qti-type': 'assessmentItemRef',
                                        categories: ['science']
                                    },
                                    {
                                        'qti-type': 'assessmentSection',
                                        sectionParts: [
                                            {
                                                'qti-type': 'assessmentItemRef',
                                                categories: ['history']
                                            }
                                        ]
                                    }
                                ]
                            }
                        ]
                    }]
                }]
            };
        };

        this.view = mnopTableViewFactory(this.$container, {}, this.mockModelOverseer);
        var testModel = this.mockModelOverseer.getModel();
        var categories = this.view._extractVisibleCategories(testModel);

        assert.equal(categories.length, 3, 'Should extract categories from all nesting levels');
        assert.ok(_.includes(categories, 'math'), 'Should include math from level 1');
        assert.ok(_.includes(categories, 'science'), 'Should include science from level 2');
        assert.ok(_.includes(categories, 'history'), 'Should include history from level 3');
    });

    QUnit.test('_extractVisibleCategories - filters out x-tao- prefixed categories', function(assert) {
        assert.expect(3);

        this.mockModelOverseer.getModel = function() {
            return {
                scoring: {categoryScore: true},
                testMeta: {branchRules: false},
                testParts: [{
                    assessmentSections: [{
                        sectionParts: [
                            {
                                'qti-type': 'assessmentItemRef',
                                categories: ['math', 'x-tao-internal', 'x-tao-option-excludedSection', 'science']
                            }
                        ]
                    }]
                }]
            };
        };

        this.view = mnopTableViewFactory(this.$container, {}, this.mockModelOverseer);
        var testModel = this.mockModelOverseer.getModel();
        var categories = this.view._extractVisibleCategories(testModel);

        assert.equal(categories.length, 2, 'Should only include non-internal categories');
        assert.ok(_.includes(categories, 'math'), 'Should include math');
        assert.ok(_.includes(categories, 'science'), 'Should include science');
    });

    QUnit.test('_extractVisibleCategories - deduplicates categories', function(assert) {
        assert.expect(2);

        this.mockModelOverseer.getModel = function() {
            return {
                scoring: {categoryScore: true},
                testMeta: {branchRules: false},
                testParts: [{
                    assessmentSections: [
                        {
                            sectionParts: [
                                {
                                    'qti-type': 'assessmentItemRef',
                                    categories: ['math', 'science']
                                },
                                {
                                    'qti-type': 'assessmentItemRef',
                                    categories: ['math', 'history']
                                }
                            ]
                        },
                        {
                            sectionParts: [
                                {
                                    'qti-type': 'assessmentItemRef',
                                    categories: ['science']
                                }
                            ]
                        }
                    ]
                }]
            };
        };

        this.view = mnopTableViewFactory(this.$container, {}, this.mockModelOverseer);
        var testModel = this.mockModelOverseer.getModel();
        var categories = this.view._extractVisibleCategories(testModel);

        assert.equal(categories.length, 3, 'Should deduplicate categories (math appears 2x, science 2x)');
        var expectedCategories = ['math', 'science', 'history'];
        assert.deepEqual(_.sortBy(categories), _.sortBy(expectedCategories), 'Should contain unique categories');
    });

    QUnit.test('_extractVisibleCategories - categoryScore disabled returns empty', function(assert) {
        assert.expect(1);

        this.mockModelOverseer.getModel = function() {
            return {
                scoring: {categoryScore: false},
                testMeta: {branchRules: false},
                testParts: [{
                    assessmentSections: [{
                        sectionParts: [
                            {
                                'qti-type': 'assessmentItemRef',
                                categories: ['math']
                            }
                        ]
                    }]
                }]
            };
        };

        this.view = mnopTableViewFactory(this.$container, {}, this.mockModelOverseer);
        var testModel = this.mockModelOverseer.getModel();
        var categories = this.view._extractVisibleCategories(testModel);

        assert.deepEqual(categories, [], 'Should return empty array when categoryScore is disabled');
    });

    QUnit.test('_extractVisibleCategories - no testParts returns empty', function(assert) {
        assert.expect(1);

        this.mockModelOverseer.getModel = function() {
            return {
                scoring: {categoryScore: true},
                testMeta: {branchRules: false}
            };
        };

        this.view = mnopTableViewFactory(this.$container, {}, this.mockModelOverseer);
        var testModel = this.mockModelOverseer.getModel();
        var categories = this.view._extractVisibleCategories(testModel);

        assert.deepEqual(categories, [], 'Should return empty array when testParts is missing');
    });

    QUnit.test('_extractVisibleCategories - empty testParts returns empty', function(assert) {
        assert.expect(1);

        this.mockModelOverseer.getModel = function() {
            return {
                scoring: {categoryScore: true},
                testMeta: {branchRules: false},
                testParts: []
            };
        };

        this.view = mnopTableViewFactory(this.$container, {}, this.mockModelOverseer);
        var testModel = this.mockModelOverseer.getModel();
        var categories = this.view._extractVisibleCategories(testModel);

        assert.deepEqual(categories, [], 'Should return empty array when testParts is empty');
    });

    QUnit.test('_extractVisibleCategories - no scoring object returns empty', function(assert) {
        assert.expect(1);

        this.mockModelOverseer.getModel = function() {
            return {
                testMeta: {branchRules: false},
                testParts: [{
                    assessmentSections: [{
                        sectionParts: [
                            {
                                'qti-type': 'assessmentItemRef',
                                categories: ['math']
                            }
                        ]
                    }]
                }]
            };
        };

        this.view = mnopTableViewFactory(this.$container, {}, this.mockModelOverseer);
        var testModel = this.mockModelOverseer.getModel();
        var categories = this.view._extractVisibleCategories(testModel);

        assert.deepEqual(categories, [], 'Should return empty array when scoring object is missing');
    });

    QUnit.test('_extractSectionCategories - simple section', function(assert) {
        assert.expect(2);

        this.view = mnopTableViewFactory(this.$container, {}, this.mockModelOverseer);
        var section = {
            sectionParts: [
                {
                    'qti-type': 'assessmentItemRef',
                    categories: ['math', 'algebra']
                }
            ]
        };

        var categories = this.view._extractSectionCategories(section);

        assert.equal(categories.length, 2, 'Should extract 2 categories');
        assert.deepEqual(_.sortBy(categories), ['algebra', 'math'], 'Should extract both categories');
    });

    QUnit.test('_extractSectionCategories - nested subsections', function(assert) {
        assert.expect(2);

        this.view = mnopTableViewFactory(this.$container, {}, this.mockModelOverseer);
        var section = {
            sectionParts: [
                {
                    'qti-type': 'assessmentItemRef',
                    categories: ['math']
                },
                {
                    'qti-type': 'assessmentSection',
                    sectionParts: [
                        {
                            'qti-type': 'assessmentItemRef',
                            categories: ['science', 'physics']
                        }
                    ]
                }
            ]
        };

        var categories = this.view._extractSectionCategories(section);

        assert.equal(categories.length, 3, 'Should extract categories from nested sections');
        assert.deepEqual(_.sortBy(categories), ['math', 'physics', 'science'], 'Should extract all categories');
    });

    QUnit.test('_extractSectionCategories - null section returns empty', function(assert) {
        assert.expect(1);

        this.view = mnopTableViewFactory(this.$container, {}, this.mockModelOverseer);
        var categories = this.view._extractSectionCategories(null);

        assert.deepEqual(categories, [], 'Should return empty array for null section');
    });

    QUnit.test('_extractSectionCategories - undefined section returns empty', function(assert) {
        assert.expect(1);

        this.view = mnopTableViewFactory(this.$container, {}, this.mockModelOverseer);
        var categories = this.view._extractSectionCategories(undefined);

        assert.deepEqual(categories, [], 'Should return empty array for undefined section');
    });

    QUnit.test('_extractSectionCategories - section without sectionParts returns empty', function(assert) {
        assert.expect(1);

        this.view = mnopTableViewFactory(this.$container, {}, this.mockModelOverseer);
        var section = {};

        var categories = this.view._extractSectionCategories(section);

        assert.deepEqual(categories, [], 'Should return empty array when sectionParts is missing');
    });

    QUnit.test('_extractSectionCategories - empty sectionParts returns empty', function(assert) {
        assert.expect(1);

        this.view = mnopTableViewFactory(this.$container, {}, this.mockModelOverseer);
        var section = {
            sectionParts: []
        };

        var categories = this.view._extractSectionCategories(section);

        assert.deepEqual(categories, [], 'Should return empty array when sectionParts is empty');
    });

    QUnit.test('_extractSectionCategories - item without categories', function(assert) {
        assert.expect(1);

        this.view = mnopTableViewFactory(this.$container, {}, this.mockModelOverseer);
        var section = {
            sectionParts: [
                {
                    'qti-type': 'assessmentItemRef'
                    // no categories property
                }
            ]
        };

        var categories = this.view._extractSectionCategories(section);

        assert.deepEqual(categories, [], 'Should return empty array when items have no categories');
    });

    QUnit.test('_extractSectionCategories - multiple test parts', function(assert) {
        assert.expect(2);

        this.mockModelOverseer.getModel = function() {
            return {
                scoring: {categoryScore: true},
                testMeta: {branchRules: false},
                testParts: [
                    {
                        assessmentSections: [{
                            sectionParts: [
                                {
                                    'qti-type': 'assessmentItemRef',
                                    categories: ['math']
                                }
                            ]
                        }]
                    },
                    {
                        assessmentSections: [{
                            sectionParts: [
                                {
                                    'qti-type': 'assessmentItemRef',
                                    categories: ['science']
                                }
                            ]
                        }]
                    }
                ]
            };
        };

        this.view = mnopTableViewFactory(this.$container, {}, this.mockModelOverseer);
        var testModel = this.mockModelOverseer.getModel();
        var categories = this.view._extractVisibleCategories(testModel);

        assert.equal(categories.length, 2, 'Should extract categories from all test parts');
        assert.deepEqual(_.sortBy(categories), ['math', 'science'], 'Should include categories from both parts');
    });

    QUnit.module('Reactive Update System (T8)', {
        beforeEach: function() {
            this.$container = $('<div>');
            this.mockModelOverseer = {
                getModel: function() {
                    return {
                        scoring: {outcomeProcessing: 'total'},
                        testMeta: {branchRules: false},
                        testParts: []
                    };
                },
                on: function() {},
                off: function() {}
            };
            this.view = null;
        },
        afterEach: function() {
            if (this.view && typeof this.view.destroy === 'function') {
                this.view.destroy();
            }
            if (this.$container) {
                this.$container.remove();
            }
            this.view = null;
            this.$container = null;
            this.mockModelOverseer = null;
        }
    });

    QUnit.test('init() calls render() and bindEvents()', function(assert) {
        assert.expect(2);

        var renderCalled = false;
        var bindEventsCalled = false;

        this.view = mnopTableViewFactory(this.$container, {}, this.mockModelOverseer);

        // Spy on methods
        var originalRender = this.view.render;
        var originalBindEvents = this.view.bindEvents;

        this.view.render = function() {
            renderCalled = true;
            return originalRender.call(this);
        };

        this.view.bindEvents = function() {
            bindEventsCalled = true;
            return originalBindEvents.call(this);
        };

        this.view.init();

        assert.ok(renderCalled, 'render() should be called during init');
        assert.ok(bindEventsCalled, 'bindEvents() should be called during init');
    });

    QUnit.test('bindEvents() subscribes to setmodel, scoring-write and branch-rules-change events', function(assert) {
        assert.expect(3);

        var eventsSubscribed = [];

        this.mockModelOverseer.on = function(eventName, handler) {
            eventsSubscribed.push(eventName);
        };

        this.view = mnopTableViewFactory(this.$container, {}, this.mockModelOverseer);
        this.view.bindEvents();

        assert.ok(eventsSubscribed.indexOf('setmodel') !== -1, 'Should subscribe to setmodel event');
        assert.ok(eventsSubscribed.indexOf('scoring-write') !== -1, 'Should subscribe to scoring-write event');
        assert.ok(eventsSubscribed.indexOf('branch-rules-change') !== -1, 'Should subscribe to branch-rules-change event');
    });

    QUnit.test('bindEvents() creates debounced update handler', function(assert) {
        assert.expect(2);

        this.view = mnopTableViewFactory(this.$container, {}, this.mockModelOverseer);
        this.view.bindEvents();

        assert.ok(this.view._updateHandler, '_updateHandler should be created');
        assert.equal(typeof this.view._updateHandler, 'function', '_updateHandler should be a function');
    });

    QUnit.test('destroy() unbinds event listeners', function(assert) {
        assert.expect(2);

        var eventsUnsubscribed = [];

        this.mockModelOverseer.off = function(eventName, handler) {
            eventsUnsubscribed.push(eventName);
        };

        this.view = mnopTableViewFactory(this.$container, {}, this.mockModelOverseer);
        this.view.bindEvents();
        this.view.destroy();

        assert.ok(eventsUnsubscribed.indexOf('setmodel') !== -1, 'Should unsubscribe from setmodel event');
        assert.ok(eventsUnsubscribed.indexOf('scoring-write') !== -1, 'Should unsubscribe from scoring-write event');
    });

    QUnit.test('destroy() clears update handler', function(assert) {
        assert.expect(2);

        this.view = mnopTableViewFactory(this.$container, {}, this.mockModelOverseer);
        this.view.bindEvents();

        assert.ok(this.view._updateHandler, '_updateHandler should exist before destroy');

        this.view.destroy();

        assert.equal(this.view._updateHandler, null, '_updateHandler should be null after destroy');
    });

    QUnit.test('destroy() clears DOM container', function(assert) {
        assert.expect(2);

        this.$container.html('<div class="test-content">Some content</div>');
        assert.ok(this.$container.children().length > 0, 'Container should have content before destroy');

        this.view = mnopTableViewFactory(this.$container, {}, this.mockModelOverseer);
        this.view.destroy();

        assert.equal(this.$container.children().length, 0, 'Container should be empty after destroy');
    });
});
