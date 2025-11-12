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
 * MNOP (Maximum Number of Points) calculation helper
 *
 * Provides core logic for calculating MNOP at the item level, handling
 * weights (coefficients) and category-specific calculations.
 */
define([
    'lodash',
    'taoQtiTest/controller/creator/helpers/categoryFilter',
    'taoQtiTest/provider/itemMaxScore'
], function(_, categoryFilter, itemMaxScoreProvider) {
    'use strict';

    /**
     * Constants for MNOP calculations
     */
    var CONSTANTS = {
        QTI_TYPE: {
            ITEM_REF: 'assessmentItemRef',
            SECTION: 'assessmentSection'
        },

        METRICS: {
            TOTAL: 'Total',
            WEIGHTED: 'Weighted',
            CATEGORY_PREFIX: 'Category_',
            WEIGHTED_CATEGORY_PREFIX: 'Weighted_Category_'
        }
    };

    var mnopHelper = {
        _maxScoreCache: {},
        _provider: null,

        /**
         * Initialize helper with test model
         * Fetches MAXSCORE for all items in test
         *
         * @param {Object} testModel
         * @param {Object} [providerConfig]
         * @returns {Promise}
         */
        init: function init(testModel, providerConfig) {
            var self = this;

            if (!this._provider) {
                this._provider = itemMaxScoreProvider(providerConfig);
            }

            var itemUris = this._extractItemUris(testModel);

            if (itemUris.length === 0) {
                return Promise.resolve({});
            }

            return this._provider.getItemsMaxScores(itemUris).then(function(scores) {
                self._maxScoreCache = scores;
                return scores;
            });
        },

        /**
         * Compute MNOP for a single item
         *
         * @param {Object} itemRef
         * @param {String} weightIdentifier
         * @param {Array<String>} visibleCategories
         * @returns {Object}
         */
        computeItemMNOP: function computeItemMNOP(itemRef, weightIdentifier, visibleCategories) {
            var maxScore = this._getItemMaxScore(itemRef.href);
            var weight = this._getItemWeight(itemRef, weightIdentifier);
            var itemCategories = itemRef.categories || [];

            var mnop = {};
            mnop[CONSTANTS.METRICS.TOTAL] = maxScore;
            mnop[CONSTANTS.METRICS.WEIGHTED] = maxScore * weight;

            _.forEach(visibleCategories, function(category) {
                var hasCategory = _.includes(itemCategories, category);
                mnop[CONSTANTS.METRICS.CATEGORY_PREFIX + category] = hasCategory ? maxScore : 0;
                mnop[CONSTANTS.METRICS.WEIGHTED_CATEGORY_PREFIX + category] = hasCategory ? (maxScore * weight) : 0;
            });

            return mnop;
        },

        /**
         * Extract all item URIs from test model
         *
         * @param {Object} testModel
         * @returns {Array<String>}
         * @private
         */
        _extractItemUris: function _extractItemUris(testModel) {
            var self = this;
            var uris = [];

            if (!testModel || !testModel.testParts) {
                return uris;
            }

            _.forEach(testModel.testParts, function(testPart) {
                if (testPart.assessmentSections) {
                    _.forEach(testPart.assessmentSections, function(section) {
                        uris = uris.concat(self._extractSectionItemUris(section));
                    });
                }
            });

            return _.uniq(uris);
        },

        /**
         * Extract item URIs from a section (recursively handles subsections)
         *
         * @param {Object} section
         * @returns {Array<String>}
         * @private
         */
        _extractSectionItemUris: function _extractSectionItemUris(section) {
            var self = this;
            var uris = [];

            if (!section || !section.sectionParts) {
                return uris;
            }

            _.forEach(section.sectionParts, function(part) {
                if (part['qti-type'] === CONSTANTS.QTI_TYPE.ITEM_REF) {
                    if (part.href) {
                        uris.push(part.href);
                    }
                } else if (part['qti-type'] === CONSTANTS.QTI_TYPE.SECTION) {
                    uris = uris.concat(self._extractSectionItemUris(part));
                }
            });

            return uris;
        },

        /**
         * Get MAXSCORE for an item from cache
         *
         * @param {String} itemUri
         * @returns {Number}
         * @private
         */
        _getItemMaxScore: function _getItemMaxScore(itemUri) {
            return this._maxScoreCache[itemUri] || 0;
        },

        /**
         * Get weight (coefficient) for item
         *
         * @param {Object} itemRef
         * @param {String} weightIdentifier
         * @returns {Number}
         * @private
         */
        _getItemWeight: function _getItemWeight(itemRef, weightIdentifier) {
            if (!weightIdentifier || !itemRef.weights || itemRef.weights.length === 0) {
                return 1;
            }

            var matchedWeight = _.find(itemRef.weights, function(w) {
                return w.identifier === weightIdentifier;
            });

            return matchedWeight ? parseFloat(matchedWeight.value) : 1;
        },

        /**
         * Compute MNOP for a section
         * Aggregates all items in the section, respecting selection rules
         *
         * @param {Object} section - Section object
         * @param {String} weightIdentifier - Weight identifier for weighted scoring
         * @param {Array<String>} visibleCategories - Visible category names
         * @returns {Object} Aggregated MNOP values
         */
        computeSectionMNOP: function computeSectionMNOP(section, weightIdentifier, visibleCategories) {
            var self = this;
            var itemMNOPs = [];

            if (!section || !section.sectionParts) {
                return this._createEmptyMNOP(visibleCategories);
            }

            _.forEach(section.sectionParts, function(part) {
                if (part['qti-type'] === CONSTANTS.QTI_TYPE.ITEM_REF) {
                    var itemMNOP = self.computeItemMNOP(part, weightIdentifier, visibleCategories);
                    itemMNOPs.push(itemMNOP);
                } else if (part['qti-type'] === CONSTANTS.QTI_TYPE.SECTION) {
                    var subsectionMNOP = self.computeSectionMNOP(part, weightIdentifier, visibleCategories);
                    itemMNOPs.push(subsectionMNOP);
                }
            });

            if (section.selection && section.selection.select > 0) {
                var selectCount = section.selection.select;
                return this._aggregateWithSelection(itemMNOPs, selectCount, visibleCategories);
            }

            return this._sumMNOPs(itemMNOPs, visibleCategories);
        },

        /**
         * Compute MNOP for a test-part
         * Aggregates all sections in the test-part
         *
         * @param {Object} testPart - Test-part object
         * @param {String} weightIdentifier - Weight identifier
         * @param {Array<String>} visibleCategories - Visible category names
         * @returns {Object} Aggregated MNOP values
         */
        computeTestPartMNOP: function computeTestPartMNOP(testPart, weightIdentifier, visibleCategories) {
            var self = this;
            var sectionMNOPs = [];

            if (!testPart || !testPart.assessmentSections) {
                return this._createEmptyMNOP(visibleCategories);
            }

            _.forEach(testPart.assessmentSections, function(section) {
                var sectionMNOP = self.computeSectionMNOP(section, weightIdentifier, visibleCategories);
                sectionMNOPs.push(sectionMNOP);
            });

            return this._sumMNOPs(sectionMNOPs, visibleCategories);
        },

        /**
         * Compute MNOP for entire test
         * Aggregates all test-parts
         *
         * @param {Object} testModel - Test model object
         * @param {String} weightIdentifier - Weight identifier
         * @param {Array<String>} visibleCategories - Visible category names
         * @returns {Object} Aggregated MNOP values
         */
        computeTestMNOP: function computeTestMNOP(testModel, weightIdentifier, visibleCategories) {
            var self = this;
            var testPartMNOPs = [];

            if (!testModel || !testModel.testParts) {
                return this._createEmptyMNOP(visibleCategories);
            }

            _.forEach(testModel.testParts, function(testPart) {
                var testPartMNOP = self.computeTestPartMNOP(testPart, weightIdentifier, visibleCategories);
                testPartMNOPs.push(testPartMNOP);
            });

            return this._sumMNOPs(testPartMNOPs, visibleCategories);
        },

        /**
         * Sum multiple MNOP objects
         *
         * @param {Array<Object>} mnops - Array of MNOP objects
         * @param {Array<String>} visibleCategories - Visible category names
         * @returns {Object} Sum of all MNOPs
         * @private
         */
        _sumMNOPs: function _sumMNOPs(mnops, visibleCategories) {
            var result = this._createEmptyMNOP(visibleCategories);

            _.forEach(mnops, function(mnop) {
                result[CONSTANTS.METRICS.TOTAL] += mnop[CONSTANTS.METRICS.TOTAL] || 0;
                result[CONSTANTS.METRICS.WEIGHTED] += mnop[CONSTANTS.METRICS.WEIGHTED] || 0;

                _.forEach(visibleCategories, function(category) {
                    var totalKey = CONSTANTS.METRICS.CATEGORY_PREFIX + category;
                    var weightedKey = CONSTANTS.METRICS.WEIGHTED_CATEGORY_PREFIX + category;
                    result[totalKey] += mnop[totalKey] || 0;
                    result[weightedKey] += mnop[weightedKey] || 0;
                });
            });

            return result;
        },

        /**
         * Aggregate MNOPs with selection (select top N)
         * Selects top N items per metric and sums them
         *
         * @param {Array<Object>} mnops - Array of MNOP objects
         * @param {Number} selectCount - Number of items to select
         * @param {Array<String>} visibleCategories - Visible category names
         * @returns {Object} Aggregated MNOP after selection
         * @private
         */
        _aggregateWithSelection: function _aggregateWithSelection(mnops, selectCount, visibleCategories) {
            var self = this;
            var result = this._createEmptyMNOP(visibleCategories);

            var topByTotal = this.selectTopN(mnops, selectCount, CONSTANTS.METRICS.TOTAL);
            result[CONSTANTS.METRICS.TOTAL] = _.sumBy(topByTotal, CONSTANTS.METRICS.TOTAL);

            var topByWeighted = this.selectTopN(mnops, selectCount, CONSTANTS.METRICS.WEIGHTED);
            result[CONSTANTS.METRICS.WEIGHTED] = _.sumBy(topByWeighted, CONSTANTS.METRICS.WEIGHTED);

            _.forEach(visibleCategories, function(category) {
                var totalKey = CONSTANTS.METRICS.CATEGORY_PREFIX + category;
                var weightedKey = CONSTANTS.METRICS.WEIGHTED_CATEGORY_PREFIX + category;

                var topByCategory = self.selectTopN(mnops, selectCount, totalKey);
                result[totalKey] = _.sumBy(topByCategory, totalKey);

                var topByWeightedCategory = self.selectTopN(mnops, selectCount, weightedKey);
                result[weightedKey] = _.sumBy(topByWeightedCategory, weightedKey);
            });

            return result;
        },

        /**
         * Create empty MNOP object with all metrics set to 0
         *
         * @param {Array<String>} visibleCategories - Visible category names
         * @returns {Object} Empty MNOP object
         * @private
         */
        _createEmptyMNOP: function _createEmptyMNOP(visibleCategories) {
            var mnop = {};
            mnop[CONSTANTS.METRICS.TOTAL] = 0;
            mnop[CONSTANTS.METRICS.WEIGHTED] = 0;

            _.forEach(visibleCategories, function(category) {
                mnop[CONSTANTS.METRICS.CATEGORY_PREFIX + category] = 0;
                mnop[CONSTANTS.METRICS.WEIGHTED_CATEGORY_PREFIX + category] = 0;
            });

            return mnop;
        },

        /**
         * Select top N items by a specific metric
         *
         * Used when a section has "select N items" configuration.
         * Different metrics may select different item subsets.
         *
         * @param {Array<Object>} itemMNOPs - Array of item MNOP objects
         * @param {Number} n - Number of items to select
         * @param {String} metric - Metric name (e.g., 'Total', 'Weighted', 'Category_math')
         * @returns {Array<Object>} - Top N items sorted by metric descending
         */
        selectTopN: function selectTopN(itemMNOPs, n, metric) {
            if (!itemMNOPs || itemMNOPs.length === 0) {
                return [];
            }

            if (n <= 0) {
                return [];
            }

            var itemsWithValues = _.map(itemMNOPs, function(item) {
                return {
                    item: item,
                    value: item[metric] || 0
                };
            });

            var sorted = _.orderBy(itemsWithValues, ['value'], ['desc']);

            var topN = _.take(sorted, n);

            return _.map(topN, 'item');
        },

        /**
         * Clear cache
         */
        clearCache: function clearCache() {
            this._maxScoreCache = {};
        }
    };

    return mnopHelper;
});
