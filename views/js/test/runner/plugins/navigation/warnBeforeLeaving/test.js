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
 * Test the module taoQtiTest/runner/plugins/navigation/warnBeforeLeaving.
 * @author Bertrand Chevrier <bertrand@taotesting.com>
 */
define([
    'taoTests/runner/runner',
    'taoQtiTest/test/runner/mocks/providerMock',
    'taoQtiTest/runner/plugins/navigation/warnBeforeLeaving'
], function( runnerFactory, providerMock, pluginFactory) {
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


    pluginApi = [{
        name: 'init',
        title: 'init'
    }, {
        name: 'render',
        title: 'render'
    }, {
        name: 'finish',
        title: 'finish'
    }, {
        name: 'destroy',
        title: 'destroy'
    }, {
        name: 'trigger',
        title: 'trigger'
    }, {
        name: 'getTestRunner',
        title: 'getTestRunner'
    }, {
        name: 'getAreaBroker',
        title: 'getAreaBroker'
    }, {
        name: 'getConfig',
        title: 'getConfig'
    }, {
        name: 'setConfig',
        title: 'setConfig'
    }, {
        name: 'getState',
        title: 'getState'
    }, {
        name: 'setState',
        title: 'setState'
    }, {
        name: 'show',
        title: 'show'
    }, {
        name: 'hide',
        title: 'hide'
    }, {
        name: 'enable',
        title: 'enable'
    }, {
        name: 'disable',
        title: 'disable'
    }];

    QUnit
        .cases(pluginApi)
        .test('plugin API ', 1, function(data, assert) {
            var runner = runnerFactory(providerName);
            var timer = pluginFactory(runner);
            assert.equal(typeof timer[data.name], 'function', 'The pluginFactory instances expose a "' + data.name + '" function');
        });


    QUnit.module('Behavior');

    QUnit.asyncTest('Has the listener', function(assert){
        var runner = runnerFactory(providerName);
        var plugin = pluginFactory(runner, runner.getAreaBroker());

        var _wael = window.addEventListener;

        QUnit.expect(1);


        //track the added listener
        window.addEventListener = function(type, listener){
            if(type === 'beforeunload'){
                assert.ok(true, 'The event is handled');
                QUnit.start();
            } else {
                _wael(type, listener);
            }
        };
        plugin
            .init()
            .catch(function(err) {
                assert.ok(false, err.message);
                QUnit.start();
            });

    });
});
