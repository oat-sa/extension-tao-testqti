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
 * This is a helper for navigation plugins. It decides if a warning should be displayed
 * before actually moving to the next item
 *
 * @author Christophe Noël <christophe@taotesting.com>
 */
define([], function () {
    'use strict';

    /**
     * Convert a value to a boolean
     * @param {*} value
     * @param {Boolean} defaultValue
     * @returns {Boolean}
     */
    var toBoolean = function toBoolean(value, defaultValue) {
        if (typeof(value) === "undefined") {
            return defaultValue;
        } else {
            return (value === true || value === "true");
        }
    };

    /**
     * @param {Object} options
     * @param {Boolean} options.endTestWarning - enables the end test warning, when applicable
     * @param {Boolean} options.isLast - if the item is the last of the test
     * @param {Boolean} options.isLinear - if the current part is linear
     * @param {Boolean} options.nextItemWarning - enables the next item warning, when applicable
     * @param {Object} options.nextPart - description of the next part of the test
     * @param {Number} options.remainingAttempts - remaining attempts for the current item
     * @param {String} options.testPartId - current test part identifier
     * @returns {Object}
     */
    var nextWarningHelper = function nextWarningHelper(options) {
        var endTestWarning      = toBoolean(options.endTestWarning, false),
            isLast              = toBoolean(options.isLast, false),
            isLinear            = toBoolean(options.isLinear, false),
            nextItemWarning     = toBoolean(options.nextItemWarning, false),
            unansweredItemsWarning = toBoolean(options.unansweredItemsWarning, false),
            nextPart            = options.nextPart || {},
            remainingAttempts   = typeof(options.remainingAttempts) === 'undefined' ? -1 : options.remainingAttempts,
            testPartId          = options.testPartId || '',

            warnBeforeNext = shouldWarnBeforeNext(),
            warnBeforeEnd = shouldWarnBeforeEnd();

        /**
         * Decide if we should display a warning before moving to the next item.
         * This is useful to prevent accidental navigation (for example by pressing a shortcut) that would occur
         * before the test taker actually gets a chance to answer an item
         */
        function shouldWarnBeforeNext() {
            return nextItemWarning
                && !itemCanBeTriedAtWill();
                //&& !exitTimedSectionWarning(); //todo: this should be implemented to prevent a double warning!
        }

        /**
         * We try to decide if the test taker has the freedom to come back to this item as many times as he wants
         */
        function itemCanBeTriedAtWill() {
            return (
                isLast === false                // the test is not over
                && isLinear === false           // the context is not linear
                && remainingAttempts === -1     // the item doesn't have a configured max attempts number
                && !isNextItemInLinearPart()    // the next item is not in a linear part
            );
        }

        /**
         * Check if the next item is in a linear part, as this would prevent the test taker to come back to the current item
         */
        function isNextItemInLinearPart() {
            return nextPart && nextPart.id && typeof nextPart.isLinear !== 'undefined'
                && testPartId !== nextPart.id
                && nextPart.isLinear === true;
        }

        /**
         * Decide if we should display a warning before ending the test
         */
        function shouldWarnBeforeEnd() {
            return isLast
                && (
                    endTestWarning              // warning is explicitly required by endTestWarning category
                    || unansweredItemsWarning   // warning is explicitly required by unansweredItemsWarning category
                    || warnBeforeNext           // warning implicitly triggered by the next item warning being true
                );
        }

        return {
            shouldWarnBeforeEnd: function () {
                return warnBeforeEnd;
            },
            shouldWarnBeforeNext: function () {
                return warnBeforeNext;
            }
        };
    };

    return nextWarningHelper;

});
