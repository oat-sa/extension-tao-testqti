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
 * Test Runner Tool Plugin : Text Highlighter
 *
 * @author Christophe Noël <christophe@taotesting.com>
 */
define([
    'jquery',
    'i18n',
    'taoTests/runner/plugin',
    'ui/hider',
    'util/shortcut',
    'util/namespace',
    'tpl!taoQtiTest/runner/plugins/navigation/button'
], function ($, __, pluginFactory, hider, shortcut, namespaceHelper, buttonTpl) {
    'use strict';

    /**
     * Returns the configured plugin
     */
    return pluginFactory({

        name: 'highlighter',

        /**
         * Initialize the plugin (called during runner's init)
         */
        init: function init() {
            var self = this;

            var testRunner = this.getTestRunner();
            var testData = testRunner.getTestData() || {};
            var testConfig = testData.config || {};
            var pluginShortcuts = (testConfig.shortcuts || {})[this.getName()] || {};

            /**
             * Checks if the plugin is currently available
             * @returns {Boolean}
             */
            function isEnabled() {
                return self.getState('enabled') !== false;
            }

           //build element (detached)
            this.$button = $(buttonTpl({
                control: 'highlighter',
                title: __('Highlight text'),
                icon: 'text-marker'
            }));

            //attach user events
            this.$button.on('click', function (e) {
                e.preventDefault();
                testRunner.trigger('tool-highlight');
            });

            if (testConfig.allowShortcuts) {
                if (pluginShortcuts.toggle) {
                    shortcut.add(namespaceHelper.namespaceAll(pluginShortcuts.toggle, this.getName(), true), function () {
                        testRunner.trigger('tool-highlight');
                    }, { avoidInput: true, prevent: true });
                }
            }

            //start disabled
            this.disable();

            //update plugin state based on changes
            testRunner
                .on('loaditem', function () {
                    self.show();
                })
                .on('renderitem', function () {
                    self.enable();
                })
                .on('unloaditem', function () {
                    self.disable();
                })
                .on('tool-comment', function () {
                    if (isEnabled()) {
                        console.log('launching highlighter !');
                    }
                });
        },

        /**
         * Called during the runner's render phase
         */
        render: function render() {
            var $container = this.getAreaBroker().getToolboxArea();
            $container.append(this.$button);
        },

        /**
         * Called during the runner's destroy phase
         */
        destroy: function destroy() {
            shortcut.remove('.' + this.getName());
            this.$button.remove();
        },

        /**
         * Enable the button
         */
        enable: function enable() {
            this.$button.removeProp('disabled')
                .removeClass('disabled');
        },

        /**
         * Disable the button
         */
        disable: function disable() {
            hider.hide(this.$form);
            this.$button.prop('disabled', true)
                .addClass('disabled');
        },

        /**
         * Show the button
         */
        show: function show() {
            hider.show(this.$button);
        },

        /**
         * Hide the button
         */
        hide: function hide() {
            hider.hide(this.$button);
        }
    });
});
