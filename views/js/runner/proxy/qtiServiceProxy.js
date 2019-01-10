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
 * Copyright (c) 2016-2018 (original work) Open Assessment Technologies SA ;
 */

/**
 * @author Jean-Sébastien Conan <jean-sebastien@taotesting.com>
 */
define([
    'jquery',
    'lodash',
    'i18n',
    'core/promise',
    'core/promiseQueue',
    'core/communicator',
    'taoQtiTest/runner/config/qtiServiceConfig',
    'util/httpErrorParser'
], function($, _, __, Promise, promiseQueue, communicatorFactory, configFactory, httpErrorParser) {
    'use strict';

    /**
     * QTI proxy definition
     * Related to remote services calls
     * @type {Object}
     */
    var qtiServiceProxy = {

        /**
         * Installs the proxy
         */
        install : function install(){
            var self = this;

            /**
             * A promise queue to ensure requests run sequentially
             */
            this.queue = promiseQueue();

            /**
             * Some parameters needs special handling...
             * @param {Object} actionParams - the input parameters
             * @returns {Object} output parameters
             */
            this.prepareParams = function prepareParams(actionParams){

                //some parameters need to be JSON.stringified
                var stringifyParams = ['itemState', 'itemResponse', 'toolStates'];

                if(_.isPlainObject(actionParams)){
                    return _.mapValues(actionParams, function(value, key){
                        if(_.contains(stringifyParams, key)){
                            return JSON.stringify(value);
                        }
                        return value;
                    });
                }

                return actionParams;
            };

            /**
             * Proxy request function. Returns a promise
             * Applied options: asynchronous call, JSON data, no cache
             * @param {String} url
             * @param {Object} [reqParams]
             * @param {String} [contentType] - to force the content type
             * @param {Boolean} [noToken] - to disable the token
             * @returns {Promise}
             */
            this.request = function request(url, reqParams, contentType, noToken) {

                //run the request, just a function wrapper
                var runRequest = function runRequest() {
                    return new Promise(function(resolve, reject) {
                        var token;
                        var noop;
                        var headers        = {};
                        var action         = reqParams ? 'POST' : 'GET';
                        var preparedParams = self.prepareParams(reqParams);
                        var tokenHandler   = self.getTokenHandler();

                        if (!noToken) {
                            token = tokenHandler.getToken();
                            if (token) {
                                headers['X-Auth-Token'] = token;
                            }
                        }

                        $.ajax({
                            url : url,
                            type : action,
                            cache : false,
                            data : preparedParams,
                            headers : headers,
                            async : true,
                            dataType : 'json',
                            contentType : contentType || noop,
                            timeout : self.configStorage.getTimeout()
                        })
                            .done(function(data) {

                                if (data && data.token) {
                                    tokenHandler.setToken(data.token);
                                }

                                self.setOnline();

                                if (data && data.success) {
                                    resolve(data);
                                } else {
                                    reject(data);
                                }
                            })
                            .fail(function(jqXHR, textStatus, errorThrown) {
                                var data;

                                try {
                                    data = JSON.parse(jqXHR.responseText);
                                } catch(err) {
                                    data = {};
                                }

                                data = _.defaults(data, {
                                    success: false,
                                    source: 'network',
                                    cause : url,
                                    purpose: 'proxy',
                                    context: this,
                                    code: jqXHR.status,
                                    sent: jqXHR.readyState > 0,
                                    type: textStatus || 'error',
                                    message: errorThrown || __('An error occurred!')
                                });

                                if (data.token) {
                                    tokenHandler.setToken(data.token);
                                } else if (!noToken) {
                                    tokenHandler.setToken(token);
                                }

                                if(self.isConnectivityError(data)){
                                    self.setOffline('request');
                                    return resolve(data);
                                }

                                reject(httpErrorParser.parse(jqXHR, textStatus, errorThrown));
                            });
                    });
                };

                //no token protection, run the request
                if (noToken === true) {
                    return runRequest();
                }

                return this.queue.serie(runRequest);
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
            // store config in a dedicated configStorage
            this.configStorage = configFactory(config || {});

            // request for initialization
            return this.request(this.configStorage.getTestActionUrl('init'), params);
        },

        /**
         * Uninstalls the proxy
         * @returns {Promise} - Returns a promise. The proxy will be fully uninstalled on resolve.
         *                      Any error will be provided if rejected.
         */
        destroy: function destroy() {
            // no request, just a resources cleaning
            this.configStorage = null;
            this.queue = null;

            // the method must return a promise
            return Promise.resolve();
        },

        /**
         * Gets the test definition data
         * @returns {Promise} - Returns a promise. The test definition data will be provided on resolve.
         *                      Any error will be provided if rejected.
         */
        getTestData: function getTestData() {
            return this.request(this.configStorage.getTestActionUrl('getTestData'));
        },

        /**
         * Gets the test context
         * @returns {Promise} - Returns a promise. The context object will be provided on resolve.
         *                      Any error will be provided if rejected.
         */
        getTestContext: function getTestContext() {
            return this.request(this.configStorage.getTestActionUrl('getTestContext'));
        },

        /**
         * Gets the test map
         * @returns {Promise} - Returns a promise. The test map object will be provided on resolve.
         *                      Any error will be provided if rejected.
         */
        getTestMap: function getTestMap() {
            return this.request(this.configStorage.getTestActionUrl('getTestMap'));
        },

        /**
         * Sends the test variables
         * @param {Object} variables
         * @returns {Promise} - Returns a promise. The result of the request will be provided on resolve.
         *                      Any error will be provided if rejected.
         * @fires sendVariables
         */
        sendVariables: function sendVariables(variables) {
            return this.request(this.configStorage.getTestActionUrl('storeTraceData'), {
                traceData: JSON.stringify(variables)
            });
        },

        /**
         * Calls an action related to the test
         * @param {String} action - The name of the action to call
         * @param {Object} [params] - Some optional parameters to join to the call
         * @returns {Promise} - Returns a promise. The result of the request will be provided on resolve.
         *                      Any error will be provided if rejected.
         */
        callTestAction: function callTestAction(action, params) {
            return this.request(this.configStorage.getTestActionUrl(action), params);
        },

        /**
         * Gets an item definition by its identifier, also gets its current state
         * @param {String} itemIdentifier - The identifier of the item to get
         * @param {Object} [params] - additional parameters
         * @returns {Promise} - Returns a promise. The item data will be provided on resolve.
         *                      Any error will be provided if rejected.
         */
        getItem: function getItem(itemIdentifier, params) {
            return this.request(this.configStorage.getItemActionUrl(itemIdentifier, 'getItem'), params);
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
            var body = _.merge({
                itemState: state,
                itemResponse: response
            }, params || {});

            return this.request(this.configStorage.getItemActionUrl(itemIdentifier, 'submitItem'), body);
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
            return this.request(this.configStorage.getItemActionUrl(itemIdentifier, action), params);
        },

        /**
         * Sends a telemetry signal
         * @param {String} itemIdentifier - The identifier of the item for which sends the telemetry signal
         * @param {String} signal - The name of the signal to send
         * @param {Object} [params] - Some optional parameters to join to the signal
         * @returns {Promise} - Returns a promise. The result of the request will be provided on resolve.
         *                      Any error will be provided if rejected.
         * @fires telemetry
         */
        telemetry: function telemetry(itemIdentifier, signal, params) {
            return this.request(this.configStorage.getTelemetryUrl(itemIdentifier, signal), params, null, true);
        },

        /**
         * Builds the communication channel
         * @returns {communicator|null} the communication channel
         */
        loadCommunicator: function loadCommunicator() {
            var config = this.configStorage.getCommunicationConfig();
            if (config.enabled) {
                return communicatorFactory(config.type, config.params);
            }
            return null;
        }
    };

    return qtiServiceProxy;
});
