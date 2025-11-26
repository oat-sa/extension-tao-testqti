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
 * Item Max Score Data Provider
 *
 * Provides access to item MAXSCORE (maximum achievable points) values.
 * Used by the MNOP (Maximum Number of Points) feature for test authoring.
 */
define([
    'lodash',
    'util/url',
    'core/dataProvider/request'
], function(_, urlUtil, request) {
    'use strict';

    var defaultConfig = {
        getItemsMaxScores: {
            url: urlUtil.route('getItemsMaxScores', 'Items', 'taoQtiTest')
        }
    };

    /**
     * Creates a configured item max score provider
     *
     * @param {Object} [config] - Optional configuration to override defaults
     * @returns {itemMaxScoreProvider} The configured provider instance
     */
    return function itemMaxScoreProviderFactory(config) {
        config = _.defaults(config || {}, defaultConfig);

        /**
         * @typedef {itemMaxScoreProvider}
         */
        return {
            /**
             * Get MAXSCORE values for multiple items
             *
             * Retrieves the maximum achievable score for each item URI.
             * Used for calculating Maximum Number of Points (MNOP) at various
             * test hierarchy levels (test, test-part, section, item).
             */
            getItemsMaxScores: function getItemsMaxScores(itemUris) {
                if (!_.isArray(itemUris)) {
                    return Promise.reject(new TypeError('itemUris must be an array'));
                }

                if (itemUris.length === 0) {
                    return Promise.resolve({});
                }

                return request(
                    config.getItemsMaxScores.url,
                    { itemUris: itemUris }
                ).then(function(response) {
                    return response.data || response;
                });
            }
        };
    };
});
