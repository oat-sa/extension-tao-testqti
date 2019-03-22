define(function() {
    'use strict';

    return function andBranchRuleFactory(branchRuleDefinition, item, navigationParams, branchRuleMapper, responseStore) {
        return {
            validate: function validate() {
                return Object.keys(branchRuleDefinition)
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
                    .map(function(resultSet) {
                        return resultSet
                            .map(function(result) {
                                if (Array.isArray(result)) {
                                    result = result[0];
                                }

                                return result;
                            })
                            .every(function(expression) {
                                return expression;
                            });
                    })
                    .every(function(expression) {
                        return expression;
                    });
            },
        }
    };
});
