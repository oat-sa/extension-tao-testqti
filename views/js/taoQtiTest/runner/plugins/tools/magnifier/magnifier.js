define(['lodash', 'i18n', 'taoTests/runner/plugin', 'ui/hider', 'util/shortcut', 'util/namespace', 'taoQtiTest/runner/plugins/tools/magnifier/magnifierPanel', 'taoQtiTest/runner/helpers/map'], function (_, __, pluginFactory, hider, shortcut, namespaceHelper, magnifierPanelFactory, mapHelper) { 'use strict';

    _ = _ && Object.prototype.hasOwnProperty.call(_, 'default') ? _['default'] : _;
    __ = __ && Object.prototype.hasOwnProperty.call(__, 'default') ? __['default'] : __;
    pluginFactory = pluginFactory && Object.prototype.hasOwnProperty.call(pluginFactory, 'default') ? pluginFactory['default'] : pluginFactory;
    shortcut = shortcut && Object.prototype.hasOwnProperty.call(shortcut, 'default') ? shortcut['default'] : shortcut;
    namespaceHelper = namespaceHelper && Object.prototype.hasOwnProperty.call(namespaceHelper, 'default') ? namespaceHelper['default'] : namespaceHelper;
    magnifierPanelFactory = magnifierPanelFactory && Object.prototype.hasOwnProperty.call(magnifierPanelFactory, 'default') ? magnifierPanelFactory['default'] : magnifierPanelFactory;
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
     * Copyright (c) 2016 (original work) Open Assessment Technologies SA ;
     */
    /**
     * The public name of the plugin
     * @type {String}
     */

    var pluginName = 'magnifier';
    /**
     * The prefix of actions triggered through the event loop
     * @type {String}
     */

    var actionPrefix = "tool-".concat(pluginName, "-");
    /**
     * Some default options for the plugin
     * @type {Object}
     */

    var defaultOptions = {
      zoomMin: 2,
      // Smallest magnification factor
      zoomMax: 8,
      // Biggest magnification factor
      zoomStep: 0.5 // Increment between min an max

    };
    /**
     * Returns the configured plugin
     */

    var magnifier = pluginFactory({
      name: pluginName,

      /**
       * Initializes the plugin (called during runner's init)
       */
      init: function init() {
        var self = this;
        var testRunner = this.getTestRunner();
        var testRunnerOptions = testRunner.getOptions();
        var pluginConfig = Object.assign({}, defaultOptions, this.getConfig());
        var pluginShortcuts = (testRunnerOptions.shortcuts || {})[pluginName] || {};
        var magnifierPanel = null;
        /**
         * Creates the magnifier panel on demand
         * @returns {magnifierPanel}
         * @fires plugin-magnifier-create.magnifier
         */

        function getMagnifierPanel() {
          var $container;

          if (!magnifierPanel) {
            $container = testRunner.getAreaBroker().getContainer();
            magnifierPanel = magnifierPanelFactory({
              levelMin: pluginConfig.zoomMin,
              levelMax: pluginConfig.zoomMax,
              levelStep: pluginConfig.zoomStep,
              component: {
                renderTo: $container.parent(),
                draggableContainer: $container.parent()
              }
            }).on('show', function () {
              /**
               * @event plugin-magnifier-show.magnifier
               */
              self.trigger('magnifier-show');
            }).on('hide', function () {
              /**
               * @event plugin-magnifier-hide.magnifier
               */
              self.trigger('magnifier-hide');
            }).on('zoom', function (level) {
              /**
               * @event plugin-magnifier-zoom.magnifier
               * @param {Number} zoomLevel
               */
              self.trigger('magnifier-zoom', level);
            }).on('close', function () {
              hideMagnifier();
            }).setTarget($container);
            /**
             * @event plugin-magnifier-create.magnifier
             */

            self.trigger('magnifier-create');
          }

          return magnifierPanel;
        }
        /**
         * Checks if the plugin is currently available
         * @returns {Boolean}
         */


        function isEnabled() {
          //to be activated with the special category x-tao-option-magnifier
          return mapHelper.hasItemCategory(testRunner.getTestMap(), testRunner.getTestContext().itemIdentifier, 'magnifier', true);
        }
        /**
         * Shows/hides the plugin GUI according to context
         */


        function togglePlugin() {
          if (isEnabled()) {
            self.show();
          } else {
            self.hide();
          }
        }
        /**
         * Shows/hides the magnifier
         */


        function toggleMagnifier() {
          if (self.getState('enabled')) {
            if (self.getState('active')) {
              hideMagnifier();
            } else {
              showMagnifier();
            }
          }
        }
        /**
         * Opens the magnifier panel
         * @fires plugin-magnifier-show.magnifier
         */


        function showMagnifier() {
          getMagnifierPanel();

          if (magnifierPanel.is('hidden')) {
            magnifierPanel.show();
          }

          self.button.turnOn();
          testRunner.trigger("plugin-open.".concat(pluginName));
          self.setState('active', true);
        }
        /**
         * Closes the magnifier panel
         * @fires plugin-magnifier-hide.magnifier
         */


        function hideMagnifier() {
          self.setState('active', false);
          self.button.turnOff();
          testRunner.trigger("plugin-close.".concat(pluginName));

          if (magnifierPanel && !magnifierPanel.is('hidden')) {
            magnifierPanel.hide();
          }
        } // build element


        this.button = this.getAreaBroker().getToolbox().createEntry({
          control: 'magnify',
          title: __('Displays a customisable magnifier'),
          text: __('Magnifying Glass'),
          icon: 'find'
        }); // attach behavior

        this.button.on('click', function (event) {
          event.preventDefault();
          testRunner.trigger("".concat(actionPrefix, "toggle"));
        }); // handle the plugin's shortcuts

        if (testRunnerOptions.allowShortcuts) {
          _.forEach(pluginShortcuts, function (command, key) {
            shortcut.add(namespaceHelper.namespaceAll(command, pluginName, true), function () {
              // just fire the action using the event loop
              testRunner.trigger(actionPrefix + key);
            }, {
              avoidInput: true
            });
          });
        } //start disabled


        togglePlugin();
        this.disable(); //update plugin state based on changes

        testRunner // runner life cycle
        .on('loaditem', function () {
          togglePlugin();
          self.disable();
        }).on('renderitem', function () {
          if (magnifierPanel) {
            magnifierPanel.update().zoomTo(pluginConfig.zoomMin);
          }
        }).on('enabletools renderitem', function () {
          self.enable();
        }).on('disabletools unloaditem', function () {
          if (self.getState('active')) {
            hideMagnifier();
          }

          self.disable();
        }).on('destroy', function () {
          if (magnifierPanel) {
            magnifierPanel.destroy();
          }

          magnifierPanel = null;
        }) // commands that controls the magnifier
        .on("".concat(actionPrefix, "toggle"), function () {
          if (isEnabled()) {
            toggleMagnifier();
          }
        }).on("".concat(actionPrefix, "in"), function () {
          if (isEnabled() && self.getState('enabled') && self.getState('active')) {
            getMagnifierPanel().zoomIn();
          }
        }).on("".concat(actionPrefix, "out"), function () {
          if (isEnabled() && self.getState('enabled') && self.getState('active')) {
            getMagnifierPanel().zoomOut();
          }
        }).on("".concat(actionPrefix, "close"), function () {
          if (self.getState('active')) {
            hideMagnifier();
          }
        });
      },

      /**
       * Called during the runner's destroy phase
       */
      destroy: function destroy() {
        shortcut.remove(".".concat(pluginName));
      },

      /**
       * Enables the button
       */
      enable: function enable() {
        this.button.enable();
      },

      /**
       * Disables the button
       */
      disable: function disable() {
        this.button.disable();
      },

      /**
       * Shows the button
       */
      show: function show() {
        this.button.show();
      },

      /**
       * Hides the button
       */
      hide: function hide() {
        this.button.hide();
      }
    });

    return magnifier;

});
