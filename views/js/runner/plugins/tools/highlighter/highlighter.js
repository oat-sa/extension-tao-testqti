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
/**
 * This plugin allows the test taker to select text inside an item.
 * Highlight is preserved when navigating between items
 *
 * @author Christophe Noël <christophe@taotesting.com>
 */
define([
    'lodash',
    'jquery',
    'ui/highlighter'
], function (
    _,
    $,
    highlighterFactory
) {
    'use strict';
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
        var i, allRanges = [];

        for (i = 0; i < selection.rangeCount; i++) {
            allRanges.push(selection.getRangeAt(i));
        }
        return allRanges;
    }

    /**
     * The highlighter Factory
     */
    return function(testRunner) {

        /**
         * Are we in highlight mode, meaning that each new selection is automatically highlighted
         * without having to press any button
         * @type {boolean}
         */
        var isHighlighting = false;

        /**
         * Store, for each item, an array containing the its highlight index
         * @type {Object}
         */
        var itemsHighlights = {};

        /**
         * The helper that does the highlight magic
         */
        var highlightHelper = highlighterFactory({
            className: 'txt-user-highlight',
            containerSelector: '.qti-itemBody'
        });

        // add event to automatically highlight the recently made selection if needed
        $(document).on('mouseup.highlighter', function() {
            if (isHighlighting && !selection.isCollapsed) {
                highlightHelper.highlightRanges(getAllRanges());
                selection.removeAllRanges();
            }
        });

        /**
         * The highlighter instance
         */
        return {
            /**
             * toggle highlighting mode on and off
             * @param {Boolean} bool - wanted state
             */
            toggleHighlighting: function toggleHighlighting(bool) {
                isHighlighting = bool;
                if (isHighlighting) {
                    testRunner.trigger('plugin-start.highlighter');
                } else {
                    testRunner.trigger('plugin-end.highlighter');
                }
            },

            /**
             * Either highlight the current or selection, or toggle highlighting mode
             */
            trigger: function trigger() {
                if (!isHighlighting) {
                    if (!selection.isCollapsed) {
                        testRunner.trigger('plugin-start.highlighter');
                        highlightHelper.highlightRanges(getAllRanges());
                        testRunner.trigger('plugin-end.highlighter');
                        selection.removeAllRanges();
                    } else {
                        this.toggleHighlighting(true);
                    }
                } else {
                    this.toggleHighlighting(false);
                }
            },

            /**
             * save the highlight index for the current item
             * @param itemId
             */
            saveHighlight: function saveHighlight(itemId) {
                var index = highlightHelper.getHighlightIndex();
                if (index && index.length > 0) {
                    itemsHighlights[itemId] = index;
                }
            },


            /**
             * restore the highlight index on the current item
             * @param itemId
             */
            restoreHighlight: function restoreHighlight(itemId) {
                var index = itemsHighlights[itemId];
                if (index && index.length > 0) {
                    highlightHelper.highlightFromIndex(index);
                }
            },

            /**
             * remove all highlights
             */
            clearHighlights: function clearHighlights() {
                highlightHelper.clearHighlights();
                selection.removeAllRanges();
            }
        };
    };
});
