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
define(['lodash'], function(_) {
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
     * @returns {itemStore}
     */
    return function itemStoreFactory(maxSize) {

        //where items are stores, in an array
        var store = [];

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
             * @returns {Object} the item
             */
            get: function get(key) {
                var content = _.find(store, {
                    key : key
                });
                if(content && content.data){
                    return content.data;
                }
                return false;
            },

            /**
             * Check whether the given item is in the store
             * @param {String} key - something identifier
             * @returns {Boolean}
             */
            has: function has(key) {
                return _.some(store, {
                    key : key
                });
            },

            /**
             * Add/Set an item into the store, under the given key
             * @param {String} key - something identifier
             * @param {Object} value - the item
             * @returns {itemStore} chains
             */
            set: function set(key, value) {
                store.push({
                    key: key,
                    data: value
                });

                if (store.length > 1 && store.length > maxSize) {
                    store.shift();
                }
                return this;
            },

            /**
             * Remove the item from the store
             * @param {String} key - something identifier
             * @returns {Boolean} if an item was acually removed
             */
            remove: function remove(key) {

                var evens = _.remove(store, {
                    key : key
                });
                return evens.length;
            },

            /**
             * Clear the store
             * @returns {itemStore} chains
             */
            clear: function clear() {
                store = [];
                return this;
            }
        };
    };
});
