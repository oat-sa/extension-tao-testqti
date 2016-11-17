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
 * xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
 * xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
 * xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
 * xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
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
     * If browser supports multiple ranges
     * xxxxxxxxxxxxxxxxxxxxxxx
     * @returns {Array}
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
    return function(options) {

        var testRunner = options.testRunner;

        var itemsHighlights = {};
        var isHighlighting = false;

        var highlightHelper = highlighterFactory({
            className: 'txt-user-highlight',
            containerSelector: '.qti-itemBody'
        });

        // todo: destroy this
        document.addEventListener("mouseup", function() {
            if (isHighlighting && !selection.isCollapsed) {
                highlightHelper.highlightRanges(getAllRanges());
                selection.removeAllRanges();
            }
        }, false);

        /**
         * The highlighter instance
         */
        return {
            toggleHighlighting: function toggleHighlighting(bool) {
                isHighlighting = bool;
                if (isHighlighting) {
                    testRunner.trigger('tool-highlightOn');
                    testRunner.trigger('plugin-start.highlighter');
                } else {
                    testRunner.trigger('tool-highlightOff');
                    testRunner.trigger('plugin-end.highlighter');
                }
            },

            trigger: function trigger() {
                if (!isHighlighting) {
                    if (!selection.isCollapsed) {
                        highlightHelper.highlightRanges(getAllRanges());
                        selection.removeAllRanges();
                    } else {
                        this.toggleHighlighting(true);
                    }
                } else {
                    this.toggleHighlighting(false);
                }
            },

            saveHighlight: function saveHighlight(itemId) {
                var index = highlightHelper.getHighlightIndex();
                if (index && index.length > 0) {
                    itemsHighlights[itemId] = index;
                }
            },

            restoreHighlight: function restoreHighlight(itemId) {
                var index = itemsHighlights[itemId];
                if (index && index.length > 0) {
                    highlightHelper.highlightFromIndex(index);
                }
            },

            clearHighlights: function clearHighlights() {
                highlightHelper.clearHighlights();
                selection.removeAllRanges();
            }
        };
    };
});
