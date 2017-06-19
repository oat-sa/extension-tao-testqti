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
 * Copyright (c) 2017 (original work) Open Assessment Technologies SA;
 */
/**
 * @author Christophe Noël <christophe@taotesting.com>
 */
define([
    'lodash',
    'jquery',
    'taoTests/runner/runner',
    'taoQtiTest/test/runner/mocks/providerMock',
    'taoQtiTest/test/runner/mocks/areaBrokerMock',
    'taoQtiTest/runner/plugins/content/responsiveness/collapser'
], function (_, $, runnerFactory, providerMock, areaBrokerMock, pluginFactory) {
    'use strict';

    var fixtureId = '#qunit-fixture';

    var noLabelCls = 'tool-label-collapsed',
        noLabelHoverCls = 'tool-label-collapsed-hover';

    var ICON_WIDTH = 20,
        TEXT_WIDTH = 80,
        BUTTON_WIDTH = ICON_WIDTH + TEXT_WIDTH,

        ALL_EXPANDED =
            6 * BUTTON_WIDTH   // 4 toolbox buttons + 2 nav buttons
            + ICON_WIDTH       // 1 toolbox button always collapsed
            + 20;              // nav padding

    var providerName = 'mock';
    runnerFactory.registerProvider(providerName, providerMock());

    QUnit.module('Module');

    QUnit.test('Module export', function (assert) {
        QUnit.expect(1);

        assert.ok(typeof pluginFactory === 'function', 'The module expose a function');
    });

    function getAreaBroker($brokerContainer) {
        var $actionsBar = $brokerContainer.find('.bottom-action-bar .control-box'),
            $nav        = $brokerContainer.find('.navi-container'),
            $toolbox    = $brokerContainer.find('.tools-box');

        return areaBrokerMock({
            $brokerContainer: $brokerContainer,
            mapping: {
                actionsBar: $actionsBar,
                toolbox:    $toolbox,
                navigation: $nav
            }
        });
    }

    function setPluginConfig(runner, config) {
        runner.setTestData({
            config: {
                plugins: {
                    collapser: config
                }
            }
        });
    }

    QUnit.module('Collapser');

    QUnit.asyncTest('collapse/expand all tools and nav on resize', function(assert) {
        var $container = $(fixtureId),
            areaBroker = getAreaBroker($container),
            runner,
            plugin;

        var $actionsBar,
            $nav,
            $toolbox,
            resizeCount = 0;

        QUnit.expect(6);

        runnerFactory.registerProvider(providerName, providerMock({ areaBroker: areaBroker }));
        runner = runnerFactory(providerName);
        plugin = pluginFactory(runner, areaBroker);

        setPluginConfig(runner, {
            collapseTools: true,
            collapseNavigation: true
        });

        runner.after('collapseTools', function() {
            resizeCount++;

            switch (resizeCount) {
                case 1: {
                    assert.ok(! $nav.hasClass(noLabelCls), 'nav is expanded');
                    assert.ok(! $toolbox.hasClass(noLabelCls), 'toolbox is expanded');

                    $actionsBar.width(300);
                    runner.trigger('collapseTools');
                    break;
                }
                case 2: {
                    assert.ok($nav.hasClass(noLabelCls), 'nav has been collapsed');
                    assert.ok($toolbox.hasClass(noLabelCls), 'toolbox has been collapsed');

                    $actionsBar.width(ALL_EXPANDED);
                    runner.trigger('collapseTools');
                    break;
                }
                case 3: {
                    assert.ok(! $nav.hasClass(noLabelCls), 'nav is expanded');
                    assert.ok(! $toolbox.hasClass(noLabelCls), 'toolbox is expanded');

                    QUnit.start();
                    break;
                }
            }
        });

        plugin.init()
            .then(function() {
                $actionsBar  = areaBroker.getArea('actionsBar');
                $nav         = areaBroker.getArea('navigation');
                $toolbox     = areaBroker.getArea('toolbox');

                $actionsBar.width(ALL_EXPANDED);
                runner.trigger('loaditem');
            })
            .catch(function(err) {
                assert.ok(false, 'Error in init method: ' + err);
                QUnit.start();
            });
    });

    QUnit.asyncTest('collapse/expand all tools in order', function(assert) {
        var $container = $(fixtureId),
            areaBroker = getAreaBroker($container),
            runner,
            plugin;

        var collapseOrder = [
            '.button1',
            '.button2,.button3,.button4',
            '.button5',
            '.prev,.next'
        ];

        var $actionsBar,
            $collapsed,
            newWidth,
            resizeCount = 0;

        // QUnit.expect(6);

        runnerFactory.registerProvider(providerName, providerMock({ areaBroker: areaBroker }));
        runner = runnerFactory(providerName);
        plugin = pluginFactory(runner, areaBroker);

        setPluginConfig(runner, {
            collapseTools: false,
            collapseInOrder: true,
            collapseOrder: collapseOrder
        });

        runner.after('collapseTools', function() {
            resizeCount++;

            switch (resizeCount) {
                case 1: {
                    $collapsed = $container.find('.' + noLabelCls);
                    assert.equal($collapsed.length,  0, 'nothing is collapsed');

                    newWidth = $actionsBar.width() - TEXT_WIDTH;
                    $actionsBar.width(newWidth);
                    runner.trigger('collapseTools');
                    break;
                }
                case 2: {
                    $collapsed = $container.find('.' + noLabelCls);
                    assert.equal($collapsed.length,  1, '1 button is collapsed');
                    assert.ok($container.find(collapseOrder[0]).hasClass(noLabelCls), 'button1 has been collapsed');

                    newWidth = $actionsBar.width() - (TEXT_WIDTH * 2);
                    $actionsBar.width(newWidth);
                    runner.trigger('collapseTools');
                    break;
                }
                case 3: {
                    $collapsed = $container.find('.' + noLabelCls);
                    assert.equal($collapsed.length,  3, '3 buttons are collapsed');
                    assert.ok($container.find(collapseOrder[0]).hasClass(noLabelCls), 'button1 has been collapsed');
                    assert.ok($container.find('.button2').hasClass(noLabelCls), 'button2 has been collapsed');
                    assert.ok(! $container.find('.button3').hasClass(noLabelCls), 'button3 has NOT been collapsed (always collapsed, see markup in test.html)');
                    assert.ok($container.find('.button4').hasClass(noLabelCls), 'button4 has been collapsed');

                    newWidth = $actionsBar.width() - TEXT_WIDTH;
                    $actionsBar.width(newWidth);
                    runner.trigger('collapseTools');
                    break;
                }
                case 4: {
                    $collapsed = $container.find('.' + noLabelCls);
                    assert.equal($collapsed.length,  4, '4 buttons are collapsed');
                    assert.ok($container.find(collapseOrder[0]).hasClass(noLabelCls), 'button1 has been collapsed');
                    assert.ok($container.find('.button2').hasClass(noLabelCls), 'button2 has been collapsed');
                    assert.ok(! $container.find('.button3').hasClass(noLabelCls), 'button3 has NOT been collapsed (always collapsed, see markup in test.html)');
                    assert.ok($container.find('.button4').hasClass(noLabelCls), 'button4 has been collapsed');
                    assert.ok($container.find(collapseOrder[2]).hasClass(noLabelCls), 'button5 has been collapsed');

                    newWidth = $actionsBar.width() - TEXT_WIDTH;
                    $actionsBar.width(newWidth);
                    runner.trigger('collapseTools');
                    break;
                }
                case 5: {
                    $collapsed = $container.find('.' + noLabelCls);
                    assert.equal($collapsed.length,  6, '6 buttons are collapsed');
                    assert.ok($container.find(collapseOrder[0]).hasClass(noLabelCls), 'button1 has been collapsed');
                    assert.ok($container.find('.button2').hasClass(noLabelCls), 'button2 has been collapsed');
                    assert.ok(! $container.find('.button3').hasClass(noLabelCls), 'button3 has NOT been collapsed (always collapsed, see markup in test.html)');
                    assert.ok($container.find('.button4').hasClass(noLabelCls), 'button4 has been collapsed');
                    assert.ok($container.find(collapseOrder[2]).hasClass(noLabelCls), 'button5 has been collapsed');
                    assert.ok($container.find(collapseOrder[3]).hasClass(noLabelCls), 'prev & next has been collapsed');

                    newWidth = $actionsBar.width() - TEXT_WIDTH;
                    $actionsBar.width(newWidth);
                    runner.trigger('collapseTools');

                    QUnit.start();
                    break;
                }
            }
        });

        plugin.init()
            .then(function() {
                $actionsBar  = areaBroker.getArea('actionsBar');

                $actionsBar.width(ALL_EXPANDED);
                runner.trigger('loaditem');
            })
            .catch(function(err) {
                assert.ok(false, 'Error in init method: ' + err);
                QUnit.start();
            });
    });


    QUnit.module('Visual test');

    QUnit.asyncTest('Display and play', function(assert) {
        var visualProviderName = 'visual',
            $brokerContainer = $('#outside-container'),
            areaBroker = areaBrokerMock({
                $brokerContainer: $brokerContainer,
                mapping: {
                    actionsBar:   $brokerContainer.find('.bottom-action-bar .control-box'),
                    toolbox:      $brokerContainer.find('.tools-box'),
                    navigation:   $brokerContainer.find('.navi-box-list')
                }
            }),
            runner,
            plugin;

        QUnit.expect(1);

        $brokerContainer.append($(fixtureId).html());

        runnerFactory.registerProvider(visualProviderName, providerMock({ areaBroker: areaBroker }));
        runner = runnerFactory(visualProviderName);
        plugin = pluginFactory(runner, areaBroker);

        plugin.init()
            .then(function() {
                runner.trigger('loaditem');

                assert.ok(true);
                QUnit.start();
            })
            .catch(function(err) {
                assert.ok(false, 'Error in init method: ' + err);
                QUnit.start();
            });
    });

    /*
    QUnit.asyncTest('Display and play', function(assert) {
        var visualProviderName = 'visual',
            $brokerContainer = $('.control-box'),
            areaBroker = areaBrokerMock({
                $brokerContainer: $brokerContainer,
                mapping: {
                    actionsBar:   $brokerContainer.find('.bottom-action-bar .control-box'),
                    toolbox:      $brokerContainer.find('.tools-box'),
                    navigation:   $brokerContainer.find('.navi-box-list')
                }
            }),
            runner,
            plugin;

        var $nav = areaBroker.getNavigationArea(),
            $toolbox = areaBroker.getToolboxArea(),
            toolboxComponent = areaBroker.getToolbox(),
            btns = {};

        QUnit.expect(1);

        btns.btn1 = toolboxComponent.createEntry({ control: 'button1', title: 'button1', text: 'button1', icon: 'add' });
        btns.btn2 = toolboxComponent.createEntry({ control: 'button2', title: 'button2', text: 'button2', icon: 'add' });
        btns.btn3 = toolboxComponent.createEntry({ control: 'button3', title: 'button3', text: 'button3', icon: 'remove' });
        btns.btn4 = toolboxComponent.createEntry({ control: 'button4', title: 'button4', text: 'button4', icon: 'add' });
        btns.btn5 = toolboxComponent.createEntry({ control: 'button5', title: 'button5', text: 'button5', icon: 'add' });

        $nav.append(buttonTpl({ control: 'prev', title: 'prev', text: 'prev', icon: 'left' }));
        $nav.append(buttonTpl({ control: 'next', title: 'next', text: 'next', icon: 'right' }));

        runnerFactory.registerProvider(visualProviderName, providerMock({ areaBroker: areaBroker }));
        runner = runnerFactory(visualProviderName);
        plugin = pluginFactory(runner, areaBroker);

        plugin.init()
            .then(function() {
                toolboxComponent.render($toolbox);
                toolboxComponent.enable();
                _.forOwn(btns, function(btn) { btn.enable(); });

                btns.btn3.getElement().addClass('no-tool-label');

                runner.trigger('loaditem');

                assert.ok(true);
                QUnit.start();
            })
            .catch(function(err) {
                assert.ok(false, 'Error in init method: ' + err);
                QUnit.start();
            });
    });
    */
});