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
    'taoTests/runner/proxy',
    'taoQtiTest/runner/proxy/qtiServiceProxy'
], function($, _, helpers, proxyFactory, qtiServiceProxy) {
    'use strict';

    QUnit.module('qtiServiceProxy');


    // backup/restore ajax method between each test
    var ajaxBackup;
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


    QUnit.test('module', 6, function(assert) {
        assert.equal(typeof qtiServiceProxy, 'object', "The qtiServiceProxy module exposes an object");
        assert.equal(typeof proxyFactory, 'function', "The proxyFactory module exposes a function");
        assert.equal(typeof proxyFactory.registerProxy, 'function', "The proxyFactory module exposes a registerProxy method");
        assert.equal(typeof proxyFactory.getProxy, 'function', "The proxyFactory module exposes a getProxy method");

        proxyFactory.registerProxy('qtiServiceProxy', qtiServiceProxy);

        assert.equal(typeof proxyFactory('qtiServiceProxy'), 'object', "The proxyFactory factory has registered the qtiServiceProxy definition and produces an instance");
        assert.notStrictEqual(proxyFactory('qtiServiceProxy'), proxyFactory('qtiServiceProxy'), "The proxyFactory factory provides a different instance of qtiServiceProxy on each call");
    });


    // small coverage check to facilitate dev of unit tests
    var coverage = {};
    QUnit.moduleDone(function() {
        _.forEach(proxyApi, function(api) {
            if (!coverage[api.name]) {
                console.log('Missing unit test for method qtiServiceProxy.' + api.name);
            }
        });
    });


    var proxyApi = [
        { name : 'init', title : 'init' },
        { name : 'destroy', title : 'destroy' },
        { name : 'getTestData', title : 'getTestData' },
        { name : 'getTestContext', title : 'getTestContext' },
        { name : 'getTestMap', title : 'getTestMap' },
        { name : 'callTestAction', title : 'callTestAction' },
        { name : 'getItemData', title : 'getItemData' },
        { name : 'getItemState', title : 'getItemState' },
        { name : 'submitItemState', title : 'submitItemState' },
        { name : 'storeItemResponse', title : 'storeItemResponse' },
        { name : 'callItemAction', title : 'callItemAction' }
    ];

    QUnit
        .cases(proxyApi)
        .test('proxy API ', 1, function(data, assert) {
            assert.equal(typeof qtiServiceProxy[data.name], 'function', 'The qtiServiceProxy definition exposes a "' + data.title + '" function');
        });


    var qtiServiceProxyInitChecks = [{
        title: 'success',
        ajaxMock: ajaxMockSuccess,
        response: {
            success: true
        },
        success: true
    }, {
        title: 'failing data',
        ajaxMock: ajaxMockSuccess,
        response: {
            success: false
        },
        success: false
    }, {
        title: 'failing request',
        ajaxMock: ajaxMockError,
        response: "error",
        success: false
    }] ;

    QUnit
        .cases(qtiServiceProxyInitChecks)
        .asyncTest('qtiServiceProxy.init ', 6, function(caseData, assert) {
            var initConfig = {
                testDefinition: 'http://tao.dev/mockTestDefinition#123',
                testCompilation: 'http://tao.dev/mockTestCompilation#123',
                serviceCallId: 'http://tao.dev/mockServiceCallId#123',
                serviceController: 'MockRunner',
                serviceExtension: 'taoRunnerMock'
            };

            var expectedUrl = helpers._url('init', initConfig.serviceController, initConfig.serviceExtension, {
                testDefinition : initConfig.testDefinition,
                testCompilation : initConfig.testCompilation,
                serviceCallId : initConfig.serviceCallId
            });

            coverage.init = true;

            proxyFactory.registerProxy('qtiServiceProxy', qtiServiceProxy);

            $.ajax = caseData.ajaxMock(caseData.response, function(ajaxConfig) {
                assert.equal(ajaxConfig.url, expectedUrl, 'The proxy has called the right service');
            });

            var proxy = proxyFactory('qtiServiceProxy', initConfig);

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
                    QUnit.start();
                })
                .catch(function(err) {
                    assert.ok(!caseData.success, 'The proxy has thrown an error! #' + err);
                    QUnit.start();
                });
        });


    QUnit.asyncTest('qtiServiceProxy.destroy', 4, function(assert) {
        var initConfig = {
            testDefinition: 'http://tao.dev/mockTestDefinition#123',
            testCompilation: 'http://tao.dev/mockTestCompilation#123',
            serviceCallId: 'http://tao.dev/mockServiceCallId#123',
            serviceController: 'MockRunner',
            serviceExtension: 'taoRunnerMock'
        };

        coverage.destroy = true;

        proxyFactory.registerProxy('qtiServiceProxy', qtiServiceProxy);

        $.ajax = ajaxMockSuccess({success: true});

        var proxy = proxyFactory('qtiServiceProxy', initConfig);

        proxy.init();

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
                QUnit.start();
            })
            .catch(function() {
                assert.ok(false, 'The proxy cannot reject the promise provided by the "destroy" method!');
                QUnit.start();
            });
    });


    var qtiServiceProxyGetTestDataChecks = [{
        title: 'success',
        ajaxMock: ajaxMockSuccess,
        response: {
            testData: {},
            success: true
        },
        success: true
    }, {
        title: 'failing data',
        ajaxMock: ajaxMockSuccess,
        response: {
            success: false
        },
        success: false
    }, {
        title: 'failing request',
        ajaxMock: ajaxMockError,
        response: "error",
        success: false
    }] ;

    QUnit
        .cases(qtiServiceProxyGetTestDataChecks)
        .asyncTest('qtiServiceProxy.getTestData ', 5, function(caseData, assert) {
            var initConfig = {
                testDefinition: 'http://tao.dev/mockTestDefinition#123',
                testCompilation: 'http://tao.dev/mockTestCompilation#123',
                serviceCallId: 'http://tao.dev/mockServiceCallId#123',
                serviceController: 'MockRunner',
                serviceExtension: 'taoRunnerMock'
            };

            var expectedUrl = helpers._url('getTestData', initConfig.serviceController, initConfig.serviceExtension, {
                testDefinition : initConfig.testDefinition,
                testCompilation : initConfig.testCompilation,
                serviceCallId : initConfig.serviceCallId
            });

            coverage.getTestData = true;

            proxyFactory.registerProxy('qtiServiceProxy', qtiServiceProxy);

            $.ajax = ajaxMockSuccess({success: true});

            var proxy = proxyFactory('qtiServiceProxy', initConfig);

            proxy.init();

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
                QUnit.start();
            }).catch(function(err) {
                assert.ok(!caseData.success, 'The proxy has thrown an error! #' + err);
                QUnit.start();
            });
        });


    var qtiServiceProxyGetTestContextChecks = [{
        title: 'success',
        ajaxMock: ajaxMockSuccess,
        response: {
            testContext: {},
            success: true
        },
        success: true
    }, {
        title: 'failing data',
        ajaxMock: ajaxMockSuccess,
        response: {
            success: false
        },
        success: false
    }, {
        title: 'failing request',
        ajaxMock: ajaxMockError,
        response: "error",
        success: false
    }] ;

    QUnit
        .cases(qtiServiceProxyGetTestContextChecks)
        .asyncTest('qtiServiceProxy.getTestContext ', 5, function(caseData, assert) {
            var initConfig = {
                testDefinition: 'http://tao.dev/mockTestDefinition#123',
                testCompilation: 'http://tao.dev/mockTestCompilation#123',
                serviceCallId: 'http://tao.dev/mockServiceCallId#123',
                serviceController: 'MockRunner',
                serviceExtension: 'taoRunnerMock'
            };

            var expectedUrl = helpers._url('getTestContext', initConfig.serviceController, initConfig.serviceExtension, {
                testDefinition : initConfig.testDefinition,
                testCompilation : initConfig.testCompilation,
                serviceCallId : initConfig.serviceCallId
            });

            coverage.getTestContext = true;

            proxyFactory.registerProxy('qtiServiceProxy', qtiServiceProxy);

            $.ajax = ajaxMockSuccess({success: true});

            var proxy = proxyFactory('qtiServiceProxy', initConfig);

            proxy.init();

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
                QUnit.start();
            }).catch(function(err) {
                assert.ok(!caseData.success, 'The proxy has thrown an error! #' + err);
                QUnit.start();
            });
        });


    var qtiServiceProxyGetTestMapChecks = [{
        title: 'success',
        ajaxMock: ajaxMockSuccess,
        response: {
            testMap: {},
            success: true
        },
        success: true
    }, {
        title: 'failing data',
        ajaxMock: ajaxMockSuccess,
        response: {
            success: false
        },
        success: false
    }, {
        title: 'failing request',
        ajaxMock: ajaxMockError,
        response: "error",
        success: false
    }] ;

    QUnit
        .cases(qtiServiceProxyGetTestMapChecks)
        .asyncTest('qtiServiceProxy.getTestMap ', 5, function(caseData, assert) {
            var initConfig = {
                testDefinition: 'http://tao.dev/mockTestDefinition#123',
                testCompilation: 'http://tao.dev/mockTestCompilation#123',
                serviceCallId: 'http://tao.dev/mockServiceCallId#123',
                serviceController: 'MockRunner',
                serviceExtension: 'taoRunnerMock'
            };

            var expectedUrl = helpers._url('getTestMap', initConfig.serviceController, initConfig.serviceExtension, {
                testDefinition : initConfig.testDefinition,
                testCompilation : initConfig.testCompilation,
                serviceCallId : initConfig.serviceCallId
            });

            coverage.getTestMap = true;

            proxyFactory.registerProxy('qtiServiceProxy', qtiServiceProxy);

            $.ajax = ajaxMockSuccess({success: true});

            var proxy = proxyFactory('qtiServiceProxy', initConfig);

            proxy.init();

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
                QUnit.start();
            }).catch(function(err) {
                assert.ok(!caseData.success, 'The proxy has thrown an error! #' + err);
                QUnit.start();
            });
        });


    var qtiServiceProxyCallTestActionChecks = [{
        title: 'success',
        ajaxMock: ajaxMockSuccess,
        action: 'move',
        params: {
            type: 'forward'
        },
        response: {
            success: true
        },
        success: true
    }, {
        title: 'failing data',
        ajaxMock: ajaxMockSuccess,
        action: 'move',
        params: {
            type: 'forward'
        },
        response: {
            success: false
        },
        success: false
    }, {
        title: 'failing request',
        ajaxMock: ajaxMockError,
        action: 'move',
        params: {
            type: 'forward'
        },
        response: "error",
        success: false
    }] ;

    QUnit
        .cases(qtiServiceProxyCallTestActionChecks)
        .asyncTest('qtiServiceProxy.callTestAction ', 7, function(caseData, assert) {
            var initConfig = {
                testDefinition: 'http://tao.dev/mockTestDefinition#123',
                testCompilation: 'http://tao.dev/mockTestCompilation#123',
                serviceCallId: 'http://tao.dev/mockServiceCallId#123',
                serviceController: 'MockRunner',
                serviceExtension: 'taoRunnerMock'
            };

            var expectedUrl = helpers._url(caseData.action, initConfig.serviceController, initConfig.serviceExtension, {
                testDefinition : initConfig.testDefinition,
                testCompilation : initConfig.testCompilation,
                serviceCallId : initConfig.serviceCallId
            });

            coverage.callTestAction = true;

            proxyFactory.registerProxy('qtiServiceProxy', qtiServiceProxy);

            $.ajax = ajaxMockSuccess({success: true});

            var proxy = proxyFactory('qtiServiceProxy', initConfig);

            proxy.init();

            $.ajax = caseData.ajaxMock(caseData.response, function(ajaxConfig) {
                assert.equal(ajaxConfig.url, expectedUrl, 'The proxy has called the right service');
            });

            proxy.on('callTestAction', function(promise, action, params) {
                assert.ok(true, 'The proxy has fired the "callTestAction" event');
                assert.equal(typeof promise, 'object', 'The proxy has provided the promise through the "callTestAction" event');
                assert.equal(action, caseData.action, 'The proxy has provided the action through the "callTestAction" event');
                assert.equal(params, caseData.params, 'The proxy has provided the params through the "callTestAction" event');
            });

            var result = proxy.callTestAction(caseData.action, caseData.params);

            assert.equal(typeof result, 'object', 'The proxy.callTestAction method has returned a promise');

            result.then(function(data) {
                if (caseData.success) {
                    assert.equal(data, caseData.response, 'The proxy has returned the expected data');
                } else {
                    assert.ok(false, 'The proxy must throw an error!');
                }
                QUnit.start();
            }).catch(function(err) {
                assert.ok(!caseData.success, 'The proxy has thrown an error! #' + err);
                QUnit.start();
            });
        });


    var qtiServiceProxyGetItemDataChecks = [{
        title: 'success',
        ajaxMock: ajaxMockSuccess,
        uri: 'http://tao.dev/mockItemDefinition#123',
        response: {
            interactions: [{}],
            success: true
        },
        success: true
    }, {
        title: 'failing data',
        ajaxMock: ajaxMockSuccess,
        uri: 'http://tao.dev/mockItemDefinition#123',
        response: {
            success: false
        },
        success: false
    }, {
        title: 'failing request',
        ajaxMock: ajaxMockError,
        uri: 'http://tao.dev/mockItemDefinition#123',
        response: "error",
        success: false
    }] ;

    QUnit
        .cases(qtiServiceProxyGetItemDataChecks)
        .asyncTest('qtiServiceProxy.getItemData ', 6, function(caseData, assert) {
            var initConfig = {
                testDefinition: 'http://tao.dev/mockTestDefinition#123',
                testCompilation: 'http://tao.dev/mockTestCompilation#123',
                serviceCallId: 'http://tao.dev/mockServiceCallId#123',
                serviceController: 'MockRunner',
                serviceExtension: 'taoRunnerMock'
            };

            var expectedUrl = helpers._url('getItemData', initConfig.serviceController, initConfig.serviceExtension, {
                testDefinition : initConfig.testDefinition,
                testCompilation : initConfig.testCompilation,
                testServiceCallId : initConfig.serviceCallId,
                itemDefinition : caseData.uri
            });

            coverage.getItemData = true;

            proxyFactory.registerProxy('qtiServiceProxy', qtiServiceProxy);

            $.ajax = ajaxMockSuccess({success: true});

            var proxy = proxyFactory('qtiServiceProxy', initConfig);

            proxy.init();

            $.ajax = caseData.ajaxMock(caseData.response, function(ajaxConfig) {
                assert.equal(ajaxConfig.url, expectedUrl, 'The proxy has called the right service');
            });

            proxy.on('getItemData', function(promise, uri) {
                assert.ok(true, 'The proxy has fired the "getItemData" event');
                assert.equal(typeof promise, 'object', 'The proxy has provided the promise through the "getItemData" event');
                assert.equal(uri, caseData.uri, 'The proxy has provided the URI through the "getItemData" event');
            });

            var result = proxy.getItemData(caseData.uri);

            assert.equal(typeof result, 'object', 'The proxy.getItemData method has returned a promise');

            result.then(function(data) {
                if (caseData.success) {
                    assert.equal(data, caseData.response, 'The proxy has returned the expected data');
                } else {
                    assert.ok(false, 'The proxy must throw an error!');
                }
                QUnit.start();
            }).catch(function(err) {
                assert.ok(!caseData.success, 'The proxy has thrown an error! #' + err);
                QUnit.start();
            });
        });


    var qtiServiceProxyGetItemStateChecks = [{
        title: 'success',
        ajaxMock: ajaxMockSuccess,
        uri: 'http://tao.dev/mockItemDefinition#123',
        response: {
            response: [{}],
            success: true
        },
        success: true
    }, {
        title: 'failing data',
        ajaxMock: ajaxMockSuccess,
        uri: 'http://tao.dev/mockItemDefinition#123',
        response: {
            success: false
        },
        success: false
    }, {
        title: 'failing request',
        ajaxMock: ajaxMockError,
        uri: 'http://tao.dev/mockItemDefinition#123',
        response: "error",
        success: false
    }] ;

    QUnit
        .cases(qtiServiceProxyGetItemStateChecks)
        .asyncTest('qtiServiceProxy.getItemState ', 6, function(caseData, assert) {
            var initConfig = {
                testDefinition: 'http://tao.dev/mockTestDefinition#123',
                testCompilation: 'http://tao.dev/mockTestCompilation#123',
                serviceCallId: 'http://tao.dev/mockServiceCallId#123',
                serviceController: 'MockRunner',
                serviceExtension: 'taoRunnerMock'
            };

            var expectedUrl = helpers._url('getItemState', initConfig.serviceController, initConfig.serviceExtension, {
                testDefinition : initConfig.testDefinition,
                testCompilation : initConfig.testCompilation,
                testServiceCallId : initConfig.serviceCallId,
                itemDefinition : caseData.uri
            });

            coverage.getItemState = true;

            proxyFactory.registerProxy('qtiServiceProxy', qtiServiceProxy);

            $.ajax = ajaxMockSuccess({success: true});

            var proxy = proxyFactory('qtiServiceProxy', initConfig);

            proxy.init();

            $.ajax = caseData.ajaxMock(caseData.response, function(ajaxConfig) {
                assert.equal(ajaxConfig.url, expectedUrl, 'The proxy has called the right service');
            });

            proxy.on('getItemState', function(promise, uri) {
                assert.ok(true, 'The proxy has fired the "getItemState" event');
                assert.equal(typeof promise, 'object', 'The proxy has provided the promise through the "getItemState" event');
                assert.equal(uri, caseData.uri, 'The proxy has provided the URI through the "getItemState" event');
            });

            var result = proxy.getItemState(caseData.uri);

            assert.equal(typeof result, 'object', 'The proxy.getItemState method has returned a promise');

            result.then(function(data) {
                if (caseData.success) {
                    assert.equal(data, caseData.response, 'The proxy has returned the expected data');
                } else {
                    assert.ok(false, 'The proxy must throw an error!');
                }
                QUnit.start();
            }).catch(function(err) {
                assert.ok(!caseData.success, 'The proxy has thrown an error! #' + err);
                QUnit.start();
            });
        });


    var qtiServiceProxySubmitItemStateChecks = [{
        title: 'success',
        ajaxMock: ajaxMockSuccess,
        uri: 'http://tao.dev/mockItemDefinition#123',
        state: {response: [{}]},
        response: {
            success: true
        },
        success: true
    }, {
        title: 'failing data',
        ajaxMock: ajaxMockSuccess,
        uri: 'http://tao.dev/mockItemDefinition#123',
        state: {response: [{}]},
        response: {
            success: false
        },
        success: false
    }, {
        title: 'failing request',
        ajaxMock: ajaxMockError,
        uri: 'http://tao.dev/mockItemDefinition#123',
        state: {response: [{}]},
        response: "error",
        success: false
    }] ;

    QUnit
        .cases(qtiServiceProxySubmitItemStateChecks)
        .asyncTest('qtiServiceProxy.submitItemState ', 7, function(caseData, assert) {
            var initConfig = {
                testDefinition: 'http://tao.dev/mockTestDefinition#123',
                testCompilation: 'http://tao.dev/mockTestCompilation#123',
                serviceCallId: 'http://tao.dev/mockServiceCallId#123',
                serviceController: 'MockRunner',
                serviceExtension: 'taoRunnerMock'
            };

            var expectedUrl = helpers._url('submitItemState', initConfig.serviceController, initConfig.serviceExtension, {
                testDefinition : initConfig.testDefinition,
                testCompilation : initConfig.testCompilation,
                testServiceCallId : initConfig.serviceCallId,
                itemDefinition : caseData.uri
            });

            coverage.submitItemState = true;

            proxyFactory.registerProxy('qtiServiceProxy', qtiServiceProxy);

            $.ajax = ajaxMockSuccess({success: true});

            var proxy = proxyFactory('qtiServiceProxy', initConfig);

            proxy.init();

            $.ajax = caseData.ajaxMock(caseData.response, function(ajaxConfig) {
                assert.equal(ajaxConfig.url, expectedUrl, 'The proxy has called the right service');
            });

            proxy.on('submitItemState', function(promise, uri, state) {
                assert.ok(true, 'The proxy has fired the "submitItemState" event');
                assert.equal(typeof promise, 'object', 'The proxy has provided the promise through the "submitItemState" event');
                assert.equal(uri, caseData.uri, 'The proxy has provided the URI through the "submitItemState" event');
                assert.equal(state, caseData.state, 'The proxy has provided the state through the "submitItemState" event');
            });

            var result = proxy.submitItemState(caseData.uri, caseData.state);

            assert.equal(typeof result, 'object', 'The proxy.submitItemState method has returned a promise');

            result.then(function(data) {
                if (caseData.success) {
                    assert.equal(data, caseData.response, 'The proxy has returned the expected data');
                } else {
                    assert.ok(false, 'The proxy must throw an error!');
                }
                QUnit.start();
            }).catch(function(err) {
                assert.ok(!caseData.success, 'The proxy has thrown an error! #' + err);
                QUnit.start();
            });
        });


    var qtiServiceProxyStoreItemResponseChecks = [{
        title: 'success',
        ajaxMock: ajaxMockSuccess,
        uri: 'http://tao.dev/mockItemDefinition#123',
        itemResponse: {response: [{}]},
        response: {
            success: true
        },
        success: true
    }, {
        title: 'failing data',
        ajaxMock: ajaxMockSuccess,
        uri: 'http://tao.dev/mockItemDefinition#123',
        itemResponse: {response: [{}]},
        response: {
            success: false
        },
        success: false
    }, {
        title: 'failing request',
        ajaxMock: ajaxMockError,
        uri: 'http://tao.dev/mockItemDefinition#123',
        itemResponse: {response: [{}]},
        response: "error",
        success: false
    }] ;

    QUnit
        .cases(qtiServiceProxyStoreItemResponseChecks)
        .asyncTest('qtiServiceProxy.storeItemResponse ', 7, function(caseData, assert) {
            var initConfig = {
                testDefinition: 'http://tao.dev/mockTestDefinition#123',
                testCompilation: 'http://tao.dev/mockTestCompilation#123',
                serviceCallId: 'http://tao.dev/mockServiceCallId#123',
                serviceController: 'MockRunner',
                serviceExtension: 'taoRunnerMock'
            };

            var expectedUrl = helpers._url('storeItemResponse', initConfig.serviceController, initConfig.serviceExtension, {
                testDefinition : initConfig.testDefinition,
                testCompilation : initConfig.testCompilation,
                testServiceCallId : initConfig.serviceCallId,
                itemDefinition : caseData.uri
            });

            coverage.storeItemResponse = true;

            proxyFactory.registerProxy('qtiServiceProxy', qtiServiceProxy);

            $.ajax = ajaxMockSuccess({success: true});

            var proxy = proxyFactory('qtiServiceProxy', initConfig);

            proxy.init();

            $.ajax = caseData.ajaxMock(caseData.response, function(ajaxConfig) {
                assert.equal(ajaxConfig.url, expectedUrl, 'The proxy has called the right service');
            });

            proxy.on('storeItemResponse', function(promise, uri, response) {
                assert.ok(true, 'The proxy has fired the "storeItemResponse" event');
                assert.equal(typeof promise, 'object', 'The proxy has provided the promise through the "storeItemResponse" event');
                assert.equal(uri, caseData.uri, 'The proxy has provided the URI through the "storeItemResponse" event');
                assert.equal(response, caseData.itemResponse, 'The proxy has provided the response through the "storeItemResponse" event');
            });

            var result = proxy.storeItemResponse(caseData.uri, caseData.itemResponse);

            assert.equal(typeof result, 'object', 'The proxy.storeItemResponse method has returned a promise');

            result.then(function(data) {
                if (caseData.success) {
                    assert.equal(data, caseData.response, 'The proxy has returned the expected data');
                } else {
                    assert.ok(false, 'The proxy must throw an error!');
                }
                QUnit.start();
            }).catch(function(err) {
                assert.ok(!caseData.success, 'The proxy has thrown an error! #' + err);
                QUnit.start();
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
        response: {
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
        response: {
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
        response: "error",
        success: false
    }] ;

    QUnit
        .cases(qtiServiceProxyCallItemActionChecks)
        .asyncTest('qtiServiceProxy.callItemAction ', 8, function(caseData, assert) {
            var initConfig = {
                testDefinition: 'http://tao.dev/mockTestDefinition#123',
                testCompilation: 'http://tao.dev/mockTestCompilation#123',
                serviceCallId: 'http://tao.dev/mockServiceCallId#123',
                serviceController: 'MockRunner',
                serviceExtension: 'taoRunnerMock'
            };

            var expectedUrl = helpers._url(caseData.action, initConfig.serviceController, initConfig.serviceExtension, {
                testDefinition : initConfig.testDefinition,
                testCompilation : initConfig.testCompilation,
                testServiceCallId : initConfig.serviceCallId,
                itemDefinition : caseData.uri
            });

            coverage.callItemAction = true;

            proxyFactory.registerProxy('qtiServiceProxy', qtiServiceProxy);

            $.ajax = ajaxMockSuccess({success: true});

            var proxy = proxyFactory('qtiServiceProxy', initConfig);

            proxy.init();

            $.ajax = caseData.ajaxMock(caseData.response, function(ajaxConfig) {
                assert.equal(ajaxConfig.url, expectedUrl, 'The proxy has called the right service');
            });

            proxy.on('callItemAction', function(promise, uri, action, params) {
                assert.ok(true, 'The proxy has fired the "callItemAction" event');
                assert.equal(typeof promise, 'object', 'The proxy has provided the promise through the "callItemAction" event');
                assert.equal(uri, caseData.uri, 'The proxy has provided the URI through the "callItemAction" event');
                assert.equal(action, caseData.action, 'The proxy has provided the action through the "callItemAction" event');
                assert.equal(params, caseData.params, 'The proxy has provided the params through the "callItemAction" event');
            });

            var result = proxy.callItemAction(caseData.uri, caseData.action, caseData.params);

            assert.equal(typeof result, 'object', 'The proxy.callItemAction method has returned a promise');

            result.then(function(data) {
                if (caseData.success) {
                    assert.equal(data, caseData.response, 'The proxy has returned the expected data');
                } else {
                    assert.ok(false, 'The proxy must throw an error!');
                }
                QUnit.start();
            }).catch(function(err) {
                assert.ok(!caseData.success, 'The proxy has thrown an error! #' + err);
                QUnit.start();
            });
        });
});
