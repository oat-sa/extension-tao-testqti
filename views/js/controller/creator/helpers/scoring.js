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
], function (_, __, baseType, outcomeHelper, processingRuleHelper, categoryHelper) {
    'use strict';

    /**
     * The identifier of the custom processing mode.
     * Nothing will be do, the existing rules will be kept without changes.
     * @type {String}
     */
    var PROCESSING_CUSTOM = 'custom';

    /**
     * The identifier of the no score processing mode.
     * If applied on existing score processing, will remove all the related rules
     * @type {String}
     */
    var PROCESSING_NONE = 'none';

    /**
     * The identifier of the total score processing mode.
     * Set an outcome variable that will contains the overall score.
     * @type {String}
     */
    var PROCESSING_TOTAL = 'total';

    /**
     * The identifier of the category score processing mode.
     * Set an outcome variable per category that will contains the score of the category.
     * @type {String}
     */
    var PROCESSING_CATEGORY = 'category';

    /**
     * The identifier of the cut score processing mode.
     * Set an outcome variable per category that will tell if the score is above the provided threshold.
     * @type {String}
     */
    var PROCESSING_CUT = 'cut';

    /**
     * The list of supported processing modes, indexed by mode identifier
     * @type {Object}
     */
    var processingModes = _([{
        key: PROCESSING_NONE,
        label: __('None'),
        description: __('No outcome processing. Erase the existing rules, if any.')
    }, {
        key: PROCESSING_CUSTOM,
        label: __('Custom'),
        description: __('Custom outcome processing. No changes will be made to the existing rules.')
    }, {
        key: PROCESSING_TOTAL,
        label: __('Total score'),
        outcome: 'SCORE_TOTAL',
        type: baseType.FLOAT,
        description: __('The score will be processed for the entire test. A sum of all SCORE outcomes will be computed, the result will take place in the SCORE_TOTAL outcome.')
    }, {
        key: PROCESSING_CATEGORY,
        label: __('Category score'),
        prefix: 'SCORE_',
        type: baseType.FLOAT,
        description: __('The score will be processed per categories. A sum of all SCORE outcomes will be computed for each defined categories, the result will take place in the SCORE_xxx outcome, where xxx is the name of the category.')
    }, {
        key: PROCESSING_CUT,
        label: __('Cut score'),
        prefix: 'PASS_',
        type: baseType.BOOLEAN,
        description: __('The score will be processed per categories. An average of all SCORE outcomes will be computed for each defined categories, the result will be compared to the cut score, then the PASS_xxx outcome will be set accordingly, where xxx is the name of the category.')
    }]).indexBy(function (mode) {
        return mode.key;
    }).value();

    /**
     * List of writers that provides the outcomes for each score processing modes.
     * The writers are separated from the list of supported modes, as this list is forwarded to the UI templates,
     * and only data must be provided to templates.
     * @type {Object}
     */
    var processingModeWriters = _([{
        key: PROCESSING_NONE,
        writer: function(model) {
            // as no rules must be defined, just erase existing ones
            removeScoring(model);
        }
    }, {
        key: PROCESSING_CUSTOM,
        writer: function() {
            // just does nothing as we only need to keep intact the existing rules, if any
        }
    }, {
        key: PROCESSING_TOTAL,
        writer: function(model) {
            var processingMode = processingModes[PROCESSING_TOTAL];
            var outcome, processingRule;

            // erase the existing rules, they will be replaced by those that are defined here
            removeScoring(model);

            // create the outcome and the rule that process the overall score
            outcome = outcomeHelper.createOutcome(processingMode.outcome, processingMode.type);
            processingRule = processingRuleHelper.setOutcomeValue(processingMode.outcome,
                processingRuleHelper.sum(
                    processingRuleHelper.testVariables(model.scoring.scoreIdentifier, -1, model.scoring.weightIdentifier)
                )
            );

            outcomeHelper.addOutcome(model, outcome, processingRule);
        }
    }, {
        key: PROCESSING_CATEGORY,
        writer: function(model) {
            var processingMode = processingModes[PROCESSING_CATEGORY];

            // erase the existing rules, they will be replaced by those that are defined here
            removeScoring(model);

            // create an outcome per category
            _.forEach(categoryHelper.listCategories(model), function(category) {
                var outcome, processingRule;
                var identifier = processingMode.prefix + category.toUpperCase();

                // create the outcome and the rule that process the category score
                outcome = outcomeHelper.createOutcome(identifier, processingMode.type);
                processingRule = processingRuleHelper.setOutcomeValue(identifier,
                    processingRuleHelper.sum(
                        processingRuleHelper.testVariables(model.scoring.scoreIdentifier, -1, model.scoring.weightIdentifier, category)
                    )
                );

                outcomeHelper.addOutcome(model, outcome, processingRule);
            });
        }
    }, {
        key: PROCESSING_CUT,
        writer: function(model) {
            var processingMode = processingModes[PROCESSING_CUT];

            // erase the existing rules, they will be replaced by those that are defined here
            removeScoring(model);

            // create an outcome per category
            _.forEach(categoryHelper.listCategories(model), function(category) {
                var outcome, processingRule;
                var identifier = processingMode.prefix + category.toUpperCase();

                // create the outcome and the rule that process the category score
                outcome = outcomeHelper.createOutcome(identifier, processingMode.type);
                processingRule = processingRuleHelper.setOutcomeValue(identifier,
                    processingRuleHelper.gte(
                        processingRuleHelper.divide(
                            processingRuleHelper.sum(
                                processingRuleHelper.testVariables(model.scoring.scoreIdentifier, -1, model.scoring.weightIdentifier, category)
                            ),
                            processingRuleHelper.numberPresented(category)
                        ),
                        processingRuleHelper.baseValue(model.scoring.cutScore, baseType.FLOAT)
                    )
                );

                outcomeHelper.addOutcome(model, outcome, processingRule);
            });
        }
    }]).indexBy(function (mode) {
        return mode.key;
    }).value();

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
            if (processingMode.outcome === identifier || identifier.indexOf(processingMode.prefix) === 0) {
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
     * Gets the defined cut score from the outcome rules
     * @param {Object} model
     * @returns {Number}
     */
    function getCutScore(model) {
        var values = _.map(outcomeHelper.getOutcomeProcessingRules(model), function(outcome) {
            return outcomeHelper.getProcessingRuleProperty(outcome, 'setOutcomeValue.gte.baseValue.value');
        });
        return Math.max(0, _.max(values));
    }

    /**
     * Gets the defined weight identifier from the outcome rules
     * @param {Object} model
     * @returns {String}
     */
    function getWeightIdentifier(model) {
        var values = [];
        outcomeHelper.eachOutcomeProcessingRuleExpressions(model, function(processingRule) {
            if (processingRule['qti-type'] === 'testVariables' && processingRule.weightIdentifier) {
                values.push(processingRule.weightIdentifier);
            }
        });
        values = _(values).compact().uniq().value();

        return values.length ? values[0] : '';
    }

    /**
     * Detects the outcome processing mode of the scoring
     * @param {Object} model
     */
    function detectScoring(model) {
        var outcomeDeclarations = outcomeHelper.getOutcomeDeclarations(model);
        var outcomeRules = outcomeHelper.getOutcomeProcessingRules(model);

        // walk through each outcome declaration, and tries to identify the score processing mode
        var declarations = listScoringModes(outcomeDeclarations);
        var processing = listScoringModes(outcomeRules);
        var diff = _.difference(declarations, processing);
        var count = _.size(declarations);

        // default fallback, applied when several modes are detected at the same time
        var outcomeProcessing = PROCESSING_CUSTOM;

        // set the score processing mode with respect to the found outcomes
        if (count === _.size(processing)) {
            if (!count) {
                // no mode detected, set the mode to none
                outcomeProcessing = PROCESSING_NONE;
            } else if (count === 1 && _.isEmpty(diff)) {
                // single mode detected, keep the last got key
                outcomeProcessing = processing[0];
            }
        }

        model.scoring = {
            modes: processingModes,
            scoreIdentifier: 'SCORE',
            weightIdentifier: getWeightIdentifier(model),
            cutScore: getCutScore(model),
            outcomeProcessing: outcomeProcessing
        };
    }

    /**
     * Removes all outcome processing outcome variables
     * @param {Object} model
     */
    function removeScoring(model) {
        var scoringOutcomes = outcomeHelper.listOutcomes(model, isScoringOutcome);
        outcomeHelper.removeOutcomes(model, scoringOutcomes);
    }

    /**
     * Set the outcome processing outcome variables according to the chosen score processing mode
     * @param {Object} model
     */
    function setScoring(model) {
        var processingMode;

        // write the outcomes only if the mode has been set
        if (model.scoring) {
            processingMode = processingModeWriters[model.scoring.outcomeProcessing];

            if (processingMode) {
                processingMode.writer(model);
            } else {
                throw new Error('Unknown score processing mode: ' + model.scoring.outcomeProcessing);
            }
        }
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
            detectScoring(model);
        },

        /**
         * If the processing mode has been set, generates the outcomes that define the scoring.
         *
         * @param {Object} model
         */
        write: function write(model) {
            // write the score processing mode by generating the outcomes variables
            setScoring(model);
        }
    };
});
