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
 * Copyright (c) 2016-2018 (original work) Open Assessment Technologies SA ;
 */
/**
 * @author Jean-Sébastien Conan <jean-sebastien@taotesting.com>
 */
define([
    'lodash',
    'util/url',
    'taoQtiTest/runner/config/qtiServiceConfig'
], function(_, urlUtil, qtiServiceConfig) {
    'use strict';

    QUnit.module('qtiServiceConfig');


    QUnit.test('module', function(assert) {
        var config = {
            testDefinition: 'http://tao.dev/mockTestDefinition#123',
            testCompilation: 'http://tao.dev/mockTestCompilation#123',
            serviceCallId: 'http://tao.dev/mockServiceCallId#123'
        };

        QUnit.expect(3);
        assert.equal(typeof qtiServiceConfig, 'function', "The qtiServiceConfig module exposes a function");
        assert.equal(typeof qtiServiceConfig(config), 'object', "The qtiServiceConfig factory produces an instance");
        assert.notStrictEqual(qtiServiceConfig(config), qtiServiceConfig(config), "The qtiServiceConfig factory provides a different instance on each call");
    });


    QUnit
        .cases([
            { title : 'getTestDefinition' },
            { title : 'getTestCompilation' },
            { title : 'getServiceCallId' },
            { title : 'getServiceController' },
            { title : 'getServiceExtension' },
            { title : 'getTestActionUrl' },
            { title : 'getItemActionUrl' },
            { title : 'getTimeout' },
            { title : 'getCommunicationConfig' }
        ])
        .test('proxy API ', function(data, assert) {
            var config = {
                testDefinition: 'http://tao.dev/mockTestDefinition#123',
                testCompilation: 'http://tao.dev/mockTestCompilation#123',
                serviceCallId: 'http://tao.dev/mockServiceCallId#123'
            };
            var instance = qtiServiceConfig(config);

            QUnit.expect(1);
            assert.equal(typeof instance[data.title], 'function', 'The qtiServiceConfig instances expose a "' + data.title + '" function');
        });


    QUnit.test('qtiServiceConfig factory', function(assert) {
        QUnit.expect(4);

        qtiServiceConfig({
            testDefinition: 'http://tao.dev/mockTestDefinition#123',
            testCompilation: 'http://tao.dev/mockTestCompilation#123',
            serviceCallId: 'http://tao.dev/mockServiceCallId#123'
        });
        assert.ok(true, 'The qtiServiceConfig() factory must not throw an exception when all the required config entries are provided');

        assert.throws(function() {
            qtiServiceConfig({
                testCompilation: 'http://tao.dev/mockTestCompilation#123',
                serviceCallId: 'http://tao.dev/mockServiceCallId#123'
            });
        }, 'The qtiServiceConfig() factory must throw an exception is the required config entry testDefinition is missing');

        assert.throws(function() {
            qtiServiceConfig({
                testDefinition: 'http://tao.dev/mockTestDefinition#123',
                serviceCallId: 'http://tao.dev/mockServiceCallId#123'
            });
        }, 'The qtiServiceConfig() factory must throw an exception is the required config entry testCompilation is missing');

        assert.throws(function() {
            qtiServiceConfig({
                testDefinition: 'http://tao.dev/mockTestDefinition#123',
                testCompilation: 'http://tao.dev/mockTestCompilation#123'
            });
        }, 'The qtiServiceConfig() factory must throw an exception is the required config entry serviceCallId is missing');
    });


    QUnit.test('qtiServiceConfig.getTestDefinition', function(assert) {
        var expectedTestDefinition = 'http://tao.dev/mockTestDefinition#123';
        var config = {
            testDefinition: expectedTestDefinition,
            testCompilation: 'http://tao.dev/mockTestCompilation#123',
            serviceCallId: 'http://tao.dev/mockServiceCallId#123'
        };
        var instance = qtiServiceConfig(config);

        QUnit.expect(1);

        assert.equal(instance.getTestDefinition(), expectedTestDefinition, 'The qtiServiceConfig.getTestDefinition() method has returned the expected value');
    });


    QUnit.test('qtiServiceConfig.getTestCompilation', function(assert) {
        var expectedTestCompilation = 'http://tao.dev/mockTestCompilation#123';
        var config = {
            testDefinition: 'http://tao.dev/mockTestDefinition#123',
            testCompilation: expectedTestCompilation,
            serviceCallId: 'http://tao.dev/mockServiceCallId#123'
        };
        var instance = qtiServiceConfig(config);

        QUnit.expect(1);

        assert.equal(instance.getTestCompilation(), expectedTestCompilation, 'The qtiServiceConfig.getTestCompilation() method has returned the expected value');
    });


    QUnit.test('qtiServiceConfig.getServiceCallId', function(assert) {
        var expectedServiceCallId = 'http://tao.dev/mockServiceCallId#123';
        var config = {
            testDefinition: 'http://tao.dev/mockTestDefinition#123',
            testCompilation: 'http://tao.dev/mockTestCompilation#123',
            serviceCallId: expectedServiceCallId
        };
        var instance = qtiServiceConfig(config);

        QUnit.expect(1);

        assert.equal(instance.getServiceCallId(), expectedServiceCallId, 'The qtiServiceConfig.getServiceCallId() method has returned the expected value');
    });


    QUnit.test('qtiServiceConfig.getServiceController', function(assert) {
        var expectedServiceController = 'MockRunner';
        var config = {
            testDefinition: 'http://tao.dev/mockTestDefinition#123',
            testCompilation: 'http://tao.dev/mockTestCompilation#123',
            serviceCallId: 'http://tao.dev/mockServiceCallId#123'
        };
        var instance = qtiServiceConfig(config);

        QUnit.expect(3);

        assert.notEqual(instance.getServiceController(), expectedServiceController, 'The qtiServiceConfig.getServiceController() method must return the default value');
        assert.ok(!!instance.getServiceController(), 'The qtiServiceConfig.getServiceController() method must not return a null value');

        config.bootstrap = {
            serviceController : expectedServiceController
        };
        instance = qtiServiceConfig(config);
        assert.equal(instance.getServiceController(), expectedServiceController, 'The qtiServiceConfig.getServiceController() method has returned the expected value');
    });


    QUnit.test('qtiServiceConfig.getServiceExtension', function(assert) {
        var expectedServiceExtension = 'MockExtension';
        var config = {
            testDefinition: 'http://tao.dev/mockTestDefinition#123',
            testCompilation: 'http://tao.dev/mockTestCompilation#123',
            serviceCallId: 'http://tao.dev/mockServiceCallId#123'
        };
        var instance = qtiServiceConfig(config);

        QUnit.expect(3);

        assert.notEqual(instance.getServiceExtension(), expectedServiceExtension, 'The qtiServiceConfig.getServiceExtension() method must return the default value');
        assert.ok(!!instance.getServiceExtension(), 'The qtiServiceConfig.getServiceExtension() method must not return a null value');

        config.bootstrap = {
            serviceExtension : expectedServiceExtension
        };
        instance = qtiServiceConfig(config);
        assert.equal(instance.getServiceExtension(), expectedServiceExtension, 'The qtiServiceConfig.getServiceExtension() method has returned the expected value');
    });


    QUnit.test('qtiServiceConfig.getTestActionUrl', function(assert) {
        var config = {
            testDefinition: 'http://tao.dev/mockTestDefinition#123',
            testCompilation: 'http://tao.dev/mockTestCompilation#123',
            serviceCallId: 'http://tao.dev/mockServiceCallId#123',
            bootstrap: {
                serviceController: 'MockRunner',
                serviceExtension: 'MockExtension'
            }
        };
        var actionName = 'MockAction';
        var expectedUrl = urlUtil.route(actionName, config.bootstrap.serviceController, config.bootstrap.serviceExtension, {
            testDefinition : config.testDefinition,
            testCompilation : config.testCompilation,
            serviceCallId : config.serviceCallId
        });
        var instance = qtiServiceConfig(config);

        QUnit.expect(1);

        assert.equal(instance.getTestActionUrl(actionName), expectedUrl, 'The qtiServiceConfig.getTestActionUrl() method has returned the expected value');
    });


    QUnit.test('qtiServiceConfig.getItemActionUrl', function(assert) {
        var itemUri = 'http://tao.dev/mockItem#123';
        var config = {
            testDefinition: 'http://tao.dev/mockTestDefinition#123',
            testCompilation: 'http://tao.dev/mockTestCompilation#123',
            serviceCallId: 'http://tao.dev/mockServiceCallId#123',
            bootstrap: {
                serviceController: 'MockRunner',
                serviceExtension: 'MockExtension'
            }
        };
        var actionName = 'MockAction';
        var expectedUrl = urlUtil.route(actionName, config.bootstrap.serviceController, config.bootstrap.serviceExtension, {
            testDefinition : config.testDefinition,
            testCompilation : config.testCompilation,
            testServiceCallId : config.serviceCallId,
            itemDefinition : itemUri
        });
        var instance = qtiServiceConfig(config);

        QUnit.expect(1);

        assert.equal(instance.getItemActionUrl(itemUri, actionName), expectedUrl, 'The qtiServiceConfig.getItemActionUrl() method has returned the expected value');
    });


    QUnit.test('qtiServiceConfig.getTelemetryUrl', function(assert) {
        var itemUri = 'http://tao.dev/mockItem#123';
        var config = {
            testDefinition: 'http://tao.dev/mockTestDefinition#123',
            testCompilation: 'http://tao.dev/mockTestCompilation#123',
            serviceCallId: 'http://tao.dev/mockServiceCallId#123',
            bootstrap: {
                serviceController: 'MockRunner',
                serviceExtension: 'MockExtension'
            }
        };
        var signalName = 'MockSignal';
        var expectedUrl = urlUtil.route(signalName, config.bootstrap.serviceController, config.bootstrap.serviceExtension, {
            testDefinition : config.testDefinition,
            testCompilation : config.testCompilation,
            testServiceCallId : config.serviceCallId,
            itemDefinition : itemUri
        });
        var instance = qtiServiceConfig(config);

        QUnit.expect(1);

        assert.equal(instance.getTelemetryUrl(itemUri, signalName), expectedUrl, 'The qtiServiceConfig.getTelemetryUrl() method has returned the expected value');
    });


    QUnit.test('qtiServiceConfig.getTimeout', function (assert) {
        var config = {
            testDefinition: 'http://tao.dev/mockTestDefinition#123',
            testCompilation: 'http://tao.dev/mockTestCompilation#123',
            serviceCallId: 'http://tao.dev/mockServiceCallId#123'
        };
        var instance = qtiServiceConfig(config);

        QUnit.expect(2);

        assert.equal(typeof instance.getTimeout(), 'undefined', 'The qtiServiceConfig.getTimeout() method must return an undefined value if no timeout has been set');

        config.timeout = 10;
        instance = qtiServiceConfig(config);
        assert.equal(instance.getTimeout(), 10000, 'The qtiServiceConfig.getTimeout() method has returned the expected value');
    });


    QUnit.test('qtiServiceConfig.getCommunicationConfig', function (assert) {
        var config = {
            testDefinition: 'http://tao.dev/mockTestDefinition#123',
            testCompilation: 'http://tao.dev/mockTestCompilation#123',
            serviceCallId: 'http://tao.dev/mockServiceCallId#123',
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
                    testDefinition : config.testDefinition,
                    testCompilation : config.testCompilation,
                    serviceCallId : config.serviceCallId
                }),
                timeout: undef
            },
            syncActions: []
        };
        var instance = qtiServiceConfig(config);

        QUnit.expect(3);

        assert.deepEqual(instance.getCommunicationConfig(), expected, 'The qtiServiceConfig.getCommunicationConfig() method has returned the default values');

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
        instance = qtiServiceConfig(config);
        assert.deepEqual(instance.getCommunicationConfig(), expected, 'The qtiServiceConfig.getCommunicationConfig() method has returned the expected values');


        config.bootstrap.communication.params.timeout = 5;
        expected.params.timeout = 5000;

        instance = qtiServiceConfig(config);
        assert.deepEqual(instance.getCommunicationConfig(), expected, 'The qtiServiceConfig.getCommunicationConfig() method has returned the expected values');
    });
});
