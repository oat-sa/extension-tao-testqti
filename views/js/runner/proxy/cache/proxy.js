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
    'taoQtiTest/runner/provider/dataUpdater',
    'taoQtiTest/runner/proxy/qtiServiceProxy',
    'taoQtiTest/runner/proxy/cache/itemStore',
    'taoQtiTest/runner/proxy/cache/actionStore'
], function(_, __, Promise, testNavigatorFactory, mapHelper, navigationHelper, dataUpdater, qtiServiceProxy, itemStoreFactory, actionStoreFactory) {
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
     * When we are unable to navigate offline
     * @type {Error}
     */
    var offlineNavError = _.assign(
        new Error(__('We are unable to connect to the server to retrieve the next item.')),
        {
            success : false,
            source: 'navigator',
            purpose: 'proxy',
            type: 'nav',
            code : 404
        }
    );

    /**
     * When we are unable to exit the test offline
     * @type {Error}
     */
    var offlineExitError = _.assign(
        new Error(__('We are unable to connect the server to submit your results.')),
        {
            success : false,
            source: 'navigator',
            purpose: 'proxy',
            type: 'finish',
            code : 404
        }
    );

    /**
     * When we are unable to navigate offline
     * @type {Error}
     */
    var offlinePauseError = _.assign(
        new Error(__('The test has been paused, we are unable to connect to the server.')),
        {
            success : false,
            source: 'navigator',
            purpose: 'proxy',
            type: 'pause',
            code : 404
        }
    );


    /**
     * Overrides the qtiServiceProxy with the precaching behavior
     * @extends taoQtiTest/runner/proxy/qtiServiceProxy
     */
    return _.defaults({

        /**
         * Installs the proxy
         */
        install : function install(config){
            var self = this;

            //install the parent proxy
            qtiServiceProxy.install.call(this);

            //we keep items here
            this.itemStore = itemStoreFactory({
                maxSize : cacheSize,
                preload : true,
                testId  : config.serviceCallId
            });

            //where we keep actions
            this.actiontStore = null;

            //can we load the next item from the cache/store ?
            this.getItemFromStore = false;

            //configuration params, that comes on every request/params
            this.requestConfig = {};

            //scheduled action promises which supposed to be resolved after action synchronization.
            this.actionPromises = {};

            //let's you update test data (testData, testContext and testMap)
            this.dataUpdater = dataUpdater(this.getDataHolder());

            /**
             * Get the item cache size from the test data
             * @returns {Number} the cache size
             */
            this.getCacheAmount = function getCacheAmount(){
                var cacheAmount = 1;
                var testData    = this.getDataHolder().get('testData');
                if(testData && testData.config && testData.config.itemCaching) {
                    cacheAmount = parseInt(testData.config.itemCaching.amount, 10) || cacheAmount;
                }
                return cacheAmount;
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
                var sibling = navigationHelper.getNextItem(this.getDataHolder().get('testMap'), itemIdentifier);
                return sibling && self.hasItem(sibling.id);
            };

            /**
             * Check whether we have the previous item in the store
             * @param {String} itemIdentifier - the CURRENT item identifier
             * @returns {Boolean}
             */
            this.hasPreviousItem = function hasPreviousItem(itemIdentifier) {
                var sibling = navigationHelper.getPreviousItem(this.getDataHolder().get('testMap'), itemIdentifier);
                return sibling && self.hasItem(sibling.id);
            };

            /**
             * Offline ? We try to navigate offline, or just say 'ok'
             *
             * @param {String} action - the action name (ie. move, skip, timeout)
             * @param {Object} actionParams - the parameters sent along the action
             * @returns {Object} action result
             */
            this.offlineAction = function offlineAction(action, actionParams){
                var testNavigator;
                var newTestContext;
                var result = {success : true};

                var blockingActions = ['exitTest', 'timeout'];

                var testData    = this.getDataHolder().get('testData');
                var testContext = this.getDataHolder().get('testContext');
                var testMap     = this.getDataHolder().get('testMap');


                if( action === 'pause' ) {
                    if(actionParams.reason){
                        offlinePauseError.data = actionParams.reason;
                    }
                    throw offlinePauseError;
                }

                //we just block those actions and the end of the test
                if( _.contains(blockingActions, action) ||
                    ( actionParams.direction === 'next' && navigationHelper.isLast(testMap, testContext.itemIdentifier)) ){
                    throw offlineExitError;
                }

                // try the navigation if the actionParams context meaningful data
                if( actionParams.direction && actionParams.scope){
                    testNavigator = testNavigatorFactory(testData, testContext, testMap);
                    newTestContext = testNavigator.navigate(
                            actionParams.direction,
                            actionParams.scope,
                            actionParams.ref
                        );

                    //we are really not able to navigate
                    if(!newTestContext || !newTestContext.itemIdentifier || !self.hasItem(newTestContext.itemIdentifier)){
                        throw offlineNavError;
                    }

                    result.testContext = newTestContext;
                }

                self.markActionAsOffline(actionParams);

                return result;
            };

            /**
             * Process action which should be sent using message channel.
             *
             * @param action
             * @param actionParams
             * @param deferred
             * @return {Promise} resolves with the action result
             */
            this.processSyncAction = function processSyncAction(action, actionParams, deferred) {
                return new Promise(function(resolve, reject) {
                    self.scheduleAction(action, actionParams).then(function(actionData){
                        self.actionPromises[actionData.params.actionId] = resolve;
                        if (!deferred) {
                            self.syncData().then(function (result) {
                                if (self.isOnline()) {
                                    _.forEach(result, function (actionResult) {
                                        var actionId = actionResult.requestParameters && actionResult.requestParameters.actionId ?
                                            actionResult.requestParameters.actionId : null;

                                        if (actionId && self.actionPromises[actionId]) {
                                            self.actionPromises[actionId](actionResult);
                                        }
                                    });
                                }
                            }).catch(function (reason) {
                                reject(reason);
                            });
                        }
                    }).catch(function (reason) {
                        reject(reason);
                    });
                });
            };

            /**
             * Schedule an action do be done with next call
             *
             * @param {String} action - the action name (ie. move, skip, timeout)
             * @param {Object} actionParams - the parameters sent along the action
             * @returns {Promise} resolves with the action data
             */
            this.scheduleAction = function scheduleAction(action, actionParams) {
                actionParams.actionId = action + '_' + (new Date()).getTime();
                return self.actiontStore.push(
                    action,
                    self.prepareParams(_.defaults(actionParams || {}, self.requestConfig))
                ).then(function () {
                    return {
                        action : action,
                        params : actionParams
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
             * @param {Boolean} deferred whether action can be scheduled (put into queue) to be sent in a bunch of actions later.
             * @returns {Promise} resolves with the action result
             */
            this.requestNetworkThenOffline = function requestNetworkThenOffline(url, action, actionParams, deferred){
                var testContext = this.getDataHolder().get('testContext');
                var communicationConfig = self.configStorage.getCommunicationConfig();

                //perform the request, but fallback on offline if the request itself fails
                var runRequestThenOffline = function runRequestThenOffline() {
                    var request;
                    if (communicationConfig.syncActions && communicationConfig.syncActions.indexOf(action) >= 0) {
                        request = self.processSyncAction(action, actionParams, deferred);
                    } else {
                        //action is not synchronizable
                        //fallback to direct request
                        request = self.request(url, actionParams);
                        request.then(function(result){
                            if (self.isOffline()) {
                                return self.scheduleAction(action, actionParams);
                            }
                            return result;
                        });
                    }

                    return request.then(function(result){
                        if (self.isOffline()) {
                            return self.offlineAction(action, actionParams);
                        }
                        return result;
                    }).catch(function(error){
                        if (self.isConnectivityError(error) && self.isOffline()) {
                            return self.offlineAction(action, actionParams);
                        }
                        throw error;
                    });
                };

                if (this.isOffline()) {
                    //try the telemetry action, just in case
                    return this
                        .telemetry(testContext.itemIdentifier, 'up')
                        .then(function(){
                            //if the up request succeed, we run the request
                            if (self.isOnline()) {
                                return runRequestThenOffline();
                            }
                            return self.scheduleAction(action, actionParams).then(function (){
                                return self.offlineAction(action, actionParams);
                            });
                        })
                        .catch(function(err){
                            if (self.isConnectivityError(err)) {
                                return self.scheduleAction(action, actionParams).then(function (){
                                    return self.offlineAction(action, actionParams);
                                });
                            }
                            throw err;
                        });
                }

                //by default we try to run the request first
                return runRequestThenOffline();
            };

            /**
             * Flush and synchronize actions collected while offline
             * @returns {Promise} resolves with the action result
             */
            this.syncData = function syncData(){
                var actions;
                return this.queue.serie(function(){
                    return self.actiontStore.flush().then(function(data){
                        actions = data;
                        if(data && data.length){
                            return self.send('sync', data);
                        }
                    })
                    .catch(function(err){
                        if (self.isConnectivityError(err)) {
                            self.setOffline('communicator');
                            _.forEach(actions, function (action) {
                                self.actiontStore.push(action.action, action.parameters);
                            });
                        }
                        throw err;
                    });
                });
            };

            /**
             * Flush the offline actions from the actionStore before reinserting them.
             * The exported copy can be used for file download.
             * The retained copy can still be synced as the test progresses.
             *
             * @returns {Promise} resolves with the store contents
             */
            this.exportActions = function exportActions() {
                var actions;
                return this.queue.serie(function(){
                    return self.actiontStore.flush().then(function(data){
                        actions = data;
                        _.forEach(actions, function (action) {
                            self.actiontStore.push(action.action, action.parameters);
                        });
                        return data;
                    });
                });
            };

            /**
             * Mark action as performed in offline mode
             * Action to mark as offline will be defined by actionParams.actionId parameter value.
             *
             * @param {Object} actionParams - the action parameters
             * @return {Promise}
             */
            this.markActionAsOffline = function markActionAsOffline(actionParams) {
                actionParams.offline = true;
                return this.queue.serie(function(){
                    return self.actiontStore.update(self.prepareParams(_.defaults(actionParams || {}, self.requestConfig)));
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

            if(!this.getDataHolder()){
                throw new Error('Unable to retrieve test runners data holder');
            }

            //those needs to be in each request params.
            this.requestConfig = _.pick(config, ['testDefinition', 'testCompilation', 'serviceCallId']);

            //set up the action store for the current service call
            this.actiontStore  = actionStoreFactory(config.serviceCallId);

            //we resync as soon as the connection is back
            this.on('reconnect', function(){
                return this.syncData().then(function(responses){
                    self.dataUpdater.update(responses);
                }).catch(function(err){
                    self.trigger('error', err);
                });
            });

            //if some actions remains unsynced
            this.syncData();

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
                var testMap = self.getDataHolder().get('testMap');

                var siblings = navigationHelper.getSiblingItems(testMap, itemIdentifier, 'both', self.getCacheAmount());
                var missing = _.reduce(siblings, function (list, sibling) {
                    if (!self.hasItem(sibling.id)) {
                        list.push(sibling.id);
                    }
                    return list;
                }, []);

                //don't run a request if not needed
                if (self.isOnline() && missing.length) {
                    _.delay(function(){
                        self.requestNetworkThenOffline(
                            self.configStorage.getTestActionUrl('getNextItemData'),
                            'getNextItemData',
                            { itemDefinition: missing },
                            false
                        ).then(function(response){
                            if (response && response.items) {
                                _.forEach(response.items, function (item) {
                                    if (item && item.itemIdentifier) {
                                        //store the response and start caching assets
                                        self.itemStore.set(item.itemIdentifier, item);
                                    }
                                });
                            }
                        }).catch(_.noop);

                    }, loadNextDelay);
                }
            };

            //resolve from the store
            if (this.getItemFromStore && this.itemStore.has(itemIdentifier)) {
                loadNextItem();

                return this.itemStore.get(itemIdentifier);
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
            var self = this;
            return this.itemStore.update(itemIdentifier, 'itemState', state)
                .then(function(){
                    return qtiServiceProxy.submitItem.call(self, itemIdentifier, state, response, params);
                });
        },


        /**
         * Sends the test variables
         * @param {Object} variables
         * @param {Boolean} deferred whether action can be scheduled (put into queue) to be sent in a bunch of actions later.
         * @returns {Promise} - Returns a promise. The result of the request will be provided on resolve.
         *                      Any error will be provided if rejected.
         * @fires sendVariables
         */
        sendVariables: function sendVariables(variables, deferred) {
            var action = 'storeTraceData';
            var actionParams = {
                traceData: JSON.stringify(variables)
            };

            return this.requestNetworkThenOffline(
                this.configStorage.getTestActionUrl(action),
                action,
                actionParams,
                deferred
            );
        },

        /**
         * Calls an action related to the test
         * @param {String} action - The name of the action to call
         * @param {Object} [params] - Some optional parameters to join to the call
         * @param {Boolean} deferred whether action can be scheduled (put into queue) to be sent in a bunch of actions later.
         * @returns {Promise} - Returns a promise. The result of the request will be provided on resolve.
         *                      Any error will be provided if rejected.
         */
        callTestAction: function callTestAction(action, params, deferred) {
            return this.requestNetworkThenOffline(
                this.configStorage.getTestActionUrl(action),
                action,
                params,
                deferred
            );
        },

        /**
         * Calls an action related to a particular item
         * @param {String} itemIdentifier - The identifier of the item for which call the action
         * @param {String} action - The name of the action to call
         * @param {Object} [params] - Some optional parameters to join to the call
         * @param {Boolean} deferred whether action can be scheduled (put into queue) to be sent in a bunch of actions later.
         * @returns {Promise} - Returns a promise. The result of the request will be provided on resolve.
         *                      Any error will be provided if rejected.
         */
        callItemAction: function callItemAction(itemIdentifier, action, params, deferred) {
            var self = this;
            var updateStatePromise = Promise.resolve();
            var testMap = this.getDataHolder().get('testMap');

            //update the item state
            if(params.itemState){
                updateStatePromise = this.itemStore.update(itemIdentifier, 'itemState', params.itemState);
            }

            //check if we have already the item for the action we are going to perform
            self.getItemFromStore = (
                (navigationHelper.isMovingToNextItem(action, params) && self.hasNextItem(itemIdentifier)) ||
                (navigationHelper.isMovingToPreviousItem(action, params) && self.hasPreviousItem(itemIdentifier)) ||
                (navigationHelper.isJumpingToItem(action, params) && self.hasItem(mapHelper.getItemIdentifier(testMap,  params.ref)))
            );

            //If item action is move to another item ensure the next request will start the timer
            if (navigationHelper.isMovingToNextItem(action, params) ||
                navigationHelper.isMovingToPreviousItem(action, params) ||
                navigationHelper.isJumpingToItem(action, params)
            ) {
                params.start = true;
            }

            return updateStatePromise.then(function(){
                return self.requestNetworkThenOffline(
                    self.configStorage.getItemActionUrl(itemIdentifier, action),
                    action,
                    _.merge({ itemDefinition : itemIdentifier }, params),
                    deferred
                );
            });
        }
    }, qtiServiceProxy);
});
