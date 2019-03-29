/**
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU General Public License
 * as published by the Free Software Foundation; under version 2
 * of the License (non-upgradable).
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program; if not, write to the Free Software
 * Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301, USA.
 *
 * Copyright (c) 2019 (original work) Open Assessment Technologies SA ;
 */
/**
 * @author Péter Halász <peter@taotesting.com>
 */
define([
    'lodash',
    'core/Promise',
    'util/capitalize',
    'taoQtiTest/runner/helpers/offlineJumpTable',
    'taoQtiTest/runner/helpers/testContextBuilder'
], function(
    _,
    Promise,
    capitalize,
    OfflineJumpTableHelper,
    testContextBuilder
) {
    'use strict';

    return function offlineNavigatorFactory(itemStore) {
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

                return this;
            },

            init: function init() {
                offlineJumpTableHelper.setTestMap(testMap);
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
                return new Promise(function(resolve, reject) {
                    var lastJump,
                        navigationActionName = 'jumpTo' + capitalize(direction) + capitalize(scope);

                    if (
                        offlineJumpTableHelper[navigationActionName] === 'undefined'
                        || typeof(offlineJumpTableHelper[navigationActionName]) !== 'function'
                    ) {
                        throw new Error('Invalid navigation action');
                    }

                    offlineJumpTableHelper[navigationActionName](params)
                        .then(function() {
                            lastJump = offlineJumpTableHelper.getLastJump();

                            resolve(testContextBuilder.buildTestContextFromJump(
                                testData,
                                testContext,
                                testMap,
                                lastJump
                            ));
                        })
                        .catch(function(err) {
                            reject(err);
                        });
                });
            }
        };
    };
});
