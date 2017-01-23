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
 * Basic helper that is intended to manage the score processing declaration in a test model.
 *
 * @author Jean-Sébastien Conan <jean-sebastien@taotesting.com>
 */
define([
    'lodash',
    'i18n',
    'taoQtiTest/controller/creator/helpers/baseType',
    'taoQtiTest/controller/creator/helpers/outcome',
    'taoQtiTest/controller/creator/helpers/processingRule',
    'taoQtiTest/controller/creator/helpers/category'
], function (_, __, baseTypeHelper, outcomeHelper, processingRuleHelper, categoryHelper) {
    'use strict';

    /**
     * The default cut score
     * @todo Move this to a config file
     * @type {Number}
     */
    var defaultCutScore = 0.5;

    /**
     * The list of supported processing modes, indexed by mode identifier
     * @type {Object}
     */
    var processingModes = {
        none: {
            key: 'none',
            label: __('None'),
            description: __('No outcome processing. Erase the existing rules, if any.')
        },
        custom: {
            key: 'custom',
            label: __('Custom'),
            description: __('Custom outcome processing. No changes will be made to the existing rules.')
        },
        total: {
            key: 'total',
            label: __('Total score'),
            prefix: 'SCORE_',
            outcome: 'SCORE_TOTAL',
            outcomeType: baseTypeHelper.FLOAT,
            description: __('The score will be processed for the entire test. A sum of all SCORE outcomes will be computed, the result will take place in the SCORE_TOTAL outcome.')
                         + ' ' +
                         __('If the category option is set, the score will also be processed per categories, and each results will take place in the SCORE_xxx outcome, where xxx is the name of the category.')
        },
        cut: {
            key: 'cut',
            label: __('Cut score'),
            prefix: 'PASS_',
            outcome: 'PASS_TOTAL',
            outcomeType: baseTypeHelper.BOOLEAN,
            feedback: 'PASS_TOTAL_RENDERING',
            feedbackSuffix: '_RENDERING',
            feedbackType: baseTypeHelper.IDENTIFIER,
            feedbackMatch: true,
            feedbackOk: "passed",
            feedbackFailed: "not_passed",
            description: __('The score will be processed for the entire test. A sum of all SCORE outcomes will be computed, the result will be compared to the cut score, then the PASS_TOTAL outcome will be set accordingly.')
                         + ' ' +
                         __('If the category option is set, the score will also be processed per categories, and each results will take place in the PASS_xxx outcome, where xxx is the name of the category.')
        }
    };

    /**
     * List of writers that provides the outcomes for each score processing modes.
     * The writers are separated from the list of supported modes, as this list is forwarded to the UI templates,
     * and only data must be provided to templates.
     * @type {Object}
     */
    var processingModeWriters = {
        /**
         * Writes the outcomes in the scoring mode "None"
         * @param {Object} model
         */
        none: function processingModeWriterNone(model) {
            // as no rules must be defined, just erase existing ones
            removeScoring(model);
        },

        /**
         * Writes the outcomes in the scoring mode "Custom"
         * @param {Object} model
         */
        custom: function processingModeWriterCustom() {
            // just does nothing as we only need to keep intact the existing rules, if any
        },

        /**
         * Writes the outcomes in the scoring mode "Total score"
         * @param {Object} model
         */
        total: function processingModeWriterTotal(model) {
            var processingMode = processingModes.total;

            // erase the existing rules, they will be replaced by those that are defined here
            removeScoring(model);

            // create the outcome and the rule that process the overall score
            addTotalScoreOutcomes(model, getOutcomeIdentifier(processingMode), processingMode.outcomeType);

            // create an outcome per categories
            if (model.scoring.categoryScore) {
                _.forEach(categoryHelper.listCategories(model), function (category) {
                    addTotalScoreOutcomes(model, getOutcomeIdentifier(processingMode, category), processingMode.outcomeType, category);
                });
            }
        },

        /**
         * Writes the outcomes in the scoring mode "Cut score"
         * @param {Object} model
         */
        cut: function processingModeWriterCut(model) {
            var processingMode = processingModes.cut;
            var outcomeIdentifier = getOutcomeIdentifier(processingMode);

            // erase the existing rules, they will be replaced by those that are defined here
            removeScoring(model);

            // create the outcome and the rule that process the overall score
            addCutScoreOutcomes(model, outcomeIdentifier, processingMode.outcomeType);

            // create the outcome and the rule that process the score feedback
            if (processingMode.feedback) {
                addFeedbackScoreOutcomes(
                    model,
                    processingMode.feedback,
                    processingMode.feedbackType,
                    outcomeIdentifier,
                    processingMode.outcomeType,
                    processingMode.feedbackMatch,
                    processingMode.feedbackOk,
                    processingMode.feedbackFailed
                );
            }

            // create an outcome per category
            if (model.scoring.categoryScore) {
                _.forEach(categoryHelper.listCategories(model), function (category) {
                    var categoryOutcomeIdentifier = getOutcomeIdentifier(processingMode, category);
                    addCutScoreOutcomes(model, categoryOutcomeIdentifier, processingMode.outcomeType, category);

                    addFeedbackScoreOutcomes(
                        model,
                        categoryOutcomeIdentifier + processingMode.feedbackSuffix,
                        processingMode.feedbackType,
                        categoryOutcomeIdentifier,
                        processingMode.outcomeType,
                        processingMode.feedbackMatch,
                        processingMode.feedbackOk,
                        processingMode.feedbackFailed
                    );
                });
            }
        }
    };

    /**
     * Produces the identifier of an outcome
     * @param {Object} processingMode
     * @param {String} [category]
     * @returns {String}
     */
    function getOutcomeIdentifier(processingMode, category) {
        if (processingMode.prefix && category) {
            return processingMode.prefix + category.toUpperCase();
        }
        return processingMode.outcome;
    }

    /**
     * Creates an outcome and the rule that process the total score
     *
     * @param {Object} model
     * @param {String} identifier
     * @param {String|Number} type
     * @param {String} [category]
     */
    function addTotalScoreOutcomes(model, identifier, type, category) {
        var outcome = outcomeHelper.createOutcome(identifier, type);
        var processingRule = processingRuleHelper.setOutcomeValue(identifier,
            processingRuleHelper.sum(
                processingRuleHelper.testVariables(model.scoring.scoreIdentifier, -1, model.scoring.weightIdentifier, category)
            )
        );

        outcomeHelper.addOutcome(model, outcome, processingRule);
    }

    /**
     * Creates an outcome and the rule that process the cut score
     *
     * @param {Object} model
     * @param {String} identifier
     * @param {String|Number} type
     * @param {String} [category]
     */
    function addCutScoreOutcomes(model, identifier, type, category) {
        var outcome = outcomeHelper.createOutcome(identifier, type);
        var processingRule = processingRuleHelper.setOutcomeValue(identifier,
            processingRuleHelper.gte(
                processingRuleHelper.divide(
                    processingRuleHelper.sum(
                        processingRuleHelper.testVariables(model.scoring.scoreIdentifier, -1, model.scoring.weightIdentifier, category)
                    ),
                    processingRuleHelper.numberPresented(category)
                ),
                processingRuleHelper.baseValue(model.scoring.cutScore, baseTypeHelper.FLOAT)
            )
        );

        outcomeHelper.addOutcome(model, outcome, processingRule);
    }

    /**
     * Creates an outcome and the rule that process the score feedback
     *
     * @param {Object} model
     * @param {String} identifier
     * @param {String|Number} type
     * @param {String} variable
     * @param {String|Number} variableType
     * @param {*} matchValue
     * @param {*} passed
     * @param {*} notPassed
     */
    function addFeedbackScoreOutcomes(model, identifier, type, variable, variableType, matchValue, passed, notPassed) {
        var outcome = outcomeHelper.createOutcome(identifier, type);
        var processingRule = processingRuleHelper.outcomeCondition(
            processingRuleHelper.outcomeIf(
                processingRuleHelper.match(
                    processingRuleHelper.variable(variable),
                    processingRuleHelper.baseValue(matchValue, variableType)
                ),
                processingRuleHelper.setOutcomeValue(identifier,
                    processingRuleHelper.baseValue(passed, type)
                )
            ),
            processingRuleHelper.outcomeElse(
                processingRuleHelper.setOutcomeValue(identifier,
                    processingRuleHelper.baseValue(notPassed, type)
                )
            )
        );

        outcomeHelper.addOutcome(model, outcome);
        outcomeHelper.addOutcomeProcessing(model, processingRule);
    }

    /**
     * Checks if an outcome is related to the outcome processing,
     * then returns the processing mode descriptor.
     * @param {Object|String} outcome
     * @returns {Object}
     */
    function getScoringMode(outcome) {
        var identifier = outcomeHelper.getOutcomeIdentifier(outcome);
        var mode = null;
        _.forEach(processingModes, function (processingMode) {
            if ((processingMode.prefix && identifier.indexOf(processingMode.prefix) === 0) ||
                (processingMode.outcome && processingMode.outcome === identifier) ||
                (processingMode.feedback && processingMode.feedback === identifier)) {
                mode = processingMode;
                return false;
            }
        });
        return mode;
    }

    /**
     * Checks if an outcome is related to the outcome processing
     * @param {Object|String} outcome
     * @returns {Boolean}
     */
    function isScoringOutcome(outcome) {
        return !!getScoringMode(outcome);
    }

    /**
     * Gets the score processing modes from a list of outcomes
     * @param {Array} outcomes
     * @returns {Array}
     */
    function listScoringModes(outcomes) {
        var modes = {};
        _.forEach(outcomes, function (outcomeDeclaration) {
            var mode = getScoringMode(outcomeDeclaration);
            if (mode) {
                modes[mode.key] = true;
            }
        });
        return _.keys(modes);
    }

    /**
     * Checks if the test model contains outcomes for categories
     * @param {Object} model
     * @returns {Boolean}
     */
    function hasCategoryOutcome(model) {
        var categoryOutcomes = false;
        _.forEach(outcomeHelper.getOutcomeDeclarations(model), function (outcomeDeclaration) {
            var identifier = outcomeHelper.getOutcomeIdentifier(outcomeDeclaration);
            _.forEach(processingModes, function (processingMode) {
                if ((!processingMode.outcome || processingMode.outcome !== identifier) &&
                    (!processingMode.feedback || processingMode.feedback !== identifier) &&
                    processingMode.prefix && identifier.indexOf(processingMode.prefix) === 0) {
                    categoryOutcomes = true;
                    return false;
                }
            });
        });
        return categoryOutcomes;
    }

    /**
     * Gets the defined cut score from the outcome rules
     * @param {Object} model
     * @returns {Number}
     */
    function getCutScore(model) {
        var values = _(outcomeHelper.getOutcomeProcessingRules(model)).map(function (outcome) {
            return outcomeHelper.getProcessingRuleProperty(outcome, 'setOutcomeValue.gte.baseValue.value');
        }).compact().uniq().value();
        if (_.isEmpty(values)) {
            values = [defaultCutScore];
        }
        return Math.max(0, _.max(values));
    }

    /**
     * Gets the defined weight identifier from the outcome rules
     * @param {Object} model
     * @returns {String}
     */
    function getWeightIdentifier(model) {
        var values = [];
        outcomeHelper.eachOutcomeProcessingRuleExpressions(model, function (processingRule) {
            if (processingRule['qti-type'] === 'testVariables' && processingRule.weightIdentifier) {
                values.push(processingRule.weightIdentifier);
            }
        });
        values = _(values).compact().uniq().value();

        return values.length ? values[0] : '';
    }

    /**
     * Detects the outcome processing mode for the scoring
     * @param {Object} model
     * @returns {String}
     */
    function getOutcomeProcessing(model) {
        var outcomeDeclarations = outcomeHelper.getOutcomeDeclarations(model);
        var outcomeRules = outcomeHelper.getOutcomeProcessingRules(model);

        // walk through each outcome declaration, and tries to identify the score processing mode
        var declarations = listScoringModes(outcomeDeclarations);
        var processing = listScoringModes(outcomeRules);
        var diff = _.difference(declarations, processing);
        var count = _.size(declarations);

        // default fallback, applied when several modes are detected at the same time
        var outcomeProcessing = 'custom';

        // set the score processing mode with respect to the found outcomes
        if (count === _.size(processing)) {
            if (!count) {
                // no mode detected, set the mode to none
                outcomeProcessing = 'none';
            } else if (count === 1 && _.isEmpty(diff)) {
                // single mode detected, keep the last got key
                outcomeProcessing = processing[0];
            }
        }

        return outcomeProcessing;
    }

    /**
     * Removes all outcome processing outcome variables
     * @param {Object} model
     */
    function removeScoring(model) {
        var scoringOutcomes = outcomeHelper.listOutcomes(model, isScoringOutcome);
        outcomeHelper.removeOutcomes(model, scoringOutcomes);
    }

    return {
        /**
         * Checks the test model against outcome processing mode.
         * Initializes the scoring property accordingly.
         *
         * @param {Object} model
         */
        read: function read(model) {
            // detect the score processing mode and build the descriptor used to manage the UI
            model.scoring = {
                modes: processingModes,
                scoreIdentifier: 'SCORE',
                weightIdentifier: getWeightIdentifier(model),
                cutScore: getCutScore(model),
                categoryScore: hasCategoryOutcome(model),
                outcomeProcessing: getOutcomeProcessing(model)
            };
        },

        /**
         * If the processing mode has been set, generates the outcomes that define the scoring.
         *
         * @param {Object} model
         */
        write: function write(model) {
            var processingModeWriter;
            var scoring = model.scoring;

            // write the score processing mode by generating the outcomes variables, but only if the mode has been set
            if (scoring) {
                processingModeWriter = processingModeWriters[scoring.outcomeProcessing];

                if (processingModeWriter) {
                    processingModeWriter(model);
                } else {
                    throw new Error('Unknown score processing mode: ' + scoring.outcomeProcessing);
                }
            }
        }
    };
});
