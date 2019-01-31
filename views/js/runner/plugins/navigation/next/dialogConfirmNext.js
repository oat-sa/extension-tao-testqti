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
 * @author Martin Nicholson <martin@taotesting.com>
 */
define([
    'jquery',
    'lodash',
    'i18n',
    'ui/dialog',
    'tpl!ui/dialog/tpl/checkbox'
], function ($, _, __, dialog, checkboxTpl) {
    'use strict';

    /**
     * Displays a confirmation dialog with a checkbox in it
     *
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
    return function dialogConfirmNext(heading, message, accept, refuse, checkboxParams, dialogOptions) {
        var accepted = false;
        var dlg;
        var content = null;
        if (checkboxParams && checkboxParams.checked !== true) {
            content = checkboxTpl({
                checked: false,
                text: "Don't show this again next time",
                id: 'dont-show-again'
            });
        }
        dialogOptions = _.defaults({
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
            onOkBtn: function onOkBtn() {
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
        }, dialogOptions);

        dlg = dialog(dialogOptions);

        if (_.isFunction(refuse)) {
            dlg.on('closed.modal', function() {
                if (!accepted) {
                    refuse.call(this);
                }
            });
        }
        return dlg;
    };

});