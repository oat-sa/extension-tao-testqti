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
    'taoQtiTest/runner/helpers/map',
    'taoQtiTest/runner/plugins/content/dialog/confirmNext'
], function ($, _, __, pluginFactory, mapHelper, confirmNext){
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
            testStore.setVolatile(this.getName());

            //plugin behavior
            /**
             * @param {String} action - 'next' or 'skip'
             */
            function doNextWarning(action) {
                var context = testRunner.getTestContext();
                var map = testRunner.getTestMap();
                var item = mapHelper.getItem(map, context.itemIdentifier);

                var customNextMessage = 'message';
                var checkboxParams = null;

                console.info('config: force the warning?', testConfig.forceEnableNextItemWarning);
                console.info('config: enable checkbox?', testConfig.enableNextItemWarningCheckbox);
                console.log('action', action);
                console.log('isAnswered?', item.answered);

                function enableNav() {
                    testRunner.trigger('enablenav');
                }

                testRunner.trigger('disablenav');

                // Different variants of message text:
                if (! item.answered) {
                    customNextMessage = __('Are you sure you want to go to the next item? You will not be able to go back and provide an answer.');
                }
                else if (action === 'next') {
                    customNextMessage = __('Are you sure you want to go to the next item? You will not be able to go back and change your answer.');
                }
                else if (action === 'skip') {
                    customNextMessage = __('Are you sure you want to clear your answer and go to the next item? You will not be able to go back and provide an answer.');
                }

                // Load testStore checkbox value (async)
                testStore.getStore('confirmNext').then(function(store) {
                    store.getItem('dontShowNextItemWarning').then(function(checkboxValue) {
                        //checkboxValue = _.isUndefined(checkboxValue) ? false : checkboxValue;
                        console.log('store.getItem', checkboxValue);

                        // Define checkbox only if enabled by config:
                        if (testConfig.enableNextItemWarningCheckbox) {
                            checkboxParams = {
                                text: __("Don't show this again next time"),
                                checked: checkboxValue,
                                submitChecked: function() {
                                    // Store value of a checkbox:
                                    store.setItem('dontShowNextItemWarning', true)
                                    .then(function(success) {
                                        store.getItems()
                                            .then(function(storeContents) {
                                                console.log('store.setItem', storeContents);
                                            });
                                    });
                                },
                                submitUnchecked: function() {
                                    // Store value of a checkbox:
                                    store.setItem('dontShowNextItemWarning', false)
                                    .then(function(success) {
                                        store.getItems()
                                            .then(function(storeContents) {
                                                console.log('store.setItem', storeContents);
                                            });
                                    });
                                },                                    };
                        }
                        // show special dialog:
                        confirmNext(
                            __('Go to the next item?'),
                            customNextMessage,
                            _.partial(triggerNextAction, context), // if the test taker accepts
                            enableNav,                             // if he refuses
                            checkboxParams
                        );

                    });
                });
            }

            function triggerNextAction(context) {
                if(context.isLast){
                    self.trigger('end');
                }
                testRunner.next();
            }

            // Attach this plugin to 'next' & 'skip' events
            testRunner
                .on('warn-next', function(nextItemWarning) {
                    doNextWarning('next');
                })
                .on('warn-skip', function(nextItemWarning) {
                    doNextWarning('skip');
                });
        }
    });
});
