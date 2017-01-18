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
    'taoQtiTest/controller/creator/helpers/outcomeValidator'
], function (_, outcomeValidatorHelper) {
    'use strict';

    var outcomeValidatorApi = [
        {title: 'validateIdentifier'},
        {title: 'validateOutcomes'},
        {title: 'validateOutcome'}
    ];
    var identifiers = [
        {title: 'An undefined value is not a valid identifier', result: false},
        {title: 'A number is not a valid identifier', identifier: 1, result: false},
        {title: 'A numeric value is not a valid identifier', identifier: '123', result: false},
        {title: 'A string with spaces is not a valid identifier', identifier: 'foo bar', result: false},
        {title: 'Should be a valid identifier', identifier: 'fooBar', result: true}
    ];
    var outcomesLists = [
        {title: 'An undefined value is not a valid outcomes list', result: false},
        {title: 'A number is not a valid outcomes list', outcomes: 1, result: false},
        {title: 'A string is not a valid outcomes list', outcomes: "1", result: false},
        {title: 'A function is not a valid outcomes list', outcomes: function(){}, result: false},
        {title: 'A simple object is not a valid outcomes list', outcomes: {}, result: false},
        {title: 'An object with an invalid QTI type is not a valid outcomes list', outcomes: {'qti-type': 1}, result: false},
        {title: 'An object with a valid QTI type is not a valid outcomes list', outcomes: {'qti-type': 'test'}, result: false},
        {title: 'An empty array is a valid outcomes list', outcomes: [], result: true},
        {title: 'An array of numbers is not a valid outcomes list', outcomes: [1], result: false},
        {title: 'An array of strings is not a valid outcomes list', outcomes: ["1"], result: false},
        {title: 'An array of objects is not a valid outcomes list', outcomes: [{}], result: false},
        {title: 'An array of functions is not a valid outcomes list', outcomes: [function(){}], result: false},
        {title: 'An array of outcomes is a valid outcomes list', outcomes: [{'qti-type': 'test'}], result: true},
        {title: 'An array of outcomes that does not only contain outcomes is not a valid outcomes list', outcomes: [{'qti-type': 'test'}, 1], result: false},
        {title: 'An array of outcomes that contains invalid identifier is not a valid outcomes list', outcomes: [{'qti-type': 'test', identifier: "foo"}, {'qti-type': 'test', identifier: "foo bar"}], checkIdentifier: true, result: false},
        {title: 'An array of outcomes that contains valid identifier is a valid outcomes list', outcomes: [{'qti-type': 'test', identifier: "foo"}, {'qti-type': 'test', identifier: "fooBar"}], checkIdentifier: true, result: true},
        {title: 'An array of outcomes that contains allowed types is a valid outcomes list', outcomes: [{'qti-type': 'test', identifier: "foo"}, {'qti-type': 'test', identifier: "fooBar"}], allowedTypes: "test", result: true},
        {title: 'An array of outcomes that does not contain allowed types is not a valid outcomes list', outcomes: [{'qti-type': 'test', identifier: "foo"}, {'qti-type': 'foo', identifier: "fooBar"}], allowedTypes: "test", result: false}
    ];
    var outcomes = [
        {title: 'An undefined value is not a valid outcome', result: false},
        {title: 'A number is not a valid outcome', outcome: 1, checkIdentifier: false, result: false},
        {title: 'A string is not a valid outcome', outcome: "1", checkIdentifier: false, result: false},
        {title: 'A function is not a valid outcome', outcome: function(){}, checkIdentifier: false, result: false},
        {title: 'A simple object is not a valid outcome', outcome: {}, checkIdentifier: false, result: false},
        {title: 'An object with an invalid QTI type is not a valid outcome', outcome: {'qti-type': 1}, checkIdentifier: false, result: false},
        {title: 'An object with a valid QTI type is a valid outcome', outcome: {'qti-type': 'test'}, checkIdentifier: false, result: true},
        {title: 'An object with a valid QTI type is not a valid outcome if the identifier is needed', outcome: {'qti-type': 'test'}, checkIdentifier: true, result: false},
        {title: 'An object with a valid QTI type is not a valid outcome if the identifier is not valid', outcome: {'qti-type': 'test', identifier: 1}, checkIdentifier: true, result: false},
        {title: 'An object with a valid QTI type is not a valid outcome if the identifier is not valid', outcome: {'qti-type': 'test', identifier: "123"}, checkIdentifier: true, result: false},
        {title: 'An object with a valid QTI type is not a valid outcome if the identifier is not valid', outcome: {'qti-type': 'test', identifier: "foo bar"}, checkIdentifier: true, result: false},
        {title: 'An object with a valid QTI type is a valid outcome if the identifier is valid', outcome: {'qti-type': 'test', identifier: "fooBar"}, checkIdentifier: true, result: true},
        {title: 'An object with a valid QTI type is a valid outcome if the type is allowed', outcome: {'qti-type': 'test', identifier: "fooBar"}, allowedTypes: 'test', result: true},
        {title: 'An object with a valid QTI type is a valid outcome if the type is allowed', outcome: {'qti-type': 'test', identifier: "fooBar"}, allowedTypes: ['foo', 'test', 'bar'], result: true},
        {title: 'An object with a valid QTI type is not a valid outcome if the type is not allowed', outcome: {'qti-type': 'test', identifier: "fooBar"}, allowedTypes: ['foo', 'bar'], result: false},
        {title: 'An object with a valid QTI type is not a valid outcome if the type is not allowed', outcome: {'qti-type': 'test', identifier: "fooBar"}, allowedTypes: [], result: false},
        {title: 'An object with a valid QTI type is not a valid outcome if the type is not allowed', outcome: {'qti-type': 'test', identifier: "fooBar"}, allowedTypes: 'foo', result: false}
    ];


    QUnit.module('helpers/outcomeValidator');


    QUnit.test('module', function (assert) {
        QUnit.expect(1);
        assert.equal(typeof outcomeValidatorHelper, 'object', "The outcomeValidator helper module exposes an object");
    });


    QUnit
        .cases(outcomeValidatorApi)
        .test('helpers/outcomeValidator API ', function (data, assert) {
            QUnit.expect(1);
            assert.equal(typeof outcomeValidatorHelper[data.title], 'function', 'The outcomeValidator helper exposes a "' + data.title + '" function');
        });


    QUnit
        .cases(identifiers)
        .test('helpers/outcomeValidator.validateIdentifier() ', function (data, assert) {
            QUnit.expect(1);
            assert.equal(outcomeValidatorHelper.validateIdentifier(data.identifier), data.result, data.title);
        });


    QUnit
        .cases(outcomesLists)
        .test('helpers/outcomeValidator.validateOutcomes() ', function (data, assert) {
            QUnit.expect(1);
            assert.equal(outcomeValidatorHelper.validateOutcomes(data.outcomes, data.checkIdentifier, data.allowedTypes), data.result, data.title);
        });


    QUnit
        .cases(outcomes)
        .test('helpers/outcomeValidator.validateOutcome() ', function (data, assert) {
            QUnit.expect(1);
            assert.equal(outcomeValidatorHelper.validateOutcome(data.outcome, data.checkIdentifier, data.allowedTypes), data.result, data.title);
        });
});
