define([
    'lodash',
    'core/Promise',
    'util/capitalize',
    'taoQtiTest/runner/helpers/offlineJumpTable',
    'taoQtiTest/runner/helpers/testContextBuilder',
], function(
    _,
    Promise,
    capitalize,
    OfflineJumpTableHelper,
    TestContextBuilder
) {
    'use strict';

    var offlineNavigatorFactory = function offlineNavigatorFactory(itemStore) {
        var testData,
            testContext,
            testMap,
            offlineJumpTableHelper = new OfflineJumpTableHelper(itemStore);

        return {
            setTestData: function setTestData(data) {
                testData = data;

                return this;
            },

            setTestContext: function setTestContext(context) {
                testContext = context;

                return this;
            },

            setTestMap: function setTestMap(map) {
                testMap = map;

                offlineJumpTableHelper.setTestMap(map);
                offlineJumpTableHelper.init();

                return this;
            },

            /**
             * Performs the navigation action and returns the new test context.
             *
             * @param {String} direction
             * @param {String} scope
             * @param {Integer} position
             * @param {Object} params
             * @returns {Object} the new test context
             */
            navigate: function navigate(direction, scope, position, params) {
                return new Promise(function(resolve) {
                    var lastJump,
                        navigationActionName = 'jumpTo' + capitalize(direction) + capitalize(scope),
                        testContextBuilder = new TestContextBuilder(testData, testContext, testMap);

                    if (
                        !(navigationActionName in offlineJumpTableHelper)
                        || !(typeof(offlineJumpTableHelper[navigationActionName]) === 'function')
                    ) {
                        throw new Error('illegal navigation'); // TODO: proper error handling
                    }

                    offlineJumpTableHelper[navigationActionName](params).then(function() {
                        lastJump = offlineJumpTableHelper.getLastJump();

                        resolve(testContextBuilder.buildTestContextFromJump(lastJump));
                    });
                });
            }
        };
    };

    return offlineNavigatorFactory;
});
