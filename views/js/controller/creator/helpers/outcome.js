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
 * Basic helper that is intended to manage outcomes inside a test model.
 *
 * @author Jean-Sébastien Conan <jean-sebastien@taotesting.com>
 */
define([
    'lodash',
    'taoQtiTest/controller/creator/helpers/baseType'
], function (_, baseType) {
    'use strict';

    var outcomeHelper = {
        /**
         * Finds a QTI element in an expression, by its type.
         * An expression is either an object or a list of objects.
         * Does not browse any sub-expressions.
         * @param {Array|Object} expression
         * @param {String} type
         * @returns {Object}
         */
        findQtiType: function findQtiType(expression, type) {
            var found = null;

            function checkType(qti) {
                if (qti['qti-type'] === type) {
                    found = qti;
                    return false;
                }
            }

            if (_.isArray(expression)) {
                _.forEach(expression, checkType);
            } else if (expression) {
                checkType(expression);
            }

            return found;
        },

        /**
         * Gets a property from an outcome rule expression.
         * The path to the property is based on QTI types.
         * @param {Object} outcomeRule - The outcome rule from which get the property
         * @param {String|String[]} path - The path to the property, with QTI types separated by dot, like: "setOutcomeValue.gte.baseValue"
         * @returns {*}
         */
        getProcessingRuleExpression: function getProcessingRuleExpression(outcomeRule, path) {
            var steps = _.isArray(path) ? path : path.split('.');
            var len = steps.length;
            var expression = outcomeRule;
            var i = 0;

            while (expression && i < len) {
                expression = outcomeHelper.findQtiType(expression, steps[i++]);
                if (expression && i < len) {
                    expression = expression.expression || expression.expressions;
                }
            }

            return expression || null;
        },

        /**
         * Gets a property from an outcome rule expression.
         * The path to the property is based on QTI types.
         * @param {Object} outcomeRule - The outcome rule from which get the property
         * @param {String|String[]} path - The path to the property, with QTI types separated by dot, like: "setOutcomeValue.gte.baseValue.value"
         * @returns {*}
         */
        getProcessingRuleProperty: function getProcessingRuleProperty(outcomeRule, path) {
            var result = null;
            var steps = _.isArray(path) ? path : path.split('.');
            var property = steps.pop();
            var expression = outcomeHelper.getProcessingRuleExpression(outcomeRule, steps);

            if (expression && expression[property]) {
                result = expression[property];
            }

            return result;
        },

        /**
         * Gets the identifier of an outcome
         * @param {Object|String} outcome
         * @returns {String}
         */
        getOutcomeIdentifier: function getOutcomeIdentifier(outcome) {
            return String(_.isObject(outcome) ? outcome.identifier : outcome);
        },

        /**
         * Gets the list of outcome declarations
         * @param {Object} testModel
         * @returns {Array}
         */
        getOutcomeDeclarations: function getOutcomeDeclarations(testModel) {
            return testModel && testModel.outcomeDeclarations;
        },

        /**
         * Gets the list of outcome processing rules
         * @param {Object} testModel
         * @returns {Array}
         */
        getOutcomeProcessingRules: function getOutcomeProcessingRules(testModel) {
            return testModel && testModel.outcomeProcessing && testModel.outcomeProcessing.outcomeRules;
        },

        /**
         * Applies a function on each outcome declarations
         * @param {Object} testModel
         * @param {Function} cb
         */
        eachOutcomeDeclarations: function eachOutcomeDeclarations(testModel, cb) {
            _.forEach(outcomeHelper.getOutcomeDeclarations(testModel), cb);
        },

        /**
         * Applies a function on each outcome processing rules. Does not take care of sub-expressions.
         * @param {Object} testModel
         * @param {Function} cb
         */
        eachOutcomeProcessingRules: function eachOutcomeProcessingRules(testModel, cb) {
            _.forEach(outcomeHelper.getOutcomeProcessingRules(testModel), cb);
        },

        /**
         * Applies a function on each outcome processing rules, take care of each sub expression.
         * @param {Object} testModel
         * @param {Function} cb
         */
        eachOutcomeProcessingRuleExpressions: function eachOutcomeProcessingRuleExpressions(testModel, cb) {
            function browseExpressions(processingRule) {
                if (_.isArray(processingRule)) {
                    _.forEach(processingRule, browseExpressions);
                } else if (processingRule) {
                    cb(processingRule);

                    if (processingRule.expression) {
                        browseExpressions(processingRule.expression);
                    } else if (processingRule.expressions) {
                        browseExpressions(processingRule.expressions);
                    }
                }
            }

            browseExpressions(outcomeHelper.getOutcomeProcessingRules(testModel));
        },

        /**
         * Lists all outcomes identifiers. An optional callback allows to filter the list
         * @param {Object} testModel
         * @param {Function} [cb]
         * @returns {Array}
         */
        listOutcomes: function listOutcomes(testModel, cb) {
            var outcomes = [];
            if (!_.isFunction(cb)) {
                cb = null;
            }
            outcomeHelper.eachOutcomeDeclarations(testModel, function (outcome) {
                if (!cb || cb(outcome)) {
                    outcomes.push(outcomeHelper.getOutcomeIdentifier(outcome));
                }
            });
            return outcomes;
        },

        /**
         * Removes the spefified outcomes from the provided test model
         * @param {Object} testModel
         * @param {String[]} outcomes
         */
        removeOutcomes: function removeOutcomes(testModel, outcomes) {
            var declarations = outcomeHelper.getOutcomeDeclarations(testModel);
            var rules = outcomeHelper.getOutcomeProcessingRules(testModel);

            outcomes = _.indexBy(_.isArray(outcomes) ? outcomes : [outcomes], function (outcome) {
                return outcome;
            });

            if (declarations) {
                _.remove(declarations, function (outcomeDeclaration) {
                    return !!outcomes[outcomeHelper.getOutcomeIdentifier(outcomeDeclaration)];
                });
            }

            if (rules) {
                _.remove(rules, function (outcomeRule) {
                    return !!outcomes[outcomeHelper.getOutcomeIdentifier(outcomeRule)];
                });
            }
        },

        /**
         * Creates an outcome declaration
         * @param {String} identifier
         * @param {String|Number|Boolean} [type] - The data type of the outcome, FLOAT by default
         * @param {Number} [cardinality] - The variable cardinality, default 0
         * @returns {Object}
         * @throws {TypeError} if the identifier is empty or is not a string
         */
        createOutcome: function createOutcome(identifier, type, cardinality) {

            if (!validateIdentifier(identifier)) {
                throw new TypeError('You must provide a valid identifier!');
            }

            return {
                'qti-type': 'outcomeDeclaration',
                views: [],
                interpretation: '',
                longInterpretation: '',
                normalMaximum: false,
                normalMinimum: false,
                masteryValue: false,
                identifier: identifier,
                cardinality: parseInt(cardinality, 10) || 0,
                baseType: baseType.validOrDefault(type, baseType.FLOAT)
            };
        },

        /**
         * Adds a processing rule into the test model
         *
         * @param {Object} testModel
         * @param {Object} processingRule
         * @returns {Object}
         * @throws {TypeError} if the processing rule is not valid
         */
        addOutcomeProcessing: function createOutcomeProcessing(testModel, processingRule) {
            var outcomeProcessing = testModel.outcomeProcessing;

            if (!processingRule || !processingRule['qti-type'] || !_.isString(processingRule['qti-type'])) {
                throw new TypeError('You must provide a valid outcome processing rule!');
            }

            if (!outcomeProcessing) {
                outcomeProcessing = {
                    'qti-type': 'outcomeProcessing',
                    outcomeRules: []
                };
                testModel.outcomeProcessing = outcomeProcessing;
            } else if (!outcomeProcessing.outcomeRules) {
                outcomeProcessing.outcomeRules = [];
            }

            outcomeProcessing.outcomeRules.push(processingRule);
            return processingRule;
        },

        /**
         * Creates an outcome and adds it to the declarations
         * @param {Object} testModel
         * @param {Object} outcome - The outcome to add
         * @param {Object} [processingRule] - The processing rule attached to the outcome
         * @returns {Object}
         * @throws {TypeError} if one of the outcome or the processing rule is not valid
         */
        addOutcome: function addOutcome(testModel, outcome, processingRule) {
            var declarations = testModel.outcomeDeclarations;

            if (!outcome || outcome['qti-type'] !== 'outcomeDeclaration' || !validateIdentifier(outcome.identifier)) {
                throw new TypeError('You must provide a valid outcome!');
            }

            if (processingRule) {
                if (!validateIdentifier(processingRule.identifier) || processingRule.identifier !== outcome.identifier) {
                    throw new TypeError('You must provide a valid outcome processing rule!');
                }

                outcomeHelper.addOutcomeProcessing(testModel, processingRule);
            }

            if (!declarations) {
                declarations = [];
                testModel.outcomeDeclarations = declarations;
            }

            declarations.push(outcome);
            return outcome;
        }
    };

    var identifierValidator = /^[a-zA-Z_][a-zA-Z0-9_\.-]*$/;

    /**
     * Checks the validity of an identifier
     * @param {String} identifier
     * @returns {Boolean}
     */
    function validateIdentifier(identifier) {
        return identifier && _.isString(identifier) && identifierValidator.test(identifier);
    }

    return outcomeHelper;
});
