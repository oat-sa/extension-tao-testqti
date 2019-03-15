define(function() {
    'use strict';

    return function orBranchRuleFactory(branchRuleDefinition, item, navigationParams, branchRuleMapper) {
        return {
            validate: function validate() {
                var result = Object.keys(branchRuleDefinition)
                    .filter(function(definitionName) {
                        return definitionName !== '@attributes';
                    })
                    .map(function(definitionName) {
                        var result = branchRuleMapper(definitionName, branchRuleDefinition[definitionName], item, navigationParams).validate();
                        return result;
                    })
                    .map(function(resultSet) {
                        return resultSet
                            .map(function(result) {
                                if (Array.isArray(result)) {
                                    result = result[0];
                                }

                                return result;
                            })
                            .some(function(expression) {
                                return expression;
                            });
                    })
                    .some(function(expression) {
                        return expression;
                    });

                return result;
            },
        }
    };
});
