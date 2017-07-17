/*
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
 * Copyright (c) 2017 (original work) Open Assessment Technologies SA (under the project TAO-PRODUCT);
 *
 */
/**
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
    'taoQtiTest/runner/plugins/tools/answerMasking/answerMasking'
], function ($, _, __, pluginFactory, hider, shortcut, namespaceHelper, answerMaskingFactory) {
    'use strict';

    /**
     * The public name of the plugin
     * @type {String}
     */
    var pluginName = 'answer-masking';

    /**
     * The prefix of actions triggered through the event loop
     * @type {String}
     */
    var actionPrefix = 'tool-' + pluginName + '-';

    /**
     * Stores the masking state for each item in the test
     * @type {Object}
     */
    var itemStates = {};

    /**
     * Default Configuration
     */
    var defaultConfig = {
        restoreStateOnToggle: true,
        restoreStateOnMove: true
    };

    /**
     * Returns the configured plugin
     */
    return pluginFactory({

        name: pluginName,

        /**
         * Initialize the plugin (called during runner's init)
         */
        init: function init() {
            var self = this;

            var testRunner = this.getTestRunner(),
                testData = testRunner.getTestData() || {},
                testConfig = testData.config || {},
                pluginConfig = _.defaults((testConfig.plugins || {})[pluginName] || {}, defaultConfig),
                pluginShortcuts = (testConfig.shortcuts || {})[pluginName] || {},
                $contentArea = this.getAreaBroker().getContentArea();

            var answerMasking = answerMaskingFactory($contentArea);

            function isPluginEnabled() {
                var context = testRunner.getTestContext() || {},
                    options = context.options || {};
                //to be activated with the special category x-tao-option-answerMasking
                return options.answerMasking && itemContainsChoiceInteraction();
            }

            function itemContainsChoiceInteraction() {
                var $container = self.getAreaBroker().getContentArea().parent();
                return $container.find('.qti-choiceInteraction').length;
            }

            function togglePluginButton() {
                if (isPluginEnabled()) {
                    self.show();
                } else {
                    self.hide();
                }
            }

            function togglePlugin() {
                if (! answerMasking.getState('enabled')) {
                    enableMasking();
                } else {
                    disableMasking();
                }
            }

            function enableMasking() {
                var testContext = testRunner.getTestContext(),
                    itemId = testContext.itemIdentifier;

                answerMasking.enable();
                if (pluginConfig.restoreStateOnToggle) {
                    answerMasking.setMasksState(itemStates[itemId]);
                }
                self.button.turnOn();
                self.trigger('start');
            }

            function disableMasking() {
                var testContext = testRunner.getTestContext(),
                    itemId = testContext.itemIdentifier;

                if (answerMasking.getState('enabled')) {
                    itemStates[itemId] = answerMasking.getMasksState();
                }

                answerMasking.disable();
                self.button.turnOff();
                self.trigger('end');
            }

            // create buttons
            this.button = this.getAreaBroker().getToolbox().createEntry({
                title: __('Answer Masking'),
                icon: 'result-nok',
                control: 'answer-masking',
                text: __('Answer Masking')
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
                .on('loaditem', function() {
                    var testContext = testRunner.getTestContext(),
                        itemId = testContext.itemIdentifier;

                    if (! pluginConfig.restoreStateOnMove) {
                        itemStates[itemId] = [];
                    }

                    togglePluginButton();
                })
                .on('enabletools renderitem', function () {
                    togglePluginButton(); // we repeat this here as we need the rendered item markup in order to decide whether the plugin is enabled
                    self.enable();
                })
                .on('beforeunloaditem', function() {
                    disableMasking();
                })
                .on('disabletools unloaditem', function () {
                    self.disable();
                    disableMasking();
                })
                .on(actionPrefix + 'toggle', function () {
                    if (isPluginEnabled()) {
                        togglePlugin();
                    }
                })
                // Answer-eliminator and Answer-masking are mutually exclusive tools
                .on('tool-eliminator-toggle', function () {
                    disableMasking();
                });
        },

        /**
         * Called during the runner's destroy phase
         */
        destroy: function destroy() {
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
