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
    'taoQtiTest/runner/plugins/tools/highlighter/plugin'
], function(_, helpers, runnerFactory, providerMock, pluginFactory) {
    'use strict';

    var pluginApi;
    var providerName = 'mock';
    runnerFactory.registerProvider(providerName, providerMock());

    /**
     * The following tests applies to all plugins
     */
    QUnit.module('pluginFactory');

    QUnit.test('module', 3, function(assert) {
        var runner = runnerFactory(providerName);

        assert.equal(typeof pluginFactory, 'function', "The pluginFactory module exposes a function");
        assert.equal(typeof pluginFactory(runner), 'object', "The plugin factory produces an instance");
        assert.notStrictEqual(pluginFactory(runner), pluginFactory(runner), "The plugin factory provides a different instance on each call");
    });


    pluginApi = [
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
            var timer = pluginFactory(runner);
            assert.equal(typeof timer[data.name], 'function', 'The pluginFactory instances expose a "' + data.name + '" function');
        });


    QUnit.asyncTest('pluginFactory.init', function(assert) {
        var runner = runnerFactory(providerName);
        var plugin = pluginFactory(runner, runner.getAreaBroker());

        plugin.init()
            .then(function() {
                assert.equal(plugin.getState('init'), true, 'The plugin is initialised');

                QUnit.start();
            })
            .catch(function(err) {
                assert.ok(false, 'The init failed: ' + err);
                QUnit.start();
            });
    });


    /**
     * The following tests applies to buttons-type plugins
     */
    QUnit.module('plugin button');

    function getButtonContainer(runner) {
        return runner.getAreaBroker().getToolboxArea();
    }

    QUnit.asyncTest('render/destroy button', function(assert) {
        var runner = runnerFactory(providerName);
        var plugin = pluginFactory(runner, runner.getAreaBroker());

        QUnit.expect(5);

        plugin.init()
            .then(function() {
                plugin.render()
                    .then(function() {
                        var $container = getButtonContainer(runner);
                        var $button = $container.find(plugin.$button);

                        assert.equal(plugin.getState('ready'), true, 'The plugin is ready');
                        assert.equal($button.length, 1, 'The plugin button has been inserted');
                        assert.equal($button.hasClass('disabled'), true, 'The button has been rendered disabled');

                        plugin.destroy()
                            .then(function() {
                                $button = $container.find(plugin.$button);

                                assert.equal(plugin.getState('init'), false, 'The plugin is destroyed');
                                assert.equal($button.length, 0, 'The button has been removed');
                                QUnit.start();
                            })
                            .catch(function(err) {
                                assert.ok(false, 'error in destroy method: ' + err);
                                QUnit.start();
                            });
                    })
                    .catch(function(err) {
                        assert.ok(false, 'error in render method: ' + err);
                        QUnit.start();
                    });
            })
            .catch(function(err) {
                assert.ok(false, 'Error in init method: ' + err);
                QUnit.start();
            });
    });


    QUnit.asyncTest('enable/disable button', function(assert) {
        var runner = runnerFactory(providerName);
        var plugin = pluginFactory(runner, runner.getAreaBroker());

        QUnit.expect(4);

        plugin.init()
            .then(function() {
                plugin.render()
                    .then(function() {
                        plugin.enable()
                            .then(function() {
                                var $container = getButtonContainer(runner);
                                var $button = $container.find(plugin.$button);

                                assert.equal(plugin.getState('enabled'), true, 'The plugin is enabled');
                                assert.equal($button.hasClass('disabled'), false, 'The button is not disabled');

                                plugin.disable()
                                    .then(function() {
                                        assert.equal(plugin.getState('enabled'), false, 'The plugin is disabled');
                                        assert.equal($button.hasClass('disabled'), true, 'The button is disabled');

                                        QUnit.start();
                                    })
                                    .catch(function(err) {
                                        assert.ok(false, 'error in disable method: ' + err);
                                        QUnit.start();
                                    });
                            })
                            .catch(function(err) {
                                assert.ok(false, 'error in enable method: ' + err);
                                QUnit.start();
                            });
                    })
                    .catch(function(err) {
                        assert.ok(false, 'error in render method: ' + err);
                        QUnit.start();
                    });
            })
            .catch(function(err) {
                assert.ok(false, 'Error in init method: ' + err);
                QUnit.start();
            });
    });


    QUnit.asyncTest('show/hide button', function(assert) {
        var runner = runnerFactory(providerName);
        var plugin = pluginFactory(runner, runner.getAreaBroker());

        QUnit.expect(6);

        plugin.init()
            .then(function() {
                plugin.render()
                    .then(function() {
                        var $container = getButtonContainer(runner);
                        var $button = $container.find(plugin.$button);

                        plugin.setState('visible', true);

                        assert.equal(plugin.getState('ready'), true, 'The plugin is ready');
                        assert.equal(plugin.getState('visible'), true, 'The plugin is visible');

                        plugin.hide()
                            .then(function() {
                                assert.equal(plugin.getState('visible'), false, 'The plugin is not visible');
                                assert.equal($button.css('display'), 'none', 'The plugin element is hidden');

                                plugin.show()
                                    .then(function() {
                                        assert.equal(plugin.getState('visible'), true, 'The plugin is visible');
                                        assert.notEqual($button.css('display'), 'none', 'The plugin element is visible');

                                        QUnit.start();
                                    })
                                    .catch(function(err) {
                                        assert.ok(false, 'error in show method: ' + err);
                                        QUnit.start();
                                    });
                            })
                            .catch(function(err) {
                                assert.ok(false, 'error in hide method: ' + err);
                                QUnit.start();
                            });
                    })
                    .catch(function(err) {
                        assert.ok(false, 'error in render method: ' + err);
                        QUnit.start();
                    });
            })
            .catch(function(err) {
                assert.ok(false, 'Error in init method: ' + err);
                QUnit.start();
            });
    });

    QUnit.asyncTest('runner events: loaditem / unloaditem', function(assert) {
        var runner = runnerFactory(providerName);
        var plugin = pluginFactory(runner, runner.getAreaBroker());

        QUnit.expect(3);

        plugin.init()
            .then(function() {
                plugin.render()
                    .then(function() {
                        var $container = getButtonContainer(runner);
                        var $button = $container.find(plugin.$button);

                        runner.trigger('loaditem');

                        assert.notEqual($button.css('display'), 'none', 'The plugin button is visible');

                        runner.trigger('unloaditem');

                        assert.notEqual($button.css('display'), 'none', 'The plugin button is still visible');
                        assert.equal($button.hasClass('disabled'), true, 'The button is disabled');

                        QUnit.start();
                    })
                    .catch(function(err) {
                        assert.ok(false, 'error in render method: ' + err);
                        QUnit.start();
                    });
            })
            .catch(function(err) {
                assert.ok(false, 'Error in init method: ' + err);
                QUnit.start();
            });
    });

    QUnit.asyncTest('runner events: renderitem', function(assert) {
        var runner = runnerFactory(providerName);
        var plugin = pluginFactory(runner, runner.getAreaBroker());

        QUnit.expect(2);

        plugin.init()
            .then(function() {
                return plugin.render()
                    .then(function() {
                        var $container = getButtonContainer(runner);
                        var $button = $container.find(plugin.$button);

                        runner.trigger('renderitem');

                        assert.notEqual($button.css('display'), 'none', 'The plugin button is visible');
                        assert.equal($button.hasClass('disabled'), false, 'The button is not disabled');

                        QUnit.start();
                    });
            })
            .catch(function(err) {
                assert.ok(false, 'An error has occurred: ' + err);
                QUnit.start();
            });
    });

});
