define(['lodash', 'i18n', 'taoTests/runner/plugin', 'ui/hider', 'util/shortcut', 'util/namespace', 'taoQtiTest/runner/helpers/map', 'taoQtiTest/runner/plugins/tools/lineReader/compoundMask'], function (_, __, pluginFactory, hider, shortcut, namespaceHelper, mapHelper, compoundMaskFactory) { 'use strict';

    _ = _ && Object.prototype.hasOwnProperty.call(_, 'default') ? _['default'] : _;
    __ = __ && Object.prototype.hasOwnProperty.call(__, 'default') ? __['default'] : __;
    pluginFactory = pluginFactory && Object.prototype.hasOwnProperty.call(pluginFactory, 'default') ? pluginFactory['default'] : pluginFactory;
    shortcut = shortcut && Object.prototype.hasOwnProperty.call(shortcut, 'default') ? shortcut['default'] : shortcut;
    namespaceHelper = namespaceHelper && Object.prototype.hasOwnProperty.call(namespaceHelper, 'default') ? namespaceHelper['default'] : namespaceHelper;
    mapHelper = mapHelper && Object.prototype.hasOwnProperty.call(mapHelper, 'default') ? mapHelper['default'] : mapHelper;
    compoundMaskFactory = compoundMaskFactory && Object.prototype.hasOwnProperty.call(compoundMaskFactory, 'default') ? compoundMaskFactory['default'] : compoundMaskFactory;

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

    var pluginName = 'line-reader';
    /**
     * The prefix of actions triggered through the event loop
     * @type {String}
     */

    var actionPrefix = "tool-".concat(pluginName, "-");
    /**
     * Options for the compoundMask factory
     * @type {Object}
     */

    var maskOptions = {
      dragMinWidth: 17,
      dragMinHeight: 7,
      resizeHandleSize: 7,
      innerDragHeight: 20
    };
    var dimensions, position;
    /**
     * These functions are a first effort to place the mask on the first line on the item
     * They make a lot of assumptions:
     * - the item starts with a text
     * - the padding is set on the .qti-item container
     * - the padding is consistent with the minWidth/minHeight configuration of the mask
     * - and some other...
     * @param {jQuery} $container - where the mask is appended
     */

    function getDimensions($container) {
      var $qtiContent = $container.find('#qti-content'),
          $qtiItem = $qtiContent.find('.qti-item'),
          lineHeight = Math.ceil(parseFloat($qtiContent.css('line-height'))) || 20; // reasonable default line height

      return {
        outerWidth: $qtiItem.width() + maskOptions.resizeHandleSize * 4 + maskOptions.dragMinWidth * 2,
        outerHeight: 175,
        // reasonable default height
        innerWidth: $qtiItem.width(),
        innerHeight: lineHeight
      };
    }

    function getPosition($container) {
      var $qtiContent = $container.find('#qti-content'),
          $qtiItem = $qtiContent.find('.qti-item'),
          itemPosition = $qtiItem.position() || {},
          paddingLeft = parseInt($qtiItem.css('padding-left'), 10),
          paddingTop = parseInt($qtiItem.css('padding-top'), 10),
          textPadding = 3,
          // this is to let the text breathe a bit
      innerX = parseInt(itemPosition.left, 10) + paddingLeft - textPadding,
          innerY = parseInt(itemPosition.top, 10) + paddingTop - textPadding;
      return {
        outerX: innerX - maskOptions.resizeHandleSize * 2 - maskOptions.dragMinWidth,
        outerY: 0,
        innerX: innerX,
        innerY: innerY
      };
    }

    function containerWidthHasChanged($container) {
      var newDimensions = getDimensions($container);
      return newDimensions.outerWidth !== dimensions.outerWidth;
    }
    /**
     * Returns the configured plugin
     */


    var plugin = pluginFactory({
      name: pluginName,

      /**
       * Initialize the plugin (called during runner's init)
       */
      init: function init() {
        var self = this;
        var testRunner = this.getTestRunner();
        var testRunnerOptions = testRunner.getOptions();
        var pluginShortcuts = (testRunnerOptions.shortcuts || {})[pluginName] || {};
        var $container = testRunner.getAreaBroker().getContentArea().parent();
        this.compoundMask = compoundMaskFactory(maskOptions).init().render($container).on('close', function () {
          closeMask();
        }).hide();
        /**
         * Checks if the plugin is currently available
         * @returns {Boolean}
         */

        function isEnabled() {
          //to be activated with the special category x-tao-option-lineReader
          return mapHelper.hasItemCategory(testRunner.getTestMap(), testRunner.getTestContext().itemIdentifier, 'lineReader', true);
        }

        function toggleButton() {
          if (isEnabled()) {
            self.show();
          } else {
            self.hide();
          }
        }

        function toggleMask() {
          if (self.compoundMask.getState('hidden')) {
            if (containerWidthHasChanged($container)) {
              transformMask($container);
            }

            openMask();
          } else {
            closeMask();
          }
        }

        function openMask() {
          self.compoundMask.show();
          self.trigger('start');
          self.button.turnOn();
        }

        function closeMask() {
          if (!self.compoundMask.getState('hidden')) {
            self.compoundMask.hide();
          }

          self.trigger('end');
          self.button.turnOff();
        }

        function transformMask($maskContainer) {
          dimensions = getDimensions($maskContainer);
          position = getPosition($maskContainer);
          self.compoundMask.setTransforms(_.clone(dimensions), _.clone(position));
        } // create button


        this.button = this.getAreaBroker().getToolbox().createEntry({
          title: __('Line Reader'),
          icon: 'insert-horizontal-line',
          control: 'line-reader',
          text: __('Line Reader')
        }); // attach user events

        this.button.on('click', function (e) {
          e.preventDefault();
          testRunner.trigger("".concat(actionPrefix, "toggle"));
        });

        if (testRunnerOptions.allowShortcuts) {
          if (pluginShortcuts.toggle) {
            shortcut.add(namespaceHelper.namespaceAll(pluginShortcuts.toggle, this.getName(), true), function () {
              testRunner.trigger("".concat(actionPrefix, "toggle"));
            }, {
              avoidInput: true,
              prevent: true
            });
          }
        } //start disabled


        this.disable(); //update plugin state based on changes

        testRunner.on('loaditem', toggleButton).on('renderitem', function () {
          transformMask($container);
        }).on('enabletools renderitem', function () {
          self.enable();
        }).on('disabletools unloaditem', function () {
          self.disable();
          closeMask();
        }).on("".concat(actionPrefix, "toggle"), function () {
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
        shortcut.remove(".".concat(this.getName()));
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

    return plugin;

});
