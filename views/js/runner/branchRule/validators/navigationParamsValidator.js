define(function() {
    'use strict';

    var ITEM_DEFINITION = 'itemDefinition';
    var ITEM_RESPONSE = 'itemResponse';

    return function(navigationParams) {
        if (
            !(ITEM_DEFINITION in navigationParams)
            || !(ITEM_RESPONSE in navigationParams)
        ) {
            throw new Error('Bad data structure for navigation params');
        }
    };
});
