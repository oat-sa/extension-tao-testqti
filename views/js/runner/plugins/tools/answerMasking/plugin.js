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
    var pluginName = 'answerMasking';

    /**
     * The prefix of actions triggered through the event loop
     * @type {String}
     */
    var actionPrefix = 'tool-' + pluginName + '-';

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

            var testRunner = this.getTestRunner();
            var testData = testRunner.getTestData() || {};
            var testConfig = testData.config || {};
            var pluginShortcuts = (testConfig.shortcuts || {})['answer-masking'] || {};
            var $contentArea = this.getAreaBroker().getContentArea();

            var answerMasking = answerMaskingFactory($contentArea);

            // create buttons
            this.button = this.getAreaBroker().getToolbox().createEntry({
                title: __('Answer Masking'),
                icon: 'result-nok',
                control: 'answer-masking',
                text: __('Answer Masking')
            });

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
                    answerMasking.enable();
                    self.button.turnOn();
                    testRunner.trigger('plugin-start.answer-masking');
                } else {
                    answerMasking.disable();
                    self.button.turnOff();
                    testRunner.trigger('plugin-end.answer-masking');
                }
            }

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
                .on('loaditem', togglePluginButton)
                .on('enabletools renderitem', function () {
                    togglePluginButton(); // we repeat this here as we need the rendered item markup in order to decide whether the plugin is enabled or not
                    self.enable();
                })
                .on('disabletools unloaditem', function () {
                    self.disable();
                })
                .on('tool-answerMasking-toggle', function () {
                    if (isPluginEnabled()) {
                        togglePlugin();
                    }
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
