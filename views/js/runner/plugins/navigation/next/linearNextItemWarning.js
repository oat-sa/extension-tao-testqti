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
 * Test Runner Navigation Plugin : linearNextItemWarning
 *
 * @author Martin Nicholson <martin@taotesting.com>
 */
define([
    'jquery',
    'lodash',
    'i18n',
    'taoTests/runner/plugin',
    'taoQtiTest/runner/helpers/currentItem',
    'taoQtiTest/runner/plugins/navigation/next/dialogConfirmNext'
], function ($, _, __, pluginFactory, currentItemHelper, dialogConfirmNext){
    'use strict';

    /**
     * Returns the configured plugin
     */
    return pluginFactory({
        name : 'linearNextItemWarning',

        /**
         * Initialize the plugin (called during runner's init)
         */
        init : function init(){
            var self = this;
            var testRunner = this.getTestRunner();
            var testData = testRunner.getTestData();
            var testConfig = testData.config || {};
            var testStore = testRunner.getTestStore(); // we'll store user's checkbox choice in here
            testStore.setVolatile(self.getName());

            /**
             * Provides different variants of message text
             * @param {String} action - 'next' or 'skip'
             * @returns {String}
             */
            function getCustomNextMessage(action) {
                var customNextMessage;
                var itemPartiallyAnswered = currentItemHelper.isAnswered(testRunner, true);
                if (! itemPartiallyAnswered) {
                    customNextMessage = __('Are you sure you want to go to the next item? You will not be able to go back and provide an answer.');
                }
                else if (action === 'next') {
                    customNextMessage = __('Are you sure you want to go to the next item? You will not be able to go back and change your answer.');
                }
                else if (action === 'skip') {
                    customNextMessage = __('Are you sure you want to clear your answer and go to the next item? You will not be able to go back and provide an answer.');
                }
                else {
                    // more generic message for default case:
                    customNextMessage = __('Are you sure you want to go to the next item? You will not be able to go back.');
                }
                return customNextMessage;
            }

            //plugin behavior
            /**
             * Checks configuration, shows a dialog asking to confirm the nav action
             *
             * @param {String} action - 'next' or 'skip'
             * @returns {Promise} - resolves if dialog accepted or not shown, rejects if dialog cancelled
             */
            function doNextWarning(action) {
                testRunner.trigger('disablenav');

                // Load testStore checkbox value (async)
                return testStore.getStore(self.getName()).then(function(store) {
                    return store.getItem('dontShowLinearNextItemWarning').then(function(checkboxValue) {
                        var checkboxParams = null;

                        // Show the warning unless user has turned it off:
                        if (checkboxValue !== true) {
                            // Define checkbox only if enabled by config:
                            if (testConfig.enableLinearNextItemWarningCheckbox) {
                                checkboxParams = {
                                    checked: checkboxValue,
                                    submitChecked: function() {
                                        store.setItem('dontShowLinearNextItemWarning', true);
                                    },
                                    submitUnchecked: function() {
                                        store.setItem('dontShowLinearNextItemWarning', false);
                                    },
                                };
                            }
                            return new Promise(function(resolve, reject) {
                                // show special dialog:
                                dialogConfirmNext(
                                    __('Go to the next item?'),
                                    getCustomNextMessage(action),
                                    resolve, // if the test taker accepts
                                    function cancel() { // if he refuses
                                        reject({
                                            cancel: true
                                        });
                                    },
                                    checkboxParams
                                );
                            });
                        }
                    });
                })
                .catch(function(err) {
                    // if the rejection is due to an error, rethrow it
                    if (err && err instanceof Error) {
                        throw err;
                    }
                    if (err && err.cancel === true) {
                        testRunner.trigger('enablenav');
                        return Promise.reject(); // to cancel the move
                    }
                });
            }

            // Attach this plugin to 'next' & 'skip' events
            testRunner
                .on('init', function() {
                    // Clear the stored checkbox value before each test:
                    testStore.getStore(self.getName()).then(function(store) {
                        store.setItem('dontShowLinearNextItemWarning', null);
                    });
                })
                .before('move skip', function(e, type, scope) {
                    var context = testRunner.getTestContext();
                    if (context.isLinear) {
                        // Do nothing if nextSection warning imminent:
                        if (scope === 'section' && context.options.nextSectionWarning) {
                            return;
                        }
                        // Do nothing if endOfPart warning imminent:
                        else if (context.options.nextPartWarning) {
                            return;
                        }
                        // Show dialog if conditions met:
                        else if (type === 'next' && !context.isLast && testConfig.forceEnableLinearNextItemWarning) {
                            return doNextWarning('next');
                        }
                        else if (e.name === 'skip' && !context.isLast && testConfig.forceEnableLinearNextItemWarning) {
                            return doNextWarning('skip');
                        }
                    }
                });

        }
    });
});
