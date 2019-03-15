define([
    'taoQtiTest/runner/branchRule/types/match',
    'taoQtiTest/runner/branchRule/types/or',
    'taoQtiTest/runner/branchRule/types/not',
], function(
    matchBranchRule,
    orBranchRule,
    notBranchRule,
) {
    'use strict';

    return function branchRuleMapperFactory(branchRuleName, branchRuleDefinition, item, navigationParams) {
        switch (branchRuleName) {
            case 'match':
                return matchBranchRule(branchRuleDefinition, item, navigationParams, branchRuleMapperFactory);

            case 'or':
                return orBranchRule(branchRuleDefinition, item, navigationParams, branchRuleMapperFactory);

            case 'not':
                return notBranchRule(branchRuleDefinition, item, navigationParams, branchRuleMapperFactory);

            default:
                throw new Error('Invalid branch rule name: ' + branchRuleName); // TODO: proper error handling
        }
    };
});
