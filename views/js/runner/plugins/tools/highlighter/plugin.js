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
    'lodash',
    'i18n',
    'taoTests/runner/plugin',
    'ui/hider',
    'util/shortcut',
    'util/namespace',
    'taoQtiTest/runner/plugins/tools/highlighter/highlighter',
    'tpl!taoAct/runner/plugins/templates/button-group'
], function ($, _, __, pluginFactory, hider, shortcut, namespaceHelper, highlighterFactory, buttonGroupTpl) {
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

            var highlighter = highlighterFactory(testRunner);

            /**
             * Checks if the plugin is currently available
             * @returns {Boolean}
             */
            function isEnabled() {
                return self.getState('enabled') !== false;
            }

           //build element (detached)
            this.$buttonGroup = $(buttonGroupTpl({
                control : 'highlighter',
                buttons: {
                    main: {
                        title: __('Highlight text'),
                        icon: 'text-marker'
                    },
                    remove: {
                        title: __('Remove highlights'),
                        icon: 'result-nok'
                    }
                }
            }));

            this.$buttonMain = this.$buttonGroup.find('[data-key="main"]');
            this.$buttonRemove = this.$buttonGroup.find('[data-key="remove"]');

            //attach user events
            // using 'mousedown' instead of 'click' to avoid losing current selection
            this.$buttonMain.on('mousedown', function (e) {
                e.preventDefault();
                testRunner.trigger('tool-highlight');
            });

            this.$buttonRemove.on('click', function (e) {
                e.preventDefault();
                testRunner.trigger('tool-highlight-remove');
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
                .on('enabletools renderitem', function () {
                    var testContext = testRunner.getTestContext();
                    self.enable();
                    highlighter.restoreHighlight(testContext.itemIdentifier);
                })
                .on('beforeunloaditem', function() {
                    var testContext = testRunner.getTestContext();
                    highlighter.saveHighlight(testContext.itemIdentifier);
                })
                .on('disabletools unloaditem', function () {
                    self.disable();
                    highlighter.toggleHighlighting(false);
                })
                .on('tool-highlight', function () {
                    if (isEnabled()) {
                        highlighter.trigger();
                    }
                })
                .on('tool-highlight-remove', function () {
                    highlighter.clearHighlights();
                })
                .on('plugin-start.highlighter', function() {
                    self.$buttonMain.addClass('active');
                })
                .on('plugin-end.highlighter', function() {
                    self.$buttonMain.removeClass('active');
                });
        },

        /**
         * Called during the runner's render phase
         */
        render: function render() {
            var $container = this.getAreaBroker().getToolboxArea();
            $container.append(this.$buttonGroup);
        },

        /**
         * Called during the runner's destroy phase
         */
        destroy: function destroy() {
            shortcut.remove('.' + this.getName());
            $(document).off('.highlighter');
            this.$buttonRemove.remove();
        },

        /**
         * Enable the button
         */
        enable: function enable() {
            this.$buttonGroup.removeProp('disabled')
                .removeClass('disabled');
        },

        /**
         * Disable the button
         */
        disable: function disable() {
            this.$buttonGroup.prop('disabled', true)
                .addClass('disabled');
        },

        /**
         * Show the button
         */
        show: function show() {
            hider.show(this.$buttonGroup);
        },

        /**
         * Hide the button
         */
        hide: function hide() {
            hider.hide(this.$buttonGroup);
        }
    });
});
