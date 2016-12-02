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
    'lodash',
    'taoTests/runner/runner',
    'taoQtiTest/test/runner/mocks/providerMock',
    'taoQtiTest/runner/plugins/tools/magnifier/magnifier'
], function ($, _, runnerFactory, providerMock, magnifierFactory) {
    'use strict';

    var providerName = 'mock';
    runnerFactory.registerProvider(providerName, providerMock());


    QUnit.module('API');


    QUnit.test('module', function (assert) {
        var runner = runnerFactory(providerName);

        QUnit.expect(3);

        assert.equal(typeof magnifierFactory, 'function', 'The module exposes a function');
        assert.equal(typeof magnifierFactory(runner), 'object', 'The factory creates an object');
        assert.notStrictEqual(magnifierFactory(runner), magnifierFactory(runner), 'The factory creates a new object');
    });


    QUnit
        .cases([
            {name: 'init', title: 'init'},
            {name: 'render', title: 'render'},
            {name: 'finish', title: 'finish'},
            {name: 'destroy', title: 'destroy'},
            {name: 'trigger', title: 'trigger'},
            {name: 'getTestRunner', title: 'getTestRunner'},
            {name: 'getAreaBroker', title: 'getAreaBroker'},
            {name: 'getConfig', title: 'getConfig'},
            {name: 'setConfig', title: 'setConfig'},
            {name: 'getState', title: 'getState'},
            {name: 'setState', title: 'setState'},
            {name: 'show', title: 'show'},
            {name: 'hide', title: 'hide'},
            {name: 'enable', title: 'enable'},
            {name: 'disable', title: 'disable'}
        ])
        .test('plugin ', function (data, assert) {
            var runner = runnerFactory(providerName);
            var magnifier = magnifierFactory(runner);
            QUnit.expect(1);

            assert.equal(typeof magnifier[data.name], 'function', 'The plugin exposes a ' + data.name + ' method');
        });


    QUnit.module('plugin lifecycle');


    QUnit.asyncTest('init', function (assert) {
        var runner = runnerFactory(providerName);
        var magnifier = magnifierFactory(runner, runner.getAreaBroker());

        QUnit.expect(4);

        magnifier.init()
            .then(function () {

                assert.equal(magnifier.$button.length, 1, 'The magnifier has created a button');
                assert.ok(magnifier.getState('init'), 'The magnifier is initialised');
                assert.ok(!magnifier.getState('enabled'), 'The magnifier starts disabled');
                assert.ok(magnifier.$button.hasClass('disabled'), 'The button starts disabled');

                QUnit.start();
            })
            .catch(function (err) {
                assert.ok(false, 'The init method must not fail : ' + err.message);
                QUnit.start();
            });
    });


    QUnit.asyncTest('render', function (assert) {
        var $container = $('#qunit-fixture');
        var runner = runnerFactory(providerName);
        var magnifier = magnifierFactory(runner, runner.getAreaBroker());

        QUnit.expect(4);

        magnifier.init()
            .then(function () {

                assert.ok(magnifier.getState('init'), 'The magnifier is initialised');

                return magnifier.render().then(function () {

                    assert.ok(!magnifier.getState('enabled'), 'The magnifier starts disabled');
                    assert.equal($('.toolbox [data-control="magnify"]', $container).length, 1, 'The plugin button has been appended');
                    assert.ok($('.toolbox [data-control="magnify"]', $container).hasClass('disabled'), 'The plugin button starts disabled');

                    QUnit.start();
                });
            })
            .catch(function (err) {
                assert.ok(false, 'Unexpected failure : ' + err.message);
                QUnit.start();
            });
    });


    QUnit.asyncTest('state', function (assert) {
        var $container = $('#qunit-fixture');
        var runner = runnerFactory(providerName);
        var magnifier = magnifierFactory(runner, runner.getAreaBroker());

        QUnit.expect(11);

        magnifier.init()
            .then(function () {

                assert.ok(magnifier.getState('init'), 'The magnifier is initialised');

                return magnifier.render().then(function () {

                    assert.ok(!magnifier.getState('enabled'), 'The magnifier starts disabled');
                    assert.equal($('.toolbox [data-control="magnify"]', $container).length, 1, 'The plugin button has been appended');
                    assert.ok($('.toolbox [data-control="magnify"]', $container).hasClass('disabled'), 'The plugin button starts disabled');

                    return magnifier.enable().then(function () {
                        assert.ok(magnifier.getState('enabled'), 'The magnifier is now enabled');
                        assert.ok(!$('.toolbox [data-control="magnify"]', $container).hasClass('disabled'), 'The plugin button is enabled');

                        assert.ok(!$('.toolbox [data-control="magnify"]', $container).hasClass('hidden'), 'The plugin button is visible');

                        return magnifier.hide().then(function () {
                            assert.ok($('.toolbox [data-control="magnify"]', $container).hasClass('hidden'), 'The plugin button is hidden');

                            return magnifier.show().then(function () {
                                assert.ok(!$('.toolbox [data-control="magnify"]', $container).hasClass('hidden'), 'The plugin button is visible');

                                return magnifier.disable().then(function () {
                                    assert.ok(!magnifier.getState('enabled'), 'The magnifier is now disabled');
                                    assert.ok($('.toolbox [data-control="magnify"]', $container).hasClass('disabled'), 'The plugin button is disabled');

                                    QUnit.start();
                                });
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


    QUnit.asyncTest('destroy', function (assert) {
        var $container = $('#qunit-fixture');
        var runner = runnerFactory(providerName);
        var magnifier = magnifierFactory(runner, runner.getAreaBroker());

        QUnit.expect(3);

        magnifier.init()
            .then(function () {
                assert.ok(magnifier.getState('init'), 'The magnifier is initialised');

                return magnifier.render().then(function () {

                    assert.equal($('.toolbox [data-control="magnify"]', $container).length, 1, 'The plugin button has been appended');

                    return magnifier.destroy().then(function () {
                        assert.equal($('.toolbox [data-control="magnify"]', $container).length, 0, 'The plugin button has been removed');
                        QUnit.start();
                    });
                });
            })
            .catch(function (err) {
                assert.ok(false, 'Unexpected failure : ' + err.message);
                QUnit.start();
            });
    });


    QUnit.module('magnifier');


    QUnit.asyncTest('create', function (assert) {
        var $container = $('#qunit-fixture');
        var runner = runnerFactory(providerName);
        var magnifier = magnifierFactory(runner, runner.getAreaBroker());

        QUnit.expect(9);

        runner.on('plugin-magnifier-create.magnifier', function () {
            assert.equal($('.magnifier', $container).length, 1, 'A magnifier has been created');
            assert.ok($('.magnifier', $container).hasClass('hidden'), 'The magnifier is hidden');
        });

        runner.on('plugin-magnifier-show.magnifier', function () {
            _.defer(function() {
                assert.ok(!$('.magnifier', $container).hasClass('hidden'), 'The magnifier is visible');

                _.delay(function() {
                    $('.toolbox [data-control="magnify"]', $container).trigger('click');
                }, 250);
            });
        });

        runner.on('plugin-magnifier-hide.magnifier', function () {
            _.defer(function() {
                assert.ok($('.magnifier', $container).hasClass('hidden'), 'The magnifier is hidden');

                QUnit.start();
            });
        });

        magnifier.init()
            .then(function () {

                assert.ok(!magnifier.getState('enabled'), 'The magnifier starts disabled');

                magnifier.enable();
                return magnifier.render().then(function () {
                    var $button = $('.toolbox [data-control="magnify"]', $container);

                    assert.ok(magnifier.getState('enabled'), 'The magnifier is not disabled anymore');
                    assert.equal($button.length, 1, 'The plugin button has been appended');
                    assert.ok(!$button.hasClass('disabled'), 'The button is not disabled anymore');

                    assert.equal($('.magnifier', $container).length, 0, 'No magnifier exists yet');

                    $button.trigger('click');
                });
            })
            .catch(function (err) {
                assert.ok(false, 'Unexpected failure : ' + err.message);
                QUnit.start();
            });
    });


    QUnit.asyncTest('zoom', function (assert) {
        var $container = $('#qunit-fixture');
        var runner = runnerFactory(providerName);
        var magnifier = magnifierFactory(runner, runner.getAreaBroker());
        var expectedZoomLevel = 2;

        QUnit.expect(8);

        runner.on('plugin-magnifier-create.magnifier', function () {
            assert.equal($('.magnifier', $container).length, 1, 'A magnifier has been created');

            _.delay(function() {
                expectedZoomLevel = 2.5;

                runner.trigger('tool-magnifier-in');

                _.delay(function() {
                    expectedZoomLevel = 2;
                    runner.trigger('tool-magnifier-out');

                    _.delay(function() {
                        QUnit.start();
                    }, 250);
                }, 250);
            }, 250);
        });

        runner.on('plugin-magnifier-zoom.magnifier', function (plugin, zoomLevel) {
            assert.equal(zoomLevel, expectedZoomLevel, 'The magnifier is set the right zoom level');
        });

        magnifier.init()
            .then(function () {

                assert.ok(!magnifier.getState('enabled'), 'The magnifier starts disabled');

                magnifier.enable();
                return magnifier.render().then(function () {
                    var $button = $('.toolbox [data-control="magnify"]', $container);

                    assert.ok(magnifier.getState('enabled'), 'The magnifier is not disabled anymore');
                    assert.equal($button.length, 1, 'The plugin button has been appended');
                    assert.ok(!$button.hasClass('disabled'), 'The button is not disabled anymore');

                    assert.equal($('.magnifier', $container).length, 0, 'No magnifier exists yet');

                    $button.trigger('click');
                });
            })
            .catch(function (err) {
                assert.ok(false, 'Unexpected failure : ' + err.message);
                QUnit.start();
            });
    });
});
