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

define(['lodash', 'taoQtiTest/controller/creator/helpers/mnop'], function(_, mnopHelper) {
    'use strict';

    var mnopHelperApi = [
        { title: 'init' },
        { title: 'computeItemMNOP' },
        { title: 'computeSectionMNOP' },
        { title: 'computeTestPartMNOP' },
        { title: 'computeTestMNOP' },
        { title: 'selectTopN' },
        { title: 'clearCache' },
        { title: '_extractItemUris' },
        { title: '_extractSectionItemUris' },
        { title: '_getItemMaxScore' },
        { title: '_getItemWeight' },
        { title: '_sumMNOPs' },
        { title: '_aggregateWithSelection' },
        { title: '_createEmptyMNOP' }
    ];

    QUnit.module('helpers/mnop');

    QUnit.test('module', function(assert) {
        assert.expect(1);
        assert.equal(typeof mnopHelper, 'object', 'The mnop helper module exposes an object');
    });

    QUnit.cases
        .init(mnopHelperApi)
        .test('helpers/mnop API ', function(data, assert) {
            assert.expect(1);
            assert.equal(
                typeof mnopHelper[data.title],
                'function',
                'The mnop helper exposes a "' + data.title + '" function'
            );
        });

    QUnit.module('MNOP Calculator - Item Level', {
        beforeEach: function() {
            mnopHelper.clearCache();
            mnopHelper._maxScoreCache = {
                'http://item1': 10,
                'http://item2': 6,
                'http://item3': 8,
                'http://geography': 6,
                'http://history': 8
            };
        }
    });

    QUnit.test('compute item MNOP - no weight, no category', function(assert) {
        var itemRef = {
            href: 'http://item1',
            categories: [],
            weights: []
        };

        var mnop = mnopHelper.computeItemMNOP(itemRef, null, []);

        assert.expect(3);
        assert.equal(mnop.Total, 10, 'Total should be 10');
        assert.equal(mnop.Weighted, 10, 'Weighted should be 10 (weight defaults to 1)');
        assert.equal(Object.keys(mnop).length, 2, 'Should have 2 properties');
    });

    QUnit.test('compute item MNOP - with matched weight', function(assert) {
        var itemRef = {
            href: 'http://item2',
            categories: [],
            weights: [{ identifier: 'WEIGHT', value: 2 }]
        };

        var mnop = mnopHelper.computeItemMNOP(itemRef, 'WEIGHT', []);

        assert.expect(2);
        assert.equal(mnop.Total, 6, 'Total should be 6');
        assert.equal(mnop.Weighted, 12, 'Weighted should be 12 (6 × 2)');
    });

    QUnit.test('compute item MNOP - with unmatched weight (fallback to 1)', function(assert) {
        var itemRef = {
            href: 'http://item2',
            categories: [],
            weights: [{ identifier: 'OTHER', value: 3 }]
        };

        var mnop = mnopHelper.computeItemMNOP(itemRef, 'WEIGHT', []);

        assert.expect(2);
        assert.equal(mnop.Total, 6, 'Total should be 6');
        assert.equal(mnop.Weighted, 6, 'Weighted should be 6 (fallback to 1)');
    });

    QUnit.test('compute item MNOP - Geography/History example', function(assert) {
        var geographyItem = {
            href: 'http://geography',
            categories: ['geography'],
            weights: [{ identifier: 'COEF', value: 2 }]
        };

        var mnop = mnopHelper.computeItemMNOP(geographyItem, 'COEF', ['geography', 'history']);

        assert.expect(6);
        assert.equal(mnop.Total, 6, 'Total should be 6');
        assert.equal(mnop.Weighted, 12, 'Weighted should be 12 (6 × 2)');
        assert.equal(mnop.Category_geography, 6, 'Geography category should be 6');
        assert.equal(mnop.Weighted_Category_geography, 12, 'Weighted geography should be 12');
        assert.equal(mnop.Category_history, 0, 'History category should be 0 (not in item)');
        assert.equal(mnop.Weighted_Category_history, 0, 'Weighted history should be 0');
    });

    QUnit.test('compute item MNOP - with multiple categories', function(assert) {
        var itemRef = {
            href: 'http://item1',
            categories: ['math', 'algebra'],
            weights: []
        };

        var mnop = mnopHelper.computeItemMNOP(itemRef, null, ['math', 'science', 'algebra']);

        assert.expect(8);
        assert.equal(mnop.Total, 10, 'Total should be 10');
        assert.equal(mnop.Weighted, 10, 'Weighted should be 10');
        assert.equal(mnop.Category_math, 10, 'Math category should be 10');
        assert.equal(mnop.Weighted_Category_math, 10, 'Weighted math should be 10');
        assert.equal(mnop.Category_science, 0, 'Science category should be 0');
        assert.equal(mnop.Weighted_Category_science, 0, 'Weighted science should be 0');
        assert.equal(mnop.Category_algebra, 10, 'Algebra category should be 10');
        assert.equal(mnop.Weighted_Category_algebra, 10, 'Weighted algebra should be 10');
    });

    QUnit.test('compute item MNOP - item not in cache returns 0', function(assert) {
        var itemRef = {
            href: 'http://unknown-item',
            categories: [],
            weights: []
        };

        var mnop = mnopHelper.computeItemMNOP(itemRef, null, []);

        assert.expect(2);
        assert.equal(mnop.Total, 0, 'Total should be 0 for unknown item');
        assert.equal(mnop.Weighted, 0, 'Weighted should be 0');
    });

    QUnit.test('compute item MNOP - fractional weight', function(assert) {
        var itemRef = {
            href: 'http://item1',
            categories: [],
            weights: [{ identifier: 'WEIGHT', value: 0.5 }]
        };

        var mnop = mnopHelper.computeItemMNOP(itemRef, 'WEIGHT', []);

        assert.expect(2);
        assert.equal(mnop.Total, 10, 'Total should be 10');
        assert.equal(mnop.Weighted, 5, 'Weighted should be 5 (10 × 0.5)');
    });

    QUnit.test('compute item MNOP - weight with categories', function(assert) {
        var itemRef = {
            href: 'http://item2',
            categories: ['math'],
            weights: [{ identifier: 'WEIGHT', value: 1.5 }]
        };

        var mnop = mnopHelper.computeItemMNOP(itemRef, 'WEIGHT', ['math', 'science']);

        assert.expect(6);
        assert.equal(mnop.Total, 6, 'Total should be 6');
        assert.equal(mnop.Weighted, 9, 'Weighted should be 9 (6 × 1.5)');
        assert.equal(mnop.Category_math, 6, 'Math category should be 6');
        assert.equal(mnop.Weighted_Category_math, 9, 'Weighted math should be 9');
        assert.equal(mnop.Category_science, 0, 'Science category should be 0');
        assert.equal(mnop.Weighted_Category_science, 0, 'Weighted science should be 0');
    });

    QUnit.module('MNOP Calculator - URI Extraction', {
        beforeEach: function() {
            mnopHelper.clearCache();
        }
    });

    QUnit.test('_extractItemUris - simple test structure', function(assert) {
        var testModel = {
            testParts: [
                {
                    assessmentSections: [
                        {
                            sectionParts: [
                                { 'qti-type': 'assessmentItemRef', href: 'http://item1' },
                                { 'qti-type': 'assessmentItemRef', href: 'http://item2' }
                            ]
                        }
                    ]
                }
            ]
        };

        var uris = mnopHelper._extractItemUris(testModel);

        assert.expect(3);
        assert.equal(uris.length, 2, 'Should extract 2 URIs');
        assert.ok(uris.indexOf('http://item1') !== -1, 'Should include item1');
        assert.ok(uris.indexOf('http://item2') !== -1, 'Should include item2');
    });

    QUnit.test('_extractItemUris - nested sections', function(assert) {
        var testModel = {
            testParts: [
                {
                    assessmentSections: [
                        {
                            sectionParts: [
                                { 'qti-type': 'assessmentItemRef', href: 'http://item1' },
                                {
                                    'qti-type': 'assessmentSection',
                                    sectionParts: [
                                        { 'qti-type': 'assessmentItemRef', href: 'http://item2' },
                                        { 'qti-type': 'assessmentItemRef', href: 'http://item3' }
                                    ]
                                }
                            ]
                        }
                    ]
                }
            ]
        };

        var uris = mnopHelper._extractItemUris(testModel);

        assert.expect(4);
        assert.equal(uris.length, 3, 'Should extract 3 URIs from nested structure');
        assert.ok(uris.indexOf('http://item1') !== -1, 'Should include item1');
        assert.ok(uris.indexOf('http://item2') !== -1, 'Should include item2');
        assert.ok(uris.indexOf('http://item3') !== -1, 'Should include item3');
    });

    QUnit.test('_extractItemUris - multiple test parts', function(assert) {
        var testModel = {
            testParts: [
                {
                    assessmentSections: [
                        {
                            sectionParts: [{ 'qti-type': 'assessmentItemRef', href: 'http://item1' }]
                        }
                    ]
                },
                {
                    assessmentSections: [
                        {
                            sectionParts: [{ 'qti-type': 'assessmentItemRef', href: 'http://item2' }]
                        }
                    ]
                }
            ]
        };

        var uris = mnopHelper._extractItemUris(testModel);

        assert.expect(3);
        assert.equal(uris.length, 2, 'Should extract URIs from multiple test parts');
        assert.ok(uris.indexOf('http://item1') !== -1, 'Should include item1');
        assert.ok(uris.indexOf('http://item2') !== -1, 'Should include item2');
    });

    QUnit.test('_extractItemUris - empty test model', function(assert) {
        assert.expect(3);
        assert.deepEqual(mnopHelper._extractItemUris(null), [], 'Should return empty array for null');
        assert.deepEqual(mnopHelper._extractItemUris({}), [], 'Should return empty array for empty object');
        assert.deepEqual(
            mnopHelper._extractItemUris({ testParts: [] }),
            [],
            'Should return empty array for empty testParts'
        );
    });

    QUnit.test('_extractItemUris - duplicate URIs', function(assert) {
        var testModel = {
            testParts: [
                {
                    assessmentSections: [
                        {
                            sectionParts: [
                                { 'qti-type': 'assessmentItemRef', href: 'http://item1' },
                                { 'qti-type': 'assessmentItemRef', href: 'http://item1' }
                            ]
                        }
                    ]
                }
            ]
        };

        var uris = mnopHelper._extractItemUris(testModel);

        assert.expect(1);
        assert.equal(uris.length, 1, 'Should deduplicate URIs');
    });

    QUnit.test('_getItemWeight - no weight identifier', function(assert) {
        var itemRef = { weights: [{ identifier: 'WEIGHT', value: 2 }] };

        assert.expect(1);
        assert.equal(mnopHelper._getItemWeight(itemRef, null), 1, 'Should return 1 when no identifier');
    });

    QUnit.test('_getItemWeight - no weights array', function(assert) {
        var itemRef = { weights: [] };

        assert.expect(1);
        assert.equal(mnopHelper._getItemWeight(itemRef, 'WEIGHT'), 1, 'Should return 1 when no weights');
    });

    QUnit.module('MNOP Calculator - Top-N Selection');

    QUnit.test('select top 3 from 5 items by Total', function(assert) {
        var items = [
            {Total: 10, Weighted: 15, id: 'A'},
            {Total: 12, Weighted: 10, id: 'B'},
            {Total: 8,  Weighted: 20, id: 'C'},
            {Total: 5,  Weighted: 5,  id: 'D'},
            {Total: 9,  Weighted: 12, id: 'E'}
        ];

        var topN = mnopHelper.selectTopN(items, 3, 'Total');

        assert.expect(4);
        assert.equal(topN.length, 3, 'Should return 3 items');
        assert.equal(topN[0].id, 'B', 'First item should be B (12)');
        assert.equal(topN[1].id, 'A', 'Second item should be A (10)');
        assert.equal(topN[2].id, 'E', 'Third item should be E (9)');
    });

    QUnit.test('select top 3 from 5 items by Weighted', function(assert) {
        var items = [
            {Total: 10, Weighted: 15, id: 'A'},
            {Total: 12, Weighted: 10, id: 'B'},
            {Total: 8,  Weighted: 20, id: 'C'},
            {Total: 5,  Weighted: 5,  id: 'D'},
            {Total: 9,  Weighted: 12, id: 'E'}
        ];

        var topN = mnopHelper.selectTopN(items, 3, 'Weighted');

        assert.expect(4);
        assert.equal(topN.length, 3, 'Should return 3 items');
        assert.equal(topN[0].id, 'C', 'First item should be C (20)');
        assert.equal(topN[1].id, 'A', 'Second item should be A (15)');
        assert.equal(topN[2].id, 'E', 'Third item should be E (12)');
    });

    QUnit.test('different metrics select different subsets', function(assert) {
        var items = [
            {Total: 10, Weighted: 15, id: 'A'},
            {Total: 12, Weighted: 10, id: 'B'},
            {Total: 8,  Weighted: 20, id: 'C'}
        ];

        var topByTotal = mnopHelper.selectTopN(items, 2, 'Total');
        var topByWeighted = mnopHelper.selectTopN(items, 2, 'Weighted');

        assert.expect(4);
        assert.deepEqual(_.map(topByTotal, 'id'), ['B', 'A'], 'Top 2 by Total should be B, A');
        assert.deepEqual(_.map(topByWeighted, 'id'), ['C', 'A'], 'Top 2 by Weighted should be C, A');
        assert.ok(_.find(topByWeighted, {id: 'C'}), 'Item C should be in Weighted top 2');
        assert.notOk(_.find(topByTotal, {id: 'C'}), 'Item C should not be in Total top 2');
    });

    QUnit.test('n=0 returns empty', function(assert) {
        var items = [{Total: 10}];

        assert.expect(1);
        assert.deepEqual(mnopHelper.selectTopN(items, 0, 'Total'), [], 'Should return empty array when n=0');
    });

    QUnit.test('n > items length returns all sorted', function(assert) {
        var items = [
            {Total: 5, id: 'A'},
            {Total: 10, id: 'B'},
            {Total: 3, id: 'C'}
        ];
        var topN = mnopHelper.selectTopN(items, 10, 'Total');

        assert.expect(4);
        assert.equal(topN.length, 3, 'Should return all items when n > items length');
        assert.equal(topN[0].id, 'B', 'First item should be B (10) - sorted descending');
        assert.equal(topN[1].id, 'A', 'Second item should be A (5)');
        assert.equal(topN[2].id, 'C', 'Third item should be C (3)');
    });

    QUnit.test('ties preserve stable order', function(assert) {
        var items = [
            {Total: 10, id: 'A'},
            {Total: 10, id: 'B'},
            {Total: 10, id: 'C'},
            {Total: 5,  id: 'D'}
        ];

        var topN = mnopHelper.selectTopN(items, 2, 'Total');

        assert.expect(3);
        assert.equal(topN.length, 2, 'Should return 2 items');
        assert.equal(topN[0].id, 'A', 'First item should be A (stable sort)');
        assert.equal(topN[1].id, 'B', 'Second item should be B (stable sort)');
    });

    QUnit.test('empty array returns empty', function(assert) {
        assert.expect(1);
        assert.deepEqual(mnopHelper.selectTopN([], 5, 'Total'), [], 'Should return empty array for empty input');
    });

    QUnit.test('null/undefined input returns empty', function(assert) {
        assert.expect(2);
        assert.deepEqual(mnopHelper.selectTopN(null, 5, 'Total'), [], 'Should return empty array for null');
        assert.deepEqual(mnopHelper.selectTopN(undefined, 5, 'Total'), [], 'Should return empty array for undefined');
    });

    QUnit.module('MNOP Calculator - Hierarchical Aggregation', {
        beforeEach: function() {
            // Mock the MAXSCORE cache
            mnopHelper._maxScoreCache = {
                'http://item1': 10,
                'http://item2': 20,
                'http://item3': 15,
                'http://item4': 8,
                'http://item5': 12
            };
        },
        afterEach: function() {
            mnopHelper.clearCache();
        }
    });

    QUnit.test('computeSectionMNOP - simple section with 3 items', function(assert) {
        var section = {
            sectionParts: [
                {'qti-type': 'assessmentItemRef', href: 'http://item1'},
                {'qti-type': 'assessmentItemRef', href: 'http://item2'},
                {'qti-type': 'assessmentItemRef', href: 'http://item3'}
            ]
        };

        var mnop = mnopHelper.computeSectionMNOP(section, null, []);

        assert.expect(2);
        assert.equal(mnop.Total, 45, 'Total should be sum of all items (10+20+15)');
        assert.equal(mnop.Weighted, 45, 'Weighted should equal Total when no weights');
    });

    QUnit.test('computeSectionMNOP - section with selection (select 2 from 3)', function(assert) {
        var section = {
            selection: {select: 2},
            sectionParts: [
                {'qti-type': 'assessmentItemRef', href: 'http://item1'},  // 10
                {'qti-type': 'assessmentItemRef', href: 'http://item2'},  // 20
                {'qti-type': 'assessmentItemRef', href: 'http://item3'}   // 15
            ]
        };

        var mnop = mnopHelper.computeSectionMNOP(section, null, []);

        assert.expect(1);
        assert.equal(mnop.Total, 35, 'Should select top 2 items (20+15)');
    });

    QUnit.test('computeSectionMNOP - nested subsections', function(assert) {
        var section = {
            sectionParts: [
                {'qti-type': 'assessmentItemRef', href: 'http://item1'},  // 10
                {
                    'qti-type': 'assessmentSection',
                    sectionParts: [
                        {'qti-type': 'assessmentItemRef', href: 'http://item2'},  // 20
                        {'qti-type': 'assessmentItemRef', href: 'http://item3'}   // 15
                    ]
                }
            ]
        };

        var mnop = mnopHelper.computeSectionMNOP(section, null, []);

        assert.expect(1);
        assert.equal(mnop.Total, 45, 'Should sum items from main section and subsection (10+20+15)');
    });

    QUnit.test('computeSectionMNOP - with categories', function(assert) {
        var section = {
            sectionParts: [
                {'qti-type': 'assessmentItemRef', href: 'http://item1', categories: ['math']},
                {'qti-type': 'assessmentItemRef', href: 'http://item2', categories: ['science']},
                {'qti-type': 'assessmentItemRef', href: 'http://item3', categories: ['math']}
            ]
        };

        var mnop = mnopHelper.computeSectionMNOP(section, null, ['math', 'science']);

        assert.expect(3);
        assert.equal(mnop.Total, 45, 'Total should be sum of all items');
        assert.equal(mnop.Category_math, 25, 'Math category should sum math items (10+15)');
        assert.equal(mnop.Category_science, 20, 'Science category should sum science items (20)');
    });

    QUnit.test('computeTestPartMNOP - test-part with 2 sections', function(assert) {
        var testPart = {
            assessmentSections: [
                {
                    sectionParts: [
                        {'qti-type': 'assessmentItemRef', href: 'http://item1'},  // 10
                        {'qti-type': 'assessmentItemRef', href: 'http://item2'}   // 20
                    ]
                },
                {
                    sectionParts: [
                        {'qti-type': 'assessmentItemRef', href: 'http://item3'}   // 15
                    ]
                }
            ]
        };

        var mnop = mnopHelper.computeTestPartMNOP(testPart, null, []);

        assert.expect(1);
        assert.equal(mnop.Total, 45, 'Should sum all items from all sections (10+20+15)');
    });

    QUnit.test('computeTestMNOP - complete test with 2 test-parts', function(assert) {
        var testModel = {
            testParts: [
                {
                    assessmentSections: [
                        {
                            sectionParts: [
                                {'qti-type': 'assessmentItemRef', href: 'http://item1'},  // 10
                                {'qti-type': 'assessmentItemRef', href: 'http://item2'}   // 20
                            ]
                        }
                    ]
                },
                {
                    assessmentSections: [
                        {
                            sectionParts: [
                                {'qti-type': 'assessmentItemRef', href: 'http://item3'},  // 15
                                {'qti-type': 'assessmentItemRef', href: 'http://item4'}   // 8
                            ]
                        }
                    ]
                }
            ]
        };

        var mnop = mnopHelper.computeTestMNOP(testModel, null, []);

        assert.expect(1);
        assert.equal(mnop.Total, 53, 'Should sum all items from all test-parts (10+20+15+8)');
    });

    QUnit.test('_sumMNOPs - sums multiple MNOP objects', function(assert) {
        var mnops = [
            {Total: 10, Weighted: 15, Category_math: 10},
            {Total: 20, Weighted: 30, Category_math: 20},
            {Total: 5,  Weighted: 10, Category_math: 0}
        ];

        var result = mnopHelper._sumMNOPs(mnops, ['math']);

        assert.expect(3);
        assert.equal(result.Total, 35, 'Should sum all Total values');
        assert.equal(result.Weighted, 55, 'Should sum all Weighted values');
        assert.equal(result.Category_math, 30, 'Should sum all Category values');
    });

    QUnit.test('_createEmptyMNOP - creates proper structure', function(assert) {
        var mnop = mnopHelper._createEmptyMNOP(['math', 'science']);

        assert.expect(6);
        assert.equal(mnop.Total, 0, 'Total should be 0');
        assert.equal(mnop.Weighted, 0, 'Weighted should be 0');
        assert.equal(mnop.Category_math, 0, 'Category_math should be 0');
        assert.equal(mnop.Category_science, 0, 'Category_science should be 0');
        assert.equal(mnop.Weighted_Category_math, 0, 'Weighted_Category_math should be 0');
        assert.equal(mnop.Weighted_Category_science, 0, 'Weighted_Category_science should be 0');
    });

    QUnit.test('_aggregateWithSelection - selects top N per metric', function(assert) {
        var mnops = [
            {Total: 10, Weighted: 20, Category_math: 10},
            {Total: 15, Weighted: 10, Category_math: 15},
            {Total: 8,  Weighted: 25, Category_math: 8}
        ];

        var result = mnopHelper._aggregateWithSelection(mnops, 2, ['math']);

        assert.expect(3);
        assert.equal(result.Total, 25, 'Should sum top 2 by Total (15+10)');
        assert.equal(result.Weighted, 45, 'Should sum top 2 by Weighted (25+20)');
        assert.equal(result.Category_math, 25, 'Should sum top 2 by Category_math (15+10)');
    });

    QUnit.module('MNOP Calculator - Cache');

    QUnit.test('clearCache', function(assert) {
        mnopHelper._maxScoreCache = { 'http://item1': 10 };

        assert.expect(2);
        assert.equal(Object.keys(mnopHelper._maxScoreCache).length, 1, 'Cache should have 1 entry');

        mnopHelper.clearCache();

        assert.equal(Object.keys(mnopHelper._maxScoreCache).length, 0, 'Cache should be empty after clear');
    });
});
