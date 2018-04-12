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
 * Copyright (c) 2018 (original work) Open Assessment Technologies SA ;
 */

/**
 * Compute the current progress in the Test Runner
 * @author Jean-Sébastien Conan <jean-sebastien@taotesting.com>
 */
define([
    'lodash',
    'i18n',
    'core/format',
    'taoQtiTest/runner/helpers/map'
], function (_, __, format, mapHelper) {
    'use strict';

    /**
     * @typedef {Object} progressDetails
     * @property {Number} position - the position in the current element
     * @property {Number} reached - the number of reached elements (at least one item viewed)
     * @property {Number} viewed - the number of viewed elements (all items viewed)
     * @property {Number} completed - the number of completed elements (all questions answered)
     * @property {Number} total - the total number of elements
     */

    /**
     * @typedef {itemStats} progressData
     * @property {Number} position - the position in the scope
     * @property {Number} completed - the number of completed items in the test
     * @property {Number} overall - the total number of items in the test
     * @property {progressDetails} sections - the details of testSections in the scope
     * @property {progressDetails} parts - the details of testParts in the scope
     * @property {progressDetails} answerableSections - the details of testSections that contain questions in the scope
     * @property {progressDetails} answerableParts - the details of testParts that contain questions in the scope
     */

    /**
     * @typedef {Object} progressIndicator
     * @property {Number} position - the position in the scope
     * @property {Number} total - the length of the scope
     * @property {Number} ratio - the progress ratio of the indicator
     * @property {String} label - the text to display for the indicator
     */

    /**
     * @typedef {Object} progressConfig
     * @property {String} scope - the scope of the progression
     * @property {String} indicator - the type of progression
     * @property {Bool} showTotal - display 'item x of y' (true) | 'item x'
     * @property {Array} categories - categories to count by them
     */

    /**
     * Default progress config
     * @type {Object}
     */
    var defaultConfig = {
        scope: 'test',
        indicator: 'percentage',
        showTotal: true,
        categories: []
    };

    /**
     * List of labels by types
     * @type {Object}
     */
    var labels = {
        item: {
            long: __('Item %d of %d'),
            short: __('Item %d')
        },
        section: {
            long: __('Section %d of %d'),
            short: __('Section %d')
        }
    };

    /**
     * Simple map of progress stats computers
     * @type {Object}
     */
    var scopes = {
        /**
         * Gets stats for the whole test
         * @param {Object} testMap - the actual test map
         * @param {Object} testContext - the actual test context
         * @param {progressConfig} config - a config object
         * @returns {progressData}
         */
        test: function test(testMap, testContext, config) {
            var scopedMap = mapHelper.getScopeMap(testMap, testContext.itemPosition, 'test');
            var item = mapHelper.getItemAt(scopedMap, testContext.itemPosition);
            var stats = getDetailedStats(scopedMap, item, config);
            stats.position = item.position + 1;
            stats.completed = testContext.numberCompleted;
            stats.overall = testContext.numberItems;
            return stats;
        },

        /**
         * Gets stats for the current test part
         * @param {Object} testMap - the actual test map
         * @param {Object} testContext - the actual test context
         * @param {progressConfig} config - a config object
         * @returns {progressData}
         */
        testPart: function testPart(testMap, testContext, config) {
            var scopedMap = mapHelper.getScopeMap(testMap, testContext.itemPosition, 'testPart');
            var item = mapHelper.getItemAt(scopedMap, testContext.itemPosition);
            var stats = getDetailedStats(scopedMap, item, config);
            stats.position = item.positionInPart + 1;
            stats.completed = testContext.numberCompleted;
            stats.overall = testContext.numberItems;
            return stats;
        },

        /**
         * Gets stats for the current test section
         * @param {Object} testMap - the actual test map
         * @param {Object} testContext - the actual test context
         * @param {progressConfig} config - a config object
         * @returns {progressData}
         */
        testSection: function testSection(testMap, testContext, config) {
            var scopedMap = mapHelper.getScopeMap(testMap, testContext.itemPosition, 'testSection');
            var item = mapHelper.getItemAt(scopedMap, testContext.itemPosition);
            var stats = getDetailedStats(scopedMap, item, config);
            stats.position = item.positionInSection + 1;
            stats.completed = testContext.numberCompleted;
            stats.overall = testContext.numberItems;
            return stats;
        }
    };

    /**
     * Simple map of progress indicator computers
     * @type {Object}
     */
    var indicators = {
        /**
         * Indicator that shows the percentage of completed items
         * @param {progressData} stats
         * @returns {progressIndicator}
         */
        percentage: function percentage(stats) {
            return getRatioProgression(stats.completed, stats.overall);
        },

        /**
         * Indicator that shows the position of current item
         * @param {progressData} stats
         * @param {progressConfig} config
         * @returns {progressIndicator}
         */
        position: function position(stats, config) {
            return getPositionProgression(stats.position, stats.total, 'item', config);
        },

        /**
         * Indicator that shows the number of viewed questions
         * @param {progressData} stats
         * @param {progressConfig} config
         * @returns {progressIndicator}
         */
        questions: function questions(stats, config) {
            return getPositionProgression(stats.questionsViewed, stats.questions, 'item', config);
        },

        /**
         * Indicator that shows the number of reached answerable sections
         * @param {progressData} stats
         * @param {progressConfig} config
         * @returns {progressIndicator}
         */
        sections: function sections(stats, config) {
            return getPositionProgression(stats.answerableSections.reached, stats.answerableSections.total, 'section', config);
        },

        /**
         * Indicator that shows the number of viewed items which have categories from the configuration
         * (show all if categories are not set)
         * @param stats
         * @param config
         */
        categories: function categories(stats, config) {
            return getPositionProgression(stats.matchedCategories.position, stats.matchedCategories.total, 'item', config);
        }
    };

    /**
     * Gets an empty stats record
     * @returns {progressDetails}
     */
    function getEmptyDetails() {
        return {
            position: 0,
            reached: 0,
            viewed: 0,
            completed: 0,
            total: 0
        };
    }

    /**
     * Updates the progress details from the given element
     * @param {progressDetails} stats - The stats details to update
     * @param {Object} element - The element from which take the details
     * @param {Number} position - The current item position
     */
    function updateDetails(stats, element, position) {
        if (element.position <= position) {
            stats.position++;
        }
        if (element.stats.viewed) {
            stats.reached++;

            if (element.stats.viewed === element.stats.total) {
                stats.viewed++;
            }
        }
        if (element.stats.answered) {
            if (element.stats.answered === element.stats.questions) {
                stats.completed++;
            }
        }
        stats.total++;
    }

    /**
     * Updates the progress details from the given element
     * @param {progressDetails} stats - The stats details to update
     * @param {Object} element - The element from which take the details
     * @param {Number} position - The current item position
     */
    function updateItemDetails(stats, element, position) {
        if (element.position <= position) {
            stats.position++;
        }
        if (element.viewed) {
            stats.reached++;
            stats.viewed++;
        }
        if (element.answered) {
            stats.completed++;
        }
        stats.total++;
    }

    /**
     * Completes the progression stats
     * @param {Object} testMap - the actual test map
     * @param {Object} currentItem - the current item from the test map
     * @returns {progressData}
     */
    function getDetailedStats(testMap, currentItem, config) {
        var stats = _.clone(testMap.stats);
        var categories = config.categories;
        stats.parts = getEmptyDetails();
        stats.sections = getEmptyDetails();
        stats.answerableParts = getEmptyDetails();
        stats.answerableSections = getEmptyDetails();
        stats.matchedCategories = getEmptyDetails();

        _.forEach(testMap.parts, function (part) {
            updateDetails(stats.parts, part, currentItem.position);

            if (part.stats.questions > 0) {
                updateDetails(stats.answerableParts, part, currentItem.position);
            }

            _.forEach(part.sections, function (section) {
                updateDetails(stats.sections, section, currentItem.position);

                if (section.stats.questions > 0) {
                    updateDetails(stats.answerableSections, section, currentItem.position);
                }

                _.forEach(section.items, function (item) {
                    var diff = _.intersection(item.categories, categories);
                    if (!categories.length || diff.length === categories.length) {
                        updateItemDetails(stats.matchedCategories, item, currentItem.position);
                    }
                });
            });
        });

        return stats;
    }

    /**
     * Gets the progression ratio
     * @param {Number} position
     * @param {Number} total
     * @returns {Number}
     */
    function getRatio(position, total) {
        if (position && total > 0) {
            return Math.floor(position / total * 100);
        }
        return 0;
    }

    /**
     * Gets the label of the progress bar for an item
     * @param {Number} position - the current position
     * @param {Number} total - the total number of items
     * @param {String} type - the type of element that is represented
     * @param {progressConfig} config - a config object
     * @returns {String}
     */
    function getProgressionLabel(position, total, type, config) {
        var patterns = labels[type] || labels.item;
        var pattern = config.showTotal ? patterns.long : patterns.short;
        return format(pattern, position || '0', total || '0');
    }

    /**
     * Gets the progression based on position
     * @param {Number} position - the current position
     * @param {Number} total - the total number of items
     * @param {String} type - the type of element that is represented
     * @param {progressConfig} config - a config object
     * @returns {progressIndicator}
     */
    function getPositionProgression(position, total, type, config) {
        return {
            position: position || 0,
            total: total || 0,
            ratio: getRatio(position, total),
            label: getProgressionLabel(position, total, type, config)
        };
    }

    /**
     * Gets the progression based on a ratio
     * @param {Number} position - the current position
     * @param {Number} total - the total number of items
     * @returns {progressIndicator}
     */
    function getRatioProgression(position, total) {
        var ratio = getRatio(position, total);
        return {
            position: position || 0,
            total: total || 0,
            ratio: ratio,
            label: ratio + '%'
        };
    }


    return {
        /**
         * Computes the progress stats for the specified scope
         * @param {Object} testMap - the actual test map
         * @param {Object} testContext - the actual test context
         * @param {progressConfig} config - a config object
         * @returns {progressData}
         */
        computeStats: function computeStats(testMap, testContext, config) {
            var statsComputer = (config.scope && scopes[config.scope]) || scopes.test;
            return statsComputer(testMap, testContext, config || defaultConfig);
        },

        /**
         * Computes the specified progress indicator
         * @param {progressData} stats - the progress stats
         * @param {String} type - the [type="percentage"] of indicator to compute (could be: percentage, position, questions, sections)
         * @param {progressConfig} [config] - a config object
         * @param {Boolean} [config.showTotal] - display 'item x of y' (true) | 'item x'
         * @returns {progressIndicator}
         */
        computeIndicator: function computeIndicator(stats, type, config) {
            var indicatorComputer = (type && indicators[type]) || indicators.percentage;
            return indicatorComputer(stats || {}, config || defaultConfig);
        },

        /**
         *
         * @param {Object} testMap - the actual test map
         * @param {Object} testContext - the actual test context
         * @param {progressConfig} config - a config object
         * @param {String} config.indicator - the type of progression
         * @param {String} config.scope - the scope of the progression
         * @param {Array} config.categories - categories to count by them
         * @param {Boolean} [config.showTotal=true] - display 'item x of y' (true) | 'item x'
         */
        computeProgress: function computeProgress(testMap, testContext, config) {
            var progressData;
            config = _.defaults(config || {}, defaultConfig);
            progressData = this.computeStats(testMap, testContext, config);
            return this.computeIndicator(progressData, config.indicator, config);
        }
    };
});
