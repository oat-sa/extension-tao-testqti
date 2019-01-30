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
    'ui/dialog',
    'tpl!ui/dialog/tpl/checkbox'
], function ($, _, __, pluginFactory, currentItemHelper, dialog, checkboxTpl){
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
                var customNextMessage = 'message';
                var checkboxParams = null;
                var itemPartiallyAnswered = currentItemHelper.isAnswered(testRunner, true);

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

                            // Different variants of message text:
                            if (! itemPartiallyAnswered) {
                                customNextMessage = __('Are you sure you want to go to the next item? You will not be able to go back and provide an answer.');
                            }
                            else if (action === 'next') {
                                customNextMessage = __('Are you sure you want to go to the next item? You will not be able to go back and change your answer.');
                            }
                            else if (action === 'skip') {
                                customNextMessage = __('Are you sure you want to clear your answer and go to the next item? You will not be able to go back and provide an answer.');
                            }

                            // show special dialog:
                            dialogConfirmNext(
                                __('Go to the next item?'),
                                customNextMessage,
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
                    buttons: [{
                        id : 'cancel',
                        type : 'regular',
                        label : __('Cancel'),
                        close: true
                    },
                    {
                        id : 'ok',
                        type : 'info',
                        label : __('Go to next item'),
                        close: true
                    }],
                    onOkBtn: function() {
                        var $checkbox;
                        accepted = true;
                        if (_.isFunction(accept)) {
                            accept.call(this);

                            if (checkboxParams) {
                                // handle checkbox callbacks:
                                $checkbox = $('input[name="dont-show-again"]', this);
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
