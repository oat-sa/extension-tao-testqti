define([
    'lodash',
    'core/store'
], function(
    _,
    store
) {
    'use strict';

    var defaultConfig = {
        responseStoreName: 'response',
        correctResponseStoreName: 'correct-response'
    };

    return function responseStoreFactory(options) {
        var config = _.defaults(options || {}, defaultConfig);

        var getResponseStore = function getResponseStore() {
            return store(config.responseStoreName, store.backends.memory);
        };

        var getCorrectResponseStore = function getCorrectResponseStore() {
            return store(config.correctResponseStoreName, store.backends.memory);
        };

        return {
            getResponses: function getResponses() {
                return getResponseStore().then(function(storage) {
                    return storage.getItems();
                });
            },

            getCorrectResponses: function getCorrectResponses() {
                return getCorrectResponseStore().then(function(storage) {
                    return storage.getItems();
                });
            },

            getResponse: function getResponse(key) {
                return getResponseStore().then(function(storage) {
                    return storage.getItem(key);
                });
            },
            getCorrectResponse: function getCorrectResponse(key) {
                return getCorrectResponseStore().then(function(storage) {
                    return storage.getItem(key).then(function(result) {
                        return new Promise(function(resolve) {
                            if (typeof result === 'undefined') {
                                return resolve([]);
                            }

                            return resolve(result);
                        });
                    });
                });
            },

            addResponse: function addResponse(key, value) {
                return getResponseStore().then(function(storage) {
                    return storage.setItem(key, value).then(function(updated) {
                        return updated;
                    });
                });
            },

            addCorrectResponse: function addCorrectResponse(key, value) {
                return getCorrectResponseStore().then(function(storage) {
                    return storage.setItem(key, value).then(function(updated) {
                        return updated;
                    });
                });
            },

            clearResponses: function clearResponses() {
                return getResponseStore().then(function(storage) {
                    return storage.clear();
                });
            },

            clearCorrectResponses: function clearCorrectResponses() {
                return getCorrectResponseStore().then(function(storage) {
                    return storage.clear();
                });
            }
        };
    };
});
