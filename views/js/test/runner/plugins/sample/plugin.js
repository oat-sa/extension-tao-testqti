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
 * Copyright (c) 2017 (original work) Open Assessment Technologies SA ;
 */
/**
 * Sample test runner plugin
 *
 * @author Christophe Noël <christophe@taotesting.com>
 */
define([
    'jquery',
    'lodash',
    'i18n',
    'taoTests/runner/plugin',
    'ui/hider',
    'tpl!taoQtiTest/runner/plugins/templates/button'
], function ($, _, __, pluginFactory, hider, buttonTpl) {
    'use strict';

    /**
     * Returns the configured plugin
     */
    return pluginFactory({

        name: 'pluginSample',

        /**
         * Initialize the plugin (called during runner's init)
         */
        init: function init() {
            var self = this;

            var testRunner = this.getTestRunner();
            var testData = testRunner.getTestData() || {};
            var testConfig = testData.config || {};
            var pluginsConfig = testConfig.plugins || {};
            // var config = _.defaults(pluginsConfig.formula || {}, defaults);
            var areaBroker = testRunner.getAreaBroker();

            /**
             * Checks if the plugin is currently available
             * activate with category: x-tao-option-formula
             * @returns {Boolean}
             */
            function isEnabled() {
                var context = testRunner.getTestContext();
                return context && context.options && !!context.options.formula;
            }

            /**
             * Is plugin activated ? if not, then we hide the plugin
             */
            function togglePlugin() {
                if (isEnabled()) {
                    self.show();
                } else {
                    self.hide();
                }
            }

            // build navigation button (detached)
            this.$navButton = $(buttonTpl({
                control : 'navButton',
                title : __('Navigation button'),
                text : __('Navigation button')
            }));

            // build toolbox entry
            this.toolboxButton = areaBroker.getToolbox().createEntry({
                control : 'toolboxButton',
                title : __('Toolbox button'),
                text : __('Toolbox button')
            });

            // start disabled
            togglePlugin();
            this.disable();

            // update plugin state based on changes
            testRunner
                .on('loaditem', togglePlugin)
                .on('enabletools renderitem', function () {
                    self.enable();
                })
                .on('disabletools unloaditem', function () {
                    self.disable();
                });
        },

        /**
         * Called during the runner's render phase
         */
        render: function render() {
            var $container = this.getAreaBroker().getNavigationArea();
            $container.append(this.$navButton);
        },

        /**
         * Called during the runner's destroy phase
         */
        destroy: function destroy() {
            this.$navButton.remove();
        },

        /**
         * Enable the button
         */
        enable: function enable() {
            this.$navButton
                .removeProp('disabled')
                .removeClass('disabled');

            this.toolboxButton.enable();
        },

        /**
         * Disable the button
         */
        disable: function disable() {
            this.$navButton
                .prop('disabled', true)
                .addClass('disabled');

            this.toolboxButton.disable();
        },

        /**
         * Show the button
         */
        show: function show() {
            hider.show(this.$navButton);

            this.toolboxButton.show();
        },

        /**
         * Hide the button
         */
        hide: function hide() {
            hider.hide(this.$navButton);

            this.toolboxButton.hide();
        }
    });
});
