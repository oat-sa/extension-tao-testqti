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
 * Copyright (c) 2019 (original work) Open Assessment Technologies SA ;
 */
/**
 * @author Péter Halász <peter@taotesting.com>
 */
define([
    'taoQtiTest/runner/navigator/offlineNavigator',
    'taoQtiTest/runner/proxy/cache/itemStore',
    'taoQtiTest/runner/services/responseStore',
    'taoQtiTest/runner/helpers/map',
    'json!taoQtiTest/test/runner/services/offlineJumpTable/resources/items.json',
    'json!taoQtiTest/test/runner/navigator/offlineNavigator/resources/testMap.json',
    'json!taoQtiTest/test/runner/navigator/offlineNavigator/resources/testData.json',
    'json!taoQtiTest/test/runner/navigator/offlineNavigator/resources/testContext.json'
], function(
    offlineNavigatorFactory,
    itemStoreFactory,
    responseStoreFactory,
    mapHelper,
    itemsJson,
    testMapJson,
    testDataJson,
    testContextJson
) {
    'use strict';

    var offlineNavigator,
        itemStore,
        responseStore;

    QUnit.module('offlineNavigator', {
        before: function(assert) {
            var done = assert.async();

            itemStore = itemStoreFactory();
            itemStore.setCacheSize(Object.keys(itemsJson.items).length);

            responseStore = responseStoreFactory();

            addItemsToItemStore().then(function() {
                offlineNavigator = offlineNavigatorFactory(itemStore, responseStore);

                done();
            });
        }
    });

    QUnit.test('it exposes a function', function(assert) {
        assert.expect(1);
        assert.equal(typeof offlineNavigatorFactory, 'function');
    });

    QUnit.test('it has the required methods', function(assert) {
        assert.expect(5);
        assert.equal(typeof offlineNavigator['setTestData'], 'function');
        assert.equal(typeof offlineNavigator['setTestContext'], 'function');
        assert.equal(typeof offlineNavigator['setTestMap'], 'function');
        assert.equal(typeof offlineNavigator['init'], 'function');
        assert.equal(typeof offlineNavigator['navigate'], 'function');
    });

    QUnit.test('it returns itself after calling the setters or init method', function(assert) {
        var mockTestMap = { parts: {} };

        assert.equal(offlineNavigator['setTestData'](), offlineNavigator);
        assert.equal(offlineNavigator['setTestContext'](), offlineNavigator);
        assert.equal(offlineNavigator['setTestMap'](mockTestMap), offlineNavigator);
        assert.equal(offlineNavigator['init'](), offlineNavigator);
    });

    QUnit
        .cases
        .init([
            { direction: 'next', scope: 'item', expectedItem: 'Q02', expectedSection: 'S01', expectedPart: 'P01' },
            { direction: 'skip', scope: 'item', expectedItem: 'Q02', expectedSection: 'S01', expectedPart: 'P01' },
            { direction: 'next', scope: 'section', expectedItem: 'Q13', expectedSection: 'S02', expectedPart: 'P01' }
        ])
        .test('it supports all navigation actions', function(data, assert) {
            var done = assert.async();

            offlineNavigator
                .setTestMap(mapHelper.createJumpTable(testMapJson))
                .setTestContext(testContextJson)
                .setTestData(testDataJson)
                .clearJumpTable()
                .init();

            offlineNavigator
                .navigate(data.direction, data.scope, null, { itemResponse: {} }).then(function(result) {
                    assert.expect(4);

                    assert.equal(typeof result, 'object');
                    assert.equal(result.itemIdentifier, data.expectedItem);
                    assert.equal(result.sectionId, data.expectedSection);
                    assert.equal(result.testPartId, data.expectedPart);
                    done();
                });
        });

    QUnit.test('it supports previousItem navigation action', function(assert) {
        var done = assert.async();

        offlineNavigator
            .setTestMap(mapHelper.createJumpTable(testMapJson))
            .setTestContext(testContextJson)
            .setTestData(testDataJson)
            .clearJumpTable()
            .init();

        Promise.all([
            offlineNavigator.navigate('next', 'item', null, { itemResponse: {} }),
            offlineNavigator.navigate('next', 'item', null, { itemResponse: {} }),
            offlineNavigator.navigate('previous', 'item', null, { itemResponse: {} })
        ]).then(function(result) {
            result = result[2];
            assert.expect(4);

            assert.equal(typeof result, 'object');
            assert.equal(result.itemIdentifier, 'Q02');
            assert.equal(result.sectionId, 'S01');
            assert.equal(result.testPartId, 'P01');
            done();
        });
    });

    QUnit
        .cases
        .init([
            { direction: 'next', scope: 'foo' },
            { direction: 'previous', scope: 'foo' },
            { direction: 'skip', scope: 'foo' },
            { direction: 'foo', scope: 'item' },
            { direction: 'foo', scope: 'section' }
        ])
        .test('it returns error in case of invalid navigation', function(data, assert) {
            var done = assert.async();

            offlineNavigator.navigate(data.direction, data.scope, null, { itemResponse: {} })
                .then(function() {
                    assert.ok();
                })
                .catch(function(err) {
                    assert.equal(err.message, 'Invalid navigation action');
                })
                .finally(function() {
                    done();
                });

        });

    function addItemsToItemStore() {
        var promises = [];
        Object.keys(itemsJson.items).forEach(function(itemIdentifier) {
            promises.push(itemStore.set(itemIdentifier, itemsJson.items[itemIdentifier]));
        });

        return Promise.all(promises);
    }
});
