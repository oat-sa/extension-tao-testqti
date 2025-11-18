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
 * @author Jean-Sébastien Conan <jean-sebastien@taotesting.com>
 */
define([

    'jquery',
    'lodash',
    'taoQtiTest/controller/creator/helpers/baseType',
    'taoQtiTest/controller/creator/modelOverseer',
    'taoQtiTest/controller/creator/helpers/scoring',
    'json!taoQtiTest/test/creator/samples/scoring.json',
    'json!taoQtiTest/test/creator/samples/scoringWeighted.json',
    'json!taoQtiTest/test/creator/samples/scoringNone.json',
    'json!taoQtiTest/test/creator/samples/scoringCustom.json',
    'json!taoQtiTest/test/creator/samples/scoringTotal.json',
    'json!taoQtiTest/test/creator/samples/scoringTotalWeighted.json',
    'json!taoQtiTest/test/creator/samples/scoringTotalCategory.json',
    'json!taoQtiTest/test/creator/samples/scoringTotalCategoryWeighted.json',
    'json!taoQtiTest/test/creator/samples/scoringCut.json',
    'json!taoQtiTest/test/creator/samples/scoringCutCategory.json',
    'json!taoQtiTest/test/creator/samples/scoringNoOutcomes.json',
    'json!taoQtiTest/test/creator/samples/scoringGrade.json'
], function(

    $,
    _,
    baseTypeHelper,
    modelOverseerFactory,
    scoringHelper,
    scoringSample,
    scoringWeightedSample,
    scoringNoneSample,
    scoringCustomSample,
    scoringTotalSample,
    scoringTotalWeightedSample,
    scoringTotalCategorySample,
    scoringTotalCategoryWeightedSample,
    scoringCutSample,
    scoringCutCategorySample,
    scoringNoOutcomesSample,
    scoringGradeSample
) {
    'use strict';

    var scoringHelperApi = [
        {title: 'init'},
        {title: 'generate'}
    ];

    var scoringInitCases = [
        {
            title: 'none',
            model: scoringSample,
            outcomeProcessing: 'none',
            categoryScore: false,
            cutScore: 0.5,
            weightIdentifier: ''
        },
        {
            title: 'none',
            model: scoringNoneSample,
            outcomeProcessing: 'none',
            categoryScore: false,
            cutScore: 0.5,
            weightIdentifier: ''
        },
        {
            title: 'custom',
            model: scoringCustomSample,
            outcomeProcessing: 'custom',
            categoryScore: true,
            cutScore: 60,
            weightIdentifier: 'WEIGHT'
        },
        {
            title: 'total',
            model: scoringTotalSample,
            outcomeProcessing: 'total',
            categoryScore: false,
            cutScore: .50,
            weightIdentifier: ''
        },
        {
            title: 'total weighted',
            model: scoringTotalWeightedSample,
            outcomeProcessing: 'total',
            categoryScore: false,
            cutScore: .50,
            weightIdentifier: 'WEIGHT'
        },
        {
            title: 'total&category',
            model: scoringTotalCategorySample,
            outcomeProcessing: 'total',
            categoryScore: true,
            cutScore: 0.50,
            weightIdentifier: ''
        },
        {
            title: 'total weighted&category',
            model: scoringTotalCategoryWeightedSample,
            outcomeProcessing: 'total',
            categoryScore: true,
            cutScore: 0.50,
            weightIdentifier: 'WEIGHT'
        },
        {
            title: 'cut',
            model: scoringCutSample,
            outcomeProcessing: 'cut',
            categoryScore: false,
            cutScore: 60,
            weightIdentifier: 'WEIGHT'
        },
        {
            title: 'cut&category',
            model: scoringCutCategorySample,
            outcomeProcessing: 'cut',
            categoryScore: true,
            cutScore: 60,
            weightIdentifier: 'WEIGHT'
        }
    ];

    var scoringGenerateCases = [
        {
            title: 'none',
            model: scoringCustomSample,
            categoryScore: false,
            outcomeProcessing: 'none',
            expected: scoringNoOutcomesSample
        },
        {
            title: 'custom',
            model: scoringCustomSample,
            categoryScore: false,
            outcomeProcessing: 'custom',
            expected: scoringCustomSample
        },
        {
            title: 'total',
            model: scoringCutCategorySample,
            categoryScore: false,
            outcomeProcessing: 'total',
            expected: scoringTotalSample
        },
        {
            title: 'total weighted',
            model: scoringWeightedSample,
            categoryScore: false,
            outcomeProcessing: 'total',
            weightIdentifier: 'WEIGHT',
            expected: scoringTotalWeightedSample
        },
        {
            title: 'total&category',
            model: scoringCutCategorySample,
            categoryScore: true,
            outcomeProcessing: 'total',
            expected: scoringTotalCategorySample
        },
        {
            title: 'total weighted&category',
            model: scoringWeightedSample,
            categoryScore: true,
            outcomeProcessing: 'total',
            weightIdentifier: 'WEIGHT',
            expected: scoringTotalCategoryWeightedSample
        },
        {
            title: 'cut',
            model: scoringTotalCategorySample,
            categoryScore: false,
            outcomeProcessing: 'cut',
            cutScore: 60,
            weightIdentifier: 'WEIGHT',
            expected: scoringCutSample
        },
        {
            title: 'cut&category',
            model: scoringTotalCategorySample,
            categoryScore: true,
            outcomeProcessing: 'cut',
            cutScore: 60,
            weightIdentifier: 'WEIGHT',
            expected: scoringCutCategorySample
        }
    ];

    QUnit.module('helpers/scoring');

    function collectGradeMappings(condition) {
        var mappings = [];
        var current = condition;

        while (current && current.outcomeIf) {
            var expression = current.outcomeIf.expression || {};
            var expressions = expression.expressions || [];
            var scoreBaseValue = _.find(expressions, function(expr) {
                return expr && typeof expr.value !== 'undefined';
            }) || {};
            var setRule = current.outcomeIf.outcomeRules && current.outcomeIf.outcomeRules[0];
            var gradeBaseValue = setRule && setRule.expression ? setRule.expression.value : undefined;

            if (typeof scoreBaseValue.value !== 'undefined' && typeof gradeBaseValue !== 'undefined') {
                mappings.push({
                    score: Number(scoreBaseValue.value),
                    grade: gradeBaseValue
                });
            }

            if (!current.outcomeElse || !current.outcomeElse.outcomeRules || !current.outcomeElse.outcomeRules.length) {
                break;
            }
            current = current.outcomeElse.outcomeRules[0];
        }

        return mappings;
    }

    QUnit.test('module', function(assert) {
        assert.expect(1);
        assert.equal(typeof scoringHelper, 'object', 'The scoring helper module exposes an object');
    });

    QUnit
        .cases.init(scoringHelperApi)
        .test('helpers/scoring API ', function(data, assert) {
            assert.expect(1);
            assert.equal(typeof scoringHelper[data.title], 'function', 'The scoring helper exposes a "' + data.title + '" function');
        });

    QUnit
        .cases.init(scoringInitCases)
        .test('helpers/scoring.init() ', function(data, assert) {
            var ready = assert.async();
            var model = _.cloneDeep(data.model);
            var modelOverseer = modelOverseerFactory(model);

            assert.expect(5);

            modelOverseer.on('scoring-init', function() {
                assert.equal(typeof model.scoring, 'object', 'The scoring descriptor has been set');
                assert.equal(model.scoring.outcomeProcessing, data.outcomeProcessing, 'The right scoring processing mode has been detected');
                assert.equal(model.scoring.categoryScore, data.categoryScore, 'The right categoryScore option has been set');
                assert.equal(model.scoring.cutScore, data.cutScore, 'The right cutScore has been loaded');
                assert.equal(model.scoring.weightIdentifier, data.weightIdentifier, 'The right weightIdentifier has been loaded');

                ready();
            });

            scoringHelper.init(modelOverseer);
        });

    QUnit.test('helpers/scoring.init() #error', function(assert) {
        assert.expect(2);

        assert.throws(function() {
            scoringHelper.init();
        }, 'The scoring helper should throw an error if no modelOverseer is provided!');

        assert.throws(function() {
            scoringHelper.init({});
        }, 'The scoring helper should throw an error if an invalid modelOverseer is provided!');
    });

    QUnit
        .cases.init(scoringGenerateCases)
        .test('helpers/scoring.generate() ', function(data, assert) {
            var ready = assert.async();
            var model = _.cloneDeep(data.model);
            var modelOverseer = modelOverseerFactory(model);

            assert.expect(2);

            modelOverseer.on('scoring-init', function() {
                model.scoring.outcomeProcessing = data.outcomeProcessing;
                model.scoring.categoryScore = data.categoryScore;
                model.scoring.cutScore = data.cutScore;
                model.scoring.weightIdentifier = data.weightIdentifier;

                modelOverseer.trigger('scoring-change');
            });

        modelOverseer.on('scoring-write', function(writtenModel) {

            model = _.omit(model, 'scoring');
            writtenModel = _.omit(writtenModel, 'scoring');

            assert.deepEqual(writtenModel, data.expected, 'The written model is as expected');
            assert.deepEqual(model, data.expected, 'The score processing has been set');

            ready();
        });

        scoringHelper.init(modelOverseer);
    });

    QUnit.test('helpers/scoring.generate() - grade mode uses selected scale', function(assert) {
        var ready = assert.async();
        var model = _.cloneDeep(scoringGradeSample);
        var gradeScale = _.cloneDeep(model.scalePresets[0]);
        var modelOverseer = modelOverseerFactory(model);

        assert.expect(8);

        modelOverseer.on('scoring-init', function() {
            model.scoring.outcomeProcessing = 'grade';
            modelOverseer.trigger('scoring-change');
        });

        modelOverseer.on('scoring-write', function(writtenModel) {
            var gradeOutcome = _.find(writtenModel.outcomeDeclarations, {identifier: 'GRADE'});
            var gradeMaxOutcome = _.find(writtenModel.outcomeDeclarations, {identifier: 'GRADE_MAX'});
            var scoreOutcome = _.find(writtenModel.outcomeDeclarations, {identifier: 'SCORE'});

            assert.equal(gradeOutcome.baseType, baseTypeHelper.STRING, 'GRADE outcome is string');
            assert.equal(gradeMaxOutcome.baseType, baseTypeHelper.STRING, 'GRADE_MAX outcome is string');
            assert.equal(scoreOutcome.baseType, baseTypeHelper.FLOAT, 'SCORE outcome is float');

            var maxGradeKey = _.max(_.map(_.keys(gradeScale.values), Number));
            assert.equal(
                gradeMaxOutcome.defaultValue.values[0].value,
                gradeScale.values[String(maxGradeKey)],
                'GRADE_MAX defaults to highest scale label'
            );

            var minRules = _.filter(writtenModel.outcomeProcessing.outcomeRules, function(rule) {
                return rule['qti-type'] === 'setOutcomeValue' && rule.identifier === 'SCORE';
            });
            assert.equal(minRules.length, 1, 'Only one SCORE min rule is created');

            var minRule = minRules[0];

            assert.equal(minRule.expression['qti-type'], 'min', 'SCORE is calculated with min operator');
            var minIdentifiers = _.map(minRule.expression.expressions, 'identifier').sort();
            assert.deepEqual(minIdentifiers, ['GRAMMAR', 'SENSE_OF_HUMOR', 'VOCABULARY'], 'Min operator uses every graded outcome');

            var conditionRule = _.find(writtenModel.outcomeProcessing.outcomeRules, function(rule) {
                return rule['qti-type'] === 'outcomeCondition';
            });
            var mappings = _.sortBy(collectGradeMappings(conditionRule), 'score');
            var expectedMappings = _.sortBy(_.map(gradeScale.values, function(label, key) {
                return {
                    score: Number(key),
                    grade: label
                };
            }), 'score');

            assert.deepEqual(mappings, expectedMappings, 'Outcome condition mirrors the selected scale values');

            ready();
        });

        scoringHelper.init(modelOverseer);
    });

    QUnit.test('helpers/scoring.generate() - grade mode supports custom scale values', function(assert) {
        var ready = assert.async();
        var model = _.cloneDeep(scoringGradeSample);
        var customScale = _.cloneDeep(model.scalePresets[1]);

        model.scalePresets = [customScale];
        _.forEach(model.outcomeDeclarations, function(outcomeDeclaration) {
            outcomeDeclaration.interpretation = customScale.uri;
        });

        var modelOverseer = modelOverseerFactory(model);

        assert.expect(3);

        modelOverseer.on('scoring-init', function() {
            model.scoring.outcomeProcessing = 'grade';
            modelOverseer.trigger('scoring-change');
        });

        modelOverseer.on('scoring-write', function(writtenModel) {
            var conditionRule = _.find(writtenModel.outcomeProcessing.outcomeRules, function(rule) {
                return rule['qti-type'] === 'outcomeCondition';
            });

            var mappings = _.sortBy(collectGradeMappings(conditionRule), 'score');
            var expectedMappings = _.sortBy(_.map(customScale.values, function(label, key) {
                return {
                    score: Number(key),
                    grade: label
                };
            }), 'score');

            assert.deepEqual(mappings, expectedMappings, 'Custom scale mappings are respected');

            var gradeMaxOutcome = _.find(writtenModel.outcomeDeclarations, {identifier: 'GRADE_MAX'});
            var maxGradeKey = _.max(_.map(_.keys(customScale.values), Number));
            assert.equal(
                gradeMaxOutcome.defaultValue.values[0].value,
                customScale.values[String(maxGradeKey)],
                'GRADE_MAX uses the highest custom scale label'
            );
            assert.equal(gradeMaxOutcome.baseType, baseTypeHelper.STRING, 'Custom GRADE_MAX remains a string outcome');

            ready();
        });

        scoringHelper.init(modelOverseer);
    });

    QUnit.test('helpers/scoring.generate() #no scoring', function(assert) {
        var ready = assert.async();
        var model = _.cloneDeep(scoringCustomSample);
        var modelOverseer = modelOverseerFactory(model);

        assert.expect(2);

        modelOverseer.on('scoring-init', function() {
            delete model.scoring;

            modelOverseer.trigger('scoring-change');
        });

        modelOverseer.on('scoring-write', function(writtenModel) {

            model = _.omit(model, 'scoring');
            writtenModel = _.omit(writtenModel, 'scoring');

            assert.deepEqual(writtenModel, scoringCustomSample, 'The written model is as expected');
            assert.deepEqual(model, scoringCustomSample, 'The score processing has been set');

            ready();
        });

        scoringHelper.init(modelOverseer);
    });

    QUnit.test('helpers/scoring.generate() #error', function(assert) {
        var model = {
            scoring: {
                outcomeProcessing: 'foo'
            }
        };
        var modelOverseer = modelOverseerFactory(model);

        assert.expect(3);

        assert.throws(function() {
            scoringHelper.generate();
        }, 'The scoring helper should throw an error if no modelOverseer is provided!');

        assert.throws(function() {
            scoringHelper.generate(model);
        }, 'The scoring helper should throw an error if an invalid modelOverseer is provided!');

        assert.throws(function() {
            scoringHelper.generate(modelOverseer);
        }, 'The scoring helper should throw an error if the processing mode is unknown!');
    });
});
