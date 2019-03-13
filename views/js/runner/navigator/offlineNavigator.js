define([
    'lodash',
    'taoQtiTest/runner/helpers/offlineJumpTable',
    'taoQtiTest/runner/helpers/testContextBuilder',
], function(
    _,
    OfflineJumpTableHelper,
    TestContextBuilder,
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

                return this;
            },

            /**
             * Performs the navigation action and returns the new test context.
             * TODO: use params to do the navigation based on the branching rules
             * TODO: can we avoid using switch-case?
             *
             * @param {String} direction
             * @param {String} scope
             * @param {Integer} position
             * @param {Object} params
             * @returns {Object} the new test context
             */
            navigate: function navigate(direction, scope, position, params) {
                var lastJump,
                    testContextBuilder = new TestContextBuilder(testData, testContext, testMap);

                switch (true) {
                    case direction === 'next' && scope === 'item':
                        lastJump = offlineJumpTableHelper.jumpToNextItem().getLastJump();
                        break;

                    case direction === 'next' && scope === 'section':
                        lastJump = offlineJumpTableHelper.jumpToNextSection().getLastJump();
                        break;

                    case direction === 'next' && scope === 'part':
                        lastJump = offlineJumpTableHelper.jumpToNextPart().getLastJump();
                        break;

                    case direction === 'previous' && scope === 'item':
                        lastJump = offlineJumpTableHelper.jumpToPreviousItem().getLastJump();
                        break;

                    case direction === 'previous' && scope === 'section':
                        lastJump = offlineJumpTableHelper.jumpToPreviousSection().getLastJump();
                        break;

                    case direction === 'previous' && scope === 'part':
                        lastJump = offlineJumpTableHelper.jumpToPreviousPart().getLastJump();
                        break;

                    case direction === 'jump' && scope === 'item':
                        lastJump = offlineJumpTableHelper.jumpTo(position).getLastJump();
                        break;

                    default:
                        throw new Error('illegal navigation'); //TODO: implement proper error handler
                }

                return testContextBuilder.buildTestContextFromJump(lastJump);
            }
        };
    };

    return offlineNavigatorFactory;
});
