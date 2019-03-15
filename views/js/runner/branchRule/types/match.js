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

    return function matchBranchRuleFactory(branchRuleDefinition, item, navigationParams) {
        var responses = [];
        var correctResponses = [];
        var variable = branchRuleDefinition.variable['@attributes'].identifier;

        // Validating the structure of the parameters. If invalid, Error get thrown
        // branchRuleDefinitionValidator(branchRuleDefinition);
        // itemValidator(item);
        // navigationParamsValidator(navigationParams);

        Object.keys(item.itemData.data.responses).forEach(function(responseDeclarationIdentifier) {
            var response = item.itemData.data.responses[responseDeclarationIdentifier];
            var responseIdentifier = item.itemIdentifier + '.' + response.identifier;
            correctResponses[responseIdentifier] = response.correctResponses;
        });

        Object.keys(navigationParams.itemResponse).forEach(function(itemResponseIdentifier) {
            var response = navigationParams.itemResponse[itemResponseIdentifier];
            var responseIdentifier = navigationParams.itemDefinition + '.' + itemResponseIdentifier;
            responses[responseIdentifier] = response.base.identifier;
        });

        return {
            validate: function validate() {
                return correctResponses[variable].includes(responses[variable]);
            },
        }
    };
});
