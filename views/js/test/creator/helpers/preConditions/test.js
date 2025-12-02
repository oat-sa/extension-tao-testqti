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
    'lodash',
    'taoQtiTest/controller/creator/helpers/baseType',
    'taoQtiTest/controller/creator/helpers/operatorMap',
    'taoQtiTest/controller/creator/helpers/preCondition'
], function (_, baseTypeHelper, operatorMap, preConditionHelper) {
    'use strict';

    var preConditionApi = [
        { title: 'normalizeModel' },
        { title: 'serializeModel' },
        { title: 'buildQtiPreCondition' },
        { title: 'parseQtiPreCondition' },
        { title: 'purgeConditionsWithMissingVariables' }
    ];

    QUnit.module('helpers/preCondition');

    QUnit.test('module', function (assert) {
        assert.expect(1);
        assert.equal(typeof preConditionHelper, 'object', 'The preCondition helper module exposes an object');
    });

    QUnit.cases
        .init(preConditionApi)
        .test('helpers/preCondition API ', function (data, assert) {
            assert.expect(1);
            assert.equal(
                typeof preConditionHelper[data.title],
                'function',
                'The preCondition helper exposes a "' + data.title + '" function'
            );
        });

    QUnit.module('PreCondition - buildQtiPreCondition');

    QUnit.test('buildQtiPreCondition - basic mapping and numeric handling', function (assert) {
        var row = {
            variable: 'SCORE',
            operator: 'gte',
            value: '12.5'
        };

        var pre = preConditionHelper.buildQtiPreCondition(row);

        assert.expect(7);
        assert.equal(pre['qti-type'], 'preCondition', 'Should create a preCondition node');
        assert.ok(pre.expression, 'Should have an expression');
        assert.equal(pre.expression['qti-type'], operatorMap.opToQti.gte, 'Operator should map using opToQti');
        assert.equal(pre.expression.expressions[0]['qti-type'], 'variable', 'First expression is a variable');
        assert.equal(pre.expression.expressions[0].identifier, 'SCORE', 'Variable identifier should match');
        assert.equal(pre.expression.expressions[1]['qti-type'], 'baseValue', 'Second expression is a baseValue');
        assert.equal(pre.expression.expressions[1].value, 12.5, 'Numeric value should be parsed to number');
    });

    QUnit.test('buildQtiPreCondition - invalid operator defaults to lt', function (assert) {
        var row = {
            variable: 'TIME_TAKEN',
            operator: 'INVALID_OP',
            value: '5'
        };

        var pre = preConditionHelper.buildQtiPreCondition(row);

        assert.expect(1);
        assert.equal(pre.expression['qti-type'], 'lt', 'Unknown operator should fallback to "lt"');
    });

    QUnit.test('buildQtiPreCondition - invalid value falls back to 0', function (assert) {
        var row = {
            variable: 'SCORE',
            operator: 'eq',
            value: 'not-a-number'
        };

        var pre = preConditionHelper.buildQtiPreCondition(row);

        assert.expect(2);
        assert.equal(pre.expression.expressions[1].value, 0, 'Invalid value should fallback to 0');
        assert.equal(pre.expression.expressions[1]['qti-type'], 'baseValue', 'Second expression should be baseValue');
    });

    QUnit.test('buildQtiPreCondition - integer vs float baseType selection', function (assert) {
        var rowInt = { variable: 'SCORE', operator: 'gt', value: 10 };
        var rowFloat = { variable: 'SCORE', operator: 'gt', value: 10.5 };

        var preInt = preConditionHelper.buildQtiPreCondition(rowInt);
        var preFloat = preConditionHelper.buildQtiPreCondition(rowFloat);

        var expectedIntType = baseTypeHelper.getValid(baseTypeHelper.INTEGER, baseTypeHelper.FLOAT);
        var expectedFloatType = baseTypeHelper.getValid(baseTypeHelper.FLOAT, baseTypeHelper.FLOAT);

        assert.expect(4);
        assert.equal(preInt.expression.expressions[1].value, 10, 'Integer value should remain integer');
        assert.equal(preInt.expression.expressions[1].baseType, expectedIntType, 'Integer should use INTEGER-derived baseType');
        assert.equal(preFloat.expression.expressions[1].value, 10.5, 'Float value should remain float');
        assert.equal(preFloat.expression.expressions[1].baseType, expectedFloatType, 'Float should use FLOAT-derived baseType');
    });

    QUnit.test('buildQtiPreCondition - missing variable defaults to empty string', function (assert) {
        var row = {
            operator: 'lt',
            value: 3
        };

        var pre = preConditionHelper.buildQtiPreCondition(row);

        assert.expect(2);
        assert.equal(pre.expression.expressions[0].identifier, '', 'Missing variable should default to empty string');
        assert.equal(pre.expression.expressions[1].value, 3, 'Value should still be correctly set');
    });

    QUnit.module('PreCondition - parseQtiPreCondition');

    QUnit.test('parseQtiPreCondition - basic parsing and operator mapping', function (assert) {
        var qtiPre = {
            'qti-type': 'preCondition',
            expression: {
                'qti-type': 'equal',
                expressions: [
                    { 'qti-type': 'variable', identifier: 'SCORE' },
                    { 'qti-type': 'baseValue', baseType: 'float', value: '7.5' }
                ]
            }
        };

        var row = preConditionHelper.parseQtiPreCondition(qtiPre);

        assert.expect(6);
        assert.equal(row.variable, 'SCORE', 'Variable should come from variable expression');
        assert.equal(row.operator, 'eq', 'QTI "equal" should map to "eq"');
        assert.equal(row.value, 7.5, 'Value should be parsed to number');
        assert.strictEqual(row.__qti, qtiPre, '__qti should keep reference to source preCondition');
        assert.ok(typeof row === 'object', 'Parsed result is an object');
        assert.ok(Object.prototype.hasOwnProperty.call(row, 'operator'), 'Row should have an operator field');
    });

    QUnit.test('parseQtiPreCondition - missing fields fall back to defaults', function (assert) {
        var qtiPre = {
            expression: {
                expressions: [
                    { 'qti-type': 'baseValue', baseType: 'integer', value: '' }
                ]
            }
        };

        var row = preConditionHelper.parseQtiPreCondition(qtiPre);

        assert.expect(3);
        assert.equal(row.variable, '', 'Missing variable should default to empty string');
        assert.equal(row.operator, 'lt', 'Unknown operator should fallback to "lt"');
        assert.equal(row.value, 0, 'Empty value should fallback to 0');
    });

    QUnit.test('parseQtiPreCondition - invalid numeric value falls back to 0', function (assert) {
        var qtiPre = {
            'qti-type': 'preCondition',
            expression: {
                'qti-type': 'gt',
                expressions: [
                    { 'qti-type': 'variable', identifier: 'SCORE' },
                    { 'qti-type': 'baseValue', baseType: 'float', value: 'NaNish' }
                ]
            }
        };

        var row = preConditionHelper.parseQtiPreCondition(qtiPre);

        assert.expect(2);
        assert.equal(row.value, 0, 'Invalid numeric value should fallback to 0');
        assert.equal(row.operator, 'gt', 'Operator should still map correctly');
    });

    QUnit.module('PreCondition - normalizeModel');

    QUnit.test('normalizeModel - handles null or invalid models gracefully', function (assert) {
        assert.expect(2);

        preConditionHelper.normalizeModel(null);
        assert.ok(true, 'normalizeModel(null) should not throw');

        preConditionHelper.normalizeModel({});
        assert.ok(true, 'normalizeModel({}) should not throw');
    });

    QUnit.test('normalizeModel - ensures preConditions array exists', function (assert) {
        var testModel = {
            testParts: [
                { identifier: 'P1' },
                { identifier: 'P2', preConditions: [] }
            ]
        };

        preConditionHelper.normalizeModel(testModel);

        assert.expect(3);
        assert.ok(Array.isArray(testModel.testParts[0].preConditions), 'Missing preConditions should be created as array');
        assert.equal(testModel.testParts[0].preConditions.length, 0, 'New preConditions array should be empty');
        assert.strictEqual(testModel.testParts[1].preConditions, testModel.testParts[1].preConditions, 'Existing preConditions array should be preserved');
    });

    QUnit.test('normalizeModel - converts QTI preConditions to flat rows', function (assert) {
        var qtiPre = {
            'qti-type': 'preCondition',
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
                    preConditions: [qtiPre]
                }
            ]
        };

        preConditionHelper.normalizeModel(testModel);

        var row = testModel.testParts[0].preConditions[0];

        assert.expect(4);
        assert.equal(typeof row, 'object', 'Normalized preCondition should be an object');
        assert.equal(row.variable, 'SCORE', 'Variable should be preserved');
        assert.equal(row.value, 10, 'Value should be preserved');
        assert.strictEqual(row.__qti, qtiPre, '__qti should reference original QTI preCondition');
    });

    QUnit.test('normalizeModel - leaves non-QTI preConditions unchanged', function (assert) {
        var uiPre = {
            variable: 'SCORE',
            operator: 'lt',
            value: 5
        };

        var testModel = {
            testParts: [
                {
                    identifier: 'P1',
                    preConditions: [uiPre]
                }
            ]
        };

        preConditionHelper.normalizeModel(testModel);

        assert.expect(2);
        assert.strictEqual(testModel.testParts[0].preConditions[0], uiPre, 'Non-QTI preConditions should stay untouched');
        assert.equal(testModel.testParts[0].preConditions.length, 1, 'preConditions length should remain the same');
    });

    QUnit.module('PreCondition - serializeModel');

    QUnit.test('serializeModel - handles null or invalid models gracefully', function (assert) {
        assert.expect(2);

        preConditionHelper.serializeModel(null);
        assert.ok(true, 'serializeModel(null) should not throw');

        preConditionHelper.serializeModel({});
        assert.ok(true, 'serializeModel({}) should not throw');
    });

    QUnit.test('serializeModel - converts UI rows to QTI preConditions', function (assert) {
        var testModel = {
            testParts: [
                {
                    identifier: 'P1',
                    preConditions: [
                        {
                            variable: 'SCORE',
                            operator: 'gt',
                            value: 3
                        }
                    ]
                }
            ]
        };

        preConditionHelper.serializeModel(testModel);

        var pre = testModel.testParts[0].preConditions[0];

        assert.expect(4);
        assert.equal(pre['qti-type'], 'preCondition', 'Serialized preCondition should be a QTI node');
        assert.equal(pre.expression['qti-type'], 'gt', 'Operator should be mapped to QTI type');
        assert.equal(pre.expression.expressions[0].identifier, 'SCORE', 'Variable should be preserved');
        assert.equal(pre.expression.expressions[1].value, 3, 'Value should be preserved');
    });

    QUnit.test('serializeModel - leaves QTI preConditions unchanged', function (assert) {
        var qtiPre = {
            'qti-type': 'preCondition',
            expression: {
                'qti-type': 'lt',
                expressions: []
            }
        };

        var testModel = {
            testParts: [
                {
                    identifier: 'P1',
                    preConditions: [qtiPre]
                }
            ]
        };

        preConditionHelper.serializeModel(testModel);

        assert.expect(1);
        assert.strictEqual(testModel.testParts[0].preConditions[0], qtiPre, 'Existing QTI preConditions should be preserved');
    });

    QUnit.module('PreCondition - purgeConditionsWithMissingVariables');

    QUnit.test('purgeConditionsWithMissingVariables - removes preConditions with missing variables', function (assert) {
        var testModel = {
            outcomeDeclarations: [
                { identifier: 'SCORE' },
                { identifier: 'TIME' }
            ],
            testParts: [
                {
                    identifier: 'P1',
                    preConditions: [
                        { variable: 'SCORE' },
                        { variable: 'OLD' }
                    ]
                },
                {
                    identifier: 'P2',
                    preConditions: [
                        { variable: 'TIME' },
                        { variable: 'DEPRECATED' }
                    ]
                }
            ]
        };

        preConditionHelper.purgeConditionsWithMissingVariables(testModel);

        assert.expect(4);
        assert.equal(testModel.testParts[0].preConditions.length, 1, 'First part should only keep 1 preCondition');
        assert.equal(testModel.testParts[0].preConditions[0].variable, 'SCORE', 'Remaining preCondition in part 1 should reference SCORE');
        assert.equal(testModel.testParts[1].preConditions.length, 1, 'Second part should only keep 1 preCondition');
        assert.equal(testModel.testParts[1].preConditions[0].variable, 'TIME', 'Remaining preCondition in part 2 should reference TIME');
    });

    QUnit.test('purgeConditionsWithMissingVariables - handles missing outcomeDeclarations gracefully', function (assert) {
        var testModel = {
            testParts: [
                {
                    identifier: 'P1',
                    preConditions: [
                        { variable: 'SCORE' }
                    ]
                }
            ]
        };

        preConditionHelper.purgeConditionsWithMissingVariables(testModel);

        assert.expect(2);
        assert.equal(testModel.testParts[0].preConditions.length, 0, 'All preConditions should be removed when no outcomes exist');
        assert.deepEqual(testModel.outcomeDeclarations, undefined, 'outcomeDeclarations stays undefined');
    });
});