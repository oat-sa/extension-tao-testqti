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
    'jquery',
    'taoTests/runner/runner',
    'taoQtiTest/test/runner/mocks/providerMock',
    'taoQtiTest/runner/plugins/tools/areaMasking/areaMasking'
], function($, runnerFactory, providerMock, areaMaskingFactory) {
    'use strict';

    var providerName = 'mock';
    runnerFactory.registerProvider(providerName, providerMock());

    QUnit.module('API');

    QUnit.test('module', function(assert) {
        var runner = runnerFactory(providerName);

        QUnit.expect(3);

        assert.equal(typeof areaMaskingFactory, 'function', 'The module exposes a function');
        assert.equal(typeof areaMaskingFactory(runner), 'object', 'The factory creates an object');
        assert.notStrictEqual(areaMaskingFactory(runner), areaMaskingFactory(runner), 'The factory creates a new object');
    });


    QUnit
        .cases([
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
        ])
        .test('plugin ', function(data, assert) {
            var runner = runnerFactory(providerName);
            var areaMasking = areaMaskingFactory(runner);
            QUnit.expect(1);

            assert.equal(typeof areaMasking[data.name], 'function', 'The plugin exposes a ' + data.name + ' method');
        });


    QUnit.module('plugin lifecycle');

    QUnit.asyncTest('render/destroy button', function(assert) {
        var runner = runnerFactory(providerName);
        var areaBroker = runner.getAreaBroker();
        var plugin = areaMaskingFactory(runner, areaBroker);

        QUnit.expect(3);

        plugin.init()
            .then(function() {
                var $container = runner.getAreaBroker().getToolboxArea(),
                    $button;

                areaBroker.getToolbox().render($container);

                $button = $container.find('[data-control="area-masking"]');

                assert.equal($button.length, 1, 'The button has been inserted');
                assert.equal($button.hasClass('disabled'), true, 'The button has been rendered disabled');

                areaBroker.getToolbox().destroy();

                $button = $container.find('[data-control="area-masking"]');

                assert.equal($button.length, 0, 'The button has been removed');

                QUnit.start();
            })
            .catch(function(err) {
                assert.ok(false, 'Error in init method: ' + err);
                QUnit.start();
            });
    });

    QUnit.module('mask');

    QUnit.asyncTest('create', function(assert) {
        var $container    = $('#qunit-fixture');
        var runner        = runnerFactory(providerName);
        var areaBroker    = runner.getAreaBroker();
        var areaMasking   = areaMaskingFactory(runner, areaBroker);
        var $button;

        QUnit.expect(9);

        runner.setTestContext({
            options: {
                areaMasking: true
            }
        });

        runner.on('plugin-maskadd.area-masking', function(){

            assert.equal($('.mask', $container).length, 1, 'A mask has been created');
            assert.equal(areaMasking.masks.length, 1, 'The mask is bound');
            assert.ok($button.hasClass('active'), 'The mask button is active');

            QUnit.start();
        });

        areaMasking.init()
            .then(function() {

                assert.ok(!areaMasking.getState('enabled'), 'The areaMasking starts disabled');

                areaMasking.enable();

                areaBroker.getToolbox().render($container);
                runner.trigger('renderitem');

                return areaMasking.render().then(function() {
                    $button = $container.find('[data-control="area-masking"]');

                    assert.ok(areaMasking.getState('enabled'), 'The areaMasking is not disabled anymore');
                    assert.equal($button.length, 1, 'The plugin button has been appended');
                    assert.ok(!$button.hasClass('disabled'), 'The button is not disabled anymore');

                    assert.equal($('.mask', $container).length, 0, 'No mask exists yet');
                    assert.equal(areaMasking.masks.length, 0, 'No mask is bound');

                    $button.trigger('click');
                });
            })
            .catch(function(err) {
                assert.ok(false, 'Unexpected failure : ' + err.message);
                QUnit.start();
            });
    });

    QUnit.asyncTest('remove', function(assert) {
        var $container    = $('#qunit-fixture');
        var runner        = runnerFactory(providerName);
        var areaBroker    = runner.getAreaBroker();
        var areaMasking   = areaMaskingFactory(runner, areaBroker);
        var $button;

        QUnit.expect(12);

        runner.setTestContext({
            options: {
                areaMasking: true
            }
        });

        runner.on('plugin-maskadd.area-masking', function(){
            assert.equal($('.mask', $container).length, 1, 'A mask has been created');
            assert.equal(areaMasking.masks.length, 1, 'The mask is bound');
            assert.ok($button.hasClass('active'), 'The mask button is active');

            $('.mask .close', $container).click();

        }).on('plugin-maskclose.area-masking', function(){
            setTimeout(function(){
                assert.equal($('.mask', $container).length, 0, 'A mask has been removed');
                assert.equal(areaMasking.masks.length, 0, 'The mask is unbound');
                assert.ok(! $button.hasClass('active'), 'The mask button is not active anymore');

                QUnit.start();
            }, 100);
        });

        areaMasking.init()
            .then(function() {

                assert.ok(!areaMasking.getState('enabled'), 'The areaMasking starts disabled');

                areaMasking.enable();

                areaBroker.getToolbox().render($container);
                runner.trigger('renderitem');

                return areaMasking.render().then(function() {
                    $button = $container.find('[data-control="area-masking"]');

                    assert.ok(areaMasking.getState('enabled'), 'The areaMasking is not disbaled anymore');
                    assert.equal($button.length, 1, 'The plugin button has been appended');
                    assert.ok(!$button.hasClass('disabled'), 'The button is not disabled anymore');

                    assert.equal($('.mask', $container).length, 0, 'No mask exists yet');
                    assert.equal(areaMasking.masks.length, 0, 'No mask is bound');

                    $button.trigger('click');
                });
            })
            .catch(function(err) {
                assert.ok(false, 'Unexpected failure : ' + err.message);
                QUnit.start();
            });
    });


    QUnit.asyncTest('multiple', function(assert) {
        var $container    = $('#qunit-fixture');
        var runner        = runnerFactory(providerName);
        var areaBroker    = runner.getAreaBroker();
        var areaMasking   = areaMaskingFactory(runner, areaBroker);

        QUnit.expect(17);

        runner.setTestContext({
            options: {
                areaMasking: true
            }
        });

        areaMasking.init()
            .then(function() {

                assert.ok(!areaMasking.getState('enabled'), 'The areaMasking starts disabled');

                areaMasking.enable();

                areaBroker.getToolbox().render($container);
                runner.trigger('renderitem');

                return areaMasking.render().then(function() {
                    var $button = $container.find('[data-control="area-masking"]');

                    assert.ok( areaMasking.getState('enabled'), 'The areaMasking is not disbaled anymore');
                    assert.equal($button.length, 1, 'The plugin button has been appended');
                    assert.ok(!$button.hasClass('disabled'), 'The button is not disabled anymore');

                    assert.equal($('.mask', $container).length, 0, 'No mask exists yet');
                    assert.equal(areaMasking.masks.length, 0, 'No mask is bound');
                    assert.ok(! $button.hasClass('active'), 'The mask button is not active yet');

                    $button.trigger('click');
                    $button.trigger('click');
                    $button.trigger('click');

                    setTimeout(function(){
                        assert.equal($('.mask', $container).length, 3, '3 masks have been created');
                        assert.equal(areaMasking.masks.length, 3, '3 masks are bound');
                        assert.ok( areaMasking.getState('enabled'), 'The areaMasking is enabled');
                        assert.ok($button.hasClass('active'), 'The mask button is active');

                        $button.trigger('click');
                        $button.trigger('click');

                        setTimeout(function(){
                            assert.equal($('.mask', $container).length, 5, '5 masks have been created');
                            assert.equal(areaMasking.masks.length, 5, '5 masks are bound');
                            assert.ok($button.hasClass('active'), 'The mask button is active');

                            $button.trigger('click');

                            setTimeout(function(){
                                assert.equal($('.mask', $container).length, 5, 'There is still 5 masks');
                                assert.equal(areaMasking.masks.length, 5, 'There is still 5 masks');
                                assert.ok($button.hasClass('active'), 'The mask button is still active');

                                QUnit.start();
                            }, 10);
                        }, 10);
                    }, 10);
                });
            })
            .catch(function(err) {
                assert.ok(false, 'Unexpected failure : ' + err.message);
                QUnit.start();
            });
    });
});
