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
