define(['lodash', 'taoQtiTest/runner/navigator/navigator', 'taoQtiTest/runner/helpers/map', 'taoQtiTest/runner/helpers/navigation', 'taoQtiTest/runner/provider/dataUpdater', 'taoQtiTest/runner/proxy/qtiServiceProxy', 'taoQtiTest/runner/proxy/cache/itemStore', 'taoQtiTest/runner/proxy/cache/actionStore', 'taoQtiTest/runner/helpers/offlineErrorHelper'], function (_, testNavigatorFactory, mapHelper, navigationHelper, dataUpdater, qtiServiceProxy, itemStoreFactory, actionStoreFactory, offlineErrorHelper) { 'use strict';

    _ = _ && Object.prototype.hasOwnProperty.call(_, 'default') ? _['default'] : _;
    testNavigatorFactory = testNavigatorFactory && Object.prototype.hasOwnProperty.call(testNavigatorFactory, 'default') ? testNavigatorFactory['default'] : testNavigatorFactory;
    mapHelper = mapHelper && Object.prototype.hasOwnProperty.call(mapHelper, 'default') ? mapHelper['default'] : mapHelper;
    navigationHelper = navigationHelper && Object.prototype.hasOwnProperty.call(navigationHelper, 'default') ? navigationHelper['default'] : navigationHelper;
    dataUpdater = dataUpdater && Object.prototype.hasOwnProperty.call(dataUpdater, 'default') ? dataUpdater['default'] : dataUpdater;
    qtiServiceProxy = qtiServiceProxy && Object.prototype.hasOwnProperty.call(qtiServiceProxy, 'default') ? qtiServiceProxy['default'] : qtiServiceProxy;
    itemStoreFactory = itemStoreFactory && Object.prototype.hasOwnProperty.call(itemStoreFactory, 'default') ? itemStoreFactory['default'] : itemStoreFactory;
    actionStoreFactory = actionStoreFactory && Object.prototype.hasOwnProperty.call(actionStoreFactory, 'default') ? actionStoreFactory['default'] : actionStoreFactory;
    offlineErrorHelper = offlineErrorHelper && Object.prototype.hasOwnProperty.call(offlineErrorHelper, 'default') ? offlineErrorHelper['default'] : offlineErrorHelper;

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
     * Copyright (c) 2017-2021 Open Assessment Technologies SA
     */
    /**
     * The number of items to keep in the cache
     * @type {number}
     * @private
     */

    var cacheSize = 20;
    /**
     * The number of ms to wait after an item is loaded
     * to start loading the next.
     * This value is more or less the time needed to render an item.
     * @type {number}
     * @private
     */

    var loadNextDelay = 450;
    /**
     * The default TimeToLive for assets resolving, in seconds.
     * Each item comes with a baseUrl that may have a TTL bound to it.
     * Once this TTL is expired, the assets won't be reachable.
     * For this reason, we need to remove from the cache items having an expired TTL.
     * @type {number}
     * @private
     */

    var defaultItemTTL = 15 * 60;
    /**
     * Overrides the qtiServiceProxy with the precaching behavior
     * @extends taoQtiTest/runner/proxy/qtiServiceProxy
     */

    var proxy = _.defaults({
      name: 'precaching',

      /**
       * Installs the proxy
       * @param {object} config
       */
      install: function install(config) {
        var _this = this;

        //install the parent proxy
        qtiServiceProxy.install.call(this);
        /**
         * Gets the value of an item caching option. All values are numeric only.
         * @param {string} name
         * @param {number} defaultValue
         * @returns {number}
         */

        var getItemCachingOption = function getItemCachingOption(name, defaultValue) {
          if (config && config.options && config.options.itemCaching) {
            return parseInt(config.options.itemCaching[name], 10) || defaultValue;
          }

          return defaultValue;
        }; //we keep items here


        this.itemStore = itemStoreFactory({
          itemTTL: defaultItemTTL * 1000,
          maxSize: cacheSize,
          preload: true,
          testId: config.serviceCallId
        }); //where we keep actions

        this.actiontStore = null; //can we load the next item from the cache/store ?

        this.getItemFromStore = false; //configuration params, that comes on every request/params

        this.requestConfig = {}; //scheduled action promises which supposed to be resolved after action synchronization.

        this.actionPromises = {}; //scheduled action reject promises which supposed to be rejected in case of failed synchronization.

        this.actionRejectPromises = {}; //let's you update test data (testContext and testMap)

        this.dataUpdater = dataUpdater(this.getDataHolder());
        /**
         * Get the item cache size from the test data
         * @returns {number} the cache size
         */

        this.getCacheAmount = function () {
          return getItemCachingOption('amount', 1);
        };
        /**
         * Get the item store TimeToLive
         * @returns {number} the item store TTL
         */


        this.getItemTTL = function () {
          return getItemCachingOption('itemStoreTTL', defaultItemTTL) * 1000;
        };
        /**
         * Check whether we have the item in the store
         * @param {string} itemIdentifier - the item identifier
         * @returns {boolean}
         */


        this.hasItem = function (itemIdentifier) {
          return itemIdentifier && _this.itemStore.has(itemIdentifier);
        };
        /**
         * Check whether we have the next item in the store
         * @param {string} itemIdentifier - the CURRENT item identifier
         * @returns {boolean}
         */


        this.hasNextItem = function (itemIdentifier) {
          var sibling = navigationHelper.getNextItem(_this.getDataHolder().get('testMap'), itemIdentifier);
          return sibling && _this.hasItem(sibling.id);
        };
        /**
         * Check whether we have the previous item in the store
         * @param {string} itemIdentifier - the CURRENT item identifier
         * @returns {boolean}
         */


        this.hasPreviousItem = function (itemIdentifier) {
          var sibling = navigationHelper.getPreviousItem(_this.getDataHolder().get('testMap'), itemIdentifier);
          return sibling && _this.hasItem(sibling.id);
        };
        /**
         * Offline ? We try to navigate offline, or just say 'ok'
         *
         * @param {string} action - the action name (ie. move, skip, timeout)
         * @param {object} actionParams - the parameters sent along the action
         * @returns {object} action result
         */


        this.offlineAction = function (action, actionParams) {
          var result = {
            success: true
          };
          var blockingActions = ['exitTest', 'timeout'];

          var testContext = _this.getDataHolder().get('testContext');

          var testMap = _this.getDataHolder().get('testMap');

          if (action === 'pause') {
            throw offlineErrorHelper.buildErrorFromContext(offlineErrorHelper.getOfflinePauseError(), {
              reason: actionParams.reason
            });
          } //we just block those actions and the end of the test


          if (_.contains(blockingActions, action) || actionParams.direction === 'next' && navigationHelper.isLast(testMap, testContext.itemIdentifier)) {
            throw offlineErrorHelper.buildErrorFromContext(offlineErrorHelper.getOfflineExitError());
          } // try the navigation if the actionParams context meaningful data


          if (actionParams.direction && actionParams.scope) {
            var testNavigator = testNavigatorFactory(testContext, testMap);
            var newTestContext = testNavigator.navigate(actionParams.direction, actionParams.scope, actionParams.ref); //we are really not able to navigate

            if (!newTestContext || !newTestContext.itemIdentifier || !_this.hasItem(newTestContext.itemIdentifier)) {
              throw offlineErrorHelper.buildErrorFromContext(offlineErrorHelper.getOfflineNavError());
            }

            result.testContext = newTestContext;
          }

          _this.markActionAsOffline(actionParams);

          return result;
        };
        /**
         * Process action which should be sent using message channel.
         *
         * @param {string} action
         * @param {object} actionParams
         * @param {boolean} deferred
         *
         * @returns {Promise} resolves with the action result
         */


        this.processSyncAction = function (action, actionParams, deferred) {
          return new Promise(function (resolve, reject) {
            _this.scheduleAction(action, actionParams).then(function (actionData) {
              _this.actionPromises[actionData.params.actionId] = resolve;
              _this.actionRejectPromises[actionData.params.actionId] = reject;

              if (!deferred) {
                _this.syncData().then(function (result) {
                  if (_this.isOnline()) {
                    _.forEach(result, function (actionResult) {
                      var actionId = actionResult.requestParameters && actionResult.requestParameters.actionId ? actionResult.requestParameters.actionId : null;

                      if (!actionResult.success && _this.actionRejectPromises[actionId]) {
                        var error = new Error(actionResult.message);
                        error.unrecoverable = true;
                        return reject(error);
                      }

                      if (actionId && _this.actionPromises[actionId]) {
                        _this.actionPromises[actionId](actionResult);
                      }
                    });
                  }
                }).catch(reject);
              }
            }).catch(reject);
          });
        };
        /**
         * Schedule an action do be done with next call
         *
         * @param {string} action - the action name (ie. move, skip, timeout)
         * @param {object} params - the parameters sent along the action
         * @returns {Promise} resolves with the action data
         */


        this.scheduleAction = function (action, params) {
          params.actionId = "".concat(action, "_").concat(new Date().getTime());
          return _this.actiontStore.push(action, _this.prepareParams(_.defaults(params || {}, _this.requestConfig))).then(function () {
            return {
              action: action,
              params: params
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
         * @param {string} url
         * @param {string} action - the action name (ie. move, skip, timeout)
         * @param {object} actionParams - the parameters sent along the action
         * @param {boolean} deferred whether action can be scheduled (put into queue) to be sent in a bunch of actions later.
         * @param {boolean} noToken whether the request should be sent with a CSRF token or not
         *
         * @returns {Promise} resolves with the action result
         */


        this.requestNetworkThenOffline = function (url, action, actionParams, deferred, noToken) {
          var testContext = _this.getDataHolder().get('testContext');

          var communicationConfig = _this.configStorage.getCommunicationConfig(); //perform the request, but fallback on offline if the request itself fails


          var runRequestThenOffline = function runRequestThenOffline() {
            var request;

            if (communicationConfig.syncActions && communicationConfig.syncActions.indexOf(action) >= 0) {
              request = _this.processSyncAction(action, actionParams, deferred);
            } else {
              //action is not synchronizable
              //fallback to direct request
              request = _this.request(url, actionParams, void 0, noToken || false);
              request.then(function (result) {
                if (_this.isOffline()) {
                  return _this.scheduleAction(action, actionParams);
                }

                return result;
              });
            }

            return request.then(function (result) {
              if (_this.isOffline()) {
                return _this.offlineAction(action, actionParams);
              }

              return result;
            }).catch(function (error) {
              if (_this.isConnectivityError(error) && _this.isOffline()) {
                return _this.offlineAction(action, actionParams);
              }

              throw error;
            });
          };

          if (_this.isOffline()) {
            //try the telemetry action, just in case
            return _this.telemetry(testContext.itemIdentifier, 'up').then(function () {
              //if the up request succeed, we run the request
              if (_this.isOnline()) {
                return runRequestThenOffline();
              }

              return _this.scheduleAction(action, actionParams).then(function () {
                return _this.offlineAction(action, actionParams);
              });
            }).catch(function (err) {
              if (_this.isConnectivityError(err)) {
                return _this.scheduleAction(action, actionParams).then(function () {
                  return _this.offlineAction(action, actionParams);
                });
              }

              throw err;
            });
          } //by default we try to run the request first


          return runRequestThenOffline();
        };
        /**
         * Flush and synchronize actions collected while offline
         * @returns {Promise} resolves with the action result
         */


        this.syncData = function () {
          return _this.queue.serie(function () {
            return _this.actiontStore.flush().then(function (data) {
              if (data && data.length) {
                return _this.send('sync', data);
              }
            }).catch(function (err) {
              if (_this.isConnectivityError(err)) {
                _this.setOffline('communicator');

                _.forEach(data, function (action) {
                  _this.actiontStore.push(action.action, action.parameters);
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


        this.exportActions = function () {
          return _this.queue.serie(function () {
            return _this.actiontStore.flush().then(function (data) {
              _.forEach(data, function (action) {
                _this.actiontStore.push(action.action, action.parameters);
              });

              return data;
            });
          });
        };
        /**
         * Mark action as performed in offline mode
         * Action to mark as offline will be defined by actionParams.actionId parameter value.
         *
         * @param {object} actionParams - the action parameters
         * @returns {Promise}
         */


        this.markActionAsOffline = function (actionParams) {
          actionParams.offline = true;
          return _this.queue.serie(function () {
            return _this.actiontStore.update(_this.prepareParams(_.defaults(actionParams || {}, _this.requestConfig)));
          });
        };
      },

      /**
       * Initializes the proxy
       * @param {object} config - The config provided to the proxy factory
       * @param {string} config.testDefinition - The URI of the test
       * @param {string} config.testCompilation - The URI of the compiled delivery
       * @param {string} config.serviceCallId - The URI of the service call
       * @param {object} [params] - Some optional parameters to join to the call
       * @returns {Promise} - Returns a promise. The proxy will be fully initialized on resolve.
       *                      Any error will be provided if rejected.
       */
      init: function init(config, params) {
        if (!this.getDataHolder()) {
          throw new Error('Unable to retrieve test runners data holder');
        } //those needs to be in each request params.


        this.requestConfig = _.pick(config, ['testDefinition', 'testCompilation', 'serviceCallId']); //set up the action store for the current service call

        this.actiontStore = actionStoreFactory(config.serviceCallId); //we resynchronise as soon as the connection is back

        this.on('reconnect', function () {
          var _this2 = this;

          return this.syncData().then(function (responses) {
            _this2.dataUpdater.update(responses);
          }).catch(function (err) {
            _this2.trigger('error', err);
          });
        }); //if some actions remains not synchronized

        this.syncData(); //run the init

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
       * @param {string} itemIdentifier - The identifier of the item to get
       * @param {object} [params] - additional parameters
       * @returns {Promise} - Returns a promise. The item data will be provided on resolve.
       *                      Any error will be provided if rejected.
       */
      getItem: function getItem(itemIdentifier, params) {
        var _this3 = this;

        // remove the expired entries from the cache
        // prune anyway, if an issue occurs it should not prevent the remaining process to happen
        var pruneStore = function pruneStore() {
          return _this3.itemStore.prune().catch(_.noop);
        };
        /**
         * try to load the next items
         */


        var loadNextItem = function loadNextItem() {
          var testMap = _this3.getDataHolder().get('testMap');

          var siblings = navigationHelper.getSiblingItems(testMap, itemIdentifier, 'both', _this3.getCacheAmount());

          var missing = _.reduce(siblings, function (list, sibling) {
            if (!_this3.hasItem(sibling.id)) {
              list.push(sibling.id);
            }

            return list;
          }, []); //don't run a request if not needed


          if (_this3.isOnline() && missing.length) {
            _.delay(function () {
              _this3.requestNetworkThenOffline(_this3.configStorage.getTestActionUrl('getNextItemData'), 'getNextItemData', {
                itemDefinition: missing
              }, false, true).then(function (response) {
                if (response && response.items) {
                  return pruneStore().then(function () {
                    _.forEach(response.items, function (item) {
                      if (item && item.itemIdentifier) {
                        //store the response and start caching assets
                        _this3.itemStore.set(item.itemIdentifier, item);
                      }
                    });
                  });
                }
              }).catch(_.noop);
            }, loadNextDelay);
          }
        }; // the additional proxy options are supplied after the 'init' phase as a result of the `init` action,
        // we need to apply them later


        this.itemStore.setItemTTL(this.getItemTTL()); //resolve from the store

        if (this.getItemFromStore && this.itemStore.has(itemIdentifier)) {
          loadNextItem();
          return this.itemStore.get(itemIdentifier);
        }

        return this.request(this.configStorage.getItemActionUrl(itemIdentifier, 'getItem'), params, void 0, true).then(function (response) {
          if (response && response.success) {
            pruneStore().then(function () {
              return _this3.itemStore.set(itemIdentifier, response);
            });
          }

          loadNextItem();
          return response;
        });
      },

      /**
       * Submits the state and the response of a particular item
       * @param {string} itemIdentifier - The identifier of the item to update
       * @param {object} state - The state to submit
       * @param {object} response - The response object to submit
       * @param {object} [params] - Some optional parameters to join to the call
       * @returns {Promise} - Returns a promise. The result of the request will be provided on resolve.
       *                      Any error will be provided if rejected.
       */
      submitItem: function submitItem(itemIdentifier, state, response, params) {
        var _this4 = this;

        return this.itemStore.update(itemIdentifier, 'itemState', state).then(function () {
          return qtiServiceProxy.submitItem.call(_this4, itemIdentifier, state, response, params);
        });
      },

      /**
       * Sends the test variables
       * @param {object} variables
       * @param {boolean} deferred whether action can be scheduled (put into queue) to be sent in a bunch of actions later.
       * @returns {Promise} - Returns a promise. The result of the request will be provided on resolve.
       *                      Any error will be provided if rejected.
       * @fires sendVariables
       */
      sendVariables: function sendVariables(variables, deferred) {
        var action = 'storeTraceData';
        var actionParams = {
          traceData: JSON.stringify(variables)
        };
        return this.requestNetworkThenOffline(this.configStorage.getTestActionUrl(action), action, actionParams, deferred);
      },

      /**
       * Calls an action related to the test
       * @param {string} action - The name of the action to call
       * @param {object} [params] - Some optional parameters to join to the call
       * @param {boolean} deferred whether action can be scheduled (put into queue) to be sent in a bunch of actions later.
       * @returns {Promise} - Returns a promise. The result of the request will be provided on resolve.
       *                      Any error will be provided if rejected.
       */
      callTestAction: function callTestAction(action, params, deferred) {
        return this.requestNetworkThenOffline(this.configStorage.getTestActionUrl(action), action, params, deferred);
      },

      /**
       * Calls an action related to a particular item
       * @param {string} itemIdentifier - The identifier of the item for which call the action
       * @param {string} action - The name of the action to call
       * @param {object} [params] - Some optional parameters to join to the call
       * @param {boolean} deferred whether action can be scheduled (put into queue) to be sent in a bunch of actions later.
       * @returns {Promise} - Returns a promise. The result of the request will be provided on resolve.
       *                      Any error will be provided if rejected.
       */
      callItemAction: function callItemAction(itemIdentifier, action, params, deferred) {
        var _this5 = this;

        var updateStatePromise = Promise.resolve();
        var testMap = this.getDataHolder().get('testMap'); //update the item state

        if (params.itemState) {
          updateStatePromise = this.itemStore.update(itemIdentifier, 'itemState', params.itemState);
        } //check if we have already the item for the action we are going to perform


        this.getItemFromStore = navigationHelper.isMovingToNextItem(action, params) && this.hasNextItem(itemIdentifier) || navigationHelper.isMovingToPreviousItem(action, params) && this.hasPreviousItem(itemIdentifier) || navigationHelper.isJumpingToItem(action, params) && this.hasItem(mapHelper.getItemIdentifier(testMap, params.ref)); //If item action is move to another item ensure the next request will start the timer

        if (navigationHelper.isMovingToNextItem(action, params) || navigationHelper.isMovingToPreviousItem(action, params) || navigationHelper.isJumpingToItem(action, params)) {
          params.start = true;
        }

        return updateStatePromise.then(function () {
          return _this5.requestNetworkThenOffline(_this5.configStorage.getItemActionUrl(itemIdentifier, action), action, _.merge({
            itemDefinition: itemIdentifier
          }, params), deferred);
        });
      }
    }, qtiServiceProxy);

    return proxy;

});
