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
 * Copyright (c) 2017 Open Assessment Technologies SA
 */

/**
 * Cache/store for items on memory as a FIFO list
 *
 * @author Bertrand Chevrier <bertrand@taotesting.com>
 */
define([
    'lodash',
    'core/store'
], function(_, store) {
    'use strict';

    /**
     * The default number of items to store
     */
    var defaultConfig = {
        maxSize: 10
    };

    /**
     * Create an item store
     * @param {Number} [maxSize = 10] - the store limit
     * @param {Boolean} [preload] - do we preload items when storing them
     * @returns {itemStore}
     */
    return function itemStoreFactory(maxSize, preload) {

        //in memory storage
        var itemStorage = store('item-cache', store.backends.memory);
        var index = [];

        if(! _.isNumber(maxSize)){
            maxSize = defaultConfig.maxSize;
        }

        /**
         * @typedef itemStore
         */
        return {

            /**
             * Get the item form the given key/id/uri
             * @param {String} key - something identifier
             * @returns {Promise<Object>} the item
             */
            get: function get(key) {
                return itemStorage.getItem(key);
            },

            /**
             * Check whether the given item is in the store
             * @param {String} key - something identifier
             * @returns {Boolean}
             */
            has: function has(key) {
                return _.contains(index, key);
            },

            /**
             * Add/Set an item into the store, under the given key
             * @param {String} key - something identifier
             * @param {Object} value - the item
             * @returns {itemStore} chains
             */
            set: function set(key, value) {
                if(this.has(key)){
                    return Promise.resolve(true);
                }
                return itemStorage.setItem(key, value)
                    .then(function(updated){
                        if(updated){
                            index.push(key);
                        }

                        //do we reach the limit ? then remove one
                        if (index.length > 1 && index.length > maxSize) {
                            return index.shift();
                        }
                    })
                    .then(function(toRemove){
                        if(_.isString(toRemove) && !_.isEmpty(toRemove)) {
                            return itemStorage.removeItem(toRemove);
                        }
                    });
            },

            /**
             * Remove the item from the store
             * @param {String} key - something identifier
             * @returns {Promise} resolves once removed
             */
            remove: function remove(key) {
                _.remove(index, key);
                return itemStorage.removeItem(key);
            },

            /**
             * Clear the store
             * @returns {Promise}
             */
            clear: function clear() {
                index = [];
                return itemStorage.clear();
            }
        };
    };
});
