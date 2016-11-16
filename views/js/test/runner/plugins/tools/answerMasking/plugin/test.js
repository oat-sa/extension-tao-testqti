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
    'taoQtiTest/runner/plugins/tools/answerMasking/answerMasking'
], function($, runnerFactory, providerMock, answerMaskingFactory) {
    'use strict';

    var providerName = 'mock';
    runnerFactory.registerProvider(providerName, providerMock());

    QUnit.module('API');

    QUnit.test('module', function(assert) {
        var runner = runnerFactory(providerName);

        QUnit.expect(3);

        assert.equal(typeof answerMaskingFactory, 'function', 'The module exposes a function');
        assert.equal(typeof answerMaskingFactory(runner), 'object', 'The factory creates an object');
        assert.notStrictEqual(answerMaskingFactory(runner), answerMaskingFactory(runner), 'The factory creates a new object');
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
            var answerMasking = answerMaskingFactory(runner);
            QUnit.expect(1);

            assert.equal(typeof answerMasking[data.name], 'function', 'The plugin exposes a ' + data.name + ' method');
        });


    QUnit.module('plugin lifecycle');

    QUnit.asyncTest('init', function(assert) {
        var runner = runnerFactory(providerName);
        var answerMasking = answerMaskingFactory(runner, runner.getAreaBroker());

        QUnit.expect(4);

        answerMasking.init()
            .then(function() {

                assert.equal(answerMasking.$button.length, 1, 'The answerMasking has created a button');
                assert.ok(answerMasking.getState('init'), 'The answerMasking is initialised');
                assert.ok(answerMasking.getState('disabled'), 'The answerMasking starts disabled');
                assert.ok(answerMasking.$button.hasClass('disabled'), 'The button starts disabled');

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
        var answerMasking = answerMaskingFactory(runner, runner.getAreaBroker());

        QUnit.expect(4);

        answerMasking.init()
            .then(function() {

                assert.ok(answerMasking.getState('init'), 'The answerMasking is initialised');

                return answerMasking.render().then(function() {

                    assert.ok(answerMasking.getState('disabled'), 'The answerMasking starts disabled');
                    assert.equal($('.toolbox [data-control="answer-masking"]', $container).length, 1, 'The plugin button has been appended');
                    assert.ok($('.toolbox [data-control="answer-masking"]', $container).hasClass('disabled'), 'The plugin button starts disabled');
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
        var answerMasking = answerMaskingFactory(runner, runner.getAreaBroker());

        QUnit.expect(3);

        answerMasking.init()
            .then(function() {
                assert.ok(answerMasking.getState('init'), 'The answerMasking is initialised');

                return answerMasking.render().then(function() {

                    assert.equal($('.toolbox [data-control="answer-masking"]', $container).length, 1, 'The plugin button has been appended');

                    return answerMasking.destroy().then(function(){
                        assert.equal($('.toolbox [data-control="answer-masking"]', $container).length, 0, 'The plugin button has been removed');
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
        var answerMasking = answerMaskingFactory(runner, runner.getAreaBroker());

        QUnit.expect(8);

        runner.on('plugin-maskadd.answerMasking', function(){

            assert.equal($('.mask', $container).length, 1, 'A mask has been created');
            assert.equal(answerMasking.masks.length, 1, 'The mask is bound');

            QUnit.start();
        });

        answerMasking.init()
            .then(function() {

                assert.ok(answerMasking.getState('disabled'), 'The answerMasking starts disabled');

                answerMasking.enable();
                return answerMasking.render().then(function() {
                    var $button = $('.toolbox [data-control="answer-masking"]', $container);

                    assert.ok( ! answerMasking.getState('disabled'), 'The answerMasking is not disbaled anymore');
                    assert.equal($button.length, 1, 'The plugin button has been appended');
                    assert.ok(!$button.hasClass('disabled'), 'The button is not disabled anymore');

                    assert.equal($('.mask', $container).length, 0, 'No mask exists yet');
                    assert.equal(answerMasking.masks.length, 0, 'No mask is bound');


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
        var answerMasking = answerMaskingFactory(runner, runner.getAreaBroker());

        QUnit.expect(10);

        runner.on('plugin-maskadd.answerMasking', function(){
            assert.equal($('.mask', $container).length, 1, 'A mask has been created');
            assert.equal(answerMasking.masks.length, 1, 'The mask is bound');

            $('.mask .close', $container).click();

        }).on('plugin-maskclose.answerMasking', function(){
            setTimeout(function(){
                assert.equal($('.mask', $container).length, 0, 'A mask has been removed');
                assert.equal(answerMasking.masks.length, 0, 'The mask is unbound');

                QUnit.start();
            }, 100);
        });

        answerMasking.init()
            .then(function() {

                assert.ok(answerMasking.getState('disabled'), 'The answerMasking starts disabled');

                answerMasking.enable();
                return answerMasking.render().then(function() {
                    var $button = $('.toolbox [data-control="answer-masking"]', $container);

                    assert.ok( ! answerMasking.getState('disabled'), 'The answerMasking is not disbaled anymore');
                    assert.equal($button.length, 1, 'The plugin button has been appended');
                    assert.ok(!$button.hasClass('disabled'), 'The button is not disabled anymore');

                    assert.equal($('.mask', $container).length, 0, 'No mask exists yet');
                    assert.equal(answerMasking.masks.length, 0, 'No mask is bound');

                    $button.trigger('click');
                });
            })
            .catch(function(err) {
                assert.ok(false, 'Unexpected failure : ' + err.message);
                QUnit.start();
            });
    });
});
