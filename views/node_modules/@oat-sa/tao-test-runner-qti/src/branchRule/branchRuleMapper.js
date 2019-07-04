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
import matchBranchRule from 'taoQtiTest/runner/branchRule/types/match';
import orBranchRule from 'taoQtiTest/runner/branchRule/types/or';
import andBranchRule from 'taoQtiTest/runner/branchRule/types/and';
import notBranchRule from 'taoQtiTest/runner/branchRule/types/not';

var branchRuleMap = {
    match: matchBranchRule,
    or: orBranchRule,
    and: andBranchRule,
    not: notBranchRule
};

/**
 * Returns the proper branching rule based on the given name
 *
 * @param {string} branchRuleName
 * @param {Object} branchRuleDefinition the definition object of the branch rule, which contains additional branching rules also
 * @param {Object} item                 item object from the itemStore
 * @param {Object} navigationParams     object of navigation parameters which got passed to the navigation action
 * @param {responseStore} responseStore
 */
export default function branchRuleMapperFactory(
    branchRuleName,
    branchRuleDefinition,
    item,
    navigationParams,
    responseStore
) {
    if (!(branchRuleName in branchRuleMap)) {
        throw new Error(`Invalid branch rule name: ${  branchRuleName}`);
    }

    return branchRuleMap[branchRuleName](
        branchRuleDefinition,
        item,
        navigationParams,
        branchRuleMapperFactory,
        responseStore
    );
}
