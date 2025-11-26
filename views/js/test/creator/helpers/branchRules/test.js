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
 * Copyright (c) 2025 (original work) Open Assessment Technologies SA;
 */

define([
    'jquery',
    'lodash',
    'i18n',
    'taoQtiTest/controller/creator/helpers/baseType',
    'taoQtiTest/controller/creator/helpers/branchRule'
], function ($, _, __, baseTypeHelper, branchRuleHelper) {
    'use strict';

    var branchRuleApi = [
        { title: 'normalizeModel' },
        { title: 'serializeModel' },
        { title: 'buildQtiBranchRule' },
        { title: 'parseQtiBranchRule' },
        { title: 'refreshOptions' },
        { title: 'bindSync' },
        { title: 'collectBranchRuleRefsByTarget' },
        { title: 'collectBranchRuleRefsByVariable' },
        { title: 'purgeRulesWithMissingTargets' },
        { title: 'purgeRulesWithMissingVariables' }
    ];

    QUnit.module('helpers/branchRule');

    QUnit.test('module', function (assert) {
        assert.expect(1);
        assert.equal(typeof branchRuleHelper, 'object', 'The branchRule helper module exposes an object');
    });

    QUnit.cases
        .init(branchRuleApi)
        .test('helpers/branchRule API ', function (data, assert) {
            assert.expect(1);
            assert.equal(
                typeof branchRuleHelper[data.title],
                'function',
                'The branchRule helper exposes a "' + data.title + '" function'
            );
        });

    QUnit.module('BranchRule - buildQtiBranchRule');

    QUnit.test('buildQtiBranchRule - basic mapping and numeric handling', function (assert) {
        var row = {
            target: 'PART_A',
            variable: 'SCORE',
            operator: 'gte',
            value: '12.5'
        };

        var rule = branchRuleHelper.buildQtiBranchRule(row);

        assert.expect(7);
        assert.equal(rule['qti-type'], 'branchRule', 'Should create a branchRule node');
        assert.equal(rule.target, 'PART_A', 'Target should be taken from row.target');
        assert.ok(rule.expression, 'Should have an expression');
        assert.equal(rule.expression['qti-type'], 'gte', 'Operator should map directly from "gte"');
        assert.equal(rule.expression.expressions[0]['qti-type'], 'variable', 'First expression is a variable');
        assert.equal(rule.expression.expressions[0].identifier, 'SCORE', 'Variable identifier should match');
        assert.equal(rule.expression.expressions[1].value, 12.5, 'Numeric value should be parsed to number');
    });

    QUnit.test('buildQtiBranchRule - invalid operator defaults to lt', function (assert) {
        var row = {
            target: 'PART_B',
            variable: 'TIME_TAKEN',
            operator: 'INVALID_OP',
            value: '5'
        };

        var rule = branchRuleHelper.buildQtiBranchRule(row);

        assert.expect(2);
        assert.equal(rule.expression['qti-type'], 'lt', 'Unknown operator should fallback to "lt"');
        assert.equal(rule.target, 'PART_B', 'Target should still be set correctly');
    });

    QUnit.test('buildQtiBranchRule - invalid value falls back to 0', function (assert) {
        var row = {
            target: 'PART_C',
            variable: 'SCORE',
            operator: 'eq',
            value: 'not-a-number'
        };

        var rule = branchRuleHelper.buildQtiBranchRule(row);

        assert.expect(2);
        assert.equal(rule.expression.expressions[1].value, 0, 'Invalid value should fallback to 0');
        assert.equal(rule.expression.expressions[1]['qti-type'], 'baseValue', 'Second expression should be baseValue');
    });

    QUnit.test('buildQtiBranchRule - integer vs float baseType selection', function (assert) {
        var rowInt = { target: 'P1', variable: 'SCORE', operator: 'gt', value: 10 };
        var rowFloat = { target: 'P1', variable: 'SCORE', operator: 'gt', value: 10.5 };

        var ruleInt = branchRuleHelper.buildQtiBranchRule(rowInt);
        var ruleFloat = branchRuleHelper.buildQtiBranchRule(rowFloat);

        var expectedIntType = baseTypeHelper.getValid(baseTypeHelper.INTEGER, baseTypeHelper.FLOAT);
        var expectedFloatType = baseTypeHelper.getValid(baseTypeHelper.FLOAT, baseTypeHelper.FLOAT);

        assert.expect(4);
        assert.equal(ruleInt.expression.expressions[1].value, 10, 'Integer value should remain integer');
        assert.equal(ruleInt.expression.expressions[1].baseType, expectedIntType, 'Integer should use INTEGER-derived baseType');
        assert.equal(ruleFloat.expression.expressions[1].value, 10.5, 'Float value should remain float');
        assert.equal(ruleFloat.expression.expressions[1].baseType, expectedFloatType, 'Float should use FLOAT-derived baseType');
    });

    QUnit.test('buildQtiBranchRule - missing target and variable default to empty strings', function (assert) {
        var row = {
            operator: 'lt',
            value: 3
        };

        var rule = branchRuleHelper.buildQtiBranchRule(row);

        assert.expect(3);
        assert.equal(rule.target, '', 'Missing target should default to empty string');
        assert.equal(rule.expression.expressions[0].identifier, '', 'Missing variable should default to empty string');
        assert.equal(rule.expression.expressions[1].value, 3, 'Value should still be correctly set');
    });

    QUnit.module('BranchRule - parseQtiBranchRule');

    QUnit.test('parseQtiBranchRule - basic parsing and operator mapping', function (assert) {
        var qtiRule = {
            'qti-type': 'branchRule',
            target: 'PART_A',
            expression: {
                'qti-type': 'equal',
                expressions: [
                    { 'qti-type': 'variable', identifier: 'SCORE' },
                    { 'qti-type': 'baseValue', baseType: 'float', value: '7.5' }
                ]
            }
        };

        var row = branchRuleHelper.parseQtiBranchRule(qtiRule);

        assert.expect(6);
        assert.equal(row.target, 'PART_A', 'Target should match branchRule target');
        assert.equal(row.variable, 'SCORE', 'Variable should come from variable expression');
        assert.equal(row.operator, 'eq', 'QTI "equal" should map to "eq"');
        assert.equal(row.value, 7.5, 'Value should be parsed to number');
        assert.strictEqual(row.__qti, qtiRule, '__qti should keep reference to source rule');
        assert.ok(typeof row === 'object', 'Parsed result is an object');
    });

    QUnit.test('parseQtiBranchRule - missing fields fall back to defaults', function (assert) {
        var qtiRule = {
            expression: {
                expressions: [
                    { 'qti-type': 'baseValue', baseType: 'integer', value: '' }
                ]
            }
        };

        var row = branchRuleHelper.parseQtiBranchRule(qtiRule);

        assert.expect(4);
        assert.equal(row.target, '', 'Missing target should default to empty string');
        assert.equal(row.variable, '', 'Missing variable should default to empty string');
        assert.equal(row.operator, 'lt', 'Unknown operator should fallback to "lt"');
        assert.equal(row.value, 0, 'Empty value should fallback to 0');
    });

    QUnit.test('parseQtiBranchRule - invalid numeric value falls back to 0', function (assert) {
        var qtiRule = {
            target: 'P1',
            expression: {
                'qti-type': 'gt',
                expressions: [
                    { 'qti-type': 'variable', identifier: 'SCORE' },
                    { 'qti-type': 'baseValue', baseType: 'float', value: 'NaNish' }
                ]
            }
        };

        var row = branchRuleHelper.parseQtiBranchRule(qtiRule);

        assert.expect(2);
        assert.equal(row.value, 0, 'Invalid numeric value should fallback to 0');
        assert.equal(row.operator, 'gt', 'Operator should still map correctly');
    });

    QUnit.module('BranchRule - normalizeModel');

    QUnit.test('normalizeModel - handles null or invalid models gracefully', function (assert) {
        assert.expect(2);

        branchRuleHelper.normalizeModel(null);
        assert.ok(true, 'normalizeModel(null) should not throw');

        branchRuleHelper.normalizeModel({});
        assert.ok(true, 'normalizeModel({}) should not throw');
    });

    QUnit.test('normalizeModel - ensures branchRules array exists', function (assert) {
        var existingBranchRules;
        var testModel = {
            testParts: [
                { identifier: 'P1' },
                { identifier: 'P2', branchRules: [] }
            ]
        };

        existingBranchRules = testModel.testParts[1].branchRules;
        branchRuleHelper.normalizeModel(testModel);

        assert.expect(3);
        assert.ok(Array.isArray(testModel.testParts[0].branchRules), 'Missing branchRules should be created as array');
        assert.equal(testModel.testParts[0].branchRules.length, 0, 'New branchRules array should be empty');
        assert.strictEqual(testModel.testParts[1].branchRules, existingBranchRules, 'Existing branchRules array should be preserved');
    });

    QUnit.test('normalizeModel - converts QTI branchRules to flat rows', function (assert) {
        var qtiRule = {
            'qti-type': 'branchRule',
            target: 'PART_A',
            expression: {
                'qti-type': 'lt',
                expressions: [
                    { 'qti-type': 'variable', identifier: 'SCORE' },
                    { 'qti-type': 'baseValue', baseType: 'integer', value: 10 }
                ]
            }
        };

        var testModel = {
            testParts: [
                {
                    identifier: 'P1',
                    branchRules: [qtiRule]
                }
            ]
        };

        branchRuleHelper.normalizeModel(testModel);

        var row = testModel.testParts[0].branchRules[0];

        assert.expect(5);
        assert.equal(typeof row, 'object', 'Normalized branch rule should be an object');
        assert.equal(row.target, 'PART_A', 'Target should be preserved');
        assert.equal(row.variable, 'SCORE', 'Variable should be preserved');
        assert.equal(row.value, 10, 'Value should be preserved');
        assert.strictEqual(row.__qti, qtiRule, '__qti should reference original QTI rule');
    });

    QUnit.test('normalizeModel - leaves non-QTI branchRules unchanged', function (assert) {
        var uiRule = {
            target: 'PART_A',
            variable: 'SCORE',
            operator: 'lt',
            value: 5
        };

        var testModel = {
            testParts: [
                {
                    identifier: 'P1',
                    branchRules: [uiRule]
                }
            ]
        };

        branchRuleHelper.normalizeModel(testModel);

        assert.expect(2);
        assert.strictEqual(testModel.testParts[0].branchRules[0], uiRule, 'Non-QTI branch rules should stay untouched');
        assert.equal(testModel.testParts[0].branchRules.length, 1, 'BranchRules length should remain the same');
    });

    QUnit.module('BranchRule - serializeModel');

    QUnit.test('serializeModel - handles null or invalid models gracefully', function (assert) {
        assert.expect(2);

        branchRuleHelper.serializeModel(null);
        assert.ok(true, 'serializeModel(null) should not throw');

        branchRuleHelper.serializeModel({});
        assert.ok(true, 'serializeModel({}) should not throw');
    });

    QUnit.test('serializeModel - converts UI rows to QTI branchRules', function (assert) {
        var testModel = {
            testParts: [
                {
                    identifier: 'P1',
                    branchRules: [
                        {
                            target: 'PART_A',
                            variable: 'SCORE',
                            operator: 'gt',
                            value: 3
                        }
                    ]
                }
            ]
        };

        branchRuleHelper.serializeModel(testModel);

        var rule = testModel.testParts[0].branchRules[0];

        assert.expect(5);
        assert.equal(rule['qti-type'], 'branchRule', 'Serialized rule should be a QTI branchRule');
        assert.equal(rule.target, 'PART_A', 'Target should be preserved');
        assert.equal(rule.expression['qti-type'], 'gt', 'Operator should be mapped to QTI type');
        assert.equal(rule.expression.expressions[0].identifier, 'SCORE', 'Variable should be preserved');
        assert.equal(rule.expression.expressions[1].value, 3, 'Value should be preserved');
    });

    QUnit.test('serializeModel - leaves QTI branchRules unchanged', function (assert) {
        var qtiRule = {
            'qti-type': 'branchRule',
            target: 'PART_A'
        };

        var testModel = {
            testParts: [
                {
                    identifier: 'P1',
                    branchRules: [qtiRule]
                }
            ]
        };

        branchRuleHelper.serializeModel(testModel);

        assert.expect(1);
        assert.strictEqual(testModel.testParts[0].branchRules[0], qtiRule, 'Existing QTI branch rules should be preserved');
    });

    QUnit.module('BranchRule - refreshOptions');

    QUnit.test('refreshOptions - builds and stores branchOptions and triggers update on change', function (assert) {
        var done = assert.async();

        var testModel = {
            testParts: [
                { identifier: 'PART_1' },
                { identifier: 'PART_2' }
            ],
            outcomeDeclarations: [
                { identifier: 'SCORE' },
                { identifier: 'TIME' }
            ]
        };

        var cfg = { branchOptions: null };
        var triggers = [];

        var modelOverseer = {
            getConfig: function () {
                return cfg;
            },
            getModel: function () {
                return testModel;
            },
            trigger: function (eventName) {
                triggers.push(eventName);
            }
        };

        var opts = branchRuleHelper.refreshOptions(modelOverseer);

        assert.expect(11);
        assert.ok(opts, 'refreshOptions should return a branchOptions object');
        assert.equal(cfg.branchOptions, opts, 'branchOptions should be stored in config');
        assert.equal(opts.targets.length, 3, 'There should be 2 testParts + EXIT_TEST');
        assert.deepEqual(
            _.map(opts.targets, 'value'),
            ['PART_1', 'PART_2', 'EXIT_TEST'],
            'Target values should include all parts and EXIT_TEST'
        );
        assert.equal(opts.variables.length, 2, 'Variables should come from outcomeDeclarations');
        assert.deepEqual(
            _.map(opts.variables, 'value'),
            ['SCORE', 'TIME'],
            'Variable values should match outcome identifiers'
        );
        assert.equal(opts.operators.length, 5, 'There should be 5 operators');
        assert.deepEqual(
            _.map(opts.operators, 'value'),
            ['lt', 'lte', 'eq', 'gt', 'gte'],
            'Operators should be lt, lte, eq, gt, gte'
        );
        assert.equal(triggers.length, 1, 'First call should trigger branch-options-update');
        assert.equal(triggers[0], 'branch-options-update', 'Correct event should be triggered');

        // Second call with same model should not trigger again
        branchRuleHelper.refreshOptions(modelOverseer);
        assert.equal(triggers.length, 1, 'Second call with unchanged model should not trigger again');

        done();
    });

    QUnit.module('BranchRule - bindSync', {
        beforeEach: function () {
            // Ensure a fresh fixture
            $('#qunit-fixture').empty();
        }
    });

    QUnit.test('bindSync - add.binder on testparts triggers refreshOptions', function (assert) {
        var done = assert.async();
        var fixture = $('#qunit-fixture');
        var $testparts = $('<div class="testparts"></div>').appendTo(fixture);
        var $testpart = $('<div class="testpart"></div>').appendTo($testparts);

        var cfg = { branchOptions: null };
        var triggerCount = 0;

        var model = {
            testParts: [{ identifier: 'PART_1' }],
            outcomeDeclarations: []
        };

        var modelOverseer = {
            getConfig: function () {
                return cfg;
            },
            getModel: function () {
                return model;
            },
            trigger: function (eventName) {
                if (eventName === 'branch-options-update') {
                    triggerCount++;
                }
            }
        };

        branchRuleHelper.bindSync(modelOverseer);

        // Simulate add.binder event as binder does (event namespace 'binder')
        $testparts.trigger('add.binder', [$testpart]);

        // allow debounce + setTimeout(0) to run
        setTimeout(function () {
            assert.expect(1);
            assert.ok(triggerCount >= 1, 'add.binder on .testparts with .testpart should trigger branch-options-update');
            done();
        }, 10);
    });

    QUnit.test('bindSync - change.binder on testPart model triggers refreshOptions', function (assert) {
        var done = assert.async();

        var cfg = { branchOptions: null };
        var triggerCount = 0;

        var model = {
            testParts: [{ identifier: 'PART_1' }],
            outcomeDeclarations: []
        };

        var modelOverseer = {
            getConfig: function () {
                return cfg;
            },
            getModel: function () {
                return model;
            },
            trigger: function (eventName) {
                if (eventName === 'branch-options-update') {
                    triggerCount++;
                }
            }
        };

        branchRuleHelper.bindSync(modelOverseer);

        // Simulate a rename/change on a testPart
        $(document).trigger('change.binder', [{ 'qti-type': 'testPart', identifier: 'PART_1' }]);

        setTimeout(function () {
            assert.expect(1);
            assert.ok(triggerCount >= 1, 'change.binder on testPart should trigger branch-options-update');
            done();
        }, 10);
    });

    QUnit.test('bindSync - outcome delete triggers refreshOptions', function (assert) {
        var done = assert.async();
        var fixture = $('#qunit-fixture');
        var $outcomes = $('<div class="outcome-declarations-manual"></div>').appendTo(fixture);

        var cfg = { branchOptions: null };
        var triggerCount = 0;

        var model = {
            testParts: [{ identifier: 'PART_1' }],
            outcomeDeclarations: [{ identifier: 'SCORE' }]
        };

        var modelOverseer = {
            getConfig: function () {
                return cfg;
            },
            getModel: function () {
                return model;
            },
            trigger: function (eventName) {
                if (eventName === 'branch-options-update') {
                    triggerCount++;
                }
            }
        };

        branchRuleHelper.bindSync(modelOverseer);

        // Simulate outcome deletion
        $outcomes.trigger('deleted.deleter.branchOutcomes', []);

        setTimeout(function () {
            assert.expect(1);
            assert.ok(triggerCount >= 1, 'Deleted outcome should trigger branch-options-update');
            done();
        }, 10);
    });

    QUnit.module('BranchRule - collectBranchRuleRefsByTarget');

    QUnit.test('collectBranchRuleRefsByTarget - counts and samples matches', function (assert) {
        var testModel = {
            testParts: [
                {
                    identifier: 'P1',
                    branchRules: [
                        { target: 'T1' },
                        { target: 'T2' },
                        { target: 'T1' }
                    ]
                },
                {
                    identifier: 'P2',
                    branchRules: [
                        { target: 'T1' },
                        { target: 'T3' }
                    ]
                }
            ]
        };

        var refs = branchRuleHelper.collectBranchRuleRefsByTarget(testModel, 'T1');

        assert.expect(4);
        assert.equal(refs.count, 3, 'Should count all matching rules');
        assert.ok(Array.isArray(refs.samples), 'Samples should be an array');
        assert.ok(refs.samples.length <= 3, 'Samples should contain up to count items');
        assert.deepEqual(
            _.map(refs.samples, 'part'),
            ['P1', 'P1', 'P2'],
            'Samples should list correct part identifiers for matches'
        );
    });

    QUnit.test('collectBranchRuleRefsByTarget - no matches', function (assert) {
        var testModel = {
            testParts: [
                {
                    identifier: 'P1',
                    branchRules: [{ target: 'OTHER' }]
                }
            ]
        };

        var refs = branchRuleHelper.collectBranchRuleRefsByTarget(testModel, 'T1');

        assert.expect(2);
        assert.equal(refs.count, 0, 'Count should be 0 when no matches');
        assert.equal(refs.samples.length, 0, 'Samples should be empty when no matches');
    });

    QUnit.module('BranchRule - collectBranchRuleRefsByVariable');

    QUnit.test('collectBranchRuleRefsByVariable - counts and samples matches', function (assert) {
        var testModel = {
            testParts: [
                {
                    identifier: 'P1',
                    branchRules: [
                        { variable: 'SCORE' },
                        { variable: 'TIME' },
                        { variable: 'SCORE' }
                    ]
                },
                {
                    identifier: 'P2',
                    branchRules: [
                        { variable: 'SCORE' }
                    ]
                }
            ]
        };

        var refs = branchRuleHelper.collectBranchRuleRefsByVariable(testModel, 'SCORE');

        assert.expect(3);
        assert.equal(refs.count, 3, 'Should count all rules referencing variable');
        assert.ok(Array.isArray(refs.samples), 'Samples should be an array');
        assert.deepEqual(
            _.map(refs.samples, 'part'),
            ['P1', 'P1', 'P2'],
            'Samples should list correct part identifiers'
        );
    });

    QUnit.test('collectBranchRuleRefsByVariable - no matches', function (assert) {
        var testModel = {
            testParts: [
                {
                    identifier: 'P1',
                    branchRules: [{ variable: 'OTHER' }]
                }
            ]
        };

        var refs = branchRuleHelper.collectBranchRuleRefsByVariable(testModel, 'SCORE');

        assert.expect(2);
        assert.equal(refs.count, 0, 'Count should be 0 when no variable matches');
        assert.equal(refs.samples.length, 0, 'Samples should be empty when no matches');
    });

    QUnit.module('BranchRule - purgeRulesWithMissingTargets');

    QUnit.test('purgeRulesWithMissingTargets - removes rules with given target across all parts', function (assert) {
        var testModel = {
            testParts: [
                {
                    identifier: 'P1',
                    branchRules: [
                        { target: 'KEEP' },
                        { target: 'REMOVE' }
                    ]
                },
                {
                    identifier: 'P2',
                    branchRules: [
                        { target: 'REMOVE' },
                        { target: 'KEEP' }
                    ]
                }
            ]
        };

        branchRuleHelper.purgeRulesWithMissingTargets(testModel, 'REMOVE');

        assert.expect(4);
        assert.equal(testModel.testParts[0].branchRules.length, 1, 'First part should keep 1 rule');
        assert.equal(testModel.testParts[0].branchRules[0].target, 'KEEP', 'Remaining rule in part 1 should have target KEEP');
        assert.equal(testModel.testParts[1].branchRules.length, 1, 'Second part should keep 1 rule');
        assert.equal(testModel.testParts[1].branchRules[0].target, 'KEEP', 'Remaining rule in part 2 should have target KEEP');
    });

    QUnit.module('BranchRule - purgeRulesWithMissingVariables');

    QUnit.test('purgeRulesWithMissingVariables - removes rules whose variable is no longer declared', function (assert) {
        var testModel = {
            outcomeDeclarations: [
                { identifier: 'SCORE' },
                { identifier: 'TIME' }
            ],
            testParts: [
                {
                    identifier: 'P1',
                    branchRules: [
                        { variable: 'SCORE' },
                        { variable: 'OLD' }
                    ]
                },
                {
                    identifier: 'P2',
                    branchRules: [
                        { variable: 'TIME' },
                        { variable: 'DEPRECATED' }
                    ]
                }
            ]
        };

        branchRuleHelper.purgeRulesWithMissingVariables(testModel);

        assert.expect(4);
        assert.equal(testModel.testParts[0].branchRules.length, 1, 'First part should only keep 1 rule');
        assert.equal(testModel.testParts[0].branchRules[0].variable, 'SCORE', 'Remaining rule in part 1 should reference SCORE');
        assert.equal(testModel.testParts[1].branchRules.length, 1, 'Second part should only keep 1 rule');
        assert.equal(testModel.testParts[1].branchRules[0].variable, 'TIME', 'Remaining rule in part 2 should reference TIME');
    });
});