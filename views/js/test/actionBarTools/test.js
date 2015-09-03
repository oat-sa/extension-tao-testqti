define([
    'jquery',
    'lodash',
    'taoQtiTest/testRunner/actionBarTools'
], function($, _, actionBarTools){
    'use strict';

    var containerSelector = '#tools-container';

    var qtiTools = {
        tool1 : {
            'label' : 'tool 1',
            'hook' : 'taoQtiTest/test/actionBarTools/hooks/validHook'
        },
        tool2 : {
            'label' : 'tool 2',
            'hook' : 'taoQtiTest/test/actionBarTools/hooks/validHookHidden'
        },
        tool3 : {
            'label' : 'tool 3',
            'hook' : 'taoQtiTest/test/actionBarTools/hooks/validHook'
        },
        tool4 : {
            'label' : 'tool 4',
            'hook' : 'taoQtiTest/test/actionBarTools/hooks/invalidHookMissingMethod'
        }
    };

    QUnit.module('actionBarTools');


    QUnit.test('module', 1, function(assert) {
        assert.equal(typeof actionBarTools, 'object', "The actionBarTools module exposes an object");
    });


    var actionBarToolsApi = [
        { name : 'register', title : 'register' },
        { name : 'get', title : 'get' },
        { name : 'list', title : 'list' },
        { name : 'render', title : 'render' }
    ];

    QUnit
        .cases(actionBarToolsApi)
        .test('module API ', function(data, assert) {
            assert.equal(typeof actionBarTools[data.name], 'function', 'The actionBarTools module exposes a "' + data.title + '" function');
        });


    QUnit.test('register', function(assert) {
        actionBarTools.register(null);
        assert.equal(typeof actionBarTools.list(), 'object', 'The actionBarTools must provide a list');
        assert.ok(actionBarTools.list(), 'The actionBarTools must provide a list');

        actionBarTools.register(qtiTools);
        assert.strictEqual(actionBarTools.list(), qtiTools, 'The actionBarTools must provide the registered list');

        assert.strictEqual(actionBarTools.get('tool1'), qtiTools.tool1, 'The actionBarTools.get() method must return the right tool');
        assert.ok(!actionBarTools.get('notExist'), 'The actionBarTools.get() method cannot return an unknown tool');
    });


    QUnit.asyncTest('render', function(assert) {
        var $container = $(containerSelector);
        var mockTestContext = {};
        var mockTestRunner = {};

        actionBarTools.register(qtiTools);
        actionBarTools.render($container, mockTestContext, mockTestRunner, function($ctnr, testContext, testRunner, obj) {
            assert.strictEqual(this, actionBarTools, 'The render method fires the callback inside the actionBarTools context');
            assert.equal($ctnr && $ctnr.length, 1, 'The render method must provide a jQuery element');
            assert.ok($ctnr.is(containerSelector), 'The render method must provide the container element');
            assert.strictEqual(testContext, mockTestContext, 'The render method must provide the testContext object');
            assert.strictEqual(testRunner, mockTestRunner, 'The render method must provide the testRunner instance');
            assert.strictEqual(obj, actionBarTools, 'The render method must provide the actionBarTools instance');

            assert.equal($container.find('.action').length, 2, 'The render method must renders the buttons');
            assert.equal($container.find('[data-control="tool1"]').length, 1, 'The render method must renders the tool1 button');
            assert.equal($container.find('[data-control="tool3"]').length, 1, 'The render method must renders the tool3 button');

            QUnit.start();
        });
    });


    QUnit.asyncTest('events', 17, function(assert) {
        var $container = $(containerSelector);
        var mockTestContext = {};
        var mockTestRunner = {};

        actionBarTools.on('beforeregister', function(tools, obj) {
            assert.strictEqual(tools, qtiTools, 'The beforeregister event must provide the list of tools to register');
            assert.strictEqual(obj, actionBarTools, 'The beforeregister event must provide the actionBarTools instance');
            QUnit.start();
        });
        actionBarTools.on('afterregister', function(tools, obj) {
            assert.strictEqual(tools, qtiTools, 'The afterregister event must provide the list of registered tools');
            assert.strictEqual(obj, actionBarTools, 'The afterregister event must provide the actionBarTools instance');
            QUnit.start();
        });

        actionBarTools.on('beforerender', function($ctnr, testContext, testRunner, obj) {
            assert.equal($ctnr && $ctnr.length, 1, 'The beforerender event must provide a jQuery element');
            assert.ok($ctnr.is(containerSelector), 'The beforerender event must provide the container element');
            assert.strictEqual(testContext, mockTestContext, 'The beforerender event must provide the testContext object');
            assert.strictEqual(testRunner, mockTestRunner, 'The beforerender event must provide the testRunner instance');
            assert.strictEqual(obj, actionBarTools, 'The beforerender event must provide the actionBarTools instance');
            QUnit.start();
        });
        actionBarTools.on('afterrender', function($ctnr, testContext, testRunner, obj) {
            assert.equal($ctnr && $ctnr.length, 1, 'The afterrender event must provide a jQuery element');
            assert.ok($ctnr.is(containerSelector), 'The afterrender event must provide the container element');
            assert.strictEqual(testContext, mockTestContext, 'The afterrender event must provide the testContext object');
            assert.strictEqual(testRunner, mockTestRunner, 'The afterrender event must provide the testRunner instance');
            assert.strictEqual(obj, actionBarTools, 'The afterrender event must provide the actionBarTools instance');

            assert.equal($container.find('.action').length, 2, 'The render method must renders the buttons');
            assert.equal($container.find('[data-control="tool1"]').length, 1, 'The render method must renders the tool1 button');
            assert.equal($container.find('[data-control="tool3"]').length, 1, 'The render method must renders the tool3 button');

            QUnit.start();
        });

        QUnit.stop(3);

        actionBarTools.register(qtiTools);
        actionBarTools.render($container, mockTestContext, mockTestRunner);
    });
});

