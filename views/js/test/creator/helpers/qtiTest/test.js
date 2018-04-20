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
 * Copyright (c) 2018 (original work) Open Assessment Technologies SA ;
 */
/**
 * @author Bertrand Chevrier <bertrand@taotesting.com>
 */
define([
    'taoQtiTest/controller/creator/helpers/qtiTest',
    'json!taoQtiTest/test/creator/helpers/qtiTest/sample.json'
], function (qtiTestHelper, sampleModel) {
    'use strict';


    QUnit.module('API');

    QUnit.test('module', function (assert) {
        QUnit.expect(1);
        assert.equal(typeof qtiTestHelper, 'object', "The module exposes an object");
    });

    QUnit.cases([
        { title: 'extractIdentifiers' },
        { title: 'getIdentifiers' },
        { title: 'getIdentifiersOf' },
        { title: 'getAvailableIdentifier' },
        { title: 'idAvailableValidator' }
    ]).test('method ', function (data, assert) {
        QUnit.expect(1);
        assert.equal(typeof qtiTestHelper[data.title], 'function', 'The helper exposes a "' + data.title + '" method');
    });

    QUnit.module('identifiers');


    QUnit.test('extract all identifiers', function(assert){
        var identifiers;

        QUnit.expect(2);

        identifiers = qtiTestHelper.extractIdentifiers(sampleModel);

        assert.ok(identifiers.length > 0, 'The identifiers are exported as an array');
        assert.deepEqual(identifiers,[{
            "identifier": "T1",
            "originalIdentifier": "t1",
            "type": "assessmentTest",
            "label": "Test+4"
        }, {
            "identifier": "SCORE_TOTAL",
            "originalIdentifier": "SCORE_TOTAL",
            "type": "outcomeDeclaration",
            "label": "SCORE_TOTAL"
        }, {
            "identifier": "SCORE_TOTAL_MAX",
            "originalIdentifier": "SCORE_TOTAL_MAX",
            "type": "outcomeDeclaration",
            "label": "SCORE_TOTAL_MAX"
        }, {
            "identifier": "SCORE_RATIO",
            "originalIdentifier": "SCORE_RATIO",
            "type": "outcomeDeclaration",
            "label": "SCORE_RATIO"
        }, {
            "identifier": "PASS_ALL",
            "originalIdentifier": "PASS_ALL",
            "type": "outcomeDeclaration",
            "label": "PASS_ALL"
        }, {
            "identifier": "PASS_ALL_RENDERING",
            "originalIdentifier": "PASS_ALL_RENDERING",
            "type": "outcomeDeclaration",
            "label": "PASS_ALL_RENDERING"
        }, {
            "identifier": "TP1",
            "originalIdentifier": "tp1",
            "type": "testPart",
            "label": "tp1"
        }, {
            "identifier": "TS1",
            "originalIdentifier": "ts1",
            "type": "assessmentSection",
            "label": "Section+1"
        }, {
            "identifier": "ITEM-1",
            "originalIdentifier": "item-1",
            "type": "assessmentItemRef",
            "label": "item-1"
        }, {
            "identifier": "WEIGHT",
            "originalIdentifier": "WEIGHT",
            "type": "weight",
            "label": "WEIGHT"
        }, {
            "identifier": "ITEM-2",
            "originalIdentifier": "item-2",
            "type": "assessmentItemRef",
            "label": "item-2"
        }, {
            "identifier": "WEIGHT",
            "originalIdentifier": "WEIGHT",
            "type": "weight",
            "label": "WEIGHT"
        }, {
            "identifier": "ITEM-3",
            "originalIdentifier": "item-3",
            "type": "assessmentItemRef",
            "label": "item-3"
        }, {
            "identifier": "ITEM-4",
            "originalIdentifier": "item-4",
            "type": "assessmentItemRef",
            "label": "item-4"
        }, {
            "identifier": "ITEM-5",
            "originalIdentifier": "item-5",
            "type": "assessmentItemRef",
            "label": "item-5"
        }, {
            "identifier": "ITEM-6",
            "originalIdentifier": "item-6",
            "type": "assessmentItemRef",
            "label": "item-6"
        }, {
            "identifier": "SCORE_TOTAL",
            "originalIdentifier": "SCORE_TOTAL",
            "type": "setOutcomeValue",
            "label": "SCORE_TOTAL"
        }, {
            "identifier": "SCORE_TOTAL_MAX",
            "originalIdentifier": "SCORE_TOTAL_MAX",
            "type": "setOutcomeValue",
            "label": "SCORE_TOTAL_MAX"
        }, {
            "identifier": "SCORE_TOTAL_MAX",
            "originalIdentifier": "SCORE_TOTAL_MAX",
            "type": "variable",
            "label": "SCORE_TOTAL_MAX"
        }, {
            "identifier": "SCORE_RATIO",
            "originalIdentifier": "SCORE_RATIO",
            "type": "setOutcomeValue",
            "label": "SCORE_RATIO"
        }, {
            "identifier": "SCORE_RATIO",
            "originalIdentifier": "SCORE_RATIO",
            "type": "setOutcomeValue",
            "label": "SCORE_RATIO"
        }, {
            "identifier": "SCORE_TOTAL",
            "originalIdentifier": "SCORE_TOTAL",
            "type": "variable",
            "label": "SCORE_TOTAL"
        }, {
            "identifier": "SCORE_TOTAL_MAX",
            "originalIdentifier": "SCORE_TOTAL_MAX",
            "type": "variable",
            "label": "SCORE_TOTAL_MAX"
        }, {
            "identifier": "PASS_ALL",
            "originalIdentifier": "PASS_ALL",
            "type": "setOutcomeValue",
            "label": "PASS_ALL"
        }, {
            "identifier": "SCORE_RATIO",
            "originalIdentifier": "SCORE_RATIO",
            "type": "variable",
            "label": "SCORE_RATIO"
        }, {
            "identifier": "PASS_ALL",
            "originalIdentifier": "PASS_ALL",
            "type": "variable",
            "label": "PASS_ALL"
        }, {
            "identifier": "PASS_ALL_RENDERING",
            "originalIdentifier": "PASS_ALL_RENDERING",
            "type": "setOutcomeValue",
            "label": "PASS_ALL_RENDERING"
        }, {
            "identifier": "PASS_ALL_RENDERING",
            "originalIdentifier": "PASS_ALL_RENDERING",
            "type": "setOutcomeValue",
            "label": "PASS_ALL_RENDERING"
        }], 'All identifiers have been extracted');
    });

    QUnit.test('extract only test, test parts and section identifiers', function(assert){
        var identifiers;

        QUnit.expect(2);

        identifiers = qtiTestHelper.extractIdentifiers(sampleModel, ['assessmentTest', 'testPart', 'assessmentSection']);

        assert.ok(identifiers.length > 0, 'The identifiers are exported as an array');
        assert.deepEqual(identifiers,[{
            "identifier": "T1",
            "originalIdentifier": "t1",
            "type": "assessmentTest",
            "label": "Test+4"
        }, {
            "identifier": "TP1",
            "originalIdentifier": "tp1",
            "type": "testPart",
            "label": "tp1"
        }, {
            "identifier": "TS1",
            "originalIdentifier": "ts1",
            "type": "assessmentSection",
            "label": "Section+1"
        }], 'All identifiers have been extracted');
    });


    QUnit.test('exclude outcome identifiers', function(assert){
        var identifiers;

        QUnit.expect(2);

        identifiers = qtiTestHelper.extractIdentifiers(sampleModel, [], ['outcomeProcessing', 'outcomeDeclaration']);

        assert.ok(identifiers.length > 0, 'The identifiers are exported as an array');
        assert.deepEqual(identifiers,[{
            "identifier": "T1",
            "originalIdentifier": "t1",
            "type": "assessmentTest",
            "label": "Test+4"
        }, {
            "identifier": "TP1",
            "originalIdentifier": "tp1",
            "type": "testPart",
            "label": "tp1"
        }, {
            "identifier": "TS1",
            "originalIdentifier": "ts1",
            "type": "assessmentSection",
            "label": "Section+1"
        }, {
            "identifier": "ITEM-1",
            "originalIdentifier": "item-1",
            "type": "assessmentItemRef",
            "label": "item-1"
        }, {
            "identifier": "WEIGHT",
            "originalIdentifier": "WEIGHT",
            "type": "weight",
            "label": "WEIGHT"
        }, {
            "identifier": "ITEM-2",
            "originalIdentifier": "item-2",
            "type": "assessmentItemRef",
            "label": "item-2"
        }, {
            "identifier": "WEIGHT",
            "originalIdentifier": "WEIGHT",
            "type": "weight",
            "label": "WEIGHT"
        }, {
            "identifier": "ITEM-3",
            "originalIdentifier": "item-3",
            "type": "assessmentItemRef",
            "label": "item-3"
        }, {
            "identifier": "ITEM-4",
            "originalIdentifier": "item-4",
            "type": "assessmentItemRef",
            "label": "item-4"
        }, {
            "identifier": "ITEM-5",
            "originalIdentifier": "item-5",
            "type": "assessmentItemRef",
            "label": "item-5"
        }, {
            "identifier": "ITEM-6",
            "originalIdentifier": "item-6",
            "type": "assessmentItemRef",
            "label": "item-6"
        }], 'All identifiers have been extracted');
    });

    QUnit.test('get all identifiers', function(assert){
        var identifiers;

        QUnit.expect(2);

        identifiers = qtiTestHelper.getIdentifiers(sampleModel);

        assert.ok(identifiers.length > 0, 'The identifiers are exported as an array');
        assert.deepEqual(identifiers,[
            "T1",
            "SCORE_TOTAL",
            "SCORE_TOTAL_MAX",
            "SCORE_RATIO",
            "PASS_ALL",
            "PASS_ALL_RENDERING",
            "TP1",
            "TS1",
            "ITEM-1",
            "WEIGHT",
            "ITEM-2",
            "ITEM-3",
            "ITEM-4",
            "ITEM-5",
            "ITEM-6"
        ], 'All unique identifiers have been extracted');
    });

    QUnit.test('get test, parts, section and items identifiers', function(assert){
        var identifiers;

        QUnit.expect(2);

        identifiers = qtiTestHelper.getIdentifiers(sampleModel, ['assessmentTest', 'testPart', 'assessmentSection', 'assessmentItemRef'] );

        assert.ok(identifiers.length > 0, 'The identifiers are exported as an array');
        assert.deepEqual(identifiers,[
            "T1",
            "TP1",
            "TS1",
            "ITEM-1",
            "ITEM-2",
            "ITEM-3",
            "ITEM-4",
            "ITEM-5",
            "ITEM-6"
        ], 'All unique identifiers have been extracted');
    });

    QUnit.test('get items identifiers', function(assert){
        var identifiers;

        QUnit.expect(2);

        identifiers = qtiTestHelper.getIdentifiersOf(sampleModel, 'assessmentItemRef');

        assert.ok(identifiers.length > 0, 'The identifiers are exported as an array');
        assert.deepEqual(identifiers,[
            "ITEM-1",
            "ITEM-2",
            "ITEM-3",
            "ITEM-4",
            "ITEM-5",
            "ITEM-6"
        ], 'All unique identifiers have been extracted');

    });

    QUnit.test('get items identifiers', function(assert){
        var identifier;

        QUnit.expect(4);

        identifier = qtiTestHelper.getAvailableIdentifier(sampleModel, 'assessmentItemRef', 'item');
        assert.equal(identifier, 'item-7', 'The ids item-1 to item-6 are already in use');

        identifier = qtiTestHelper.getAvailableIdentifier(sampleModel, 'assessmentSection', 'section');
        assert.equal(identifier, 'section-1', 'The 1st id is available');

        identifier = qtiTestHelper.getAvailableIdentifier(sampleModel, 'testPart');
        assert.equal(identifier, 'testPart-1', 'By default the suggestion is the qti type');

        identifier = qtiTestHelper.getAvailableIdentifier(sampleModel, 'weight', 'WEIGHT');
        assert.equal(identifier, 'WEIGHT-1');

    });


    QUnit.module('validators');

    QUnit.test('idAvailableValidator is a validator', function (assert) {
        var identifierValidator =  qtiTestHelper.idAvailableValidator();

        QUnit.expect(3);

        assert.equal(typeof identifierValidator, 'object', 'The method creates an object');
        assert.equal(typeof identifierValidator.validate, 'function', 'The generated validator has the validate method');
        assert.equal(identifierValidator.name, 'testIdAvailable', 'The validator name is correct');
    });

    QUnit.asyncTest('idAvailableValidator validates by model', function (assert) {
        var modelOverseerMock = {
            getModel : function getModel(){
                return {
                    identifier : 'foo',
                    'qti-type' : 'assessmentTest',
                    testParts : [{
                        identifier: 'bar',
                        'qti-type' : 'testPart'
                    }, {
                        identifier: 'noz',
                        'qti-type' : 'testPart',
                        sections : [{
                            identifier: 'bee',
                            'qti-type' : 'assessmentSection'
                        }, {
                            identifier: 'foo',
                            'qti-type' : 'assessmentSection'
                        }]
                    }]
                };
            }
        };

        QUnit.expect(1);

        qtiTestHelper.idAvailableValidator(modelOverseerMock).validate('foo', function(result){
            assert.ok(!result, 'The validator invalidate the value');
            QUnit.start();
        });
    });




});
