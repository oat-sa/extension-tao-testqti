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
 * This helper provides information about the test navigation
 *
 * @author Bertrand Chevrier <bertrand@taotesting.com>
 */
define([
    'lodash',
    'taoQtiTest/runner/helpers/map'
], function (_, mapHelper) {
    'use strict';

    /**
     * @typedef {Object} navigationHelper
     */
    var navigationHelper = {

        /**
         * Check whether the test taker is leaving a section
         *
         * @param {Object} testContext - the actual test context
         * @param {String} testContext.itemIdentifier - the id of the current item
         * @param {String} testContext.sectionId - the id of the current section
         * @param {Object} testMap - the actual test map
         * @param {String} direction - the move direction (next, previous or jump)
         * @param {String} scope - the move scope (item, section, testPart)
         * @param {Number} [position] - the position in case of jump
         * @returns {Boolean} true if the action leads to a section leave
         * @throws {TypeError} if the context or the map are incorrects
         */
        isLeavingSection : function isLeavingSection(testContext, testMap, direction, scope, position){
            var section;
            var sectionStats;
            var nbItems;
            var item;
            if( _.isPlainObject(testContext) && _.isPlainObject(testMap) &&
                !_.isEmpty(testContext.sectionId) && !_.isEmpty(testContext.itemIdentifier) ){

                section      = mapHelper.getSection(testMap, testContext.sectionId);
                sectionStats = mapHelper.getSectionStats(testMap, testContext.sectionId);
                nbItems      = sectionStats && sectionStats.total;
                item         = mapHelper.getItem(testMap, testContext.itemIdentifier);

                return  scope === 'section' ||
                        scope === 'testPart'||
                        (direction === 'next' && item.positionInSection + 1 === nbItems) ||
                        (direction === 'previous' && item.positionInSection === 0) ||
                        (direction === 'jump' && position > 0 && (position < section.position || position >= section.position + nbItems));
            }
            throw new TypeError('Invalid test context and test map');
        },

        /**
         * Check whether the test taker is leaving a test part
         *
         * @param {Object} testContext - the actual test context
         * @param {String} testContext.itemIdentifier - the id of the current item
         * @param {String} testContext.sectionId - the id of the current section
         * @param {String} testContext.testPartId - the id of the current testPart
         * @param {Object} testMap - the actual test map
         * @param {String} direction - the move direction (next, previous or jump)
         * @param {String} scope - the move scope (item, section, testPart)
         * @param {Number} [position] - the position in case of jump
         * @returns {Boolean} true if the action leads to a section leave
         * @throws {TypeError} if the context or the map are incorrects
         */
        isLeavingTestPart : function isLeavingTestPart(testContext, testMap, direction, scope, position){
            var testPart;
            var testPartStats;
            var nbItems;
            var item;
            var section;
            var sectionStats;
            if( _.isPlainObject(testContext) && _.isPlainObject(testMap) &&
               !_.isEmpty(testContext.testPartId) && !_.isEmpty(testContext.sectionId) && !_.isEmpty(testContext.itemIdentifier) ){

                testPart      = mapHelper.getPart(testMap, testContext.testPartId);
                testPartStats = mapHelper.getPartStats(testMap, testContext.testPartId);
                nbItems       = testPartStats && testPartStats.total;
                item          = mapHelper.getItem(testMap, testContext.itemIdentifier);

                if(scope === 'section'){
                    section = mapHelper.getSection(testMap, testContext.sectionId);
                    sectionStats = mapHelper.getSectionStats(testMap, testContext.sectionId);
                }

                return  scope === 'testPart'||
                        (direction === 'next' && scope === 'item' && item.positionInPart + 1 === nbItems) ||
                        (direction === 'next' && scope === 'section' && section.position + sectionStats.total >= nbItems) ||
                        (direction === 'previous' && scope === 'item' && item.positionInPart === 0) ||
                        (direction === 'previous' && scope === 'section' && section.position === testPart.position) ||
                        (direction === 'jump' && position > 0 && (position < testPart.position || position >=  testPart.position + nbItems));
            }
            throw new TypeError('Invalid test context and test map');
        },

        /**
         * Check if the given  item is the last of the test
         * @param {Object} testMap - the test map
         * @param {String} itemIdentifier - the identifier of the item
         * @returns {Boolean} true if the item is the last one
         */
        isLast : function isLast(testMap, itemIdentifier){
            var item;
            var stats;
            if( ! _.isPlainObject(testMap) ){
                throw new TypeError('Invalid test map');
            }
            if(_.isEmpty(itemIdentifier)){
                throw new TypeError('Invalid item identifier');
            }

            item  = mapHelper.getItem(testMap, itemIdentifier);
            stats = mapHelper.getTestStats(testMap);

            return item.position + 1 === stats.total;
        }


    };

    return navigationHelper;
});
