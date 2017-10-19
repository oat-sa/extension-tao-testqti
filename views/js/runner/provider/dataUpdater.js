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
 * Copyright (c) 2017 (original work) Open Assessment Technlogies SA
 *
 */

/**
 * Updates testRunner data
 *
 *
 * @author Bertrand Chevrier <bertrand@taotesting.com>
 */
define([
    'lodash',
    'taoQtiTest/runner/helpers/map',
], function (_, mapHelper) {
    'use strict';

    return function dataUpdater(testDataHolder){

        if(!testDataHolder || !_.isFunction(testDataHolder.get) || !_.isFunction(testDataHolder.set)){
            throw new TypeError('A data holder is mandatory for the udpater');
        }

        return {
            update : function update(dataSet) {
                var self = this;
                var isContextual = function isContextual(response){
                    return _.isPlainObject(response.testContext) ||
                           _.isPlainObject(response.testData)  ||
                           _.isPlainObject(response.testMap);
                };

                var updateData = function updateData(response){
                    var builtTestMap;
                    var updatedTestMap;


                    if(response){
                        if(_.isPlainObject(response.testData)){
                            testDataHolder.set('testData', response.testData);
                        }
                        if(_.isPlainObject(response.testContext)){
                            testDataHolder.set('testContext', response.testContext);
                        }
                        if(_.isPlainObject(response.testMap)){
                            //the received map is not complete and should be "built"
                            builtTestMap  = self.buildTestMap(response.testMap);
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
             * Update current based on the context
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
            }
        };
    };
});
