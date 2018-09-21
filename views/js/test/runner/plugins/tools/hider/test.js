define([
    'taoTests/runner/runner',
    'taoQtiTest/test/runner/mocks/providerMock',
    'taoQtiTest/runner/plugins/tools/hider/hider',
], function(runnerFactory, providerMock, hiderFactory) {
    'use strict';

    var pluginApi = [
        { name : 'init', title : 'init' },
        { name : 'render', title : 'render' },
        { name : 'finish', title : 'finish' },
        { name : 'destroy', title : 'destroy' },
        { name : 'trigger', title : 'trigger' },
        { name : 'getTestRunner', title : 'getTestRunner' },
        { name : 'getAreaBroker', title : 'getAreaBroker' },
        { name : 'getConfig', title : 'getConfig' },
        { name : 'setConfig', title : 'setConfig' },
        { name : 'getState', title : 'getState' },
        { name : 'setState', title : 'setState' },
        { name : 'show', title : 'show' },
        { name : 'hide', title : 'hide' },
        { name : 'enable', title : 'enable' },
        { name : 'disable', title : 'disable' }
    ];

    var providerName = 'mock';
    runnerFactory.registerProvider(providerName, providerMock());

    QUnit.module('pluginFactory');
    QUnit.test('module', 3, function(assert) {
        var runner = runnerFactory(providerName);

        assert.equal(typeof hiderFactory, 'function', 'The module exposes a function');
        assert.equal(typeof hiderFactory(runner), 'object', 'The plugin produces an instance');
        assert.notStrictEqual(hiderFactory(runner), hiderFactory(runner), 'The plugin factory provides a different instance on each call');
    });

    QUnit
        .cases(pluginApi)
        .test('Plugin API', 1, function(data, assert) {
            var runner = runnerFactory(providerName);
            var plugin = hiderFactory(runner);

            assert.equal(typeof plugin[data.name], 'function', 'The hiderFactory instances expose a "' + data.name + '" function');
        })
    ;

    QUnit.module('Behavior');

    QUnit.asyncTest('Hider button get inserted', 1, function(assert) {
        var runner = runnerFactory(providerName);
        var areaBroker = runner.getAreaBroker();
        var plugin = hiderFactory(runner, areaBroker);

        plugin.init()
            .then(function() {
                var $container = areaBroker.getToolboxArea();

                areaBroker.getToolbox().render($container);

                var $button = runner.getAreaBroker().getToolboxArea().find('li[data-control="hider"]');

                assert.equal($button.length, 1, 'The hider button has been inserted');
                QUnit.start();
            })
            .catch(function(err) {
                assert.ok(false, 'Error in the method: ' + err);
                QUnit.start();
            })
        ;
    });

    QUnit.asyncTest('Content mask is not visible by default', 2, function(assert) {
        var runner = runnerFactory(providerName);
        var areaBroker = runner.getAreaBroker();
        var plugin = hiderFactory(runner, areaBroker);

        plugin.init()
            .then(function() {
                var $container = areaBroker.getToolboxArea();

                areaBroker.getToolbox().render($container);

                var $contentArea = runner.getAreaBroker().getContentArea();
                var $contentMask = runner.getAreaBroker().getContainer().find('.hider-content-mask');

                assert.ok($contentArea.is(':visible'), 'The content area is visible by default');
                assert.ok($contentMask.hasClass('hidden'), 'The content mask is hidden by default');
                QUnit.start();
            })
            .catch(function(err) {
                assert.ok(false, 'Error in the method: ' + err);
                QUnit.start();
            })
        ;
    });

    QUnit.asyncTest('Content mask visible and content area hidden after click', 2, function(assert) {
        var runner = runnerFactory(providerName);
        var areaBroker = runner.getAreaBroker();
        var plugin = hiderFactory(runner, areaBroker);

        plugin.init()
            .then(function() {
                var $container = areaBroker.getToolboxArea();

                areaBroker.getToolbox().render($container);

                plugin.button.trigger('click');

                var $contentArea = runner.getAreaBroker().getContentArea();
                var $contentMask = runner.getAreaBroker().getContainer().find('.hider-content-mask');

                assert.ok(!$contentArea.is(':visible'), 'The content area is visible by default');
                assert.ok(!$contentMask.hasClass('hidden'), 'The content mask is hidden by default');
                QUnit.start();
            })
            .catch(function(err) {
                assert.ok(false, 'Error in the method: ' + err);
                QUnit.start();
            })
        ;
    });

    QUnit.asyncTest('Content mask hidden and content area visible after 2nd click', 2, function(assert) {
        var runner = runnerFactory(providerName);
        var areaBroker = runner.getAreaBroker();
        var plugin = hiderFactory(runner, areaBroker);

        plugin.init()
            .then(function() {
                var $container = areaBroker.getToolboxArea();

                areaBroker.getToolbox().render($container);

                plugin.button.trigger('click');
                plugin.button.trigger('click');

                var $contentArea = runner.getAreaBroker().getContentArea();
                var $contentMask = runner.getAreaBroker().getContainer().find('.hider-content-mask');

                assert.ok($contentArea.is(':visible'), 'The content area is visible by default');
                assert.ok($contentMask.hasClass('hidden'), 'The content mask is hidden by default');
                QUnit.start();
            })
            .catch(function(err) {
                assert.ok(false, 'Error in the method: ' + err);
                QUnit.start();
            })
        ;
    });

    QUnit.asyncTest('Content mask hidden and content area visible after clicking on the contentArea parent', 2, function(assert) {
        var runner = runnerFactory(providerName);
        var areaBroker = runner.getAreaBroker();
        var plugin = hiderFactory(runner, areaBroker);

        plugin.init()
            .then(function() {
                var $container = areaBroker.getToolboxArea();

                areaBroker.getToolbox().render($container);

                plugin.button.trigger('click');
                areaBroker.getContentArea().parent().trigger('click');

                var $contentArea = runner.getAreaBroker().getContentArea();
                var $contentMask = runner.getAreaBroker().getContainer().find('.hider-content-mask');

                assert.ok($contentArea.is(':visible'), 'The content area is visible by default');
                assert.ok($contentMask.hasClass('hidden'), 'The content mask is hidden by default');
                QUnit.start();
            })
            .catch(function(err) {
                assert.ok(false, 'Error in the method: ' + err);
                QUnit.start();
            })
        ;
    });

    QUnit.asyncTest('destroy', 1, function(assert) {
        var runner = runnerFactory(providerName);
        var areaBroker = runner.getAreaBroker();
        var plugin = hiderFactory(runner, areaBroker);

        plugin.init()
            .then(function() {
                plugin.destroy()
                    .then(function() {
                        assert.equal(plugin.contentMask.getElement(), null, 'The content mask got destroyed');
                        QUnit.start();
                    })
                    .catch(function(err) {
                        assert.ok(false, 'Error in the method: ' + err);
                        QUnit.start();
                    })
                ;
            })
            .catch(function(err) {
                assert.ok(false, 'Error in the method: ' + err);
                QUnit.start();
            })
        ;
    });

    QUnit.asyncTest('enable', 1, function(assert) {
        var runner = runnerFactory(providerName);
        var areaBroker = runner.getAreaBroker();
        var plugin = hiderFactory(runner, areaBroker);

        plugin.init()
            .then(function() {
                plugin.enable()
                    .then(function() {
                        assert.equal(plugin.button.is('disabled'), false, 'The button is enabled');
                        QUnit.start();
                    })
                    .catch(function(err) {
                        assert.ok(false, 'Error in the method: ' + err);
                        QUnit.start();
                    })
                ;
            })
            .catch(function(err) {
                assert.ok(false, 'Error in the method: ' + err);
                QUnit.start();
            })
        ;
    });

    QUnit.asyncTest('disable', 1, function(assert) {
        var runner = runnerFactory(providerName);
        var areaBroker = runner.getAreaBroker();
        var plugin = hiderFactory(runner, areaBroker);

        plugin.init()
            .then(function() {
                plugin.disable()
                    .then(function() {
                        assert.equal(plugin.button.is('disabled'), true, 'The button is enabled');
                        QUnit.start();
                    })
                    .catch(function(err) {
                        assert.ok(false, 'Error in the method: ' + err);
                        QUnit.start();
                    })
                ;
            })
            .catch(function(err) {
                assert.ok(false, 'Error in the method: ' + err);
                QUnit.start();
            })
        ;
    });

    QUnit.asyncTest('enabletools renderitem', 2, function(assert) {
        var runner = runnerFactory(providerName);
        var areaBroker = runner.getAreaBroker();
        var plugin = hiderFactory(runner, areaBroker);

        plugin.init()
            .then(function() {
                runner.trigger('enabletools');

                assert.equal(plugin.button.is('disabled'), false, 'The button is enabled after enabletools event');

                runner.trigger('enabletools');

                assert.equal(plugin.button.is('renderitem'), false, 'The button is enabled after renderitem event');

                QUnit.start();
            })
            .catch(function(err) {
                assert.ok(false, 'Error in the method: ' + err);
                QUnit.start();
            })
        ;
    });

    QUnit.asyncTest('disabletools unloaditem', 2, function(assert) {
        var runner = runnerFactory(providerName);
        var areaBroker = runner.getAreaBroker();
        var plugin = hiderFactory(runner, areaBroker);

        plugin.init()
            .then(function() {
                runner.trigger('disabletools');

                assert.equal(plugin.button.is('disabled'), true, 'The button is disabled after disabletools event');

                runner.trigger('unloaditem');

                assert.equal(plugin.button.is('disabled'), true, 'The button is disabled after unloaditem event');

                QUnit.start();
            })
            .catch(function(err) {
                assert.ok(false, 'Error in the method: ' + err);
                QUnit.start();
            })
        ;
    });
});