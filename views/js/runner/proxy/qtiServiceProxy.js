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
    'core/promise',
    'helpers'
], function($, _, Promise, helpers) {
    'use strict';

    /**
     * Proxy request function. Returns a promise
     * Applied options: asynchronous call, JSON data, no cache
     * @param {String} url
     * @param {Object} [params]
     * @returns {Promise}
     */
    function request(url, params) {
        return new Promise(function(resolve, reject) {
            $.ajax({
                url: url,
                type: params ? 'POST' : 'GET',
                cache: false,
                data: params,
                async: true,
                dataType: 'json'
            }).then(
                // success
                function(data) {
                    if (data && data.success) {
                        resolve(data);
                    } else {
                        reject(false);
                    }
                },

                // error
                function(jqXHR) {
                    reject(jqXHR);
                }
            );
        });
    }


    /**
     * Extract and validate a required config property. If the property is not set, throws an error.
     * @param {Object} config
     * @param {String} property
     * @returns {*}
     * @throws Error
     */
    function getRequired(config, property) {
        var value = config[property];
        if (!value) {
            throw new Error('The config entry "' + property + '" is required!');
        }
        return value;
    }

    /**
     * Creates a storage object for test
     * @param {Object} config - Some required and optional config
     * @param {String} config.testDefinition - The URI of the test
     * @param {String} config.testCompilation - The URI of the compiled delivery
     * @param {String} config.serviceCallId - The URI of the service call
     * @param {String} [config.serviceController] - The name of the service controller
     * @param {String} [config.serviceExtension] - The name of the service extension
     * @returns {Object}
     */
    function storageFactory(config) {
        // protected storage
        var storage = {
            testDefinition : getRequired(config, 'testDefinition'),
            testCompilation : getRequired(config, 'testCompilation'),
            serviceCallId : getRequired(config, 'serviceCallId'),
            serviceController : config.serviceController || 'Runner',
            serviceExtension : config.serviceExtension || null
        };

        // returns only a proxy storage object : no direct access to data is provided
        return {
            getTestDefinition : function getTestDefinition() {
                return storage.testDefinition;
            },

            getTestCompilation : function getTestCompilation() {
                return storage.testCompilation;
            },

            getServiceCallId : function getServiceCallId() {
                return storage.serviceCallId;
            },

            getServiceController : function getServiceController() {
                return storage.serviceController;
            },

            getServiceExtension : function getServiceExtension() {
                return storage.serviceExtension;
            },

            getTestActionUrl : function getTestActionUrl(action) {
                return helpers._url(action, this.getServiceController(), this.getServiceExtension(), {
                    testDefinition : this.getTestDefinition(),
                    testCompilation : this.getTestCompilation(),
                    serviceCallId : this.getServiceCallId()
                });
            },

            getItemActionUrl : function getTestActionUrl(uri, action) {
                return helpers._url(action, this.getServiceController(), this.getServiceExtension(), {
                    testDefinition : this.getTestDefinition(),
                    testCompilation : this.getTestCompilation(),
                    testServiceCallId : this.getServiceCallId(),
                    itemDefinition : uri
                });
            }
        }
    }

    /**
     * QTI proxy definition
     * Related to remote services calls
     * @type {Object}
     */
    var qtiServiceProxy = {
        /**
         * Initializes the proxy
         * @param {Object} config - The config provided to the proxy factory
         * @param {String} config.testDefinition - The URI of the test
         * @param {String} config.testCompilation - The URI of the compiled delivery
         * @param {String} config.serviceCallId - The URI of the service call
         * @returns {Promise} - Returns a promise. The proxy will be fully initialized on resolve.
         *                      Any error will be provided if rejected.
         */
        init: function init(config) {
            var initConfig = config || {};

            // store config in a dedicated storage
            this.storage = storageFactory(initConfig);

            // request for initialization
            return request(this.storage.getTestActionUrl('init'));
        },

        /**
         * Uninstalls the proxy
         * @returns {Promise} - Returns a promise. The proxy will be fully uninstalled on resolve.
         *                      Any error will be provided if rejected.
         */
        destroy: function destroy() {
            var self = this;
            // the method must return a promise
            return new Promise(function(resolve) {
                // no request, just a resources cleaning
                self.storage = null;
                resolve();
            });
        },

        /**
         * Gets the test definition data
         * @returns {Promise} - Returns a promise. The test definition data will be provided on resolve.
         *                      Any error will be provided if rejected.
         */
        getTestData: function getTestData() {
            return request(this.storage.getTestActionUrl('getTestData'));
        },

        /**
         * Gets the test context
         * @returns {Promise} - Returns a promise. The context object will be provided on resolve.
         *                      Any error will be provided if rejected.
         */
        getTestContext: function getTestContext() {
            return request(this.storage.getTestActionUrl('getTestContext'));
        },

        /**
         * Calls an action related to the test
         * @param {String} action - The name of the action to call
         * @param {Object} [params] - Some optional parameters to join to the call
         * @returns {Promise} - Returns a promise. The result of the request will be provided on resolve.
         *                      Any error will be provided if rejected.
         */
        callTestAction: function callTestAction(action, params) {
            return request(this.storage.getTestActionUrl(action), params);
        },

        /**
         * Gets an item definition by its URI
         * @param string uri - The URI of the item to get
         * @returns {Promise} - Returns a promise. The item definition data will be provided on resolve.
         *                      Any error will be provided if rejected.
         * @fires getItemData
         */
        getItemData: function getItemData(uri) {
            return request(this.storage.getItemActionUrl(uri, 'getItemData'));
        },

        /**
         * Gets an item state by the item URI
         * @param string uri - The URI of the item for which get the state
         * @returns {Promise} - Returns a promise. The item state object will be provided on resolve.
         *                      Any error will be provided if rejected.
         */
        getItemState: function getItemState(uri) {
            return request(this.storage.getItemActionUrl(uri, 'getItemState'));
        },

        /**
         * Submits the state of a particular item
         * @param {String} uri - The URI of the item to update
         * @param {Object} state - The state to submit
         * @returns {Promise} - Returns a promise. The result of the request will be provided on resolve.
         *                      Any error will be provided if rejected.
         */
        submitItemState: function submitItemState(uri, state) {
            return request(this.storage.getItemActionUrl(uri, 'submitItemState'), state);
        },

        /**
         * Stores the response for a particular item
         * @param {String} uri - The URI of the item to update
         * @param {Object} response - The response object to submit
         * @returns {Promise} - Returns a promise. The result of the request will be provided on resolve.
         *                      Any error will be provided if rejected.
         */
        storeItemResponse: function storeItemResponse(uri, response) {
            return request(this.storage.getItemActionUrl(uri, 'storeItemResponse'), response);
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
            return request(this.storage.getItemActionUrl(uri, action), params);
        }
    };

    return qtiServiceProxy;
});
