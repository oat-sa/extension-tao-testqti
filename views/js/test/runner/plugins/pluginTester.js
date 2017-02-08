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
    'taoQtiTest/test/runner/mocks/providerMock'
], function(_, helpers, runnerFactory, providerMock) {
    'use strict';

    var providerName = 'mock';
    runnerFactory.registerProvider(providerName, providerMock());

    return function pluginTesterFactory(config) {
        var QUnit = config.QUnit,
            pluginName = config.pluginName,
            pluginFactory = config.pluginFactory;

        var pluginTester;

        pluginTester = {
            testModule: function testModule() {
                QUnit.module(pluginName + ': pluginFactory');

                QUnit.test('module', function(assert) {
                    var runner = runnerFactory(providerName);

                    assert.equal(typeof pluginFactory, 'function', 'The pluginFactory module exposes a function');
                    assert.equal(typeof pluginFactory(runner), 'object', 'The plugin factory produces an instance');
                    assert.notStrictEqual(pluginFactory(runner), pluginFactory(runner), 'The plugin factory provides a different instance on each call');
                });
            },

            testApi: function testApi() {
                var pluginApi = [
                    { name : 'init',            title : 'init' },
                    { name : 'render',          title : 'render' },
                    { name : 'finish',          title : 'finish' },
                    { name : 'destroy',         title : 'destroy' },
                    { name : 'trigger',         title : 'trigger' },
                    { name : 'getTestRunner',   title : 'getTestRunner' },
                    { name : 'getAreaBroker',   title : 'getAreaBroker' },
                    { name : 'getConfig',       title : 'getConfig' },
                    { name : 'setConfig',       title : 'setConfig' },
                    { name : 'getState',        title : 'getState' },
                    { name : 'setState',        title : 'setState' },
                    { name : 'show',            title : 'show' },
                    { name : 'hide',            title : 'hide' },
                    { name : 'enable',          title : 'enable' },
                    { name : 'disable',         title : 'disable' }
                ];

                QUnit.module(pluginName + ': plugin API test');

                QUnit
                    .cases(pluginApi)
                    .test('plugin API ', function(data, assert) {
                        var runner = runnerFactory(providerName);
                        var plugin = pluginFactory(runner);
                        QUnit.expect(1);
                        assert.equal(typeof plugin[data.name], 'function', 'The pluginFactory instances expose a "' + data.name + '" function');
                    });
            },


            testNavigationButton: function testNavigationButton(buttonName, buttonSelector) {
                QUnit.asyncTest(pluginName + ', button ' + buttonName + ': render/enable/disable/destroy', function(assert) {
                    var runner = runnerFactory(providerName),
                        areaBroker = runner.getAreaBroker(),
                        plugin = pluginFactory(runner, areaBroker),
                        $container = areaBroker.getNavigationArea();

                    QUnit.expect(11);

                    plugin.init()
                        .then(function() {
                            assert.equal(plugin.getState('init'), true, 'The plugin has been initialized');

                            // rendering
                            return plugin.render().then(function() {
                                var $button = $container.find(buttonSelector);

                                assert.equal(plugin.getState('ready'), true, 'The plugin is ready');
                                assert.equal($button.length, 1, 'The plugin button has been inserted in the right place');
                                assert.equal($button.hasClass('disabled'), true, 'The button has been rendered disabled');

                                // enabling
                                return plugin.enable().then(function() {
                                    assert.equal(plugin.getState('enabled'), true, 'The plugin is enabled');
                                    assert.equal($button.hasClass('disabled'), false, 'The button is not disabled');

                                    // disabling
                                    return plugin.disable().then(function() {
                                        assert.equal(plugin.getState('enabled'), false, 'The plugin is disabled');
                                        assert.equal($button.hasClass('disabled'), true, 'The button is disabled');
                                        assert.equal($button.hasClass('active'), false, 'The button is turned off');

                                        // destroying
                                        return plugin.destroy().then(function() {
                                            $button = $container.find(plugin.$button);

                                            assert.equal(plugin.getState('init'), false, 'The plugin is destroyed');
                                            assert.equal($button.length, 0, 'The button has been removed');
                                            QUnit.start();
                                        });
                                    });
                                });
                            });
                        })
                        .catch(function(err) {
                            assert.ok(false, 'Unexpected failure : ' + err.message);
                            QUnit.start();
                        });
                });

                QUnit.asyncTest(pluginName + ', button ' + buttonName + ': show/hide', function(assert) {
                    var runner = runnerFactory(providerName),
                        areaBroker = runner.getAreaBroker(),
                        plugin = pluginFactory(runner, areaBroker),
                        $container = areaBroker.getNavigationArea();

                    QUnit.expect(7);

                    plugin.init()
                        .then(function() {
                            return plugin.render().then(function() {
                                var $button = $container.find(buttonSelector);

                                plugin.setState('visible', true);

                                assert.equal(plugin.getState('ready'), true, 'The plugin is ready');
                                assert.equal($button.length, 1, 'The plugin button has been inserted in the right place');
                                assert.equal(plugin.getState('visible'), true, 'The plugin is visible');

                                // hiding
                                return plugin.hide().then(function() {
                                    assert.equal(plugin.getState('visible'), false, 'The plugin is not visible');
                                    assert.equal($button.css('display'), 'none', 'The plugin element is hidden');

                                    // showing
                                    return plugin.show().then(function() {
                                        assert.equal(plugin.getState('visible'), true, 'The plugin is visible');
                                        assert.notEqual($button.css('display'), 'none', 'The plugin element is visible');

                                        QUnit.start();
                                    });
                                });
                            });
                        })
                        .catch(function(err) {
                            assert.ok(false, 'Unexpected failure : ' + err.message);
                            QUnit.start();
                        });
                });
            },


            testToolboxButton: function testToolboxButton(buttonName, buttonSelector) {
                QUnit.asyncTest(pluginName + ', button ' + buttonName + ': render/enable/disable/destroy', function (assert) {
                    var runner      = runnerFactory(providerName),
                        areaBroker  = runner.getAreaBroker(),
                        plugin      = pluginFactory(runner, areaBroker),
                        toolbox     = areaBroker.getToolbox(),
                        $container  = areaBroker.getToolboxArea(),
                        $button;

                    QUnit.expect(12);

                    plugin.init()
                        .then(function () {
                            assert.equal(plugin.getState('init'), true, 'The plugin has been initialized');

                            // toolbox rendering
                            toolbox.render($container);

                            $button = $container.find(buttonSelector);

                            assert.equal($button.length, 1, 'The plugin button has been inserted in the right place');
                            assert.equal($button.hasClass('disabled'), true, 'The button has been rendered disabled');

                            // Plugin rendering
                            return plugin.render().then(function () {
                                assert.equal(plugin.getState('ready'), true, 'The plugin is ready');

                                // enabling
                                return plugin.enable().then(function () {
                                    assert.equal(plugin.getState('enabled'), true, 'The plugin is enabled');
                                    assert.equal($button.hasClass('disabled'), false, 'The button is not disabled');

                                    // disabling
                                    return plugin.disable().then(function () {
                                        assert.equal(plugin.getState('enabled'), false, 'The plugin is disabled');
                                        assert.equal($button.hasClass('disabled'), true, 'The button is disabled');
                                        assert.equal($button.hasClass('active'), false, 'The button is turned off');

                                        // plugin destroying
                                        return plugin.destroy().then(function () {
                                            $button = $container.find(buttonSelector);

                                            assert.equal(plugin.getState('init'), false, 'The plugin is destroyed');
                                            assert.equal($button.length, 1, 'The plugin button has not been destroyed by the plugin');

                                            // toolbox destroying
                                            toolbox.destroy();

                                            $button = $container.find(buttonSelector);

                                            assert.equal($button.length, 0, 'The button has been removed');
                                            QUnit.start();
                                        });
                                    });
                                });
                            });
                        })
                        .catch(function (err) {
                            assert.ok(false, 'Unexpected failure : ' + err.message);
                            QUnit.start();
                        });
                });

                QUnit.asyncTest(pluginName + ', button ' + buttonName + ': show/hide', function (assert) {
                    var runner      = runnerFactory(providerName),
                        areaBroker  = runner.getAreaBroker(),
                        plugin      = pluginFactory(runner, areaBroker),
                        toolbox     = areaBroker.getToolbox(),
                        $container  = areaBroker.getToolboxArea(),
                        $button;

                    QUnit.expect(7);

                    plugin.init()
                        .then(function () {
                            assert.equal(plugin.getState('init'), true, 'The plugin has been initialized');

                            // toolbox rendering
                            toolbox.render($container);

                            $button = $container.find(buttonSelector);

                            plugin.setState('visible', true);

                            assert.equal($button.length, 1, 'The plugin button has been inserted in the right place');
                            assert.equal(plugin.getState('visible'), true, 'The plugin is visible');

                            // hiding
                            return plugin.hide().then(function () {
                                assert.equal(plugin.getState('visible'), false, 'The plugin is not visible');
                                assert.equal($button.css('display'), 'none', 'The plugin element is hidden');

                                // showing
                                return plugin.show().then(function () {
                                    assert.equal(plugin.getState('visible'), true, 'The plugin is visible');
                                    assert.notEqual($button.css('display'), 'none', 'The plugin element is visible');

                                    QUnit.start();
                                });
                            });
                        })
                        .catch(function (err) {
                            assert.ok(false, 'Unexpected failure : ' + err.message);
                            QUnit.start();
                        });
                });
            }

        };

        return pluginTester;
    };
});
