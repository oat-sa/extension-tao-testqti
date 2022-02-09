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

    'taoQtiTest/controller/creator/helpers/qtiTest',
    'json!taoQtiTest/test/creator/helpers/qtiTest/sample.json'
], function(qtiTestHelper, sampleModel) {
    'use strict';

    QUnit.module('API');

    QUnit.test('module', function(assert) {
        assert.expect(1);
        assert.equal(typeof qtiTestHelper, 'object', 'The module exposes an object');
    });

    QUnit.cases.init([
        {title: 'getIdentifiers'},
        {title: 'getIdentifiersOf'},
        {title: 'getAvailableIdentifier'},
    ]).test('method ', function(data, assert) {
        assert.expect(1);
        assert.equal(typeof qtiTestHelper[data.title], 'function', 'The helper exposes a "' + data.title + '" method');
    });

    QUnit.module('identifiers');

    QUnit.test('get all identifiers', function(assert) {
        assert.expect(2);

        const identifiers = qtiTestHelper.getIdentifiers(sampleModel);

        assert.ok(identifiers.length > 0, 'The identifiers are exported as an array');
        assert.deepEqual(identifiers, [
            'T1',
            'SCORE_TOTAL',
            'SCORE_TOTAL_MAX',
            'SCORE_RATIO',
            'PASS_ALL',
            'PASS_ALL_RENDERING',
            'TP1',
            'TS1',
            'ITEM-1',
            'WEIGHT',
            'ITEM-2',
            'ITEM-3',
            'ITEM-4',
            'ITEM-5',
            'ITEM-6'
        ], 'All unique identifiers have been extracted');
    });

    QUnit.test('get test, parts, section and items identifiers', function(assert) {
        assert.expect(2);

        const identifiers = qtiTestHelper.getIdentifiers(sampleModel, ['assessmentTest', 'testPart', 'assessmentSection', 'assessmentItemRef']);

        assert.ok(identifiers.length > 0, 'The identifiers are exported as an array');
        assert.deepEqual(identifiers, [
            'T1',
            'TP1',
            'TS1',
            'ITEM-1',
            'ITEM-2',
            'ITEM-3',
            'ITEM-4',
            'ITEM-5',
            'ITEM-6'
        ], 'All unique identifiers have been extracted');
    });

    QUnit.test('get items identifiers', function(assert) {
        assert.expect(2);

        const identifiers = qtiTestHelper.getIdentifiersOf(sampleModel, 'assessmentItemRef');

        assert.ok(identifiers.length > 0, 'The identifiers are exported as an array');
        assert.deepEqual(identifiers, [
            'ITEM-1',
            'ITEM-2',
            'ITEM-3',
            'ITEM-4',
            'ITEM-5',
            'ITEM-6'
        ], 'All unique identifiers have been extracted');

    });

    QUnit.test('get items identifiers', function(assert) {
        assert.expect(4);

        let identifier = qtiTestHelper.getAvailableIdentifier(sampleModel, 'assessmentItemRef', 'item');
        assert.equal(identifier, 'item-7', 'The ids item-1 to item-6 are already in use');

        identifier = qtiTestHelper.getAvailableIdentifier(sampleModel, 'assessmentSection', 'section');
        assert.equal(identifier, 'section-1', 'The 1st id is available');

        identifier = qtiTestHelper.getAvailableIdentifier(sampleModel, 'testPart');
        assert.equal(identifier, 'testPart-1', 'By default the suggestion is the qti type');

        identifier = qtiTestHelper.getAvailableIdentifier(sampleModel, 'weight', 'WEIGHT');
        assert.equal(identifier, 'WEIGHT-1');

    });

});
