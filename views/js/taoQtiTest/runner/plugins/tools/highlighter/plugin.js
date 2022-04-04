define(['jquery', 'lodash', 'i18n', 'core/logger', 'taoTests/runner/plugin', 'util/shortcut', 'util/namespace', 'taoQtiTest/runner/helpers/currentItem', 'taoQtiTest/runner/plugins/tools/highlighter/collection', 'taoQtiTest/runner/helpers/map'], function ($, _, __, loggerFactory, pluginFactory, shortcut, namespaceHelper, itemHelper, highlighterCollection, mapHelper) { 'use strict';

    $ = $ && Object.prototype.hasOwnProperty.call($, 'default') ? $['default'] : $;
    _ = _ && Object.prototype.hasOwnProperty.call(_, 'default') ? _['default'] : _;
    __ = __ && Object.prototype.hasOwnProperty.call(__, 'default') ? __['default'] : __;
    loggerFactory = loggerFactory && Object.prototype.hasOwnProperty.call(loggerFactory, 'default') ? loggerFactory['default'] : loggerFactory;
    pluginFactory = pluginFactory && Object.prototype.hasOwnProperty.call(pluginFactory, 'default') ? pluginFactory['default'] : pluginFactory;
    shortcut = shortcut && Object.prototype.hasOwnProperty.call(shortcut, 'default') ? shortcut['default'] : shortcut;
    namespaceHelper = namespaceHelper && Object.prototype.hasOwnProperty.call(namespaceHelper, 'default') ? namespaceHelper['default'] : namespaceHelper;
    itemHelper = itemHelper && Object.prototype.hasOwnProperty.call(itemHelper, 'default') ? itemHelper['default'] : itemHelper;
    highlighterCollection = highlighterCollection && Object.prototype.hasOwnProperty.call(highlighterCollection, 'default') ? highlighterCollection['default'] : highlighterCollection;
    mapHelper = mapHelper && Object.prototype.hasOwnProperty.call(mapHelper, 'default') ? mapHelper['default'] : mapHelper;

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
     * Returns the configured plugin
     */

    var plugin = pluginFactory({
      name: 'highlighter',

      /**
       * Install plugin's functions
       *
       */
      install: function install() {
        var testRunner = this.getTestRunner(); //define the "highlighter" store as "volatile" (removed on browser change).

        testRunner.getTestStore().setVolatile(this.getName());
      },

      /**
       * Initialize the plugin (called during runner's init)
       * @returns {void}
       */
      init: function init() {
        var self = this;
        var testRunner = this.getTestRunner();
        var testRunnerOptions = testRunner.getOptions();
        var pluginShortcuts = (testRunnerOptions.shortcuts || {})[this.getName()] || {};
        var hasHighlights = false;
        var logger = loggerFactory('highlighterPlugin');
        /**
         * @var {Object} highlighters - Highlighters collection
         * See taoQtiTest/views/js/runner/plugins/tools/highlighter/collection.js
         */

        var highlighters = highlighterCollection(); // Create the first (item-level) highlighter instance:

        highlighters.addHighlighter({
          className: 'txt-user-highlight',
          containerSelector: '.qti-itemBody',
          containersBlackList: ['.qti-include'],
          id: 'item-highlighter'
        }); // create buttons

        this.buttonMain = this.getAreaBroker().getToolbox().createEntry({
          title: __('Highlight Text'),
          icon: 'text-marker',
          control: 'highlight-trigger',
          aria: {
            pressed: 'false',
            label: __('(Visual) Highlight Text')
          },
          text: __('Highlight')
        });
        this.buttonRemove = this.getAreaBroker().getToolbox().createEntry({
          title: __('Clear all active highlights'),
          icon: 'result-nok',
          control: 'highlight-clear',
          aria: {
            label: __('(Visual) Clear all active highlights')
          },
          text: __('Clear Highlights')
        }); // attach user events

        this.buttonMain.on('mousedown', function (e) {
          // using 'mousedown' instead of 'click' to avoid losing current selection
          e.preventDefault();

          if (isPluginEnabled()) {
            _.forEach(highlighters.getAllHighlighters(), function (instance) {
              if (instance.isEnabled()) {
                instance.highlight();
              }
            });
          }
        });
        this.buttonRemove.on('click', function (e) {
          e.preventDefault();

          if (isPluginEnabled()) {
            _.forEach(highlighters.getAllHighlighters(), function (instance) {
              if (instance.isEnabled()) {
                instance.clearHighlights();
              }
            });

            testRunner.trigger('clear');
          }
        });

        if (testRunnerOptions.allowShortcuts) {
          if (pluginShortcuts.toggle) {
            shortcut.add(namespaceHelper.namespaceAll(pluginShortcuts.toggle, this.getName(), true), function () {
              if (isPluginEnabled()) {
                _.forEach(highlighters.getAllHighlighters(), function (instance) {
                  if (instance.isEnabled()) {
                    instance.highlight();
                  }
                });
              }
            }, {
              avoidInput: true,
              prevent: true
            });
          }
        } //start disabled


        this.disable();
        /**
         * Checks if the plugin is currently available
         * @returns {Boolean}
         */

        function isPluginEnabled() {
          //to be activated with the special category x-tao-option-highlighter
          return mapHelper.hasItemCategory(testRunner.getTestMap(), testRunner.getTestContext().itemIdentifier, 'highlighter', true);
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


        return getStore().then(function (highlighterStore) {
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
              instance = highlighters.getHighlighterById(key);
            } else {
              key = itemId;
              instance = highlighters.getItemHighlighter();
            }

            if (!instance) return Promise.resolve(false);
            highlightsIndex = instance.getIndex();

            if (isPluginEnabled() && hasHighlights && key) {
              logger.debug("Saving ".concat(highlightsIndex.length, " highlights for id ").concat(key));
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
            var nonItemHighlighters = highlighters.getNonItemHighlighters();
            return Promise.all(_(nonItemHighlighters).filter(function (instance) {
              return instance.isEnabled();
            }).map(function (instance) {
              var key = instance.getId();
              return saveHighlight(null, key);
            }).value()).then(function (results) {
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
              instance = highlighters.getHighlighterById(key);
            } else {
              key = itemId;
              instance = highlighters.getItemHighlighter();
            }

            if (!instance) return Promise.resolve(false);
            return highlighterStore.getItem(key).then(function (index) {
              if (index) {
                logger.debug("Loading ".concat(index.length, " highlights for key ").concat(key));
                hasHighlights = true;
                instance.restoreIndex(index);
              }
            }).then(function () {
              //save highlighter state during the item session,
              //when the highlighting ends
              instance.on('end.save', function () {
                return saveHighlight(itemId, key);
              });
            });
          } //update plugin state based on changes


          testRunner.on('loaditem', togglePlugin).on('enabletools renderitem', function () {
            self.enable();

            if (isPluginEnabled()) {
              _.forEach(highlighters.getAllHighlighters(), function (instance) {
                if (!instance.isEnabled()) {
                  instance.on('start').toggleHighlighting(false).enable();
                }
              });
            }
          }).on('renderitem', function () {
            var textStimuli;
            var itemId = testRunner.getTestContext().itemIdentifier;

            if (itemId && isPluginEnabled()) {
              hasHighlights = false;
              highlighters.getItemHighlighter().enable(); // Load item-level highlights from store:

              loadHighlight(itemId); // Count stimuli in this item:

              textStimuli = itemHelper.getTextStimuliHrefs(testRunner); // NOW we can instantiate the extra highlighters:

              _.forEach(textStimuli, function (textStimulusHref) {
                var stimHighlighter = highlighters.getHighlighterById(textStimulusHref); // Instantiate, if id not already present in highlighters...

                if (!stimHighlighter) {
                  stimHighlighter = highlighters.addHighlighter({
                    className: 'txt-user-highlight',
                    containerSelector: ".qti-include[data-href=\"".concat(textStimulusHref, "\"]"),
                    id: textStimulusHref
                  });
                }

                stimHighlighter.enable(); // And load its data:

                loadHighlight(null, textStimulusHref);
              });
            }
          }).after('renderitem', function () {
            // Attach start/end listeners only to item level highlighter
            var instance = highlighters.getItemHighlighter();

            if (instance.isEnabled()) {
              instance.on('start', function () {
                self.buttonMain.turnOn();
                self.buttonMain.$component.attr('aria-pressed', 'true');
                self.trigger('start');
                hasHighlights = true;
              }).on('end', function () {
                self.buttonMain.turnOff();
                self.buttonMain.$component.attr('aria-pressed', 'false');
                self.trigger('end');
              });
            }
          }).after('clear.highlighter', function () {
            saveAll();
          }).before('skip move timeout', function () {
            return saveAll();
          }).on('disabletools unloaditem', function () {
            self.disable();

            if (isPluginEnabled()) {
              _.forEach(highlighters.getAllHighlighters(), function (instance) {
                if (instance.isEnabled()) {
                  instance.off('end.save end start').toggleHighlighting(false).disable();
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
        shortcut.remove(".".concat(this.getName()));
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

    return plugin;

});
