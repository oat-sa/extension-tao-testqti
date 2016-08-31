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
    'ui/dialog/confirm'
], function ($, _, __, pluginFactory, dialogAlert, dialogConfirm){
    'use strict';

    /**
     * Returns the configured plugin
     */
    return pluginFactory({
        name : 'dialog',

        /**
         * Initialize the plugin (called during runner's init)
         */
        init : function init(){
            var testRunner = this.getTestRunner();
            var alerts = [];
            var confirms = [];

            function addHandle(namespace, stack, dialog) {
                stack.push({
                    context: namespace,
                    dialog: dialog
                });

                dialog.on('closed.modal', function() {
                    removeHandle(stack, dialog);
                });
            }

            function removeHandle(stack, dialog) {
                _.forEach(stack, function(handle, index) {
                    if (handle && dialog && dialog === handle.dialog) {
                        stack[index] = null;
                    }
                });
            }

            function closeDialogs(namespace, accept, stack) {
                if (stack) {
                    _.forEach(stack, function(handle) {
                        if (handle && (namespace === '@' || namespace === handle.context)) {
                            if (accept) {
                                handle.dialog.trigger('okbtn.modal');
                            }
                            handle.dialog.hide();
                        }
                    });
                } else {
                    closeDialogs(namespace, accept, alerts);
                    closeDialogs(namespace, accept, confirms);
                }
            }

            function cleanUp() {
                alerts = _.compact(alerts);
                confirms = _.compact(confirms);
            }

            //change plugin state
            testRunner
                .before('alert.*', function(e, msg, accept) {
                    addHandle(e.namespace, alerts, dialogAlert(msg, accept));
                    _.defer(cleanUp);
                })
                .before('confirm.*', function(e, msg, accept, reject) {
                    addHandle(e.namespace, confirms, dialogConfirm(msg, accept, reject));
                    _.defer(cleanUp);
                })
                .before('closedialog.*', function(e, accept) {
                    closeDialogs(e.namespace, accept);
                    _.defer(cleanUp);
                });
        }
    });
});
