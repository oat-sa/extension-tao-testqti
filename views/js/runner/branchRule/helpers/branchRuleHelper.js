define([
    'lodash',
    'core/promise'
], function(
    _,
    Promise
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
     * @returns {Promise<boolean[]>}
     */
    function evaluateSubBranchRules(branchRuleDefinition, item, navigationParams, branchRuleMapper, responseStore) {
        return new Promise(function(resolve, reject) {
            var subBranchRuleResults = [],
                promises = [];

            // Remove the @attributes from the branch rule definition
            branchRuleDefinition = _.omit(branchRuleDefinition, ['@attributes']);

            promises = _.map(branchRuleDefinition, function(subBranchRule, subBranchRuleName) {
                return branchRuleMapper(
                    subBranchRuleName,
                    branchRuleDefinition[subBranchRuleName],
                    item,
                    navigationParams,
                    responseStore
                ).validate();
            });

            Promise.all(promises)
                .then(function(results) {
                    _.forEach(results, function(subBranchRuleResult) {
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

                    resolve(subBranchRuleResults);
                })
                .catch(function(err) {
                    reject(err);
                });
        });
    }

    return {
        evaluateSubBranchRules: evaluateSubBranchRules
    };
});
