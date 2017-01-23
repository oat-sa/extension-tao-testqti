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
 * Copyright (c) 2017 (original work) Open Assessment Technologies SA ;
 */
/**
 * Helper that provides a way to browse all categories attached to a test model at the item level.
 *
 * @author Jean-Sébastien Conan <jean-sebastien@taotesting.com>
 */
define([
    'lodash'
], function (_) {
    'use strict';

    /**
     * Checks if a category is an option
     *
     * @param {String} category
     * @returns {Boolean}
     */
    function isCategoryOption(category) {
        return category && category.indexOf('x-tao-') === 0;
    }

    /**
     * Calls a function for each category in the test model
     * @param {Object} testModel
     * @param {Function} cb
     */
    function eachCategories(testModel, cb) {
        _.forEach(testModel.testParts, function (testPart) {
            _.forEach(testPart.assessmentSections, function (assessmentSection) {
                _.forEach(assessmentSection.sectionParts, function (itemRef) {
                    _.forEach(itemRef.categories, function(category) {
                        cb(category, itemRef);
                    });
                });
            });
        });
    }

    return {
        /**
         * Calls a function for each category in the test model
         * @function eachCategories
         * @param {Object} testModel
         * @param {Function} cb
         */
        eachCategories: eachCategories,

        /**
         * Gets the list of categories assigned to the items.
         * Discards special purpose categories like 'x-tao-...'
         *
         * @param {Object} testModel
         * @returns {Array}
         */
        listCategories: function listCategories(testModel) {
            var categories = {};
            eachCategories(testModel, function(category) {
                if (!isCategoryOption(category)) {
                    categories[category] = true;
                }
            });
            return _.keys(categories);
        },

        /**
         * Gets the list of options assigned to the items (special purpose categories like 'x-tao-...').
         *
         * @param {Object} testModel
         * @returns {Array}
         */
        listOptions: function listOptions(testModel) {
            var options = {};
            eachCategories(testModel, function(category) {
                if (isCategoryOption(category)) {
                    options[category] = true;
                }
            });
            return _.keys(options);
        }
    };
});
