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
 * MNOP (Maximum Number of Points) Table View Component
 *
 * Displays the maximum achievable points for a section/test-part/test.
 * This is a simplified version that only shows Total column.
 */
define([
    'lodash',
    'taoQtiTest/controller/creator/templates/index',
    'taoQtiTest/controller/creator/helpers/mnop',
    'taoQtiTest/controller/creator/helpers/mnopVisibility'
], function(_, templates, mnopHelper, mnopVisibility) {
    'use strict';

    /**
     * Create MNOP table view
     *
     * @param {jQuery} $container - Container element where table will be rendered
     * @param {Object} element - Section/test-part/test object from model
     * @param {Object} modelOverseer - Model overseer instance
     * @returns {Object} View instance
     */
    return function mnopTableViewFactory($container, element, modelOverseer) {
        return {
            init: function() {
                this.render();
            },

            render: function() {
                if (!this._shouldShow()) {
                    this._renderHiddenMessage();
                    return;
                }

                var mnop = this._computeMNOP(element, modelOverseer);
                var testModel = modelOverseer.getModel();
                var templateData = this._prepareTemplateData(mnop, testModel);

                $container.html(templates.mnopTable(templateData));
            },

            /**
             * Prepare data for template rendering
             * Extracts categories and weighted values from MNOP object
             *
             * @param {Object} mnop - MNOP calculation result
             * @param {Object} testModel - Test model
             * @returns {Object} Template data
             * @private
             */
            _prepareTemplateData: function(mnop, testModel) {
                var categoryRows = [];
                var hasWeighted = false;
                var hasCategoryScore = testModel.scoring && testModel.scoring.categoryScore === true;
                var weightIdentifier = testModel.scoring && testModel.scoring.weightIdentifier || null;

                if (weightIdentifier && mnop.Weighted !== mnop.Total) {
                    hasWeighted = true;
                }

                if (hasCategoryScore) {
                    var visibleCategories = this._extractVisibleCategories(testModel);

                    _.forEach(visibleCategories, function(category) {
                        var totalKey = 'Category_' + category;
                        var weightedKey = 'Weighted_Category_' + category;
                        var totalValue = mnop[totalKey] || 0;
                        var weightedValue = mnop[weightedKey] || 0;

                        if (totalValue > 0 || weightedValue > 0) {
                            categoryRows.push({
                                categoryName: category,
                                total: totalValue.toFixed(2),
                                weighted: weightedValue.toFixed(2)
                            });
                        }
                    });
                }

                return {
                    hasData: mnop && (mnop.Total > 0 || mnop.Weighted > 0),
                    hasCategories: hasCategoryScore && categoryRows.length > 0,
                    hasWeighted: hasWeighted,
                    categoryRows: categoryRows,
                    totalValue: (mnop.Total || 0).toFixed(2),
                    weightedValue: (mnop.Weighted || 0).toFixed(2)
                };
            },

            /**
             * Check if MNOP should be visible based on test configuration
             * @returns {Boolean}
             * @private
             */
            _shouldShow: function() {
                var testModel = modelOverseer.getModel();
                var testMeta = testModel.testMeta || {};
                var scoring = testModel.scoring || {};

                return mnopVisibility.shouldShowMNOP(scoring, testMeta);
            },

            /**
             * Render message when MNOP is hidden due to configuration
             * @private
             */
            _renderHiddenMessage: function() {
                var testModel = modelOverseer.getModel();
                var testMeta = testModel.testMeta || {};
                var scoring = testModel.scoring || {};
                var reason = mnopVisibility.getHiddenReason(scoring, testMeta);

                if (reason) {
                    $container.html(
                        '<div class="mnop-hidden">' +
                        '<p class="feedback-info"><span class="icon-info"></span> ' + reason + '</p>' +
                        '</div>'
                    );
                } else {
                    $container.empty();
                }
            },

            /**
             * Compute MNOP for test/section/test-part
             * Uses hierarchical aggregation from mnop helper
             *
             * @param {Object} model - Test, section, or test-part object
             * @param {Object} modelOverseer - Model overseer instance
             * @returns {Object} MNOP object with Total, Weighted, and category values
             * @private
             */
            _computeMNOP: function(model, modelOverseer) {
                if (!model) {
                    return {Total: 0, Weighted: 0};
                }

                var testModel = modelOverseer.getModel();
                var weightIdentifier = testModel.scoring && testModel.scoring.weightIdentifier || null;
                var visibleCategories = this._extractVisibleCategories(testModel);

                if (model.testParts) {
                    return mnopHelper.computeTestMNOP(model, weightIdentifier, visibleCategories);
                } else if (model.assessmentSections) {
                    return mnopHelper.computeTestPartMNOP(model, weightIdentifier, visibleCategories);
                } else if (model.sectionParts) {
                    return mnopHelper.computeSectionMNOP(model, weightIdentifier, visibleCategories);
                }

                return {Total: 0, Weighted: 0};
            },

            /**
             * Extract visible categories from test model
             * Only includes categories if categoryScore is enabled
             * Filters out internal TAO categories (x-tao- prefix)
             *
             * @param {Object} testModel
             * @returns {Array<String>}
             * @private
             */
            _extractVisibleCategories: function(testModel) {
                var categories = [];

                if (!testModel.scoring || !testModel.scoring.categoryScore) {
                    return categories;
                }

                if (!testModel.testParts) {
                    return categories;
                }

                _.forEach(testModel.testParts, function(testPart) {
                    if (testPart.assessmentSections) {
                        _.forEach(testPart.assessmentSections, function(section) {
                            categories = categories.concat(this._extractSectionCategories(section));
                        }.bind(this));
                    }
                }.bind(this));

                categories = _.uniq(categories);
                categories = _.filter(categories, function(cat) {
                    return cat && !cat.match(/^x-tao-/);
                });

                return categories;
            },

            /**
             * Extract categories from a section recursively
             *
             * @param {Object} section
             * @returns {Array<String>}
             * @private
             */
            _extractSectionCategories: function(section) {
                var categories = [];

                if (!section || !section.sectionParts) {
                    return categories;
                }

                _.forEach(section.sectionParts, function(part) {
                    if (part['qti-type'] === 'assessmentItemRef' && part.categories) {
                        categories = categories.concat(part.categories);
                    } else if (part['qti-type'] === 'assessmentSection') {
                        categories = categories.concat(this._extractSectionCategories(part));
                    }
                }.bind(this));

                return categories;
            },

            destroy: function() {
                $container.empty();
            }
        };
    };
});
