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
 * Copyright (c) 2017 (original work) Open Assessment Technologies SA
 */

define([
    'taoTests/runner/runner',
    'taoQtiTest/test/runner/mocks/providerMock',
    'taoQtiTest/runner/plugins/tools/answerElimination/eliminator'
], function(runnerFactory, providerMock, pluginFactory) {
    'use strict';

    var pluginApi;
    var providerName = 'mock';
    runnerFactory.registerProvider(providerName, providerMock());

    /**
     * Generic tests
     */
    QUnit.module('pluginFactory');

    QUnit.test('module', function(assert) {
        var runner = runnerFactory(providerName);

        QUnit.expect(3);

        assert.equal(typeof pluginFactory, 'function', 'The pluginFactory module exposes a function');
        assert.equal(typeof pluginFactory(runner), 'object', 'The plugin factory produces an instance');
        assert.notStrictEqual(pluginFactory(runner), pluginFactory(runner), 'The plugin factory provides a different instance on each call');
    });

    pluginApi = [
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

    QUnit.module('Plugin API');

    QUnit
        .cases(pluginApi)
        .test('plugin API ', function(data, assert) {
            var runner = runnerFactory(providerName);
            var plugin = pluginFactory(runner);
            QUnit.expect(1);
            assert.equal(typeof plugin[data.name], 'function', 'The pluginFactory instances expose a "' + data.name + '" function');
        });


    /**
     * Button
     */
    QUnit.module('Button');

    QUnit.asyncTest('render/enable/disable/destroy', function (assert) {
        var runner      = runnerFactory(providerName),
            areaBroker  = runner.getAreaBroker(),
            plugin      = pluginFactory(runner, areaBroker),
            toolbox     = areaBroker.getToolbox(),
            $container  = areaBroker.getToolboxArea(),
            buttonSelector = '[data-control="eliminator"]',
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

    QUnit.asyncTest('show/hide', function (assert) {
        var runner      = runnerFactory(providerName),
            areaBroker  = runner.getAreaBroker(),
            plugin      = pluginFactory(runner, areaBroker),
            toolbox     = areaBroker.getToolbox(),
            $container  = areaBroker.getToolboxArea(),
            buttonSelector = '[data-control="eliminator"]',
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

    QUnit.asyncTest('runner events: loaditem / unloaditem', function(assert) {
        var runner      = runnerFactory(providerName),
            areaBroker  = runner.getAreaBroker(),
            plugin      = pluginFactory(runner, runner.getAreaBroker()),
            toolbox     = areaBroker.getToolbox(),
            $container  = areaBroker.getToolboxArea(),
            buttonSelector = '[data-control="eliminator"]',
            $button;

        runner.setTestContext({
            options: {
                eliminator: true
            }
        });

        QUnit.expect(4);

        plugin.init()
            .then(function() {
                toolbox.render($container);

                $button = $container.find(buttonSelector);

                assert.equal($button.length, 1, 'The plugin button has been inserted in the right place');

                runner.trigger('loaditem');

                assert.notEqual($button.css('display'), 'none', 'The plugin button is visible');

                runner.trigger('unloaditem');

                assert.notEqual($button.css('display'), 'none', 'The plugin button is still visible');
                assert.equal($button.hasClass('disabled'), true, 'The button is disabled');

                QUnit.start();
            })
            .catch(function(err) {
                assert.ok(false, 'Error in init method: ' + err);
                QUnit.start();
            });
    });

    QUnit.asyncTest('runner events: renderitem', function(assert) {
        var runner      = runnerFactory(providerName);
        var plugin      = pluginFactory(runner, runner.getAreaBroker()),
            areaBroker  = runner.getAreaBroker(),
            toolbox     = areaBroker.getToolbox(),
            $container  = areaBroker.getToolboxArea(),
            buttonSelector = '[data-control="eliminator"]',
            $button,
            interaction = document.querySelector('.qti-choiceInteraction');

        areaBroker.getContentArea().append(interaction);

        runner.setTestContext({
            options: {
                eliminator: true
            }
        });

        QUnit.expect(3);

        plugin.init()
            .then(function() {
                toolbox.render($container);

                $button = $container.find(buttonSelector);

                assert.equal($button.length, 1, 'The plugin button has been inserted in the right place');

                runner.trigger('renderitem');

                assert.notEqual($button.css('display'), 'none', 'The plugin button is visible');
                assert.equal($button.hasClass('disabled'), false, 'The button is not disabled');

                QUnit.start();
            })
            .catch(function(err) {
                assert.ok(false, 'An error has occurred: ' + err);
                QUnit.start();
            });
    });

});
