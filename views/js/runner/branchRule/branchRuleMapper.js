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
    'taoQtiTest/runner/branchRule/types/match',
    'taoQtiTest/runner/branchRule/types/or',
    'taoQtiTest/runner/branchRule/types/and',
    'taoQtiTest/runner/branchRule/types/not',
], function(
    matchBranchRule,
    orBranchRule,
    andBranchRule,
    notBranchRule,
) {
    'use strict';

    return function branchRuleMapperFactory(branchRuleName, branchRuleDefinition, item, navigationParams, responseStore) {
        switch (branchRuleName) {
            case 'match':
                return matchBranchRule(branchRuleDefinition, item, navigationParams, branchRuleMapperFactory, responseStore);

            case 'or':
                return orBranchRule(branchRuleDefinition, item, navigationParams, branchRuleMapperFactory, responseStore);

            case 'and':
                return andBranchRule(branchRuleDefinition, item, navigationParams, branchRuleMapperFactory, responseStore);

            case 'not':
                return notBranchRule(branchRuleDefinition, item, navigationParams, branchRuleMapperFactory, responseStore);

            default:
                throw new Error('Invalid branch rule name: ' + branchRuleName);
        }
    };
});
