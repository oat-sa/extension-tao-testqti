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
 * Foundation, Inc., 31 Milk St # 960789 Boston, MA 02196 USA.
 *
 * Copyright (c) 2025 (original work) Open Assessment Technologies SA;
 */

/**
 * Category filtering utility for MNOP (Maximum Number of Points)
 *
 * Filters out TAO-internal categories (prefixed with 'x-tao-') from category lists.
 * These internal categories are used for system purposes and should not appear in
 * MNOP category rows.
 */
define([], function() {
    'use strict';

    var DEFAULT_EXCLUSION_PATTERN = /^x-tao-/i;

    return {
        /**
         * Filter out TAO-internal categories from an array
         *
         * @param {Array<String>} categories
         * @param {RegExp} [exclusionPattern]
         * @returns {Array<String>}
         */
        getVisibleCategories: function getVisibleCategories(categories, exclusionPattern) {
            if (!categories || !Array.isArray(categories)) {
                return [];
            }

            var pattern = exclusionPattern || DEFAULT_EXCLUSION_PATTERN;

            return categories.filter(function(category) {
                return category && typeof category === 'string' && !pattern.test(category);
            });
        },

        /**
         * Check if a single category is visible
         *
         * @param {String} category
         * @param {RegExp} [exclusionPattern]
         * @returns {Boolean}
         */
        isVisibleCategory: function isVisibleCategory(category, exclusionPattern) {
            if (!category || typeof category !== 'string') {
                return false;
            }

            var pattern = exclusionPattern || DEFAULT_EXCLUSION_PATTERN;
            return !pattern.test(category);
        },

        /**
         * Count the number of visible categories
         *
         * @param {Array<String>} categories
         * @param {RegExp} [exclusionPattern]
         * @returns {Number}
         */
        countVisibleCategories: function countVisibleCategories(categories, exclusionPattern) {
            return this.getVisibleCategories(categories, exclusionPattern).length;
        }
    };
});
