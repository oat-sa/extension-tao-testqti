define([
    'taoQtiTest/runner/branchRule/validators/branchRuleDefinitionValidator',
    'taoQtiTest/runner/branchRule/validators/itemValidator',
    'taoQtiTest/runner/branchRule/validators/navigationParamsValidator',
], function(
    branchRuleDefinitionValidator,
    itemValidator,
    navigationParamsValidator,
) {
    'use strict';

    var matchBranchRuleFactory = function matchBranchRuleFactory(branchRuleDefinition, item, navigationParams) {
        var responses = [];
        var correctResponses = [];
        var variable = branchRuleDefinition.variable.@attributes.identifier;

        // Validating the structure of the parameters. If invalid, Error get thrown
        branchRuleDefinitionValidator(branchRuleDefinition);
        itemValidator(item);
        navigationParamsValidator(navigationParams);

        item.itemData.data.responses.forEach(function(response) {
            var responseIdentifier = item.itemIdentifier + '.' + response.identifier;
            correctResponses[responseIdentifier] = response.correctResponses;
        });

        navigationParams.itemResponse.forEach(function(response, identifier) {
            var responseIdentifier = navigationParams.itemDefinition + '.' + identifier;
            responses[responseIdentifier] = response.base.identifier;
        });
    };

    return matchBranchRuleFactory;
});
