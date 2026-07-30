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
 * The BaseType enumeration (port of \qtism\common\enums\BaseType).
 *
 * From IMS QTI:
 *
 * A base-type is simply a description of a set of atomic values (atomic to this specification).
 * Note that several of the baseTypes used to define the runtime data model have identical
 * definitions to those of the basic data types used to define the values for attributes
 * in the specification itself. The use of an enumeration to define the set of baseTypes
 * used in the runtime model, as opposed to the use of classes with similar names, is
 * designed to help distinguish between these two distinct levels of modelling.
 *
 * @author Jérôme Bogaerts <jerome@taotesting.com>
 * @author Jean-Sébastien Conan <jean-sebastien@taotesting.com>
 */
define([
    'lodash'
], function (_) {
    'use strict';

    /**
     * The list of QTI base types
     * @type {Object}
     */
    var baseTypeEnum = {
        /**
         * From IMS QTI:
         *
         * The set of identifier values is the same as the set of values
         * defined by the identifier class.
         *
         * @type {Number}
         */
        IDENTIFIER: 0,

        /**
         * From IMS QTI:
         *
         * The set of boolean values is the same as the set of values defined
         * by the boolean class.
         *
         * @type {Number}
         */
        BOOLEAN: 1,

        /**
         * From IMS QTI:
         *
         * The set of integer values is the same as the set of values defined
         * by the integer class.
         *
         * @type {Number}
         */
        INTEGER: 2,

        /**
         * From IMS QTI:
         *
         * The set of float values is the same as the set of values defined by the
         * float class.
         *
         * @type {Number}
         */
        FLOAT: 3,

        /**
         * From IMS QTI:
         *
         * The set of string values is the same as the set of values defined by the
         * string class.
         *
         * @type {Number}
         */
        STRING: 4,

        /**
         * From IMS QTI:
         *
         * A point value represents an integer tuple corresponding to a graphic point.
         * The two integers correspond to the horizontal (x-axis) and vertical (y-axis)
         * positions respectively. The up/down and left/right senses of the axes are
         * context dependent.
         *
         * @type {Number}
         */
        POINT: 5,

        /**
         * From IMS QTI:
         *
         * A pair value represents a pair of identifiers corresponding to an association
         * between two objects. The association is undirected so (A,B) and (B,A) are equivalent.
         *
         * @type {Number}
         */
        PAIR: 6,

        /**
         * From IMS QTI:
         *
         * A directedPair value represents a pair of identifiers corresponding to a directed
         * association between two objects. The two identifiers correspond to the source
         * and destination objects.
         *
         * @type {Number}
         */
        DIRECTED_PAIR: 7,

        /**
         * From IMS QTI:
         *
         * A duration value specifies a distance (in time) between two time points.
         * In other words, a time period as defined by [ISO8601], but represented as
         * a single float that records time in seconds. Durations may have a fractional
         * part. Durations are represented using the xsd:double datatype rather than
         * xsd:dateTime for convenience and backward compatibility.
         *
         * @type {Number}
         */
        DURATION: 8,

        /**
         * From IMS QTI:
         *
         * A file value is any sequence of octets (bytes) qualified by a content-type and an
         * optional filename given to the file (for example, by the candidate when uploading
         * it as part of an interaction). The content type of the file is one of the MIME
         * types defined by [RFC2045].
         *
         * @type {Number}
         */
        FILE: 9,

        /**
         * From IMS QTI:
         *
         * A URI value is a Uniform Resource Identifier as defined by [URI].
         *
         * @type {Number}
         */
        URI: 10,

        /**
         * From IMS QTI:
         *
         * An intOrIdentifier value is the union of the integer baseType and
         * the identifier baseType.
         *
         * @type {Number}
         */
        INT_OR_IDENTIFIER: 11,

        /**
         * In qtism, we consider an extra 'coords' baseType.
         *
         * @type {Number}
         */
        COORDS: 12,

        /**
         * Express that the operands can have any BaseType from the BaseType enumeration and
         * can be different.
         *
         * @type {Number}
         */
        ANY: 12,

        /**
         * Express that all the operands must have the same
         * baseType.
         *
         * @type {Number}
         */
        SAME: 13
    };

    var baseTypeHelper = _({
        /**
         * Gets the the list of QTI base types
         * @returns {Object}
         */
        asArray: function asArray() {
            return baseTypeEnum;
        },

        /**
         * Gets a valid type or the default
         * @param {String|Number} type
         * @param {String|Number} [defaultType]
         * @returns {*}
         */
        getValid: function getValid(type, defaultType) {
            if (_.isFinite(type)) {
                if (!baseTypeHelper.getNameByConstant(type)) {
                    type = false;
                }
            } else {
                type = baseTypeHelper.getConstantByName(type);
            }

            if (false === type) {
                if (!_.isUndefined(defaultType) && defaultType !== -1) {
                    type = baseTypeHelper.getValid(defaultType, -1);
                } else {
                    type = -1;
                }
            }

            return type;
        },

        /**
         * Adjusts a value with respect to the type
         * @param {String|Number} type
         * @param {*} value
         * @returns {*}
         */
        getValue: function getValue(type, value) {
            if (_.isString(type)) {
                type = baseTypeHelper.getConstantByName(type);
            }

            switch (type) {
                case baseTypeEnum.URI:
                case baseTypeEnum.STRING:
                case baseTypeEnum.IDENTIFIER:
                    return value + '';

                case baseTypeEnum.BOOLEAN:
                    if (_.isString(value)) {
                        switch (value.toLowerCase()) {
                            case 'true':
                                return true;
                            case 'false':
                                return false;
                        }
                    }
                    return !!value;

                case baseTypeEnum.INTEGER:
                    return parseInt(value, 10) || 0;

                case baseTypeEnum.FLOAT:
                    return parseFloat(value) || 0;

                case baseTypeEnum.INT_OR_IDENTIFIER:
                    if (!_.isNaN(parseInt(value, 10))) {
                        return parseInt(value, 10) || 0;
                    } else {
                        return '' + value;
                    }
            }

            return value;
        },

        /**
         * Get a constant value from the BaseType enumeration by baseType name.
         *
         * * 'identifier' -> baseTypes.IDENTIFIER
         * * 'boolean' -> baseTypes.BOOLEAN
         * * 'integer' -> baseTypes.INTEGER
         * * 'float' -> baseTypes.FLOAT
         * * 'string' -> baseTypes.STRING
         * * 'point' -> baseTypes.POINT
         * * 'pair' -> baseTypes.PAIR
         * * 'directedPair' -> baseTypes.DIRECTED_PAIR
         * * 'duration' -> baseTypes.DURATION
         * * 'file' -> baseTypes.FILE
         * * 'uri' -> baseTypes.URI
         * * 'intOrIdentifier' -> baseTypes.INT_OR_IDENTIFIER
         * * extra 'coords' -> baseTypes.COORDS
         *
         * @param {String} name The baseType name.
         * @return {Number|Boolean} The related enumeration value or `false` if the name could not be resolved.
         */
        getConstantByName: function getConstantByName(name) {
            switch (String(name).trim().toLowerCase()) {
                case 'identifier':
                    return baseTypeEnum.IDENTIFIER;

                case 'boolean':
                    return baseTypeEnum.BOOLEAN;

                case 'integer':
                    return baseTypeEnum.INTEGER;

                case 'float':
                    return baseTypeEnum.FLOAT;

                case 'string':
                    return baseTypeEnum.STRING;

                case 'point':
                    return baseTypeEnum.POINT;

                case 'pair':
                    return baseTypeEnum.PAIR;

                case 'directedpair':
                    return baseTypeEnum.DIRECTED_PAIR;

                case 'duration':
                    return baseTypeEnum.DURATION;

                case 'file':
                    return baseTypeEnum.FILE;

                case 'uri':
                    return baseTypeEnum.URI;

                case 'intoridentifier':
                    return baseTypeEnum.INT_OR_IDENTIFIER;

                case 'coords':
                    return baseTypeEnum.COORDS;

                case 'any':
                    return baseTypeEnum.ANY;

                case 'same':
                    return baseTypeEnum.SAME;

                default:
                    return false;
            }
        },

        /**
         * Get the QTI name of a BaseType.
         *
         * @param {Number} constant A constant value from the BaseType enumeration.
         * @param {Boolean} [operator] A flag that allow to switch between operator an value types to prevent duplicate name issue
         * @return {String|Boolean} The QTI name or false if not match.
         */
        getNameByConstant: function getNameByConstant(constant, operator) {
            switch (constant) {
                case baseTypeEnum.IDENTIFIER:
                    return 'identifier';

                case baseTypeEnum.BOOLEAN:
                    return 'boolean';

                case baseTypeEnum.INTEGER:
                    return 'integer';

                case baseTypeEnum.FLOAT:
                    return 'float';

                case baseTypeEnum.STRING:
                    return 'string';

                case baseTypeEnum.POINT:
                    return 'point';

                case baseTypeEnum.PAIR:
                    return 'pair';

                case baseTypeEnum.DIRECTED_PAIR:
                    return 'directedPair';

                case baseTypeEnum.DURATION:
                    return 'duration';

                case baseTypeEnum.FILE:
                    return 'file';

                case baseTypeEnum.URI:
                    return 'uri';

                case baseTypeEnum.INT_OR_IDENTIFIER:
                    return 'intOrIdentifier';

                case baseTypeEnum.COORDS:
                case baseTypeEnum.ANY:
                    if (operator) {
                        return 'any';
                    } else {
                        return 'coords';
                    }

                case baseTypeEnum.SAME:
                    return 'same';

                default:
                    return false;
            }
        }
    }).assign(baseTypeEnum).value();

    return baseTypeHelper;
});
