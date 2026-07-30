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
define([
    'jquery',
    'taoQtiTest/controller/creator/helpers/outcomeSaveButtonState'
], function($, updateOutcomeSaveButtonState) {
    'use strict';

    QUnit.module('helpers/outcomeSaveButtonState', {
        beforeEach: function() {
            $('#qunit-fixture').empty().append(
                '<button id="saver"></button>' +
                '<div class="outcome-declarations-manual">' +
                    '<div class="outcome-container" data-serial="serial_1">' +
                        '<input class="identifier" value="OUTCOME 1" />' +
                        '<span class="validate-error">invalid</span>' +
                    '</div>' +
                    '<div class="outcome-container" data-serial="serial_2">' +
                        '<input class="identifier" value="OUTCOME_2" />' +
                    '</div>' +
                '</div>'
            );
        }
    });

    QUnit.test('module', function(assert) {
        assert.expect(1);
        assert.equal(typeof updateOutcomeSaveButtonState, 'function', 'The helper exposes a function');
    });

    QUnit.test('save stays disabled when first identifier is invalid and second is valid', function(assert) {
        var $saveButton = $('#saver');
        var hasErrors;

        assert.expect(8);

        hasErrors = updateOutcomeSaveButtonState($saveButton);
        assert.ok(hasErrors, 'Validation errors are detected');
        assert.ok($saveButton.hasClass('disabled'), 'Save button has disabled class when any error exists');
        assert.strictEqual($saveButton.attr('disabled'), 'disabled', 'Save button is disabled when any error exists');

        // Simulate editing another row with a valid identifier. First row still has a validation error.
        $('.outcome-container[data-serial="serial_2"] .identifier').val('OUTCOME_2_FIXED');
        hasErrors = updateOutcomeSaveButtonState($saveButton);

        assert.ok(hasErrors, 'Validation errors are still detected after editing another valid row');
        assert.ok($saveButton.hasClass('disabled'), 'Save button stays disabled while first row error remains');
        assert.strictEqual($saveButton.attr('disabled'), 'disabled', 'Disabled attribute remains while first row error remains');

        $('.outcome-container[data-serial="serial_1"] .validate-error').remove();
        hasErrors = updateOutcomeSaveButtonState($saveButton);

        assert.notOk(hasErrors, 'No validation errors after correcting invalid row');
        assert.notOk($saveButton.hasClass('disabled'), 'Save button is enabled after all errors are fixed');
    });
});
