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
 * Copyright (c) 2018-2022 (original work) Open Assessment Technologies SA ;
 */
/**
 * @author Bertrand Chevrier <bertrand@taotesting.com>
 */
define([
    'taoQtiTest/controller/creator/helpers/validators',
    'json!taoQtiTest/test/creator/helpers/validators/sample.json'
], function(qtiTestHelper, sampleModel) {
    'use strict';

    QUnit.module('API');

    QUnit.test('module', function(assert) {
        assert.expect(1);
        assert.equal(typeof qtiTestHelper, 'object', 'The module exposes an object');
    });

    QUnit.cases.init([
        {title: 'extractIdentifiers'},
    ]).test('method ', function(data, assert) {
        assert.expect(1);
        assert.equal(typeof qtiTestHelper[data.title], 'function', 'The helper exposes a "' + data.title + '" method');
    });

    QUnit.module('identifiers');

    QUnit.test('extract all identifiers', function(assert) {
        assert.expect(2);

        const identifiers = qtiTestHelper.extractIdentifiers(sampleModel);

        assert.ok(identifiers.length > 0, 'The identifiers are exported as an array');
        assert.deepEqual(identifiers, [{
            'identifier': 'T1',
            'originalIdentifier': 't1',
            'type': 'assessmentTest',
            'label': 'Test+4'
        }, {
            'identifier': 'SCORE_TOTAL',
            'originalIdentifier': 'SCORE_TOTAL',
            'type': 'outcomeDeclaration',
            'label': 'SCORE_TOTAL'
        }, {
            'identifier': 'SCORE_TOTAL_MAX',
            'originalIdentifier': 'SCORE_TOTAL_MAX',
            'type': 'outcomeDeclaration',
            'label': 'SCORE_TOTAL_MAX'
        }, {
            'identifier': 'SCORE_RATIO',
            'originalIdentifier': 'SCORE_RATIO',
            'type': 'outcomeDeclaration',
            'label': 'SCORE_RATIO'
        }, {
            'identifier': 'PASS_ALL',
            'originalIdentifier': 'PASS_ALL',
            'type': 'outcomeDeclaration',
            'label': 'PASS_ALL'
        }, {
            'identifier': 'PASS_ALL_RENDERING',
            'originalIdentifier': 'PASS_ALL_RENDERING',
            'type': 'outcomeDeclaration',
            'label': 'PASS_ALL_RENDERING'
        }, {
            'identifier': 'TP1',
            'originalIdentifier': 'tp1',
            'type': 'testPart',
            'label': 'tp1'
        }, {
            'identifier': 'TS1',
            'originalIdentifier': 'ts1',
            'type': 'assessmentSection',
            'label': 'Section+1'
        }, {
            'identifier': 'ITEM-1',
            'originalIdentifier': 'item-1',
            'type': 'assessmentItemRef',
            'label': 'item-1'
        }, {
            'identifier': 'WEIGHT',
            'originalIdentifier': 'WEIGHT',
            'type': 'weight',
            'label': 'WEIGHT'
        }, {
            'identifier': 'ITEM-2',
            'originalIdentifier': 'item-2',
            'type': 'assessmentItemRef',
            'label': 'item-2'
        }, {
            'identifier': 'WEIGHT',
            'originalIdentifier': 'WEIGHT',
            'type': 'weight',
            'label': 'WEIGHT'
        }, {
            'identifier': 'ITEM-3',
            'originalIdentifier': 'item-3',
            'type': 'assessmentItemRef',
            'label': 'item-3'
        }, {
            'identifier': 'ITEM-4',
            'originalIdentifier': 'item-4',
            'type': 'assessmentItemRef',
            'label': 'item-4'
        }, {
            'identifier': 'ITEM-5',
            'originalIdentifier': 'item-5',
            'type': 'assessmentItemRef',
            'label': 'item-5'
        }, {
            'identifier': 'ITEM-6',
            'originalIdentifier': 'item-6',
            'type': 'assessmentItemRef',
            'label': 'item-6'
        }, {
            'identifier': 'SCORE_TOTAL',
            'originalIdentifier': 'SCORE_TOTAL',
            'type': 'setOutcomeValue',
            'label': 'SCORE_TOTAL'
        }, {
            'identifier': 'SCORE_TOTAL_MAX',
            'originalIdentifier': 'SCORE_TOTAL_MAX',
            'type': 'setOutcomeValue',
            'label': 'SCORE_TOTAL_MAX'
        }, {
            'identifier': 'SCORE_TOTAL_MAX',
            'originalIdentifier': 'SCORE_TOTAL_MAX',
            'type': 'variable',
            'label': 'SCORE_TOTAL_MAX'
        }, {
            'identifier': 'SCORE_RATIO',
            'originalIdentifier': 'SCORE_RATIO',
            'type': 'setOutcomeValue',
            'label': 'SCORE_RATIO'
        }, {
            'identifier': 'SCORE_RATIO',
            'originalIdentifier': 'SCORE_RATIO',
            'type': 'setOutcomeValue',
            'label': 'SCORE_RATIO'
        }, {
            'identifier': 'SCORE_TOTAL',
            'originalIdentifier': 'SCORE_TOTAL',
            'type': 'variable',
            'label': 'SCORE_TOTAL'
        }, {
            'identifier': 'SCORE_TOTAL_MAX',
            'originalIdentifier': 'SCORE_TOTAL_MAX',
            'type': 'variable',
            'label': 'SCORE_TOTAL_MAX'
        }, {
            'identifier': 'PASS_ALL',
            'originalIdentifier': 'PASS_ALL',
            'type': 'setOutcomeValue',
            'label': 'PASS_ALL'
        }, {
            'identifier': 'SCORE_RATIO',
            'originalIdentifier': 'SCORE_RATIO',
            'type': 'variable',
            'label': 'SCORE_RATIO'
        }, {
            'identifier': 'PASS_ALL',
            'originalIdentifier': 'PASS_ALL',
            'type': 'variable',
            'label': 'PASS_ALL'
        }, {
            'identifier': 'PASS_ALL_RENDERING',
            'originalIdentifier': 'PASS_ALL_RENDERING',
            'type': 'setOutcomeValue',
            'label': 'PASS_ALL_RENDERING'
        }, {
            'identifier': 'PASS_ALL_RENDERING',
            'originalIdentifier': 'PASS_ALL_RENDERING',
            'type': 'setOutcomeValue',
            'label': 'PASS_ALL_RENDERING'
        }], 'All identifiers have been extracted');
    });

    QUnit.test('extract only test, test parts and section identifiers', function(assert) {
        assert.expect(2);

        const identifiers = qtiTestHelper.extractIdentifiers(sampleModel, ['assessmentTest', 'testPart', 'assessmentSection']);

        assert.ok(identifiers.length > 0, 'The identifiers are exported as an array');
        assert.deepEqual(identifiers, [{
            'identifier': 'T1',
            'originalIdentifier': 't1',
            'type': 'assessmentTest',
            'label': 'Test+4'
        }, {
            'identifier': 'TP1',
            'originalIdentifier': 'tp1',
            'type': 'testPart',
            'label': 'tp1'
        }, {
            'identifier': 'TS1',
            'originalIdentifier': 'ts1',
            'type': 'assessmentSection',
            'label': 'Section+1'
        }], 'All identifiers have been extracted');
    });

    QUnit.test('exclude outcome identifiers', function(assert) {
        assert.expect(2);

        const identifiers = qtiTestHelper.extractIdentifiers(sampleModel, [], ['outcomeProcessing', 'outcomeDeclaration']);

        assert.ok(identifiers.length > 0, 'The identifiers are exported as an array');
        assert.deepEqual(identifiers, [{
            'identifier': 'T1',
            'originalIdentifier': 't1',
            'type': 'assessmentTest',
            'label': 'Test+4'
        }, {
            'identifier': 'TP1',
            'originalIdentifier': 'tp1',
            'type': 'testPart',
            'label': 'tp1'
        }, {
            'identifier': 'TS1',
            'originalIdentifier': 'ts1',
            'type': 'assessmentSection',
            'label': 'Section+1'
        }, {
            'identifier': 'ITEM-1',
            'originalIdentifier': 'item-1',
            'type': 'assessmentItemRef',
            'label': 'item-1'
        }, {
            'identifier': 'WEIGHT',
            'originalIdentifier': 'WEIGHT',
            'type': 'weight',
            'label': 'WEIGHT'
        }, {
            'identifier': 'ITEM-2',
            'originalIdentifier': 'item-2',
            'type': 'assessmentItemRef',
            'label': 'item-2'
        }, {
            'identifier': 'WEIGHT',
            'originalIdentifier': 'WEIGHT',
            'type': 'weight',
            'label': 'WEIGHT'
        }, {
            'identifier': 'ITEM-3',
            'originalIdentifier': 'item-3',
            'type': 'assessmentItemRef',
            'label': 'item-3'
        }, {
            'identifier': 'ITEM-4',
            'originalIdentifier': 'item-4',
            'type': 'assessmentItemRef',
            'label': 'item-4'
        }, {
            'identifier': 'ITEM-5',
            'originalIdentifier': 'item-5',
            'type': 'assessmentItemRef',
            'label': 'item-5'
        }, {
            'identifier': 'ITEM-6',
            'originalIdentifier': 'item-6',
            'type': 'assessmentItemRef',
            'label': 'item-6'
        }], 'All identifiers have been extracted');
    });

    QUnit.module('validators');

    QUnit.test('validateModel', function(assert) {
        const model =  {
            identifier: 'foo',
            'qti-type': 'assessmentTest',
            testParts: [{
                identifier: 'bar',
                'qti-type': 'testPart'
            }, {
                identifier: 'noz',
                'qti-type': 'testPart',
                sections: [{
                    identifier: 'abs',
                    'qti-type': 'assessmentSection'
                }, {
                    identifier: 'foo',
                    'qti-type': 'assessmentSection'
                }]
            }]
        };

        assert.expect(2);
        try {
            qtiTestHelper.validateModel(model);
            assert.ok(false, 'Should be thrown exeption!');
        } catch(err) {
            assert.ok(true, 'Model is not valid');
        }
        model.identifier = 'new';
        try {
            qtiTestHelper.validateModel(model);
            assert.ok(true, 'Model is valid');
        } catch(err) {
            assert.ok(false, 'Should not be thrown exeption!');
        }
    });

});
