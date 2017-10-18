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
 * Copyright (c) 2017 (original work) Open Assessment Technologies SA;
 */
/**
 * @author Christophe Noël <christophe@taotesting.com>
 */
define([
    'jquery',
    'lodash',
    'taoQtiTest/controller/creator/qtiTestCreator'
], function ($, _, qtiTestCreatorFactory) {
    'use strict';

    var fixtureContainer = '#qunit-fixture';

    QUnit.module('Module');

    QUnit.test('Module export', function (assert) {
        QUnit.expect(1);

        assert.ok(typeof qtiTestCreatorFactory === 'function', 'The module expose a factory function');
    });

    QUnit
        .cases([
            { title: 'setTestModel' },
            { title: 'getAreaBroker' },
            { title: 'getModelOverseer' },

            // eventifier
            { title: 'on' },
            { title: 'before' },
            { title: 'after' }
        ])
        .test('Instance API', function (data, assert) {
            var instance = qtiTestCreatorFactory($(fixtureContainer));
            QUnit.expect(1);
            assert.ok(typeof instance[data.title] === 'function', 'instance implements ' + data.title);
        });

    QUnit.module('Factory');

    QUnit
        .cases([
            { title: 'nothing' },
            { title: 'empty object', $container: {} },
            { title: 'string',       $container: 'container'}
        ])
        .test('Throws TypeError if not given a valid container', function (data, assert) {
            QUnit.expect(1);

            assert.throws(function() { qtiTestCreatorFactory(data.$container); }, TypeError);
        });


    QUnit.module('Modules context');

    QUnit.test('Creates modelOverseer', function(assert) {
        var testCreator = qtiTestCreatorFactory($(fixtureContainer)),
            modelOverseer;

        QUnit.expect(2);

        modelOverseer = testCreator.getModelOverseer();
        assert.ok(_.isUndefined(modelOverseer), 'modelOverseer is not created without model');

        testCreator.setTestModel({});
        modelOverseer = testCreator.getModelOverseer();

        assert.ok(_.isObject(modelOverseer), 'modelOverseer has been created');
    });

    QUnit.test('Forward config to modelOverseer', function(assert) {
        var config = {
                option1: 'value1',
                option2: 'value2'
            },
            testCreator = qtiTestCreatorFactory($(fixtureContainer), config),
            modelOverseer;

        QUnit.expect(2);

        testCreator.setTestModel({});
        modelOverseer = testCreator.getModelOverseer();

        assert.ok(_.isObject(modelOverseer), 'modelOverseer has been created');
        assert.deepEqual(modelOverseer.getConfig(), config, 'config has been forwarded to modelOverseer');
    });

    QUnit.test('Creates areaBroker', function(assert) {
        var testCreator = qtiTestCreatorFactory($(fixtureContainer)),
            areaBroker;

        QUnit.expect(1);

        areaBroker = testCreator.getAreaBroker();
        assert.ok(_.isObject(areaBroker), 'areaBroker has been created');
    });

});