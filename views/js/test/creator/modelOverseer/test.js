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
    'json!taoQtiTest/test/creator/samples/outcomes.json',
    'json!taoQtiTest/test/creator/samples/categories.json'
], function (_,
             modelOverseerFactory,
             testModelOutcomesSample,
             testModelCategoriesSample) {
    'use strict';


    var modelOverseerApi = [
        {title: 'getModel'},
        {title: 'setModel'},
        {title: 'getConfig'},
        {title: 'getOutcomesList'},
        {title: 'getOutcomesNames'},
        {title: 'getCategories'},
        {title: 'getOptions'},
        {title: 'getState'},
        {title: 'setState'},
        {title: 'clearStates'},
        {title: 'getStates'},
        {title: 'on'},
        {title: 'off'},
        {title: 'before'},
        {title: 'after'},
        {title: 'trigger'},
        {title: 'removeAllListeners'}
    ];


    QUnit.module('modelOverseerFactory/API');


    QUnit.test("api", function (assert) {
        QUnit.expect(3);

        assert.equal(typeof modelOverseerFactory, 'function', "The module exports a function");
        assert.equal(typeof modelOverseerFactory(), 'object', "The factory returns an object");
        assert.notEqual(modelOverseerFactory(), modelOverseerFactory(), "The factory creates a new instance on each call");
    });


    QUnit
        .cases(modelOverseerApi)
        .test('method ', function (data, assert) {
            QUnit.expect(1);
            assert.equal(typeof modelOverseerFactory()[data.title], 'function', 'The modelOverseer instance exposes a "' + data.title + '" function');
        });


    QUnit.asyncTest("setModel()/getModel()", function(assert) {
        var model1 = {
            foo: 'bar'
        };
        var model2 = {
            bar: 'foo'
        };
        var modelOverseer = modelOverseerFactory(testModelOutcomesSample);
        var eventCount = 0;

        QUnit.expect(7);

        modelOverseer.on('setmodel', function() {
            assert.ok(true, 'The event setmodel has been triggered');

            if (++eventCount >= 2) {
                QUnit.start();
            }
        });

        assert.equal(modelOverseer.getModel(), testModelOutcomesSample, "The instance should contain the right model");

        assert.equal(modelOverseer.setModel(model1), modelOverseer, 'The setModel() method should return the instance');
        assert.equal(modelOverseer.getModel(), model1, "The instance should have the model changed");

        assert.equal(modelOverseer.setModel(model2), modelOverseer, 'The setModel() method should return the instance');
        assert.equal(modelOverseer.getModel(), model2, "The instance should have the model changed");
    });


    QUnit.test("getConfig()", function(assert) {
        var config = {
            data: '',
            ready: true
        };
        var modelOverseer = modelOverseerFactory(testModelOutcomesSample, config);

        QUnit.expect(2);

        assert.equal(modelOverseer.getModel(), testModelOutcomesSample, "The instance should contain the right model");
        assert.equal(modelOverseer.getConfig(), config, "The instance should contain the right config set");
    });


    QUnit.test("getOutcomesList()", function(assert) {
        var modelOverseer = modelOverseerFactory(testModelOutcomesSample);
        var expectedList = [{
            name: 'SCORE_MATH',
            type: 'float',
            cardinality: 'single'
        }, {
            name: 'SCORE_HISTORY',
            type: 'float',
            cardinality: 'single'
        }, {
            name: 'PASS_MATH',
            type: 'boolean',
            cardinality: 'single'
        }, {
            name: 'PASS_HISTORY',
            type: 'boolean',
            cardinality: 'single'
        }];

        QUnit.expect(2);

        assert.deepEqual(modelOverseer.getOutcomesList(), expectedList, "Should return the right list of outcomes");

        modelOverseer.setModel({});

        assert.deepEqual(modelOverseer.getOutcomesList(), [], "As there is no outcomes, should return an empty list");
    });


    QUnit.test("getOutcomesNames()", function(assert) {
        var modelOverseer = modelOverseerFactory(testModelOutcomesSample);
        var expectedList = ['SCORE_MATH', 'SCORE_HISTORY', 'PASS_MATH', 'PASS_HISTORY'];

        QUnit.expect(2);

        assert.deepEqual(modelOverseer.getOutcomesNames(), expectedList, "Should return the right list of outcomes");

        modelOverseer.setModel({});

        assert.deepEqual(modelOverseer.getOutcomesNames(), [], "As there is no outcomes, should return an empty list");
    });


    QUnit.test("getCategories()", function(assert) {
        var modelOverseer = modelOverseerFactory(testModelCategoriesSample);
        var expectedList = ['history', 'math'];

        QUnit.expect(2);

        assert.deepEqual(modelOverseer.getCategories(), expectedList, "Should return the right list of categories");

        modelOverseer.setModel({});

        assert.deepEqual(modelOverseer.getCategories(), [], "As there is no categories, should return an empty list");
    });


    QUnit.test("getOptions()", function(assert) {
        var modelOverseer = modelOverseerFactory(testModelCategoriesSample);
        var expectedList = ['x-tao-option-reviewScreen', 'x-tao-option-calculator'];

        QUnit.expect(2);

        assert.deepEqual(modelOverseer.getOptions(), expectedList, "Should return the right list of options");

        modelOverseer.setModel({});

        assert.deepEqual(modelOverseer.getOptions(), [], "As there is no options, should return an empty list");
    });
});
