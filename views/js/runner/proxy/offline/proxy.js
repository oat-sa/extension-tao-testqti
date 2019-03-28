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
    'lodash',
    'i18n',
    'core/promise',
    'taoQtiTest/runner/navigator/offlineNavigator',
    'taoQtiTest/runner/helpers/map',
    'taoQtiTest/runner/helpers/navigation',
    'taoQtiTest/runner/provider/dataUpdater',
    'taoQtiTest/runner/proxy/qtiServiceProxy',
    'taoQtiTest/runner/proxy/cache/itemStore',
    'taoQtiTest/runner/proxy/cache/actionStore',
    'taoQtiTest/runner/helpers/offlineErrorHelper',
    'taoQtiTest/runner/helpers/offlineSyncModal',
    'util/download'
], function(
    _,
    __,
    Promise,
    offlineNavigatorFactory,
    mapHelper,
    navigationHelper,
    dataUpdater,
    qtiServiceProxy,
    itemStoreFactory,
    actionStoreFactory,
    offlineErrorHelper,
    offlineSyncModal,
    download
) {
    'use strict';

    /**
     * Overrides the qtiServiceProxy with the offline behavior
     * @extends taoQtiTest/runner/proxy/qtiServiceProxy
     */
    return _.defaults({

        /**
         * Installs the proxy
         */
        install: function install(config) {
            var self = this;

            // install the parent proxy
            qtiServiceProxy.install.call(this);

            // we keep items here
            this.itemStore = itemStoreFactory({
                preload : true,
                testId  : config.serviceCallId
            });

            this.offlineNavigator = offlineNavigatorFactory(this.itemStore);

            // where we keep actions
            this.actionStore = null;

            // configuration params, that comes on every request/params
            this.requestConfig = {};

            // scheduled action promises which supposed to be resolved after action synchronization.
            this.actionPromises = {};

            // let's you update test data (testData, testContext and testMap)
            this.dataUpdater = dataUpdater(this.getDataHolder());

            /**
             * Check whether we have the item in the store
             *
             * @param {String} itemIdentifier - the item identifier
             * @returns {Boolean}
             */
            this.hasItem = function hasItem(itemIdentifier) {
                return itemIdentifier && self.itemStore.has(itemIdentifier);
            };

            /**
             * Check whether we have the next item in the store
             *
             * @param {String} itemIdentifier - the CURRENT item identifier
             * @returns {Boolean}
             */
            this.hasNextItem = function hasNextItem(itemIdentifier) {
                var sibling = navigationHelper.getNextItem(this.getDataHolder().get('testMap'), itemIdentifier);

                return sibling && self.hasItem(sibling.id);
            };

            /**
             * Check whether we have the previous item in the store
             *
             * @param {String} itemIdentifier - the CURRENT item identifier
             * @returns {Boolean}
             */
            this.hasPreviousItem = function hasPreviousItem(itemIdentifier) {
                var sibling = navigationHelper.getPreviousItem(this.getDataHolder().get('testMap'), itemIdentifier);

                return sibling && self.hasItem(sibling.id);
            };

            /**
             * Offline navigation
             *
             * @param {String} action - the action name (ie. move, skip, timeout)
             * @param {Object} actionParams - the parameters sent along the action
             * @returns {Object} action result
             */
            this.offlineAction = function offlineAction(action, actionParams) {
                return new Promise(function(resolve) {
                    var newTestContext,
                        result = { success: true },
                        blockingActions = ['exitTest', 'timeout'],
                        dataHolder = self.getDataHolder(),
                        testData = dataHolder.get('testData'),
                        testContext = dataHolder.get('testContext'),
                        testMap = dataHolder.get('testMap'),
                        offlinePauseErrorData = offlineErrorHelper.getOfflinePauseError();

                    if (action === 'pause') {
                        if (actionParams.reason) {
                            offlinePauseErrorData.data = _.merge(offlinePauseErrorData.data, {
                                reason: actionParams.reason
                            });
                        }

                        _.assign(new Error(offlinePauseErrorData.message), offlinePauseErrorData.data);
                    }

                    if (
                        _.contains(blockingActions, action)
                        || (
                            (
                                actionParams.direction === 'next'
                                || action === 'skip'
                            )
                            && navigationHelper.isLast(testMap, testContext.itemIdentifier)
                        )
                    ) {
                        result.testContext = {
                            state: testData.states.closed
                        };

                        if (self.isOffline()) {
                            return new Promise(function() {
                                offlineSyncModal(self)
                                    .on('proceed', function() {
                                        self.syncData()
                                            .then(function() {
                                                return resolve(result);
                                            })
                                            .catch(function() {
                                                return resolve({ success: false });
                                            });
                                    })
                                    .on('secondaryaction', function() {
                                        self.initiateDownload()
                                            .catch(function() {
                                                return resolve({ success: false });
                                            });
                                    });
                            }).catch(function() {
                                return resolve({ success: false });
                            });
                        } else {
                            return self.syncData().then(function() {
                                return resolve(result);
                            }).catch(function() {
                                return resolve({ success: false });
                            });
                        }
                    }

                    if (action === 'skip') {
                        actionParams.direction = action;
                    }

                    // try the navigation if the actionParams context meaningful data
                    if (actionParams.direction && actionParams.scope) {
                        self.offlineNavigator
                            .setTestData(testData)
                            .setTestContext(testContext)
                            .setTestMap(testMap)
                            .init()
                            .navigate(
                                actionParams.direction,
                                actionParams.scope,
                                actionParams.ref,
                                actionParams
                            ).then(function(res) {
                                newTestContext = res;

                                if (
                                    !newTestContext
                                    || !newTestContext.itemIdentifier
                                    || !self.hasItem(newTestContext.itemIdentifier)
                                ) {
                                    _.assign(
                                        new Error(offlineErrorHelper.getOfflineNavError().message),
                                        offlineErrorHelper.getOfflineNavError().data
                                    );
                                }

                                result.testContext = newTestContext;

                                resolve(result);
                            });
                    } else {
                        resolve(result);
                    }
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
                actionParams = _.assign(actionParams, {
                    actionId: action + '_' + (new Date()).getTime(),
                    offline: true
                });

                return self.actionStore.push(
                    action,
                    self.prepareParams(_.defaults(actionParams || {}, self.requestConfig))
                ).then(function() {
                    return {
                        action: action,
                        params: actionParams
                    };
                });
            };

            /**
             * Flush and synchronize actions collected while offline
             *
             * @returns {Promise} resolves with the action result
             */
            this.syncData = function syncData() {
                var actions;

                return this.queue.serie(function() {
                    return self.actionStore
                        .flush()
                        .then(function(data) {
                            actions = data;
                            if (data && data.length) {
                                return self.send('sync', data);
                            }
                        })
                        .catch(function(err) {
                            if (self.isConnectivityError(err)) {
                                self.setOffline('communicator');
                                _.forEach(actions, function (action) {
                                    self.actionStore.push(action.action, action.parameters);
                                });
                            }

                            throw err;
                        });
                });
            };

            this.prepareDownload = function prepareDownload(actions) {
                var timestamp = Date.now();
                var dateTime = new Date(timestamp).toISOString();
                var testData = self.getDataHolder().get('testData');
                var testId = testData.title;
                var niceFilename = 'Download of ' + testId + ' at ' + dateTime + '.json';

                return {
                    filename: niceFilename,
                    content: JSON.stringify({
                        timestamp: timestamp,
                        testData: testData,
                        actionQueue: actions
                    })
                };
            };

            this.initiateDownload = function initiateDownload() {
                return this.queue.serie(function() {
                    return self.actionStore
                        .flush()
                        .then(function(actions) {
                            _.forEach(actions, function (action) {
                                self.actionStore.push(action.action, action.parameters);
                            });

                            return actions;
                        })
                        .then(self.prepareDownload)
                        .then(function(data) {
                            return download(data.filename, data.content);
                        });
                });
            };
        },

        /**
         * Initializes the proxy
         *
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

            // run the init
            var InitCallPromise = qtiServiceProxy.init.call(this, config, params);

            if (!this.getDataHolder()) {
                throw new Error('Unable to retrieve test runners data holder');
            }

            // those needs to be in each request params.
            this.requestConfig = _.pick(config, ['testDefinition', 'testCompilation', 'serviceCallId']);

            // set up the action store for the current service call
            this.actionStore = actionStoreFactory(config.serviceCallId);

            return InitCallPromise.then(function(response) {
                var promises = [];

                self.itemStore.setCacheSize(Object.keys(response.items).length);

                Object.keys(response.items).forEach(function(itemIdentifier) {
                    promises.push(self.itemStore.set(itemIdentifier, response.items[itemIdentifier]));
                });

                return Promise
                    .all(promises)
                    .then(function() {
                        return new Promise(function(resolve) {
                            resolve(response);
                        });
                    });
            });
        },

        /**
         * Uninstalls the proxy
         *
         * @returns {Promise} - Returns a promise. The proxy will be fully uninstalled on resolve.
         *                      Any error will be provided if rejected.
         */
        destroy: function destroy() {
            this.itemStore.clear();

            return qtiServiceProxy.destroy.call(this);
        },

        /**
         * Gets an item definition by its identifier, also gets its current state
         *
         * @param {String} itemIdentifier
         * @returns {Promise} - Returns a promise. The item data will be provided on resolve.
         *                      Any error will be provided if rejected.
         */
        getItem: function getItem(itemIdentifier) {
            return this.itemStore.get(itemIdentifier);
        },

        /**
         * Submits the state and the response of a particular item
         *
         * @param {String} itemIdentifier - The identifier of the item to update
         * @param {Object} state - The state to submit
         * @param {Object} response - The response object to submit
         * @param {Object} [params] - Some optional parameters to join to the call
         * @returns {Promise} - Returns a promise. The result of the request will be provided on resolve.
         *                      Any error will be provided if rejected.
         */
        submitItem: function submitItem(itemIdentifier, state, response, params) {
            var self = this;

            return this.itemStore
                .update(itemIdentifier, 'itemState', state)
                .then(function() {
                    return qtiServiceProxy.submitItem.call(self, itemIdentifier, state, response, params);
                });
        },


        /**
         * Sends the test variables
         *
         * @param {Object} variables
         * @returns {Promise} - Returns a promise. The result of the request will be provided on resolve.
         *                      Any error will be provided if rejected.
         * @fires sendVariables
         */
        sendVariables: function sendVariables(variables) {
            var self = this,
                action = 'storeTraceData',
                actionParams = { traceData: JSON.stringify(variables) };

            return self
                .scheduleAction(action, actionParams)
                .then(function() {
                    return self.offlineAction(action, actionParams);
                });
        },

        /**
         * Calls an action related to the test
         *
         * @param {String} action - The name of the action to call
         * @param {Object} [params] - Some optional parameters to join to the call
         * @returns {Promise} - Returns a promise. The result of the request will be provided on resolve.
         *                      Any error will be provided if rejected.
         */
        callTestAction: function callTestAction(action, params) {
            var self = this;

            return self
                .scheduleAction(action, params)
                .then(function() {
                    return self.offlineAction(action, params);
                });
        },

        /**
         * Calls an action related to a particular item
         *
         * @param {String} itemIdentifier - The identifier of the item for which call the action
         * @param {String} action - The name of the action to call
         * @param {Object} [params] - Some optional parameters to join to the call
         * @returns {Promise} - Returns a promise. The result of the request will be provided on resolve.
         *                      Any error will be provided if rejected.
         */
        callItemAction: function callItemAction(itemIdentifier, action, params) {
            var self = this,
                updateStatePromise = Promise.resolve();

            console.log('itemAction', itemIdentifier, action, params);

            //update the item state
            if (params.itemState) {
                updateStatePromise = this.itemStore.update(itemIdentifier, 'itemState', params.itemState);
            }

            // If item action is move to another item ensure the next request will start the timer
            if (navigationHelper.isMovingToNextItem(action, params)
                || navigationHelper.isMovingToPreviousItem(action, params)
                || navigationHelper.isJumpingToItem(action, params)
            ) {
                params.start = true;
            }

            return updateStatePromise
                .then(function() {
                    params = _.assign({ itemDefinition: itemIdentifier }, params);

                    return self
                        .scheduleAction(action, params)
                        .then(function() {
                            return self.offlineAction(action, params);
                        });
                })
                .catch(function(err) {
                    console.log('update failed', err);
                });
        }
    }, qtiServiceProxy);
});
