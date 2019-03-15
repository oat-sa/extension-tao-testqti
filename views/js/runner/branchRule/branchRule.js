define([
    'taoQtiTest/runner/branchRule/branchRuleMapper',
], function(
    branchRuleMapper,
) {
    'use strict';

    return function branchRuleFactory(branchRuleDefinition, item, navigationParams) {
        console.log('branchRuleDefinition', branchRuleDefinition);
        console.log('item', item);
        console.log('params', navigationParams);

        if (
            !('@attributes' in branchRuleDefinition)
            || !('target' in branchRuleDefinition['@attributes'])
        ) {
            console.log('Target is not defined for branch rule');
            return null;
        }

        var result =  Object.keys(branchRuleDefinition)
            .filter(function(definitionName) {
                return definitionName !== '@attributes';
            })
            .map(function(definitionName) {
                return branchRuleMapper(definitionName, branchRuleDefinition[definitionName], item, navigationParams).validate();
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
