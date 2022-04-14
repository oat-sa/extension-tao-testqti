define(['taoQtiTest/runner/plugins/tools/highlighter/highlighter'], function (highlighterFactory) { 'use strict';

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
     * Copyright (c) 2019 (original work) Open Assessment Technologies SA ;
     */
    /**
     * @var {Array} highlighters - Highlighters collection
     * We can run multiple instances of the highlighter plugin on one page:
     * - one for item-level highlights, which persist for the Test session
     * - others for stimulus-level highlights, which should persist across multiple sessions (TAO-7617)
     */

    var highlighters = [];
    /**
     * @typedef {highlighterCollection}
     * @returns {Object}
     */

    var highlighterCollection = function highlighterCollection() {
      return {
        /**
         * Instantiates new highlighter and adds it to array
         * @param {Object} options
         * @param {String} options.className - class applied to highlighted spans
         * @param {String} options.containerSelector - selector for the unique root DOM node the HL will work on
         * @param {Array}  options.containersBlackList - list of children which should not receive highlights
         * @param {String} options.id
         * @returns {Object} a highlighter instance
         */
        addHighlighter: function addHighlighter(options) {
          var hl = highlighterFactory(options);
          highlighters.push(hl);
          return hl;
        },

        /**
         * Retrieves one highlighter from the collection by matching its id
         * @param {String} id
         * @returns {Object} highlighter instance
         */
        getHighlighterById: function getHighlighterById(id) {
          return highlighters.find(function (hl) {
            return hl.getId() === id;
          });
        },

        /**
         * Retrieves the full array of highlighters from the collection
         * @returns {Array}
         */
        getAllHighlighters: function getAllHighlighters() {
          return highlighters;
        },

        /**
         * Retrieves the first highlighter in the collection
         * @returns {Object} highlighter instance
         */
        getItemHighlighter: function getItemHighlighter() {
          return highlighters[0];
        },

        /**
         * Retrieves the fully array of highlighter from the collection, minus the first one
         * @returns {Array} highlighter instance
         */
        getNonItemHighlighters: function getNonItemHighlighters() {
          return highlighters.slice(1);
        },

        /**
         * Empties th highlighter collection
         * @returns {Integer}
         */
        getLength: function getLength() {
          return highlighters.length;
        },

        /**
         * Empties the highlighter collection
         * @returns {Object}
         */
        empty: function empty() {
          highlighters = [];
          return this;
        }
      };
    };

    return highlighterCollection;

});
