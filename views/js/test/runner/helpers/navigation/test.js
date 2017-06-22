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

    QUnit
        .cases([{
            title: 'isLeavingSection'
        }])
        .test('Method ', function (data, assert) {
            QUnit.expect(1);

            assert.equal(typeof navigationHelper[data.title], 'function', 'The helper exposes a "' + data.title + '" method');
        });


    QUnit.module('isLeavingSection');

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
    .test('isLeavingSection ', function (data, assert) {
        var result;

        QUnit.expect(1);

        result = navigationHelper.isLeavingSection(data.context, testMap, data.direction, data.scope, data.position);

        assert.equal(result, data.expectResult, 'The helper gives the correct result');
    });


});
