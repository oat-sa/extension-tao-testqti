define(function() {
    'use strict';

    var storage = {
        correctResponses: {},
        responses: {},
    };

    return {
        getCorrectResponses: function getCorrectResponses() {
            return storage.correctResponses;
        },

        getResponses: function getResponses() {
            return storage.responses;
        },

        getCorrectResponse: function getCorrectResponse(identifier) {
            return storage.correctResponses[identifier];
        },

        getResponse: function getResponse(identifier) {
            return storage.responses[identifier];
        },

        addCorrectResponse: function addCorrectResponse(identifier, data) {
            storage.correctResponses[identifier] = data;
        },

        addResponse: function addResponse(identifier, data) {
            storage.responses[identifier] = data;
        },
    };
});
