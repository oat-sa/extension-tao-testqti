define(['jquery', 'taoTests/runner/plugin'], function ($, pluginFactory) { 'use strict';

    $ = $ && Object.prototype.hasOwnProperty.call($, 'default') ? $['default'] : $;
    pluginFactory = pluginFactory && Object.prototype.hasOwnProperty.call(pluginFactory, 'default') ? pluginFactory['default'] : pluginFactory;

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
     * Returns the configured plugin
     */

    var overlay = pluginFactory({
      name: 'overlay',

      /**
       * Initialize the plugin (called during runner's init)
       */
      init: function init() {
        var self = this;
        var testRunner = this.getTestRunner();
        this.$element = $('<div />');
        this.$element.on('click mousedown mouseup touchstart touchend keyup keydow keypress scroll drop', function (e) {
          e.stopImmediatePropagation();
          e.stopPropagation();
        });

        var shield = function shield() {
          self.enable();
        };

        var unshield = function unshield() {
          self.disable();
        }; //change plugin state


        testRunner.on('disableitem', shield).on('enableitem unloaditem modalFeedbacks', unshield);
      },

      /**
       * Called during the runner's render phase
       */
      render: function render() {
        var $contentArea = this.getTestRunner().getAreaBroker().getContentArea();
        $contentArea.after(this.$element);
      },

      /**
       * Called during the runner's destroy phase
       */
      destroy: function destroy() {
        this.$element.remove();
      },

      /**
       * Enable the overlay
       */
      enable: function enable() {
        var overlayConfig = this.getConfig();
        this.$element.addClass('overlay');

        if (overlayConfig.full) {
          this.$element.addClass('overlay-full');
        }
      },

      /**
       * Disable the overlay
       */
      disable: function disable() {
        this.$element.removeClass('overlay overlay-full');
      },

      /**
       * Show the overlay
       */
      show: function show() {
        this.enable();
      },

      /**
       * Hide the overlay
       */
      hide: function hide() {
        this.disable();
      }
    });

    return overlay;

});
