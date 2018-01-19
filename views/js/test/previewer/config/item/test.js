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
 * Copyright (c) 2018 (original work) Open Assessment Technologies SA ;
 */

/**
 * @author Jean-Sébastien Conan <jean-sebastien@taotesting.com>
 */
define([
    'lodash',
    'util/url',
    'taoQtiTest/previewer/config/item'
], function (_, urlUtil, itemConfig) {
    'use strict';

    QUnit.module('itemConfig');


    QUnit.test('module', function (assert) {
        var config = {
            serviceCallId: 'foo'
        };

        QUnit.expect(3);
        assert.equal(typeof itemConfig, 'function', "The itemConfig module exposes a function");
        assert.equal(typeof itemConfig(config), 'object', "The itemConfig factory produces an instance");
        assert.notStrictEqual(itemConfig(config), itemConfig(config), "The itemConfig factory provides a different instance on each call");
    });


    QUnit
        .cases([
            {title: 'getServiceCallId'},
            {title: 'getServiceController'},
            {title: 'getServiceExtension'},
            {title: 'getTestActionUrl'},
            {title: 'getItemActionUrl'},
            {title: 'getTelemetryUrl'},
            {title: 'getTimeout'}
        ])
        .test('proxy API ', function (data, assert) {
            var instance = itemConfig({
                serviceCallId: 'foo'
            });

            QUnit.expect(1);

            assert.equal(typeof instance[data.title], 'function', 'The itemConfig instances expose a "' + data.title + '" function');
        });


    QUnit.test('itemConfig factory', function (assert) {
        QUnit.expect(1);

        itemConfig({
            serviceCallId: 'foo'
        });
        assert.ok(true, 'The itemConfig() factory must not throw an exception when all the required config entries are provided');
    });


    QUnit.test('itemConfig.getServiceCallId', function (assert) {
        var expectedServiceCallId = 'http://tao.rdf/1234#56789';
        var config = {
            serviceCallId: expectedServiceCallId
        };
        var instance = itemConfig(config);

        QUnit.expect(1);

        assert.equal(instance.getServiceCallId(), expectedServiceCallId, 'The itemConfig.getServiceCallId() method has returned the expected value');
    });


    QUnit.test('itemConfig.getServiceController', function (assert) {
        var expectedServiceController = 'MockRunner';
        var config = {
            serviceCallId: 'foo'
        };
        var instance = itemConfig(config);

        QUnit.expect(3);

        assert.notEqual(instance.getServiceController(), expectedServiceController, 'The itemConfig.getServiceController() method must return the default value');
        assert.ok(!!instance.getServiceController(), 'The itemConfig.getServiceController() method must not return a null value');

        config.bootstrap = {
            serviceController: expectedServiceController
        };
        instance = itemConfig(config);
        assert.equal(instance.getServiceController(), expectedServiceController, 'The itemConfig.getServiceController() method has returned the expected value');
    });


    QUnit.test('itemConfig.getServiceExtension', function (assert) {
        var expectedServiceExtension = 'MockExtension';
        var config = {
            serviceCallId: 'foo'
        };
        var instance = itemConfig(config);

        QUnit.expect(3);

        assert.notEqual(instance.getServiceExtension(), expectedServiceExtension, 'The itemConfig.getServiceExtension() method must return the default value');
        assert.ok(!!instance.getServiceExtension(), 'The itemConfig.getServiceExtension() method must not return a null value');

        config.bootstrap = {
            serviceExtension: expectedServiceExtension
        };
        instance = itemConfig(config);
        assert.equal(instance.getServiceExtension(), expectedServiceExtension, 'The itemConfig.getServiceExtension() method has returned the expected value');
    });


    QUnit.test('itemConfig.getTestActionUrl', function (assert) {
        var config = {
            serviceCallId: 'foo',
            bootstrap: {
                serviceController: 'MockRunner',
                serviceExtension: 'MockExtension'
            }
        };
        var expectedUrl = urlUtil.route('action1', config.bootstrap.serviceController, config.bootstrap.serviceExtension, {
            serviceCallId: config.serviceCallId
        });
        var expectedUrl2 = urlUtil.route('action2', config.bootstrap.serviceController, config.bootstrap.serviceExtension, {
            serviceCallId: config.serviceCallId
        });
        var instance = itemConfig(config);

        QUnit.expect(2);

        assert.equal(instance.getTestActionUrl('action1'), expectedUrl, 'The itemConfig.getTestActionUrl() method has returned the expected value');
        assert.equal(instance.getTestActionUrl('action2'), expectedUrl2, 'The itemConfig.getTestActionUrl() method has returned the expected value');
    });


    QUnit.test('itemConfig.getItemActionUrl', function (assert) {
        var config = {
            serviceCallId: 'foo',
            bootstrap: {
                serviceController: 'MockRunner',
                serviceExtension: 'MockExtension'
            }
        };
        var actionName = 'MockAction';
        var expectedUrl = urlUtil.route(actionName, config.bootstrap.serviceController, config.bootstrap.serviceExtension, {
            serviceCallId: config.serviceCallId,
            itemDefinition: 'item1'
        });
        var expectedUrl2 = urlUtil.route(actionName, config.bootstrap.serviceController, config.bootstrap.serviceExtension, {
            serviceCallId: config.serviceCallId,
            itemDefinition: 'item2'
        });
        var instance = itemConfig(config);

        QUnit.expect(2);

        assert.equal(instance.getItemActionUrl('item1', actionName), expectedUrl, 'The itemConfig.getItemActionUrl() method has returned the expected value');
        assert.equal(instance.getItemActionUrl('item2', actionName), expectedUrl2, 'The itemConfig.getItemActionUrl() method has returned the expected value');
    });


    QUnit.test('itemConfig.getTelemetryUrl', function (assert) {
        var config = {
            serviceCallId: 'foo',
            bootstrap: {
                serviceController: 'MockRunner',
                serviceExtension: 'MockExtension'
            }
        };
        var actionName = 'MockAction';
        var expectedUrl = urlUtil.route(actionName, config.bootstrap.serviceController, config.bootstrap.serviceExtension, {
            serviceCallId: config.serviceCallId,
            itemDefinition: 'item1'
        });
        var expectedUrl2 = urlUtil.route(actionName, config.bootstrap.serviceController, config.bootstrap.serviceExtension, {
            serviceCallId: config.serviceCallId,
            itemDefinition: 'item2'
        });
        var instance = itemConfig(config);

        QUnit.expect(2);

        assert.equal(instance.getTelemetryUrl('item1', actionName), expectedUrl, 'The itemConfig.getTelemetryUrl() method has returned the expected value');
        assert.equal(instance.getTelemetryUrl('item2', actionName), expectedUrl2, 'The itemConfig.getTelemetryUrl() method has returned the expected value');
    });


    QUnit.test('itemConfig.getTimeout', function (assert) {
        var config = {
            serviceCallId: 'foo'
        };
        var instance = itemConfig(config);

        QUnit.expect(2);

        assert.equal(typeof instance.getTimeout(), 'undefined', 'The itemConfig.getTimeout() method must return an undefined value if no timeout has been set');

        config.timeout = 10;
        instance = itemConfig(config);
        assert.equal(instance.getTimeout(), 10000, 'The itemConfig.getTimeout() method has returned the expected value');
    });



    QUnit.test('itemConfig.getCommunicationConfig', function (assert) {
        var config = {
            serviceCallId: 'foo',
            bootstrap: {
                serviceController: 'MockRunner',
                serviceExtension: 'MockExtension'
            }
        };
        var undef;
        var expected = {
            enabled: undef,
            type: undef,
            params: {
                service: urlUtil.route('message', config.bootstrap.serviceController, config.bootstrap.serviceExtension, {
                    serviceCallId: config.serviceCallId
                }),
                timeout: undef
            },
            syncActions: []
        };
        var instance = itemConfig(config);

        QUnit.expect(3);

        assert.deepEqual(instance.getCommunicationConfig(), expected, 'The itemConfig.getCommunicationConfig() method has returned the default values');

        config.timeout = 10;
        config.bootstrap.communication = {
            controller: 'CommunicationRunner',
            extension: 'CommunicationExtension',
            action: 'message',
            syncActions: [
                'move', 'skip'
            ],
            service: 'http://my.service.tao/1234',
            enabled: true,
            type: 'foo',
            params: {
                interval: 20
            }
        };
        expected.enabled = true;
        expected.type = 'foo';
        expected.syncActions = config.bootstrap.communication.syncActions;
        expected.params = {
            service: config.bootstrap.communication.service,
            timeout: 10000,
            interval: 20000
        };
        instance = itemConfig(config);
        assert.deepEqual(instance.getCommunicationConfig(), expected, 'The itemConfig.getCommunicationConfig() method has returned the expected values');


        config.bootstrap.communication.params.timeout = 5;
        expected.params.timeout = 5000;

        instance = itemConfig(config);
        assert.deepEqual(instance.getCommunicationConfig(), expected, 'The itemConfig.getCommunicationConfig() method has returned the expected values');
    });
});
