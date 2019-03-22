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
 * Copyright (c) 2016-2019 (original work) Open Assessment Technologies SA ;
 */

/**
 * Test Runner Tool Plugin : Text Highlighter
 *
 * @author Christophe Noël <christophe@taotesting.com>
 * @author Martin Nicholson <martin@taotesting.com>
 */
define([
    'jquery',
    'lodash',
    'i18n',
    'core/logger',
    'core/promise',
    'taoTests/runner/plugin',
    'util/shortcut',
    'util/namespace',
    'taoQtiTest/runner/helpers/currentItem',
    'taoQtiTest/runner/plugins/tools/highlighter/highlighter'
], function ($, _, __, loggerFactory, Promise, pluginFactory, shortcut, namespaceHelper, itemHelper, highlighterFactory) {
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
            var testRunner      = this.getTestRunner();
            var testData        = testRunner.getTestData() || {};
            var testConfig      = testData.config || {};

            /**
             * @var {Boolean} persistentStorage
             * Platform-level setting for persistent, cross-browser storage of highlights (TAO-7617)
             * Uses the tool-state-server-storage option which must also be configured to sync this plugin
             * The default is false
             */
            try {
                self.persistentStorage = testConfig.plugins.highlighter.persistentStorage;
            }
            catch (e) {
                self.persistentStorage = false;
            }
            if (!self.persistentStorage) {
                //define the "highlighter" store as "volatile" (removed on browser change).
                testRunner.getTestStore().setVolatile(this.getName());
            }
        },

        /**
         * Initialize the plugin (called during runner's init)
         * @returns {void}
         */
        init: function init() {
            var self = this;

            var testRunner      = this.getTestRunner();
            var testData        = testRunner.getTestData() || {};
            var testConfig      = testData.config || {};
            var pluginShortcuts = (testConfig.shortcuts || {})[this.getName()] || {};
            var hasHighlights   = false;
            var logger          = loggerFactory('highlighterPlugin');

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
             * @param {String} options.className - class applied to highlighted spans
             * @param {String} options.containerSelector - selector for the unique root DOM node the HL will work on
             * @param {Array}  options.containersBlackList - list of children which should not receive highlights
             * @param {String} options.id
             * @returns {Object} a highlighter instance
             */
            function addHighlighter(options) {
                var hl = highlighterFactory(options);
                highlighters.push(hl);
                return hl;
            }

            // Create the first (item-level) highlighter instance:
            addHighlighter({
                className: 'txt-user-highlight',
                containerSelector: '.qti-itemBody',
                containersBlackList: ['.qti-include'],
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
                if (isPluginEnabled()) {
                    _.forEach(highlighters, function(instance) {
                        if (instance.isEnabled()) {
                            instance.highlight();
                        }
                    });
                }
            });

            this.buttonRemove.on('click', function(e) {
                e.preventDefault();
                if (isPluginEnabled()) {
                    _.forEach(highlighters, function(instance) {
                        if (instance.isEnabled()) {
                            instance.clearHighlights();
                        }
                    });
                    testRunner.trigger('clear');
                }
            });

            if (testConfig.allowShortcuts) {
                if (pluginShortcuts.toggle) {
                    shortcut.add(namespaceHelper.namespaceAll(pluginShortcuts.toggle, this.getName(), true), function () {
                        if (isPluginEnabled()) {
                            _.forEach(highlighters, function(instance) {
                                if (instance.isEnabled()) {
                                    instance.highlight();
                                }
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
            function isPluginEnabled() {
                var context = testRunner.getTestContext() || {},
                    options = context.options || {};
                //to be activated with the special category x-tao-option-highlighter
                return !!options.highlighter;
            }

            /**
             * Is plugin activated ? if not, then we hide the plugin
             */
            function togglePlugin() {
                if (isPluginEnabled()) {
                    self.show();
                } else {
                    self.hide();
                }
            }

            /**
             * Gets the browser test store
             * Can be in volatile or non-volatile mode, depending on config
             * @returns {Promise}
             */
            function getStore() {
                return testRunner.getTestStore().getStore(self.getName());
            }

            /**
             * Load the stores and hook the behavior
             */
            return getStore().then(function(highlighterStore) {

                /**
                 * Saves a highlighter's state to the appropriate store
                 * @param {String} [itemId] - must be provided to save item-level highlights,
                 *                            will be used as store key if no key provided
                 * @param {String} [key] - a key (e.g. a stimulus href) under which we store non-item-level highlights
                 * @returns {Boolean} true if save was done
                 */
                function saveHighlight(itemId, key) {
                    var instance;
                    var highlightsIndex;
                    if (!itemId) {
                        // Select correct highlighter by id:
                        instance = _(highlighters)
                            .filter(function(hl) {
                                return hl.getId() === key;
                            })
                            .first();
                    }
                    else {
                        key = itemId;
                        instance = highlighters[0];
                    }

                    if (!instance) return Promise.resolve(false);

                    highlightsIndex = instance.getIndex();

                    if (isPluginEnabled() && hasHighlights && key) {
                        logger.debug('Saving '+ highlightsIndex.length + ' highlights for id ' + key);
                        return highlighterStore.setItem(key, highlightsIndex);
                    }
                    return false;
                }

                /**
                 * Saves all the highlighters states in the store
                 * First the non-item highlighters, then the item highlighter (index 0)
                 * @returns {Promise} resolves once the save is done
                 */
                function saveAll() {
                    var nonItemHighlighters = highlighters.slice(1);
                    return Promise.all(
                        _(nonItemHighlighters)
                        .filter(function(instance) {
                            return instance.isEnabled();
                        })
                        .map(function(instance) {
                            var key = instance.getId();
                            return saveHighlight(null, key);
                        })
                        .value()
                    ).then(function(results) {
                        // Now save the main item highlight
                        // and if every setItem() returned true, return true
                        var itemId = testRunner.getTestContext().itemIdentifier;
                        return saveHighlight(itemId) && _.every(results);
                    });
                }

                /**
                 * Retrieves a highlighter's state from a store and applies it to the DOM
                 * @param {String} [itemId] - must be provided to save item-level highlights,
                 *                            will be used as store key if no key provided
                 * @param {String} [key] - a key (e.g. a stimulus href) under which we store non-item-level highlights
                 * @returns {Promise} resolves once the load is done
                 */
                function loadHighlight(itemId, key) {
                    var instance;
                    if (!itemId) {
                        // Select correct highlighter by id:
                        instance = _(highlighters)
                            .filter(function(hl) {
                                return hl.getId() === key;
                            })
                            .first();
                    }
                    else {
                        key = itemId;
                        instance = highlighters[0];
                    }

                    if (!instance) return Promise.resolve(false);

                    return highlighterStore.getItem(key)
                        .then(function(index) {
                            if (index) {
                                logger.debug('Loading ' + index.length + ' highlights for key ' + key);
                                hasHighlights = true;
                                instance.restoreIndex(index);
                            }
                        })
                        .then(function() {
                            //save highlighter state during the item session,
                            //when the highlighting ends
                            instance.on('end.save', function() {
                                return saveHighlight(itemId, key);
                            });
                        });
                }

                /**
                 * Find the list of text stimulus ids in the current item
                 * Depends on the DOM already being loaded
                 * @returns {Array}
                 */
                function getTextStimuliHrefs() {
                    var stimuli = itemHelper.getStimuliHrefs(testRunner);
                    var textStimuli;
                    if (stimuli.length > 0) {
                        // Filter the ones containing text:
                        textStimuli = stimuli.filter(function(stimulusHref) {
                            var domNode = $('.qti-include[data-href="' + stimulusHref + '"]').get(0);
                            return _(Array.from(domNode.childNodes))
                                    .some(function(child) {
                                        return child.nodeType === child.TEXT_NODE;
                                    });
                        });
                        return textStimuli;
                    }
                    return [];
                }

                //update plugin state based on changes
                testRunner
                    .on('loaditem', togglePlugin)
                    .on('enabletools renderitem', function () {
                        self.enable();
                    })
                    .on('renderitem', function() {
                        var textStimuli;
                        var itemId = testRunner.getTestContext().itemIdentifier;

                        if (itemId && isPluginEnabled()) {
                            hasHighlights = false;

                            highlighters[0].enable();
                            // Load volatile (item-level) highlights from store:
                            loadHighlight(itemId);

                            // Count stimuli in this item:
                            textStimuli = getTextStimuliHrefs();

                            // NOW we can instantiate the extra highlighters:
                            _.forEach(textStimuli, function(textStimulusHref) {
                                var stimHighlighter = highlighters.find(function(hl) {
                                    return hl.getId() === textStimulusHref;
                                });
                                // Instantiate, if id not already present in highlighters...
                                if (!stimHighlighter) {
                                    stimHighlighter = addHighlighter({
                                        className: 'txt-user-highlight',
                                        containerSelector: '.qti-include[data-href="' + textStimulusHref + '"]',
                                        id: textStimulusHref
                                    });
                                }
                                stimHighlighter.enable();
                                // And load its data:
                                loadHighlight(null, textStimulusHref);
                            });
                        }
                    })
                    .after('renderitem', function() {
                        // Attach start/end listeners to all highlighter instances:
                        _.forEach(highlighters, function(instance) {
                            if (instance.isEnabled()) {
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
                            }
                        });
                    })
                    .after('clear.highlighter', function() {
                        saveAll();
                    })
                    .before('skip move timeout', function() {
                        return saveAll();
                    })
                    .on('disabletools unloaditem', function () {
                        self.disable();
                        if (isPluginEnabled()) {
                            _.forEach(highlighters, function(instance) {
                                if (instance.isEnabled()) {
                                    instance
                                        .off('end.save')
                                        .toggleHighlighting(false)
                                        .disable();
                                }
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
