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
 * The Cardinality enumeration (port of \qtism\common\enums\Cardinality).
 *
 * From IMS QTI:
 *
 * An expression or itemVariable can either be single-valued or multi-valued. A multi-valued
 * expression (or variable) is called a container. A container contains a list of values,
 * this list may be empty in which case it is treated as NULL. All the values in a multiple
 * or ordered container are drawn from the same value set, however, containers may contain
 * multiple occurrences of the same value. In other words, [A,B,B,C] is an acceptable value
 * for a container. A container with cardinality multiple and value [A,B,C] is equivalent
 * to a similar one with value [C,B,A] whereas these two values would be considered distinct
 * for containers with cardinality ordered. When used as the value of a response variable
 * this distinction is typified by the difference between selecting choices in a multi-response
 * multi-choice task and ranking choices in an order objects task. In the language of [ISO11404]
 * a container with multiple cardinality is a "bag-type", a container with ordered cardinality
 * is a "sequence-type" and a container with record cardinality is a "record-type".
 *
 * The record container type is a special container that contains a set of independent values
 * each identified by its own identifier and having its own base-type. This specification
 * does not make use of the record type directly however it is provided to enable
 * customInteractions to manipulate more complex responses and customOperators to
 * return more complex values, in addition to the use for detailed information about
 * numeric responses described in the stringInteraction abstract class.
 *
 * @author Jérôme Bogaerts <jerome@taotesting.com>
 * @author Jean-Sébastien Conan <jean-sebastien@taotesting.com>
 */
define([
    'lodash'
], function (_) {
    'use strict';

    /**
     * The list of QTI cardinalities
     * @type {Object}
     */
    var cardinalityEnum = {
        /**
         * Single term cardinality
         *
         * @type {Number}
         */
        SINGLE: 0,

        /**
         * Multiple terms cardinality
         *
         * @type {Number}
         */
        MULTIPLE: 1,

        /**
         * Ordered terms cardinality
         *
         * @type {Number}
         */
        ORDERED: 2,

        /**
         * Record term cardinality
         *
         * @type {Number}
         */
        RECORD: 3,

        /**
         * Express that all the expressions involved in an operator have
         * the same cardinality.
         *
         * @type {Number}
         */
        SAME: 4,

        /**
         * Express that all the expressions involved in an operator may
         * have any cardinality.
         *
         * @type {Number}
         */
        ANY: 5
    };

    var cardinalityHelper = _({
        /**
         * Gets the the list of QTI cardinalities
         * @returns {Object}
         */
        asArray: function asArray() {
            return cardinalityEnum;
        },

        /**
         * Gets a valid cardinality or the default
         * @param {String|Number} cardinality
         * @param {String|Number} [defaultCardinality]
         * @returns {*}
         */
        getValid: function getValid(cardinality, defaultCardinality) {
            if (_.isFinite(cardinality)) {
                if (!cardinalityHelper.getNameByConstant(cardinality)) {
                    cardinality = false;
                }
            } else {
                cardinality = cardinalityHelper.getConstantByName(cardinality);
            }

            if (false === cardinality) {
                if (!_.isUndefined(defaultCardinality) && defaultCardinality !== cardinalityEnum.SINGLE) {
                    cardinality = cardinalityHelper.getValid(defaultCardinality, cardinalityEnum.SINGLE);
                } else {
                    cardinality = cardinalityEnum.SINGLE;
                }
            }

            return cardinality;
        },

        /**
         * Get a constant value from its name.
         *
         * @param {String} name The name of the constant, as per QTI spec.
         * @return {Number|Boolean} The constant value or `false` if not found.
         */
        getConstantByName: function getConstantByName(name) {
            switch (String(name).trim().toLowerCase()) {
                case 'single':
                    return cardinalityEnum.SINGLE;

                case 'multiple':
                    return cardinalityEnum.MULTIPLE;

                case 'ordered':
                    return cardinalityEnum.ORDERED;

                case 'record':
                    return cardinalityEnum.RECORD;

                case 'same':
                    return cardinalityEnum.SAME;

                case 'any':
                    return cardinalityEnum.ANY;

                default:
                    return false;
            }
        },

        /**
         * Get the name of a constant from its value.
         *
         * @param {Number} constant The constant value to search the name for.
         * @return {String|Boolean} The name of the constant or false if not found.
         */
        getNameByConstant: function getNameByConstant(constant) {
            switch (constant) {
                case cardinalityEnum.SINGLE:
                    return 'single';

                case cardinalityEnum.MULTIPLE:
                    return 'multiple';

                case cardinalityEnum.ORDERED:
                    return 'ordered';

                case cardinalityEnum.RECORD:
                    return 'record';

                case cardinalityEnum.SAME:
                    return 'same';

                case cardinalityEnum.ANY:
                    return 'any';

                default:
                    return false;
            }
        }
    }).assign(cardinalityEnum).value();

    return cardinalityHelper;
});
