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
    'taoQtiTest/controller/creator/helpers/scoring',
    'json!taoQtiTest/test/creator/helpers/scoring/scoringNone.json',
    'json!taoQtiTest/test/creator/helpers/scoring/scoringCustom.json',
    'json!taoQtiTest/test/creator/helpers/scoring/scoringTotal.json',
    'json!taoQtiTest/test/creator/helpers/scoring/scoringTotalCategory.json',
    'json!taoQtiTest/test/creator/helpers/scoring/scoringCut.json',
    'json!taoQtiTest/test/creator/helpers/scoring/scoringCutCategory.json',
    'json!taoQtiTest/test/creator/helpers/scoring/scoringNoOutcomes.json'
], function (_,
             scoringHelper,
             scoringNoneSample,
             scoringCustomSample,
             scoringTotalSample,
             scoringTotalCategorySample,
             scoringCutSample,
             scoringCutCategorySample,
             scoringNoOutcomesSample) {
    'use strict';

    var scoringHelperApi = [
        {title: 'read'},
        {title: 'write'}
    ];

    var scoringReadCases = [
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
            title: 'total&category',
            model: scoringTotalCategorySample,
            outcomeProcessing: 'total',
            categoryScore: true,
            cutScore: 0.50,
            weightIdentifier: ''
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

    var scoringWriteCases = [
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
            model: scoringCustomSample,
            categoryScore: false,
            outcomeProcessing: 'total',
            expected: scoringTotalSample
        },
        {
            title: 'total&category',
            model: scoringCustomSample,
            categoryScore: true,
            outcomeProcessing: 'total',
            expected: scoringTotalCategorySample
        },
        {
            title: 'cut',
            model: scoringCustomSample,
            categoryScore: false,
            outcomeProcessing: 'cut',
            cutScore: 60,
            weightIdentifier: 'WEIGHT',
            expected: scoringCutSample
        },
        {
            title: 'cut&category',
            model: scoringCustomSample,
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
        .cases(scoringReadCases)
        .test('helpers/scoring.read() ', function (data, assert) {
            var model = _.cloneDeep(data.model);

            QUnit.expect(5);

            scoringHelper.read(model);

            assert.equal(typeof model.scoring, 'object', 'The scoring descriptor has been set');
            assert.equal(model.scoring.outcomeProcessing, data.outcomeProcessing, 'The right scoring processing mode has been detected');
            assert.equal(model.scoring.categoryScore, data.categoryScore, 'The right categoryScore option has been set');
            assert.equal(model.scoring.cutScore, data.cutScore, 'The right cutScore has been loaded');
            assert.equal(model.scoring.weightIdentifier, data.weightIdentifier, 'The right weightIdentifier has been loaded');
        });


    QUnit
        .cases(scoringWriteCases)
        .test('helpers/scoring.write() ', function (data, assert) {
            var model = _.cloneDeep(data.model);

            QUnit.expect(1);

            scoringHelper.read(model);

            model.scoring.outcomeProcessing = data.outcomeProcessing;
            model.scoring.categoryScore = data.categoryScore;
            model.scoring.cutScore = data.cutScore;
            model.scoring.weightIdentifier = data.weightIdentifier;

            scoringHelper.write(model);

            model = _.omit(model, 'scoring');

            assert.deepEqual(model, data.expected, 'The score processing has been set');
        });


    QUnit.test('helpers/scoring.write() #error', function (assert) {
        var model = {
            scoring: {
                outcomeProcessing: 'foo'
            }
        };

        QUnit.expect(1);

        assert.throws(function () {
            scoringHelper.write(model);
        }, 'The scoring helper should throw an error if the processing mode is unknown!');

    });
});
