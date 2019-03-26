define([
    'taoQtiTest/runner/proxy/cache/itemStore',
    'json!taoQtiTest/test/runner/helpers/offlineJumpTable/testMap.json',
], function(
    itemStoreFactory,
    testMapJson
) {
    return new Promise(function(resolve) {
        var promises = [];
        var itemStore = itemStoreFactory();

        Object.keys(testMapJson.parts).forEach(function(partId) {
            Object.keys(testMapJson.parts[partId].sections).forEach(function(sectionId) {
                Object.keys(testMapJson.parts[partId].sections[sectionId].items).forEach(function(itemId) {
                    promises.push(itemStore.set(itemId, {
                        baseUrl: 'test',
                        itemIdentifier: itemId,
                        itemData: {
                            data: {
                                responses: {
                                    RESPONSE1: {
                                        correctResponses: ['a', 'b'],
                                    },
                                    RESPONSE2: {
                                        correctResponses: ['c', 'd'],
                                    },
                                },
                            },
                        },
                    }));
                });
            });
        });

        Promise.all(promises).then(function() {
            resolve(itemStore);
        });
    });
});
