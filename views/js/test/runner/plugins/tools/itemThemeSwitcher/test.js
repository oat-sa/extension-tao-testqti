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
 * @author Christophe Noël <christophe@taotesting.com>
 */
define([
    'lodash',
    'helpers',
    'taoTests/runner/runner',
    'taoQtiTest/test/runner/mocks/providerMock',
    'taoQtiTest/runner/plugins/tools/itemThemeSwitcher/itemThemeSwitcher'
], function(_, helpers, runnerFactory, providerMock, itemThemeSwitcher) {
    'use strict';

    var providerName = 'mock';
    runnerFactory.registerProvider(providerName, providerMock());

    QUnit.module('itemThemeSwitcher');


    QUnit.test('module', 3, function(assert) {
        var runner = runnerFactory(providerName);

        assert.equal(typeof itemThemeSwitcher, 'function', "The itemThemeSwitcher module exposes a function");
        assert.equal(typeof itemThemeSwitcher(runner), 'object', "The itemThemeSwitcher factory produces an instance");
        assert.notStrictEqual(itemThemeSwitcher(runner), itemThemeSwitcher(runner), "The itemThemeSwitcher factory provides a different instance on each call");
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
            var timer = itemThemeSwitcher(runner);
            assert.equal(typeof timer[data.name], 'function', 'The itemThemeSwitcher instances expose a "' + data.name + '" function');
        });



    QUnit.asyncTest('itemThemeSwitcher.init', function(assert) {
        var runner = runnerFactory(providerName);
        var switcher = itemThemeSwitcher(runner, runner.getAreaBroker());

        switcher.init()
            .then(function() {
                assert.equal(switcher.getState('init'), true, 'The switcher is initialised');

                QUnit.start();
            })
            .catch(function(err) {
                console.log(err);
                assert.ok(false, 'The init method must not fail');
                QUnit.start();
            });
    });



    QUnit.asyncTest('itemThemeSwitcher.render', function(assert) {
        var runner = runnerFactory(providerName);
        var switcher = itemThemeSwitcher(runner, runner.getAreaBroker());

        switcher.init()
            .then(function() {
                assert.equal(typeof switcher.$menu, 'object', 'The switcher has pre-rendered the element');
                assert.equal(switcher.$menu.length, 1, 'The switcher has pre-rendered the container');

                switcher.render()
                    .then(function() {
                        var $container = runner.getAreaBroker().getToolboxArea();

                        assert.equal(switcher.getState('ready'), true, 'The switcher is ready');
                        assert.equal($container.find(switcher.$menu).length, 1, 'The switcher has inserted its content into the layout');

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


    QUnit.asyncTest('itemThemeSwitcher.destroy', function(assert) {
        var runner = runnerFactory(providerName);
        var switcher = itemThemeSwitcher(runner, runner.getAreaBroker());

        switcher.init()
            .then(function() {
                assert.equal(switcher.getState('init'), true, 'The switcher is initialised');
                assert.equal(typeof switcher.$menu, 'object', 'The switcher has pre-rendered the element');
                assert.equal(switcher.$menu.length, 1, 'The switcher has pre-rendered the container');

                switcher.render()
                    .then(function() {
                        var $container = runner.getAreaBroker().getToolboxArea();

                        assert.equal(switcher.getState('ready'), true, 'The switcher is ready');
                        assert.equal($container.find(switcher.$menu).length, 1, 'The switcher has inserted its content into the layout');

                        switcher.enable()
                            .then(function() {
                                assert.equal(switcher.getState('enabled'), true, 'The switcher is enabled');

                                switcher.destroy()
                                    .then(function() {
                                        var $container = runner.getAreaBroker().getToolboxArea();

                                        assert.equal(switcher.getState('init'), false, 'The switcher is destroyed');
                                        assert.equal($container.find(switcher.$menu).length, 0, 'The switcher has removed its content from the layout');

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


    QUnit.asyncTest('itemThemeSwitcher.enable', function(assert) {
        var runner = runnerFactory(providerName);
        var switcher = itemThemeSwitcher(runner, runner.getAreaBroker());

        switcher.init()
            .then(function() {
                assert.equal(switcher.getState('init'), true, 'The switcher is initialised');
                assert.equal(switcher.getState('enabled'), false, 'The switcher is disabled');

                switcher.enable()
                    .then(function() {
                        assert.equal(switcher.getState('enabled'), true, 'The switcher is enabled');

                        switcher.destroy()
                            .then(function() {
                                assert.equal(switcher.getState('init'), false, 'The switcher is destroyed');

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


    QUnit.asyncTest('itemThemeSwitcher.disable', function(assert) {
        var runner = runnerFactory(providerName);
        var switcher = itemThemeSwitcher(runner, runner.getAreaBroker());

        switcher.init()
            .then(function() {
                assert.equal(switcher.getState('init'), true, 'The switcher is initialised');
                assert.equal(switcher.getState('enabled'), false, 'The switcher is disabled');

                switcher.enable()
                    .then(function() {
                        assert.equal(switcher.getState('enabled'), true, 'The switcher is enabled');

                        switcher.disable()
                            .then(function() {
                                assert.equal(switcher.getState('enabled'), false, 'The switcher is disabled');

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


    QUnit.asyncTest('itemThemeSwitcher.show/itemThemeSwitcher.hide', function(assert) {
        var runner = runnerFactory(providerName);
        var switcher = itemThemeSwitcher(runner, runner.getAreaBroker());

        switcher.init()
            .then(function() {
                assert.equal(typeof switcher.$menu, 'object', 'The switcher has pre-rendered the element');
                assert.equal(switcher.$menu.length, 1, 'The switcher has pre-rendered the container');

                switcher.render()
                    .then(function() {
                        var $container = runner.getAreaBroker().getToolboxArea();
                        switcher.setState('visible', true);

                        assert.equal(switcher.getState('ready'), true, 'The switcher is ready');
                        assert.equal(switcher.getState('visible'), true, 'The switcher is visible');
                        assert.equal($container.find(switcher.$menu).length, 1, 'The switcher has inserted its content into the layout');

                        switcher.hide()
                            .then(function() {
                                assert.equal(switcher.getState('visible'), false, 'The switcher is not visible');
                                assert.equal(switcher.$button.css('display'), 'none', 'The switcher element is hidden');

                                switcher.show()
                                    .then(function() {
                                        assert.equal(switcher.getState('visible'), true, 'The switcher is visible');
                                        assert.notEqual(switcher.$button.css('display'), 'none', 'The switcher element is visible');

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
