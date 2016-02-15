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
 * Copyright (c) 2016 (original work) Open Assessment Technologies SA ;
 */
/**
 * @author Jean-Sébastien Conan <jean-sebastien.conan@vesperiagroup.com>
 */
define([
    'jquery',
    'lodash',
    'core/promise'
], function ($, _, Promise) {
    'use strict';

    /**
     * Creates a mock proxy
     *
     * @param {Object} [config] - A list of options
     * @param {Object} [config.testActions] - the list of mock services related to the test, each one is a function linked to the action name
     * @param {Object} [config.itemActions] - the list of mock services related to items, each one is a function linked to the action name
     * @returns {Object}
     */
    function proxyMockFactory(config) {
        var mockConfig = config || {};
        var initConfig;
        var storage;

        /**
         * Request through the mock
         * @param {String} scope
         * @param {String} action
         * @param {Array} [params]
         * @returns {Promise}
         */
        function request(scope, action, params) {
            var mockBaseName = scope + 'Actions';
            var mockBase = mockConfig[mockBaseName];
            var mockAction = mockBase && mockBase[action];
            var response, message;

            if (_.isFunction(mockAction)) {
                response = mockAction.apply(this, params);
            } else {
                message = 'Missing proxy mock implementation for ' + scope + ' action: ' + action;
                response = Promise.reject({
                    success: false,
                    type: 'error',
                    code: 0,
                    message: message
                });
            }

            return response;
        }

        return {
            /**
             * Initializes the proxy
             * @param {Object} [config] - The config provided to the proxy factory
             * @returns {Promise} - Returns a promise. The proxy will be fully initialized on resolve.
             *                      Any error will be provided if rejected.
             */
            init: function init(config) {
                initConfig = config || {};

                storage = {
                    responses: {},
                    states: {}
                };

                // request for initialization
                return request('test', 'init', [initConfig]);
            },

            /**
             * Uninstalls the proxy
             * @returns {Promise} - Returns a promise. The proxy will be fully uninstalled on resolve.
             *                      Any error will be provided if rejected.
             */
            destroy: function destroy() {
                initConfig = null;
                storage = null;
                return Promise.resolve();
            },

            /**
             * Gets the test definition data
             * @returns {Promise} - Returns a promise. The test definition data will be provided on resolve.
             *                      Any error will be provided if rejected.
             */
            getTestData: function getTestData() {
                return request('test', 'getTestData');
            },

            /**
             * Gets the test context
             * @returns {Promise} - Returns a promise. The context object will be provided on resolve.
             *                      Any error will be provided if rejected.
             */
            getTestContext: function getTestContext() {
                return request('test', 'getTestContext');
            },

            /**
             * Gets the test map
             * @returns {Promise} - Returns a promise. The test map object will be provided on resolve.
             *                      Any error will be provided if rejected.
             */
            getTestMap: function getTestMap() {
                return request('test', 'getTestMap');
            },

            /**
             * Calls an action related to the test
             * @param {String} action - The name of the action to call
             * @param {Object} [params] - Some optional parameters to join to the call
             * @returns {Promise} - Returns a promise. The result of the request will be provided on resolve.
             *                      Any error will be provided if rejected.
             */
            callTestAction: function callTestAction(action, params) {
                return request('test', action, [params]);
            },

            /**
             * Gets an item definition by its URI
             * @param {String} uri - The URI of the item to get
             * @returns {Promise} - Returns a promise. The item definition data will be provided on resolve.
             *                      Any error will be provided if rejected.
             * @fires getItemData
             */
            getItemData: function getItemData(uri) {
                return request('item', 'getItemData', [uri]);
            },

            /**
             * Gets an item state by the item URI
             * @param {String} uri - The URI of the item for which get the state
             * @returns {Promise} - Returns a promise. The item state object will be provided on resolve.
             *                      Any error will be provided if rejected.
             */
            getItemState: function getItemState(uri) {
                var success = !!(storage && storage.states);
                var state = success && storage.states[uri] || {};
                return Promise.resolve({
                    success: success,
                    itemState: state
                });
            },

            /**
             * Submits the state of a particular item
             * @param {String} uri - The URI of the item to update
             * @param {Object} state - The state to submit
             * @returns {Promise} - Returns a promise. The result of the request will be provided on resolve.
             *                      Any error will be provided if rejected.
             */
            submitItemState: function submitItemState(uri, state) {
                var success = false;
                if (storage && storage.states) {
                    storage.states[uri] = state;
                    success = true;
                }
                return Promise.resolve({
                    success: success
                });
            },

            /**
             * Stores the response for a particular item
             * @param {String} uri - The URI of the item to update
             * @param {Object} responses - The response object to submit
             * @returns {Promise} - Returns a promise. The result of the request will be provided on resolve.
             *                      Any error will be provided if rejected.
             */
            storeItemResponse: function storeItemResponse(uri, responses) {
                var success = false;
                if (storage && storage.responses) {
                    storage.responses[uri] = responses;
                    success = true;
                }
                return Promise.resolve({
                    success: success
                });
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
                return request('item', action, [uri, params]);
            }
        };
    }

    return proxyMockFactory;
});
