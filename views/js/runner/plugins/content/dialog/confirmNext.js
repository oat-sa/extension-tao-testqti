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
 * Copyright (c) 2015 (original work) Open Assessment Technologies SA ;
 */
/**
 * @author Martin Nicholson <martin@taotesting.com>
 */
define([
    'jquery',
    'lodash',
    'i18n',
    'ui/dialog'
], function ($, _, __, dialog) {
    'use strict';

    /**
     * Displays a confirm message with a checkbox beneath
     * @param {String} heading - Above the main message
     * @param {String} message - The displayed message
     * @param {Function} accept - An action called when the message is accepted
     * @param {Function} refuse - An action called when the message is refused
     * @param {Object} checkbox - Checkbox options
     * @param {Text}   checkbox.text - Label for the checkbox
     * @param {Function} [checkbox.submitChecked] - Action called when dialog accepted with checkbox checked
     * @param {Function} [checkbox.submitUnchecked] - Action called when dialog accepted with checkbox unchecked
     * @param {Object} options - Dialog options
     * @param {Object} options.buttons - Dialog button options
     * @param {Object} options.buttons.labels - Dialog button labels
     * @param {String} options.buttons.labels.ok - "OK" button label
     * @param {String} options.buttons.labels.cancel - "Cancel" button label
     * @returns {dialog} - Returns the dialog instance
     */
    return function dialogConfirmNext(heading, message, accept, refuse, checkboxParams, options) {
        var accepted = false;
        var _options = {
            buttons: {
                labels: {
                    ok: __('Go to next item'),
                    cancel: __('Cancel')
                }
            }
        };
        var dialogOptions;
        var dlg;
        var $checkbox;
        options = _.defaults(options || {}, _options);
        dialogOptions = {
            heading: heading,
            message: message,
            checkbox: checkboxParams,
            autoRender: true,
            autoDestroy: true,
            onOkBtn: function() {
                accepted = true;
                if (_.isFunction(accept)) {
                    accept.call(this);

                    // handle checkbox callbacks:
                    $checkbox = $('.modal input[name="dont-show-again"]');
                    console.log('checkbox checked?', $checkbox.prop('checked'));
                    if ($checkbox.prop('checked') && _.isFunction(checkboxParams.submitChecked)) {
                        checkboxParams.submitChecked();
                    }
                    else if (!$checkbox.prop('checked') && _.isFunction(checkboxParams.submitUnchecked)) {
                        checkboxParams.submitUnchecked();
                    }
                }
            },
            buttons: [
                {
                    id : 'cancel',
                    type : 'regular',
                    label : options.buttons.labels.cancel || __('Cancel'),
                    close: true
                },
                {
                    id : 'ok',
                    type : 'info',
                    label : options.buttons.labels.ok || __('Ok'),
                    close: true
                }
            ]
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
    };
});
