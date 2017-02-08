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
    'taoQtiTest/controller/creator/helpers/processingRule'
], function (_, __, baseTypeHelper, outcomeHelper, processingRuleHelper) {
    'use strict';

    /**
     * The default cut score
     * @todo Move this to a config file
     * @type {Number}
     */
    var defaultCutScore = 0.5;

    /**
     * The name of the variable containing the score
     * @type {String}
     */
    var defaultScoreIdentifier = 'SCORE';

    /**
     * The list of supported processing modes, indexed by mode identifier
     * @type {Object}
     */
    var processingModes = {
        none: {
            key: 'none',
            label: __('None'),
            clean: true,
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
            signature: /^SCORE_([a-zA-Z][a-zA-Z0-9_\.-]*)$/,
            outcomes: [{
                formula: 'total',
                identifier: 'SCORE_TOTAL',
                weighted: 'SCORE_TOTAL_WEIGHTED',
                categoryIdentifier: 'SCORE_CATEGORY_%s',
                categoryWeighted: 'SCORE_CATEGORY_WEIGHTED_%s'
            }, {
                formula: 'max',
                identifier: 'SCORE_TOTAL_MAX',
                weighted: 'SCORE_TOTAL_MAX_WEIGHTED',
                categoryIdentifier: 'SCORE_CATEGORY_MAX_%s',
                categoryWeighted: 'SCORE_CATEGORY_WEIGHTED_MAX_%s'
            }],
            clean: true,
            description: __('The score will be processed for the entire test. A sum of all SCORE outcomes will be computed, the result will take place in the SCORE_TOTAL outcome.')
                         + ' ' +
                         __('If the category option is set, the score will also be processed per categories, and each results will take place in the SCORE_xxx outcome, where xxx is the name of the category.')
        },
        cut: {
            key: 'cut',
            label: __('Cut score'),
            include: 'total',
            signature: /^PASS_([a-zA-Z][a-zA-Z0-9_\.-]*)$/,
            outcomes: [{
                formula: 'cut',
                identifier: 'PASS_ALL',
                feedback: 'PASS_ALL_RENDERING',
                feedbackOk: "passed",
                feedbackFailed: "not_passed",
                categoryIdentifier: 'PASS_CATEGORY_%s',
                categoryFeedback: 'PASS_CATEGORY_%s_RENDERING'
            }],
            clean: true,
            description: __('The score will be processed for the entire test. A sum of all SCORE outcomes will be computed, the result will be compared to the cut score, then the PASS_TOTAL outcome will be set accordingly.')
                         + ' ' +
                         __('If the category option is set, the score will also be processed per categories, and each results will take place in the PASS_xxx outcome, where xxx is the name of the category.')
        }
    };

    /**
     * List of writers that provide the outcomes for each score processing formula.
     * @type {Object}
     */
    var formulaWriters = {
        /**
         * Generates the outcomes that compute the "Total score"
         * @param {Object} descriptor
         * @param {Object} scoring
         * @param {Object} outcomes
         * @param {Array} [categories]
         */
        total: function formulaTotal(descriptor, scoring, outcomes, categories) {
            // create the outcome and the rule that process the overall score
            addTotalScoreOutcomes(outcomes, scoring, descriptor.identifier, false);
            if (descriptor.weighted && scoring.weightIdentifier) {
                addTotalScoreOutcomes(outcomes, scoring, descriptor.weighted, true);
            }

            // create an outcome per categories
            if (descriptor.categoryIdentifier && categories) {
                _.forEach(categories, function (category) {
                    addTotalScoreOutcomes(outcomes, scoring, formatCategoryOutcome(category, descriptor.categoryIdentifier), false, category);
                    if (descriptor.categoryWeighted && scoring.weightIdentifier) {
                        addTotalScoreOutcomes(outcomes, scoring, formatCategoryOutcome(category, descriptor.categoryWeighted), true, category);
                    }
                });
            }
        },

        /**
         * Generates the outcomes that compute the "Max score"
         * @param {Object} descriptor
         * @param {Object} scoring
         * @param {Object} outcomes
         * @param {Array} [categories]
         */
        max: function formulaMax(descriptor, scoring, outcomes, categories) {
            // create the outcome and the rule that process the maximum overall score
            addMaxScoreOutcomes(outcomes, scoring, descriptor.identifier, false);
            if (descriptor.weighted && scoring.weightIdentifier) {
                addMaxScoreOutcomes(outcomes, scoring, descriptor.weighted, true);
            }

            // create an outcome per categories
            if (descriptor.categoryIdentifier && categories) {
                _.forEach(categories, function (category) {
                    addMaxScoreOutcomes(outcomes, scoring, formatCategoryOutcome(category, descriptor.categoryIdentifier), false, category);
                    if (descriptor.categoryWeighted && scoring.weightIdentifier) {
                        addMaxScoreOutcomes(outcomes, scoring, formatCategoryOutcome(category, descriptor.categoryWeighted), true, category);
                    }
                });
            }
        },

        /**
         * Generates the outcomes that compute the "Cut score"
         * @param {Object} descriptor
         * @param {Object} scoring
         * @param {Object} outcomes
         * @param {Array} [categories]
         */
        cut: function formulaCut(descriptor, scoring, outcomes, categories) {
            var cutScore = scoring.cutScore;
            var totalModeOutcomes = processingModes.total.outcomes;
            var total = _.find(totalModeOutcomes, {formula: 'total'});
            var max = _.find(totalModeOutcomes, {formula: 'max'});
            var formulaOutcome = scoring.weightIdentifier ? 'weighted' : 'identifier';
            var scoreIdentifier = total[formulaOutcome];
            var countIdentifier = max[formulaOutcome];

            // create the outcome and the rule that process the overall score
            addCutScoreOutcomes(outcomes, descriptor.identifier, scoreIdentifier, countIdentifier, cutScore);

            // create the outcome and the rule that process the score feedback
            if (descriptor.feedback) {
                addFeedbackScoreOutcomes(
                    outcomes,
                    descriptor.feedback,
                    descriptor.identifier,
                    descriptor.feedbackOk,
                    descriptor.feedbackFailed
                );
            }

            // create an outcome per category
            if (descriptor.categoryIdentifier && categories) {
                _.forEach(categories, function (category) {
                    var categoryOutcomeIdentifier = formatCategoryOutcome(category, descriptor.categoryIdentifier);
                    var categoryFormulaOutcome = scoring.weightIdentifier ? 'categoryWeighted' : 'categoryIdentifier';
                    var categoryScoreIdentifier = formatCategoryOutcome(category, total[categoryFormulaOutcome]);
                    var categoryCountIdentifier = formatCategoryOutcome(category, max[categoryFormulaOutcome]);

                    addCutScoreOutcomes(outcomes, categoryOutcomeIdentifier, categoryScoreIdentifier, categoryCountIdentifier, cutScore);

                    if (descriptor.categoryFeedback) {
                        addFeedbackScoreOutcomes(
                            outcomes,
                            formatCategoryOutcome(category, descriptor.categoryFeedback),
                            categoryOutcomeIdentifier,
                            descriptor.feedbackOk,
                            descriptor.feedbackFailed
                        );
                    }
                });
            }

            return outcomes;
        }
    };

    var scoringHelper = {
        /**
         * Checks the test model against outcome processing mode.
         * Initializes the scoring property accordingly.
         *
         * @param {modelOverseer} modelOverseer
         * @throws {TypeError} if the modelOverseer is invalid
         * @fires modelOverseer#scoring-init
         * @fires modelOverseer#scoring-generate
         * @fires modelOverseer#scoring-write
         */
        init: function init(modelOverseer) {
            var model;

            if (!modelOverseer || !_.isFunction(modelOverseer.getModel)) {
                throw new TypeError("You must provide a valid modelOverseer");
            }

            model = modelOverseer.getModel();

            // detect the score processing mode and build the descriptor used to manage the UI
            model.scoring = detectScoring(modelOverseer);

            modelOverseer
                .on('scoring-change category-change delete', function () {
                    /**
                     * Regenerates the outcomes on any significant changes.
                     * After the outcomes have been generated a write is needed to actually apply the data.
                     * Other component can listen to this event and eventually prevent the write to happen.
                     * @event modelOverseer#scoring-generate
                     * @param {Object} outcomes
                     */
                    modelOverseer.trigger('scoring-generate', scoringHelper.generate(modelOverseer));
                })
                .on('scoring-generate', function (outcomes) {
                    outcomeHelper.replaceOutcomes(model, outcomes);

                    /**
                     * The generated outcome have just been applied on the model.
                     * @event modelOverseer#scoring-write
                     * @param {Object} testModel
                     */
                    modelOverseer.trigger('scoring-write', model);
                })

                /**
                 * @event modelOverseer#scoring-init
                 * @param {Object} testModel
                 */
                .trigger('scoring-init', model);
        },

        /**
         * If the processing mode has been set, generates the outcomes that define the scoring.
         *
         * @param {modelOverseer} modelOverseer
         * @returns {Object}
         * @throws {TypeError} if the modelOverseer is invalid or the processing mode is unknown
         */
        generate: function generate(modelOverseer) {
            var model, scoring, outcomes, processingMode, descriptors, categories;

            if (!modelOverseer || !_.isFunction(modelOverseer.getModel)) {
                throw new TypeError("You must provide a valid modelOverseer");
            }

            model = modelOverseer.getModel();
            scoring = model.scoring;
            outcomes = getOutcomes(model);

            // write the score processing mode by generating the outcomes variables, but only if the mode has been set
            if (scoring) {
                processingMode = processingModes[scoring.outcomeProcessing];
                if (processingMode) {

                    if (processingMode.clean) {
                        // erase the existing rules, they will be replaced by those that are defined here
                        removeScoring(outcomes);
                    }

                    // get the recipes that define the formula, include sub-recipes if any
                    descriptors = getRecipes(processingMode);

                    // only get the categories if requested
                    if (handleCategories(modelOverseer)) {
                        categories = modelOverseer.getCategories();
                    }

                    // will generate outcomes based of the defined formula
                    _.forEach(descriptors, function(descriptor) {
                        var writer = formulaWriters[descriptor.formula];
                        if (!_.isFunction(writer)) {
                            throw new Error('Unknown score processing formula: ' + descriptor.formula);
                        }
                        writer(descriptor, scoring, outcomes, categories);
                    });

                } else {
                    throw new Error('Unknown score processing mode: ' + scoring.outcomeProcessing);
                }
            }

            return outcomes;
        }
    };

    /**
     * Creates an outcome and the rule that process the total score
     *
     * @param {Object} model
     * @param {Object} scoring
     * @param {String} identifier
     * @param {Boolean} [weight]
     * @param {String} [category]
     */
    function addTotalScoreOutcomes(model, scoring, identifier, weight, category) {
        var outcome = outcomeHelper.createOutcome(identifier, baseTypeHelper.FLOAT);
        var processingRule = processingRuleHelper.setOutcomeValue(identifier,
            processingRuleHelper.sum(
                processingRuleHelper.testVariables(scoring.scoreIdentifier, -1, weight && scoring.weightIdentifier, category)
            )
        );

        outcomeHelper.addOutcome(model, outcome, processingRule);
    }

    /**
     * Creates an outcome and the rule that process the maximum score
     *
     * @param {Object} model
     * @param {Object} scoring
     * @param {String} identifier
     * @param {Boolean} [weight]
     * @param {String} [category]
     */
    function addMaxScoreOutcomes(model, scoring, identifier, weight, category) {
        var outcome = outcomeHelper.createOutcome(identifier, baseTypeHelper.FLOAT);
        var processingRule = processingRuleHelper.setOutcomeValue(identifier,
            processingRuleHelper.sum(
                processingRuleHelper.outcomeMaximum(scoring.scoreIdentifier, weight && scoring.weightIdentifier, category)
            )
        );
        var outcomeCondition = processingRuleHelper.outcomeCondition(
            processingRuleHelper.outcomeIf(
                processingRuleHelper.isNull(
                    processingRuleHelper.variable(identifier)
                ),
                processingRuleHelper.setOutcomeValue(identifier,
                    processingRuleHelper.numberPresented(category)
                )
            )
        );

        outcomeHelper.addOutcome(model, outcome, processingRule);
        outcomeHelper.addOutcomeProcessing(model, outcomeCondition);
    }

    /**
     * Creates an outcome and the rule that process the cut score
     *
     * @param {Object} model
     * @param {String} identifier
     * @param {String} scoreIdentifier
     * @param {String} countIdentifier
     * @param {String|Number} cutScore
     */
    function addCutScoreOutcomes(model, identifier, scoreIdentifier, countIdentifier, cutScore) {
        var outcome = outcomeHelper.createOutcome(identifier, baseTypeHelper.BOOLEAN);
        var processingRule = processingRuleHelper.setOutcomeValue(identifier,
            processingRuleHelper.gte(
                processingRuleHelper.divide(
                    processingRuleHelper.variable(scoreIdentifier),
                    processingRuleHelper.variable(countIdentifier)
                ),
                processingRuleHelper.baseValue(cutScore, baseTypeHelper.FLOAT)
            )
        );

        outcomeHelper.addOutcome(model, outcome, processingRule);
    }

    /**
     * Creates an outcome and the rule that process the score feedback
     *
     * @param {Object} model
     * @param {String} identifier
     * @param {String} variable
     * @param {String} passed
     * @param {String} notPassed
     */
    function addFeedbackScoreOutcomes(model, identifier, variable, passed, notPassed) {
        var type = baseTypeHelper.IDENTIFIER;
        var outcome = outcomeHelper.createOutcome(identifier, type);
        var processingRule = processingRuleHelper.outcomeCondition(
            processingRuleHelper.outcomeIf(
                processingRuleHelper.match(
                    processingRuleHelper.variable(variable),
                    processingRuleHelper.baseValue(true, baseTypeHelper.BOOLEAN)
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
     * Formats the identifier of a category outcome
     * @param {String} category
     * @param {String} template
     * @returns {String}
     */
    function formatCategoryOutcome(category, template) {
        return template.replace(/%s/g, category.toUpperCase());
    }

    /**
     * Checks whether an identifier belongs to a scoring mode
     * @param {String} identifier
     * @param {Object} processingMode
     * @param {Boolean} [onlyCategories]
     * @returns {Boolean}
     */
    function belongToScoringMode(identifier, processingMode, onlyCategories) {
        var match = false;
        if (processingMode.signature && processingMode.signature.test(identifier)) {
            match = true;
            if (onlyCategories) {
                _.forEach(processingMode.outcomes, function(outcome) {
                    if (outcome.identifier === identifier ||
                        (outcome.weighted && outcome.weighted === identifier) ||
                        (outcome.feedback && outcome.feedback === identifier)) {
                        match = false;
                        return false;
                    }
                });
            }
        }
        return match;
    }

    /**
     * Checks if all the outcomes are related to the scoring mode
     * @param {Object} processingMode
     * @param {Array} outcomes
     * @param {Array} categories
     * @returns {Boolean}
     */
    function matchScoringMode(processingMode, outcomes, categories) {
        var signatures = getSignatures(processingMode);
        var match = true;

        // check the outcomes definitions against the provided identifier
        function matchScoringOutcome(mode, identifier) {
            var outcomeMatch = false;

            // first level, the signature must match
            if (mode.signature && mode.signature.test(identifier)) {
                _.forEach(mode.outcomes, function(outcome) {
                    // second level, the main identifier must match
                    if (outcome.identifier !== identifier &&
                        (!outcome.weighted || (outcome.weighted && outcome.weighted !== identifier)) &&
                        (!outcome.feedback || (outcome.feedback && outcome.feedback !== identifier))) {

                        if (categories) {
                            // third level, a category must match
                            _.forEach(categories, function(category) {
                                if (outcome.categoryIdentifier &&
                                    identifier === formatCategoryOutcome(category, outcome.categoryIdentifier)) {
                                    outcomeMatch = true;
                                } else if (outcome.categoryWeighted &&
                                    identifier === formatCategoryOutcome(category, outcome.categoryWeighted)) {
                                    outcomeMatch = true;
                                } else if (outcome.categoryFeedback &&
                                    identifier === formatCategoryOutcome(category, outcome.categoryFeedback)) {
                                    outcomeMatch = true;
                                }
                                // found something?
                                if (outcomeMatch) {
                                    return false;
                                }
                            });
                        }
                    } else {
                        outcomeMatch = true;
                    }

                    // found something?
                    if (outcomeMatch) {
                        return false;
                    }
                });
            }

            if (!outcomeMatch && mode.include) {
                outcomeMatch = matchScoringOutcome(processingModes[mode.include], identifier);
            }

            return outcomeMatch;
        }

        // only check the outcomes that are related to the scoring mode
        _.forEach(outcomes, function(identifier) {
            var signatureMatch = false;
            _.forEach(signatures, function(signature) {
                if (signature.test(identifier)) {
                    signatureMatch = true;
                    return false;
                }
            });

            if (signatureMatch) {
                match = matchScoringOutcome(processingMode, identifier);

                if (!match) {
                    return false;
                }
            }
        });

        return match;
    }

    /**
     * Gets all the outcomes signatures related to a scoring mode
     * @param {Object} processingMode
     * @returns {Array}
     */
    function getSignatures(processingMode) {
        var signatures = [];

        // list the signatures for each processing mode, taking care of includes
        while(processingMode) {
            if (processingMode.signature) {
                signatures.push(processingMode.signature);
            }
            processingMode = processingMode.include && processingModes[processingMode.include];
        }

        return signatures;
    }

    /**
     * Gets all the outcomes recipes related to a scoring mode
     * @param {Object} processingMode
     * @returns {Array}
     */
    function getRecipes(processingMode) {
        var descriptors = [];

        // get the recipes that define the formula, include sub-recipes if any
        while(processingMode) {
            if (processingMode.outcomes) {
                descriptors = [].concat(processingMode.outcomes, descriptors);
            }
            processingMode = processingMode.include && processingModes[processingMode.include];
        }

        return descriptors;
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
            if (belongToScoringMode(identifier, processingMode)) {
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
        _.forEach(outcomes, function (outcome) {
            var mode = getScoringMode(outcome);
            if (mode) {
                modes[mode.key] = true;
            }
        });
        return _.keys(modes);
    }

    /**
     * Checks whether the categories have to be taken into account
     * @param {modelOverseer} modelOverseer
     * @returns {Boolean}
     */
    function handleCategories(modelOverseer) {
        var model = modelOverseer.getModel();
        return !!(model.scoring && model.scoring.categoryScore);
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
                if (belongToScoringMode(identifier, processingMode, true)) {
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
     * @param {modelOverseer} modelOverseer
     * @returns {String}
     */
    function getOutcomeProcessing(modelOverseer) {
        var model = modelOverseer.getModel();
        var outcomeDeclarations = outcomeHelper.getOutcomeDeclarations(model);
        var outcomeRules = outcomeHelper.getOutcomeProcessingRules(model);

        // walk through each outcome declaration, and tries to identify the score processing mode
        var declarations = listScoringModes(outcomeDeclarations);
        var processing = listScoringModes(outcomeRules);
        var diff = _.difference(declarations, processing);
        var count = _.size(declarations);
        var included;

        // default fallback, applied when several modes are detected at the same time
        var outcomeProcessing = 'custom';

        // set the score processing mode with respect to the found outcomes
        if (count === _.size(processing)) {
            if (!count) {
                // no mode detected, set the mode to none
                outcomeProcessing = 'none';
            } else if (_.isEmpty(diff)) {
                if (count > 1) {
                    // several modes detected, try to reduce the list by detecting includes
                    included = [];
                    _.forEach(declarations, function(mode) {
                        if (processingModes[mode] && processingModes[mode].include) {
                            included.push(processingModes[mode].include);
                        }
                    });
                    processing = _.difference(processing, included);
                    count = _.size(processing);
                }

                if (count === 1) {
                    // single mode detected, keep the last got key
                    outcomeProcessing = processing[0];

                    // check if all outcomes are strictly related to the detected mode
                    if (!matchScoringMode(processingModes[outcomeProcessing], modelOverseer.getOutcomesNames(), modelOverseer.getCategories())) {
                        outcomeProcessing = 'custom';
                    }
                }
            }
        }

        return outcomeProcessing;
    }

    /**
     * Detects the score processing mode and builds the descriptor used to manage the UI.
     * @param {modelOverseer} modelOverseer
     * @returns {Object}
     */
    function detectScoring(modelOverseer) {
        var model = modelOverseer.getModel();
        return {
            modes: processingModes,
            scoreIdentifier: defaultScoreIdentifier,
            weightIdentifier: getWeightIdentifier(model),
            cutScore: getCutScore(model),
            categoryScore: hasCategoryOutcome(model),
            outcomeProcessing: getOutcomeProcessing(modelOverseer)
        };
    }

    /**
     * Removes all scoring outcomes
     * @param {Object} model
     */
    function removeScoring(model) {
        var scoringOutcomes = _.indexBy(outcomeHelper.listOutcomes(model, isScoringOutcome), function (outcome) {
            return outcome;
        });

        outcomeHelper.removeOutcomes(model, function(outcome) {
            var match = false;

            function browseExpressions(processingRule) {
                if (_.isArray(processingRule)) {
                    _.forEach(processingRule, browseExpressions);
                } else if (processingRule) {
                    if (scoringOutcomes[outcomeHelper.getOutcomeIdentifier(processingRule)]) {
                        match = true;
                    }

                    if (!match && processingRule.expression) {
                        browseExpressions(processingRule.expression);
                    }
                    if (!match && processingRule.expressions) {
                        browseExpressions(processingRule.expressions);
                    }
                    if (!match && processingRule.outcomeRules) {
                        browseExpressions(processingRule.outcomeRules);
                    }
                    if (!match && processingRule.outcomeIf) {
                        browseExpressions(processingRule.outcomeIf);
                    }
                    if (!match && processingRule.outcomeElse) {
                        browseExpressions(processingRule.outcomeElse);
                    }
                }
            }

            if (outcome['qti-type'] === 'outcomeCondition') {
                browseExpressions(outcome);
            } else {
                match = !!scoringOutcomes[outcomeHelper.getOutcomeIdentifier(outcome)];
            }
            return match;
        });
    }

    /**
     * Gets a copy of the list of outcomes, provides the same structure as the model
     * @param {Object} model
     * @returns {Object}
     */
    function getOutcomes(model) {
        return {
            outcomeDeclarations: [].concat(outcomeHelper.getOutcomeDeclarations(model)),
            outcomeProcessing: {
                outcomeRules: [].concat(outcomeHelper.getOutcomeProcessingRules(model))
            }
        };
    }

    return scoringHelper;
});
