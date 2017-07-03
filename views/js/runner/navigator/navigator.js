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
 * @author Bertrand Chevrier <bertrand@taotesting.com>
 */
define([
    'lodash',
    'taoQtiTest/runner/helpers/map',
    'taoQtiTest/runner/helpers/navigation'
], function(_, mapHelper, navigationHelper){
    'use strict';

    var navigatorFactory = function navigatorFactory(testData, testContext, testMap){

        if(!_.all([testData, testContext, testMap], _.isPlainObject)){
            throw new TypeError('The navigator must be built with a testData, a testContext and a testMap');
        }

        return {

            nextItem : function nextItem(){
                var newSection;
                var newTestPart;
                var isLeavingSection = navigationHelper.isLeavingSection(testContext, testMap, 'next', 'item');
                var isLeavingTestPart = navigationHelper.isLeavingTestPart(testContext, testMap, 'next', 'item');
                var updatedContext = _.cloneDeep(testContext);

                var newItem = mapHelper.getItemAt(testMap, testContext.itemPosition + 1);

                updatedContext.itemPosition += 1;

                //FIXME numberPresented can be late
                updatedContext.numberPresented = testMap.stats.viewed;

                updatedContext.itemIdentifier = newItem.id;

                //FIXME should be adapted to the new way to retrieve item ids/URIs
                updatedContext.itemUri = newItem.uri;
                updatedContext.itemDefinition = newItem.uri;

                //FIXME unsupported yet
                updatedContext.hasFeedback = false;
                updatedContext.numberRubrics = 0;
                updatedContext.rubrics = null;

                //FIXME attempts can be incorrects (based on last known value)
                if(newItem.remainingAttempts > -1){
                    updatedContext.remainingAttempts = newItem.remainingAttempts - 1;
                }

                //FIXME maintain attempts
                //FIXME sync attemptDuration

                if(isLeavingSection){
                    newSection = mapHelper.getItemSection(testMap, newItem.position);
                    updatedContext.sectionId = newSection.id;
                    updatedContext.sectionTitle = newSection.label;
                }
                if(isLeavingTestPart){
                    newTestPart = mapHelper.getItemPart(testMap, newItem.position);
                    updatedContext.testPartId = newTestPart.id;
                }
                updatedContext.isLast = navigationHelper.isLast(testMap, newItem.id);

                return updatedContext;
            },

            previousItem : function previsousItem(){

            },

            nextSection : function nextSection(){

            },

            jump : function jump(position){

            }
        };

        return navigator;
    };

    return navigatorFactory;
});
