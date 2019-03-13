define(function() {
    'use strict';

    var CORRECT = 'correct';
    var VARIABLE = 'variable';
    var ATTRIBUTES = '@attributes';
    var IDENTIFIER = 'identifier';

    return function(branchRuleDefinition) {
        if (
            !(CORRECT in branchRuleDefinition)
            || !(VARIABLE in branchRuleDefinition)
            || !(ATTRIBUTES in branchRuleDefinition[CORRECT])
            || !(ATTRIBUTES in branchRuleDefinition[VARIABLE])
            || !(IDENTIFIER in branchRuleDefinition[VARIABLE][ATTRIBUTES])
            || !(IDENTIFIER in branchRuleDefinition[VARIABLE][ATTRIBUTES])
        ) {
            throw new Error('Bad definition for Match branch rule');
        }
    };
});
