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
                // if the result is an array, return the first element
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
