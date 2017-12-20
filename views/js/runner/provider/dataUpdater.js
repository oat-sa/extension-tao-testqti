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
 * Copyright (c) 2017 (original work) Open Assessment Technologies SA
 *
 */

/**
 * In charge of updating testRunner's data
 *
 * @author Bertrand Chevrier <bertrand@taotesting.com>
 */
define([
    'lodash',
    'taoQtiTest/runner/helpers/map',
], function (_, mapHelper) {
    'use strict';

    /**
     * Get the updater
     * @param {Map} testDataHolder - the data holder
     * @returns {dataUpdater}
     * @throws {TypeError} if the data holder is not or incorrectly set
     */
    return function dataUpdaterFactory(testDataHolder){

        if(!testDataHolder || !_.isFunction(testDataHolder.get) || !_.isFunction(testDataHolder.set)){
            throw new TypeError('A data holder is mandatory for the udpater');
        }

        /**
         * Exposes the methods to update test data
         * @typedef {Object} dataUpdater
         */
        return {

            /**
             * Update test data from a dataSet (usually their raw data given by the proxy).
             * If the dataSet is a collection, we use only the last matching object.
             * @param {Object|Object[]} dataSet - object[s] that contains or not testData, testContext & testMap
             */
            update : function update(dataSet) {
                var self = this;

                /**
                 * Check if a collection's item contains test contextual data
                 * @param {Object} contextualData
                 * @returns {Boolean}
                 */
                var isContextual = function isContextual(contextualData){
                    return contextualData && (
                           _.isPlainObject(contextualData.testContext) ||
                           _.isPlainObject(contextualData.testData)  ||
                           _.isPlainObject(contextualData.testMap) );
                };

                /**
                 * Update the test data from contextual data
                 * @param {Object} contextualData
                 */
                var updateData = function updateData(contextualData){
                    var builtTestMap;
                    var updatedTestMap;

                    if(contextualData){
                        if(_.isPlainObject(contextualData.testData)){
                            testDataHolder.set('testData', contextualData.testData);
                        }
                        if(_.isPlainObject(contextualData.testContext)){
                            testDataHolder.set('testContext', contextualData.testContext);
                        }
                        if(_.isPlainObject(contextualData.testMap)){
                            //the received map is not complete and should be "built"
                            builtTestMap  = self.buildTestMap(contextualData.testMap);
                            if(builtTestMap){
                                testDataHolder.set('testMap', builtTestMap);
                            }
                        }

                        //always update the map stats
                        updatedTestMap = self.updateStats();
                        if(updatedTestMap){
                            testDataHolder.set('testMap', updatedTestMap);
                        }
                    }
                };
                if(isContextual(dataSet)){
                    updateData(dataSet);
                } else {
                    updateData( _.findLast(dataSet, isContextual));
                }
            },

            /**
             *  - reindex and build the jump table
             *  - patch the current testMap if a partial map is set
             *
             * @param {Object} testMap - the testMap to build
             * @returns {Object} the built testMap
             */
            buildTestMap : function buildTestMap(testMap){
                var newMap = null;

                if(testMap){
                    if(testMap.scope && testMap.scope !== 'test'){
                        newMap = mapHelper.patch(testDataHolder.get('testMap'), testMap);
                    } else {
                        newMap = mapHelper.reindex(testMap);
                    }
                }

                return newMap;
            },

            /**
             * Update current map stats based on the context
             *
             * @param {Object} testMap - the testMap to update
             * @returns {Object} the updated testMap
             */
            updateStats : function updateStats(){

                var testMap        = testDataHolder.get('testMap');
                var testContext    = testDataHolder.get('testContext');
                var testData       = testDataHolder.get('testData');
                var updatedTestMap = null;
                var item;

                if(testMap && testContext && _.isNumber(testContext.itemPosition) && testData && testData.states){

                    item = mapHelper.getItemAt(testMap, testContext.itemPosition);

                    if(item && testContext.state === testData.states.interacting){

                        //flag as viewed, always
                        item.viewed = true;

                        //flag as answered only if a response has been set
                        if (!_.isUndefined(testContext.itemAnswered)) {
                            item.answered = testContext.itemAnswered;
                        }

                        updatedTestMap = mapHelper.updateItemStats(testMap, testContext.itemPosition);
                    }
                }
                return updatedTestMap;
            },

            /**
             * Let's you update the plugins configuration from when filling testData
             * @param {plugin[]} plugins - the test runner plugins
             */
            updatePluginsConfig : function updatePluginsConfig(plugins){

                var testData = testDataHolder.get('testData');
                if(plugins && testData && testData.config && testData.config.plugins){
                    _.forEach(testData.config.plugins, function(config, pluginName){
                        if(_.isPlainObject(plugins[pluginName]) && _.isFunction(plugins[pluginName].setConfig) && _.isPlainObject(config)){
                            plugins[pluginName].setConfig(config);
                        }
                    });
                }
            }
        };
    };
});
