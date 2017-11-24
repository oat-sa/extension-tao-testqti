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
 *
 * @author Bertrand Chevrier <bertrand@taotesting.com>
 */
define([
    'lodash',
    'core/promise',
    'core/store',
], function (_, Promise, store) {
    'use strict';

    /**
     * @param {String} testId - unique test instance id
     * @throws {TypeError} with no testId
     */
    return function testStore(testId){

        var volatiles = [];

        var loadStore = store.getStore(testId);

        var unifiedStore = true;


        /**
         */
        return {

            /**
             * Exposes the browser storage identifier i
             * (unique per browser, mostly used to check if the user change it's browser)
             * @returns {Promise<String>} resolves with the storage id
             */
            getStorageIdentifier : function getStorageIdentifier() {
                return store.getIdentifier();
            },

            getStore : function getStore(storeName) {
                var storeKey = function storeKey(key){
                    return storeName + '__' + key;
                };
                return {
                    getItem : function getItem(key){
                        return loadStore().then(function(loadedStore){
                            return loadedStore.getItem(storeKey(key));
                        });
                    },
                    setItem : function setItem(key, value){
                        return loadStore().then(function(loadedStore){
                            return loadedStore.setItem(storeKey(key), value);
                        });
                    },
                    removeItem : function removeItem(key){
                        return loadStore().then(function(loadedStore){
                            return loadedStore.removeItem(storeKey(key));
                        });
                    }
                };
            },

            setStoreAsVolatile : function setStoreAsVolatile(storeName){
                if(!_.contains(volatiles, storeName)){
                    volatiles.push(storeName);
                }
                return this;
            },

            clearVolatileStores : function clearVolatileStores(){
                var self = this;
                var clearing = volatiles.map(function(storeName){
                    return self.getStore(storeName).then(function(storeInstance){
                        return storeInstance.clear();
                    });
                });

                return Promise.all(clearing);
            }
        };
    };
});
