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
    QUnit.test('module', function(assert) {
        QUnit.expect(3);

        var runner = runnerFactory(providerName);

        assert.equal(typeof hiderFactory, 'function', 'The module exposes a function');
        assert.equal(typeof hiderFactory(runner), 'object', 'The plugin produces an instance');
        assert.notStrictEqual(hiderFactory(runner), hiderFactory(runner), 'The plugin factory provides a different instance on each call');
    });

    QUnit
        .cases(pluginApi)
        .test('Plugin API', 1, function(data, assert) {
            QUnit.expect(1);

            var runner = runnerFactory(providerName);
            var plugin = hiderFactory(runner);

            assert.equal(typeof plugin[data.name], 'function', 'The hiderFactory instances expose a "' + data.name + '" function');
        })
    ;

    QUnit.module('Behavior');

    QUnit.asyncTest('Hider button get inserted', function(assert) {
        QUnit.expect(1);

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

    QUnit.asyncTest('Content mask is not visible by default', function(assert) {
        QUnit.expect(1);

        var runner = runnerFactory(providerName);
        var areaBroker = runner.getAreaBroker();
        var plugin = hiderFactory(runner, areaBroker);

        plugin.init()
            .then(function() {
                var $container = areaBroker.getToolboxArea();
                var testRunner = plugin.getTestRunner();

                areaBroker.getToolbox().render($container);
                testRunner.trigger('renderitem');

                setTimeout(function() {
                    assert.ok(plugin.contentMask.$component.hasClass('hidden'), 'The content mask has got the following class: "hidden"');
                    QUnit.start();
                }, 100);
            })
            .catch(function(err) {
                assert.ok(false, 'Error in the method: ' + err);
                QUnit.start();
            })
        ;
    });

    QUnit.asyncTest('Content mask visible after clicking on button', function(assert) {
        QUnit.expect(2);

        var runner = runnerFactory(providerName);
        var areaBroker = runner.getAreaBroker();
        var plugin = hiderFactory(runner, areaBroker);

        plugin.init()
            .then(function() {
                var $container = areaBroker.getToolboxArea();
                var testRunner = plugin.getTestRunner();

                areaBroker.getToolbox().render($container);
                testRunner.trigger('renderitem');

                setTimeout(function() {
                    assert.ok(plugin.contentMask.$component.hasClass('hidden'), 'The content mask has got the following class: "hidden"');

                    plugin.button.trigger('click');

                    setTimeout(function() {
                        assert.ok(!plugin.contentMask.$component.hasClass('hidden'), 'The content mask hasn\'t got the following class: "hidden"');

                        QUnit.start();
                    }, 100);
                }, 100);
            })
            .catch(function(err) {
                assert.ok(false, 'Error in the method: ' + err);
                QUnit.start();
            })
        ;
    });

    QUnit.asyncTest('Content mask hidden after 2nd click on the button', function(assert) {
        QUnit.expect(3);

        var runner = runnerFactory(providerName);
        var areaBroker = runner.getAreaBroker();
        var plugin = hiderFactory(runner, areaBroker);

        plugin.init()
            .then(function() {
                var $container = areaBroker.getToolboxArea();
                var testRunner = plugin.getTestRunner();

                areaBroker.getToolbox().render($container);
                testRunner.trigger('renderitem');

                setTimeout(function() {
                    assert.ok(plugin.contentMask.$component.hasClass('hidden'), 'The content mask has got the following class: "hidden"');

                    plugin.button.trigger('click');

                    setTimeout(function() {
                        assert.ok(!plugin.contentMask.$component.hasClass('hidden'), 'The content mask hasn\'t got the following class: "hidden"');

                        plugin.button.trigger('click');

                        setTimeout(function() {
                            assert.ok(plugin.contentMask.$component.hasClass('hidden'), 'The content mask has got the following class: "hidden"');


                            QUnit.start();
                        }, 100);
                    }, 100);
                }, 100);
            })
            .catch(function(err) {
                assert.ok(false, 'Error in the method: ' + err);
                QUnit.start();
            })
        ;
    });

    QUnit.asyncTest('Content mask hidden after click on contentArea', function(assert) {
        QUnit.expect(3);

        var runner = runnerFactory(providerName);
        var areaBroker = runner.getAreaBroker();
        var plugin = hiderFactory(runner, areaBroker);

        plugin.init()
            .then(function() {
                var $container = areaBroker.getToolboxArea();
                var testRunner = plugin.getTestRunner();

                areaBroker.getToolbox().render($container);
                testRunner.trigger('renderitem');

                setTimeout(function() {
                    assert.ok(plugin.contentMask.$component.hasClass('hidden'), 'The content mask has got the following class: "hidden"');

                    plugin.button.trigger('click');

                    setTimeout(function() {
                        assert.ok(!plugin.contentMask.$component.hasClass('hidden'), 'The content mask hasn\'t got the following class: "hidden"');

                        plugin.contentMask.getElement().trigger('click');
                        setTimeout(function() {
                            assert.ok(plugin.contentMask.$component.hasClass('hidden'), 'The content mask has got the following class: "hidden"');

                            QUnit.start();
                        }, 100);
                    }, 100);
                }, 100);
            })
            .catch(function(err) {
                assert.ok(false, 'Error in the method: ' + err);
                QUnit.start();
            })
        ;
    });

    QUnit.asyncTest('destroy', function(assert) {
        QUnit.expect(1);

        var runner = runnerFactory(providerName);
        var areaBroker = runner.getAreaBroker();
        var plugin = hiderFactory(runner, areaBroker);

        plugin.init()
            .then(function() {
                var $container = areaBroker.getToolboxArea();
                var testRunner = plugin.getTestRunner();

                areaBroker.getToolbox().render($container);
                testRunner.trigger('renderitem');

                setTimeout(function() {
                    plugin.destroy()
                        .then(function() {
                            setTimeout(function() {
                                assert.equal(plugin.contentMask.getElement(), null, 'The content mask got destroyed');
                                QUnit.start();
                            }, 100);
                        })
                        .catch(function(err) {
                            assert.ok(false, 'Error in the method: ' + err);
                            QUnit.start();
                        })
                    ;
                }, 100);
            })
            .catch(function(err) {
                assert.ok(false, 'Error in the method: ' + err);
                QUnit.start();
            })
        ;
    });

    QUnit.asyncTest('enable', function(assert) {
        QUnit.expect(1);

        var runner = runnerFactory(providerName);
        var areaBroker = runner.getAreaBroker();
        var plugin = hiderFactory(runner, areaBroker);

        plugin.init()
            .then(function() {
                var $container = areaBroker.getToolboxArea();
                var testRunner = plugin.getTestRunner();

                areaBroker.getToolbox().render($container);
                testRunner.trigger('renderitem');

                setTimeout(function() {
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
                }, 100);
            })
            .catch(function(err) {
                assert.ok(false, 'Error in the method: ' + err);
                QUnit.start();
            })
        ;
    });

    QUnit.asyncTest('disable', function(assert) {
        QUnit.expect(1);

        var runner = runnerFactory(providerName);
        var areaBroker = runner.getAreaBroker();
        var plugin = hiderFactory(runner, areaBroker);

        plugin.init()
            .then(function() {
                var $container = areaBroker.getToolboxArea();
                var testRunner = plugin.getTestRunner();

                areaBroker.getToolbox().render($container);
                testRunner.trigger('renderitem');

                setTimeout(function() {
                    plugin.disable()
                        .then(function() {
                            assert.equal(plugin.button.is('disabled'), true, 'The button is disabled');
                            QUnit.start();
                        })
                        .catch(function(err) {
                            assert.ok(false, 'Error in the method: ' + err);
                            QUnit.start();
                        })
                    ;
                }, 100);
            })
            .catch(function(err) {
                assert.ok(false, 'Error in the method: ' + err);
                QUnit.start();
            })
        ;
    });

    QUnit.asyncTest('enabletools renderitem', function(assert) {
        QUnit.expect(2);

        var runner = runnerFactory(providerName);
        var areaBroker = runner.getAreaBroker();
        var plugin = hiderFactory(runner, areaBroker);

        plugin.init()
            .then(function() {
                var $container = areaBroker.getToolboxArea();
                var testRunner = plugin.getTestRunner();

                areaBroker.getToolbox().render($container);
                testRunner.trigger('renderitem');

                runner.trigger('enabletools');

                assert.equal(plugin.button.is('disabled'), false, 'The button is enabled after enabletools event');

                runner.trigger('renderitem');

                assert.equal(plugin.button.is('disabled'), false, 'The button is enabled after renderitem event');

                QUnit.start();
            })
            .catch(function(err) {
                assert.ok(false, 'Error in the method: ' + err);
                QUnit.start();
            })
        ;
    });

    QUnit.asyncTest('disabletools unloaditem', function(assert) {
        QUnit.expect(2);

        var runner = runnerFactory(providerName);
        var areaBroker = runner.getAreaBroker();
        var plugin = hiderFactory(runner, areaBroker);

        plugin.init()
            .then(function() {
                var $container = areaBroker.getToolboxArea();
                var testRunner = plugin.getTestRunner();

                areaBroker.getToolbox().render($container);
                testRunner.trigger('renderitem');

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