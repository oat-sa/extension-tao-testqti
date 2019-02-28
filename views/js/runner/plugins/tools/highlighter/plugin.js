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
    'taoQtiTest/runner/helpers/map',
    'taoQtiTest/runner/helpers/currentItem',
    'taoQtiTest/runner/plugins/tools/highlighter/highlighter'
], function ($, _, __, pluginFactory, hider, shortcut, namespaceHelper, mapHelper, itemHelper, highlighterFactory) {
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
            var testContext     = testRunner.getTestContext();
            var testMap         = testRunner.getTestMap();
            var pluginShortcuts = (testConfig.shortcuts || {})[this.getName()] || {};
            var hasHighlights   = false;

            // we may need to run two highlighter plugins on one page:
            // - one for item-level highlights, which persist for the Test session
            // - another for stimulus-level highlights, which should persist across multiple sessions
            //
            // TODO: load 2nd highlighter *only when item contains stimuli*
            var highlighter = highlighterFactory({
                className: 'txt-user-highlight',
                containerSelector: '.qti-itemBody',
                containersBlackList: ['fig'],
                id: 'highlighter'
            });
            var stimulusHighlighter = highlighterFactory({
                className: 'txt-user-highlight-stimulus',
                containerSelector: 'fig.qti-include',
                id: 'stimulusHighlighter'
            });
            // TODO: possibly store them in array and use _.foreach to avoid duplication
            // (might not be worth it)
            // var highlighters = [];

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
                    stimulusHighlighter.highlight();
                }
            });

            this.buttonRemove.on('click', function(e) {
                e.preventDefault();
                if(isEnabled()){
                    highlighter.clearHighlights();
                    stimulusHighlighter.clearHighlights();
                }
            });

            if (testConfig.allowShortcuts) {
                if (pluginShortcuts.toggle) {
                    shortcut.add(namespaceHelper.namespaceAll(pluginShortcuts.toggle, this.getName(), true), function () {
                        if(isEnabled()){
                            highlighter.highlight();
                            stimulusHighlighter.highlight();
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
             * Gets a volatile store for temporary state
             * @returns {Promise}
             */
            function getVolatileStore() {
                return testRunner.getTestStore().getStore(self.getName()); // 'highlighter'
            }

            /**
             * Gets a second, non-volatile store for persisted state
             * @returns {Promise}
             */
            function getPersistentStore() {
                return testRunner.getTestStore().getStore(self.getName() + '-persistent'); // 'highlighter-persistent'
            }

            /**
             * Load the store and hook the behavior
             */
            //return testRunner.getPluginStore(self.getName()).then(function(highlighterStore){
            return Promise.all([
                getVolatileStore(),
                getPersistentStore()
            ])
            .then(function(stores) {
                var highlighterVolatileStore = stores[0];
                var highlighterPersistentStore = stores[1];

                /**
                 * Save the highlighter state in the store
                 * @returns {Promise} resolves one the save is done
                 */
                function save() {
                    return Promise.all([
                        saveVolatile(),
                        savePersistent()
                    ]);
                }

                /**
                 * Save the highlighter state in the store
                 * @returns {Promise} resolves once the save is done
                 */
                function saveVolatile() {
                    var volatileHighlights = highlighter.getIndex();
                    if(isEnabled() && hasHighlights && testContext.itemIdentifier){
                        console.log('Saving', volatileHighlights.length, 'volatile highlights');
                        return highlighterVolatileStore.setItem(testContext.itemIdentifier, volatileHighlights);
                    }
                    return Promise.resolve(false);
                }

                /**
                 * Save the persistent highlighter state in the persistent store
                 * @returns {Promise} resolves once the save is done
                 */
                function savePersistent() {
                    var stimulusHighlights = stimulusHighlighter.getIndex();
                    if (isEnabled() && hasHighlights && testContext.itemIdentifier) {
                        console.log('Saving', stimulusHighlights.length, 'permanent highlights');
                        return highlighterPersistentStore.setItem(testContext.itemIdentifier, stimulusHighlights);
                    }
                    return Promise.resolve(false);
                }

                /**
                 * Save the highlighter state in the store
                 * @returns {Promise} resolves one the save is done
                 */
                function load() {
                    return Promise.all([
                        loadVolatile(),
                        loadPersistent()
                    ]);
                }

                /**
                 * Load the volatile highlighter state from the volatile store
                 * @returns {Promise} resolves once the load is done
                 */
                function loadVolatile() {
                    return highlighterVolatileStore
                        .getItem(testContext.itemIdentifier)
                        .then(function(index){
                            console.log('getVolatile', testContext.itemIdentifier, index);
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

                /**
                 * Load the persistent highlighter state from the persistent store
                 * @returns {Promise} resolves once the load is done
                 */
                function loadPersistent() {
                    return highlighterPersistentStore
                        .getItem(testContext.itemIdentifier) // which stimulus?
                        .then(function(index){
                            console.log('getPersistent', testContext.itemIdentifier, index);
                            if(index){
                                hasHighlights = true;
                                stimulusHighlighter.restoreIndex(index);
                            }
                        })
                        .then(function(){
                            //save highlighter state during the item session,
                            //when the highlighting ends
                            stimulusHighlighter.on('end.save', function(){
                                return save();
                            });
                        });
                }

                // attach start/end listeners to all highlighter instances
                _.forEach([highlighter, stimulusHighlighter], function(instance) {
                    instance
                        .on('start', function(){
                            self.buttonMain.turnOn();
                            self.trigger('start');
                            hasHighlights = true;
                        })
                        .on('end', function(){
                            self.buttonMain.turnOff();
                            self.trigger('end');
                        });
                });

                //update plugin state based on changes
                testRunner
                    .on('loaditem', function() {
                        //get item id & stimulus filename
                        var item = mapHelper.getItemAt(testMap, testContext.itemPosition);
                        itemHelper.containsStimulus(testRunner, item.id)
                            .then(function(stimCheck) {
                                console.warn('stimulus in this item?', stimCheck);
                                // NOW we can instantiate the stimulusHighlighter, etc (but how many?)
                            });

                        togglePlugin();
                    })
                    .on('enabletools renderitem', function () {
                        self.enable();
                    })
                    .on('renderitem', function() {
                        if (isEnabled()) {
                            hasHighlights = false;
                            return load();
                        }
                    })
                    .before('skip move timeout', function() {
                        return save();
                    })
                    .on('disabletools unloaditem', function () {
                        self.disable();
                        if (isEnabled()) {
                            _.forEach([highlighter, stimulusHighlighter], function(instance) {
                                instance
                                    .off('end.save')
                                    .toggleHighlighting(false);
                            });
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
