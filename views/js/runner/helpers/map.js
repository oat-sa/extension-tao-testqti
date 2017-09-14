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
 * Copyright (c) 2016 (original work) Open Assessment Technologies SA ;
 */
/**
 * @author Jean-Sébastien Conan <jean-sebastien.conan@vesperiagroup.com>
 */
define([
    'lodash'
], function (_) {
    'use strict';

    /**
     * Gets an empty stats record
     * @returns {Object}
     */
    function getEmptyStats() {
        return {
            questions: 0,
            answered: 0,
            flagged: 0,
            viewed: 0,
            total: 0
        };
    }

    /**
     * Defines a helper that provides extractors for an assessment test map
     */
    return {
        /**
         * Gets the jumps table
         * @param {Object} map - The assessment test map
         * @returns {Object}
         */
        getJumps: function getJumps(map) {
            return map && map.jumps;
        },

        /**
         * Gets the parts table
         * @param {Object} map - The assessment test map
         * @returns {Object}
         */
        getParts: function getParts(map) {
            return map && map.parts;
        },

        /**
         * Get sections table
         * @param {Object} map - The assessment test map
         * @returns {Object} the sections
         */
        getSections: function getSections(map) {
            var parts = this.getParts(map),
                result = {};

            _.forEach(parts, function (part) {
                var sections = part.sections;
                if (sections) {
                    _.forEach(sections, function (section) {
                        result[section.id] = section;
                    });
                }
            });
            return result;
        },

        /**
         * Gets the jump at a particular position
         * @param {Object} map - The assessment test map
         * @param {Number} position - The position of the item
         * @returns {Object}
         */
        getJump: function getJump(map, position) {
            var jumps = this.getJumps(map);
            return jumps && jumps[position];
        },

        /**
         * Gets a test part by its identifier
         * @param {Object} map - The assessment test map
         * @param {String} partName - The identifier of the test part
         * @returns {Object}
         */
        getPart: function getPart(map, partName) {
            var parts = this.getParts(map);
            return parts && parts[partName];
        },

        /**
         * Gets a test section by its identifier
         * @param {Object} map - The assessment test map
         * @param {String} sectionName - The identifier of the test section
         * @returns {Object}
         */
        getSection: function getSection(map, sectionName) {
            var parts = this.getParts(map);
            var section = null;
            _.forEach(parts, function (part) {
                var sections = part.sections;
                if (sections && sections[sectionName]) {
                    section = sections[sectionName];
                    return false;
                }
            });
            return section;
        },

        /**
         * Gets a test item by its identifier
         * @param {Object} map - The assessment test map
         * @param {String} itemName - The identifier of the test item
         * @returns {Object}
         */
        getItem: function getItem(map, itemName) {
            var jump = _.find(this.getJumps(map), {identifier: itemName});
            return this.getItemAt(map, jump && jump.position);
        },

        /**
         * Gets the global stats of the assessment test
         * @param {Object} map - The assessment test map
         * @returns {Object}
         */
        getTestStats: function getTestStats(map) {
            return map && map.stats;
        },

        /**
         * Gets the stats of the test part containing a particular position
         * @param {Object} map - The assessment test map
         * @param {String} partName - The identifier of the test part
         * @returns {Object}
         */
        getPartStats: function getPartStats(map, partName) {
            var part = this.getPart(map, partName);
            return part && part.stats;
        },

        /**
         * Gets the stats of the test section containing a particular position
         * @param {Object} map - The assessment test map
         * @param {String} sectionName - The identifier of the test section
         * @returns {Object}
         */
        getSectionStats: function getSectionStats(map, sectionName) {
            var section = this.getSection(map, sectionName);
            return section && section.stats;
        },

        /**
         * Gets the stats related to a particular scope
         * @param {Object} map - The assessment test map
         * @param {Number} position - The current position
         * @param {String} [scope] - The name of the scope. Can be: test, part, section (default: test)
         * @returns {Object}
         */
        getScopeStats: function getScopeStats(map, position, scope) {
            var jump = this.getJump(map, position);
            switch (scope) {
                case 'section':
                case 'testSection':
                    return this.getSectionStats(map, jump && jump.section);

                case 'part':
                case 'testPart':
                    return this.getPartStats(map, jump && jump.part);

                default:
                case 'test':
                    return this.getTestStats(map);
            }
        },

        /**
         * Gets the map of a particular scope from a particular position
         * @param {Object} map - The assessment test map
         * @param {Number} position - The current position
         * @param {String} [scope] - The name of the scope. Can be: test, part, section (default: test)
         * @returns {object} The scoped map
         */
        getScopeMap: function getScopeMap(map, position, scope) {
            // need a clone of the map as we will change some properties
            var scopeMap = _.cloneDeep(map || {});

            // gets the current part and section
            var jump = this.getJump(map, position);
            var part = this.getPart(scopeMap, jump && jump.part);
            var section = this.getSection(scopeMap, jump && jump.section);

            // reduce the map to the scope part
            if (scope && scope !== 'test') {
                scopeMap.parts = {};
                if (part) {
                    scopeMap.parts[jump.part] = part;
                }
            }

            // reduce the map to the scope section
            if (part && (scope === 'section' || scope === 'testSection')) {
                part.sections = {};
                if (section) {
                    part.sections[jump.section] = section;
                }
            }

            // update the stats to reflect the scope
            if (section) {
                section.stats = this.computeItemStats(section.items);
            }
            if (part) {
                part.stats = this.computeStats(part.sections);
            }
            scopeMap.stats = this.computeStats(scopeMap.parts);

            return scopeMap;
        },

        /**
         * Gets the map of a particular scope from a current context
         * @param {Object} map - The assessment test map
         * @param {Object} context - The current session context
         * @param {String} [scope] - The name of the scope. Can be: test, part, section (default: test)
         * @returns {object} The scoped map
         */
        getScopeMapFromContext: function getScopeMapFromContext(map, context, scope) {
            // need a clone of the map as we will change some properties
            var scopeMap = _.cloneDeep(map || {});
            var part;
            var section;

            // gets the current part and section
            if (context && context.testPartId) {
                part = this.getPart(scopeMap, context.testPartId);
            }
            if (context && context.sectionId) {
                section = this.getSection(scopeMap, context.sectionId);
            }

            // reduce the map to the scope part
            if (scope && scope !== 'test') {
                scopeMap.parts = {};
                if (part) {
                    scopeMap.parts[context.testPartId] = part;
                }
            }

            // reduce the map to the scope section
            if (part && (scope === 'section' || scope === 'testSection')) {
                part.sections = {};
                if (section) {
                    part.sections[context.sectionId] = section;
                }
            }

            // update the stats to reflect the scope
            if (section) {
                section.stats = this.computeItemStats(section.items);
            }
            if (part) {
                part.stats = this.computeStats(part.sections);
            }
            scopeMap.stats = this.computeStats(scopeMap.parts);

            return scopeMap;
        },

        /**
         * Gets the test part containing a particular position
         * @param {Object} map - The assessment test map
         * @param {Number} position - The position of the item
         * @returns {Object}
         */
        getItemPart: function getItemPart(map, position) {
            var jump = this.getJump(map, position);
            return this.getPart(map, jump && jump.part);
        },

        /**
         * Gets the test section containing a particular position
         * @param {Object} map - The assessment test map
         * @param {Number} position - The position of the item
         * @returns {Object}
         */
        getItemSection: function getItemSection(map, position) {
            var jump = this.getJump(map, position);
            var part = this.getPart(map, jump && jump.part);
            var sections = part && part.sections;
            return sections && sections[jump && jump.section];
        },

        /**
         * Gets the item located at a particular position
         * @param {Object} map - The assessment test map
         * @param {Number} position - The position of the item
         * @returns {Object}
         */
        getItemAt: function getItemAt(map, position) {
            var jump = this.getJump(map, position);
            var part = this.getPart(map, jump && jump.part);
            var sections = part && part.sections;
            var section = sections && sections[jump && jump.section];
            var items = section && section.items;
            return items && items[jump && jump.identifier];
        },

        /**
         * Gets the identifier of an existing item
         * @param {Object} map - The assessment test map
         * @param {Number|String} position - The position of the item, can already be the identifier
         * @returns {String}
         */
        getItemIdentifier: function getItemIdentifier(map, position) {
            var item;
            if (_.isFinite(position)) {
                item = this.getItemAt(map, position);
            } else {
                item = this.getItem(map, position);
            }
            return item && item.id;
        },

        /**
         * Applies a callback on each item of the provided map
         * @param {Object} map - The assessment test map
         * @param {Function} callback(item, section, part, map) - A callback to apply on each item
         * @returns {Object}
         */
        each: function each(map, callback) {
            if (_.isFunction(callback)) {
                _.forEach(map && map.parts, function(part) {
                    _.forEach(part && part.sections, function(section) {
                        _.forEach(section && section.items, function(item) {
                            callback(item, section, part, map);
                        });
                    });
                });
            }
            return map;
        },

        /**
         * Update the map stats from a particular item
         * @param {Object} map - The assessment test map
         * @param {Number} position - The position of the item
         * @returns {Object}
         */
        updateItemStats: function updateItemStats(map, position) {
            var jump = this.getJump(map, position);
            var part = this.getPart(map, jump && jump.part);
            var sections = part && part.sections;
            var section = sections && sections[jump && jump.section];

            if (section) {
                section.stats = this.computeItemStats(section.items);
            }
            if (part) {
                part.stats = this.computeStats(part.sections);
            }
            if (map) {
                map.stats = this.computeStats(map.parts);
            }

            return map;
        },

        /**
         * Computes the stats for a list of items
         * @param {Object} items
         * @returns {Object}
         */
        computeItemStats: function computeItemStats(items) {
            return _.reduce(items, function accStats(acc, item) {
                if (!item.informational) {
                    acc.questions++;
                }
                if (item.answered) {
                    acc.answered++;
                }
                if (item.flagged) {
                    acc.flagged++;
                }
                if (item.viewed) {
                    acc.viewed++;
                }
                acc.total++;
                return acc;
            }, getEmptyStats());
        },

        /**
         * Computes the global stats of a collection of stats
         * @param {Object} collection
         * @returns {Object}
         */
        computeStats: function computeStats(collection) {
            return _.reduce(collection, function accStats(acc, item) {
                acc.questions += item.stats.questions;
                acc.answered += item.stats.answered;
                acc.flagged += item.stats.flagged;
                acc.viewed += item.stats.viewed;
                acc.total += item.stats.total;
                return acc;
            }, getEmptyStats());
        }
    };
});
