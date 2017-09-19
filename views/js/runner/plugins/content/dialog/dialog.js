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
 * Copyright (c) 2016 (original work) Open Assessment Technologies SA ;
 */

/**
 * Test Runner Content Plugin : Overlay
 *
 * @author Bertrand Chevrier <bertrand@taotesting.com>
 */
define([
    'jquery',
    'lodash',
    'i18n',
    'taoTests/runner/plugin',
    'ui/dialog/alert',
    'ui/dialog/confirm',
    'util/shortcut/registry',
    'util/shortcut',
    'util/namespace'
], function ($, _, __, pluginFactory, dialogAlert, dialogConfirm, shortcutRegistry, globalShortcut, namespaceHelper){
    'use strict';

    /**
     * The public name of the plugin
     * @type {String}
     */
    var pluginName = 'dialog';

    /**
     * The prefix of actions triggered through the event loop
     * @type {String}
     */
    var actionPrefix = 'tool-' + pluginName + '-';

    /**
     * Returns the configured plugin
     */
    return pluginFactory({
        name : pluginName,

        /**
         * Initialize the plugin (called during runner's init)
         */
        init : function init(){
            var testRunner = this.getTestRunner();
            var testData = testRunner.getTestData() || {};
            var testConfig = testData.config || {};
            var pluginShortcuts = (testConfig.shortcuts || {})[pluginName] || {};
            var alerts = [];
            var confirms = [];
            var opened = [];
            var dialogShortcut = shortcutRegistry($('body'), {
                propagate: false,
                prevent: true
            });

            /**
             * Closes a dialog with accept
             * @param {dialog} dialog - The instance of the dialog
             */
            function closeAccept(dialog) {
                // TODO: improve the dialog implementation in order to provide a better API
                dialog.trigger('okbtn.modal').hide();
            }

            /**
             * Closes a dialog with rejection
             * @param {dialog} dialog - The instance of the dialog
             */
            function closeReject(dialog) {
                dialog.hide();
            }

            /**
             * Closes the last opened dialog
             * @param {Boolean} accept Whether the dialog should be accepted or not
             * @param {String} [shortcut] The shortcut that caused the action
             */
            function closeLast(accept, shortcut) {
                var handle = opened.length && opened[opened.length - 1];
                if (handle) {
                    handle.shortcut = shortcut;
                    if (accept) {
                        closeAccept(handle.dialog);
                    } else {
                        closeReject(handle.dialog);
                    }
                }
            }

            /**
             * Add dialog on top of the provided stack
             * @param {String} namespace - The event namespace that scope the dialog
             * @param {Array} stack - The dialogs stack on which push the new instance
             * @param {Function} dialog - The constructor of the dialog
             * @param {String} message - The message to display
             * @param {Function} accept - The callback for accept
             * @param {Function} reject - The callback for reject
             * @param {Object} options - Dialog options
             */
            function addHandle(namespace, stack, dialog, message, accept, reject, options) {
                var handle = {
                    context: namespace,
                    dialog: dialog(message, doAccept, doReject, options)
                };

                function doAccept(e, reason) {
                    if (_.isFunction(accept)) {
                        accept(handle.shortcut || reason);
                    }
                }
                function doReject(e, reason) {
                    if (_.isFunction(reject)) {
                        reject(handle.shortcut || reason);
                    }
                }

                // prevents all registered shortcuts to be triggered
                // and brings back the dialog shortcuts
                globalShortcut.disable();
                dialogShortcut.enable();

                stack.push(handle);
                opened.push(handle);

                handle.dialog.focus();
                handle.dialog.on('closed.modal', function() {
                    removeHandle(stack, handle.dialog);
                    removeHandle(opened, handle.dialog);

                    // if all dialogs have been closed allows all registered shortcuts to be triggered
                    // also disables the dialog shortcuts
                    if (!opened.length) {
                        globalShortcut.enable();
                        dialogShortcut.disable();
                    }
                });
            }

            /**
             * Remove a dialog from the provided stack
             * @param {Array} stack - The dialogs stack from which remove the dialog instance
             * @param {dialog} dialog - The instance of the dialog
             */
            function removeHandle(stack, dialog) {
                if (dialog) {
                    _.remove(stack, function(handle) {
                        if (handle && dialog === handle.dialog) {
                            return true;
                        }
                    });
                }
            }

            /**
             * Closes all dialogs within the provided stack
             * @param {String} namespace - The event namespace that scope the dialogs to close
             * @param {Boolean} accept - Whether (`true`) or not (`false`) to close the dialogs with accept
             * @param {Array} stack - The dialogs stack in which close the dialogs
             */
            function closeDialogs(namespace, accept, stack) {
                if (stack) {
                    _.forEach(stack, function(handle) {
                        if (handle && (namespace === '@' || namespace === handle.context)) {
                            if (accept) {
                                closeAccept(handle.dialog);
                            } else {
                                closeReject(handle.dialog);
                            }
                        }
                    });
                } else {
                    closeDialogs(namespace, accept, alerts);
                    closeDialogs(namespace, accept, confirms);
                }
            }

            // starts with shortcuts disabled, prevents the TAB key to be used to move outside the dialog box
            dialogShortcut.disable().set('Tab Shift+Tab');

            // handle the plugin's shortcuts
            if (testConfig.allowShortcuts) {
                _.forEach(pluginShortcuts, function(command, key) {
                    dialogShortcut.add(namespaceHelper.namespaceAll(command, pluginName, true), function(e, shortcut) {
                        // just fire the action using the event loop
                        testRunner.trigger(actionPrefix + key, shortcut);
                    });
                });
            }

            //change plugin state
            testRunner
                .before('alert.*', function(e, msg, accept) {
                    addHandle(e.namespace, alerts, dialogAlert, msg, accept, accept);
                })
                .before('confirm.*', function(e, msg, accept, reject, options) {
                    addHandle(e.namespace, confirms, dialogConfirm, msg, accept, reject, options);
                })
                .before('closedialog.*', function(e, accept) {
                    closeDialogs(e.namespace, accept);
                })
                .on(actionPrefix + 'accept', function(shortcut) {
                    closeLast(true, shortcut);
                })
                .on(actionPrefix + 'reject', function(shortcut) {
                    closeLast(false, shortcut);
                })
                .on('destroy', function() {
                    closeDialogs('.@');

                    dialogShortcut.clear();
                    dialogShortcut = null;
                });
        }
    });
});
