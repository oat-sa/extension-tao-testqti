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
     * Build the toolStateBridge instance.
     *
     *
     * In order to allow state management for a tool the matching plugin
     * needs to be activated.
     *
     * @param {testStore} testStore - the testStore instance
     * @param {Object} plugins - the collection of plugins,
     * @returns {toolStateBridge}
     */
    return function toolStateBridgeFactory(testStore, plugins) {

        var tools = [];

        if(!testStore || !_.isFunction(testStore.getStore)){
            throw new TypeError('The toolStateStore should be initialized with a testStore');
        }
        if(!_.isPlainObject(plugins) || _.size(plugins) === 0){
            throw new TypeError('The toolStateStore should be initialized with a the active plugins');
        }

        /**
         * @typedef {Object} toolStateBridge
         */
        return {

            /**
             *
             */
            setTools : function setTools(toolNames){

                tools = _.filter(toolNames, function(toolName){
                    return plugins && _.isPlainObject(plugins[toolName]) && plugins[toolName].active === true;
                });
                _.forEach(tools, function(toolName){
                    testStore.trackChanges(toolName);
                });
                return this;
            },


            getTools : function getTools(){
                return tools;
            },

            /**
             *
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

            restore : function restore(states){
                var self = this;
                return Promise.all(
                    _.map(states, function(toolState, toolName){
                        return self.restoreState(toolName, toolState);
                    })
                );
            },

            getState : function getState(toolName){

                if(testStore.hasChanges(toolName)){
                    return testStore
                        .getStore(toolName)
                        .then(function(toolStore){
                            testStore.resetChanges(toolName);
                            return toolStore.getItems();
                        });
                }
                return Promise.resolve(false);
            },

            getStates : function getStates(){
                var self = this;
                return Promise.all(
                    _.map(tools, function(toolName){
                        return self
                            .getState(toolName)
                            .then(function(toolState){
                                //format the state to keep the tool identifier
                                var formattedState = {};
                                if(toolState !== false){
                                    formattedState[toolName] = toolState;
                                    return formattedState;
                                }
                                return false;
                            });
                    })
                )
                .then(function(results){
                    return _.reduce(results, function(acc, value){
                        if(value){
                            return _.merge(acc, value);
                        }
                        return acc;
                    }, {});
                });
            },


        };
    };
});
