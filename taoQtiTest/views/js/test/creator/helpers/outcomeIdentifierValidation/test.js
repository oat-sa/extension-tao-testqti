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
    'taoQtiTest/controller/creator/helpers/outcomeIdentifierValidation',
    'taoQtiTest/controller/creator/helpers/outcomeValidator'
], function(validateOutcomeIdentifier, outcomeValidator) {
    'use strict';

    QUnit.module('helpers/outcomeIdentifierValidation');

    QUnit.test('module', function(assert) {
        assert.expect(1);
        assert.equal(typeof validateOutcomeIdentifier, 'function', 'The helper exposes a function');
    });

    QUnit.test('invalid identifier then corrected identifier is revalidated', function(assert) {
        var declarations = [{ identifier: 'OUTCOME_1', serial: 'serial_1' }];
        var invalidState;
        var correctedState;

        assert.expect(6);

        invalidState = validateOutcomeIdentifier({
            identifier: 'OUTCOME 1',
            originalIdentifier: 'OUTCOME_1',
            currentOutcomeSerial: 'serial_1',
            outcomeDeclarations: declarations,
            validateIdentifier: outcomeValidator.validateIdentifier
        });

        assert.notOk(invalidState.identifierIsValid, 'Identifier with space is invalid');
        assert.ok(invalidState.hasError, 'Invalid identifier produces validation error');

        correctedState = validateOutcomeIdentifier({
            identifier: 'OUTCOME_1',
            originalIdentifier: 'OUTCOME_1',
            currentOutcomeSerial: 'serial_1',
            outcomeDeclarations: declarations,
            validateIdentifier: outcomeValidator.validateIdentifier
        });

        assert.ok(correctedState.identifierIsValid, 'Corrected identifier is valid');
        assert.ok(correctedState.isUnique, 'Current edited outcome is excluded from duplicate check');
        assert.notOk(correctedState.hasError, 'No error remains after correction');
        assert.notEqual(invalidState.hasError, correctedState.hasError, 'Validation state changes after correction');
    });

    QUnit.test('valid but duplicate identifier is rejected', function(assert) {
        var state = validateOutcomeIdentifier({
            identifier: 'OUTCOME_2',
            originalIdentifier: 'OUTCOME_1',
            currentOutcomeSerial: 'serial_1',
            outcomeDeclarations: [
                { identifier: 'OUTCOME_1', serial: 'serial_1' },
                { identifier: 'OUTCOME_2', serial: 'serial_2' }
            ],
            validateIdentifier: outcomeValidator.validateIdentifier
        });

        assert.expect(3);
        assert.ok(state.identifierIsValid, 'Format is valid');
        assert.notOk(state.isUnique, 'Duplicate identifier is detected');
        assert.ok(state.hasError, 'Duplicate identifier produces validation error');
    });

    QUnit.test('fallback to original identifier when serial is not available', function(assert) {
        var state = validateOutcomeIdentifier({
            identifier: 'OUTCOME_1',
            originalIdentifier: 'OUTCOME_1',
            outcomeDeclarations: [{ identifier: 'OUTCOME_1' }],
            validateIdentifier: outcomeValidator.validateIdentifier
        });

        assert.expect(2);
        assert.ok(state.isUnique, 'Current edited outcome is excluded via original identifier fallback');
        assert.notOk(state.hasError, 'No validation error for unchanged valid identifier');
    });

    QUnit.test('missing validateIdentifier fails closed', function(assert) {
        var state = validateOutcomeIdentifier({
            identifier: 'OUTCOME_1',
            originalIdentifier: 'OUTCOME_1',
            outcomeDeclarations: [{ identifier: 'OUTCOME_1', serial: 'serial_1' }]
        });

        assert.expect(2);
        assert.notOk(state.identifierIsValid, 'Identifier is treated as invalid when validateIdentifier is missing');
        assert.ok(state.hasError, 'Validation fails closed when validateIdentifier is missing');
    });
});
