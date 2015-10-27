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
    'tpl!taoQtiTest/runner/tpl/runner'
], function ($, _, __, template) {
    'use strict';

    /**
     * Defines the GUI manager for the QTI test runner
     * @type {gui}
     */
    var gui = {
        /**
         * Initializes the GUI
         * @param {Object} config
         * @returns {gui}
         */
        init : function init(config) {
            this.config = _.omit(config || {}, function(value) {
                return value === undefined || value === null;
            });
            this.config.is = {};

            return this;
        },

        /**
         * Uninstall the GUI
         * @returns {gui}
         */
        destroy : function destroy() {
            if (this.$component) {
                this.$component.remove();
            }
            this.$component = null;

            return this;
        },

        /**
         * Checks if the GUI has a particular state
         * @param {String} state
         * @returns {Boolean}
         */
        is : function is(state) {
            return !!this.config.is[state];
        },

        /**
         * Renders the GUI
         * @param {null|jQuery|HTMLElement|String} to
         * @returns {jQuery}
         */
        render : function render(to) {
            this.$component = $(template(this.config));

            to = to || this.config.renderTo;
            if (to) {
                $(to).append(this.$component);
            }

            return this.$component;
        },

        /**
         * Enables the GUI
         * @returns {gui}
         */
        enable : function enable() {
            return this;
        },

        /**
         * Disables the GUI
         * @returns {gui}
         */
        disable : function disable() {
            return this;
        },

        /**
         * Shows the GUI
         * @returns {gui}
         */
        show : function show() {
            return this;
        },

        /**
         * Hides the GUI
         * @returns {gui}
         */
        hide : function hide() {
            return this;
        },

        /**
         * Gets the underlying DOM element
         * @returns {jQuery}
         */
        getDom : function getDom() {
            return this.$component;
        },

        /**
         * Binds an handler to an event
         * @param eventName
         * @param handler
         * @returns {gui}
         */
        on : function on(eventName, handler) {
            return this;
        },

        /**
         * Unbinds an handler from an event
         * @param eventName
         * @param handler
         * @returns {gui}
         */
        off : function off(eventName, handler) {
            return this;
        },

        /**
         * Triggers an event
         * @param eventName
         * @returns {gui}
         */
        trigger : function trigger(eventName) {
            return this;
        }
    };

    /**
     * Builds an instance of the GUI
     * @param {Object} config
     * @returns {gui}
     */
    var guiFactory = function guiFactory(config) {
        var instance = _.clone(gui);
        return instance.init(config);
    };

    return guiFactory;
});
