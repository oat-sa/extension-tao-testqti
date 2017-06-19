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
    'taoQtiTest/runner/plugins/content/responsiveness/collapser',
    'tpl!taoQtiTest/runner/plugins/templates/button'
], function (_, $, runnerFactory, providerMock, areaBrokerMock, pluginFactory, buttonTpl) {
    'use strict';

    var providerName = 'mock';
    runnerFactory.registerProvider(providerName, providerMock());

    QUnit.module('Module');

    QUnit.test('Module export', function (assert) {
        QUnit.expect(1);

        assert.ok(typeof pluginFactory === 'function', 'The module expose a function');
    });

    QUnit.module('Collapser');

    QUnit.asyncTest('collapse all on resize', function(assert) {
        var runner = runnerFactory(providerName);
        //var areaBroker = runner.getAreaBroker();
        //var plugin = pluginFactory(runner, runner.getAreaBroker());

        QUnit.expect(1);

        runner.setTestContext({
            options: {
                lineReader: true
            }
        });

        runner.setTestData({
            config: {
                allowShortcuts: true,
                shortcuts: {
                    'line-reader': {
                        toggle: 'c'
                    }
                }
            }
        });
        QUnit.start();
        assert.ok(true);
/*
        plugin.init()
            .then(function() {
                var $contentContainer = areaBroker.getContentArea().parent(),
                    $masks = $contentContainer.find('.line-reader-mask'),
                    $overlays = $contentContainer.find('.line-reader-overlay');

                runner.trigger('renderitem');

                assert.ok($masks.hasClass('hidden'), 'masks are hidden by default');
                assert.ok($overlays.hasClass('hidden'), 'overlays are hidden by default');

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

                assert.ok(! $masks.hasClass('hidden'), 'masks are now visible on keyboard shortcut');
                assert.ok(! $overlays.hasClass('hidden'), 'overlays are now visible on keyboard shortcut');

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

                assert.ok($masks.hasClass('hidden'), 'masks are hidden again on keyboard shortcut');
                assert.ok($overlays.hasClass('hidden'), 'overlays are hidden again on keyboard shortcut');

                QUnit.start();
            })
            .catch(function(err) {
                assert.ok(false, 'Unexpected error: ' + err);
                QUnit.start();
            });
    */
    });

    QUnit.module('Visual test');


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