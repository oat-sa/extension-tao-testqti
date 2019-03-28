define([
    'lodash'
], function(
    _
) {
    'use strict';

    /**
     * Parses sub branch rules and returns an array of results
     *
     * @param {Object} branchRuleDefinition
     * @param {Object} item
     * @param {Object} navigationParams
     * @param {Function} branchRuleMapper
     * @param {Object} responseStore
     * @returns {boolean[]}
     */
    function evaluateSubBranchRules(branchRuleDefinition, item, navigationParams, branchRuleMapper, responseStore) {
        var subBranchRuleResults = [];

        // Remove the @attributes from the branch rule definition
        branchRuleDefinition = _.omit(branchRuleDefinition, ['@attributes']);

        _.keys(branchRuleDefinition)
            // Evaluate the sub branch rules
            .map(function(subBranchRuleName) {
                return branchRuleMapper(
                    subBranchRuleName,
                    branchRuleDefinition[subBranchRuleName],
                    item,
                    navigationParams,
                    responseStore
                ).validate();
            })
            .forEach(function(subBranchRuleResult) {
                // if the result is an array (e.g. in case of NOT), add all elements of it to the results
                if (Array.isArray(subBranchRuleResult)) {
                    subBranchRuleResult.forEach(function(value) {
                        subBranchRuleResults.push(value);
                    });
                // otherwise add the single value to the results
                } else {
                    subBranchRuleResults.push(subBranchRuleResult);
                }
            });

        return subBranchRuleResults;
    }

    return {
        evaluateSubBranchRules: evaluateSubBranchRules
    };
});
