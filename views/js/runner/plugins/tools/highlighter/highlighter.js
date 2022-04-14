define(['lodash', 'jquery', 'core/eventifier', 'ui/highlighter'], function (_, $, eventifier, highlighterFactory) { 'use strict';

    _ = _ && Object.prototype.hasOwnProperty.call(_, 'default') ? _['default'] : _;
    $ = $ && Object.prototype.hasOwnProperty.call($, 'default') ? $['default'] : $;
    eventifier = eventifier && Object.prototype.hasOwnProperty.call(eventifier, 'default') ? eventifier['default'] : eventifier;
    highlighterFactory = highlighterFactory && Object.prototype.hasOwnProperty.call(highlighterFactory, 'default') ? highlighterFactory['default'] : highlighterFactory;

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
     * Copyright (c) 2016 (original work) Open Assessment Technologies SA;
     */
    var prevSelection = [];
    var selection;
    if (!window.getSelection) throw new Error('Browser does not support getSelection()');
    selection = window.getSelection();
    /**
     * Returns an array of active ranges.
     * If browser doesn't support multiple Ranges, returns only the first range
     * see note on https://w3c.github.io/selection-api/#methods
     *
     * @returns {Range[]}
     */

    function getAllRanges() {
      var i,
          allRanges = [];

      for (i = 0; i < selection.rangeCount; i++) {
        allRanges.push(selection.getRangeAt(i));
      }

      return allRanges;
    }
    /**
     * Discards the global text selection from the browser (window.selection)
     */


    function discardSelection() {
      // delay discarding, to allow time for multiple highlighters logic
      setTimeout(function () {
        selection.removeAllRanges();
      }, 250);
    }
    /**
     * The highlighter Factory
     * @param {Object} options
     * @param {String} [options.className]
     * @param {String} [options.containerSelector]
     * @param {Array} [options.containersBlackList]
     * @param {String} [options.id]
     * @returns {Object} the highlighter instance
     */


    function testHighlighterFactory(options) {
      /**
       * Is this highlighter enabled or disabled?
       * @type {boolean}
       */
      var enabled = true;
      /**
       * Are we in highlight mode, meaning that each new selection is automatically highlighted
       * without having to press any button
       * @type {boolean}
       */

      var isHighlighting = false;
      /**
       * The helper that does the highlight magic
       */

      var highlightHelper = highlighterFactory({
        className: options.className || 'txt-user-highlight',
        containerSelector: options.containerSelector || '.qti-itemBody',
        containersBlackList: options.containersBlackList || [],
        clearOnClick: true
      }); //add event to automatically highlight the recently made selection if needed

      $(document).on('mouseup.highlighter', function () {
        if (isHighlighting && !selection.isCollapsed) {
          highlightHelper.highlightRanges(getAllRanges());
          discardSelection();
        }
      }); //add event to automatically highlight the recently made selection if needed
      //added touch event (as from TAO-6578)

      $(document).on('touchend.highlighter', function () {
        if (isHighlighting && !selection.isCollapsed) {
          highlightHelper.highlightRanges(getAllRanges());
        }
      }); // iOS devices clears selection after click on button,
      // so we store prev selection for this devices to be able
      // to use it after click on highlight button

      if (/iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream) {
        $(document).on('selectionchange', function () {
          if (!isHighlighting) {
            prevSelection = _.clone(getAllRanges(), true);
          }
        });
      }
      /**
       * The highlighter instance
       */


      return eventifier({
        /**
         * Enable this instance
         */
        enable: function enable() {
          enabled = true;
        },

        /**
         * Disable this instance
         */
        disable: function disable() {
          enabled = false;
        },

        /**
         * Is this instance currently enabled?
         * @returns {Boolean}
         */
        isEnabled: function isEnabled() {
          return enabled;
        },

        /**
         * toggle highlighting mode on and off
         * @param {Boolean} bool - wanted state
         */
        toggleHighlighting: function toggleHighlighting(bool) {
          isHighlighting = bool;

          if (isHighlighting) {
            this.trigger('start');
            $('.qti-itemBody').toggleClass('highlighter-cursor', true);
          } else {
            this.trigger('end');
            $('.qti-itemBody').toggleClass('highlighter-cursor', false);
          }

          return this;
        },

        /**
         * Either highlight the current or selection, or toggle highlighting mode
         */
        highlight: function highlight() {
          if (!isHighlighting) {
            if (!selection.isCollapsed) {
              this.toggleHighlighting(true);
              highlightHelper.highlightRanges(getAllRanges());
              this.toggleHighlighting(false);
              discardSelection();
            } else if (prevSelection[0] && !prevSelection[0].collapsed) {
              this.toggleHighlighting(true);
              highlightHelper.highlightRanges(prevSelection);
              this.toggleHighlighting(false);
              discardSelection();
            } else {
              this.toggleHighlighting(true);
            }
          } else {
            this.toggleHighlighting(false);
          }
        },

        /**
         * restore the highlight from a given index
         * @param {Array} index
         */
        restoreIndex: function restoreIndex(index) {
          if (index && index.length > 0) {
            highlightHelper.highlightFromIndex(index);
          }
        },

        /**
         * Get the current index
         * @returns {Array} index
         */
        getIndex: function getIndex() {
          return highlightHelper.getHighlightIndex();
        },

        /**
         * remove all highlights
         */
        clearHighlights: function clearHighlights() {
          highlightHelper.clearHighlights();
          selection.removeAllRanges();
        },

        /**
         * Getter for the instance's id
         * @returns {String}
         */
        getId: function getId() {
          return options.id;
        }
      });
    }

    return testHighlighterFactory;

});
