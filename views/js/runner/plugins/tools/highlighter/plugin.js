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
            var itemId          = testContext.itemIdentifier;


            /**
             * @var {Array} highlighters - Highlighters collection
             * We can run multiple instances of the highlighter plugin on one page:
             * - one for item-level highlights, which persist for the Test session
             * - others for stimulus-level highlights, which should persist across multiple sessions (TAO-7617)
             */
            var highlighters = [];

            /**
             * Instantiates new highlighter and adds it to array
             * @param {Object} options
             * @param {String} options.containerSelector - selector for the unique root DOM node the HL will work on
             * @param {String} options.className - class applied to highlighted spans
             * @param {String} options.storageType - volatile or persistent
             * @param {String} options.id
             */
            function addHighlighter(options) {
                highlighters.push(highlighterFactory({
                    className: options.className,
                    containerSelector: options.containerSelector,
                    storageType: options.storageType,
                    id: options.id
                }));
            }

            // Create the first (item-level) highlighter instance:
            addHighlighter({
                className: 'txt-user-highlight',
                containerSelector: '.qti-itemBody',
                containersBlackList: ['fig'], // FIXME: blacklist stopped working
                storageType: 'volatile',
                id: 'item-highlighter'
            });

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
                    _.forEach(highlighters, function(instance) {
                        instance.highlight();
                    });
                }
            });

            this.buttonRemove.on('click', function(e) {
                e.preventDefault();
                if(isEnabled()){
                    _.forEach(highlighters, function(instance) {
                        instance.clearHighlights();
                    });
                }
            });

            if (testConfig.allowShortcuts) {
                if (pluginShortcuts.toggle) {
                    shortcut.add(namespaceHelper.namespaceAll(pluginShortcuts.toggle, this.getName(), true), function () {
                        if(isEnabled()){
                            _.forEach(highlighters, function(instance) {
                                instance.highlight();
                            });
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
             * Load the stores and hook the behavior
             */
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
                    // Filter highlighter list based on storageType:
                    return Promise.all(
                        _(highlighters)
                        .filter(function(hl) {
                            return hl.getStorageType() === 'volatile';
                        })
                        .map(function(instance) {
                            var highlightsIndex = instance.getIndex();
                            if (isEnabled() && hasHighlights && itemId) {
                                console.log('Saving', highlightsIndex.length, 'volatile highlights');
                                return highlighterVolatileStore.setItem(itemId, highlightsIndex);
                            }
                        })
                        .value()
                    ).then(function(results) {
                        // if every setItem() returned true, return true
                        return _.every(results);
                    });
                }

                /**
                 * Save the persistent highlighter state in the persistent store
                 * @returns {Promise} resolves once the save is done
                 */
                function savePersistent() {
                    // Filter highlighter list based on storageType:
                    return Promise.all(
                        _(highlighters)
                        .filter(function(hl) {
                            return hl.getStorageType() === 'persistent';
                        })
                        .map(function(instance) {
                            var highlightsIndex = instance.getIndex();
                            var key = instance.getId();
                            if (isEnabled() && hasHighlights && key) {
                                console.log('Saving', highlightsIndex.length, 'permanent highlights for id', key);
                                return highlighterPersistentStore.setItem(key, highlightsIndex);
                            }
                            return false;
                        })
                        .value()
                    ).then(function(results) {
                        // if every setItem() returned true, return true
                        return _.every(results);
                    });
                }

                /**
                 * Load the highlighters states from the store
                 * @returns {Promise} resolves once the load is done
                 */
                // function load() {
                //     return Promise.all([
                //         loadVolatile(),
                //         loadPersistent()
                //     ]);
                // }

                /**
                 * Load the volatile highlighter state from the volatile store
                 * @returns {Promise} resolves once the load is done
                 */
                function loadVolatile() {
                    return highlighterVolatileStore
                        .getItem(itemId)
                        .then(function(index){
                            console.log('getVolatile', itemId, index);
                            if (index) {
                                hasHighlights = true;
                                highlighters[0].restoreIndex(index);
                            }
                        })
                        .then(function(){
                            //save highlighter state during the item session,
                            //when the highlighting ends
                            highlighters[0].on('end.save', function() {
                                return saveVolatile();
                            });
                        });
                }

                /**
                 * Load the persistent highlighter state from the persistent store
                 * @returns {Promise} resolves once the load is done
                 */
                function loadPersistent() {
                    // Filter highlighter list based on storageType:
                    return Promise.all(
                        _(highlighters)
                        .filter(function(hl) {
                            return hl.getStorageType() === 'persistent';
                        })
                        .map(function(instance) {
                            var key = instance.getId();
                            return highlighterPersistentStore
                                .getItem(key)
                                .then(function(index) {
                                    console.log('getPersistent', key, index);
                                    if (index) {
                                        hasHighlights = true;
                                        instance.restoreIndex(index);
                                    }
                                })
                                .then(function() {
                                    //save highlighter state during the item session,
                                    //when the highlighting ends
                                    instance.on('end.save', function() {
                                        return savePersistent();
                                    });
                                })
                                .then(function() {
                                    return true;
                                });
                        })
                        .value()
                    )
                    .then(function(results) {
                        // if every setItem() returned true, return true
                        return _.every(results);
                    });
                }

                // Attach start/end listeners to all highlighter instances:
                _.forEach(highlighters, function(instance) {
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
                        // var item = mapHelper.getItemAt(testMap, testContext.itemPosition);
                        itemId = testRunner.getTestContext().itemIdentifier;
                        console.warn('loaditem', itemId);
                        togglePlugin();
                    })
                    .on('enabletools renderitem', function () {
                        self.enable();
                    })
                    .on('renderitem', function() {
                        var textStimuli;
                        // var item = mapHelper.getItemAt(testMap, testContext.itemPosition);
                        itemId = testRunner.getTestContext().itemIdentifier;
                        console.warn('renderitem', itemId);

                        // Load volatile (item-level) highlights from store:
                        if (isEnabled()) {
                            hasHighlights = false;
                            loadVolatile();
                        }

                        // Count xincludes in this item:
                        itemHelper.getStimuli(testRunner, itemId)
                            .then(function(stimuli) {
                                console.warn('stimuli in this item?', stimuli);
                                if (stimuli.length > 0) {

                                    // Filter the ones containing text:
                                    textStimuli = stimuli.filter(function(stimulusSerial) {
                                        var domNode = $('.qti-include[data-serial="' + stimulusSerial + '"]').get(0);
                                        return _(Array.from(domNode.childNodes))
                                                .some(function(child) {
                                                    return child.nodeType === child.TEXT_NODE;
                                                });
                                    });
                                    console.warn('stimuli with text:', textStimuli);

                                    // NOW we can instantiate the extra highlighters:
                                    _.forEach(textStimuli, function(textStimulusSerial, i) {
                                        addHighlighter({
                                            className: 'txt-user-highlight-stimulus' + (i+1),
                                            containerSelector: '.qti-include[data-serial="' + textStimulusSerial + '"]',
                                            storageType: 'persistent',
                                            id: textStimulusSerial
                                        });
                                    });

                                    // Load stimulus highlights from store:
                                    loadPersistent();
                                }
                            });
                    })
                    .before('skip move timeout', function() {
                        return save();
                    })
                    .on('unloaditem', function () {
                        // var item = mapHelper.getItemAt(testMap, testContext.itemPosition);
                        itemId = testRunner.getTestContext().itemIdentifier;
                        console.warn('unloaditem', itemId);
                    })
                    .on('disabletools unloaditem', function () {
                        self.disable();
                        if (isEnabled()) {
                            _.forEach(highlighters, function(instance) {
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
