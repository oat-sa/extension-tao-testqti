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
    'taoQtiTest/controller/creator/helpers/outcomeValidator',
    'taoQtiTest/controller/creator/helpers/qtiElement',
    'taoQtiTest/controller/creator/helpers/baseType',
    'taoQtiTest/controller/creator/helpers/cardinality'
], function (_, outcomeValidator, qtiElementHelper, baseTypeHelper, cardinalityHelper) {
    'use strict';

    var processingRuleHelper = {
        /**
         * Creates a basic processing rule
         * @param {String} type
         * @param {String} [identifier]
         * @param {Array|Object} [expression]
         * @returns {Object}
         * @throws {TypeError} if the type is empty or is not a string
         * @throws {TypeError} if the identifier is not valid
         * @throws {TypeError} if the expression does not contain valid QTI elements
         */
        create: function create(type, identifier, expression) {
            var processingRule = qtiElementHelper.create(type, identifier && validateIdentifier(identifier));

            if (expression) {
                processingRuleHelper.setExpression(processingRule, expression);
            }

            return processingRule;
        },

        /**
         * Sets an expression to a processing rule
         * @param {Object} processingRule
         * @param {Object|Array} expression
         * @throws {TypeError} if the expression does not contain valid QTI elements
         */
        setExpression: function setExpression(processingRule, expression) {
            if (processingRule) {
                if (_.isArray(expression)) {
                    if (processingRule.expression) {
                        processingRule.expression = null;
                    }
                    processingRule.expressions = validateOutcomeList(expression);
                } else {
                    if (processingRule.expressions) {
                        processingRule.expressions = null;
                    }
                    if (expression) {
                        processingRule.expression = validateOutcome(expression);
                    }
                }
            }
        },

        /**
         * Adds an expression to a processing rule
         * @param {Object} processingRule
         * @param {Object|Array} expression
         * @throws {TypeError} if the expression does not contain valid QTI elements
         */
        addExpression: function addExpression(processingRule, expression) {
            if (processingRule && expression) {
                if (processingRule.expression) {
                    processingRule.expressions = forceArray(processingRule.expression);
                    processingRule.expression = null;
                }

                if (_.isArray(expression)) {
                    processingRule.expressions = forceArray(processingRule.expressions).concat(validateOutcomeList(expression));
                } else {
                    if (processingRule.expressions) {
                        processingRule.expressions.push(expression);
                    } else {
                        processingRule.expression = validateOutcome(expression);
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
         * @throws {TypeError} if the expression does not contain valid QTI elements
         */
        setOutcomeValue: function setOutcomeValue(identifier, expression) {
            return processingRuleHelper.create('setOutcomeValue',  validateIdentifier(identifier), expression);
        },

        /**
         * Creates a `gte` rule
         * @param {Object|Array} left - the left operand
         * @param {Object|Array} right - the right operand
         * @returns {Object}
         * @throws {TypeError} if the left and right operands are not valid QTI elements
         */
        gte: function gte(left, right) {
            return binaryOperator('gte', left, right);
        },

        /**
         * Creates a `lte` rule
         * @param {Object|Array} left - the left operand
         * @param {Object|Array} right - the right operand
         * @returns {Object}
         * @throws {TypeError} if the left and right operands are not valid QTI elements
         */
        lte: function lte(left, right) {
            return binaryOperator('lte', left, right);
        },

        /**
         * Creates a `divide` rule
         * @param {Object|Array} left - the left operand
         * @param {Object|Array} right - the right operand
         * @returns {Object}
         * @throws {TypeError} if the left and right operands are not valid QTI elements
         */
        divide: function divide(left, right) {
            return binaryOperator('divide', left, right);
        },

        /**
         * Creates a `sum` rule
         * @param {Object|Array} terms
         * @returns {Object}
         * @throws {TypeError} if the terms are not valid QTI elements
         */
        sum: function sum(terms) {
            var processingRule = processingRuleHelper.create('sum', null, forceArray(terms));

            processingRule.minOperands = 1;
            processingRule.maxOperands = -1;
            processingRule.acceptedCardinalities = [cardinalityHelper.SINGLE, cardinalityHelper.MULTIPLE, cardinalityHelper.ORDERED];
            processingRule.acceptedBaseTypes = [baseTypeHelper.INTEGER, baseTypeHelper.FLOAT];

            return processingRule;
        },

        /**
         * Creates a `testVariables` rule
         * @param {String} identifier
         * @param {String|Number} [type]
         * @param {String} weightIdentifier
         * @param {String|String[]} [includeCategories]
         * @param {String|String[]} [excludeCategories]
         * @returns {Object}
         * @throws {TypeError} if the identifier is empty or is not a string
         */
        testVariables: function testVariables(identifier, type, weightIdentifier, includeCategories, excludeCategories) {
            var processingRule = processingRuleHelper.create('testVariables');

            processingRule.variableIdentifier = validateIdentifier(identifier);
            processingRule.baseType = baseTypeHelper.getValid(type);
            addWeightIdentifier(processingRule, weightIdentifier);
            addSectionIdentifier(processingRule, '');
            addCategories(processingRule, includeCategories, excludeCategories);

            return processingRule;
        },

        /**
         * Creates a `outcomeMaximum` rule
         * @param {String} identifier
         * @param {String} weightIdentifier
         * @param {String|String[]} [includeCategories]
         * @param {String|String[]} [excludeCategories]
         * @returns {Object}
         * @throws {TypeError} if the identifier is empty or is not a string
         */
        outcomeMaximum: function outcomeMaximum(identifier, weightIdentifier, includeCategories, excludeCategories) {
            var processingRule = processingRuleHelper.create('outcomeMaximum');

            processingRule.outcomeIdentifier = validateIdentifier(identifier);

            addWeightIdentifier(processingRule, weightIdentifier);
            addSectionIdentifier(processingRule, '');
            addCategories(processingRule, includeCategories, excludeCategories);

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

            addSectionIdentifier(processingRule, '');
            addCategories(processingRule, includeCategories, excludeCategories);

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

            processingRule.baseType = baseTypeHelper.getValid(type, baseTypeHelper.FLOAT);
            processingRule.value = baseTypeHelper.getValue(processingRule.baseType, value);

            return processingRule;
        },

        /**
         ** Creates a `variable` rule
         * @param {String} identifier
         * @param {String} [weightIdentifier]
         * @returns {Object}
         * @throws {TypeError} if the identifier is not valid
         * @throws {TypeError} if the weight identifier is not valid
         */
        variable: function variable(identifier, weightIdentifier) {
            var processingRule = processingRuleHelper.create('variable', validateIdentifier(identifier));

            addWeightIdentifier(processingRule, weightIdentifier);

            return processingRule;
        },

        /**
         * Creates a `match` rule
         * @param {Object|Array} left - the left operand
         * @param {Object|Array} right - the right operand
         * @returns {Object}
         * @throws {TypeError} if the left and right operands are not valid QTI elements
         */
        match: function match(left, right) {
            return binaryOperator('match', left, right, cardinalityHelper.SAME, cardinalityHelper.SAME);
        },

        /**
         * Creates a `isNull` rule
         * @param {Object|Array} expression - the operand
         * @returns {Object}
         * @throws {TypeError} if the operand is not valid QTI element
         */
        isNull: function isNull(expression) {
            return unaryOperator('isNull', expression, baseTypeHelper.ANY, cardinalityHelper.ANY);
        },

        /**
         * Creates a `outcomeCondition` rule
         * @param {Object} outcomeIf
         * @param {Object} outcomeElse
         * @returns {Object}
         * @throws {TypeError} if the outcomeIf and outcomeElse operands are not valid QTI elements
         */
        outcomeCondition: function outcomeCondition(outcomeIf, outcomeElse) {
            var processingRule = processingRuleHelper.create('outcomeCondition');

            if (!outcomeValidator.validateOutcome(outcomeIf, false, 'outcomeIf')) {
                throw new TypeError('You must provide a valid outcomeIf element!');
            }

            if (outcomeElse && !outcomeValidator.validateOutcome(outcomeElse, false, 'outcomeElse')) {
                throw new TypeError('You must provide a valid outcomeElse element!');
            }

            processingRule.outcomeIf = outcomeIf;
            processingRule.outcomeElseIfs = [];

            if (outcomeElse) {
                processingRule.outcomeElse = outcomeElse;
            }

            return processingRule;
        },

        /**
         * Creates a `outcomeIf` rule
         * @param {Object} expression
         * @param {Object|Object[]} instruction
         * @returns {Object}
         * @throws {TypeError} if the expression and instruction operands are not valid QTI elements
         */
        outcomeIf: function outcomeIf(expression, instruction) {
            var processingRule = processingRuleHelper.create('outcomeIf');

            if (!_.isArray(instruction)) {
                instruction = [instruction];
            }

            processingRule.expression = validateOutcome(expression);
            processingRule.outcomeRules = validateOutcomeList(instruction);

            return processingRule;
        },

        /**
         * Creates a `outcomeElse` rule
         * @param {Object|Object[]} instruction
         * @returns {Object}
         * @throws {TypeError} if the instruction is not a valid QTI element
         */
        outcomeElse: function outcomeElse(instruction) {
            var processingRule = processingRuleHelper.create('outcomeElse');

            if (!_.isArray(instruction)) {
                instruction = [instruction];
            }

            processingRule.outcomeRules = validateOutcomeList(instruction);

            return processingRule;
        }

    };

    /**
     * Creates a unary operator rule
     * @param {String} type - The rule type
     * @param {Object|Array} expression - The operand
     * @param {Number|Array} [baseType] - The accepted base type
     * @param {Number|Array} [cardinality] - The accepted cardinality
     * @returns {Object}
     * @throws {TypeError} if the type is empty or is not a string
     * @throws {TypeError} if the operand is not valid QTI element
     */
    function unaryOperator(type, expression, baseType, cardinality) {
        var processingRule = processingRuleHelper.create(type, null, [expression]);

        processingRule.minOperands = 1;
        processingRule.maxOperands = 1;

        addTypeAndCardinality(processingRule, baseType, cardinality);

        return processingRule;
    }

    /**
     * Creates a binary operator rule
     * @param {String} type - The rule type
     * @param {Object|Array} left - The left operand
     * @param {Object|Array} right - The right operand
     * @param {Number|Array} [baseType] - The accepted base type
     * @param {Number|Array} [cardinality] - The accepted cardinality
     * @returns {Object}
     * @throws {TypeError} if the type is empty or is not a string
     * @throws {TypeError} if the left and right operands are not valid QTI elements
     */
    function binaryOperator(type, left, right, baseType, cardinality) {
        var processingRule = processingRuleHelper.create(type, null, [left, right]);

        processingRule.minOperands = 2;
        processingRule.maxOperands = 2;

        addTypeAndCardinality(processingRule, baseType, cardinality);

        return processingRule;
    }

    /**
     * Appends the base type and the cardinality on a processing rule
     * @param {Object} processingRule
     * @param {Number|Array} [baseType] - The accepted base type
     * @param {Number|Array} [cardinality] - The accepted cardinality
     * @returns {Object}
     */
    function addTypeAndCardinality(processingRule, baseType, cardinality) {
        if (_.isUndefined(baseType)) {
            baseType = [baseTypeHelper.INTEGER, baseTypeHelper.FLOAT];
        }

        if (_.isUndefined(cardinality)) {
            cardinality = [cardinalityHelper.SINGLE];
        }

        processingRule.acceptedCardinalities = forceArray(cardinality);
        processingRule.acceptedBaseTypes = forceArray(baseType);

        return processingRule;
    }

    /**
     * Extends a processing rule with categories
     * @param {Object} processingRule
     * @param {Array|String} [includeCategories]
     * @param {Array|String} [excludeCategories]
     * @returns {Object}
     */
    function addCategories(processingRule, includeCategories, excludeCategories) {
        processingRule.includeCategories = forceArray(includeCategories);
        processingRule.excludeCategories = forceArray(excludeCategories);

        return processingRule;
    }

    /**
     * Appends the section identifier on a processing rule
     * @param {Object} processingRule
     * @param {String} [sectionIdentifier]
     * @returns {Object}
     * @throws {TypeError} if the weight identifier is not valid
     */
    function addSectionIdentifier(processingRule, sectionIdentifier) {
        if (sectionIdentifier) {
            if (!outcomeValidator.validateIdentifier(sectionIdentifier)) {
                throw new TypeError('You must provide a valid weight identifier!');
            }
            processingRule.sectionIdentifier = sectionIdentifier;
        } else {
            processingRule.sectionIdentifier = '';
        }

        return processingRule;
    }

    /**
     * Appends the weight identifier on a processing rule
     * @param {Object} processingRule
     * @param {String} [weightIdentifier]
     * @returns {Object}
     * @throws {TypeError} if the weight identifier is not valid
     */
    function addWeightIdentifier(processingRule, weightIdentifier) {
        if (weightIdentifier) {
            if (!outcomeValidator.validateIdentifier(weightIdentifier)) {
                throw new TypeError('You must provide a valid weight identifier!');
            }
            processingRule.weightIdentifier = weightIdentifier;
        } else {
            processingRule.weightIdentifier = '';
        }

        return processingRule;
    }

    /**
     * Validates an identifier
     * @param {String} identifier
     * @returns {String}
     * @throws {TypeError} if the identifier is not valid
     */
    function validateIdentifier(identifier) {
        if (!outcomeValidator.validateIdentifier(identifier)) {
            throw new TypeError('You must provide a valid identifier!');
        }
        return identifier;
    }

    /**
     * Validates an outcome
     * @param {Object} outcome
     * @returns {Object}
     * @throws {TypeError} if the outcome is not valid
     */
    function validateOutcome(outcome) {
        if (!outcomeValidator.validateOutcome(outcome)) {
            throw new TypeError('You must provide a valid QTI element!');
        }
        return outcome;
    }

    /**
     * Validates a list of outcomes
     * @param {Array} outcomes
     * @returns {Array}
     * @throws {TypeError} if an outcome is not valid
     */
    function validateOutcomeList(outcomes) {
        if (!outcomeValidator.validateOutcomes(outcomes)) {
            throw new TypeError('You must provide a valid list of QTI elements!');
        }
        return outcomes;
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
