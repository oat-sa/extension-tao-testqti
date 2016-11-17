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
    'tpl!taoQtiTest/runner/plugins/navigation/button',
    'tpl!taoAct/runner/plugins/templates/button-group'
], function ($, _, __, pluginFactory, hider, shortcut, namespaceHelper, highlighterFactory, buttonTpl, buttonGroupTpl) {
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

            var highlighter = highlighterFactory({
                testRunner: testRunner
            });

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
            // mousedown is used on purpose instead of click to avoid losing current selection
            this.$buttonMain.on('mousedown', function (e) {
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

            this.$buttonRemove.on('click', function (e) {
                e.preventDefault();
                testRunner.trigger('tool-highlight-remove');
            });

            //start disabled
            this.disable();

            //update plugin state based on changes
            testRunner
                .on('loaditem', function () {
                    self.show();
                })
                .on('renderitem', function () {
                    var testContext = testRunner.getTestContext();
                    self.enable();
                    highlighter.restoreHighlight(testContext.itemIdentifier);
                    addClosingButton();
                })
                .on('beforeunloaditem', function() {
                    var testContext = testRunner.getTestContext();
                    highlighter.saveHighlight(testContext.itemIdentifier);
                })
                .on('unloaditem', function () {
                    highlighter.toggleHighlighting(false);
                    self.disable();
                })
                .on('tool-highlight', function () {
                    if (isEnabled()) {
                        highlighter.trigger();
                        addClosingButton();
                    }
                })
                .on('tool-highlight-remove', function () {
                    highlighter.clearHighlights();
                })
                .on('tool-highlightOn', function() {
                    self.$buttonMain.addClass('active');
                })
                .on('tool-highlightOff', function() {
                    self.$buttonMain.removeClass('active');
                });


            function addClosingButton() {
                // var container = document.getElementsByClassName('qti-itemBody')[0];
                // container.addEventListener('mouseover', function(event) {
                //     var hovered = document.elementFromPoint(event.pageX, event.pageY);
                //     console.dir(hovered);
                // });
                var $closer = $('<span>', {
                    'data-control': 'hl-delete'
                }).append($('<span>', {
                    'class': 'icon icon-result-nok'
                }));

                var currentHighlightedGroup

                //
                var $container = $('.qti-itemBody');
                $container.find('.txt-user-highlight').off('.highlighter');
                $container.find('.txt-user-highlight').on('mouseover.highlighter', function() {
                    var groupId = $(this).attr('data-hl-group');
                    var $closerContainer = $container.find('[data-hl-group=' + groupId + ']').last();
                    currentHighlightedGroup = groupId;
                    $closerContainer.append($closer);
                });
                $container.find('.txt-user-highlight').on('mouseout.highlighter', _.debounce(function() {

                    $closer.remove();
                }, 150));
            }

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
            hider.hide(this.$form);
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
