define(function() {
    'use strict';

    return function notBranchRuleFactory(branchRuleDefinition, item, navigationParams, branchRuleMapper, responseStore) {
        if (!Array.isArray(branchRuleDefinition)) {
            branchRuleDefinition = [branchRuleDefinition];
        }
        return {
            validate: function validate() {
                return branchRuleDefinition.map(function(expression) {
                    return Object.keys(expression)
                        .map(function(branchRuleName) {
                            return !branchRuleMapper(
                                branchRuleName,
                                expression[branchRuleName],
                                item,
                                navigationParams,
                                responseStore
                            ).validate();
                        });
                });
            },
        }
    };
});
