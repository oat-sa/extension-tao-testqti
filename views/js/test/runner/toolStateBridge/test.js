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
 * Copyright (c) 2018 (original work) Open Assessment Technologies SA ;
 */
/**
 * Test the module taoQtiTest/runner/provider/toolStateBridge

 * @author Bertrand Chevrier <bertrand@taotesting.com>
 */
define([
    'taoQtiTest/runner/provider/toolStateBridge'
], function(toolStateBridgeFactory) {
    'use strict';

    var testStoreMock = {
        getStore : function getStore(){},
        startChangeTracking : function startChangeTracking() {}
    };

    var pluginsMocks = ['timer', 'feedback', 'highlighter', 'magnifier'];


    QUnit.module('API');

    QUnit.test('module', function(assert) {
        QUnit.expect(1);

        assert.equal(typeof toolStateBridgeFactory, 'function', "The module exposes a function");
    });

    QUnit.test('factory', function(assert) {
        QUnit.expect(6);

        assert.throws(function() {
            toolStateBridgeFactory();
        }, TypeError, 'The factory cannot be called without parameters');

        assert.throws(function() {
            toolStateBridgeFactory({});
        }, TypeError, 'The factory should be called with a test store');

        assert.throws(function() {
            toolStateBridgeFactory(testStoreMock);
        }, TypeError, 'The factory should be called with a test store and the list of active plugins');

        assert.throws(function() {
            toolStateBridgeFactory(testStoreMock, []);
        }, TypeError, 'The factory should be called with a test store and a non empty list of active plugins');

        assert.equal(typeof toolStateBridgeFactory(testStoreMock, pluginsMocks), 'object', "The factory creates an object");
        assert.notEqual(
            toolStateBridgeFactory(testStoreMock, pluginsMocks),
            toolStateBridgeFactory(testStoreMock, pluginsMocks),
            'The factory creates new objects'
        );
    });

    QUnit.cases([
        { title: 'setTools' },
        { title: 'getTools' },
        { title: 'restoreState' },
        { title: 'restoreStates' },
        { title: 'getState' },
        { title: 'getStates' },
    ])
    .test('Method ', function(data, assert) {
        QUnit.expect(1);

        assert.equal(typeof toolStateBridgeFactory(testStoreMock, pluginsMocks)[data.title], 'function', 'The instance exposes a "' + data.title + '" method');
    });


    QUnit.module('Behavior');

    QUnit.test('tools accessors', function(assert) {
        var toolStateBridge;
        QUnit.expect(3);

        toolStateBridge = toolStateBridgeFactory(testStoreMock, pluginsMocks);

        assert.deepEqual(toolStateBridge.getTools(), [], 'No tools are defined yet');
        toolStateBridge.setTools(['move', 'themeSwitcher']);
        assert.deepEqual(toolStateBridge.getTools(), [], 'No tools is defined because none is matching a plugin');
        toolStateBridge.setTools(['highlighter', 'magnifier', 'answerEliminator']);
        assert.deepEqual(toolStateBridge.getTools(), ['highlighter', 'magnifier'], 'The tools that match a plugin are set');
    });

    QUnit.test('trigger change tracking', function(assert) {
        var toolStateBridge;
        QUnit.expect(3);

        toolStateBridge = toolStateBridgeFactory({
            getStore : function(){},
            startChangeTracking : function startChangeTracking(storeName){
                assert.equal(storeName, 'highlighter', 'Change tracking is set up for the highlighter');
            }
        }, pluginsMocks);

        assert.deepEqual(toolStateBridge.getTools(), [], 'No tools are defined yet');
        toolStateBridge.setTools(['highlighter']);
        assert.deepEqual(toolStateBridge.getTools(), ['highlighter'], 'The tools that match a plugin are set');
    });

    QUnit.asyncTest('can\'t restore the state if the tool is not configured', function(assert) {
        var toolStateBridge;
        QUnit.expect(1);

        toolStateBridge = toolStateBridgeFactory(testStoreMock, pluginsMocks);
        toolStateBridge
            .restoreState('highlighter', { foo : 'bar', noz : [123] })
            .then(function(result){
                assert.ok(result === false, 'Restore resolves with false if the state cannot be restored');
                QUnit.start();
            })
            .catch(function(err){
                assert.ok(false, err.message);
                QUnit.start();
            });
    });

    QUnit.asyncTest('restore state', function(assert) {
        var toolStateBridge;
        var state = { foo : 'bar', noz : [123] };

        QUnit.expect(5);

        toolStateBridge = toolStateBridgeFactory({
            getStore : function(){
                return Promise.resolve({
                    clear : function(){
                        assert.ok(true, 'The store is cleared');
                        return Promise.resolve(true);
                    },
                    setItem : function(key, value){
                        assert.ok(state[key], value, 'The item value is set');
                        return Promise.resolve(true);
                    }
                });
            },
            startChangeTracking: function startChangeTracking(){},
            resetChanges: function(name){
                assert.equal(name, 'highlighter', 'The change tracking is reset');
            }
        }, pluginsMocks);
        toolStateBridge
            .setTools(['highlighter'])
            .restoreState('highlighter', state)
            .then(function(result){
                assert.ok(result === true, 'The state has been restored');
                QUnit.start();
            })
            .catch(function(err){
                assert.ok(false, err.message);
                QUnit.start();
            });
    });

    QUnit.asyncTest('restore states', function(assert) {
        var toolStateBridge;
        var tools = ['highlighter', 'magnifier', 'timer'];
        var states = {
            highlighter : {
                foo : 'bar',
                noz : [123]
            },
            magnifier : {
                moo : true,
                nop : {
                    'a' : 1.5
                }
            }
        };

        QUnit.expect(13);

        toolStateBridge = toolStateBridgeFactory({
            getStore : function(name){
                return Promise.resolve({
                    clear : function(){
                        assert.ok(true, 'The store is cleared');
                        return Promise.resolve(true);
                    },
                    setItem : function(key, value){
                        assert.ok(tools.indexOf(name) > -1, 'setting the state for the tool');
                        assert.ok(states[name][key], value, 'The item value is set');
                        return Promise.resolve(true);
                    }
                });
            },
            startChangeTracking: function startChangeTracking(){},
            hasChanges : function(){},
            resetChanges: function(name){
                assert.ok(tools.indexOf(name) > -1, 'restoring the state reset the changes');
            }
        }, pluginsMocks);

        toolStateBridge
            .setTools(['highlighter', 'magnifier', 'timer'])
            .restoreStates(states)
            .then(function(results){
                assert.deepEqual(results, {
                    highlighter : true,
                    magnifier: true
                }, 'The states has been restored for the magnifier and the highlighter');
                QUnit.start();
            })
            .catch(function(err){
                assert.ok(false, err.message);
                QUnit.start();
            });
    });

    QUnit.asyncTest('can\'t get the state if the tool is not configured', function(assert) {
        var toolStateBridge;
        QUnit.expect(1);

        toolStateBridge = toolStateBridgeFactory(testStoreMock, pluginsMocks);
        toolStateBridge
            .getState('highlighter', false)
            .then(function(result){
                assert.ok(result === false, 'No tool, no state');
                QUnit.start();
            })
            .catch(function(err){
                assert.ok(false, err.message);
                QUnit.start();
            });
    });

    QUnit.asyncTest('get the tool state', function(assert) {
        var toolStateBridge;
        var state = { foo : 'bar', noz : [123] };
        QUnit.expect(4);

        toolStateBridge = toolStateBridgeFactory({
            getStore : function(){
                return Promise.resolve({
                    getItems : function(){
                        assert.ok(true, 'The store is called to get the items');
                        return Promise.resolve(state);
                    }
                });
            },
            startChangeTracking: function startChangeTracking(){},
            hasChanges : function(name){
                assert.equal(name, 'highlighter', 'The method checks if the highlighter has changes');
                return true;
            },
            resetChanges: function(name){
                assert.equal(name, 'highlighter', 'The change tracking is reset');
            }
        }, pluginsMocks);

        toolStateBridge
            .setTools(['highlighter'])
            .getState('highlighter')
            .then(function(result){
                assert.deepEqual(result, state, 'The tool state is correct');
                QUnit.start();
            })
            .catch(function(err){
                assert.ok(false, err.message);
                QUnit.start();
            });
    });

    QUnit.asyncTest('can\'t get the tool state without changes', function(assert) {
        var toolStateBridge;
        QUnit.expect(2);

        toolStateBridge = toolStateBridgeFactory({
            getStore : function(){
                return Promise.resolve({
                    getItems : function(){
                        assert.ok(false, 'The store should not be called');
                    }
                });
            },
            startChangeTracking: function startChangeTracking(){},
            hasChanges : function(name){
                assert.equal(name, 'highlighter', 'The method checks if the highlighter has changes');
                return false;
            },
            resetChanges: function(){}
        }, pluginsMocks);

        toolStateBridge
            .setTools(['highlighter'])
            .getState('highlighter')
            .then(function(result){
                assert.ok(result === false, 'No changes, no state');
                QUnit.start();
            })
            .catch(function(err){
                assert.ok(false, err.message);
                QUnit.start();
            });
    });

    QUnit.asyncTest('get states', function(assert) {
        var toolStateBridge;

        var tools = ['highlighter', 'magnifier', 'timer'];
        var states = {
            highlighter : {
                foo : 'bar',
                noz : [123]
            },
            magnifier : {
                moo : true,
                nop : {
                    'a' : 1.5
                }
            }
        };

        QUnit.expect(4);

        toolStateBridge = toolStateBridgeFactory({
            getStore : function(name){
                return Promise.resolve({
                    getItems : function(){
                        assert.ok(tools.indexOf(name) > -1, 'Getting the state for the tool');
                        return Promise.resolve(states[name]);
                    }
                });
            },
            startChangeTracking: function startChangeTracking(){},
            hasChanges : function(){
                return true;
            },
            resetChanges: function(){}
        }, pluginsMocks);

        toolStateBridge
            .setTools(['highlighter', 'magnifier', 'timer'])
            .getStates()
            .then(function(result){
                assert.deepEqual(result, states, 'The given states matches');
                QUnit.start();
            })
            .catch(function(err){
                assert.ok(false, err.message);
                QUnit.start();
            });
    });

    QUnit.asyncTest('get states with changes', function(assert) {
        var toolStateBridge;

        var tools = ['highlighter', 'magnifier', 'timer'];
        var states = {
            highlighter : {
                foo : 'bar',
                noz : [123]
            },
            magnifier : {
                moo : true,
                nop : {
                    'a' : 1.5
                }
            }
        };

        QUnit.expect(2);

        toolStateBridge = toolStateBridgeFactory({
            getStore : function(name){
                return Promise.resolve({
                    getItems : function(){
                        assert.ok(tools.indexOf(name) > -1, 'Getting the state for the tool');
                        return Promise.resolve(states[name]);
                    }
                });
            },
            startChangeTracking: function startChangeTracking(){},
            hasChanges : function(name){
                return name === 'highlighter';
            },
            resetChanges: function(){}
        }, pluginsMocks);

        toolStateBridge
            .setTools(['highlighter', 'magnifier', 'timer'])
            .getStates()
            .then(function(result){
                assert.deepEqual(result, { highlighter : states.highlighter}, 'The received states contains only the highlighter');
                QUnit.start();
            })
            .catch(function(err){
                assert.ok(false, err.message);
                QUnit.start();
            });
    });
});
