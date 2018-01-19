/*
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
 * Copyright (c) 2017 (original work) Open Assessment Technologies SA
 *
 */

/**
 * The test runner persistent data store,
 * to be used with sub stores.
 *
 * Supports the legacy mode where multiple stores were used by each plugin.
 *
 * @author Bertrand Chevrier <bertrand@taotesting.com>
 */
define([
    'lodash',
    'core/promise',
    'core/store',
    'core/logger'
], function (_, Promise, store, loggerFactory) {
    'use strict';

    /**
     * The test store logger
     * @type {core/logger}
     */
    var logger = loggerFactory('taoQtiTest/runner/provider/testStore');

    /**
     * Database name prefix (suffixed by the test identifier)
     * to check if we use the legacy mode (multiple dbs)
     * or the new mode (one db per test).
     * @type {String[]}
     */
    var legacyPrefixes = [
        'actions-', 'duration-', 'test-states-', 'test-probes', 'timer-'
    ];
    /**
     * Check and select the store mode.
     * If any of the "legacyPrefixes" store is found, we used the "multiple/legacy" mode
     * otherwise we use the unified mode.
     * @param {String} testId
     * @param {Object} [preselectedBackend] - the storage backend
     * @returns {Promise<Boolean>} true means unified
     */
    var selectStoreMode = function selectStoreMode(testId, preselectedBackend){
        return store
            .getAll(function validate(storeName){
                return _.some(legacyPrefixes, function(prefix){
                    return !_.isEmpty(storeName) && prefix + testId === storeName;
                });
            }, preselectedBackend)
            .then(function(foundStores){
                return _.isArray(foundStores) && foundStores.length === 0;
            });
    };


    /**
     * Get the store for the given test
     *
     * @param {String} testId - unique test instance id
     * @returns {testStore} a 'wrapped' store instance
     * @param {Object} [preselectedBackend] - the storage backend (automatically selected by default)
     * @throws {TypeError} with no testId
     */
    return function testStoreLoader(testId, preselectedBackend){

        var volatiles = [];
        var unifiedStore;

        var getMode = Promise.resolve();
        if(_.isUndefined(unifiedStore)){
            getMode = selectStoreMode(testId, preselectedBackend).then(function(result){
                unifiedStore = !!result;

                logger.debug('Test store mode ' + (unifiedStore ? 'unified' : 'multiple (legacy)') + ' for ' + testId);
                console.log('Test store mode ' + (unifiedStore ? 'unified' : 'multiple (legacy)') + ' for ' + testId);
            });
        }

        if(_.isEmpty(testId)){
            throw new TypeError('The store must be identified with a unique test identifier');
        }

        /**
         * Wraps a store and add the support of "volatile" storages
         * @typedef {Object} testStore
         */
        return {

            /**
             * Get a wrapped store instance, that let's you use multiple stores inside one store...
             * (or in multiple stores if the test is in legacy mode)
             * @param {String} storeName - the name of the sub store
             * @returns {Promise<storage>}
             */
            getStore : function getStore(storeName) {
                if(_.isEmpty(storeName)){
                    throw new TypeError('A store name must be provided to get the store');
                }
                return getMode.then(function(){
                    if (unifiedStore) {
                        return store(testId, preselectedBackend);
                    } else {
                        return store(storeName + '-' + testId, preselectedBackend);
                    }
                })
                .then(function(loadedStore){
                    var keyPattern = new RegExp('^' + storeName + '__');
                    var storeKey = function storeKey(key){
                        return unifiedStore ? storeName + '__' + key : key;
                    };

                    /**
                     * The wrapped storage
                     * @type {Object}
                     */
                    return {


                        /**
                         * Get an item with the given key
                         * @param {String} key
                         * @returns {Promise<*>} with the result in resolve, undefined if nothing
                         */
                        getItem : function getItem(key){
                            return loadedStore.getItem(storeKey(key));
                        },

                        /**
                         * Get all store items
                         * @returns {Promise<Object>} with a collection of items
                         */
                        getItems : function getItems(){
                            if(unifiedStore){
                                return loadedStore.getItems().then(function(entries){
                                    return _.transform(entries, function(acc, entry, key){
                                        if(keyPattern.test(key)){
                                            acc[key.replace(keyPattern, '')] = entry;
                                        }
                                        return acc;
                                    }, {});
                                });
                            } else {
                                return loadedStore.getItems();
                            }
                        },

                        /**
                         * Set an item with the given key
                         * @param {String} key - the item key
                         * @param {*} value - the item value
                         * @returns {Promise<Boolean>} with true in resolve if added/updated
                         */
                        setItem : function setItem(key, value){
                            return loadedStore.setItem(storeKey(key), value);
                        },

                        /**
                         * Remove an item with the given key
                         * @param {String} key - the item key
                         * @returns {Promise<Boolean>} with true in resolve if removed
                         */

                        removeItem : function removeItem(key){
                            return loadedStore.removeItem(storeKey(key));
                        },

                        /**
                         * Clear the current store
                         * @returns {Promise<Boolean>} with true in resolve once cleared
                         */
                        clear : function clear(){
                            if(unifiedStore){
                                return loadedStore.getItems()
                                    .then(function(entries){
                                        _.forEach(entries, function(entry, key){
                                            if(keyPattern.test(key)){
                                                loadedStore.removeItem(key);
                                            }
                                        });
                                    });
                            } else {
                                return loadedStore.clear();
                            }
                        }
                    };
                });
            },

            /**
             * Define the given store as "volatile".
             * It means the store data can be revoked
             * if the user change browser for example
             * @param {String} storeName - the name of the store to set as volatile
             * @returns {testStore} chains
             */
            setVolatile : function setVolatile(storeName){
                if(!_.contains(volatiles, storeName)){
                    volatiles.push(storeName);
                }
                return this;
            },

            /**
             * Check the given storeId. If different from the current stored identifier
             * we initiate the invalidation of the volatile data.
             * @param {String} storeId - the id to check
             * @returns {Promise<Boolean>} true if cleared
             */
            clearVolatileOnStoreChange : function clearVolatileOnStoreChange(storeId){
                var self = this;
                var shouldClear = false;
                return store.getIdentifier(preselectedBackend)
                    .then(function(savedStoreId){
                        if (!_.isEmpty(storeId) && !_.isEmpty(savedStoreId) &&
                            savedStoreId !== storeId ){

                            shouldClear = true;
                        }
                        return shouldClear;
                    })
                    .then(function(clear){
                        if(clear){
                            return self.clearVolatileStores();
                        }
                        return false;
                    });
            },

            /**
             * Clear the storages marked as volatile
             * @returns {Promise<Boolean>} true if cleared
             */
            clearVolatileStores : function clearVolatileStores(){
                var self = this;
                var clearing = volatiles.map(function(storeName){
                    return self.getStore(storeName).then(function(storeInstance){
                        return storeInstance.clear();
                    });
                });

                return Promise.all(clearing).then(function(results){
                    return results && results.length === volatiles.length;
                });
            }
        };
    };
});
