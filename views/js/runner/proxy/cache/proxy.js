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
 * Copyright (c) 2017 Open Assessment Technologies SA
 */

/**
 * This proxy provider cache the next item
 *
 * @author Bertrand Chevrier <bertrand@taotesting.com>
 */
define([
    'lodash',
    'core/promise',
    'taoQtiTest/runner/helpers/navigation',
    'taoQtiTest/runner/proxy/qtiServiceProxy',
    'taoQtiTest/runner/proxy/cache/itemStore',
    'taoQtiTest/runner/proxy/cache/assetLoader'
], function(_, Promise, navigationHelper, qtiServiceProxy, itemStoreFactory, assetLoader) {
    'use strict';

    /**
     * The number of items to keep in the cache
     * @type {Number}
     */
    var cacheSize     = 20;

    /**
     * The number of ms to wait after an item is loaded
     * to start loading the next.
     * This value is more or less the time needed to render an item.
     * @type {Number}
     */
    var loadNextDelay = 450;

    /**
     * Overrides the qtiServiceProxy with the precaching behavior
     */
    var cacheProxy = _.defaults({

        /**
         * Initializes the proxy
         * @param {Object} config - The config provided to the proxy factory
         * @param {String} config.testDefinition - The URI of the test
         * @param {String} config.testCompilation - The URI of the compiled delivery
         * @param {String} config.serviceCallId - The URI of the service call
         * @param {Object} [params] - Some optional parameters to join to the call
         * @returns {Promise} - Returns a promise. The proxy will be fully initialized on resolve.
         *                      Any error will be provided if rejected.
         */
        init: function init(config, params) {
            var self = this;

            //we keep items here
            this.itemStore = itemStoreFactory(cacheSize);

            //can we load the next item from the cache/store ?
            this.getItemFromStore = false;

            //keep a ref to the promise of the loadNextItem in case the call is not done when moving
            this.loadNextPromise = Promise.resolve();

            //preload at least this number of items
            this.cacheAmount = 1;

            //keep reference on the test map as we don't have access to the test runner
            this.testMap = null;
            this.on('receive', function (data) {
                if (data) {
                    if (data.testData && data.testData.config && data.testData.config.itemCaching) {
                        self.cacheAmount = parseInt(data.testData.config.itemCaching.amount, 10) || self.cacheAmount;
                    }
                    if (data.testMap) {
                        self.testMap = data.testMap;
                    }
                }
            });

            /**
             * Update the item state in the store
             * @param {String} uri - the item identifier
             * @param {Object} state - the state of the item
             * @returns {Boolean}
             */
            this.updateState = function updateState(uri, state) {
                var itemData;
                if (this.itemStore.has(uri)) {
                    itemData = this.itemStore.get(uri);
                    itemData.itemState = state;
                    this.itemStore.set(uri, itemData);
                }
            };

            /**
             * Check whether we have the item in the store
             * @param {String} uri - the item identifier
             * @returns {Boolean}
             */
            this.hasItem = function hasItem(uri) {
                return uri && self.itemStore.has(uri);
            };

            /**
             * Check whether we have the next item in the store
             * @param {String} uri - the CURRENT item identifier
             * @returns {Boolean}
             */
            this.hasNextItem = function hasNextItem(uri) {
                var sibling = navigationHelper.getNextItem(self.testMap, uri);
                return sibling && self.hasItem(sibling.id);
            };

            /**
             * Check whether we have the previous item in the store
             * @param {String} uri - the CURRENT item identifier
             * @returns {Boolean}
             */
            this.hasPreviousItem = function hasPreviousItem(uri) {
                var sibling = navigationHelper.getPreviousItem(self.testMap, uri);
                return sibling && self.hasItem(sibling.id);
            };

            //run the init
            return qtiServiceProxy.init.call(this, config, params);
        },

        /**
         * Uninstalls the proxy
         * @returns {Promise} - Returns a promise. The proxy will be fully uninstalled on resolve.
         *                      Any error will be provided if rejected.
         */
        destroy: function destroy() {

            this.itemStore.clear();

            this.testMap          = null;
            this.getItemFromStore = false;

            return qtiServiceProxy.destroy.call(this);
        },


        /**
         * Gets an item definition by its URI, also gets its current state
         * @param {String} uri - The URI of the item to get
         * @param {Object} [params] - additional parameters
         * @returns {Promise} - Returns a promise. The item data will be provided on resolve.
         *                      Any error will be provided if rejected.
         */
        getItem: function getItem(uri, params) {
            var self = this;

            /**
             * try to load the next items
             * @returns {Promise} that always resolves
             */
            function loadNextItem() {
                return new Promise(function (resolve) {
                    var siblings = navigationHelper.getSiblingItems(self.testMap, uri, 'both', self.cacheAmount);
                    var missing = _.reduce(siblings, function (list, sibling) {
                        if (!self.hasItem(sibling.id)) {
                            list.push(sibling.id);
                        }
                        return list;
                    }, []);

                    //don't run a request if not needed
                    if (missing.length) {
                        _.delay(function () {
                            self.request(self.configStorage.getTestActionUrl('getItem'), {itemDefinition: missing})
                                .then(function (response) {
                                    if (response && response.items) {
                                        _.forEach(response.items, function (item) {
                                            if (item && item.itemIdentifier) {

                                                //store the response and start caching assets
                                                self.itemStore.set(item.itemIdentifier, item);

                                                if (item.baseUrl && item.itemData && item.itemData.assets) {
                                                    assetLoader(item.baseUrl, item.itemData.assets);
                                                }
                                            }
                                        });
                                    }

                                    resolve();
                                })
                                .catch(resolve);
                        }, loadNextDelay);
                    } else {
                        resolve();
                    }
                });
            }

            //resolve from the store
            if (this.getItemFromStore && this.itemStore.has(uri)) {
                self.loadNextPromise = loadNextItem();

                return Promise.resolve(this.itemStore.get(uri));
            }

            return this.request(this.configStorage.getItemActionUrl(uri, 'getItem'), params)
                .then(function (response) {
                    if (response && response.success) {
                        self.itemStore.set(uri, response);
                    }

                    self.loadNextPromise = loadNextItem();

                    return response;
                });
        },

        /**
         * Submits the state and the response of a particular item
         * @param {String} uri - The URI of the item to update
         * @param {Object} state - The state to submit
         * @param {Object} response - The response object to submit
         * @returns {Promise} - Returns a promise. The result of the request will be provided on resolve.
         *                      Any error will be provided if rejected.
         */
        submitItem: function submitItem(uri, state, response, params) {
            this.updateState(uri, state);
            return qtiServiceProxy.submitItem.call(this, uri, state, response, params);
        },

        /**
         * Calls an action related to a particular item
         * @param {String} uri - The URI of the item for which call the action
         * @param {String} action - The name of the action to call
         * @param {Object} [params] - Some optional parameters to join to the call
         * @returns {Promise} - Returns a promise. The result of the request will be provided on resolve.
         *                      Any error will be provided if rejected.
         */
        callItemAction: function callItemAction(uri, action, params) {
            var self = this;

            return this.loadNextPromise
                .then(function(){

                    //update the item state
                    if(params.itemState){
                        self.updateState(uri, params.itemState);
                    }

                    //check if we have already the item for the action we are going to perform
                    self.getItemFromStore = false;
                    if( (action === 'timeout' || action === 'skip' ||
                        (action === 'move' && params.direction === 'next' && params.scope === 'item') ) &&
                        self.hasNextItem(uri) ){

                        self.getItemFromStore = true;
                        params.start = true;

                    } else if( action === 'move' && params.direction === 'previous' && params.scope === 'item' && self.hasPreviousItem(uri)){

                        self.getItemFromStore = true;
                        params.start = true;
                    }
                })
                .then(function(){
                    return self.request(self.configStorage.getItemActionUrl(uri, action), params);
                })
                .then(function(response){

                    self.isLast = response && response.testContext && response.testContext.isLast;
                    return response;
                });
        }
    }, qtiServiceProxy);

    return cacheProxy;
});
