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
    'taoQtiTest/runner/plugins/tools/highlighter/highlighter'
], function ($, _, __, pluginFactory, hider, shortcut, namespaceHelper, highlighterFactory) {
    'use strict';

    /**
     * Returns the configured plugin
     */
    return pluginFactory({

        name: 'highlighter',


        /**
         * Install plugin's functions
         *
         */
        install : function install(){

            var testRunner = this.getTestRunner();

            //define the "highlighter" store as "volatile" (removed on browser change).
            testRunner.getTestStore().setVolatile(this.getName());
        },

        /**
         * Initialize the plugin (called during runner's init)
         */
        init: function init() {
            var self = this;

            var testRunner      = this.getTestRunner();
            var testData        = testRunner.getTestData() || {};
            var testConfig      = testData.config || {};
            var pluginShortcuts = (testConfig.shortcuts || {})[this.getName()] || {};
            var hasHighlights   = false;

            var highlighter = highlighterFactory();

            // create buttons
            this.buttonMain = this.getAreaBroker().getToolbox().createEntry({
                title: __('Highlight Text'),
                icon: 'text-marker',
                control: 'highlight-trigger',
                text: __('Highlight')
            });

            this.buttonRemove = this.getAreaBroker().getToolbox().createEntry({
                title: __('Clear all active highlights'),
                icon: 'result-nok',
                control: 'highlight-clear',
                text: __('Clear Highlights')
            });

            // attach user events
            this.buttonMain.on('mousedown', function(e) {
                // using 'mousedown' instead of 'click' to avoid losing current selection
                e.preventDefault();
                if(isEnabled()){
                    highlighter.highlight();
                }
            });

            this.buttonRemove.on('click', function(e) {
                e.preventDefault();
                if(isEnabled()){
                    highlighter.clearHighlights();
                }
            });

            if (testConfig.allowShortcuts) {
                if (pluginShortcuts.toggle) {
                    shortcut.add(namespaceHelper.namespaceAll(pluginShortcuts.toggle, this.getName(), true), function () {
                        if(isEnabled()){
                            highlighter.highlight();
                        }
                    }, { avoidInput: true, prevent: true });
                }
            }

            //start disabled
            this.disable();

            /**
             * Checks if the plugin is currently available
             * @returns {Boolean}
             */
            function isEnabled() {
                var context = testRunner.getTestContext() || {},
                    options = context.options || {};
                //to be activated with the special category x-tao-option-highlighter
                return !!options.highlighter;
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

            /**
             * Load the store and hook the behavior
             */
            return testRunner.getPluginStore(self.getName()).then(function(highlighterStore){

                /**
                 * Save the highlighter state in the store
                 * @returns {Promise} resolves one the save is done
                 */
                function save() {
                    var testContext = testRunner.getTestContext();
                    if(isEnabled() && hasHighlights && testContext.itemIdentifier){
                        return highlighterStore.setItem(testContext.itemIdentifier, highlighter.getIndex());
                    }
                    return Promise.resolve(false);
                }

                highlighter
                    .on('start', function(){
                        self.buttonMain.turnOn();
                        self.trigger('start');
                        hasHighlights = true;
                    })
                    .on('end', function(){
                        self.buttonMain.turnOff();
                        self.trigger('end');
                    });

                //update plugin state based on changes
                testRunner
                    .on('loaditem', togglePlugin)
                    .on('enabletools renderitem', function () {
                        self.enable();
                    })
                    .on('renderitem', function() {
                        var testContext = testRunner.getTestContext();
                        if(isEnabled()){
                            hasHighlights = false;
                            return highlighterStore
                                .getItem(testContext.itemIdentifier)
                                .then(function(index){
                                    if(index){
                                        hasHighlights = true;
                                        highlighter.restoreIndex(index);
                                    }
                                })
                                .then(function(){
                                    //save highlighter state during the item session,
                                    //when the highlighting ends
                                    highlighter.on('end.save', function(){
                                        return save();
                                    });
                                });
                        }
                    })
                    .before('skip move timeout', function() {
                        return save();
                    })
                    .on('disabletools unloaditem', function () {
                        self.disable();
                        if (isEnabled()) {
                            highlighter
                                .off('end.save')
                                .toggleHighlighting(false);
                        }
                    });
            });
        },

        /**
         * Called during the runner's destroy phase
         */
        destroy: function destroy() {
            shortcut.remove('.' + this.getName());
            $(document).off('.highlighter');
        },

        /**
         * Enable the button
         */
        enable: function enable() {
            this.buttonMain.enable();
            this.buttonRemove.enable();
        },

        /**
         * Disable the button
         */
        disable: function disable() {
            this.buttonMain.disable();
            this.buttonRemove.disable();
        },

        /**
         * Show the button
         */
        show: function show() {
            this.buttonMain.show();
            this.buttonRemove.show();
        },

        /**
         * Hide the button
         */
        hide: function hide() {
            this.buttonMain.hide();
            this.buttonRemove.hide();
        }
    });
});
