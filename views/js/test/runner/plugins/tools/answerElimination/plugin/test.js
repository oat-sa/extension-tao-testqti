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

define([
    'lodash',
    'helpers',
    'taoTests/runner/runner',
    'taoQtiTest/test/runner/mocks/providerMock',
    'taoQtiTest/runner/plugins/tools/answerElimination/eliminator'
], function(_, helpers, runnerFactory, providerMock, eliminator) {
    'use strict';

    var providerName = 'mock';
    runnerFactory.registerProvider(providerName, providerMock());

    QUnit.module('eliminator');


    QUnit.test('module', 3, function(assert) {
        var runner = runnerFactory(providerName);

        assert.equal(typeof eliminator, 'function', "Eliminator module exposes a function");
        assert.equal(typeof eliminator(runner), 'object', "Eliminator factory produces an instance");
        assert.notStrictEqual(eliminator(runner), eliminator(runner), "Eliminator factory provides a different instance on each call");
    });


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

    QUnit
        .cases(pluginApi)
        .test('plugin API ', 1, function(data, assert) {
            var runner = runnerFactory(providerName);
            var timer = eliminator(runner);
            assert.equal(typeof timer[data.name], 'function', 'Eliminator instances expose a "' + data.name + '" function');
        });



    QUnit.asyncTest('eliminator.init', function(assert) {
        var runner = runnerFactory(providerName);
        var _eliminator = eliminator(runner, runner.getAreaBroker());

        _eliminator.init()
            .then(function() {
                assert.equal(_eliminator.getState('init'), true, 'Eliminator is initialised');

                QUnit.start();
            })
            .catch(function(err) {
                console.log(err);
                assert.ok(false, 'The init method must not fail');
                QUnit.start();
            });
    });



    QUnit.asyncTest('eliminator.render', function(assert) {
        var runner = runnerFactory(providerName);
        var _eliminator = eliminator(runner, runner.getAreaBroker());

        _eliminator.init()
            .then(function() {
                assert.equal(typeof _eliminator.$button, 'object', 'Eliminator has pre-rendered the element');
                assert.equal(_eliminator.$button.length, 1, 'Eliminator has pre-rendered the container');

                _eliminator.render()
                    .then(function() {
                        var $container = runner.getAreaBroker().getToolboxArea();

                        assert.equal(_eliminator.getState('ready'), true, 'Eliminator is ready');
                        assert.equal($container.find(_eliminator.$button).length, 1, 'Eliminator has inserted its button into the layout');

                        QUnit.start();
                    })
                    .catch(function(err) {
                        console.log(err);
                        assert.ok(false, 'The render method must not fail');
                        QUnit.start();
                    });
            })
            .catch(function(err) {
                console.log(err);
                assert.ok(false, 'The init method must not fail');
                QUnit.start();
            });
    });

    QUnit.asyncTest('eliminator.destroy', function(assert) {
        var runner = runnerFactory(providerName);
        var _eliminator = eliminator(runner, runner.getAreaBroker());

        _eliminator.init()
            .then(function() {
                assert.equal(_eliminator.getState('init'), true, 'Eliminator is initialised');
                assert.equal(typeof _eliminator.$button, 'object', 'Eliminator has pre-rendered the element');
                assert.equal(_eliminator.$button.length, 1, 'Eliminator has pre-rendered the container');

                _eliminator.render()
                    .then(function() {
                        var $container = runner.getAreaBroker().getToolboxArea();

                        assert.equal(_eliminator.getState('ready'), true, 'Eliminator is ready');
                        assert.equal($container.find(_eliminator.$button).length, 1, 'Eliminator has inserted its button into the layout');

                        _eliminator.enable()
                            .then(function() {
                                assert.equal(_eliminator.getState('enabled'), true, 'Eliminator is enabled');

                                _eliminator.destroy()
                                    .then(function() {
                                        var $container = runner.getAreaBroker().getToolboxArea();

                                        assert.equal(_eliminator.getState('init'), false, 'Eliminator is destroyed');
                                        assert.equal($container.find(_eliminator.$button).length, 0, 'Eliminator has removed its button from the layout');

                                        QUnit.start();
                                    })
                                    .catch(function(err) {
                                        console.log(err);
                                        assert.ok(false, 'The destroy method must not fail');
                                        QUnit.start();
                                    });
                            })
                            .catch(function(err) {
                                console.log(err);
                                assert.ok(false, 'The enable method must not fail');
                                QUnit.start();
                            });
                    })
                    .catch(function(err) {
                        console.log(err);
                        assert.ok(false, 'The render method must not fail');
                        QUnit.start();
                    });
            })
            .catch(function(err) {
                console.log(err);
                assert.ok(false, 'The init method must not fail');
                QUnit.start();
            });
    });


    QUnit.asyncTest('eliminator.enable', function(assert) {
        var runner = runnerFactory(providerName);
        var _eliminator = eliminator(runner, runner.getAreaBroker());

        _eliminator.init()
            .then(function() {
                assert.equal(_eliminator.getState('init'), true, 'Eliminator is initialised');
                assert.equal(_eliminator.getState('enabled'), false, 'Eliminator is disabled');

                _eliminator.enable()
                    .then(function() {
                        assert.equal(_eliminator.getState('enabled'), true, 'Eliminator is enabled');

                        _eliminator.destroy()
                            .then(function() {
                                assert.equal(_eliminator.getState('init'), false, 'Eliminator is destroyed');

                                QUnit.start();
                            })
                            .catch(function(err) {
                                console.log(err);
                                assert.ok(false, 'The destroy method must not fail');
                                QUnit.start();
                            });
                    })
                    .catch(function(err) {
                        console.log(err);
                        assert.ok(false, 'The enable method must not fail');
                        QUnit.start();
                    });
            })
            .catch(function(err) {
                console.log(err);
                assert.ok(false, 'The init method must not fail');
                QUnit.start();
            });
    });


    QUnit.asyncTest('eliminator.disable', function(assert) {
        var runner = runnerFactory(providerName);
        var _eliminator = eliminator(runner, runner.getAreaBroker());

        _eliminator.init()
            .then(function() {
                assert.equal(_eliminator.getState('init'), true, 'Eliminator is initialised');
                assert.equal(_eliminator.getState('enabled'), false, 'Eliminator is disabled');

                _eliminator.enable()
                    .then(function() {
                        assert.equal(_eliminator.getState('enabled'), true, 'Eliminator is enabled');

                        _eliminator.disable()
                            .then(function() {
                                assert.equal(_eliminator.getState('enabled'), false, 'Eliminator is disabled');

                                QUnit.start();
                            })
                            .catch(function(err) {
                                console.log(err);
                                assert.ok(false, 'The disable method must not fail');
                                QUnit.start();
                            });
                    })
                    .catch(function(err) {
                        console.log(err);
                        assert.ok(false, 'The enable method must not fail');
                        QUnit.start();
                    });
            })
            .catch(function(err) {
                console.log(err);
                assert.ok(false, 'The init method must not fail');
                QUnit.start();
            });
    });


    QUnit.asyncTest('eliminator.show/eliminator.hide', function(assert) {
        var runner = runnerFactory(providerName);
        var _eliminator = eliminator(runner, runner.getAreaBroker());

        _eliminator.init()
            .then(function() {
                assert.equal(typeof _eliminator.$button, 'object', 'Eliminator has pre-rendered the element');
                assert.equal(_eliminator.$button.length, 1, 'Eliminator has pre-rendered the container');

                _eliminator.render()
                    .then(function() {
                        var $container = runner.getAreaBroker().getToolboxArea();
                        _eliminator.setState('visible', true);

                        assert.equal(_eliminator.getState('ready'), true, 'Eliminator is ready');
                        assert.equal(_eliminator.getState('visible'), true, 'Eliminator is visible');
                        assert.equal($container.find(_eliminator.$button).length, 1, 'Eliminator has inserted its content into the layout');

                        _eliminator.hide()
                            .then(function() {
                                assert.equal(_eliminator.getState('visible'), false, 'Eliminator is not visible');
                                assert.equal(_eliminator.$button.css('display'), 'none', 'Eliminator element is hidden');

                                _eliminator.show()
                                    .then(function() {
                                        assert.equal(_eliminator.getState('visible'), true, 'Eliminator is visible');
                                        assert.notEqual(_eliminator.$button.css('display'), 'none', 'Eliminator element is visible');

                                        QUnit.start();
                                    })
                                    .catch(function(err) {
                                        console.log(err);
                                        assert.ok(false, 'The show method must not fail');
                                        QUnit.start();
                                    });
                            })
                            .catch(function(err) {
                                console.log(err);
                                assert.ok(false, 'The hide method must not fail');
                                QUnit.start();
                            });
                    })
                    .catch(function(err) {
                        console.log(err);
                        assert.ok(false, 'The render method must not fail');
                        QUnit.start();
                    });
            })
            .catch(function(err) {
                console.log(err);
                assert.ok(false, 'The init method must not fail');
                QUnit.start();
            });
    });
});
