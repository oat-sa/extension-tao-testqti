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
 * @author Péter Halász <peter@taotesting.com>
 */
define([
    'taoQtiTest/runner/branchRule/helpers/branchRuleHelper'
], function(
    branchRuleHelper
) {
    'use strict';

    /**
     * AND branching rule
     */
    return function andBranchRuleFactory(branchRuleDefinition, item, navigationParams, branchRuleMapper, responseStore) {
        return {
            /**
             * Evaluates an AND expression on all the given expressions and returns the result
             * @returns {boolean}
             */
            validate: function validate() {
                var subBranchRuleResults = branchRuleHelper.evaluateSubBranchRules(
                    branchRuleDefinition,
                    item,
                    navigationParams,
                    branchRuleMapper,
                    responseStore
                );

                return subBranchRuleResults.every(function(value) {
                    return value;
                });
            }
        };
    };
});
