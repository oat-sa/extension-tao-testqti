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
 * Copyright (c) 2025-2026 (original work) Open Assessment Technologies SA;
 */

/**
 * MNOP Visibility Gating Helper
 *
 * Determines when the Maximum Number of Points (MNOP) table should be visible
 * based on test configuration (outcome processing mode and branch rules).
 *
 * @author Open Assessment Technologies SA
 */
define([
    'lodash',
    'i18n'
], function(_, __) {
    'use strict';

    /**
     * Check if any test part in the model currently has branch rules.
     *
     * @param {Object} testModel - The full test model
     * @returns {Boolean}
     */
    function hasBranchRulesInModel(testModel) {
        return _.some(testModel && testModel.testParts, function(tp) {
            return tp && Array.isArray(tp.branchRules) && tp.branchRules.length > 0;
        });
    }

    /**
     * MNOP visibility gating helper
     */
    return {
        /**
         * Check if MNOP (Maximum Number of Points) should be visible based on test configuration
         *
         * MNOP is only meaningful when the test actually calculates scores, and when the test flow
         * is deterministic (all items are guaranteed to be shown to all test-takers).
         *
         * Visibility Rules:
         * 1. Show ONLY for outcome processing modes: 'total' or 'cut'
         *    - These modes calculate total scores, making MNOP relevant
         *    - Hide for 'none', 'custom', 'grade' - these don't use total score calculation
         *
         * 2. Hide when branch rules are present
         *    - Branch rules create conditional item selection based on responses
         *    - This makes MNOP unpredictable (different test-takers see different items)
         *    - Example: "If answer to Q1 is A, skip to Q5" - max points varies per test-taker
         *
         * 3. Allow when preconditions are present (we intentionally do NOT check testMeta.preConditions)
         *    - Preconditions are prerequisites for accessing sections (e.g., "must complete Section 1 first")
         *    - They control access order but don't affect which items are scored
         *    - All test-takers still see the same items, so MNOP remains predictable
         *    - Unlike branch rules, preconditions don't create conditional item visibility
         *
         * @param {Object} scoring - Scoring configuration {outcomeProcessing: 'total'|'cut'|'none'|'custom'|'grade', ...}
         * @param {Object} testModel - The full test model (used to check live branch rules state)
         * @returns {Boolean} - true if MNOP should be shown, false otherwise
         */
        shouldShowMNOP: function(scoring, testModel) {
            if (!scoring) {
                return false;
            }

            var outcomeProcessing = scoring.outcomeProcessing;

            var isAllowedMode = (
                outcomeProcessing === 'total' ||
                outcomeProcessing === 'cut'
            );

            if (!isAllowedMode) {
                return false;
            }

            return !hasBranchRulesInModel(testModel);
        },

        /**
         * Get visibility reason (for debugging/tooltips)
         *
         * @param {Object} scoring
         * @param {Object} testModel - The full test model
         * @returns {String} - Reason why MNOP is hidden, or empty if visible
         */
        getHiddenReason: function(scoring, testModel) {
            if (this.shouldShowMNOP(scoring, testModel)) {
                return '';
            }

            if (!scoring) {
                return __('MNOP is not available for this test configuration.');
            }

            var outcomeProcessing = scoring.outcomeProcessing;

            if (outcomeProcessing !== 'total' && outcomeProcessing !== 'cut') {
                return __('MNOP requires Outcome processing set to Total score or Cut score.');
            }

            if (hasBranchRulesInModel(testModel)) {
                return __('MNOP is not available when branch rules are present.');
            }

            return __('MNOP is not available for this test configuration.');
        }
    };
});
