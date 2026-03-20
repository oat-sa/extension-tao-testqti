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
 * Copyright (c) 2026 (original work) Open Assessment Technologies SA;
 */
define([], function() {
    'use strict';

    /**
     * Validate edited outcome declaration identifier.
     * @param {Object} options
     * @param {String} options.identifier
     * @param {String} [options.originalIdentifier]
     * @param {String} [options.currentOutcomeSerial]
     * @param {Array} [options.outcomeDeclarations]
     * @param {Function} options.validateIdentifier
     * @returns {{isUnique: boolean, identifierIsValid: boolean, hasError: boolean}}
     */
    function validateOutcomeIdentifier(options) {
        var identifier = options && options.identifier;
        var originalIdentifier = options && options.originalIdentifier;
        var currentOutcomeSerial = options && options.currentOutcomeSerial;
        var outcomeDeclarations = options && options.outcomeDeclarations ? options.outcomeDeclarations : [];
        var validateIdentifier = options && options.validateIdentifier;
        var identifierIsValid = !!(identifier && identifier.trim()) && validateIdentifier(identifier);
        var isUnique = !outcomeDeclarations.some(function(outcomeDeclaration) {
            var isCurrentOutcome = currentOutcomeSerial
                ? outcomeDeclaration.serial === currentOutcomeSerial
                : outcomeDeclaration.identifier === originalIdentifier;

            return !isCurrentOutcome && outcomeDeclaration.identifier === identifier;
        });

        return {
            isUnique: isUnique,
            identifierIsValid: identifierIsValid,
            hasError: !(isUnique && identifierIsValid)
        };
    }

    return validateOutcomeIdentifier;
});
