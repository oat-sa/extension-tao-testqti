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
 * Copyright (c) 2017-2025 (original work) Open Assessment Technologies SA ;
 */
/**
 * Basic helper that is intended to manage outcomes inside a test model.
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

    /**
     * This is a list of outcomes that are reserved for the score processing
     */
    var reservedOutcomeDeclarations = [
        'SCORE',
        'SCORE_TOTAL',
        'SCORE_TOTAL_MAX',
        'SCORE_TOTAL_WEIGHTED',
        'SCORE_TOTAL_MAX_WEIGHTED',
        'SCORE_RATIO',
        'SCORE_RATIO_WEIGHTED',
        'PASS_ALL',
        'PASS_ALL_RENDERING',
        'GRADE',
        'GRADE_MAX'
    ];

    /**
     * Types of externalScored attributes
     */
    var externalScoredOptions = {
        none: 'none',
        human: 'human',
        externalMachine: 'externalMachine'
    };

    var externalScoredValidOptions = [
        externalScoredOptions.human,
        externalScoredOptions.externalMachine
    ];

    var outcomeHelper = {
        /**
         * Gets a property from an outcome rule expression.
         * The path to the property is based on QTI types.
         * @param {Object} outcomeRule - The outcome rule from which get the property
         * @param {String|String[]} path - The path to the property, with QTI types separated by dot, like: "setOutcomeValue.gte.baseValue"
         * @returns {*}
         */
        getProcessingRuleExpression: function getProcessingRuleExpression(outcomeRule, path) {
            return qtiElementHelper.lookupElement(outcomeRule, path, ['expression', 'expressions']);
        },

        /**
         * Gets a property from an outcome rule expression.
         * The path to the property is based on QTI types.
         * @param {Object} outcomeRule - The outcome rule from which get the property
         * @param {String|String[]} path - The path to the property, with QTI types separated by dot, like: "setOutcomeValue.gte.baseValue.value"
         * @returns {*}
         */
        getProcessingRuleProperty: function getProcessingRuleProperty(outcomeRule, path) {
            return qtiElementHelper.lookupProperty(outcomeRule, path, ['expression', 'expressions']);
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
            var outcomes = testModel && testModel.outcomeDeclarations;
            return outcomes || [];
        },

        getReservedOutcomeDeclarations: function getReservedOutcomeDeclarations(testModel) {
            var outcomes = _.filter(testModel && testModel.outcomeDeclarations, function (outcome) {
                return _.includes(reservedOutcomeDeclarations, outcome.identifier);
            });

            return outcomes || [];
        },

        getNonReservedOutcomeDeclarations: function getNonReservedOutcomeDeclarations(testModel) {
            var outcomes = _.filter(testModel && testModel.outcomeDeclarations, function (outcome) {
                return !_.includes(reservedOutcomeDeclarations, outcome.identifier);
            });

            return outcomes || [];
        },

        /**
         * Gets the list of outcome processing rules
         * @param {Object} testModel
         * @returns {Array}
         */
        getOutcomeProcessingRules: function getOutcomeProcessingRules(testModel) {
            var rules = testModel && testModel.outcomeProcessing && testModel.outcomeProcessing.outcomeRules;
            return rules || [];
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
         * Removes the specified outcomes from the provided test model
         * @param {Object} testModel - The test model to clean up
         * @param {Function|String[]} outcomes - The list of outcomes identifiers to remove,
         *                                       or a callback that will match each outcome to remove
         */
        removeOutcomes: function removeOutcomes(testModel, outcomes) {
            var declarations = outcomeHelper.getOutcomeDeclarations(testModel);
            var rules = outcomeHelper.getOutcomeProcessingRules(testModel);
            var check;

            if (_.isFunction(outcomes)) {
                check = outcomes;
            } else {
                outcomes = _.keyBy(_.isArray(outcomes) ? outcomes : [outcomes], function (outcome) {
                    return outcome;
                });

                check = function checkIdentifier(outcome) {
                    return !!outcomes[outcomeHelper.getOutcomeIdentifier(outcome)];
                };
            }

            if (declarations) {
                _.remove(declarations, check);
            }

            if (rules) {
                _.remove(rules, check);
            }
        },

        /**
         * Checks if there are outcomes (other than specified identifier) that have external scoring enabled
         * @param {Object} testModel
         * @param {String} excludeIdentifier - Identifier to exclude from the check
         * @returns {Boolean}
         */
        hasExternalScoredOutcome: function hasExternalScoredOutcome(testModel, excludeIdentifier) {
            var outcomes = outcomeHelper.getOutcomeDeclarations(testModel);
            return _.some(outcomes, function (outcome) {
                return outcome.identifier !== excludeIdentifier &&
                    outcomeHelper.hasValidExternalScoring(outcome);
            });
        },

        /**
         * Gets the external scored value for a specific outcome
         * @param {Object} testModel
         * @param {String} identifier
         * @returns {String}
         */
        getOutcomeExternalScored: function getOutcomeExternalScored(testModel, identifier) {
            var outcome = _.find(outcomeHelper.getOutcomeDeclarations(testModel), function (outcome) {
                return outcome.identifier === identifier;
            });
            return _.get(outcome, 'externalScored', externalScoredOptions.none);
        },

        /**
         * Determines if externalScored should be disabled for a given outcome
         * @param {Object} testModel
         * @param {String} identifier
         * @returns {Boolean}
         */
        shouldDisableExternalScored: function shouldDisableExternalScored(testModel, identifier) {
            var isScoreOutcome = identifier === 'SCORE' || _.includes(reservedOutcomeDeclarations, identifier);
            var scoreExternalScored = outcomeHelper.getOutcomeExternalScored(testModel, 'SCORE');

            var hasReservedScoreWithExternalScoring = _.some(reservedOutcomeDeclarations, function(reservedId) {
                var externalScored = outcomeHelper.getOutcomeExternalScored(testModel, reservedId);
                return _.includes(externalScoredValidOptions, externalScored);
            });

            if (isScoreOutcome) {
                return outcomeHelper.hasExternalScoredOutcome(testModel, identifier);
            } else {
                return _.includes(externalScoredValidOptions, scoreExternalScored) ||
                    hasReservedScoreWithExternalScoring;
            }
        },

        /**
         * Checks if an outcome has valid external scoring enabled
         * @param {Object} outcome
         * @returns {Boolean}
         */
        hasValidExternalScoring: function hasValidExternalScoring(outcome) {
            return outcome.externalScored && _.includes(externalScoredValidOptions, outcome.externalScored);
        },

        /**
         * Updates externalScoredDisabled for all outcomes based on current state
         * @param {Object} testModel
         */
        updateExternalScoredDisabled: function updateExternalScoredDisabled(testModel) {
            var outcomes = outcomeHelper.getOutcomeDeclarations(testModel);

            _.forEach(outcomes, function (outcome) {
                var shouldDisable = outcomeHelper.shouldDisableExternalScored(testModel, outcome.identifier);
                outcome.externalScoredDisabled = shouldDisable ? 1 : 0;

                if (shouldDisable && !_.includes(externalScoredValidOptions, outcome.externalScored)) {
                    delete outcome.externalScored;
                }
            });

            var allDisabled = _.every(outcomes, function (outcome) {
                return outcome.externalScoredDisabled === 1;
            });

            if (allDisabled && outcomes.length > 0) {
                _.forEach(outcomes, function (outcome) {
                    outcome.externalScoredDisabled = 0;
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
            if (!outcomeValidator.validateIdentifier(identifier)) {
                throw new TypeError('You must provide a valid identifier!');
            }

            return qtiElementHelper.create('outcomeDeclaration', identifier, {
                views: [],
                interpretation: '',
                longInterpretation: '',
                normalMaximum: false,
                normalMinimum: false,
                masteryValue: false,
                externalScored: null,
                cardinality: cardinalityHelper.getValid(cardinality, cardinalityHelper.SINGLE),
                baseType: baseTypeHelper.getValid(type, baseTypeHelper.FLOAT)
            });
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

            if (!outcomeValidator.validateOutcome(processingRule)) {
                throw new TypeError('You must provide a valid outcome processing rule!');
            }

            if (!outcomeProcessing) {
                outcomeProcessing = qtiElementHelper.create('outcomeProcessing', {
                    outcomeRules: []
                });
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

            if (!outcomeValidator.validateOutcome(outcome, true, 'outcomeDeclaration')) {
                throw new TypeError('You must provide a valid outcome!');
            }

            if (processingRule) {
                if (!outcomeValidator.validateOutcome(processingRule) || processingRule.identifier !== outcome.identifier) {
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
        },

        /**
         * Replaces the outcomes in a test model
         * @param {Object} testModel
         * @param {Object} outcomes
         * @throws {TypeError} if one of the outcomes or the processing rules are not valid
         */
        replaceOutcomes: function replaceOutcomes(testModel, outcomes) {
            if (_.isPlainObject(outcomes)) {
                if (_.isArray(outcomes.outcomeDeclarations)) {
                    if (!outcomeValidator.validateOutcomes(outcomes.outcomeDeclarations, true, 'outcomeDeclaration')) {
                        throw new TypeError('You must provide valid outcomes!');
                    }

                    testModel.outcomeDeclarations = [].concat(outcomes.outcomeDeclarations);
                }
                if (outcomes.outcomeProcessing && _.isArray(outcomes.outcomeProcessing.outcomeRules)) {
                    if (!outcomeValidator.validateOutcomes(outcomes.outcomeProcessing.outcomeRules)) {
                        throw new TypeError('You must provide valid processing rules!');
                    }

                    if (!testModel.outcomeProcessing) {
                        testModel.outcomeProcessing = qtiElementHelper.create('outcomeProcessing');
                    }
                    testModel.outcomeProcessing.outcomeRules = [].concat(outcomes.outcomeProcessing.outcomeRules);
                }
            }
        }
    };

    return outcomeHelper;
});
