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
 * Copyright (c) 2017 (original work) Open Assessment Technologies SA ;
 */
/**
 * @author Jean-Sébastien Conan <jean-sebastien@taotesting.com>
 */
define([
    'lodash'
], function (_) {
    'use strict';

    /**
     * The RegEx that validates outcome identifiers
     * @type {RegExp}
     */
    var identifierValidator = /^[a-zA-Z_][a-zA-Z0-9_\.-]*$/;

    /**
     * Checks the validity of an identifier
     * @param {String} identifier
     * @returns {Boolean}
     */
    function validateIdentifier(identifier) {
        return !!(identifier && _.isString(identifier) && identifierValidator.test(identifier));
    }

    /**
     * Checks if an object is a valid outcome
     * @param {Object} outcome
     * @param {Boolean} [checkIdentifier]
     * @param {String||String[]} [allowedTypes]
     * @returns {Boolean}
     */
    function validateOutcome(outcome, checkIdentifier, allowedTypes) {
        var validOutcome = _.isPlainObject(outcome) && validateIdentifier(outcome['qti-type']);
        var validIdentifier = !checkIdentifier || (outcome && validateIdentifier(outcome.identifier));

        if (allowedTypes) {
            allowedTypes = !_.isArray(allowedTypes) ? [allowedTypes] : allowedTypes;
            validOutcome =  validOutcome && _.indexOf(allowedTypes, outcome['qti-type']) >= 0;
        }

        return !!(validOutcome && validIdentifier);
    }

    /**
     * Checks if an array contains valid outcomes
     * @param {Array} outcomes
     * @param {Boolean} [checkIdentifier]
     * @param {String||String[]} [allowedTypes]
     * @returns {Boolean}
     */
    function validateOutcomes(outcomes, checkIdentifier, allowedTypes) {
        var valid = _.isArray(outcomes);
        _.forEach(outcomes, function(outcome) {
            if (!validateOutcome(outcome, checkIdentifier, allowedTypes)) {
                valid = false;
                return false;
            }
        });
        return valid;
    }

    return {
        validateIdentifier: validateIdentifier,
        validateOutcomes: validateOutcomes,
        validateOutcome: validateOutcome
    };
});
