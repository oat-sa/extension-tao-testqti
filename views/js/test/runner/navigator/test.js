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
    'json!taoQtiTest/test/runner/navigator/testMap.json'
], function(testNavigator, testData, testMap) {
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
            title: 'nextItem'
        }, {
            title: 'previousItem'
        }, {
            title: 'nextSection'
        }, {
            title: 'jump'
        }])
        .test('Method ', function(data, assert) {
            QUnit.expect(1);

            assert.equal(typeof testNavigator(testData, {}, testMap)[data.title], 'function', 'The instance exposes a "' + data.title + '" method');
        });


    QUnit.module('navigator.nextItem');


    QUnit.cases([{
        title: 'move next item inside a section',
        testContext: {
            state: 1,
            navigationMode: 1,
            submissionMode: 0,
            remainingAttempts: -1,
            isAdaptive: false,
            isLinear: false,
            attempt: 1,
            attemptDuration: 12.237921,
            isTimeout: false,
            itemIdentifier: "item-1",
            itemDefinition: "https:\/\/act.krampstud.io\/tao.rdf#i149881168366501144|https:\/\/act.krampstud.io\/tao.rdf#i149881178181251158+|https:\/\/act.krampstud.io\/tao.rdf#i149881178182781159-",
            itemUri: "https:\/\/act.krampstud.io\/tao.rdf#i149881168366501144|https:\/\/act.krampstud.io\/tao.rdf#i149881178181251158+|https:\/\/act.krampstud.io\/tao.rdf#i149881178182781159-",
            itemSessionState: 1,
            needMapUpdate: false,
            isLast: false,
            itemPosition: 0,
            itemFlagged: false,
            itemAnswered: false,
            timeConstraints: [],
            extraTime: {
                total: 0,
                consumed: 0,
                remaining: 0
            },
            testPartId: "testPart-1",
            sectionId: "assessmentSection-1",
            sectionTitle: "Basic section",
            sectionPause: false,
            numberItems: 17,
            numberCompleted: 0,
            numberPresented: 1,
            considerProgress: true,
            isDeepestSectionVisible: true,
            canMoveBackward: false,
            numberRubrics: 0,
            preventEmptyResponses: false,
            hasFeedbacks: false,
            options: {
                allowComment: false,
                allowSkipping: true,
                exitButton: false,
                logoutButton: false
            }
        },
        expecContext: false,
    }])
    .test('is leaving a section if ', function(data, assert) {
        var result;

        QUnit.expect(1);

        result = testNavigator(testData, data.testContext, testMap).nextItem();

        assert.deepEqual(result, data.expectedContext, 'The helper gives the correct result');
    });


});
