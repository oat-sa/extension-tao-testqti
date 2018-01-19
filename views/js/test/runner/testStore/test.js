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
    'taoQtiTest/runner/provider/testStore',
], function(testStoreLoader) {
    'use strict';

    var mockedData = {};
    var mockBackend = function(name){

        if(!name){
            throw new TypeError('no name');
        }
        mockedData[name] = mockedData[name] || {};
        return {
            getItem : function getItem(key){
                return Promise.resolve(mockedData[name][key]);
            },
            setItem : function setItem(key, value){
                mockedData[name][key] = value;
                return Promise.resolve(true);
            },
            getItems : function getItems(){
                return Promise.resolve(mockedData[name]);
            },
            removeItem : function removeItem(key){
                delete mockedData[name][key];
                return Promise.resolve(true);
            },
            clear : function clear(){
                mockedData[name] = {};
                return Promise.resolve(true);
            },
            removeStore : function removeStore(){
                mockedData[name] = {};
                return Promise.resolve(true);
            }
        };
    };
    mockBackend.removeAll = function(){};
    mockBackend.getAll = function(){
        return [];
    };
    mockBackend.getStoreIdentifier = function(){
        return 'unit-test';
    };


    QUnit.module('API');

    QUnit.test('module', function(assert) {
        QUnit.expect(1);

        assert.equal(typeof testStoreLoader, 'function', "The module exposes a function");
    });

    QUnit.test('loader', function(assert) {
        QUnit.expect(4);

        assert.throws(function() {
            testStoreLoader();
        }, TypeError, 'loader called without parameter');

        assert.throws(function() {
            testStoreLoader(null);
        }, TypeError, 'loader called with null parameter');

        assert.throws(function() {
            testStoreLoader('');
        }, TypeError, 'loader called with empty parameter');


        assert.equal(typeof testStoreLoader('test-1234', mockBackend), 'object', "The loader returns an object");
    });

    QUnit.cases([{
        title: 'getStore'
    }, {
        title: 'setVolatile'
    }, {
        title: 'clearVolatileOnStoreChange'
    }, {
        title: 'clearVolatileStores'
    }])
    .test('testStore API ', function(data, assert) {
        QUnit.expect(1);
        assert.equal(typeof testStoreLoader('test-1234', mockBackend)[data.title], 'function', 'The instance exposes a "' + data.title + '" method');
    });



    QUnit.module('Store selection', {
        teardown : function(){
            mockedData = {};
            mockBackend.getAll = function(){
                return [];
            };
        }
    });

    QUnit.asyncTest('get store', function(assert){
        var testStore;

        QUnit.expect(7);

        testStore = testStoreLoader('test-1234', mockBackend);

        assert.throws(function(){
            testStore.getStore();
        }, TypeError, 'A store name must be provided');

        testStore.getStore('foo')
            .then(function(store){
                assert.equal(typeof store, 'object', 'The retrieved store is an object');
                assert.equal(typeof store.getItem, 'function', 'The retrieved store API match the storage');
                assert.equal(typeof store.getItems, 'function', 'The retrieved store API match the storage');
                assert.equal(typeof store.setItem, 'function', 'The retrieved store API match the storage');
                assert.equal(typeof store.removeItem, 'function', 'The retrieved store API match the storage');
                assert.equal(typeof store.clear, 'function', 'The retrieved store API match the storage');
                QUnit.start();
            })
            .catch(function(err){
                assert.ok(false, err.message);
                QUnit.start();
            });
    });

    QUnit.asyncTest('select legacy mode', function(assert){
        var testStore;

        QUnit.expect(5);

        mockBackend.getAll = function(validate){
            assert.ok(true, 'get all is called to select the mode');
            return [
                'duration-123456',
                'duration-abcde',
                'duration-foobar',
                'test-states-123456',
                'timer-abcde'
            ].filter(validate);
        };
        testStore = testStoreLoader('abcde', mockBackend);

        assert.equal(typeof mockedData['foo-abcde'], 'undefined');
        testStore.getStore('foo')
            .then(function(store){
                assert.equal(typeof mockedData['foo-abcde'], 'object', 'A legacy like store is created');
                assert.equal(typeof mockedData['foo-abcde']['moo'], 'undefined', 'The value is not in the store');

                return store.setItem('moo', 'too');
            })
            .then(function(){

                assert.equal(mockedData['foo-abcde']['moo'], 'too', 'The value is set in the legacy like store');

                QUnit.start();
            })
            .catch(function(err){
                assert.ok(false, err.message);
                QUnit.start();
            });
    });

    QUnit.asyncTest('select unified mode', function(assert){
        var testStore;

        QUnit.expect(6);

        mockBackend.getAll = function(validate){
            assert.ok(true, 'get all is called to select the mode');
            return [
                'duration-123456',
                'duration-abcde',
                'duration-foobar',
                'test-states-123456',
                'timer-abcde'
            ].filter(validate);
        };
        testStore = testStoreLoader('AF16B4', mockBackend);

        assert.equal(typeof mockedData['AF16B4'], 'undefined');

        testStore.getStore('foo')
            .then(function(store){
                assert.equal(typeof mockedData['foo-AF16B4'], 'undefined', 'No legacy like store');
                assert.equal(typeof mockedData['AF16B4'], 'object', 'The unified store is created');
                assert.equal(typeof mockedData['AF16B4']['foo__moo'], 'undefined', 'The store has not the value');

                return store.setItem('moo', 'too');
            })
            .then(function(){

                assert.equal(mockedData['AF16B4']['foo__moo'], 'too', 'The value is set in the unified store, prefixed');

                QUnit.start();
            })
            .catch(function(err){
                assert.ok(false, err.message);
                QUnit.start();
            });
    });


    QUnit.module('Store CRUD', {
        teardown : function(){
            mockedData = {};
            mockBackend.getAll = function(){
                return [];
            };
        }
    });

    QUnit.asyncTest('legacy mode', function(assert){
        var testStore;

        QUnit.expect(14);

        mockBackend.getAll = function(validate){
            assert.ok(true, 'get all is called to select the mode');
            return [
                'duration-123456',
            ].filter(validate);
        };
        testStore = testStoreLoader('123456', mockBackend);

        assert.equal(typeof mockedData['foo-123456'], 'undefined');

        testStore.getStore('timer')
            .then(function(store){
                assert.equal(typeof mockedData['timer-123456'], 'object', 'A legacy like store is created');

                assert.equal(typeof mockedData['timer-123456']['time'], 'undefined', 'The value is not in the store');
                assert.equal(typeof mockedData['timer-123456']['state'], 'undefined', 'The value is not in the store');

                return Promise.all([
                    store.setItem('time', 12),
                    store.setItem('state', 'started')
                ])
                .then(function(){
                    assert.equal(mockedData['timer-123456']['time'], 12, 'The value is set in the store');
                    assert.equal(mockedData['timer-123456']['state'], 'started', 'The value is set in the store');

                    return Promise.all([
                        store.getItem('time'),
                        store.getItem('state')
                    ]);
                })
                .then(function(results){
                    assert.equal(results[0], 12, 'The retrieved value macthes the set value');
                    assert.equal(results[1], 'started', 'The retrieved value macthes the set value');

                    return store.getItems();
                })
                .then(function(results){
                    assert.equal(results.time, 12, 'The entry is retreived');
                    assert.equal(results.state, 'started', 'The entry is retreived');

                    return store.removeItem('state');
                })
                .then(function(){
                    assert.equal(mockedData['timer-123456']['time'], 12, 'The value is set in the store');
                    assert.equal(typeof mockedData['timer-123456']['state'], 'undefined', 'The value has been removed');

                    return store.clear();
                })
                .then(function(){
                    assert.deepEqual(mockedData['timer-123456'], {}, 'The store is empty');
                });
            })
            .then(function(){
                QUnit.start();
            })
            .catch(function(err){
                assert.ok(false, err.message);
                QUnit.start();
            });
    });

    QUnit.asyncTest('unified mode', function(assert){
        var testStore;

        QUnit.expect(13);

        testStore = testStoreLoader('123456', mockBackend);

        assert.equal(typeof mockedData['123456'], 'undefined');

        testStore.getStore('timer')
            .then(function(store){
                assert.equal(typeof mockedData['123456'], 'object', 'A unified like store is created');

                assert.equal(typeof mockedData['123456']['timer__time'], 'undefined', 'The value is not in the store');
                assert.equal(typeof mockedData['123456']['timer__state'], 'undefined', 'The value is not in the store');

                return Promise.all([
                    store.setItem('time', 12),
                    store.setItem('state', 'started')
                ])
                .then(function(){
                    assert.equal(mockedData['123456']['timer__time'], 12, 'The value is set in the store');
                    assert.equal(mockedData['123456']['timer__state'], 'started', 'The value is set in the store');

                    return Promise.all([
                        store.getItem('time'),
                        store.getItem('state')
                    ]);
                })
                .then(function(results){
                    assert.equal(results[0], 12, 'The retrieved value macthes the set value');
                    assert.equal(results[1], 'started', 'The retrieved value macthes the set value');

                    return store.getItems();
                })
                .then(function(results){
                    assert.equal(results.time, 12, 'The entry is retreived');
                    assert.equal(results.state, 'started', 'The entry is retreived');

                    return store.removeItem('state');
                })
                .then(function(){
                    assert.equal(mockedData['123456']['timer__time'], 12, 'The value is set in the store');
                    assert.equal(typeof mockedData['123456']['timer__state'], 'undefined', 'The value has been removed');

                    return store.clear();
                })
                .then(function(){
                    assert.deepEqual(mockedData['123456'], {}, 'The store is empty');
                });
            })
            .then(function(){
                QUnit.start();
            })
            .catch(function(err){
                assert.ok(false, err.message);
                QUnit.start();
            });
    });

    QUnit.module('volatiles', {
        teardown: function(){
            mockedData = {};
            mockBackend.getAll = function(){
                return [];
            };
        }
    });

    QUnit.asyncTest('clear volatiles stores', function(assert){
        var testStore;

        QUnit.expect(1);

        mockedData = {
            '1234' : {
                'store-1__foo' : 'volatile',
                'store-1__moo' : 'volatile',
                'store-2__foo' : 'volatile',
                'store-2__moo' : 'volatile',
                'store-3__foo' : 'persistent',
                'store-3__moo' : 'persistent'
            },
            'abcde' : {
                'store-1__foo' : 'bar',
                'store-1__moo' : 'bar',
                'store-2__foo' : 'bar',
                'store-2__moo' : 'bar',
                'store-3__foo' : 'bar',
                'store-3__moo' : 'bar'
            },
        };

        testStore = testStoreLoader('1234', mockBackend);
        testStore.setVolatile('store-1');
        testStore.setVolatile('store-2');

        testStore.clearVolatileStores()
            .then(function(){
                assert.deepEqual(mockedData, {
                    '1234' : {
                        'store-3__foo' : 'persistent',
                        'store-3__moo' : 'persistent'
                    },
                    'abcde' : {
                        'store-1__foo' : 'bar',
                        'store-1__moo' : 'bar',
                        'store-2__foo' : 'bar',
                        'store-2__moo' : 'bar',
                        'store-3__foo' : 'bar',
                        'store-3__moo' : 'bar'
                    }
                }, 'Data marked as volatile is removed');

                QUnit.start();
            })
            .catch(function(err){
                assert.ok(false, err.message);
                QUnit.start();
            });
    });

    QUnit.asyncTest('clear volatiles stores on store change', function(assert){
        var testStore;

        QUnit.expect(2);

        mockedData = {
            '1234' : {
                'store-1__foo' : 'volatile',
                'store-1__moo' : 'volatile',
                'store-2__foo' : 'volatile',
                'store-2__moo' : 'volatile',
                'store-3__foo' : 'persistent',
                'store-3__moo' : 'persistent'
            },
            'abcde' : {
                'store-1__foo' : 'bar',
                'store-2__foo' : 'bar',
                'store-3__foo' : 'bar',
            },
        };

        testStore = testStoreLoader('1234', mockBackend);
        testStore.setVolatile('store-1');
        testStore.setVolatile('store-2');

        testStore.clearVolatileOnStoreChange('unit-test')
            .then(function(){
                assert.deepEqual(mockedData, {
                    '1234' : {
                        'store-1__foo' : 'volatile',
                        'store-1__moo' : 'volatile',
                        'store-2__foo' : 'volatile',
                        'store-2__moo' : 'volatile',
                        'store-3__foo' : 'persistent',
                        'store-3__moo' : 'persistent'
                    },
                    'abcde' : {
                        'store-1__foo' : 'bar',
                        'store-2__foo' : 'bar',
                        'store-3__foo' : 'bar',
                    }
                }, 'Data marked as volatile should not be removed, no store change');

                return testStore.clearVolatileOnStoreChange('ABCDE');
            })
            .then(function(){
                assert.deepEqual(mockedData, {
                    '1234' : {
                        'store-3__foo' : 'persistent',
                        'store-3__moo' : 'persistent'
                    },
                    'abcde' : {
                        'store-1__foo' : 'bar',
                        'store-2__foo' : 'bar',
                        'store-3__foo' : 'bar',
                    }
                }, 'Data marked as volatile is removed');

                QUnit.start();
            })
            .catch(function(err){
                assert.ok(false, err.message);
                QUnit.start();
            });

    });
});
