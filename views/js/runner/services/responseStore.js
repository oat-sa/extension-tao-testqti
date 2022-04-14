define(['lodash', 'core/store'], function (_, store) { 'use strict';

    _ = _ && Object.prototype.hasOwnProperty.call(_, 'default') ? _['default'] : _;
    store = store && Object.prototype.hasOwnProperty.call(store, 'default') ? store['default'] : store;

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
    var defaultConfig = {
      responseStoreName: 'response',
      correctResponseStoreName: 'correct-response'
    };
    /**
     * @param {Object} options
     * @param {string} options.responseStoreName
     * @param {string} options.correctResponseStoreName
     */

    function responseStoreFactory(options) {
      var config = _.defaults(options || {}, defaultConfig);
      /**
       * @returns {Promise}
       */


      var getResponseStore = function getResponseStore() {
        return store(config.responseStoreName, store.backends.memory);
      };
      /**
       * @returns {Promise}
       */


      var getCorrectResponseStore = function getCorrectResponseStore() {
        return store(config.correctResponseStoreName, store.backends.memory);
      };

      return {
        /**
         * @returns {Promise}
         */
        getResponses: function getResponses() {
          return getResponseStore().then(function (storage) {
            return storage.getItems();
          });
        },

        /**
         * @returns {Promise}
         */
        getCorrectResponses: function getCorrectResponses() {
          return getCorrectResponseStore().then(function (storage) {
            return storage.getItems();
          });
        },

        /**
         * @param {string} key
         * @returns {Promise}
         */
        getResponse: function getResponse(key) {
          return getResponseStore().then(function (storage) {
            return storage.getItem(key);
          });
        },

        /**
         * @param {string} key
         * @returns {Promise}
         */
        getCorrectResponse: function getCorrectResponse(key) {
          return getCorrectResponseStore().then(function (storage) {
            return storage.getItem(key).then(function (result) {
              return new Promise(function (resolve) {
                if (typeof result === 'undefined') {
                  return resolve([]);
                }

                return resolve(result);
              });
            });
          });
        },

        /**
         * @param {string} key
         * @param {string} value
         * @returns {Promise}
         */
        addResponse: function addResponse(key, value) {
          return getResponseStore().then(function (storage) {
            return storage.setItem(key, value).then(function (updated) {
              return updated;
            });
          });
        },

        /**
         * @param {string} key
         * @param {string[]} value
         * @returns {Promise}
         */
        addCorrectResponse: function addCorrectResponse(key, value) {
          return getCorrectResponseStore().then(function (storage) {
            return storage.setItem(key, value).then(function (updated) {
              return updated;
            });
          });
        },

        /**
         * @returns {Promise}
         */
        clearResponses: function clearResponses() {
          return getResponseStore().then(function (storage) {
            return storage.clear();
          });
        },

        /**
         * @returns {Promise}
         */
        clearCorrectResponses: function clearCorrectResponses() {
          return getCorrectResponseStore().then(function (storage) {
            return storage.clear();
          });
        }
      };
    }

    return responseStoreFactory;

});
