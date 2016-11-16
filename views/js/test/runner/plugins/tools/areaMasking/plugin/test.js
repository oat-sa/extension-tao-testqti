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

    QUnit.asyncTest('init', function(assert) {
        var runner = runnerFactory(providerName);
        var areaMasking = areaMaskingFactory(runner, runner.getAreaBroker());

        QUnit.expect(4);

        areaMasking.init()
            .then(function() {

                assert.equal(areaMasking.$button.length, 1, 'The areaMasking has created a button');
                assert.ok(areaMasking.getState('init'), 'The areaMasking is initialised');
                assert.ok(areaMasking.getState('disabled'), 'The areaMasking starts disabled');
                assert.ok(areaMasking.$button.hasClass('disabled'), 'The button starts disabled');

                QUnit.start();
            })
            .catch(function(err) {
                assert.ok(false, 'The init method must not fail : ' + err.message);
                QUnit.start();
            });
    });

    QUnit.asyncTest('render', function(assert) {
        var $container    = $('#qunit-fixture');
        var runner        = runnerFactory(providerName);
        var areaMasking = areaMaskingFactory(runner, runner.getAreaBroker());

        QUnit.expect(4);

        areaMasking.init()
            .then(function() {

                assert.ok(areaMasking.getState('init'), 'The areaMasking is initialised');

                return areaMasking.render().then(function() {

                    assert.ok(areaMasking.getState('disabled'), 'The areaMasking starts disabled');
                    assert.equal($('.toolbox [data-control="area-masking"]', $container).length, 1, 'The plugin button has been appended');
                    assert.ok($('.toolbox [data-control="area-masking"]', $container).hasClass('disabled'), 'The plugin button starts disabled');
                    QUnit.start();
                });
            })
            .catch(function(err) {
                assert.ok(false, 'Unexpected failure : ' + err.message);
                QUnit.start();
            });
    });

    QUnit.asyncTest('destroy', function(assert) {
        var $container    = $('#qunit-fixture');
        var runner        = runnerFactory(providerName);
        var areaMasking = areaMaskingFactory(runner, runner.getAreaBroker());

        QUnit.expect(3);

        areaMasking.init()
            .then(function() {
                assert.ok(areaMasking.getState('init'), 'The areaMasking is initialised');

                return areaMasking.render().then(function() {

                    assert.equal($('.toolbox [data-control="area-masking"]', $container).length, 1, 'The plugin button has been appended');

                    return areaMasking.destroy().then(function(){
                        assert.equal($('.toolbox [data-control="area-masking"]', $container).length, 0, 'The plugin button has been removed');
                        QUnit.start();
                    });
                });
            })
            .catch(function(err) {
                assert.ok(false, 'Unexpected failure : ' + err.message);
                QUnit.start();
            });
    });

    QUnit.module('mask');

    QUnit.asyncTest('create', function(assert) {
        var $container    = $('#qunit-fixture');
        var runner        = runnerFactory(providerName);
        var areaMasking = areaMaskingFactory(runner, runner.getAreaBroker());

        QUnit.expect(8);

        runner.on('plugin-maskadd.areaMasking', function(){

            assert.equal($('.mask', $container).length, 1, 'A mask has been created');
            assert.equal(areaMasking.masks.length, 1, 'The mask is bound');

            QUnit.start();
        });

        areaMasking.init()
            .then(function() {

                assert.ok(areaMasking.getState('disabled'), 'The areaMasking starts disabled');

                areaMasking.enable();
                return areaMasking.render().then(function() {
                    var $button = $('.toolbox [data-control="area-masking"]', $container);

                    assert.ok( ! areaMasking.getState('disabled'), 'The areaMasking is not disbaled anymore');
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
        var areaMasking = areaMaskingFactory(runner, runner.getAreaBroker());

        QUnit.expect(10);

        runner.on('plugin-maskadd.areaMasking', function(){
            assert.equal($('.mask', $container).length, 1, 'A mask has been created');
            assert.equal(areaMasking.masks.length, 1, 'The mask is bound');

            $('.mask .close', $container).click();

        }).on('plugin-maskclose.areaMasking', function(){
            setTimeout(function(){
                assert.equal($('.mask', $container).length, 0, 'A mask has been removed');
                assert.equal(areaMasking.masks.length, 0, 'The mask is unbound');

                QUnit.start();
            }, 100);
        });

        areaMasking.init()
            .then(function() {

                assert.ok(areaMasking.getState('disabled'), 'The areaMasking starts disabled');

                areaMasking.enable();
                return areaMasking.render().then(function() {
                    var $button = $('.toolbox [data-control="area-masking"]', $container);

                    assert.ok( ! areaMasking.getState('disabled'), 'The areaMasking is not disbaled anymore');
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
});
