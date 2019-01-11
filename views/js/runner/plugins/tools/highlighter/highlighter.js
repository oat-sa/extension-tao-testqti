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
    'core/eventifier',
    'ui/highlighter'
], function (
    _,
    $,
    eventifier,
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
    return function testHighlighterFactory() {

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
            className: 'txt-user-highlight',
            containerSelector: '.qti-itemBody'
        });

        //add event to automatically highlight the recently made selection if needed
        //added touch event (as from TAO-6578)
        $(document).on('mouseup.highlighter touchend.highlighter', function() {
            if (isHighlighting && !selection.isCollapsed) {
                highlightHelper.highlightRanges(getAllRanges());
                selection.removeAllRanges();
            }
        });

        /**
         * The highlighter instance
         */
        return eventifier({

            /**
             * toggle highlighting mode on and off
             * @param {Boolean} bool - wanted state
             */
            toggleHighlighting: function toggleHighlighting(bool) {
                isHighlighting = bool;
                if (isHighlighting) {
                    this.trigger('start');
                } else {
                    this.trigger('end');
                }
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
                        selection.removeAllRanges();
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
            }
        });
    };
});
