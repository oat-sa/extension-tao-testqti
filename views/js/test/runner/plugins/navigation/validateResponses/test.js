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
 * Test the test runner plugin validateResponses
 *
 * @author Bertrand Chevrier <bertrand@taotesting.com>
 */
define([
    'jquery',
    'taoTests/runner/runner',
    'taoQtiTest/test/runner/mocks/providerMock',
    'taoQtiTest/runner/plugins/navigation/validateResponses',
    'taoQtiTest/runner/helpers/currentItem'
], function($, runnerFactory, providerMock, pluginFactory, currentItemHelper) {
    'use strict';

    var pluginApi;
    var providerName = 'mock';
    runnerFactory.registerProvider(providerName, providerMock());

    //mock the isAnswered helper, using testRunner property
    currentItemHelper.isAnswered = function(testRunner){
        return !testRunner.prevent;
    };

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


    QUnit.module('allow skipping');

    QUnit.cases([{
        title: 'enabled',
        context : {
            validateResponses : true
        },
        enabled : true
    }, {
        title: 'disabled',
        context : {
            validateResponses : false
        },
        enabled : false
    }])
    .asyncTest('toggle ', function(data, assert) {
        var runner        = runnerFactory(providerName);
        var plugin        = pluginFactory(runner, runner.getAreaBroker());

        QUnit.expect(1);

        runner.setTestContext(data.context);

        plugin
            .init()
            .then(function() {
                assert.equal(plugin.getState('enabled'), data.enabled, 'The state is correct');
                QUnit.start();
            })
            .catch(function(err){
                assert.ok(false, err.message);
                QUnit.start();
            });
    });

    QUnit.asyncTest('allow moving', function(assert) {

        var runner        = runnerFactory(providerName);
        var plugin        = pluginFactory(runner, runner.getAreaBroker());

        QUnit.expect(1);

        runner.setTestContext({
            validateResponses : false
        });

        plugin
            .init()
            .then(function() {

                runner.prevent = false;
                runner.on('move', function(){
                    assert.ok(true, 'Move is allowed');
                    QUnit.start();
                });
                runner.trigger('move');
            })
            .catch(function(err){
                assert.ok(false, err.message);
                QUnit.start();
            });
    });

    QUnit.asyncTest('prevent moving', function(assert) {

        var runner        = runnerFactory(providerName);
        var plugin        = pluginFactory(runner, runner.getAreaBroker());

        QUnit.expect(2);

        runner.setTestContext({
            validateResponses : true
        });

        plugin
            .init()
            .then(function() {

                runner.prevent = true;
                runner.on('move', function(){
                    assert.ok(false, 'Move is denied');
                    QUnit.start();
                });
                runner.off('alert.notallowed')
                      .on('alert.notallowed', function(message, cb){
                          assert.equal(message, 'A valid response to this item is required.', 'The user receive the correct message');
                          cb();
                      });
                runner.on('resumeitem', function(){
                    assert.ok(true, 'Move has been prevented');
                    QUnit.start();
                });
                runner.trigger('move');

            })
            .catch(function(err){
                assert.ok(false, err.message);
                QUnit.start();
            });
    });
});
