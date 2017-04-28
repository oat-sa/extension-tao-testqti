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
 * Copyright (c) 2017 (original work) Open Assessment Technologies SA ;
 */
/**
 * @author Christophe Noël <christophe@taotesting.com>
 */
define([
    'jquery',
    'lodash',
    'helpers',
    'ui/hider',
    'taoTests/runner/runner',
    'taoQtiTest/test/runner/mocks/providerMock',
    'taoQtiTest/runner/plugins/tools/answerMasking/plugin',
    'lib/simulator/jquery.simulate'
], function($, _, helpers, hider, runnerFactory, providerMock, pluginFactory) {
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

    QUnit.asyncTest('render/destroy button', function(assert) {
        var runner = runnerFactory(providerName);
        var areaBroker = runner.getAreaBroker();
        var plugin = pluginFactory(runner, runner.getAreaBroker());

        QUnit.expect(3);

        plugin.init()
            .then(function() {
                var $container = runner.getAreaBroker().getToolboxArea(),
                    $button;

                areaBroker.getToolbox().render($container);

                $button = $container.find('[data-control="answer-masking"]');

                assert.equal($button.length, 1, 'The button has been inserted');
                assert.equal($button.hasClass('disabled'), true, 'The button has been rendered disabled');

                areaBroker.getToolbox().destroy();

                $button = $container.find('[data-control="answer-masking"]');

                assert.equal($button.length, 0, 'The button has been removed');
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
        var plugin = pluginFactory(runner, runner.getAreaBroker());

        QUnit.expect(2);

        plugin.init()
            .then(function() {
                var $container = runner.getAreaBroker().getToolboxArea(),
                    $button;

                areaBroker.getToolbox().render($container);

                return plugin.enable()
                    .then(function() {
                        $button = $container.find('[data-control="answer-masking"]');

                        assert.equal($button.hasClass('disabled'), false, 'The button has been enabled');

                        return plugin.disable()
                            .then(function() {
                                assert.equal($button.hasClass('disabled'), true, 'The button has been disabled');

                                QUnit.start();
                            });
                    });
            })
            .catch(function(err) {
                assert.ok(false, 'Unexpected error: ' + err);
                QUnit.start();
            });
    });


    QUnit.asyncTest('show/hide button', function(assert) {
        var runner = runnerFactory(providerName);
        var areaBroker = runner.getAreaBroker();
        var plugin = pluginFactory(runner, runner.getAreaBroker());

        QUnit.expect(3);

        plugin.init()
            .then(function() {
                var $container = runner.getAreaBroker().getToolboxArea(),
                    $button;

                areaBroker.getToolbox().render($container);

                return plugin.hide()
                    .then(function() {
                        $button = $container.find('[data-control="answer-masking"]');

                        assert.ok(hider.isHidden($button), 'The button has been hidden');

                        return plugin.show()
                            .then(function() {
                                assert.ok(! hider.isHidden($button), 'The button is visible');

                                return plugin.hide().then(
                                    function() {
                                        assert.ok(hider.isHidden($button), 'The button has been hidden again');

                                        QUnit.start();
                                    });
                            });
                    });
            })
            .catch(function(err) {
                assert.ok(false, 'Unexpected error: ' + err);
                QUnit.start();
            });
    });


    QUnit.asyncTest('runner events: loaditem / unloaditem', function(assert) {
        var runner = runnerFactory(providerName);
        var areaBroker = runner.getAreaBroker();
        var plugin = pluginFactory(runner, runner.getAreaBroker());

        QUnit.expect(3);

        runner.setTestContext({
            options: {
                answerMasking: true
            }
        });

        areaBroker.getContentArea().append($('<div>', {
            class: 'qti-choiceInteraction'
        }));

        plugin.init()
            .then(function() {
                var $container = runner.getAreaBroker().getToolboxArea(),
                    $button;

                areaBroker.getToolbox().render($container);

                $button = $container.find('[data-control="answer-masking"]');

                runner.trigger('loaditem');

                assert.ok(! hider.isHidden($button), 'The button is visible');

                runner.trigger('unloaditem');

                assert.ok(! hider.isHidden($button), 'The button is still visible');

                assert.equal($button.hasClass('disabled'), true, 'The trigger button has been disabled');

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
        var plugin = pluginFactory(runner, runner.getAreaBroker());

        QUnit.expect(2);

        runner.setTestContext({
            options: {
                answerMasking: true
            }
        });

        areaBroker.getContentArea().append($('<div>', {
            class: 'qti-choiceInteraction'
        }));

        plugin.init()
            .then(function() {
                var $container = runner.getAreaBroker().getToolboxArea(),
                    $button;

                areaBroker.getToolbox().render($container);

                runner.trigger('renderitem');

                $button = $container.find('[data-control="answer-masking"]');

                assert.ok(! hider.isHidden($button), 'The button is visible');

                assert.equal($button.hasClass('disabled'), false, 'The button is not disabled');

                QUnit.start();
            })
            .catch(function(err) {
                assert.ok(false, 'Error in init method: ' + err);
                QUnit.start();
            });
    });


    /**
     * The following tests applies to plugin UI (mouse click and keyboard shortcuts)
     */
    QUnit.module('plugin UI');

    QUnit.asyncTest('Toggle on keyboard shortcut', function(assert) {
        var runner = runnerFactory(providerName),
            areaBroker = runner.getAreaBroker(),
            plugin = pluginFactory(runner, runner.getAreaBroker()),
            $contentContainer = areaBroker.getContentArea(),
            toggleCounter = 0,
            $button;

        QUnit.expect(5);

        runner.setTestContext({
            options: {
                answerMasking: true
            }
        });

        runner.setTestData({
            config: {
                allowShortcuts: true,
                shortcuts: {
                    'answer-masking': {
                        toggle: 'c'
                    }
                }
            }
        });

        areaBroker.getContentArea().append($('<div>', {
            class: 'qti-choiceInteraction'
        }));

        runner.after('tool-answer-masking-toggle', function() {
            toggleCounter++;

            if (toggleCounter === 1) {
                assert.ok(true, 'first keypressed has triggered the correct event');
                assert.equal($button.hasClass('active'), true, 'button is turned on');

                $(document).simulate('keydown', {
                    charCode: 0,
                    keyCode: 67,
                    which: 67,
                    code: 'KeyC',
                    key: 'c',
                    ctrlKey: false,
                    shiftKey: false,
                    altKey: false,
                    metaKey: false
                });
            } else if (toggleCounter === 2) {
                assert.ok(true, 'second keypressed has triggered the correct event');
                assert.equal($button.hasClass('active'), false, 'button is turned off again');
                QUnit.start();
            }
        });

        plugin.init()
            .then(function() {
                var $toolboxContainer = areaBroker.getToolboxArea();

                areaBroker.getToolbox().render($toolboxContainer);
                $button = areaBroker.getToolboxArea().find('[data-control="answer-masking"]');

                runner.trigger('renderitem');

                assert.equal($button.hasClass('active'), false, 'button is turned off');

                $contentContainer.simulate('keydown', {
                    charCode: 0,
                    keyCode: 67,
                    which: 67,
                    code: 'KeyC',
                    key: 'c',
                    ctrlKey: false,
                    shiftKey: false,
                    altKey: false,
                    metaKey: false
                });
            })
            .catch(function(err) {
                assert.ok(false, 'Unexpected error: ' + err);
                QUnit.start();
            });
    });


    QUnit.asyncTest('Toggle on click', function(assert) {
        var runner = runnerFactory(providerName);
        var areaBroker = runner.getAreaBroker();
        var plugin = pluginFactory(runner, runner.getAreaBroker());
        var toggleCounter = 0;
        var $button;

        QUnit.expect(5);

        runner.setTestContext({
            options: {
                answerMasking: true
            }
        });

        areaBroker.getContentArea().append($('<div>', {
            class: 'qti-choiceInteraction'
        }));

        runner.after('tool-answer-masking-toggle', function() {
            toggleCounter++;

            if (toggleCounter === 1) {
                assert.ok(true, 'first click has triggered the correct event');
                assert.equal($button.hasClass('active'), true, 'button is turned on');
                $button.click();

            } else if (toggleCounter === 2) {
                assert.ok(true, 'second click has triggered the correct event');
                assert.equal($button.hasClass('active'), false, 'button is turned off again');
                QUnit.start();
            }
        });

        plugin.init()
            .then(function() {
                var $toolboxContainer = areaBroker.getToolboxArea();

                areaBroker.getToolbox().render($toolboxContainer);
                $button = areaBroker.getToolboxArea().find('[data-control="answer-masking"]');

                runner.trigger('renderitem');

                assert.equal($button.hasClass('active'), false, 'button is turned off');

                $button.click();
            })
            .catch(function(err) {
                assert.ok(false, 'Unexpected error: ' + err);
                QUnit.start();
            });
    });

});
