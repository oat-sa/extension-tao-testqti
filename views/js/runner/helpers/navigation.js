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
            if(_.isPlainObject(testContext) && !_.isEmpty(testContext.sectionId) && !_.isEmpty(testContext.itemIdentifier) && _.isPlainObject(testMap)){
                section = mapHelper.getSection(testMap, testContext.sectionId);
                sectionStats = mapHelper.getSectionStats(testMap, testContext.sectionId);
                nbItems = sectionStats && sectionStats.total;
                item = mapHelper.getItem(testMap, testContext.itemIdentifier);

                return (direction === 'next' && (scope === 'section' || item.positionInSection + 1 === nbItems)) ||
                    (direction === 'previous' && item.positionInSection === 0) ||
                    (direction === 'jump' && position > 0 && (position < section.position || position >= section.position + nbItems));
            }
            throw new TypeError('Invalid test context and test map');
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
