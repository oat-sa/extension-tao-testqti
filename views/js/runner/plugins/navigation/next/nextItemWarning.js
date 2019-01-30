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
 * Test Runner Navigation Plugin : nextItemWarning
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
        name : 'nextItemWarning',

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

            //plugin behavior
            /**
             * @param {String} action - 'next' or 'skip'
             */
            function doNextWarning(action) {
                var context = testRunner.getTestContext();
                var checkboxParams = null;

                // Provides different variants of message text:
                function getCustomNextMessage() {
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
                    return customNextMessage;
                }

                // Handle disable & re-enable of navigation controls:
                function enableNav() {
                    testRunner.trigger('enablenav');
                }
                testRunner.trigger('disablenav');

                // Load testStore checkbox value (async)
                testStore.getStore(self.getName()).then(function(store) {
                    store.getItem('dontShowNextItemWarning').then(function(checkboxValue) {

                        // Show the warning unless user has turned it off:
                        if (checkboxValue !== true) {
                            // Define checkbox only if enabled by config:
                            if (testConfig.enableNextItemWarningCheckbox) {
                                checkboxParams = {
                                    checked: checkboxValue,
                                    submitChecked: function() {
                                        store.setItem('dontShowNextItemWarning', true);
                                    },
                                    submitUnchecked: function() {
                                        store.setItem('dontShowNextItemWarning', false);
                                    },
                                };
                            }
                            // show special dialog:
                            dialogConfirmNext(
                                __('Go to the next item?'),
                                getCustomNextMessage(),
                                _.partial(triggerNextAction, context), // if the test taker accepts
                                enableNav,                             // if he refuses
                                checkboxParams
                            );
                        }
                        else {
                            triggerNextAction(context);
                        }
                    });
                });
            }

            // Actions to trigger when this plugin's dialog is accepted
            function triggerNextAction(testContext) {
                if(testContext.isLast){
                    self.trigger('end');
                }
                testRunner.next();
            }

            // Attach this plugin to 'next' & 'skip' events
            testRunner
                .on('init', function() {
                    // Clear the stored checkbox value before each test:
                    testStore.getStore(self.getName()).then(function(store) {
                        store.setItem('dontShowNextItemWarning', null);
                    });
                })
                .before('nav-skip', function() {
                    var context = testRunner.getTestContext();
                    if (context.isLinear && !context.isLast && testConfig.forceEnableNextItemWarning) {
                        doNextWarning('skip');
                    }
                })
                .before('nav-next nav-nextsection', function() {
                    var context = testRunner.getTestContext();
                    if (context.isLinear && !context.isLast && testConfig.forceEnableNextItemWarning) {
                        doNextWarning('next');
                    }
                });
        }
    });
});
