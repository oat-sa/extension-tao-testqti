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
    'taoQtiTest/controller/creator/helpers/mnop'
], function(_, templates, mnopHelper) {
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
                var mnop = this._computeMNOP(element, modelOverseer);

                var templateData = {
                    hasData: mnop.Total > 0,
                    totalValue: mnop.Total.toFixed(2)
                };

                $container.html(templates.mnopTable(templateData));
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
                var visibleCategories = []; // TODO: Get from modelOverseer.getCategories() and filter

                if (model.testParts) {
                    return mnopHelper.computeTestMNOP(model, weightIdentifier, visibleCategories);
                } else if (model.assessmentSections) {
                    return mnopHelper.computeTestPartMNOP(model, weightIdentifier, visibleCategories);
                } else if (model.sectionParts) {
                    return mnopHelper.computeSectionMNOP(model, weightIdentifier, visibleCategories);
                }

                return {Total: 0, Weighted: 0};
            },

            destroy: function() {
                $container.empty();
            }
        };
    };
});
