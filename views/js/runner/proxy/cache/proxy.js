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
    'i18n',
    'core/promise',
    'taoQtiTest/runner/navigator/navigator',
    'taoQtiTest/runner/helpers/map',
    'taoQtiTest/runner/helpers/navigation',
    'taoQtiTest/runner/proxy/qtiServiceProxy',
    'taoQtiTest/runner/proxy/cache/itemStore',
    'taoQtiTest/runner/proxy/cache/actionStore',
    'taoQtiTest/runner/proxy/cache/assetLoader'
], function(_, __, Promise, testNavigatorFactory, mapHelper, navigationHelper, qtiServiceProxy, itemStoreFactory, actionStoreFactory, assetLoader) {
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
     * @extends taoQtiTest/runner/proxy/qtiServiceProxy
     */
    var cacheProxy = _.defaults({

        /**
         * Installs the proxy
         */
        install : function install(){
            var self = this;

            //install the parent proxy
            qtiServiceProxy.install.call(this);

            //we keep items here
            this.itemStore = itemStoreFactory(cacheSize);

            //where we keep actions
            this.actiontStore = null;

            //can we load the next item from the cache/store ?
            this.getItemFromStore = false;

            //configuration params, that comes on every request/params
            this.requestConfig = {};

            //preload at least this number of items
            this.cacheAmount = 1;

            //keep reference on the test map as we don't have access to the test runner
            this.testMap     = null;
            this.testData    = null;
            this.testContext = null;

            /**
             * Update the item state in the store
             * @param {String} itemIdentifier - the item identifier
             * @param {Object} state - the state of the item
             * @returns {Boolean}
             */
            this.updateState = function updateState(itemIdentifier, state) {
                var itemData;
                if (this.itemStore.has(itemIdentifier)) {
                    itemData = this.itemStore.get(itemIdentifier);
                    itemData.itemState = state;
                    this.itemStore.set(itemIdentifier, itemData);
                }
            };

            /**
             * Check whether we have the item in the store
             * @param {String} itemIdentifier - the item identifier
             * @returns {Boolean}
             */
            this.hasItem = function hasItem(itemIdentifier) {
                return itemIdentifier && self.itemStore.has(itemIdentifier);
            };

            /**
             * Check whether we have the next item in the store
             * @param {String} itemIdentifier - the CURRENT item identifier
             * @returns {Boolean}
             */
            this.hasNextItem = function hasNextItem(itemIdentifier) {
                var sibling = navigationHelper.getNextItem(self.testMap, itemIdentifier);
                return sibling && self.hasItem(sibling.id);
            };

            /**
             * Check whether we have the previous item in the store
             * @param {String} itemIdentifier - the CURRENT item identifier
             * @returns {Boolean}
             */
            this.hasPreviousItem = function hasPreviousItem(itemIdentifier) {
                var sibling = navigationHelper.getPreviousItem(self.testMap, itemIdentifier);
                return sibling && self.hasItem(sibling.id);
            };

            /**
             * Offline ? We try to do the action anyway :
             *  1. Save the data to the actionStore
             *  2. Try to navigate offline, or just say 'ok'
             *
             * @param {String} action - the action name (ie. move, skip, timeout)
             * @param {Object} actionParams - the parameters sent along the action
             * @returns {Promise} resolves with the action result
             */
            this.offlineAction = function offlineAction(action, actionParams){

                return this.actiontStore.push(
                    action,
                    this.prepareParams(_.defaults(actionParams || {}, this.requestConfig))
                )
                .then(function(){
                    var testNavigator;
                    var testContext;
                    var offlineNavError;

                    // try the navigation if the actionParams context meaningful data
                    if( actionParams.direction && actionParams.scope){
                        testNavigator = testNavigatorFactory(self.testData, self.testContext, self.testMap);
                        testContext = testNavigator.navigate(
                                actionParams.direction,
                                actionParams.scope,
                                actionParams.ref
                            );

                        //we are really not able to navigate
                        if(!testContext || !testContext.itemIdentifier || !self.hasItem(testContext.itemIdentifier)){
                            offlineNavError = new Error(__('We are unable to connect to the server to retrieve the next item.'));
                            _.assign(offlineNavError, {
                                success : false,
                                source: 'navigator',
                                purpose: 'proxy',
                                type: 'Item not found',
                                code : 404
                            });
                            throw offlineNavError;
                        }
                        return {
                            success : true,
                            testContext : testContext
                        };
                    }

                    //at worst, we have saved the action and just want to continue
                    return {
                        success: true
                    };
                });
            };

            /**
             * Request/Offline strategy :
             *
             * ├─ Online
             * │  └─ run the request
             * │    ├─ request ok
             * │    └─ request fails
             * │       └─ run the offline action
             * └── Offline
             *    └─ send a telemetry request (connection could be back)
             *      ├─ request ok
             *      │  └─ sync data
             *      │     └─  run the request (back to the tree root)
             *      └─ request fails
             *         └─ run the offline action
             *
             * @param {String} action - the action name (ie. move, skip, timeout)
             * @param {Object} actionParams - the parameters sent along the action
             * @returns {Promise} resolves with the action result
             */
            this.requestNetworkThenOffline = function requestNetworkThenOffline(url, action, actionParams){

                //perform the request, but fallback on offline if the request itself fails
                var runRequestThenOffline = function runRequestThenOffline(){
                    return self.request(url, actionParams).then(function(result){
                        //if the request fails, we should be offline
                        if(self.isOffline()){
                            return self.offlineAction(action, actionParams);
                        }
                        return result;
                    });
                };

                if(this.isOffline()){
                    //try the telemetry action, just in case
                    return this
                        .telemetry(this.testContext.itemIdentifier, 'up')
                        .then(function(){
                            //if the up request succeed,
                            // we ask for action sync, and we run the request
                            if(self.isOnline()){
                                self.syncOfflineData();
                                return runRequestThenOffline();
                            }
                            return self.offlineAction(action, actionParams);
                        })
                        .catch(function(){
                            return self.offlineAction(action, actionParams);
                        });
                }

                //by default we try to run the request first
                return runRequestThenOffline();
            };

            /**
             * Flush and synchronize actions collected while offline
             * @returns {Promise} resolves with the action result
             */
            this.syncOfflineData = function syncOfflineData(){
                return this.queue.serie(function(){
                    return self.actiontStore.flush().then(function(data){
                        if(data && data.length){
                            return self.send('sync', data);
                        }
                    })
                    .catch(function(err){
                        self.trigger('error', err);
                    });
                });
            };
        },

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

            //those needs to be in each request params.
            this.requestConfig = _.pick(config, ['testDefinition', 'testCompilation', 'serviceCallId']);

            //set up the action store for the current service call
            this.actiontStore  = actionStoreFactory(config.serviceCallId);

            //proxy some received data
            this.on('receive', function (data) {
                if (data) {
                    if (data.testData && data.testData.config && data.testData.config.itemCaching) {
                        self.cacheAmount = parseInt(data.testData.config.itemCaching.amount, 10) || self.cacheAmount;
                    }
                    if(data.testData){
                        self.testData = data.testData;
                    }
                    if (data.testMap) {
                        self.testMap = data.testMap;
                    }
                    if(data.testContext){
                        self.testContext = data.testContext;
                    }
                }
            });

            //we resync as soon as the connection is back
            this.on('reconnect', function(){
                this.syncOfflineData();
            });

            //if some actions remains unsynced
            this.syncOfflineData();

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
         * Gets an item definition by its identifier, also gets its current state
         * @param {String} itemIdentifier - The identifier of the item to get
         * @param {Object} [params] - additional parameters
         * @returns {Promise} - Returns a promise. The item data will be provided on resolve.
         *                      Any error will be provided if rejected.
         */
        getItem: function getItem(itemIdentifier, params) {
            var self = this;

            /**
             * try to load the next items
             * @returns {Promise} that always resolves
             */
            var loadNextItem = function loadNextItem(){
                var siblings = navigationHelper.getSiblingItems(self.testMap, itemIdentifier, 'both', self.cacheAmount);
                var missing = _.reduce(siblings, function (list, sibling) {
                    if (!self.hasItem(sibling.id)) {
                        list.push(sibling.id);
                    }
                    return list;
                }, []);

                //don't run a request if not needed
                if (self.isOnline() && missing.length) {
                    _.delay(function(){
                        self.request(self.configStorage.getTestActionUrl('getNextItemData'), {itemDefinition: missing})
                            .then(function(response){
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
                            })
                            .catch(_.noop);
                    }, loadNextDelay);
                }
            };

            //resolve from the store
            if (this.getItemFromStore && this.itemStore.has(itemIdentifier)) {
                loadNextItem();

                return Promise.resolve(this.itemStore.get(itemIdentifier));
            }

            return this.request(this.configStorage.getItemActionUrl(itemIdentifier, 'getItem'), params)
                    .then(function(response){
                        if(response && response.success){
                            self.itemStore.set(itemIdentifier, response);
                        }

                        loadNextItem();

                        return response;
                    });
        },

        /**
         * Submits the state and the response of a particular item
         * @param {String} itemIdentifier - The identifier of the item to update
         * @param {Object} state - The state to submit
         * @param {Object} response - The response object to submit
         * @param {Object} [params] - Some optional parameters to join to the call
         * @returns {Promise} - Returns a promise. The result of the request will be provided on resolve.
         *                      Any error will be provided if rejected.
         */
        submitItem: function submitItem(itemIdentifier, state, response, params) {
            this.updateState(itemIdentifier, state);
            return qtiServiceProxy.submitItem.call(this, itemIdentifier, state, response, params);
        },


        /**
         * Sends the test variables
         * @param {Object} variables
         * @returns {Promise} - Returns a promise. The result of the request will be provided on resolve.
         *                      Any error will be provided if rejected.
         * @fires sendVariables
         */
        sendVariables: function sendVariables(variables) {
            var action = 'storeTraceData';
            var actionParams = {
                traceData: JSON.stringify(variables)
            };

            return this.requestNetworkThenOffline(
                this.configStorage.getTestActionUrl(action),
                action,
                actionParams
            );
        },

        /**
         * Calls an action related to the test
         * @param {String} action - The name of the action to call
         * @param {Object} [params] - Some optional parameters to join to the call
         * @returns {Promise} - Returns a promise. The result of the request will be provided on resolve.
         *                      Any error will be provided if rejected.
         */
        callTestAction: function callTestAction(action, params) {
            return this.requestNetworkThenOffline(
                this.configStorage.getTestActionUrl(action),
                action,
                params
            );
        },

        /**
         * Calls an action related to a particular item
         * @param {String} itemIdentifier - The identifier of the item for which call the action
         * @param {String} action - The name of the action to call
         * @param {Object} [params] - Some optional parameters to join to the call
         * @returns {Promise} - Returns a promise. The result of the request will be provided on resolve.
         *                      Any error will be provided if rejected.
         */
        callItemAction: function callItemAction(itemIdentifier, action, params) {
            var self = this;

            //update the item state
            if(params.itemState){
                self.updateState(itemIdentifier, params.itemState);
            }

            //check if we have already the item for the action we are going to perform
            self.getItemFromStore = (
                (navigationHelper.isMovingToNextItem(action, params) && self.hasNextItem(itemIdentifier)) ||
                (navigationHelper.isMovingToPreviousItem(action, params) && self.hasPreviousItem(itemIdentifier)) ||
                (navigationHelper.isJumpingToItem(action, params) && self.hasItem(mapHelper.getItemIdentifier(self.testMap,  params.ref)))
            );

            //as we will pick the next item from the store ensure the next request will start the timer
            if (self.getItemFromStore) {
                params.start = true;
            }

            return this.requestNetworkThenOffline(
                this.configStorage.getItemActionUrl(itemIdentifier, action),
                action,
                _.merge({ itemDefinition : itemIdentifier }, params)
            );
        }
    }, qtiServiceProxy);

    return cacheProxy;
});
