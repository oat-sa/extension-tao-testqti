define(['lodash', 'taoTests/runner/testStore'], function (_, testStore) { 'use strict';

    _ = _ && Object.prototype.hasOwnProperty.call(_, 'default') ? _['default'] : _;
    testStore = testStore && Object.prototype.hasOwnProperty.call(testStore, 'default') ? testStore['default'] : testStore;

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
    var storeName = 'actions';
    var storeKey = 'queue';
    /**
     * Create an action store
     *
     * @param {String} id - the store id, to identify a test
     * @returns {actionStore}
     */

    function actionStoreFatory(id) {
      var actionQueue = [];
      /**
       * Load the store from the testStore
       * @returns {Promise<storage>} the storage instance
       */

      var loadStore = function loadStore() {
        return testStore(id).getStore(storeName);
      };

      if (_.isEmpty(id)) {
        throw new TypeError('Please specify the action store id');
      }
      /**
       * @typedef {actionStore}
       */


      return {
        /**
         * Push an action to the store
         * @param {String} action - the action name
         * @param {Object} params - the action parameters
         * @returns {Promise} resolves when the action is stored
         */
        push: function push(action, params, timestamp) {
          actionQueue.push({
            action: action,
            timestamp: timestamp || Date.now(),
            parameters: params
          });
          return loadStore().then(function (actionStore) {
            return actionStore.setItem(storeKey, actionQueue);
          });
        },

        /**
         * Flush the action store and retrieve the data
         * @returns {Promise} resolves with the flushed data
         */
        flush: function flush() {
          return loadStore().then(function (actionStore) {
            return actionStore.getItem(storeKey).then(function (queue) {
              actionQueue = [];
              return actionStore.setItem(storeKey, actionQueue).then(function () {
                return queue;
              });
            });
          });
        },

        /**
         * Update action parameters. Action to update will be defined by params.actionId parameter value.
         * @param {Object} params - the action parameters
         * @returns {Promise} resolves when the action is stored
         */
        update: function update(params) {
          _.forEach(actionQueue, function (action) {
            if (action.parameters.actionId === params.actionId) {
              action.parameters = params;
            }
          });

          return loadStore().then(function (actionStore) {
            return actionStore.setItem(storeKey, actionQueue);
          });
        }
      };
    }

    return actionStoreFatory;

});
