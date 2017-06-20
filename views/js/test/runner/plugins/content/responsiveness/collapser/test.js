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

    var noLabelCls = 'tool-label-collapsed';

    var ICON_WIDTH = 20,
        TEXT_WIDTH = 80,
        NAV_PADDING = 20,

        ALL_EXPANDED =
            7 * ICON_WIDTH +  // 5 toolbox buttons + 2 nav buttons
            6 * TEXT_WIDTH +  // 1 toolbox button is always collapsed, see test.html
            NAV_PADDING;

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

                    $actionsBar.width(ALL_EXPANDED - 1);
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
            collapsedBtns,
            resizeCount = 0;

        QUnit.expect(49);

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
                    collapsedBtns = 0;

                    $collapsed = $container.find('.' + noLabelCls);
                    assert.equal($collapsed.length,  collapsedBtns, collapsedBtns + ' buttons are collapsed');

                    $actionsBar.width(ALL_EXPANDED - 1);
                    runner.trigger('collapseTools');
                    break;
                }
                case 2: {
                    collapsedBtns = 1;

                    $collapsed = $container.find('.' + noLabelCls);
                    assert.equal($collapsed.length,  collapsedBtns, collapsedBtns + ' buttons are collapsed');

                    assert.ok($container.find(collapseOrder[0]).hasClass(noLabelCls), 'button1 has been collapsed');

                    newWidth = ALL_EXPANDED - (TEXT_WIDTH * collapsedBtns) - 1;
                    $actionsBar.width(newWidth);
                    runner.trigger('collapseTools');
                    break;
                }
                case 3: {
                    collapsedBtns = 3;

                    $collapsed = $container.find('.' + noLabelCls);
                    assert.equal($collapsed.length,  collapsedBtns, collapsedBtns + ' buttons are collapsed');

                    assert.ok($container.find(collapseOrder[0]).hasClass(noLabelCls), 'button1 has been collapsed');
                    assert.ok($container.find('.button2').hasClass(noLabelCls), 'button2 has been collapsed');
                    assert.ok(! $container.find('.button3').hasClass(noLabelCls), 'button3 has NOT been collapsed (always collapsed, see markup in test.html)');
                    assert.ok($container.find('.button4').hasClass(noLabelCls), 'button4 has been collapsed');

                    newWidth = ALL_EXPANDED - (TEXT_WIDTH * collapsedBtns) - 1;
                    $actionsBar.width(newWidth);
                    runner.trigger('collapseTools');
                    break;
                }
                case 4: {
                    collapsedBtns = 4;

                    $collapsed = $container.find('.' + noLabelCls);
                    assert.equal($collapsed.length,  collapsedBtns, collapsedBtns + ' buttons are collapsed');

                    assert.ok($container.find(collapseOrder[0]).hasClass(noLabelCls), 'button1 has been collapsed');
                    assert.ok($container.find('.button2').hasClass(noLabelCls), 'button2 has been collapsed');
                    assert.ok(! $container.find('.button3').hasClass(noLabelCls), 'button3 has NOT been collapsed (always collapsed, see markup in test.html)');
                    assert.ok($container.find('.button4').hasClass(noLabelCls), 'button4 has been collapsed');
                    assert.ok($container.find(collapseOrder[2]).hasClass(noLabelCls), 'button5 has been collapsed');

                    newWidth = ALL_EXPANDED - (TEXT_WIDTH * collapsedBtns) - 1;
                    $actionsBar.width(newWidth);
                    runner.trigger('collapseTools');
                    break;
                }
                case 5: {
                    collapsedBtns = 6;

                    $collapsed = $container.find('.' + noLabelCls);
                    assert.equal($collapsed.length,  collapsedBtns, collapsedBtns + ' buttons are collapsed');

                    assert.ok($container.find(collapseOrder[0]).hasClass(noLabelCls), 'button1 has been collapsed');
                    assert.ok($container.find('.button2').hasClass(noLabelCls), 'button2 has been collapsed');
                    assert.ok(! $container.find('.button3').hasClass(noLabelCls), 'button3 has NOT been collapsed (always collapsed, see markup in test.html)');
                    assert.ok($container.find('.button4').hasClass(noLabelCls), 'button4 has been collapsed');
                    assert.ok($container.find(collapseOrder[2]).hasClass(noLabelCls), 'button5 has been collapsed');
                    assert.ok($container.find(collapseOrder[3]).hasClass(noLabelCls), 'prev & next has been collapsed');

                    collapsedBtns = 4;
                    newWidth = ALL_EXPANDED - (TEXT_WIDTH * collapsedBtns);
                    $actionsBar.width(newWidth);
                    runner.trigger('collapseTools');
                    break;
                }
                case 6: {
                    collapsedBtns = 4;

                    $collapsed = $container.find('.' + noLabelCls);
                    assert.equal($collapsed.length,  collapsedBtns, collapsedBtns + ' buttons are collapsed');

                    assert.ok($container.find(collapseOrder[0]).hasClass(noLabelCls), 'button1 remain collapsed');
                    assert.ok($container.find('.button2').hasClass(noLabelCls), 'button2 remain collapsed');
                    assert.ok(! $container.find('.button3').hasClass(noLabelCls), 'button3 has NOT been collapsed (always collapsed, see markup in test.html)');
                    assert.ok($container.find('.button4').hasClass(noLabelCls), 'button4 remain collapsed');
                    assert.ok($container.find(collapseOrder[2]).hasClass(noLabelCls), 'button5 remain collapsed');
                    assert.ok(! $container.find(collapseOrder[3]).hasClass(noLabelCls), 'prev & next has been expanded');

                    collapsedBtns = 3;
                    newWidth = ALL_EXPANDED - (TEXT_WIDTH * collapsedBtns);
                    $actionsBar.width(newWidth);
                    runner.trigger('collapseTools');
                    break;
                }
                case 7: {
                    collapsedBtns = 3;

                    $collapsed = $container.find('.' + noLabelCls);
                    assert.equal($collapsed.length,  collapsedBtns, collapsedBtns + ' buttons are collapsed');

                    assert.ok($container.find(collapseOrder[0]).hasClass(noLabelCls), 'button1 remain collapsed');
                    assert.ok($container.find('.button2').hasClass(noLabelCls), 'button2 remain collapsed');
                    assert.ok(! $container.find('.button3').hasClass(noLabelCls), 'button3 has NOT been collapsed (always collapsed, see markup in test.html)');
                    assert.ok($container.find('.button4').hasClass(noLabelCls), 'button4 remain collapsed');
                    assert.ok(! $container.find(collapseOrder[2]).hasClass(noLabelCls), 'button5 has been expanded');
                    assert.ok(! $container.find(collapseOrder[3]).hasClass(noLabelCls), 'prev & next has been expanded');

                    collapsedBtns = 1;
                    newWidth = ALL_EXPANDED - (TEXT_WIDTH * collapsedBtns);
                    $actionsBar.width(newWidth);
                    runner.trigger('collapseTools');
                    break;
                }
                case 8: {
                    collapsedBtns = 1;

                    $collapsed = $container.find('.' + noLabelCls);
                    assert.equal($collapsed.length,  collapsedBtns, collapsedBtns + ' buttons are collapsed');

                    assert.ok($container.find(collapseOrder[0]).hasClass(noLabelCls), 'button1 remain collapsed');
                    assert.ok(! $container.find('.button2').hasClass(noLabelCls), 'button2 has been expanded');
                    assert.ok(! $container.find('.button3').hasClass(noLabelCls), 'button3 has NOT been collapsed (always collapsed, see markup in test.html)');
                    assert.ok(! $container.find('.button4').hasClass(noLabelCls), 'button4 has been expanded');
                    assert.ok(! $container.find(collapseOrder[2]).hasClass(noLabelCls), 'button5 has been expanded');
                    assert.ok(! $container.find(collapseOrder[3]).hasClass(noLabelCls), 'prev & next has been expanded');

                    newWidth = ALL_EXPANDED;
                    $actionsBar.width(newWidth);
                    runner.trigger('collapseTools');
                    break;
                }
                case 9: {
                    collapsedBtns = 0;

                    $collapsed = $container.find('.' + noLabelCls);
                    assert.equal($collapsed.length,  collapsedBtns, collapsedBtns + ' buttons are collapsed');

                    assert.ok(! $container.find(collapseOrder[0]).hasClass(noLabelCls), 'button1 has been expanded');
                    assert.ok(! $container.find('.button2').hasClass(noLabelCls), 'button2 has been expanded');
                    assert.ok(! $container.find('.button3').hasClass(noLabelCls), 'button3 has NOT been collapsed (always collapsed, see markup in test.html)');
                    assert.ok(! $container.find('.button4').hasClass(noLabelCls), 'button4 has been expanded');
                    assert.ok(! $container.find(collapseOrder[2]).hasClass(noLabelCls), 'button5 has been expanded');
                    assert.ok(! $container.find(collapseOrder[3]).hasClass(noLabelCls), 'prev & next has been expanded');

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

});