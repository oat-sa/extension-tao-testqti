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
    'lodash',
    'taoQtiTest/runner/branchRule/helpers/branchRuleHelper',
    'taoQtiTest/runner/branchRule/branchRuleMapper'
], function(
    _,
    branchRuleHelper,
    branchRuleMapper
) {
    'use strict';

    /**
     * Evaluates all the branch rules and returns the `@attributes.target` if the evaluation returns true, null otherwise
     */
    return function branchRuleFactory(branchRuleDefinition, item, navigationParams, responseStore) {
        var result,
            branchRuleResults;

        if (
            typeof branchRuleDefinition['@attributes'] === 'undefined'
            || typeof branchRuleDefinition['@attributes']['target'] === 'undefined'
        ) {
            return null;
        }

        branchRuleResults = branchRuleHelper.evaluateSubBranchRules(
            branchRuleDefinition,
            item,
            navigationParams,
            branchRuleMapper,
            responseStore
        );

        result = branchRuleResults.every(function(branchRuleResult) {
            return branchRuleResult;
        });

        if (result) {
            return branchRuleDefinition['@attributes']['target'];
        }

        return null;
    };
});
