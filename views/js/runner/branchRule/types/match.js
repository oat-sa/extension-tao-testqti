define(function() {
    'use strict';

    return function matchBranchRuleFactory(branchRuleDefinition, item, navigationParams, branchRuleMapper, responseStore) {
        var responses = [];
        var correctResponses = [];
        var variable = branchRuleDefinition.variable['@attributes'].identifier;

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
                return responseStore.getCorrectResponse(variable).includes(responseStore.getResponse(variable));
            },
        }
    };
});
