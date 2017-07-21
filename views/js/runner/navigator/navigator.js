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
 * Navigate inside a test based on the information we have (testData, testMap and testContext),
 * we can't guess some of the information, so we're back to the default values :
 *  - rubric blocks (we just leave it, except if we change the section)
 *  - timers (we remove them if we change the scope)
 *  - attempts (we calculated the remaining attempts based on the last known value)
 *  - feedback is not supported
 *
 * @author Bertrand Chevrier <bertrand@taotesting.com>
 */
define([
    'lodash',
    'taoQtiTest/runner/helpers/map',
    'taoQtiTest/runner/helpers/navigation'
], function(_, mapHelper, navigationHelper){
    'use strict';

    /**
     * Gives you a navigator
     * @param {Object} testData
     * @param {Object} testContext
     * @param {Object} testMap
     * @returns {Object} the navigator
     * @throws {TypeError} if the given parameters aren't objects
     */
    var navigatorFactory = function navigatorFactory(testData, testContext, testMap){

        /**
         * Build context data, mostly from the test map if you
         * want to move the item to the given position
         * @param {Number} position - the target position
         * @returns {Object} the new context data
         */
        var buildContextFromPosition = function buildContextFromPosition(position){

            var newSection;
            var newTestPart;
            var isLeavingSection;
            var isLeavingTestPart;
            var newContext;
            var updatedMap = mapHelper.updateItemStats(testMap, position);
            var newItem    = mapHelper.getItemAt(updatedMap, position);

            if(!newItem){
                return false;
            }

            newSection        = mapHelper.getItemSection(updatedMap, position);
            newTestPart       = mapHelper.getItemPart(updatedMap, position);
            isLeavingSection  = (newSection.id !== testContext.sectionId);
            isLeavingTestPart = (newTestPart.id !== testContext.testPartId);

            //guess the new testContext data
            newContext = {
                itemIdentifier : newItem.id,
                itemUri        : newItem.definition,
                itemDefinition : newItem.definition,
                itemPosition   : position,

                //FIXME numberPresented can be late
                numberPresented : testMap.stats.viewed,
                numberCompleted : testMap.stats.answered,

                //FIXME unsupported yet
                hasFeedbacks : false,

                //FIXME maintain attempts
                //FIXME attempts can be incorrect (based on last known value)
                remainingAttempts : (newItem.remainingAttempts > -1) ? newItem.remainingAttempts - 1 : -1,
                attemptDuration   : 0,

                sectionId:       newSection.id,
                sectionTitle:    newSection.label,
                testPartId:      newTestPart.id,
                isLinear:        newTestPart.isLinear,
                isLast:          navigationHelper.isLast(testMap, newItem.id),
                canMoveBackward: !newTestPart.isLinear && !navigationHelper.isFirst(testMap, newItem.id)
            };

            //if the section is different, we don't keep the rubric blocks
            if(isLeavingSection){
                newContext.numberRubrics = 0;
                newContext.rubrics = '';
            }

            //remove timers if they're not on the same scope
            newContext.timeConstraints = _.filter(testContext.timeConstraints, function(constraint){
                return constraint.qtiClassName === 'assessmentItemRef' ||
                       isLeavingSection && constraint.qtiClassName === 'assessmentSection' ||
                       isLeavingTestPart && constraint.qtiClassName === 'testPart';
            });

            return newContext;
        };

        if(!_.all([testData, testContext, testMap], _.isPlainObject)){
            throw new TypeError('The navigator must be built with a testData, a testContext and a testMap');
        }

        return {

            /**
             * Selects and execute the navigation method based on the direction/scope.
             *
             * @param {String} direction - the move direction (next, previous or jump)
             * @param {String} scope - the move scope (item, section, testPart)
             * @param {Number} [position] - the position in case of jump
             * @returns {Object|Boolean} - false if we can't navigate, otherwise the result of the nav
             */
            navigate : function navigate(direction, scope, position){
                var methodName = direction.toLowerCase() +
                                 scope.substr(0, 1).toUpperCase() +
                                 scope.substr(1).toLowerCase();

                if(_.isFunction(this[methodName])){
                    return this[methodName](position);
                }
            },

            /**
             * Navigate to the next item
             * @returns {Object} the new test context
             */
            nextItem : function nextItem(){
                return  _.merge({}, testContext, buildContextFromPosition(testContext.itemPosition + 1));
            },

            /**
             * Navigate to the next item
             * @returns {Object} the new test context
             */
            previousItem : function previsousItem(){
                return _.merge({}, testContext, buildContextFromPosition(testContext.itemPosition - 1));
            },

            /**
             * Navigate to the next item
             * @returns {Object} the new test context
             */
            nextSection : function nextSection(){
                var sectionStats = mapHelper.getSectionStats(testMap, testContext.sectionId);
                return _.merge({}, testContext, buildContextFromPosition(sectionStats.total));
            },

            /**
             * Navigate to the given position
             * @param {Number} position - the position
             * @returns {Object} the new test context
             */
            jumpItem : function jumpItem(position){
                return _.merge({}, testContext, buildContextFromPosition(position));
            }
        };
    };

    return navigatorFactory;
});
