/*
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
 *
 */

/**
 * Manages to restore and retrieve the states of the tools.
 * The main purpose is to wrap the check and wrap calls to the testStore.
 *
 * ONE TOOL  => ONE PLUGIN
 * TOOL_NAME => PLUGIN_NAME
 *
 * @author Bertrand Chevrier <bertrand@taotesting.com>
 */
define([
    'lodash',
], function (_) {
    'use strict';

    /**
     * Merge each item of a collection with the next
     * @param {Object[]} collection
     * @return {Object} the merged collection
     */
    var mergeCollection = function mergeCollection(collection){
        return _.reduce(collection, function(acc, value){
            if(value){
                return _.merge(acc, value);
            }
            return acc;
        }, {});
    };

    /**
     * Build the toolStateBridge instance.
     *
     *
     * In order to allow state management for a tool the matching plugin
     * needs to be activated.
     *
     * @param {testStore} testStore - the testStore instance
     * @param {String[]} activePlugins - the list of active plugins
     * @returns {toolStateBridge}
     */
    return function toolStateBridgeFactory(testStore, activePlugins) {

        var tools = [];

        if(!testStore || !_.isFunction(testStore.getStore)){
            throw new TypeError('The toolStateBridge should be initialized with a testStore');
        }
        if(!_.isArray(activePlugins) || !activePlugins.length){
            throw new TypeError('The toolStateBridge should be initialized with a the list of active plugins');
        }

        /**
         * @typedef {Object} toolStateBridge
         */
        return {

            /**
             * Set the tools to manage the states.
             * Each toolName MUST match a plugin name.
             *
             * This trigger the change tracking in the testStore for the
             * stores with the tool/plugin name.
             *
             * @param {String[]} toolNames - the list of tool names
             * @returns {toolStateBridge} chains
             */
            setTools : function setTools(toolNames){

                tools = _(toolNames)
                    .filter(function(toolName){
                        return _.contains(activePlugins, toolName);
                    })
                    .map(function(toolName){
                        testStore.startChangeTracking(toolName);
                        return toolName;
                    })
                    .value();
                return this;
            },

            /**
             * Get the list of tools
             * @returns {String[]} the list of configured tools
             */
            getTools : function getTools(){
                return tools;
            },

            /**
             * Restore the state of the given tool
             * @param {String} toolName - the name of the tool
             * @param {Object} toolState - the state to restore
             * @returns {Promise<Boolean>} resolves with true if restored
             */
            restoreState: function restoreState(toolName, toolState){

                if(_.contains(tools, toolName) && _.isPlainObject(toolState)){
                    return testStore
                        .getStore(toolName)
                        .then(function(toolStore){
                            return toolStore.clear()
                                .then(function(){
                                    return toolStore;
                                });
                        })
                        .then(function(toolStore){
                            return Promise.all(
                                _.map(toolState, function(value, key){
                                    return toolStore.setItem(key, value);
                                })
                            );
                        })
                        .then(function(){
                            testStore.resetChanges(toolName);
                            return true;
                        });
                }
                return Promise.resolve(false);
            },

            /**
             * Restore the states of multiple tools
             * @param {Object} states - key is the toolName and the value the state to resolve
             * @returns {Promise<Object>} key is the restored toolName and the value is the status
             */
            restoreStates : function restoreStates(states){
                var self = this;
                return Promise.all(
                    _.map(states, function(toolState, toolName){
                        return self.restoreState(toolName, toolState)
                            .then(function(result){
                                var formattedResult = {};
                                formattedResult[toolName] = result;
                                return formattedResult;
                            });
                    })
                )
                .then(mergeCollection);
            },

            /**
             * Get the state of a given tool
             * @param {String} toolName - the name of the tool
             * @param {Boolean} [reset] - do we reset the change tracking ?
             * @returns {Promise<Object|Boolean>} resolves with the state
             */
            getState : function getState(toolName, reset){
                if(_.contains(tools, toolName) && testStore.hasChanges(toolName)){
                    return testStore
                        .getStore(toolName)
                        .then(function(toolStore){
                            if(reset !== false){
                                testStore.resetChanges(toolName);
                            }
                            return toolStore.getItems();
                        });
                }
                return Promise.resolve(false);
            },

            /**
             * Get the state for all tools with changes
             * @returns {Promise<Object>} resolves with the states
             */
            getStates : function getStates(){
                var self = this;
                return Promise.all(
                    _.map(tools, function(toolName){
                        return self
                            .getState(toolName)
                            .then(function(toolState){
                                //format the state to keep the tool identifier
                                var formattedState = {};
                                if(toolState){
                                    formattedState[toolName] = toolState;
                                    return formattedState;
                                }
                                return false;
                            });
                    })
                )
                .then(mergeCollection);
            }
        };
    };
});
