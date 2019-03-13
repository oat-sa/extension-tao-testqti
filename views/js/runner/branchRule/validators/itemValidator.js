define(function() {
    'use strict';

    var ITEM_IDENTIFIER = 'itemIdentifier';
    var ITEM_DATA = 'itemData';
    var DATA = 'data';
    var IDENTIFIER = 'identifier';
    var RESPONSES = 'responses';
    var CORRECT_RESPONSES = 'correctResponses';

    var areResponseDeclarationsValid = function areResponseDeclarationsValid(responses) {
        return responses.every(function(responseDeclaration) {
            return CORRECT_RESPONSES in responseDeclaration
                && IDENTIFIER in responseDeclaration;
        });
    };

    return function(item) {
        if (
            !(ITEM_IDENTIFIER in item)
            || !(ITEM_DATA in item)
            || !(DATA in item[ITEM_DATA])
            || !(IDENTIFIER in item[ITEM_DATA][DATA])
            || !(RESPONSES in item[ITEM_DATA][DATA])
            || !areResponseDeclarationsValid(item[ITEM_DATA][DATA][RESPONSES])
        ) {
            throw new Error('Bad data structure for item');
        }
    };
});
