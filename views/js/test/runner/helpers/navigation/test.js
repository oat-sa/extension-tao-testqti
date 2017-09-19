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
    'lodash',
    'taoQtiTest/runner/helpers/navigation',
    'json!taoQtiTest/test/runner/helpers/navigation/testMap.json'
], function (_, navigationHelper, testMap) {
    'use strict';


    QUnit.module('API');

    QUnit.test('module', function (assert) {
        QUnit.expect(1);

        assert.equal(typeof navigationHelper, 'object', "The  helper module exposes an object");
    });

    QUnit.cases([
        { title: 'isLeavingSection' },
        { title: 'isLeavingTestPart' },
        { title: 'isLast' },
        { title: 'isFirst' },
        { title: 'isLastOf' },
        { title: 'isFirstOf' },
        { title: 'getSiblingItems' },
        { title: 'getNextItem' },
        { title: 'getPreviousItem' },
        { title: 'isMovingToNextItem' },
        { title: 'isMovingToPreviousItem' },
        { title: 'isJumpingToItem' }
    ])
    .test('Method ', function (data, assert) {
        QUnit.expect(1);

        assert.equal(typeof navigationHelper[data.title], 'function', 'The helper exposes a "' + data.title + '" method');
    });


    QUnit.module('navigation.isLeavingSection');

    QUnit.test('Bad paramerters', function(assert){
        var result;

        QUnit.expect(5);

        assert.throws(function(){
            navigationHelper.isLeavingSection();
        }, TypeError, 'The test context is required');

        assert.throws(function(){
            navigationHelper.isLeavingSection(null, testMap, 'next', 'item');
        }, TypeError, 'The test context is required');

        assert.throws(function(){
            navigationHelper.isLeavingSection({}, testMap, 'next', 'item');
        }, TypeError, 'The test context needs to contains a sectionId and an itemIdentifier');

        assert.throws(function(){
            navigationHelper.isLeavingSection({
                sectionId : 'assessmentSection-1',
                itemIdentifier : 'item-2'
            });
        }, TypeError, 'The test map is required');


        result = navigationHelper.isLeavingSection({
            sectionId : 'assessmentSection-1',
            itemIdentifier : 'item-2'
        }, testMap, 'next', 'item');

        assert.equal(typeof result, 'boolean', 'The helper does not throw with correct parameters');
    });

    QUnit.cases([{
        title: 'move next item inside a section',
        expectResult : false,
        context : {
            sectionId : 'assessmentSection-1',
            itemIdentifier : 'item-2'
        },
        direction : 'next',
        scope : 'item'
    },{
        title: 'move next item at the end of a section',
        expectResult : true,
        context : {
            sectionId : 'assessmentSection-1',
            itemIdentifier : 'item-3'
        },
        direction : 'next',
        scope : 'item',
    },{
        title: 'move next item at the end of a testPart',
        expectResult : true,
        context : {
            sectionId : 'assessmentSection-5',
            itemIdentifier : 'item-14'
        },
        direction : 'next',
        scope : 'item',
    },{
        title: 'move next section',
        expectResult : true,
        context : {
            sectionId : 'assessmentSection-1',
            itemIdentifier : 'item-2'
        },
        direction : 'next',
        scope : 'section',
    },{
        title: 'move previous item inside a section',
        expectResult : false,
        context : {
            sectionId : 'assessmentSection-1',
            itemIdentifier : 'item-2'
        },
        direction : 'previous',
        scope : 'item'
    },{
        title: 'move previous item at the beginning of a section',
        expectResult : true,
        context : {
            sectionId : 'assessmentSection-2',
            itemIdentifier : 'item-4'
        },
        direction : 'previous',
        scope : 'item',
    },{
        title: 'jump items inside a section',
        expectResult : false,
        context : {
            sectionId : 'assessmentSection-2',
            itemIdentifier : 'item-4'
        },
        direction : 'jump',
        scope : 'item',
        position: 4
    },{
        title: 'jump items outside a section',
        expectResult : true,
        context : {
            sectionId : 'assessmentSection-2',
            itemIdentifier : 'item-4'
        },
        direction : 'jump',
        scope : 'item',
        position: 7
    }])
    .test('is leaving a section if ', function (data, assert) {
        var result;

        QUnit.expect(1);

        result = navigationHelper.isLeavingSection(data.context, testMap, data.direction, data.scope, data.position);

        assert.equal(result, data.expectResult, 'The helper gives the correct result');
    });


    QUnit.module('navigation.isLeavingTestPart');

    QUnit.test('Bad paramerters', function(assert){
        var result;

        QUnit.expect(5);

        assert.throws(function(){
            navigationHelper.isLeavingTestPart();
        }, TypeError, 'The test context is required');

        assert.throws(function(){
            navigationHelper.isLeavingTestPart(null, testMap, 'next', 'item');
        }, TypeError, 'The test context is required');

        assert.throws(function(){
            navigationHelper.isLeavingTestPart({}, testMap, 'next', 'item');
        }, TypeError, 'The test context needs to contains a sectionId and an itemIdentifier');

        assert.throws(function(){
            navigationHelper.isLeavingTestPart({
                sectionId : 'assessmentSection-1',
                itemIdentifier : 'item-2'
            });
        }, TypeError, 'The test map is required');


        result = navigationHelper.isLeavingSection({
            sectionId : 'assessmentSection-1',
            itemIdentifier : 'item-2'
        }, testMap, 'next', 'item');

        assert.equal(typeof result, 'boolean', 'The helper does not throw with correct parameters');
    });

    QUnit.cases([{
        title: 'move next item inside a section',
        expectResult : false,
        context : {
            testPartId : 'testPart-1',
            sectionId : 'assessmentSection-1',
            itemIdentifier : 'item-2'
        },
        direction : 'next',
        scope : 'item'
    },{
        title: 'move next item at the end of a section inside the same testpart',
        expectResult : false,
        context : {
            testPartId : 'testPart-1',
            sectionId : 'assessmentSection-1',
            itemIdentifier : 'item-3'
        },
        direction : 'next',
        scope : 'item',
    },{
        title: 'move next part',
        expectResult : true,
        context : {
            testPartId : 'testPart-1',
            sectionId : 'assessmentSection-1',
            itemIdentifier : 'item-2'
        },
        direction : 'next',
        scope : 'testPart'
    },{
        title: 'move next item at the end of last testpart\'s section',
        expectResult : true,
        context : {
            testPartId : 'testPart-1',
            sectionId : 'assessmentSection-5',
            itemIdentifier : 'item-14'
        },
        direction : 'next',
        scope : 'item',
    },{
        title: 'move previous item at the beginning of the 2nd testpart\'s section',
        expectResult : true,
        context : {
            testPartId : 'testPart-2',
            sectionId : 'assessmentSection-6',
            itemIdentifier : 'item-15'
        },
        direction : 'previous',
        scope : 'item',
    },{
        title: 'move next section to the next test part',
        expectResult : true,
        context : {
            testPartId : 'testPart-1',
            sectionId : 'assessmentSection-5',
            itemIdentifier : 'item-13'
        },
        direction : 'next',
        scope : 'section',
    },{
        title: 'jump items outside a section in the same testPart',
        expectResult : false,
        context : {
            testPartId : 'testPart-1',
            sectionId : 'assessmentSection-2',
            itemIdentifier : 'item-4'
        },
        direction : 'jump',
        scope : 'item',
        position: 7
    },{
        title: 'jump over testParts',
        expectResult : true,
        context : {
            testPartId : 'testPart-1',
            sectionId : 'assessmentSection-3',
            itemIdentifier : 'item-7'
        },
        direction : 'jump',
        scope : 'item',
        position: 15
    }])
    .test('is leaving a TestPart if ', function (data, assert) {
        var result;

        QUnit.expect(1);

        result = navigationHelper.isLeavingTestPart(data.context, testMap, data.direction, data.scope, data.position);

        assert.equal(result, data.expectResult, 'The helper gives the correct result');
    });


    QUnit.module('navigation.isLast');

    QUnit.test('Bad paramerters', function(assert){
        var result;

        QUnit.expect(4);

        assert.throws(function(){
            navigationHelper.isLast();
        }, TypeError, 'The test map is required');

        assert.throws(function(){
            navigationHelper.isLast('foo');
        }, TypeError, 'The test map needs to be an object');

        assert.throws(function(){
            navigationHelper.isLast(testMap);
        }, TypeError, 'An itemIdentifier is required');

        result = navigationHelper.isLast(testMap, 'item-17');
        assert.equal(typeof result, 'boolean', 'The helper does not throw with correct parameters');
    });

    QUnit.cases([{
        title: '1st item',
        expectResult : false,
        itemIdentifier : 'item-1'
    }, {
        title: '2nd item',
        expectResult : false,
        itemIdentifier : 'item-2'
    }, {
        title: 'last of a section',
        expectResult : false,
        itemIdentifier : 'item-11'
    }, {
        title: 'last of a testPart',
        expectResult : false,
        itemIdentifier : 'item-14'
    }, {
        title: 'last item',
        expectResult : true,
        itemIdentifier : 'item-17'
    }])
    .test('is the last test item if ', function (data, assert) {
        var result;

        QUnit.expect(1);

        result = navigationHelper.isLast(testMap, data.itemIdentifier);

        assert.equal(result, data.expectResult, 'The helper gives the correct result');
    });

    QUnit.module('navigation.isLastOf');

    QUnit.test('Bad paramerters', function(assert){
        var result;

        QUnit.expect(4);

        assert.throws(function(){
            navigationHelper.isLastOf();
        }, TypeError, 'The test map is required');

        assert.throws(function(){
            navigationHelper.isLastOf('foo');
        }, TypeError, 'The test map needs to be an object');

        assert.throws(function(){
            navigationHelper.isLastOf(testMap);
        }, TypeError, 'An itemIdentifier is required');

        result = navigationHelper.isLastOf(testMap, 'item-17');
        assert.equal(typeof result, 'boolean', 'The helper does not throw with correct parameters');
    });

    QUnit.cases([{
        title: 'test, 3rd item',
        scope : 'test',
        expectResult : false,
        itemIdentifier : 'item-3'
    }, {
        title: 'section, 3rd item',
        scope : 'section',
        expectResult : true,
        itemIdentifier : 'item-3'
    }, {
        title: 'testPart, 3rd item',
        scope : 'testPart',
        expectResult : false,
        itemIdentifier : 'item-3'
    }, {
        title: 'test, 14th item',
        scope : 'test',
        expectResult : false,
        itemIdentifier : 'item-14'
    }, {
        title: 'section, 14th item',
        scope : 'section',
        expectResult : true,
        itemIdentifier : 'item-14'
    }, {
        title: 'testPart, 14th item',
        scope : 'testPart',
        expectResult : true,
        itemIdentifier : 'item-14'
    }, {
        title: 'wrong scope',
        scope : 'foo',
        expectResult : false,
        itemIdentifier : 'item-14'
    }, {
        title: 'test (default value), item 17',
        expectResult : true,
        itemIdentifier : 'item-17'

    }])
    .test('is the last of ', function (data, assert) {
        var result;

        QUnit.expect(1);

        result = navigationHelper.isLastOf(testMap, data.itemIdentifier, data.scope);

        assert.equal(result, data.expectResult, 'The helper gives the correct result');
    });

    QUnit.module('navigation.isFirst');

    QUnit.test('Bad paramerters', function(assert){
        var result;

        QUnit.expect(4);

        assert.throws(function(){
            navigationHelper.isFirst();
        }, TypeError, 'The test map is required');

        assert.throws(function(){
            navigationHelper.isFirst('foo');
        }, TypeError, 'The test map needs to be an object');

        assert.throws(function(){
            navigationHelper.isFirst(testMap);
        }, TypeError, 'An itemIdentifier is required');

        result = navigationHelper.isFirst(testMap, 'item-1');
        assert.equal(typeof result, 'boolean', 'The helper does not throw with correct parameters');
    });

    QUnit.cases([{
        title: '1st item',
        expectResult : true,
        itemIdentifier : 'item-1'
    }, {
        title: '2nd item',
        expectResult : false,
        itemIdentifier : 'item-2'
    }, {
        title: 'last of a section',
        expectResult : false,
        itemIdentifier : 'item-11'
    }, {
        title: 'last of a testPart',
        expectResult : false,
        itemIdentifier : 'item-14'
    }, {
        title: 'last item',
        expectResult : false,
        itemIdentifier : 'item-17'
    }])
    .test('is the first test item if ', function (data, assert) {
        var result;

        QUnit.expect(1);

        result = navigationHelper.isFirst(testMap, data.itemIdentifier);

        assert.equal(result, data.expectResult, 'The helper gives the correct result');
    });

    QUnit.module('navigation.isFirstOf');

    QUnit.test('Bad paramerters', function(assert){
        var result;

        QUnit.expect(4);

        assert.throws(function(){
            navigationHelper.isFirstOf();
        }, TypeError, 'The test map is required');

        assert.throws(function(){
            navigationHelper.isFirstOf('foo');
        }, TypeError, 'The test map needs to be an object');

        assert.throws(function(){
            navigationHelper.isFirstOf(testMap);
        }, TypeError, 'An itemIdentifier is required');

        result = navigationHelper.isFirstOf(testMap, 'item-17');
        assert.equal(typeof result, 'boolean', 'The helper does not throw with correct parameters');
    });

    QUnit.cases([{
        title: 'test, 1st item',
        scope : 'test',
        expectResult : true,
        itemIdentifier : 'item-1'
    }, {
        title: 'section, 1st item',
        scope : 'section',
        expectResult : true,
        itemIdentifier : 'item-1'
    }, {
        title: 'testPart, 1st item',
        scope : 'testPart',
        expectResult : true,
        itemIdentifier : 'item-1'
    }, {
        title: 'test, 7th item',
        scope : 'test',
        expectResult : false,
        itemIdentifier : 'item-7'
    }, {
        title: 'section, 7th item',
        scope : 'section',
        expectResult : true,
        itemIdentifier : 'item-7'
    }, {
        title: 'testPart, 7th item',
        scope : 'testPart',
        expectResult : false,
        itemIdentifier : 'item-7'
    }, {
        title: 'test, 15th item',
        scope : 'test',
        expectResult : false,
        itemIdentifier : 'item-15'
    }, {
        title: 'section, 15th item',
        scope : 'section',
        expectResult : true,
        itemIdentifier : 'item-15'
    }, {
        title: 'testPart, 15th item',
        scope : 'testPart',
        expectResult : true,
        itemIdentifier : 'item-15'
    }, {
        title: 'wrong scope',
        scope : 'foo',
        expectResult : false,
        itemIdentifier : 'item-14'
    }, {
        title: 'test (default value), item 1',
        expectResult : true,
        itemIdentifier : 'item-1'

    }])
    .test('is the last of ', function (data, assert) {
        var result;

        QUnit.expect(1);

        result = navigationHelper.isFirstOf(testMap, data.itemIdentifier, data.scope);

        assert.equal(result, data.expectResult, 'The helper gives the correct result');
    });


    QUnit.module('Sibling Items');

    QUnit.cases([{
        title: 'next 3 items from the item at position 0',
        direction : 'next',
        position: 0,
        amount: 3,
        expectResult : [
            testMap.parts['testPart-1'].sections['assessmentSection-1'].items['item-2'],
            testMap.parts['testPart-1'].sections['assessmentSection-1'].items['item-3'],
            testMap.parts['testPart-1'].sections['assessmentSection-2'].items['item-4']
        ]
    }, {
        title: 'previous 3 items from the item at position 0',
        direction : 'previous',
        position: 0,
        amount: 3,
        expectResult : []
    }, {
        title: 'next/previous 3 items from the item at position 1',
        direction : 'both',
        position: 1,
        amount: 3,
        expectResult : [
            testMap.parts['testPart-1'].sections['assessmentSection-1'].items['item-1'],
            testMap.parts['testPart-1'].sections['assessmentSection-1'].items['item-3'],
            testMap.parts['testPart-1'].sections['assessmentSection-2'].items['item-4'],
            testMap.parts['testPart-1'].sections['assessmentSection-2'].items['item-5']
        ]
    }, {
        title: 'next/previous 3 items from the item item-4',
        direction : 'both',
        position: 'item-4',
        amount: 3,
        expectResult : [
            testMap.parts['testPart-1'].sections['assessmentSection-1'].items['item-3'],
            testMap.parts['testPart-1'].sections['assessmentSection-1'].items['item-2'],
            testMap.parts['testPart-1'].sections['assessmentSection-1'].items['item-1'],
            testMap.parts['testPart-1'].sections['assessmentSection-2'].items['item-5'],
            testMap.parts['testPart-1'].sections['assessmentSection-2'].items['item-6'],
            testMap.parts['testPart-1'].sections['assessmentSection-3'].items['item-7']
        ]
    }, {
        title: 'previous 3 items over a test part',
        direction : 'previous',
        position: 16,
        amount: 3,
        expectResult : [
            testMap.parts['testPart-2'].sections['assessmentSection-6'].items['item-16'],
            testMap.parts['testPart-2'].sections['assessmentSection-6'].items['item-15'],
            testMap.parts['testPart-1'].sections['assessmentSection-5'].items['item-14']
        ]
    }, {
        title: 'next 3 items from the last item',
        direction : 'next',
        position: 16,
        amount: 3,
        expectResult : []
    }, {
        title: 'previous 3 items from an unknown position',
        direction : 'previous',
        position: 100,
        amount: 3,
        expectResult : []
    }, {
        title: 'previous 3 items from an unknown item',
        direction : 'previous',
        position: 'item-100',
        amount: 3,
        expectResult : []
    }, {
        title: 'next 3 items from an unknown position',
        direction : 'next',
        position: 100,
        amount: 3,
        expectResult : []
    }, {
        title: 'next 3 items from an unknown item',
        direction : 'next',
        position: 'item-100',
        amount: 3,
        expectResult : []
    }])
        .test('getSiblingItems ', function (data, assert) {
            var result;

            QUnit.expect(1);

            result = navigationHelper.getSiblingItems(testMap, data.position, data.direction, data.amount);

            assert.deepEqual(result, data.expectResult, 'The helper gives the correct result');
        });

    QUnit.cases([{
        title: 'next item after the position 0',
        position: 0,
        expectResult : testMap.parts['testPart-1'].sections['assessmentSection-1'].items['item-2']
    }, {
        title: 'next item after the position 16',
        position: 16,
        expectResult : null
    }, {
        title: 'next item after the item item-4',
        position: 'item-4',
        expectResult : testMap.parts['testPart-1'].sections['assessmentSection-2'].items['item-5']
    }, {
        title: 'next item after an unknown position',
        position: 100,
        expectResult : null
    }, {
        title: 'next item after an unknown item',
        position: 'item-100',
        expectResult : null
    }])
        .test('getNextItem ', function (data, assert) {
            var result;

            QUnit.expect(1);

            result = navigationHelper.getNextItem(testMap, data.position);

            assert.deepEqual(result, data.expectResult, 'The helper gives the correct result');
        });

    QUnit.cases([{
        title: 'previous item before the position 0',
        position: 0,
        expectResult : null
    }, {
        title: 'previous item before the position 16',
        position: 16,
        expectResult : testMap.parts['testPart-2'].sections['assessmentSection-6'].items['item-16']
    }, {
        title: 'previous item before the item item-4',
        position: 'item-4',
        expectResult : testMap.parts['testPart-1'].sections['assessmentSection-1'].items['item-3']
    }, {
        title: 'previous item before an unknown position',
        position: 100,
        expectResult : null
    }, {
        title: 'previous item before an unknown item',
        position: 'item-100',
        expectResult : null
    }])
        .test('getPreviousItem ', function (data, assert) {
            var result;

            QUnit.expect(1);

            result = navigationHelper.getPreviousItem(testMap, data.position);

            assert.deepEqual(result, data.expectResult, 'The helper gives the correct result');
        });


    QUnit.module('Navigation checks');

    QUnit.cases([{
        title: 'moving next item',
        action: 'move',
        params: {
            direction: 'next',
            scope: 'item'
        },
        expectResult : true
    }, {
        title: 'moving next section',
        action: 'move',
        params: {
            direction: 'next',
            scope: 'section'
        },
        expectResult : false
    }, {
        title: 'moving previous item',
        action: 'move',
        params: {
            direction: 'previous',
            scope: 'item'
        },
        expectResult : false
    }, {
        title: 'moving previous section',
        action: 'move',
        params: {
            direction: 'previous',
            scope: 'section'
        },
        expectResult : false
    }, {
        title: 'jumping',
        action: 'move',
        params: {
            direction: 'jump',
            scope: 'item',
            ref: 8
        },
        expectResult : false
    }, {
        title: 'skipping item',
        action: 'skip',
        expectResult : true
    }, {
        title: 'timeout',
        action: 'timeout',
        expectResult : true
    }])
        .test('isMovingToNextItem ', function (data, assert) {
            var result;

            QUnit.expect(1);

            result = navigationHelper.isMovingToNextItem(data.action, data.params);

            assert.equal(result, data.expectResult, 'The helper gives the correct result');
        });

    QUnit.cases([{
        title: 'moving next item',
        action: 'move',
        params: {
            direction: 'next',
            scope: 'item'
        },
        expectResult : false
    }, {
        title: 'moving next section',
        action: 'move',
        params: {
            direction: 'next',
            scope: 'section'
        },
        expectResult : false
    }, {
        title: 'moving previous item',
        action: 'move',
        params: {
            direction: 'previous',
            scope: 'item'
        },
        expectResult : true
    }, {
        title: 'moving previous section',
        action: 'move',
        params: {
            direction: 'previous',
            scope: 'section'
        },
        expectResult : false
    }, {
        title: 'jumping',
        action: 'move',
        params: {
            direction: 'jump',
            scope: 'item',
            ref: 8
        },
        expectResult : false
    }, {
        title: 'skipping item',
        action: 'skip',
        expectResult : false
    }, {
        title: 'timeout',
        action: 'timeout',
        expectResult : false
    }])
        .test('isMovingToPreviousItem ', function (data, assert) {
            var result;

            QUnit.expect(1);

            result = navigationHelper.isMovingToPreviousItem(data.action, data.params);

            assert.equal(result, data.expectResult, 'The helper gives the correct result');
        });

    QUnit.cases([{
        title: 'moving next item',
        action: 'move',
        params: {
            direction: 'next',
            scope: 'item'
        },
        expectResult : false
    }, {
        title: 'moving next section',
        action: 'move',
        params: {
            direction: 'next',
            scope: 'section'
        },
        expectResult : false
    }, {
        title: 'moving previous item',
        action: 'move',
        params: {
            direction: 'previous',
            scope: 'item'
        },
        expectResult : false
    }, {
        title: 'moving previous section',
        action: 'move',
        params: {
            direction: 'previous',
            scope: 'section'
        },
        expectResult : false
    }, {
        title: 'jumping',
        action: 'move',
        params: {
            direction: 'jump',
            scope: 'item',
            ref: 8
        },
        expectResult : true
    }, {
        title: 'skipping item',
        action: 'skip',
        expectResult : false
    }, {
        title: 'timeout',
        action: 'timeout',
        expectResult : false
    }])
        .test('isJumpingToItem ', function (data, assert) {
            var result;

            QUnit.expect(1);

            result = navigationHelper.isJumpingToItem(data.action, data.params);

            assert.equal(result, data.expectResult, 'The helper gives the correct result');
        });
});
