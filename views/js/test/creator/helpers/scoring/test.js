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
    'lodash',
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
    'json!taoQtiTest/test/creator/samples/scoringNoOutcomes.json'
], function (_,
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
             scoringNoOutcomesSample) {
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


    QUnit.test('module', function (assert) {
        QUnit.expect(1);
        assert.equal(typeof scoringHelper, 'object', "The scoring helper module exposes an object");
    });


    QUnit
        .cases(scoringHelperApi)
        .test('helpers/scoring API ', function (data, assert) {
            QUnit.expect(1);
            assert.equal(typeof scoringHelper[data.title], 'function', 'The scoring helper exposes a "' + data.title + '" function');
        });


    QUnit
        .cases(scoringInitCases)
        .asyncTest('helpers/scoring.init() ', function (data, assert) {
            var model = _.cloneDeep(data.model);
            var modelOverseer = modelOverseerFactory(model);

            QUnit.expect(5);

            modelOverseer.on('scoring-init', function() {
                assert.equal(typeof model.scoring, 'object', 'The scoring descriptor has been set');
                assert.equal(model.scoring.outcomeProcessing, data.outcomeProcessing, 'The right scoring processing mode has been detected');
                assert.equal(model.scoring.categoryScore, data.categoryScore, 'The right categoryScore option has been set');
                assert.equal(model.scoring.cutScore, data.cutScore, 'The right cutScore has been loaded');
                assert.equal(model.scoring.weightIdentifier, data.weightIdentifier, 'The right weightIdentifier has been loaded');

               QUnit.start();
            });

            scoringHelper.init(modelOverseer);
        });


    QUnit.test('helpers/scoring.init() #error', function (assert) {
        QUnit.expect(2);

        assert.throws(function () {
            scoringHelper.init();
        }, 'The scoring helper should throw an error if no modelOverseer is provided!');

        assert.throws(function () {
            scoringHelper.init({});
        }, 'The scoring helper should throw an error if an invalid modelOverseer is provided!');
    });


    QUnit
        .cases(scoringGenerateCases)
        .asyncTest('helpers/scoring.generate() ', function (data, assert) {
            var model = _.cloneDeep(data.model);
            var modelOverseer = modelOverseerFactory(model);

            QUnit.expect(2);

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

                QUnit.start();
            });

            scoringHelper.init(modelOverseer);
        });


    QUnit.asyncTest('helpers/scoring.generate() #no scoring', function (assert) {
        var model = _.cloneDeep(scoringCustomSample);
        var modelOverseer = modelOverseerFactory(model);

        QUnit.expect(2);

        modelOverseer.on('scoring-init', function() {
            delete model.scoring;

            modelOverseer.trigger('scoring-change');
        });

        modelOverseer.on('scoring-write', function(writtenModel) {

            model = _.omit(model, 'scoring');
            writtenModel = _.omit(writtenModel, 'scoring');

            assert.deepEqual(writtenModel, scoringCustomSample, 'The written model is as expected');
            assert.deepEqual(model, scoringCustomSample, 'The score processing has been set');

            QUnit.start();
        });

        scoringHelper.init(modelOverseer);
    });


    QUnit.test('helpers/scoring.generate() #error', function (assert) {
        var model = {
            scoring: {
                outcomeProcessing: 'foo'
            }
        };
        var modelOverseer = modelOverseerFactory(model);

        QUnit.expect(3);

        assert.throws(function () {
            scoringHelper.generate();
        }, 'The scoring helper should throw an error if no modelOverseer is provided!');

        assert.throws(function () {
            scoringHelper.generate(model);
        }, 'The scoring helper should throw an error if an invalid modelOverseer is provided!');

        assert.throws(function () {
            scoringHelper.generate(modelOverseer);
        }, 'The scoring helper should throw an error if the processing mode is unknown!');
    });
});
