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
    'i18n'
], function ($, _, __) {
    'use strict';

    /**
     * Defines the bases of any QTI test runner plugins
     * @type {plugin}
     */
    var plugin = {
        /**
         * Initializes the plugin
         * @param testRunner
         * @param config
         * @param resolve
         * @returns {plugin}
         */
        init : function init(testRunner, config, resolve) {
            this.config = _.omit(config || {}, function(value) {
                return value === undefined || value === null;
            });
            this.config.is = {};
            this.testRunner = testRunner;

            this.setup(resolve);
            return this;
        },

        /**
         * Destroys the plugin
         * @returns {plugin}
         */
        destroy : function destroy() {
            this.tearDown();

            this.testRunner = null;
            this.config = null;

            return this;
        },

        /**
         * Checks if the plugin has a particular state
         * @param {String} state
         * @returns {Boolean}
         */
        is : function is(state) {
            return !!this.config.is[state];
        },

        /**
         * Shows the component related to this plugin
         * @returns {plugin}
         */
        show : function show() {
            return this;
        },

        /**
         * Hides the component related to this plugin
         * @returns {plugin}
         */
        hide : function hide() {
            return this;
        },

        /**
         * Enables the plugin
         * @returns {plugin}
         */
        enable : function enable() {
            return this;
        },

        /**
         * Disables the plugin
         * @returns {plugin}
         */
        disable : function disable() {
            return this;
        },

        /**
         * Additional setup onto the plugin config set
         * @param {Function} resolve
         * @private
         */
        setup : function setup(resolve) {
            // just a template method to be overloaded
            if (_.isFunction(resolve)) {
                resolve();
            }
        },

        /**
         * Additional cleaning while uninstalling the plugin
         * @private
         */
        tearDown : function tearDown() {
            // just a template method to be overloaded
        }
    };

    /**
     * Builds a plugin from the given specs
     * @param {Object} specs
     * @returns {plugin}
     */
    var pluginFactory = function pluginFactory(specs) {
        var instance = _.clone(plugin);
        return _.assign(instance, specs);
    };

    return pluginFactory;
});
