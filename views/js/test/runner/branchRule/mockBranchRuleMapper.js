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
define(function() {
    'use strict';

    var MOCK_TRUE_BRANCH_RULE = 'MOCK_TRUE_BRANCH_RULE';
    var MOCK_FALSE_BRANCH_RULE = 'MOCK_FALSE_BRANCH_RULE';
    var MOCK_ARRAY_BRANCH_RULE = 'MOCK_ARRAY_BRANCH_RULE';

    /**
     * Mock Branch Rule which will return the given value
     * @param {*} returnValue
     * @returns {Object}
     */
    function getMockBranchRule(returnValue) {
        return {
            validate: function() {
                return returnValue;
            }
        };
    }

    /**
     * Returns the mock branchRuleMapper which supports two mock branchRule:
     *      - MOCK_TRUE_BRANCH_RULE, which will return true
     *      - MOCK_FALSE_BRANCH_RULE, which will return false
     * @param branchRuleName
     * @returns {Object}
     */
    function getMockBranchRuleMapper(branchRuleName) {
        switch (branchRuleName) {
            case MOCK_TRUE_BRANCH_RULE:
                return getMockBranchRule(true);
            case MOCK_FALSE_BRANCH_RULE:
                return getMockBranchRule(false);
            case MOCK_ARRAY_BRANCH_RULE:
                return getMockBranchRule([true, false]);
        }
    }

    return {
        /**
         * Mock branch rule names
         */
        MOCK_TRUE_BRANCH_RULE: MOCK_TRUE_BRANCH_RULE,
        MOCK_FALSE_BRANCH_RULE: MOCK_FALSE_BRANCH_RULE,
        MOCK_ARRAY_BRANCH_RULE: MOCK_ARRAY_BRANCH_RULE,
        getMockBranchRuleMapper: getMockBranchRuleMapper
    };
});
