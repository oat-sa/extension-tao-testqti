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
         * @throws {TypeError} if the context or the map are incorrect
         */
        isLeavingSection : function isLeavingSection(testContext, testMap, direction, scope, position){
            var section;
            var sectionStats;
            var nbItems;
            var item;
            if( _.isPlainObject(testContext) && _.isPlainObject(testMap) &&
                !_.isEmpty(testContext.sectionId) && !_.isEmpty(testContext.itemIdentifier) ){

                section = mapHelper.getSection(testMap, testContext.sectionId);
                sectionStats = mapHelper.getSectionStats(testMap, testContext.sectionId);
                nbItems = sectionStats && sectionStats.total;
                item = mapHelper.getItem(testMap, testContext.itemIdentifier);

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
         * @throws {TypeError} if the context or the map are incorrect
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
            return this.isLastOf(testMap, itemIdentifier, 'test');
        },

        /**
         * Check if the given  item is the first of a test
         * @param {Object} testMap - the test map
         * @param {String} itemIdentifier - the identifier of the item
         * @returns {Boolean} true if the item is the first one
         */
        isFirst : function isFirst(testMap, itemIdentifier){
            return this.isFirstOf(testMap, itemIdentifier, 'test');
        },

        /**
         * Check if the given  item is the last of a the given scope
         * @param {Object} testMap - the test map
         * @param {String} itemIdentifier - the identifier of the item
         * @param {String} [scope = 'test'] - the target scope
         * @returns {Boolean} true if the item is the last one
         */
        isLastOf : function isLastOf(testMap, itemIdentifier, scope){
            var item;
            var stats;
            if ( ! _.isPlainObject(testMap) ) {
                throw new TypeError('Invalid test map');
            }
            if (_.isEmpty(itemIdentifier)) {
                throw new TypeError('Invalid item identifier');
            }
            scope = scope || 'test';
            item  = mapHelper.getItem(testMap, itemIdentifier);
            stats = mapHelper.getScopeStats(testMap, item.position, scope);
            if (stats && _.isNumber(stats.total)) {
                if (scope === 'test') {
                    return item.position + 1  === stats.total;
                }
                if (scope === 'section' || scope === 'assessmentSection' || scope === 'testSection') {
                    return item.positionInSection + 1 === stats.total;
                }
                if (scope === 'part' || scope === 'testPart') {
                    return item.positionInPart + 1 === stats.total;
                }
            }

            return false;
        },

        /**
         * Check if the given  item is the first of a the given scope
         * @param {Object} testMap - the test map
         * @param {String} itemIdentifier - the identifier of the item
         * @param {String} [scope = 'test'] - the target scope
         * @returns {Boolean} true if the item is the first one
         */
        isFirstOf : function isFirstOf(testMap, itemIdentifier, scope){
            var item;
            if (! _.isPlainObject(testMap)) {
                throw new TypeError('Invalid test map');
            }
            if (_.isEmpty(itemIdentifier)) {
                throw new TypeError('Invalid item identifier');
            }
            scope = scope || 'test';
            item  = mapHelper.getItem(testMap, itemIdentifier);

            if (scope === 'test') {
                return item.position  === 0;
            }
            if (scope === 'section' || scope === 'assessmentSection' || scope === 'testSection') {
                return item.positionInSection === 0;
            }
            if (scope === 'part' || scope === 'testPart') {
                return item.positionInPart === 0;
            }

            return false;
        },

        /**
         * Gets the map descriptors of the sibling items
         * @param {Object} testMap
         * @param {Number|String} itemPosition - (could be also the item id)
         * @param {String} [direction='both'] - previous/next/both
         * @param {Number} [size=3] - will be 2xsize if direction is both
         * @returns {Object[]} the collections of items
         */
        getSiblingItems: function getSiblingItems(testMap, itemPosition, direction, size) {
            var itemId = mapHelper.getItemIdentifier(testMap,  itemPosition);
            var previous = null;
            var siblings = [];
            var directions;

            var itemChain = _.reduce(testMap && testMap.jumps, function (map, jump) {
                var ref = jump.identifier;
                if (previous) {
                    map[previous].next = ref;
                }
                map[ref] = {
                    identifier: ref,
                    previous: previous,
                    next: null
                };
                previous = ref;
                return map;
            }, {});

            size = _.isFinite(size) ? parseInt(size, 10) : 3;
            if (!direction || direction === 'both') {
                directions = ['previous', 'next'];
            } else {
                directions = [direction];
            }

            _.forEach(directions, function walkDirection(link) {
                var id = itemId;
                _.times(size, function getNeighbor() {
                    id = itemChain[id] && itemChain[id][link];
                    if (id) {
                        siblings.push(mapHelper.getItem(testMap, id));
                    } else {
                        return false;
                    }
                });
            });

            return siblings;
        },


        /**
         * Gets the map descriptor of the next item
         * @param {Object} testMap
         * @param {Number|String} itemPosition - (could be also the item id)
         * @returns {Object}
         */
        getNextItem : function getNextItem(testMap, itemPosition) {
            var siblings = navigationHelper.getSiblingItems(testMap, itemPosition, 'next', 1);
            if (siblings.length) {
                return siblings[0];
            }
            return null;
        },

        /**
         * Gets the map descriptor of the previous item
         * @param {Object} testMap
         * @param {Number|String} itemPosition - (could be also the item id)
         * @returns {Object}
         */
        getPreviousItem : function getPreviousItem(testMap, itemPosition) {
            var siblings = navigationHelper.getSiblingItems(testMap, itemPosition, 'previous', 1);
            if (siblings.length) {
                return siblings[0];
            }
            return null;
        },

        /**
         * Checks if an action will move forward.
         * @param {String} action - the name of the action that will be performed
         * @param {Object} [params] - some optional parameters that apply to the action
         * @returns {Boolean}
         */
        isMovingToNextItem : function isMovingToNextItem(action, params) {
            params = params || {};
            return (
                action === 'timeout' ||
                action === 'skip' ||
                (action === 'move' && params.direction === 'next' && params.scope === 'item')
            );
        },

        /**
         * Checks if an action will move backward.
         * @param {String} action - the name of the action that will be performed
         * @param {Object} [params] - some optional parameters that apply to the action
         * @returns {Boolean}
         */
        isMovingToPreviousItem : function isMovingToPreviousItem(action, params) {
            params = params || {};
            return (
                action === 'move' && params.direction === 'previous' && params.scope === 'item'
            );
        },

        /**
         * Checks if an action will jump on another item.
         * @param {String} action - the name of the action that will be performed
         * @param {Object} [params] - some optional parameters that apply to the action
         * @returns {Boolean}
         */
        isJumpingToItem : function isJumpingToItem(action, params) {
            params = params || {};
            return (
                action === 'move' && params.direction === 'jump' && params.scope === 'item'
            );
        }

    };

    return navigationHelper;
});
