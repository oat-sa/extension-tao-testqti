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
    'taoQtiTest/runner/branchRule/branchRuleMapper',
], function(
    branchRuleMapper
) {
    'use strict';

    return function branchRuleFactory(branchRuleDefinition, item, navigationParams, responseStore) {
        if (
            !('@attributes' in branchRuleDefinition)
            || !('target' in branchRuleDefinition['@attributes'])
        ) {
            return null;
        }

        var result =  Object.keys(branchRuleDefinition)
            .filter(function(definitionName) {
                return definitionName !== '@attributes';
            })
            .map(function(definitionName) {
                return branchRuleMapper(
                    definitionName,
                    branchRuleDefinition[definitionName],
                    item,
                    navigationParams,
                    responseStore
                ).validate();
            })
            .map(function(branchRuleResult) {
                // if the result is an array, return the first element
                if (Array.isArray(branchRuleResult)) {
                    return branchRuleResult[0];
                }

                return branchRuleResult;
            })
            .map(function(branchRuleResult) {
                // if the first element is still an array, return the first element of it // TODO
                if (Array.isArray(branchRuleResult)) {
                    return branchRuleResult[0];
                }

                return branchRuleResult;
            })
            .every(function(branchRuleResult) {
                return branchRuleResult;
            });

        if (result) {
            return branchRuleDefinition['@attributes']['target'];
        }

        return null;
    };
});
