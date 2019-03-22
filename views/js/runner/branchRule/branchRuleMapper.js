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
                throw new Error('Invalid branch rule name: ' + branchRuleName); // TODO: proper error handling
        }
    };
});
