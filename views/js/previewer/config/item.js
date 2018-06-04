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
 * Copyright (c) 2018 (original work) Open Assessment Technologies SA ;
 */

/**
 * Config manager for the proxy of the QTI item previewer
 *
 * @author Jean-Sébastien Conan <jean-sebastien@taotesting.com>
 */
define([
    'lodash',
    'util/url',
    'util/config'
], function(_, urlUtil, configHelper) {
    'use strict';

    /**
     * Some default config values
     * @type {Object}
     * @private
     */
    var _defaults = {
        bootstrap : {
            serviceController : 'Previewer',
            serviceExtension : 'taoQtiTest'
        }
    };

    /**
     * The list of handled config entries. Each required entry is set to true, while optional entries are set to false.
     * @type {Object}
     * @private
     */
    var _entries = {
        serviceCallId : true,
        bootstrap : false,
        timeout : false
    };

    /**
     * Creates a config object for the proxy implementation
     * @param {Object} config - Some required and optional config
     * @param {String} config.serviceCallId - An identifier for the service call
     * @param {String} [config.bootstrap.serviceController] - The name of the service controller
     * @param {String} [config.bootstrap.serviceExtension] - The name of the extension containing the service controller
     * @returns {Object}
     */
    return function itemPreviewerConfigFactory(config) {
        // protected storage
        var storage = configHelper.from(config, _entries, _defaults);
        var undef;

        // convert some values from seconds to milliseconds
        if (storage.timeout) {
            storage.timeout *= 1000;
        } else {
            storage.timeout = undef;
        }

        // returns only a proxy storage object : no direct access to data is provided
        return {
            /**
             * Gets the list of parameters
             * @param {String|Object} [itemIdentifier]
             * @returns {Object}
             */
            getParameters: function getParameters(itemIdentifier) {
                var type = typeof itemIdentifier;
                var parameters = {
                    serviceCallId : this.getServiceCallId()
                };

                if (type === 'string') {
                    // simple item identifier
                    parameters.itemUri = itemIdentifier;
                    // structured item identifier (a list of parameters)
                } else if (type === 'object' && _.isPlainObject(itemIdentifier)) {
                    _.merge(parameters, itemIdentifier);
                } else if (type !== 'undefined') {
                    throw new TypeError('Wrong parameter type provided for itemIdentifier: ' + type + '. Only string or plain object are allowed!');
                }

                return parameters;
            },

            /**
             * Gets the URI of the service call
             * @returns {String}
             */
            getServiceCallId : function getServiceCallId() {
                return storage.serviceCallId;
            },

            /**
             * Gets the name of the service controller
             * @returns {String}
             */
            getServiceController : function getServiceController() {
                return storage.bootstrap.serviceController || _defaults.bootstrap.serviceController;
            },

            /**
             * Gets the name of the extension containing the service controller
             * @returns {String}
             */
            getServiceExtension : function getServiceExtension() {
                return storage.bootstrap.serviceExtension || _defaults.bootstrap.serviceExtension;
            },

            /**
             * Gets an URL of a service action
             * @param {String} action - the name of the action to request
             * @returns {String} - Returns the URL
             */
            getTestActionUrl : function getTestActionUrl(action) {
                return urlUtil.route(action, this.getServiceController(), this.getServiceExtension(), this.getParameters());
            },

            /**
             * Gets an URL of a service action related to a particular item
             * @param {String|Object} itemIdentifier - The URI of the item
             * @param {String} action - the name of the action to request
             * @returns {String} - Returns the URL
             */
            getItemActionUrl : function getItemActionUrl(itemIdentifier, action) {
                return urlUtil.route(action, this.getServiceController(), this.getServiceExtension(), this.getParameters(itemIdentifier));
            },

            /**
             * Gets an URL of a telemetry signal related to a particular item
             * @param {String|Object} itemIdentifier - The URI of the item
             * @param {String} signal - the name of the signal to request
             * @returns {String} - Returns the URL
             */
            getTelemetryUrl : function getTelemetryUrl(itemIdentifier, signal) {
                return urlUtil.route(signal, this.getServiceController(), this.getServiceExtension(), this.getParameters(itemIdentifier));
            },

            /**
             * Gets the request timeout
             * @returns {Number}
             */
            getTimeout : function getTimeout() {
                return storage.timeout;
            },

            /**
             * Gets the config for the communication channel
             * @returns {Object}
             */
            getCommunicationConfig : function getCommunicationConfig() {
                var communication = storage.bootstrap.communication || {};
                var extension = communication.extension || this.getServiceExtension();
                var controller = communication.controller || this.getServiceController();
                var action = communication.action;
                var syncActions = communication.syncActions || [];

                // build the service address from the provided config
                // it can be overwritten by a full url from the config
                var service = urlUtil.route(action || 'message', controller, extension, this.getParameters());

                // append the address of the remote service to target
                var params = _.merge({}, communication.params || {}, {
                    service: communication.service || service
                });

                // convert some values from seconds to milliseconds
                if (params.timeout) {
                    params.timeout *= 1000;
                } else {
                    params.timeout = storage.timeout;
                }
                if (params.interval) {
                    params.interval *= 1000;
                }

                return {
                    enabled: communication.enabled,
                    type: communication.type,
                    params: params,
                    syncActions: syncActions
                };
            }
        };
    };
});
