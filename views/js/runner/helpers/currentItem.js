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
 * This helper provides information about the current item
 *
 * @author Jean-Sébastien Conan <jean-sebastien.conan@vesperiagroup.com>
 */
define([
    'lodash'
], function (_) {
    'use strict';

    /**
     * List of QTI model cardinalities
     * @type {Object}
     */
    var responseCardinalities = {
        single: 'base',
        multiple: 'list',
        ordered: 'list',
        record: 'record'
    };

    /**
     * @typedef {currentItemHelper}
     */
    var currentItemHelper = {
        /**
         * Gets the responses declarations of the current item.
         * @param {Object} runner - testRunner instance
         * @returns {Object}
         */
        getDeclarations: function getDeclarations(runner) {
            var itemRunner = runner.itemRunner;
            return itemRunner._item && itemRunner._item.responses;
        },

        /**
         * Gets a response declaration by the identifier of the response
         * @param {Object} runner - testRunner instance
         * @param {String} identifier - The identifier of the response
         * @returns {Object|null}
         */
        getResponseDeclaration: function getResponseDeclaration(runner, identifier) {
            var found = null;
            _.forEach(currentItemHelper.getDeclarations(runner), function (declaration) {
                var attributes = declaration.attributes || {};
                if (attributes.identifier === identifier) {
                    found = declaration;
                    return false;
                }
            });
            return found;
        },

        /**
         * Convert a value to a response object
         * @param {Array|String} value
         * @param {String} baseType
         * @param {String} cardinality
         * @returns {Object}
         */
        toResponse: function toResponse(value, baseType, cardinality) {
            var mappedCardinality = responseCardinalities[cardinality];
            var response = {};

            if (_.isString(value)) {
                value = [value];
            }

            value = _.map(value || [], function (v) {
                return (baseType === 'boolean') ? (v === true || v === 'true') : v;
            });

            if (mappedCardinality) {
                if (mappedCardinality === 'base') {
                    if (value.length === 0) {
                        //return empty response:
                        response.base = null;
                    } else {
                        response.base = {};
                        response.base[baseType] = value[0];
                    }
                } else {
                    response[mappedCardinality] = {};
                    response[mappedCardinality][baseType] = value;
                }
            }

            return response;
        },

        /**
         * Checks if the provided value can be considered as null
         * @param {Object} value
         * @param {String} baseType
         * @param {String} cardinality
         * @returns {boolean}
         */
        isQtiValueNull: function isQtiValueNull(value, baseType, cardinality) {
            var mappedCardinality = responseCardinalities[cardinality];
            if (_.isObject(value) && value[mappedCardinality] && 'undefined' !== typeof value[mappedCardinality][baseType]) {
                value = value[mappedCardinality][baseType];
            }
            return null === value || ('string' === baseType && _.isEmpty(value)) || (cardinality !== 'single' && _.isEmpty(value));
        },

        /**
         * Tells if an item question has been answered or not
         * @param response
         * @param baseType
         * @param cardinality
         * @param [defaultValue]
         * @returns {*}
         */
        isQuestionAnswered: function isQuestionAnswered(response, baseType, cardinality, defaultValue) {
            var answered;
            defaultValue = defaultValue || null;
            if (currentItemHelper.isQtiValueNull(response, baseType, cardinality)) {
                answered = !currentItemHelper.isQtiValueNull(defaultValue, baseType, cardinality);
            } else {
                answered = !_.isEqual(response, currentItemHelper.toResponse(defaultValue, baseType, cardinality));
            }
            return answered;
        },

        /**
         * Tells is the current item has been answered or not
         * The item is considered answered when at least one response has been set to not empty {base : null}
         * @param {Object} runner - testRunner instance
         * @param {Boolean} [partially = true] - if false all questions must have been answered
         * @returns {Boolean}
         */
        isAnswered: function isAnswered(runner, partially) {
            var itemRunner = runner.itemRunner;
            var responses = itemRunner && itemRunner.getResponses();
            var count = 0;
            var empty = 0;

            if (itemRunner) {
                _.forEach(currentItemHelper.getDeclarations(runner), function (declaration) {
                    var attributes = declaration.attributes || {};
                    var response = responses[attributes.identifier];
                    var baseType = attributes.baseType;
                    var cardinality = attributes.cardinality;

                    count++;
                    if (!currentItemHelper.isQuestionAnswered(response, baseType, cardinality, declaration.defaultValue)) {
                        empty++;
                    }
                });
            }
            if( partially === false ){
                return count > 0 && empty === 0;
            }
            return count > 0 && empty < count;
        }
    };

    return currentItemHelper;
});
