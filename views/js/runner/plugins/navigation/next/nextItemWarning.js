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
    'ui/dialog',
    'tpl!ui/dialog/tpl/checkbox'
], function ($, _, __, pluginFactory, mapHelper, dialog, checkboxTpl){
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
                var map = testRunner.getTestMap();
                var item = mapHelper.getItem(map, context.itemIdentifier);

                var customNextMessage = 'message';
                var checkboxParams = null;

                console.log('isAnswered?', item.answered); // FIXME: wrong value!

                // Handle disable & re-enable of navigation controls:
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
                testStore.getStore(self.getName()).then(function(store) {
                    store.getItem('dontShowNextItemWarning').then(function(checkboxValue) {
                        //checkboxValue = _.isUndefined(checkboxValue) ? false : checkboxValue;
                        console.log('store.getItem dontShowNextItemWarning', checkboxValue);

                        // Define checkbox only if enabled by config:
                        if (testConfig.enableNextItemWarningCheckbox && checkboxValue !== true) {
                            checkboxParams = {
                                checked: checkboxValue,
                                submitChecked: function() {
                                    // Store value of checkbox:
                                    store.setItem('dontShowNextItemWarning', true)
                                    .then(function() {
                                        store.getItems()
                                            .then(function(storeContents) {
                                                console.log('store.setItem', true, 'store:', storeContents);
                                            });
                                    });
                                },
                                submitUnchecked: function() {
                                    // Store value of checkbox:
                                    store.setItem('dontShowNextItemWarning', false)
                                    .then(function() {
                                        store.getItems()
                                            .then(function(storeContents) {
                                                console.log('store.setItem', false, 'store:', storeContents);
                                            });
                                    });
                                },                                    };
                        }
                        // show special dialog:
                        dialogConfirmNext(
                            __('Go to the next item?'),
                            customNextMessage,
                            _.partial(triggerNextAction, context), // if the test taker accepts
                            enableNav,                             // if he refuses
                            checkboxParams
                        );

                    });
                });
            }

            /**
             * Displays a confirm message with a checkbox in it
             * @param {String} heading - Above the main message
             * @param {String} message - The displayed message
             * @param {Function} accept - An action called when the dialog is accepted
             * @param {Function} refuse - An action called when the dialog is refused
             * @param {Object} checkboxParams - Checkbox options
             * @param {Boolean} [checkboxParams.checked] - True to render it checked
             * @param {Function} [checkboxParams.submitChecked] - Action called when dialog accepted with checkbox checked
             * @param {Function} [checkboxParams.submitUnchecked] - Action called when dialog accepted with checkbox unchecked
             * @returns {dialog} - Returns the dialog instance
             */
            function dialogConfirmNext(heading, message, accept, refuse, checkboxParams) {
                var accepted = false;
                var dialogOptions;
                var dlg;
                var content = null;
                if (checkboxParams && checkboxParams.checked !== true) {
                    content = checkboxTpl({
                        checked: false,
                        text: "Don't show this again next time",
                        id: 'dont-show-again'
                    });
                }
                dialogOptions = {
                    heading: heading,
                    message: message,
                    content: content,
                    autoRender: true,
                    autoDestroy: true,
                    buttons: [
                        {
                            id : 'cancel',
                            type : 'regular',
                            label : __('Cancel'),
                            close: true
                        },
                        {
                            id : 'ok',
                            type : 'regular',
                            label : __('Go to next item'),
                            close: true
                        }
                    ],
                    onOkBtn: function() {
                        var $checkbox;
                        accepted = true;
                        if (_.isFunction(accept)) {
                            accept.call(this);

                            if (checkboxParams) {
                                // handle checkbox callbacks:
                                $checkbox = $('.modal input[name="dont-show-again"]');
                                if ($checkbox.prop('checked') && _.isFunction(checkboxParams.submitChecked)) {
                                    checkboxParams.submitChecked();
                                }
                                else if (!$checkbox.prop('checked') && _.isFunction(checkboxParams.submitUnchecked)) {
                                    checkboxParams.submitUnchecked();
                                }
                            }
                        }
                    }
                };
                dlg = dialog(dialogOptions);

                if (_.isFunction(refuse)) {
                    dlg.on('closed.modal', function() {
                        if (!accepted) {
                            refuse.call(this);
                        }
                    });
                }
                return dlg;
            }

            // Actions to trigger when this plugin's dialog is accepted
            function triggerNextAction(context) {
                if(context.isLast){
                    self.trigger('end');
                }
                testRunner.next();
            }

            // Attach this plugin to 'next' & 'skip' events
            testRunner
                .on('init', function() {
                    console.info('config: force the warning?', testConfig.forceEnableNextItemWarning);
                    console.info('config: enable checkbox?', testConfig.enableNextItemWarningCheckbox);
                    // Clear the stored value before each test:
                    testStore.getStore(self.getName()).then(function(store) {
                        store.setItem('dontShowNextItemWarning', null)
                        .then(function() {
                            store.getItems()
                                .then(function(storeContents) {
                                    console.log('store.setItem', true, 'store:', storeContents);
                                });
                        });
                    });
                })
                .on('warn-next', function() {
                    doNextWarning('next');
                })
                .on('warn-skip', function() {
                    doNextWarning('skip');
                });
        }
    });
});
