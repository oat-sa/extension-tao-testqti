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
 * Copyright (c) 2015 (original work) Open Assessment Technologies SA ;
 */
/**
 * @author Jean-Sébastien Conan <jean-sebastien.conan@vesperiagroup.com>
 */
define([
    'jquery',
    'lodash',
    'i18n',
    'core/eventifier',
    'core/promise'
], function ($, _, __, eventifier, Promise) {
    'use strict';

    /**
     * Some default values
     * @type {Object}
     * @private
     */
    var _defaults = {};

    /**
     * Defines the QTI test runner
     * @type {runner}
     */
    var runner = {
        /**
         * Initializes the runner
         * @param {Object} config
         */
        init : function init(config) {
            eventifier(this);

            this.config = _.omit(config || {}, function(value) {
                return undefined === value || null === value;
            });
            this.config.is = {};

            if (this.config.plugins) {
                _.forEach(this.config.plugins, function(plugin) {
                    // todo: load plugins, then fire the init event
                });
            }

            this.trigger('init', this);
            return this;
        },

        /**
         * Sets the runner in the ready state
         * @param {ServiceApi} serviceApi
         */
        ready : function ready(serviceApi) {
            this.serviceApi = serviceApi;
            this.trigger('ready', this);
            return this;
        },

        /**
         *
         */
        load : function load() {
            this.trigger('load', this);
            return this;
        },

        /**
         *
         * @returns {runner}
         */
        terminate : function terminate() {
            this.trigger('terminate', this);
            return this;
        },

        /**
         *
         * @returns {runner}
         */
        endAttempt : function endAttempt() {
            this.trigger('endattempt', this);
            return this;
        },

        /**
         *
         * @returns {runner}
         */
        next : function next() {
            this.trigger('next', this);
            return this;
        },

        /**
         *
         * @returns {runner}
         */
        previous : function previous() {
            this.trigger('previous', this);
            return this;
        },

        /**
         *
         * @param scope
         * @returns {runner}
         */
        exit : function exit(scope) {
            this.trigger('exit', scope, this);
            return this;
        },

        /**
         *
         * @returns {runner}
         */
        skip : function skip() {
            this.trigger('skip', this);
            return this;
        },

        /**
         *
         * @param position
         * @returns {runner}
         */
        jump : function jump(position) {
            this.trigger('jump', position, this);
            return this;
        },

        /**
         *
         * @param action
         * @param handler
         * @returns {runner}
         */
        registerAction : function registerAction(action, handler) {
            this.on(action, handler);
            return this;
        },

        /**
         *
         * @param command
         * @returns {runner}
         */
        execute : function execute(command) {
            this.trigger.apply(this, arguments);
            return this;
        },

        /**
         *
         * @param command
         * @param params
         * @param callback
         * @returns {runner}
         */
        request : function request(command, params, callback) {
            var self = this;
            this.beforeRequest(function() {
                $.ajax({
                    url: self.testContext[command + 'Url'] || command,
                    cache: false,
                    data: params,
                    async: true,
                    dataType: 'json',
                    success: function(testContext) {
                        self.processRequest(testContext, callback);
                    }
                });
            });
            return this;
        },

        /**
         *
         * @param process
         * @returns {runner}
         */
        beforeRequest : function beforeRequest(process) {
            process();
            return this;
        },

        /**
         *
         * @param testContext
         * @param callback
         * @returns {runner}
         */
        processRequest : function processRequest(testContext, callback) {
            callback();
            this.afterRequest();
            return this;
        },

        /**
         *
         * @returns {runner}
         */
        afterRequest : function afterRequest() {
            return this;
        },

        /**
         * Checks if the runner has a particular state
         * @param {String} state
         * @returns {Boolean}
         */
        is : function is(state) {
            return !!this.config.is[state];
        }
    };

    /**
     * Builds an instance of the QTI test runner
     * @param {Object} config
     * @returns {runner}
     */
    var testRunnerFactory = function testRunnerFactory(config) {
        var instance = _.clone(runner);
        _.defaults(instance, _defaults);
        return instance.init(config);
    };

    return testRunnerFactory;
});
