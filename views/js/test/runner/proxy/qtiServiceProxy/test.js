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
 * Copyright (c) 2016 (original work) Open Assessment Technologies SA ;
 */
/**
 * @author Jean-Sébastien Conan <jean-sebastien.conan@vesperiagroup.com>
 */
define([
    'jquery',
    'lodash',
    'helpers',
    'core/communicator',
    'taoTests/runner/proxy',
    'taoQtiTest/runner/proxy/qtiServiceProxy'
], function($, _, helpers, communicatorFactory, proxyFactory, qtiServiceProxy) {
    'use strict';

    var ajaxBackup;

    QUnit.module('qtiServiceProxy');

    // backup/restore ajax method between each test

    QUnit.testStart(function() {
        ajaxBackup = $.ajax;
    });
    QUnit.testDone(function() {
        $.ajax = ajaxBackup;
    });


    /**
     * A simple AJAX mock factory that fakes a successful ajax call.
     * To use it, just replace $.ajax with the returned value:
     * <pre>$.ajax = ajaxMockSuccess(mockData);</pre>
     * @param {*} response - The mock data used as response
     * @param {Function} [validator] - An optional function called instead of the ajax method
     * @returns {Function}
     */
    function ajaxMockSuccess(response, validator) {
        var deferred = $.Deferred().resolve(response);
        return function() {
            validator && validator.apply(this, arguments);
            return deferred.promise();
        };
    }


    /**
     * A simple AJAX mock factory that fakes a failing ajax call.
     * To use it, just replace $.ajax with the returned value:
     * <pre>$.ajax = ajaxMockError(mockData);</pre>
     * @param {*} response - The mock data used as response
     * @param {Function} [validator] - An optional function called instead of the ajax method
     * @returns {Function}
     */
    function ajaxMockError(response, validator) {
        var deferred = $.Deferred().reject(response);
        return function() {
            validator && validator.apply(this, arguments);
            return deferred.promise();
        };
    }


    QUnit.test('module', function(assert) {
        QUnit.expect(6);
        assert.equal(typeof qtiServiceProxy, 'object', "The qtiServiceProxy module exposes an object");
        assert.equal(typeof proxyFactory, 'function', "The proxyFactory module exposes a function");
        assert.equal(typeof proxyFactory.registerProvider, 'function', "The proxyFactory module exposes a registerProvider method");
        assert.equal(typeof proxyFactory.getProvider, 'function', "The proxyFactory module exposes a getProvider method");

        proxyFactory.registerProvider('qtiServiceProxy', qtiServiceProxy);

        assert.equal(typeof proxyFactory('qtiServiceProxy'), 'object', "The proxyFactory factory has registered the qtiServiceProxy definition and produces an instance");
        assert.notStrictEqual(proxyFactory('qtiServiceProxy'), proxyFactory('qtiServiceProxy'), "The proxyFactory factory provides a different instance of qtiServiceProxy on each call");
    });


    var proxyApi = [
        { name : 'install', title : 'install' },
        { name : 'init', title : 'init' },
        { name : 'destroy', title : 'destroy' },
        { name : 'getTestData', title : 'getTestData' },
        { name : 'getTestContext', title : 'getTestContext' },
        { name : 'getTestMap', title : 'getTestMap' },
        { name : 'sendVariables', title : 'sendVariables' },
        { name : 'callTestAction', title : 'callTestAction' },
        { name : 'getItem', title : 'getItem' },
        { name : 'submitItem', title : 'submitItem' },
        { name : 'callItemAction', title : 'callItemAction' },
        { name : 'telemetry', title : 'telemetry' },
        { name : 'loadCommunicator', title : 'loadCommunicator' }
    ];

    QUnit
        .cases(proxyApi)
        .test('proxy API ', function(data, assert) {
            QUnit.expect(1);
            assert.equal(typeof qtiServiceProxy[data.name], 'function', 'The qtiServiceProxy definition exposes a "' + data.title + '" function');
        });


    var qtiServiceProxyInitChecks = [{
        title: 'success',
        ajaxMock: ajaxMockSuccess,
        token: '1234',
        response: {
            token: '4567',
            success: true
        },
        success: true
    }, {
        title: 'failing data',
        ajaxMock: ajaxMockSuccess,
        token: '1234',
        response: {
            token: '4567',
            success: false
        },
        success: false
    }, {
        title: 'failing request',
        ajaxMock: ajaxMockError,
        token: '1234',
        response: "error",
        success: false
    }] ;

    QUnit
        .cases(qtiServiceProxyInitChecks)
        .asyncTest('qtiServiceProxy.init ', function(caseData, assert) {
            var initConfig = {
                testDefinition: 'http://tao.dev/mockTestDefinition#123',
                testCompilation: 'http://tao.dev/mockTestCompilation#123',
                serviceCallId: 'http://tao.dev/mockServiceCallId#123',
                bootstrap: {
                    serviceController: 'MockRunner',
                    serviceExtension: 'MockExtension'
                }
            };

            var expectedUrl = helpers._url('init', initConfig.bootstrap.serviceController, initConfig.bootstrap.serviceExtension, {
                testDefinition : initConfig.testDefinition,
                testCompilation : initConfig.testCompilation,
                serviceCallId : initConfig.serviceCallId
            });

            QUnit.expect('object' !== typeof caseData.response ? 6 : 7);

            proxyFactory.registerProvider('qtiServiceProxy', qtiServiceProxy);

            $.ajax = caseData.ajaxMock(caseData.response, function(ajaxConfig) {
                assert.equal(ajaxConfig.url, expectedUrl, 'The proxy has called the right service');
            });

            var proxy = proxyFactory('qtiServiceProxy', initConfig);

            proxy.install();

            proxy.getTokenHandler().setToken(caseData.token);

            proxy.on('init', function(promise, config) {
                assert.ok(true, 'The proxy has fired the "init" event');
                assert.equal(typeof promise, 'object', 'The proxy has provided the promise through the "init" event');
                assert.equal(config, initConfig, 'The proxy has provided the config object through the "init" event');
            });

            var result = proxy.init();

            assert.equal(typeof result, 'object', 'The proxy.init method has returned a promise');

            result
                .then(function(data) {
                    if (caseData.success) {
                        assert.equal(data, caseData.response, 'The proxy has returned the expected data');
                    } else {
                        assert.ok(false, 'The proxy must throw an error!');
                    }

                    if (data.token) {
                        assert.equal(proxy.getTokenHandler().getToken(), data.token, 'The proxy must update the security token');
                    }

                    QUnit.start();
                })
                .catch(function(err) {
                    assert.ok(!caseData.success, 'The proxy has thrown an error! #' + err);

                    if (err.token) {
                        assert.equal(proxy.getTokenHandler().getToken(), err.token, 'The proxy must update the security token');
                    }

                    QUnit.start();
                });
        });


    QUnit.asyncTest('qtiServiceProxy.destroy', function(assert) {
        var initConfig = {
            testDefinition: 'http://tao.dev/mockTestDefinition#123',
            testCompilation: 'http://tao.dev/mockTestCompilation#123',
            serviceCallId: 'http://tao.dev/mockServiceCallId#123',
            bootstrap: {
                serviceController: 'MockRunner',
                serviceExtension: 'MockExtension'
            }
        };

        QUnit.expect(5);

        proxyFactory.registerProvider('qtiServiceProxy', qtiServiceProxy);

        $.ajax = ajaxMockSuccess({success: true});

        var proxy = proxyFactory('qtiServiceProxy', initConfig);

        proxy.install();

        proxy.init().then(function () {
            $.ajax = ajaxMockError(false, function() {
                assert.ok(false, 'The proxy must not use an ajax request to destroy the instance!');
            });

            proxy.on('destroy', function(promise) {
                assert.ok(true, 'The proxyFactory has fired the "destroy" event');
                assert.equal(typeof promise, 'object', 'The proxy has provided the promise through the "destroy" event');
            });

            var result = proxy.destroy();

            assert.equal(typeof result, 'object', 'The proxy.destroy method has returned a promise');

            result
                .then(function() {
                    assert.ok(true, 'The proxy has resolved the promise provided by the "destroy" method!');

                    proxy.getTestContext()
                        .then(function() {
                            assert.ok(false, 'The proxy must be initialized');
                            QUnit.start();
                        })
                        .catch(function() {
                            assert.ok(true, 'The proxy must be initialized');
                            QUnit.start();
                        });
                })
                .catch(function() {
                    assert.ok(false, 'The proxy cannot reject the promise provided by the "destroy" method!');
                    QUnit.start();
                });
        }).catch(function () {
            assert.ok(false, 'The proxy has not been properly initialized!');
            QUnit.start();
        });

    });


    var qtiServiceProxyGetTestDataChecks = [{
        title: 'success',
        ajaxMock: ajaxMockSuccess,
        token: '1234',
        response: {
            testData: {},
            token: '4567',
            success: true
        },
        success: true
    }, {
        title: 'failing data',
        ajaxMock: ajaxMockSuccess,
        token: '1234',
        response: {
            token: '4567',
            success: false
        },
        success: false
    }, {
        title: 'failing request',
        ajaxMock: ajaxMockError,
        token: '1234',
        response: "error",
        success: false
    }] ;

    QUnit
        .cases(qtiServiceProxyGetTestDataChecks)
        .asyncTest('qtiServiceProxy.getTestData ', function(caseData, assert) {
            var initConfig = {
                testDefinition: 'http://tao.dev/mockTestDefinition#123',
                testCompilation: 'http://tao.dev/mockTestCompilation#123',
                serviceCallId: 'http://tao.dev/mockServiceCallId#123',
                bootstrap: {
                    serviceController: 'MockRunner',
                    serviceExtension: 'MockExtension'
                }
            };

            var expectedUrl = helpers._url('getTestData', initConfig.bootstrap.serviceController, initConfig.bootstrap.serviceExtension, {
                testDefinition : initConfig.testDefinition,
                testCompilation : initConfig.testCompilation,
                serviceCallId : initConfig.serviceCallId
            });

            QUnit.expect('object' !== typeof caseData.response ? 6 : 7);

            proxyFactory.registerProvider('qtiServiceProxy', qtiServiceProxy);

            $.ajax = ajaxMockSuccess({success: true});

            var proxy = proxyFactory('qtiServiceProxy', initConfig);

            proxy.install();

            proxy.getTokenHandler().setToken(caseData.token);

            proxy.getTestData()
                .then(function() {
                    assert.ok(false, 'The proxy must be initialized');
                })
                .catch(function() {
                    assert.ok(true, 'The proxy must be initialized');
                });

            proxy.init().then(function() {

                $.ajax = caseData.ajaxMock(caseData.response, function(ajaxConfig) {
                    assert.equal(ajaxConfig.url, expectedUrl, 'The proxy has called the right service');
                });

                proxy.on('getTestData', function(promise) {
                    assert.ok(true, 'The proxy has fired the "getTestData" event');
                    assert.equal(typeof promise, 'object', 'The proxy has provided the promise through the "getTestData" event');
                });

                var result = proxy.getTestData();

                assert.equal(typeof result, 'object', 'The proxy.getTestData method has returned a promise');

                result.then(function(data) {
                    if (caseData.success) {
                        assert.equal(data, caseData.response, 'The proxy has returned the expected data');
                    } else {
                        assert.ok(false, 'The proxy must throw an error!');
                    }

                    if (data.token) {
                        assert.equal(proxy.getTokenHandler().getToken(), data.token, 'The proxy must update the security token');
                    }

                    QUnit.start();
                }).catch(function(err) {
                    assert.ok(!caseData.success, 'The proxy has thrown an error! #' + err);

                    if (err.token) {
                        assert.equal(proxy.getTokenHandler().getToken(), err.token, 'The proxy must update the security token');
                    }

                    QUnit.start();
                });
            });
        });


    var qtiServiceProxyGetTestContextChecks = [{
        title: 'success',
        ajaxMock: ajaxMockSuccess,
        token: '1234',
        response: {
            testContext: {},
            token: '4567',
            success: true
        },
        success: true
    }, {
        title: 'failing data',
        ajaxMock: ajaxMockSuccess,
        token: '1234',
        response: {
            token: '4567',
            success: false
        },
        success: false
    }, {
        title: 'failing request',
        ajaxMock: ajaxMockError,
        token: '1234',
        response: "error",
        success: false
    }] ;

    QUnit
        .cases(qtiServiceProxyGetTestContextChecks)
        .asyncTest('qtiServiceProxy.getTestContext ', function(caseData, assert) {
            var initConfig = {
                testDefinition: 'http://tao.dev/mockTestDefinition#123',
                testCompilation: 'http://tao.dev/mockTestCompilation#123',
                serviceCallId: 'http://tao.dev/mockServiceCallId#123',
                bootstrap: {
                    serviceController: 'MockRunner',
                    serviceExtension: 'MockExtension'
                }
            };

            var expectedUrl = helpers._url('getTestContext', initConfig.bootstrap.serviceController, initConfig.bootstrap.serviceExtension, {
                testDefinition : initConfig.testDefinition,
                testCompilation : initConfig.testCompilation,
                serviceCallId : initConfig.serviceCallId
            });

            QUnit.expect('object' !== typeof caseData.response ? 6 : 7);

            proxyFactory.registerProvider('qtiServiceProxy', qtiServiceProxy);

            $.ajax = ajaxMockSuccess({success: true});

            var proxy = proxyFactory('qtiServiceProxy', initConfig);

            proxy.install();

            proxy.getTokenHandler().setToken(caseData.token);

            proxy.getTestContext()
                .then(function() {
                    assert.ok(false, 'The proxy must be initialized');
                })
                .catch(function() {
                    assert.ok(true, 'The proxy must be initialized');
                });

            proxy.init().then(function() {
                $.ajax = caseData.ajaxMock(caseData.response, function(ajaxConfig) {
                    assert.equal(ajaxConfig.url, expectedUrl, 'The proxy has called the right service');
                });

                proxy.on('getTestContext', function(promise) {
                    assert.ok(true, 'The proxy has fired the "getTestContext" event');
                    assert.equal(typeof promise, 'object', 'The proxy has provided the promise through the "getTestContext" event');
                });

                var result = proxy.getTestContext();

                assert.equal(typeof result, 'object', 'The proxy.getTestContext method has returned a promise');

                result.then(function(data) {
                    if (caseData.success) {
                        assert.equal(data, caseData.response, 'The proxy has returned the expected data');
                    } else {
                        assert.ok(false, 'The proxy must throw an error!');
                    }

                    if (data.token) {
                        assert.equal(proxy.getTokenHandler().getToken(), data.token, 'The proxy must update the security token');
                    }

                    QUnit.start();
                }).catch(function(err) {
                    assert.ok(!caseData.success, 'The proxy has thrown an error! #' + err);

                    if (err.token) {
                        assert.equal(proxy.getTokenHandler().getToken(), err.token, 'The proxy must update the security token');
                    }

                    QUnit.start();
                });
            });
        });


    var qtiServiceProxyGetTestMapChecks = [{
        title: 'success',
        ajaxMock: ajaxMockSuccess,
        token: '1234',
        response: {
            testMap: {},
            token: '4567',
            success: true
        },
        success: true
    }, {
        title: 'failing data',
        ajaxMock: ajaxMockSuccess,
        token: '1234',
        response: {
            token: '4567',
            success: false
        },
        success: false
    }, {
        title: 'failing request',
        ajaxMock: ajaxMockError,
        token: '1234',
        response: "error",
        success: false
    }] ;

    QUnit
        .cases(qtiServiceProxyGetTestMapChecks)
        .asyncTest('qtiServiceProxy.getTestMap ', function(caseData, assert) {
            var initConfig = {
                testDefinition: 'http://tao.dev/mockTestDefinition#123',
                testCompilation: 'http://tao.dev/mockTestCompilation#123',
                serviceCallId: 'http://tao.dev/mockServiceCallId#123',
                bootstrap: {
                    serviceController: 'MockRunner',
                    serviceExtension: 'MockExtension'
                }
            };

            var expectedUrl = helpers._url('getTestMap', initConfig.bootstrap.serviceController, initConfig.bootstrap.serviceExtension, {
                testDefinition : initConfig.testDefinition,
                testCompilation : initConfig.testCompilation,
                serviceCallId : initConfig.serviceCallId
            });

            QUnit.expect('object' !== typeof caseData.response ? 6 : 7);

            proxyFactory.registerProvider('qtiServiceProxy', qtiServiceProxy);

            $.ajax = ajaxMockSuccess({success: true});

            var proxy = proxyFactory('qtiServiceProxy', initConfig);

            proxy.install();

            proxy.getTokenHandler().setToken(caseData.token);

            proxy.getTestMap()
                .then(function() {
                    assert.ok(false, 'The proxy must be initialized');
                })
                .catch(function() {
                    assert.ok(true, 'The proxy must be initialized');
                });

            proxy.init().then(function() {
                $.ajax = caseData.ajaxMock(caseData.response, function(ajaxConfig) {
                    assert.equal(ajaxConfig.url, expectedUrl, 'The proxy has called the right service');
                });

                proxy.on('getTestMap', function(promise) {
                    assert.ok(true, 'The proxy has fired the "getTestMap" event');
                    assert.equal(typeof promise, 'object', 'The proxy has provided the promise through the "getTestMap" event');
                });

                var result = proxy.getTestMap();

                assert.equal(typeof result, 'object', 'The proxy.getTestMap method has returned a promise');

                result.then(function(data) {
                    if (caseData.success) {
                        assert.equal(data, caseData.response, 'The proxy has returned the expected data');
                    } else {
                        assert.ok(false, 'The proxy must throw an error!');
                    }

                    if (data.token) {
                        assert.equal(proxy.getTokenHandler().getToken(), data.token, 'The proxy must update the security token');
                    }

                    QUnit.start();
                }).catch(function(err) {
                    assert.ok(!caseData.success, 'The proxy has thrown an error! #' + err);

                    if (err.token) {
                        assert.equal(proxy.getTokenHandler().getToken(), err.token, 'The proxy must update the security token');
                    }

                    QUnit.start();
                });
            });
        });


    var qtiServiceProxySendVariablesChecks = [{
        title: 'success',
        ajaxMock: ajaxMockSuccess,
        token: '1234',
        variables: {
            var1: '1',
            var2: '10'
        },
        response: {
            token: '4567',
            success: true
        },
        success: true
    }, {
        title: 'failing data',
        ajaxMock: ajaxMockSuccess,
        token: '1234',
        variables: {
            var1: '1',
            var2: '10'
        },
        response: {
            token: '4567',
            success: false
        },
        success: false
    }, {
        title: 'failing request',
        ajaxMock: ajaxMockError,
        token: '1234',
        variables: {
            var1: '1',
            var2: '10'
        },
        response: "error",
        success: false
    }] ;

    QUnit
        .cases(qtiServiceProxySendVariablesChecks)
        .asyncTest('qtiServiceProxy.sendVariables ', function(caseData, assert) {
            var initConfig = {
                testDefinition: 'http://tao.dev/mockTestDefinition#123',
                testCompilation: 'http://tao.dev/mockTestCompilation#123',
                serviceCallId: 'http://tao.dev/mockServiceCallId#123',
                bootstrap: {
                    serviceController: 'MockRunner',
                    serviceExtension: 'MockExtension'
                }
            };

            var expectedUrl = helpers._url('storeTraceData', initConfig.bootstrap.serviceController, initConfig.bootstrap.serviceExtension, {
                testDefinition : initConfig.testDefinition,
                testCompilation : initConfig.testCompilation,
                serviceCallId : initConfig.serviceCallId
            });

            QUnit.expect('object' !== typeof caseData.response ? 7 : 8);

            proxyFactory.registerProvider('qtiServiceProxy', qtiServiceProxy);

            $.ajax = ajaxMockSuccess({success: true});

            var proxy = proxyFactory('qtiServiceProxy', initConfig);

            proxy.install();

            proxy.getTokenHandler().setToken(caseData.token);

            proxy.sendVariables(caseData.variables)
                .then(function() {
                    assert.ok(false, 'The proxy must be initialized');
                })
                .catch(function() {
                    assert.ok(true, 'The proxy must be initialized');
                });

            proxy.init().then(function () {
                $.ajax = caseData.ajaxMock(caseData.response, function(ajaxConfig) {
                    assert.equal(ajaxConfig.url, expectedUrl, 'The proxy has called the right service');
                });

                proxy.on('sendVariables', function(promise, variables) {
                    assert.ok(true, 'The proxy has fired the "sendVariables" event');
                    assert.equal(typeof promise, 'object', 'The proxy has provided the promise through the "sendVariables" event');
                    assert.deepEqual(variables, caseData.variables, 'The proxy has provided the variables through the "sendVariables" event');
                });

                var result = proxy.sendVariables(caseData.variables);

                assert.equal(typeof result, 'object', 'The proxy.sendVariables method has returned a promise');

                result.then(function(data) {
                    if (caseData.success) {
                        assert.equal(data, caseData.response, 'The proxy has returned the expected data');
                    } else {
                        assert.ok(false, 'The proxy must throw an error!');
                    }

                    if (data.token) {
                        assert.equal(proxy.getTokenHandler().getToken(), data.token, 'The proxy must update the security token');
                    }

                    QUnit.start();
                }).catch(function(err) {
                    assert.ok(!caseData.success, 'The proxy has thrown an error! #' + err);

                    if (err.token) {
                        assert.equal(proxy.getTokenHandler().getToken(), err.token, 'The proxy must update the security token');
                    }

                    QUnit.start();
                });
            });
        });


    var qtiServiceProxyCallTestActionChecks = [{
        title: 'success',
        ajaxMock: ajaxMockSuccess,
        token: '1234',
        action: 'move',
        params: {
            type: 'forward'
        },
        response: {
            token: '4567',
            success: true
        },
        success: true
    }, {
        title: 'failing data',
        ajaxMock: ajaxMockSuccess,
        token: '1234',
        action: 'move',
        params: {
            type: 'forward'
        },
        response: {
            token: '4567',
            success: false
        },
        success: false
    }, {
        title: 'failing request',
        ajaxMock: ajaxMockError,
        token: '1234',
        action: 'move',
        params: {
            type: 'forward'
        },
        response: "error",
        success: false
    }] ;

    QUnit
        .cases(qtiServiceProxyCallTestActionChecks)
        .asyncTest('qtiServiceProxy.callTestAction ', function(caseData, assert) {
            var initConfig = {
                testDefinition: 'http://tao.dev/mockTestDefinition#123',
                testCompilation: 'http://tao.dev/mockTestCompilation#123',
                serviceCallId: 'http://tao.dev/mockServiceCallId#123',
                bootstrap: {
                    serviceController: 'MockRunner',
                    serviceExtension: 'MockExtension'
                }
            };

            var expectedUrl = helpers._url(caseData.action, initConfig.bootstrap.serviceController, initConfig.bootstrap.serviceExtension, {
                testDefinition : initConfig.testDefinition,
                testCompilation : initConfig.testCompilation,
                serviceCallId : initConfig.serviceCallId
            });

            QUnit.expect('object' !== typeof caseData.response ? 8 : 9);

            proxyFactory.registerProvider('qtiServiceProxy', qtiServiceProxy);

            $.ajax = ajaxMockSuccess({success: true});

            var proxy = proxyFactory('qtiServiceProxy', initConfig);

            proxy.install();

            proxy.getTokenHandler().setToken(caseData.token);

            proxy.callTestAction(caseData.action, caseData.params)
                .then(function() {
                    assert.ok(false, 'The proxy must be initialized');
                })
                .catch(function() {
                    assert.ok(true, 'The proxy must be initialized');
                });

            proxy.init().then(function () {
                $.ajax = caseData.ajaxMock(caseData.response, function(ajaxConfig) {
                    assert.equal(ajaxConfig.url, expectedUrl, 'The proxy has called the right service');
                });

                proxy.on('callTestAction', function(promise, action, params) {
                    assert.ok(true, 'The proxy has fired the "callTestAction" event');
                    assert.equal(typeof promise, 'object', 'The proxy has provided the promise through the "callTestAction" event');
                    assert.equal(action, caseData.action, 'The proxy has provided the action through the "callTestAction" event');
                    assert.deepEqual(params, caseData.params, 'The proxy has provided the params through the "callTestAction" event');
                });

                var result = proxy.callTestAction(caseData.action, caseData.params);

                assert.equal(typeof result, 'object', 'The proxy.callTestAction method has returned a promise');

                result.then(function(data) {
                    if (caseData.success) {
                        assert.equal(data, caseData.response, 'The proxy has returned the expected data');
                    } else {
                        assert.ok(false, 'The proxy must throw an error!');
                    }

                    if (data.token) {
                        assert.equal(proxy.getTokenHandler().getToken(), data.token, 'The proxy must update the security token');
                    }

                    QUnit.start();
                }).catch(function(err) {
                    assert.ok(!caseData.success, 'The proxy has thrown an error! #' + err);

                    if (err.token) {
                        assert.equal(proxy.getTokenHandler().getToken(), err.token, 'The proxy must update the security token');
                    }

                    QUnit.start();
                });
            });
        });


    var qtiServiceProxyGetItemChecks = [{
        title: 'success',
        ajaxMock: ajaxMockSuccess,
        uri: 'http://tao.dev/mockItemDefinition#123',
        token: '1234',
        response: {
            itemData: {
                interactions: [{}]
            },
            itemState: {
                response: [{}]
            },
            token: '4567',
            success: true
        },
        success: true
    }, {
        title: 'failing data',
        ajaxMock: ajaxMockSuccess,
        uri: 'http://tao.dev/mockItemDefinition#123',
        token: '1234',
        response: {
            token: '4567',
            success: false
        },
        success: false
    }, {
        title: 'failing request',
        ajaxMock: ajaxMockError,
        uri: 'http://tao.dev/mockItemDefinition#123',
        token: '1234',
        response: "error",
        success: false
    }] ;

    QUnit
        .cases(qtiServiceProxyGetItemChecks)
        .asyncTest('qtiServiceProxy.getItem ', function(caseData, assert) {
            var initConfig = {
                testDefinition: 'http://tao.dev/mockTestDefinition#123',
                testCompilation: 'http://tao.dev/mockTestCompilation#123',
                serviceCallId: 'http://tao.dev/mockServiceCallId#123',
                bootstrap: {
                    serviceController: 'MockRunner',
                    serviceExtension: 'MockExtension'
                }
            };

            var expectedUrl = helpers._url('getItem', initConfig.bootstrap.serviceController, initConfig.bootstrap.serviceExtension, {
                testDefinition : initConfig.testDefinition,
                testCompilation : initConfig.testCompilation,
                testServiceCallId : initConfig.serviceCallId,
                itemDefinition : caseData.uri
            });

            QUnit.expect('object' !== typeof caseData.response ? 7 : 8);

            proxyFactory.registerProvider('qtiServiceProxy', qtiServiceProxy);

            $.ajax = ajaxMockSuccess({success: true});

            var proxy = proxyFactory('qtiServiceProxy', initConfig);

            proxy.install();

            proxy.getTokenHandler().setToken(caseData.token);

            proxy.getItem(caseData.uri)
                .then(function() {
                    assert.ok(false, 'The proxy must be initialized');
                })
                .catch(function() {
                    assert.ok(true, 'The proxy must be initialized');
                });

            proxy.init().then(function () {
                $.ajax = caseData.ajaxMock(caseData.response, function(ajaxConfig) {
                    assert.equal(ajaxConfig.url, expectedUrl, 'The proxy has called the right service');
                });

                proxy.on('getItem', function(promise, uri) {
                    assert.ok(true, 'The proxy has fired the "getItem" event');
                    assert.equal(typeof promise, 'object', 'The proxy has provided the promise through the "getItem" event');
                    assert.equal(uri, caseData.uri, 'The proxy has provided the URI through the "getItem" event');
                });

                var result = proxy.getItem(caseData.uri);

                assert.equal(typeof result, 'object', 'The proxy.getItem method has returned a promise');

                result.then(function(data) {
                    if (caseData.success) {
                        assert.equal(data, caseData.response, 'The proxy has returned the expected data');
                    } else {
                        assert.ok(false, 'The proxy must throw an error!');
                    }

                    if (data.token) {
                        assert.equal(proxy.getTokenHandler().getToken(), data.token, 'The proxy must update the security token');
                    }

                    QUnit.start();
                }).catch(function(err) {
                    assert.ok(!caseData.success, 'The proxy has thrown an error! #' + err);

                    if (err.token) {
                        assert.equal(proxy.getTokenHandler().getToken(), err.token, 'The proxy must update the security token');
                    }

                    QUnit.start();
                });
            });
        });


    var qtiServiceProxySubmitItemChecks = [{
        title: 'success',
        ajaxMock: ajaxMockSuccess,
        uri: 'http://tao.dev/mockItemDefinition#123',
        itemState: {response: [{}]},
        itemResponse: {response: [{}]},
        token: '1234',
        response: {
            token: '4567',
            success: true
        },
        success: true
    }, {
        title: 'failing data',
        ajaxMock: ajaxMockSuccess,
        uri: 'http://tao.dev/mockItemDefinition#123',
        itemState: {response: [{}]},
        itemResponse: {response: [{}]},
        token: '1234',
        response: {
            token: '4567',
            success: false
        },
        success: false
    }, {
        title: 'failing request',
        ajaxMock: ajaxMockError,
        uri: 'http://tao.dev/mockItemDefinition#123',
        itemState: {response: [{}]},
        itemResponse: {response: [{}]},
        token: '1234',
        response: "error",
        success: false
    }] ;

    QUnit
        .cases(qtiServiceProxySubmitItemChecks)
        .asyncTest('qtiServiceProxy.submitItem ', function(caseData, assert) {
            var initConfig = {
                testDefinition: 'http://tao.dev/mockTestDefinition#123',
                testCompilation: 'http://tao.dev/mockTestCompilation#123',
                serviceCallId: 'http://tao.dev/mockServiceCallId#123',
                bootstrap: {
                    serviceController: 'MockRunner',
                    serviceExtension: 'MockExtension'
                }
            };

            var expectedUrl = helpers._url('submitItem', initConfig.bootstrap.serviceController, initConfig.bootstrap.serviceExtension, {
                testDefinition : initConfig.testDefinition,
                testCompilation : initConfig.testCompilation,
                testServiceCallId : initConfig.serviceCallId,
                itemDefinition : caseData.uri
            });

            QUnit.expect('object' !== typeof caseData.response ? 9 : 10);

            proxyFactory.registerProvider('qtiServiceProxy', qtiServiceProxy);

            $.ajax = ajaxMockSuccess({success: true});

            var proxy = proxyFactory('qtiServiceProxy', initConfig);

            proxy.install();

            proxy.getTokenHandler().setToken(caseData.token);

            proxy.submitItem(caseData.uri, caseData.itemState, caseData.itemResponse)
                .then(function() {
                    assert.ok(false, 'The proxy must be initialized');
                })
                .catch(function() {
                    assert.ok(true, 'The proxy must be initialized');
                });

            proxy.init().then(function () {
                $.ajax = caseData.ajaxMock(caseData.response, function(ajaxConfig) {
                    assert.equal(ajaxConfig.url, expectedUrl, 'The proxy has called the right service');
                });

                proxy.on('submitItem', function(promise, uri, state, response) {
                    assert.ok(true, 'The proxy has fired the "submitItem" event');
                    assert.equal(typeof promise, 'object', 'The proxy has provided the promise through the "submitItem" event');
                    assert.equal(uri, caseData.uri, 'The proxy has provided the URI through the "submitItem" event');
                    assert.deepEqual(state, caseData.itemState, 'The proxy has provided the state through the "submitItem" event');
                    assert.deepEqual(response, caseData.itemResponse, 'The proxy has provided the response through the "submitItem" event');
                });

                var result = proxy.submitItem(caseData.uri, caseData.itemState, caseData.itemResponse);

                assert.equal(typeof result, 'object', 'The proxy.submitItem method has returned a promise');

                result.then(function(data) {
                    if (caseData.success) {
                        assert.equal(data, caseData.response, 'The proxy has returned the expected data');
                    } else {
                        assert.ok(false, 'The proxy must throw an error!');
                    }

                    if (data.token) {
                        assert.equal(proxy.getTokenHandler().getToken(), data.token, 'The proxy must update the security token');
                    }

                    QUnit.start();
                }).catch(function(err) {
                    assert.ok(!caseData.success, 'The proxy has thrown an error! #' + err);

                    if (err.token) {
                        assert.equal(proxy.getTokenHandler().getToken(), err.token, 'The proxy must update the security token');
                    }

                    QUnit.start();
                });
            });
        });


    var qtiServiceProxyCallItemActionChecks = [{
        title: 'success',
        ajaxMock: ajaxMockSuccess,
        uri: 'http://tao.dev/mockItemDefinition#123',
        action: 'comment',
        params: {
            text: 'lorem ipsum'
        },
        token: '1234',
        response: {
            token: '4567',
            success: true
        },
        success: true
    }, {
        title: 'failing data',
        ajaxMock: ajaxMockSuccess,
        uri: 'http://tao.dev/mockItemDefinition#123',
        action: 'comment',
        params: {
            text: 'lorem ipsum'
        },
        token: '1234',
        response: {
            token: '4567',
            success: false
        },
        success: false
    }, {
        title: 'failing request',
        ajaxMock: ajaxMockError,
        uri: 'http://tao.dev/mockItemDefinition#123',
        action: 'comment',
        params: {
            text: 'lorem ipsum'
        },
        token: '1234',
        response: "error",
        success: false
    }] ;

    QUnit
        .cases(qtiServiceProxyCallItemActionChecks)
        .asyncTest('qtiServiceProxy.callItemAction ', function(caseData, assert) {
            var initConfig = {
                testDefinition: 'http://tao.dev/mockTestDefinition#123',
                testCompilation: 'http://tao.dev/mockTestCompilation#123',
                serviceCallId: 'http://tao.dev/mockServiceCallId#123',
                bootstrap: {
                    serviceController: 'MockRunner',
                    serviceExtension: 'MockExtension'
                }
            };

            var expectedUrl = helpers._url(caseData.action, initConfig.bootstrap.serviceController, initConfig.bootstrap.serviceExtension, {
                testDefinition : initConfig.testDefinition,
                testCompilation : initConfig.testCompilation,
                testServiceCallId : initConfig.serviceCallId,
                itemDefinition : caseData.uri
            });

            QUnit.expect('object' !== typeof caseData.response ? 9 : 10);

            proxyFactory.registerProvider('qtiServiceProxy', qtiServiceProxy);

            $.ajax = ajaxMockSuccess({success: true});

            var proxy = proxyFactory('qtiServiceProxy', initConfig);

            proxy.install();

            proxy.getTokenHandler().setToken(caseData.token);

            proxy.callItemAction(caseData.uri, caseData.action, caseData.params)
                .then(function() {
                    assert.ok(false, 'The proxy must be initialized');
                })
                .catch(function() {
                    assert.ok(true, 'The proxy must be initialized');
                });

            proxy.init().then(function () {
                $.ajax = caseData.ajaxMock(caseData.response, function(ajaxConfig) {
                    assert.equal(ajaxConfig.url, expectedUrl, 'The proxy has called the right service');
                });

                proxy.on('callItemAction', function(promise, uri, action, params) {
                    assert.ok(true, 'The proxy has fired the "callItemAction" event');
                    assert.equal(typeof promise, 'object', 'The proxy has provided the promise through the "callItemAction" event');
                    assert.equal(uri, caseData.uri, 'The proxy has provided the URI through the "callItemAction" event');
                    assert.equal(action, caseData.action, 'The proxy has provided the action through the "callItemAction" event');
                    assert.deepEqual(params, caseData.params, 'The proxy has provided the params through the "callItemAction" event');
                });

                var result = proxy.callItemAction(caseData.uri, caseData.action, caseData.params);

                assert.equal(typeof result, 'object', 'The proxy.callItemAction method has returned a promise');

                result.then(function(data) {
                    if (caseData.success) {
                        assert.equal(data, caseData.response, 'The proxy has returned the expected data');
                    } else {
                        assert.ok(false, 'The proxy must throw an error!');
                    }

                    if (data.token) {
                        assert.equal(proxy.getTokenHandler().getToken(), data.token, 'The proxy must update the security token');
                    }

                    QUnit.start();
                }).catch(function(err) {
                    assert.ok(!caseData.success, 'The proxy has thrown an error! #' + err);

                    if (err.token) {
                        assert.equal(proxy.getTokenHandler().getToken(), err.token, 'The proxy must update the security token');
                    }

                    QUnit.start();
                });
            });
        });


    var qtiServiceProxyTelemetryChecks = [{
        title: 'success',
        ajaxMock: ajaxMockSuccess,
        uri: 'http://tao.dev/mockItemDefinition#123',
        signal: 'hello',
        params: {
            text: 'lorem ipsum'
        },
        token: '1234',
        response: {
            success: true
        },
        success: true
    }, {
        title: 'failing data',
        ajaxMock: ajaxMockSuccess,
        uri: 'http://tao.dev/mockItemDefinition#123',
        signal: 'hello',
        params: {
            text: 'lorem ipsum'
        },
        token: '1234',
        response: {
            success: false
        },
        success: false
    }, {
        title: 'failing request',
        ajaxMock: ajaxMockError,
        uri: 'http://tao.dev/mockItemDefinition#123',
        signal: 'hello',
        params: {
            text: 'lorem ipsum'
        },
        token: '1234',
        response: "error",
        success: false
    }] ;

    QUnit
        .cases(qtiServiceProxyTelemetryChecks)
        .asyncTest('qtiServiceProxy.telemetry ', function(caseData, assert) {
            var initConfig = {
                testDefinition: 'http://tao.dev/mockTestDefinition#123',
                testCompilation: 'http://tao.dev/mockTestCompilation#123',
                serviceCallId: 'http://tao.dev/mockServiceCallId#123',
                bootstrap: {
                    serviceController: 'MockRunner',
                    serviceExtension: 'MockExtension'
                }
            };

            var expectedUrl = helpers._url(caseData.signal, initConfig.bootstrap.serviceController, initConfig.bootstrap.serviceExtension, {
                testDefinition : initConfig.testDefinition,
                testCompilation : initConfig.testCompilation,
                testServiceCallId : initConfig.serviceCallId,
                itemDefinition : caseData.uri
            });

            QUnit.expect(11);

            proxyFactory.registerProvider('qtiServiceProxy', qtiServiceProxy);

            $.ajax = ajaxMockSuccess({success: true});

            var proxy = proxyFactory('qtiServiceProxy', initConfig);

            proxy.install();

            proxy.telemetry(caseData.uri, caseData.signal, caseData.params)
                .then(function() {
                    assert.ok(false, 'The proxy must be initialized');
                })
                .catch(function() {
                    assert.ok(true, 'The proxy must be initialized');
                });

            proxy.init().then(function () {
                proxy.getTokenHandler().setToken(caseData.token);

                $.ajax = caseData.ajaxMock(caseData.response, function(ajaxConfig) {
                    assert.equal(ajaxConfig.url, expectedUrl, 'The proxy has called the right service');
                });

                proxy.on('telemetry', function(promise, uri, signal, params) {
                    assert.ok(true, 'The proxy has fired the "telemetry" event');
                    assert.equal(typeof promise, 'object', 'The proxy has provided the promise through the "telemetry" event');
                    assert.equal(uri, caseData.uri, 'The proxy has provided the URI through the "telemetry" event');
                    assert.equal(signal, caseData.signal, 'The proxy has provided the signal through the "telemetry" event');
                    assert.deepEqual(params, caseData.params, 'The proxy has provided the params through the "telemetry" event');
                });

                var result = proxy.telemetry(caseData.uri, caseData.signal, caseData.params);

                assert.equal(typeof result, 'object', 'The proxy.telemetry method has returned a promise');

                result.then(function(data) {
                    if (caseData.success) {
                        assert.equal(data, caseData.response, 'The proxy has returned the expected data');
                    } else {
                        assert.ok(false, 'The proxy must throw an error!');
                    }

                    assert.equal(data.token, undefined, 'No token must be received');
                    assert.equal(proxy.getTokenHandler().getToken(), caseData.token, 'The proxy must not update the security token');

                    QUnit.start();
                }).catch(function(err) {
                    assert.ok(!caseData.success, 'The proxy has thrown an error! #' + err);

                    assert.equal(err.token, undefined, 'No token must be received');
                    assert.equal(proxy.getTokenHandler().getToken(), caseData.token, 'The proxy must not update the security token');

                    QUnit.start();
                });
            });
        });


    QUnit.asyncTest('qtiServiceProxy.getCommunicator #enabled', function(assert) {
        var initConfig = {
            testDefinition: 'http://tao.dev/mockTestDefinition#123',
            testCompilation: 'http://tao.dev/mockTestCompilation#123',
            serviceCallId: 'http://tao.dev/mockServiceCallId#123',
            bootstrap: {
                serviceController: 'MockRunner',
                serviceExtension: 'MockExtension',
                communication: {
                    enabled: true,
                    type: 'mock',
                    extension: 'MockRunner',
                    controller: 'MockCommunicator',
                    action: 'messages',
                    service: null,
                    params: {
                        interval: 30,
                        timeout: 30
                    }
                }
            }
        };

        var mockCommunicator = {
            on: function() {
                return this;
            },
            init: function() {
                assert.ok(true, 'The communicator is initialized');
                return Promise.resolve();
            },
            open: function() {
                assert.ok(true, 'The communicator is open');
                return Promise.resolve();
            },
            close: function() {
                assert.ok(true, 'The communicator is closed');
                return Promise.resolve();
            },
            destroy: function() {
                assert.ok(true, 'The communicator must be destroyed when the proxy is destroying');
                return Promise.resolve();
            }
        };

        QUnit.expect(8);

        communicatorFactory.registerProvider(initConfig.bootstrap.communication.type, mockCommunicator);
        proxyFactory.registerProvider('qtiServiceProxy', qtiServiceProxy);

        $.ajax = ajaxMockSuccess({success: true});

        var proxy = proxyFactory('qtiServiceProxy', initConfig);

        proxy.install();

        proxy.getCommunicator()
            .then(function() {
                assert.ok(false, 'The proxy must be initialized');
            })
            .catch(function() {
                assert.ok(true, 'The proxy must be initialized');
            });

        proxy.init().then(function () {
            proxy.getCommunicator().then(function(communicator) {
                var theCommunicator = communicator;
                assert.ok(!!communicator, 'The proxy has built a communicator handler');
                assert.equal(typeof communicator, 'object', 'The proxy has built a communicator handler');

                proxy.getCommunicator().then(function(communicator) {
                    assert.equal(communicator, theCommunicator, 'The proxy returned the already built communicator handler');

                    proxy.destroy()
                        .then(function() {
                            QUnit.start();
                        });
                });
            });
        });
    });


    QUnit.asyncTest('qtiServiceProxy.getCommunicator #disabled', function(assert) {
        var initConfig = {
            testDefinition: 'http://tao.dev/mockTestDefinition#123',
            testCompilation: 'http://tao.dev/mockTestCompilation#123',
            serviceCallId: 'http://tao.dev/mockServiceCallId#123',
            bootstrap: {
                serviceController: 'MockRunner',
                serviceExtension: 'MockExtension',
                communication: {
                    enabled: false,
                    type: 'mock',
                    extension: 'MockRunner',
                    controller: 'MockCommunicator',
                    action: 'messages',
                    service: null,
                    params: {
                        interval: 30,
                        timeout: 30
                    }
                }
            }
        };

        QUnit.expect(3);

        proxyFactory.registerProvider('qtiServiceProxy', qtiServiceProxy);

        $.ajax = ajaxMockSuccess({success: true});

        var proxy = proxyFactory('qtiServiceProxy', initConfig);

        proxy.install();

        proxy.getCommunicator()
            .then(function() {
                assert.ok(false, 'The proxy must be initialized');
            })
            .catch(function() {
                assert.ok(true, 'The proxy must be initialized');
            });

        proxy.init().then(function () {
            proxy.getCommunicator().catch(function() {
                assert.ok(true, 'The communicator cannot be provided as it is disabled');

                proxy.getCommunicator().catch(function(communicator) {
                    assert.ok(true, 'The communicator cannot be provided as it is still disabled');

                    proxy.destroy()
                        .then(function() {
                            QUnit.start();
                        });
                });
            });
        });
    });

});
