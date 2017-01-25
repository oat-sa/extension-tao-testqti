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
    'taoQtiTest/controller/creator/modelOverseer'
], function (_,
             modelOverseerFactory) {
    'use strict';


    var modelOverseerApi = [
        {title: 'getModel'},
        {title: 'setModel'},
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


    QUnit.test("setModel()/getModel()", function(assert) {
        var model0 = {
            foo: 'bar',
            bar: 'foo'
        };
        var model1 = {
            foo: 'bar'
        };
        var model2 = {
            bar: 'foo'
        };
        var modelOverseer = modelOverseerFactory(model0);

        QUnit.expect(5);

        assert.equal(modelOverseer.getModel(), model0, "The instance should contain the right model");

        assert.equal(modelOverseer.setModel(model1), modelOverseer, 'The setModel() method should return the instance');
        assert.equal(modelOverseer.getModel(), model1, "The instance should have the model changed");

        assert.equal(modelOverseer.setModel(model2), modelOverseer, 'The setModel() method should return the instance');
        assert.equal(modelOverseer.getModel(), model2, "The instance should have the model changed");
    });
});
