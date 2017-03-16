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
 * Test Runner Tool Plugin : Line Reader
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
    'taoQtiTest/runner/plugins/tools/lineReader/compoundMask'
], function ($, _, __, pluginFactory, hider, shortcut, namespaceHelper, compoundMaskFactory) {
    'use strict';

    /**
     * The public name of the plugin
     * @type {String}
     */
    var pluginName = 'line-reader';

    /**
     * The prefix of actions triggered through the event loop
     * @type {String}
     */
    var actionPrefix = 'tool-' + pluginName + '-';


    // we assume here that the content area has a uniform padding of 30
    function setMaskTransforms($container, compoundMask) {
        var dimensions,
            position,
            $qtiContent = $container.find('#qti-content'),
            contentPosition = $qtiContent.position();

        dimensions = {
            outerWidth:     $container.width(),
            outerHeight:    200, // reasonable default height to allow vertical moving
            innerWidth:     $qtiContent.width(),
            innerHeight:    20   // reasonable default line height
        };

        position = {
            outerX: 0,
            outerY: 0,
            innerX: contentPosition.left + 25,
            innerY: contentPosition.top + 25
        };

        compoundMask.setTransforms(dimensions, position);
    }


    /**
     * Returns the configured plugin
     */
    return pluginFactory({

        name: pluginName,

        /**
         * Initialize the plugin (called during runner's init)
         */
        init: function init() {
            var self = this,

                testRunner = this.getTestRunner(),
                testData = testRunner.getTestData() || {},
                testConfig = testData.config || {},
                pluginShortcuts = (testConfig.shortcuts || {})[pluginName] || {},
                $container = testRunner.getAreaBroker().getContentArea().parent();

            this.compoundMask = compoundMaskFactory({
                minWidth: 25,
                minHeight: 25,
                resizeHandleSize: 10
            })
                .init()
                .render($container)
                .hide();

            /**
             * Checks if the plugin is currently available
             * @returns {Boolean}
             */
            function isEnabled() {
                var context = testRunner.getTestContext() || {},
                    options = context.options || {};
                //to be activated with the special category x-tao-option-lineReader
                return !!options.lineReader;
            }

            /**
             * Is plugin activated ? if not, then we hide the button
             */
            function toggleButton() {
                if (isEnabled()) {
                    self.show();
                } else {
                    self.hide();
                }
            }

            function toggleMask() {
                if (self.compoundMask.getState('hidden')) {
                    setMaskTransforms($container, self.compoundMask);
                    showMask();
                } else {
                    hideMask();
                }
            }

            function showMask() {
                testRunner.trigger('plugin-start.' + pluginName);
                self.button.turnOn();
                self.compoundMask.show();
            }

            function hideMask() {
                testRunner.trigger('plugin-end.' + pluginName);
                self.button.turnOff();
                self.compoundMask.hide();
            }

            // create button
            this.button = this.getAreaBroker().getToolbox().createEntry({
                title: __('Line Reader'),
                icon: 'insert-horizontal-line',
                control: 'line-reader',
                text: __('Line Reader')
            });

            // attach user events
            this.button
                .on('click', function(e) {
                    e.preventDefault();
                    testRunner.trigger(actionPrefix + 'toggle');
                });

            if (testConfig.allowShortcuts) {
                if (pluginShortcuts.toggle) {
                    shortcut.add(namespaceHelper.namespaceAll(pluginShortcuts.toggle, this.getName(), true), function () {
                        testRunner.trigger(actionPrefix + 'toggle');
                    }, { avoidInput: true, prevent: true });
                }
            }

            //start disabled
            this.disable();

            //update plugin state based on changes
            testRunner
                .on('loaditem', toggleButton)
                .on('renderitem', function() {
                    setMaskTransforms($container, self.compoundMask);
                })
                .on('enabletools renderitem', function () {
                    self.enable();
                })
                .on('disabletools unloaditem', function () {
                    self.disable();
                    hideMask();
                })
                .on(actionPrefix + 'toggle', function () {
                    if (isEnabled()) {
                        toggleMask();
                    }
                });
        },

        /**
         * Called during the runner's destroy phase
         */
        destroy: function destroy() {
            this.compoundMask.destroy();
            shortcut.remove('.' + this.getName());
        },

        /**
         * Enable the button
         */
        enable: function enable() {
            this.button.enable();
        },

        /**
         * Disable the button
         */
        disable: function disable() {
            this.button.disable();
        },

        /**
         * Show the button
         */
        show: function show() {
            this.button.show();
        },

        /**
         * Hide the button
         */
        hide: function hide() {
            this.button.hide();
        }
    });
});
