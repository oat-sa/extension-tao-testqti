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
        //console.warn('getAllRanges()', allRanges);
        return allRanges;
    }

    /**
     * The highlighter Factory
     * @param {Object} options
     * @param {String} [options.className]
     * @param {String} [options.containerSelector]
     * @param {Array} [options.containersBlackList]
     * @param {String} [options.id]
     * @returns {Object} the highlighter plugin
     */
    return function testHighlighterFactory(options) {

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
            id: options.id
        });

        //add event to automatically highlight the recently made selection if needed
        //added touch event (as from TAO-6578)
        $(document).on('mouseup.highlighter touchend.highlighter', function() {
            if (isHighlighting && !selection.isCollapsed) {
                highlightHelper.highlightRanges(getAllRanges());
                // delay discarding the global selection, to allow time for multiple highlighters to complete their work
                setTimeout(function() {
                    selection.removeAllRanges();
                }, 250);
            }
        });

        /**
         * The highlighter instance
         */
        return eventifier({

            enable: function enable() {
                enabled = true;
            },

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
                } else {
                    this.trigger('end');
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
                        // delay discarding the global selection, to allow time for multiple highlighters logic
                        setTimeout(function() {
                            selection.removeAllRanges();
                        }, 250);
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
    };
});
