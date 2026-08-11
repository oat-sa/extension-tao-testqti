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
 * Foundation, Inc., 31 Milk Street, # 960789, Boston, MA 02196, USA.
 *
 * Copyright (c) 2026 (original work) Open Assessment Technologies SA;
 */
define(['jquery'], function($) {
    'use strict';

    /**
     * Keep save button disabled while any outcome identifier has a validation error.
     * @param {jQuery} [$saveButton]
     * @returns {boolean} true when any outcome validation error exists
     */
    function updateOutcomeSaveButtonState($saveButton) {
        var $button = $saveButton && $saveButton.length ? $saveButton : $('#saver');
        var hasOutcomeValidationErrors = !!$('.outcome-declarations-manual .validate-error').length;

        if (hasOutcomeValidationErrors) {
            $button.addClass('disabled').attr('disabled', true);
        } else {
            $button.removeClass('disabled').removeAttr('disabled');
        }

        return hasOutcomeValidationErrors;
    }

    return updateOutcomeSaveButtonState;
});
