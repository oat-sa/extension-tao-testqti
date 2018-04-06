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
 * Copyright (c) 2018 (original work) Open Assessment Technologies SA
 */

define([
    'taoTests/runner/runner',
    'taoQtiTest/test/runner/mocks/providerMock',
    'taoQtiTest/runner/plugins/controls/progressbar/progressbar',
    'json!taoQtiTest/test/runner/plugins/controls/progressbar/plugin/map.json'
], function (runnerFactory, providerMock, pluginFactory, testMap) {
    'use strict';

    var providerName = 'mock';
    runnerFactory.registerProvider(providerName, providerMock());

    /**
     * Generic tests
     */
    QUnit.module('pluginFactory');


    QUnit.test('module', function (assert) {
        var runner = runnerFactory(providerName);

        QUnit.expect(3);

        assert.equal(typeof pluginFactory, 'function', "The pluginFactory module exposes a function");
        assert.equal(typeof pluginFactory(runner), 'object', "The plugin factory produces an instance");
        assert.notStrictEqual(pluginFactory(runner), pluginFactory(runner), "The plugin factory provides a different instance on each call");
    });


    QUnit.module('Plugin API');


    QUnit.cases([
        {title: 'init'},
        {title: 'render'},
        {title: 'finish'},
        {title: 'destroy'},
        {title: 'trigger'},
        {title: 'getTestRunner'},
        {title: 'getAreaBroker'},
        {title: 'getConfig'},
        {title: 'setConfig'},
        {title: 'getState'},
        {title: 'setState'},
        {title: 'show'},
        {title: 'hide'},
        {title: 'enable'},
        {title: 'disable'}
    ]).test('plugin API ', function (data, assert) {
        var runner = runnerFactory(providerName);
        var plugin = pluginFactory(runner);
        QUnit.expect(1);
        assert.equal(typeof plugin[data.title], 'function', 'The pluginFactory instances expose a "' + data.title + '" function');
    });


    /**
     * Behavior
     */
    QUnit.module('Lifecycle');


    QUnit.asyncTest('render/destroy', function (assert) {
        var runner = runnerFactory(providerName),
            areaBroker = runner.getAreaBroker(),
            plugin = pluginFactory(runner, areaBroker),
            $container = areaBroker.getControlArea();

        QUnit.expect(4);

        runner.setTestContext({
            itemPosition: 3,
            testPartId: 'testPart-1',
            sectionId: 'assessmentSection-1'
        });

        runner.setTestData({
            config: {}
        });

        runner.setTestMap(testMap);

        plugin.init()
            .then(function () {
                assert.equal(plugin.getState('init'), true, 'The plugin has been initialized');

                assert.equal($container.find('.progress-box').length, 0, 'The plugin has not been inserted yet');

                // Plugin rendering
                return plugin.render().then(function () {

                    assert.equal($container.find('.progress-box').length, 1, 'The plugin has been inserted in the right place');

                    // plugin destroying
                    return plugin.destroy().then(function () {

                        assert.equal($container.find('.progress-box').length, 0, 'The plugin has been removed');

                        QUnit.start();
                    });
                });
            })
            .catch(function (err) {
                assert.ok(false, 'Unexpected failure : ' + err.message);
                QUnit.start();
            });
    });


    QUnit.asyncTest('show/hide', function (assert) {
        var runner = runnerFactory(providerName),
            areaBroker = runner.getAreaBroker(),
            plugin = pluginFactory(runner, areaBroker),
            $container = areaBroker.getControlArea();

        QUnit.expect(7);

        runner.setTestContext({
            itemPosition: 3,
            testPartId: 'testPart-1',
            sectionId: 'assessmentSection-1'
        });

        runner.setTestData({
            config: {}
        });

        runner.setTestMap(testMap);

        plugin.init()
            .then(function () {
                assert.equal(plugin.getState('init'), true, 'The plugin has been initialized');

                assert.equal($container.find('.progress-box').length, 0, 'The plugin has not been inserted yet');

                // Plugin rendering
                return plugin.render().then(function () {

                    assert.equal($container.find('.progress-box').length, 1, 'The plugin has been inserted in the right place');
                    assert.equal($container.find('.progress-box:visible').length, 1, 'The plugin is visible');

                    return plugin.hide().then(function () {

                        assert.equal($container.find('.progress-box:visible').length, 0, 'The plugin is now hidden');

                        return plugin.show().then(function () {

                            assert.equal($container.find('.progress-box:visible').length, 1, 'The plugin is now visible');

                            // plugin destroying
                            return plugin.destroy().then(function () {

                                assert.equal($container.find('.progress-box').length, 0, 'The plugin has been removed');

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


    QUnit.module('Options');

    QUnit.asyncTest('hide on informational', function (assert) {
        var runner = runnerFactory(providerName),
            areaBroker = runner.getAreaBroker(),
            plugin = pluginFactory(runner, areaBroker),
            $container = areaBroker.getControlArea();

        QUnit.expect(5);

        runner.setTestContext({
            itemPosition: 1,
            testPartId: 'testPart-intro',
            sectionId: 'assessmentSection-intro'
        });

        runner.setTestData({
            config: {
                progressIndicator: {
                    type: 'questions'
                }
            }
        });

        runner.setTestMap(testMap);

        plugin.init()
            .then(function () {
                var testRunner = plugin.getTestRunner();
                var testData = testRunner.getTestData();

                assert.equal(plugin.getState('init'), true, 'The plugin has been initialized');

                assert.equal($container.find('.progress-box').length, 0, 'The plugin has not been inserted yet');

                // Plugin rendering
                return plugin.render().then(function () {

                    assert.equal($container.find('.progress-box').length, 1, 'The plugin has been inserted in the right place');
                    assert.equal($container.find('.progress-box:visible').length, 0, 'The plugin is not visible');

                    // plugin destroying
                    return plugin.destroy().then(function () {

                        assert.equal($container.find('.progress-box').length, 0, 'The plugin has been removed');

                        QUnit.start();
                    });
                });
            })
            .catch(function (err) {
                assert.ok(false, 'Unexpected failure : ' + err.message);
                QUnit.start();
            });
    });
});
