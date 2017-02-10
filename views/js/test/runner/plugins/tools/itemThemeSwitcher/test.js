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
    'ui/hider',
    'taoTests/runner/runner',
    'taoQtiTest/test/runner/mocks/providerMock',
    'taoQtiTest/runner/plugins/tools/itemThemeSwitcher/itemThemeSwitcher'
], function(_, helpers, hider, runnerFactory, providerMock, pluginFactory) {
    'use strict';

    var pluginApi;
    var providerName = 'mock';
    runnerFactory.registerProvider(providerName, providerMock());

    QUnit.module('itemThemeSwitcher');


    QUnit.test('module', 3, function(assert) {
        var runner = runnerFactory(providerName);

        assert.equal(typeof pluginFactory, 'function', "The itemThemeSwitcher module exposes a function");
        assert.equal(typeof pluginFactory(runner), 'object', "The itemThemeSwitcher factory produces an instance");
        assert.notStrictEqual(pluginFactory(runner), pluginFactory(runner), "The itemThemeSwitcher factory provides a different instance on each call");
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
            assert.equal(typeof timer[data.name], 'function', 'The itemThemeSwitcher instances expose a "' + data.name + '" function');
        });



    /**
     * The following tests applies to buttons-type plugins
     */
    QUnit.module('plugin button');

    QUnit.asyncTest('render/destroy button', function(assert) {
        var runner = runnerFactory(providerName);
        var areaBroker = runner.getAreaBroker();
        var plugin = pluginFactory(runner, areaBroker);

        QUnit.expect(3);

        plugin.init()
            .then(function() {
                var $container = areaBroker.getToolboxArea(),
                    $buttonMain;

                areaBroker.getToolbox().render($container);

                $buttonMain = $container.find('[data-control="color-contrast"]');

                assert.equal($buttonMain.length, 1, 'The button has been inserted');
                assert.equal($buttonMain.hasClass('disabled'), true, 'The button has been rendered disabled');

                areaBroker.getToolbox().destroy();

                $buttonMain = $container.find('[data-control="highlight-trigger"]');

                assert.equal($buttonMain.length, 0, 'The trigger button has been removed');
                QUnit.start();

            })
            .catch(function(err) {
                assert.ok(false, 'Error in init method: ' + err);
                QUnit.start();
            });
    });


    QUnit.asyncTest('enable/disable button', function(assert) {
        var runner = runnerFactory(providerName);
        var areaBroker = runner.getAreaBroker();
        var plugin = pluginFactory(runner, areaBroker);

        QUnit.expect(3);

        plugin.init()
            .then(function() {
                var $container = areaBroker.getToolboxArea(),
                    $buttonMain;

                areaBroker.getToolbox().render($container);

                $buttonMain = $container.find('[data-control="color-contrast"]');
                assert.equal($buttonMain.length, 1, 'The button has been inserted');

                plugin.enable()
                    .then(function() {

                        assert.equal($buttonMain.hasClass('disabled'), false, 'The button has been enabled');

                        plugin.disable()
                            .then(function() {
                                assert.equal($buttonMain.hasClass('disabled'), true, 'The button has been disabled');

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
                assert.ok(false, 'Error in init method: ' + err);
                QUnit.start();
            });
    });


    QUnit.asyncTest('show/hide button', function(assert) {
        var runner = runnerFactory(providerName);
        var areaBroker = runner.getAreaBroker();
        var plugin = pluginFactory(runner, areaBroker);

        QUnit.expect(3);

        plugin.init()
            .then(function() {
                var $container = areaBroker.getToolboxArea(),
                    $buttonMain;

                areaBroker.getToolbox().render($container);

                $buttonMain = $container.find('[data-control="color-contrast"]');
                assert.equal($buttonMain.length, 1, 'The button has been inserted');

                plugin.hide()
                    .then(function() {
                        assert.ok(hider.isHidden($buttonMain), 'The button has been hidden');

                        plugin.show()
                            .then(function() {
                                assert.ok(! hider.isHidden($buttonMain), 'The button is visible');

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
                assert.ok(false, 'Error in init method: ' + err);
                QUnit.start();
            });
    });


    QUnit.asyncTest('runner events: loaditem / unloaditem', function(assert) {
        var runner = runnerFactory(providerName);
        var areaBroker = runner.getAreaBroker();
        var plugin = pluginFactory(runner, areaBroker);

        QUnit.expect(4);

        plugin.init()
            .then(function() {
                var $container = areaBroker.getToolboxArea(),
                    $buttonMain;

                areaBroker.getToolbox().render($container);

                $buttonMain = $container.find('[data-control="color-contrast"]');
                assert.equal($buttonMain.length, 1, 'The button has been inserted');

                runner.trigger('loaditem');

                assert.ok(! hider.isHidden($buttonMain), 'The button is visible');

                runner.trigger('unloaditem');

                assert.ok(! hider.isHidden($buttonMain), 'The button is still visible');

                assert.equal($buttonMain.hasClass('disabled'), true, 'The button has been disabled');

                QUnit.start();
            })
            .catch(function(err) {
                assert.ok(false, 'Error in init method: ' + err);
                QUnit.start();
            });
    });


    QUnit.asyncTest('runner events: renderitem', function(assert) {
        var runner = runnerFactory(providerName);
        var areaBroker = runner.getAreaBroker();
        var plugin = pluginFactory(runner, areaBroker);

        QUnit.expect(3);

        plugin.init()
            .then(function() {
                var $container = areaBroker.getToolboxArea(),
                    $buttonMain;

                areaBroker.getToolbox().render($container);

                $buttonMain = $container.find('[data-control="color-contrast"]');
                assert.equal($buttonMain.length, 1, 'The button has been inserted');

                runner.trigger('renderitem');

                assert.ok(! hider.isHidden($buttonMain), 'The button is visible');

                assert.equal($buttonMain.hasClass('disabled'), false, 'The button is not disabled');

                QUnit.start();
            })
            .catch(function(err) {
                assert.ok(false, 'Error in init method: ' + err);
                QUnit.start();
            });
    });

});
