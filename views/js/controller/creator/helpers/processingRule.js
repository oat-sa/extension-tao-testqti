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
 * Basic helper that is intended to generate outcomes processing rules for a test model.
 *
 * @author Jean-Sébastien Conan <jean-sebastien@taotesting.com>
 */
define([
    'lodash',
    'taoQtiTest/controller/creator/helpers/baseType'
], function (_, baseType) {
    'use strict';

    var processingRuleHelper = {
        /**
         * Creates a basic processing rule
         * @param {String} type
         * @param {String} [identifier]
         * @param {Array|Object} [expression]
         * @returns {Object}
         * @throws {TypeError} if the type is empty or is not a string
         * @throws {TypeError} if the identifier is not a string
         */
        create: function create(type, identifier, expression) {
            var processingRule = {
                'qti-type': type
            };

            if (!type || !_.isString(type)) {
                throw new TypeError('You must provide a valid processing type!');
            }

            if (identifier) {
                if (!validateIdentifier(identifier)) {
                    throw new TypeError('You must provide a valid identifier!');
                }
                processingRule.identifier = identifier;
            }

            if (expression) {
                processingRuleHelper.setExpression(processingRule, expression);
            }

            return processingRule;
        },

        /**
         * Sets an expression to a processing rule
         * @param {Object} processingRule
         * @param {Object|Array} expression
         */
        setExpression: function setExpression(processingRule, expression) {
            if (processingRule) {
                if (_.isArray(expression)) {
                    if (processingRule.expression) {
                        processingRule.expression = null;
                    }
                    processingRule.expressions = expression;
                } else {
                    if (processingRule.expressions) {
                        processingRule.expressions = null;
                    }
                    if (expression) {
                        processingRule.expression = expression;
                    }
                }
            }
        },

        /**
         * Adds an expression to a processing rule
         * @param {Object} processingRule
         * @param {Object|Array} expression
         */
        addExpression: function addExpression(processingRule, expression) {
            if (processingRule && expression) {
                if (processingRule.expression) {
                    processingRule.expressions = forceArray(processingRule.expression);
                    processingRule.expression = null;
                }

                if (_.isArray(expression)) {
                    processingRule.expressions = forceArray(processingRule.expressions).concat(expression);
                } else {
                    if (processingRule.expressions) {
                        processingRule.expressions.push(expression);
                    } else {
                        processingRule.expression = expression;
                    }
                }
            }
        },

        /**
         * Creates a `setOutcomeValue` rule
         * @param {String} identifier
         * @param {Object|Array} [expression]
         * @returns {Object}
         * @throws {TypeError} if the identifier is empty or is not a string
         */
        setOutcomeValue: function setOutcomeValue(identifier, expression) {
            if (!validateIdentifier(identifier)) {
                throw new TypeError('You must provide a valid identifier!');
            }
            return processingRuleHelper.create('setOutcomeValue', identifier, expression);
        },

        /**
         * Creates a `gte` rule
         * @param {Object|Array} left - the left operand
         * @param {Object|Array} right - the right operand
         * @returns {Object}
         */
        gte: function gte(left, right) {
            return binaryOperator('gte', left, right);
        },

        /**
         * Creates a `lte` rule
         * @param {Object|Array} left - the left operand
         * @param {Object|Array} right - the right operand
         * @returns {Object}
         */
        lte: function lte(left, right) {
            return binaryOperator('lte', left, right);
        },

        /**
         * Creates a `divide` rule
         * @param {Object|Array} left - the left operand
         * @param {Object|Array} right - the right operand
         * @returns {Object}
         */
        divide: function divide(left, right) {
            return binaryOperator('divide', left, right);
        },

        /**
         * Creates a `sum` rule
         * @param {Object|Array} terms
         * @returns {Object}
         */
        sum: function sum(terms) {
            var processingRule = processingRuleHelper.create('sum', null, forceArray(terms));

            processingRule.minOperands = 1;
            processingRule.maxOperands = -1;
            processingRule.acceptedCardinalities = [0, 1, 2];
            processingRule.acceptedBaseTypes = [baseType.INTEGER, baseType.FLOAT];

            return processingRule;
        },

        /**
         * Creates a `testVariables` rule
         * @param {String} identifier
         * @param {String|Number} [type]
         * @param {String} weight
         * @param {String|String[]} [includeCategories]
         * @param {String|String[]} [excludeCategories]
         * @returns {Object}
         * @throws {TypeError} if the identifier is empty or is not a string
         */
        testVariables: function testVariables(identifier, type, weight, includeCategories, excludeCategories) {
            var processingRule = processingRuleHelper.create('testVariables');

            if (!validateIdentifier(identifier)) {
                throw new TypeError('You must provide a valid identifier!');
            }
            processingRule.variableIdentifier = identifier;

            if (weight) {
                if (!validateIdentifier(weight)) {
                    throw new TypeError('You must provide a valid weight identifier!');
                }
                processingRule.weightIdentifier = weight;
            } else {
                processingRule.weightIdentifier = '';
            }

            processingRule.baseType = baseType.validOrDefault(type);
            processingRule.sectionIdentifier = '';
            processingRule.includeCategories = forceArray(includeCategories);
            processingRule.excludeCategories = forceArray(excludeCategories);

            return processingRule;
        },

        /**
         * Creates a `numberPresented` rule
         * @param {String|String[]} [includeCategories]
         * @param {String|String[]} [excludeCategories]
         * @returns {Object}
         */
        numberPresented: function numberPresented(includeCategories, excludeCategories) {
            var processingRule = processingRuleHelper.create('numberPresented');

            processingRule.sectionIdentifier = '';
            processingRule.includeCategories = forceArray(includeCategories);
            processingRule.excludeCategories = forceArray(excludeCategories);

            return processingRule;
        },

        /**
         * Creates a `baseValue` rule
         * @param {*} [value]
         * @param {String|Number} [type]
         * @returns {Object}
         */
        baseValue: function baseValue(value, type) {
            var processingRule = processingRuleHelper.create('baseValue');

            processingRule.baseType = baseType.validOrDefault(type, baseType.FLOAT);
            processingRule.value = parseFloat(value) || 0;

            return processingRule;
        }

    };

    var identifierValidator = /^[a-zA-Z_][a-zA-Z0-9_\.-]*$/;

    /**
     * Checks the validity of an identifier
     * @param {String} identifier
     * @returns {Boolean}
     */
    function validateIdentifier(identifier) {
        return identifier &&_.isString(identifier) && identifierValidator.test(identifier);
    }

    /**
     * Creates a binary operator rule
     * @param {String} type - The rule type
     * @param {Object|Array} left - The left operand
     * @param {Object|Array} right - The right operand
     * @returns {Object}
     * @throws {TypeError} if the type is empty or is not a string
     */
    function binaryOperator(type, left, right) {
        var processingRule = processingRuleHelper.create(type, null, [left, right]);

        processingRule.minOperands = 2;
        processingRule.maxOperands = 2;
        processingRule.acceptedCardinalities = [0];
        processingRule.acceptedBaseTypes = [baseType.INTEGER, baseType.FLOAT];

        return processingRule;
    }

    /**
     * Ensures a value is an array
     * @param {*} value
     * @returns {Array}
     */
    function forceArray(value) {
        if (!value) {
            value = [];
        }
        if (!_.isArray(value)) {
            value = [value];
        }
        return value;
    }

    return processingRuleHelper;
});
