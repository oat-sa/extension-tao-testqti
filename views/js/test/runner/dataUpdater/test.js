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
    'core/collections',
    'taoQtiTest/runner/provider/dataUpdater',
    'json!taoQtiTest/test/runner/dataUpdater/testData.json',
    'json!taoQtiTest/test/runner/dataUpdater/testMap.json',
    'json!taoQtiTest/test/runner/dataUpdater/testContext.json'
], function(collections, dataUpdaterFactory, testData, testMap, testContext) {
    'use strict';


    QUnit.module('API');

    QUnit.test('module', function(assert) {
        QUnit.expect(1);

        assert.equal(typeof dataUpdaterFactory, 'function', "The module exposes a function");
    });

    QUnit.test('factory', function(assert) {
        var holderMock = new collections.Map();

        QUnit.expect(4);

        assert.throws(function() {
            dataUpdaterFactory();
        }, TypeError, 'factory called without parameter');

        assert.throws(function() {
            dataUpdaterFactory({});
        }, TypeError, 'factory called without a wrong parameter');

        assert.equal(typeof dataUpdaterFactory(holderMock), 'object', "The factory creates an object");
        assert.notEqual(dataUpdaterFactory(holderMock), dataUpdaterFactory(holderMock), "The factory creates new objects");
    });

    QUnit.cases([{
        title: 'update'
    }, {
        title: 'buildTestMap'
    }, {
        title: 'updateStats'
    }])
    .test('Method ', function(data, assert) {
        var holderMock = new collections.Map();

        QUnit.expect(1);

        assert.equal(typeof dataUpdaterFactory(holderMock)[data.title], 'function', 'The instance exposes a "' + data.title + '" method');
    });


    QUnit.module('Behavior');

    QUnit.test('update from a single object', function(assert) {
        var holderMock = new collections.Map();
        var dataSet = {
            testData : {
                foo : 'testData'
            },
            testContext : {
                foo : 'testContext'
            },
            testBar : {
                foo : 'testBar'
            }
        };
        var dataUpdater = dataUpdaterFactory(holderMock);

        QUnit.expect(8);

        assert.equal(holderMock.get('testData'), null);
        assert.equal(holderMock.get('testContext'), null);
        assert.equal(holderMock.get('testMap'), null);
        assert.equal(holderMock.get('testBar'), null);

        dataUpdater.update(dataSet);

        assert.deepEqual(holderMock.get('testData'), dataSet.testData);
        assert.deepEqual(holderMock.get('testContext'), dataSet.testContext);
        assert.equal(holderMock.get('testMap'), null);
        assert.equal(holderMock.get('testBar'), null);
    });


    QUnit.test('update from a multiple objects', function(assert) {
        var holderMock = new collections.Map();
        var dataSet = [{
            testData : {
                foo : 'testDoo'
            },
            testContext : {
                foo : 'testCoo'
            },
            testBar : {
                foo : 'testBar'
            }
        }, {
            testData : {
                foo : 'testData',
                last : true
            },
            testContext : {
                foo : 'testContext',
                last : true

            },
            testBar : {
                foo : 'testBar',
                last : true
            }
        }];
        var dataUpdater = dataUpdaterFactory(holderMock);

        QUnit.expect(8);

        assert.equal(holderMock.get('testData'), null);
        assert.equal(holderMock.get('testContext'), null);
        assert.equal(holderMock.get('testMap'), null);
        assert.equal(holderMock.get('testBar'), null);

        dataUpdater.update(dataSet);

        assert.deepEqual(holderMock.get('testData'), dataSet[1].testData);
        assert.deepEqual(holderMock.get('testContext'), dataSet[1].testContext);
        assert.equal(holderMock.get('testMap'), null);
        assert.equal(holderMock.get('testBar'), null);
    });

    QUnit.test('update test map', function(assert) {

        var dataUpdater;
        var dataSet = {
            testContext : testContext,
            testMap : testMap
        };

        var holderMock = new collections.Map();
        holderMock.set('testData', testData);

        QUnit.expect(9);

        dataUpdater = dataUpdaterFactory(holderMock);

        assert.deepEqual(holderMock.get('testData'), testData);
        assert.equal(holderMock.get('testContext'), null);
        assert.equal(holderMock.get('testMap'), null);

        assert.equal(typeof dataSet.testMap.jumps, 'undefined', 'The jump table does not exists');

        dataUpdater.update(dataSet);

        assert.deepEqual(holderMock.get('testData'), testData);
        assert.deepEqual(holderMock.get('testContext'), testContext);
        assert.equal(typeof holderMock.get('testMap').jumps, 'object', 'The jump table does exists');
        assert.equal(holderMock.get('testMap').jumps.length, 10, 'The jump table is complete');
        assert.equal(holderMock.get('testMap').stats.total, 10, 'The stats reflects the jump table');
    });
});
