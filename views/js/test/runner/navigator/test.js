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
 * @author Bertrand Chevrier <bertrand@taotesting.com>
 */
define([
    'taoQtiTest/runner/navigator/navigator',
    'json!taoQtiTest/test/runner/navigator/testData.json',
    'json!taoQtiTest/test/runner/navigator/testMap.json',
    'json!taoQtiTest/test/runner/navigator/testContexts.json'
], function(testNavigator, testData, testMap, testContexts) {
    'use strict';


    QUnit.module('API');

    QUnit.test('module', function(assert) {
        QUnit.expect(1);

        assert.equal(typeof testNavigator, 'function', "The navigator is a function");
    });

    QUnit.test('factory', function(assert) {
        QUnit.expect(5);

        assert.throws(function() {
            testNavigator();
        }, TypeError, 'factory called without parameter');

        assert.throws(function() {
            testNavigator(testData);
        }, TypeError, 'factory called without all parameters');

        assert.throws(function() {
            testNavigator(testData, {});
        }, TypeError, 'factory called without all parameters');


        assert.equal(typeof testNavigator(testData, {}, testMap), 'object', "The factory creates an object");
        assert.notEqual(testNavigator(testData, {}, testMap), testNavigator(testData, {}, testMap), "The factory creates new objects");
    });

    QUnit.cases([{
        title: 'navigate'
    }, {
        title: 'nextItem'
    }, {
        title: 'previousItem'
    }, {
        title: 'nextSection'
    }, {
        title: 'jumpItem'
    }])
    .test('Method ', function(data, assert) {
        QUnit.expect(1);

        assert.equal(typeof testNavigator(testData, {}, testMap)[data.title], 'function', 'The instance exposes a "' + data.title + '" method');
    });


    QUnit.module('navigator.nextItem');

    QUnit.test('is moving to the next item inside a section', function(assert) {
        var updatedContext;

        QUnit.expect(6);

        updatedContext = testNavigator(testData, testContexts.context1, testMap).nextItem();

        assert.equal(typeof updatedContext, 'object', 'The nextItem method creates an object');
        assert.equal(updatedContext.itemIdentifier, 'item-2', 'The updated context contains the correct item identifier');
        assert.equal(updatedContext.itemDefinition, 'https:\/\/act.krampstud.io\/tao.rdf#i149881168574691147|https:\/\/act.krampstud.io\/tao.rdf#i149881178170141160+|https:\/\/act.krampstud.io\/tao.rdf#i14988117812381161-', 'The updated context contains the correct item definition');
        assert.equal(updatedContext.itemPosition, 1, 'The updated context contains the correct item position');
        assert.equal(updatedContext.sectionId, 'assessmentSection-1', 'The updated context contains the correct section id');
        assert.equal(updatedContext.testPartId, 'testPart-1', 'The updated context contains the correct test part id');
    });

    QUnit.test('is moving to the next item over a section', function(assert) {
        var updatedContext;

        QUnit.expect(6);

        updatedContext = testNavigator(testData, testContexts.context2, testMap).nextItem();

        assert.equal(typeof updatedContext, 'object', 'The nextItem method creates an object');
        assert.equal(updatedContext.itemIdentifier, 'item-4', 'The updated context contains the correct item identifier');
        assert.equal(updatedContext.itemDefinition, 'https:\/\/act.krampstud.io\/tao.rdf#i149881168366501144|https:\/\/act.krampstud.io\/tao.rdf#i149881178196711164+|https:\/\/act.krampstud.io\/tao.rdf#i149881178182901165-', 'The updated context contains the correct item definition');
        assert.equal(updatedContext.itemPosition, 3, 'The updated context contains the correct item position');
        assert.equal(updatedContext.sectionId, 'assessmentSection-2', 'The updated context contains the correct section id');
        assert.equal(updatedContext.testPartId, 'testPart-1', 'The updated context contains the correct test part id');
    });

    QUnit.test('is moving to the next item over a testPart', function(assert) {
        var updatedContext;

        QUnit.expect(7);

        updatedContext = testNavigator(testData, testContexts.context3, testMap).nextItem();

        assert.equal(typeof updatedContext, 'object', 'The nextItem method creates an object');
        assert.equal(updatedContext.itemIdentifier, 'item-15', 'The updated context contains the correct item identifier');
        assert.equal(updatedContext.itemDefinition, 'https:\/\/act.krampstud.io\/tao.rdf#i149881143336021129|https:\/\/act.krampstud.io\/tao.rdf#i149881178297961186+|https:\/\/act.krampstud.io\/tao.rdf#i149881178278141187-', 'The updated context contains the correct item definition');
        assert.equal(updatedContext.itemPosition, 14, 'The updated context contains the correct item position');
        assert.equal(updatedContext.sectionId, 'assessmentSection-6', 'The updated context contains the correct section id');
        assert.equal(updatedContext.testPartId, 'testPart-2', 'The updated context contains the correct test part id');
        assert.equal(updatedContext.isLinear, true, 'The updated context contains the correct isLinear option');
    });

    QUnit.module('navigator.previousItem');

    QUnit.test('is moving to the previous item inside a section', function(assert) {
        var updatedContext;

        QUnit.expect(6);

        updatedContext = testNavigator(testData, testContexts.context2, testMap).previousItem();

        assert.equal(typeof updatedContext, 'object', 'The nextItem method creates an object');
        assert.equal(updatedContext.itemIdentifier, 'item-2', 'The updated context contains the correct item identifier');
        assert.equal(updatedContext.itemDefinition, 'https:\/\/act.krampstud.io\/tao.rdf#i149881168574691147|https:\/\/act.krampstud.io\/tao.rdf#i149881178170141160+|https:\/\/act.krampstud.io\/tao.rdf#i14988117812381161-', 'The updated context contains the correct item definition');
        assert.equal(updatedContext.itemPosition, 1, 'The updated context contains the correct item position');
        assert.equal(updatedContext.sectionId, 'assessmentSection-1', 'The updated context contains the correct section id');
        assert.equal(updatedContext.testPartId, 'testPart-1', 'The updated context contains the correct test part id');
    });

});
