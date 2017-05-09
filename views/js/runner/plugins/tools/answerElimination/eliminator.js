
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
 * Copyright (c) 2017 (original work) Open Assessment Technologies SA;
 */

/**
 * Answer Eliminator Plugin
 *
 * While the platform's answer eliminator works on a per-item base, this variation allows
 * answer elimination on a test level. Essentially it allows to add a class 'eliminable'
 * to a choice interaction, from there the aforementioned item-based behaviour and styling takes
 * over.
 *
 * Alternative styling will be on a per customer basis and should always be published as a recipe
 * in the theme-toolkit.
 *
 * @author Dieter Raber <dieter@taotesting.com>
 */
define([
    'jquery',
    'lodash',
    'i18n',
    'ui/hider',
    'util/shortcut',
    'util/namespace',
    'taoTests/runner/plugin'
], function ($, _, __, hider, shortcut, namespaceHelper, pluginFactory){
    'use strict';

    /**
     * The public name of the plugin
     * @type {String}
     */
    var pluginName = 'eliminator';

    /**
     * The prefix of actions triggered through the event loop
     * @type {String}
     */
    var actionPrefix = 'tool-' + pluginName + '-';


    /**
     * Some default options for the plugin
     * @type {Object}
     */
    var defaultConfig = {
        // when hiding the buttons, don't remove existing eliminations
        removeEliminationsOnClose: false,
        // when showing the buttons, restore previously set eliminations
        restoreEliminationsOnOpen: false
    };



    /**
     * Returns the configured plugin
     */
    return pluginFactory({

        name: pluginName,

        /**
         * Initialize the plugin (called during runner's init)
         */
        init : function init(){
            var self = this;

            var testRunner = this.getTestRunner();
            var $container = testRunner.getAreaBroker().getContentArea().parent();
            var testConfig = testRunner.getTestData().config || {};
            var pluginShortcuts = (testConfig.shortcuts || {})[pluginName] || {};
            var config     = _.defaults(_.clone((testConfig.plugins || {})[pluginName]) || {}, defaultConfig);

            // register the button in the toolbox
            this.button = this.getAreaBroker().getToolbox().createEntry({
                control : 'eliminator',
                title : __('Eliminate choices'),
                icon : 'eliminate',
                text : __('Answer Eliminator')
            });

            /**
             * Checks if the plugin is currently available
             * @returns {Boolean}
             */
            function isPluginEnabled() {
                var context = testRunner.getTestContext() || {},
                    options = context.options || {};
                //to be activated with the special category x-tao-option-eliminator
                return !!options.eliminator;
            }

            /**
             * Is plugin activated ? if not, then we hide the plugin
             */
            function togglePluginButton() {
                if (isPluginEnabled()) {
                    self.show();
                } else {
                    self.hide();
                }
            }

            function togglePlugin() {
                if (!self.$choiceInteractions) {
                    return;
                }
                self.$choiceInteractions.toggleClass('eliminable');
                if (isEliminable()) {
                    enableEliminator();
                } else {
                    disableEliminator();
                }
            }

            function isEliminable() {
                if (!self.$choiceInteractions) {
                    return;
                }
                return self.$choiceInteractions.hasClass('eliminable');
            }

            function enableEliminator() {
                var $choices;
                if (!self.$choiceInteractions) {
                    return;
                }
                $choices = self.$choiceInteractions.find('.qti-choice');

                self.button.turnOn();
                self.trigger('start');

                if(config.restoreEliminationsOnOpen) {
                    $choices.each(function() {
                        var input = this.querySelector('.real-label input');
                        if(this.dataset.wasEliminated) {
                            this.dataset.wasEliminated = null;
                            this.classList.add('eliminated');
                            input.setAttribute('disabled', 'disabled');
                            input.checked = false;
                        }
                    });
                }
            }

            function disableEliminator() {
                var $choices;
                if (!self.$choiceInteractions) {
                    return;
                }
                $choices = self.$choiceInteractions.find('.qti-choice');

                self.$choiceInteractions.removeClass('eliminable');
                self.button.turnOff();
                self.trigger('end');

                $choices.each(function() {
                    if(this.classList.contains('eliminated')) {
                        this.dataset.wasEliminated = true;
                        this.classList.remove('eliminated');
                        this.querySelector('.real-label input').removeAttribute('disabled');
                    }
                });
            }

            //add a new mask each time the button is pressed
            this.button.on('click', function (e){
                e.preventDefault();
                testRunner.trigger(actionPrefix + 'toggle');
            });

            // handle the plugin's shortcuts
            if (testConfig.allowShortcuts) {
                _.forEach(pluginShortcuts, function (command, key) {
                    shortcut.add(namespaceHelper.namespaceAll(command, pluginName, true), function () {
                        // just fire the action using the event loop
                        testRunner.trigger(actionPrefix + key);
                    }, {
                        avoidInput: true
                    });
                });
            }

            //start disabled
            this.disable();

            //update plugin state based on changes
            testRunner
                .on('loaditem', togglePluginButton)
                .on('renderitem', function conditionalInit() {
                    // show button only when in the presence of choice interactions
                    self.$choiceInteractions = $container.find('.qti-choiceInteraction');
                    if(!self.$choiceInteractions.length) {
                        self.hide();
                        return;
                    }
                    if (isPluginEnabled()) {
                        self.show();
                    }
                })
                .on('enabletools renderitem', function (){
                    self.enable();
                })
                .on('disabletools unloaditem', function (){
                    self.disable();
                    disableEliminator();
                })

                // commands that controls the plugin
                .on(actionPrefix + 'toggle', function () {
                    if (isPluginEnabled()) {
                        togglePlugin();
                    }
                })
                // Answer-eliminator and Answer-masking are mutually exclusive tools
                .on('tool-answer-masking-toggle', function () {
                    if (isEliminable()) {
                        disableEliminator();
                    }
                });
        },

        /**
         * Called during the runner's destroy phase
         */
        destroy : function destroy(){
            shortcut.remove('.' + pluginName);
        },

        /**
         * Enable the button
         */
        enable : function enable(){
            this.button.enable();
        },

        /**
         * Disable the button
         */
        disable : function disable(){
            this.button.disable();
        },

        /**
         * Show the button
         */
        show : function show(){
            this.button.show();
        },

        /**
         * Hide the button
         */
        hide : function hide(){
            this.button.hide();
        }
    });
});
