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
     * @property {Number} overallCompleted - the number of completed items in the test
     * @property {Number} overall - the total number of items in the test
     * @property {progressDetails} sections - the details of testSections in the scope
     * @property {progressDetails} parts - the details of testParts in the scope
     * @property {progressDetails} answerableSections - the details of testSections that contain questions in the scope
     * @property {progressDetails} answerableParts - the details of testParts that contain questions in the scope
     * @property {progressDetails} matchedCategories - the details of items that match the expected categories in the scope
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
         * @param {String} config.scope - the scope of the progression
         * @param {Array} config.categories - categories to count by them
         * @returns {progressData}
         */
        test: function test(testMap, testContext, config) {
            var stats = getProgressStats(testMap, testContext, config, 'test');
            var item = mapHelper.getItemAt(testMap, testContext.itemPosition);
            stats.position = item.position + 1;
            return stats;
        },

        /**
         * Gets stats for the current test part
         * @param {Object} testMap - the actual test map
         * @param {Object} testContext - the actual test context
         * @param {progressConfig} config - a config object
         * @param {String} config.scope - the scope of the progression
         * @param {Array} config.categories - categories to count by them
         * @returns {progressData}
         */
        testPart: function testPart(testMap, testContext, config) {
            var stats = getProgressStats(testMap, testContext, config, 'testPart');
            var item = mapHelper.getItemAt(testMap, testContext.itemPosition);
            stats.position = item.positionInPart + 1;
            return stats;
        },

        /**
         * Gets stats for the current test section
         * @param {Object} testMap - the actual test map
         * @param {Object} testContext - the actual test context
         * @param {progressConfig} config - a config object
         * @param {String} config.scope - the scope of the progression
         * @param {Array} config.categories - categories to count by them
         * @returns {progressData}
         */
        testSection: function testSection(testMap, testContext, config) {
            var stats = getProgressStats(testMap, testContext, config, 'testSection');
            var item = mapHelper.getItemAt(testMap, testContext.itemPosition);
            stats.position = item.positionInSection + 1;
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
            return getRatioProgression(stats.answered, stats.questions);
        },

        /**
         * Indicator that shows the position of current item
         * @param {progressData} stats
         * @param {progressConfig} config
         * @param {String} config.scope - the scope of the progression
         * @param {Array} config.categories - categories to count by them
         * @returns {progressIndicator}
         */
        position: function position(stats, config) {
            return getPositionProgression(stats.position, stats.total, 'item', config);
        },

        /**
         * Indicator that shows the number of viewed questions
         * @param {progressData} stats
         * @param {progressConfig} config
         * @param {String} config.scope - the scope of the progression
         * @param {Array} config.categories - categories to count by them
         * @returns {progressIndicator}
         */
        questions: function questions(stats, config) {
            return getPositionProgression(stats.questionsViewed, stats.questions, 'item', config);
        },

        /**
         * Indicator that shows the number of reached answerable sections
         * @param {progressData} stats
         * @param {progressConfig} config
         * @param {String} config.scope - the scope of the progression
         * @param {Array} config.categories - categories to count by them
         * @returns {progressIndicator}
         */
        sections: function sections(stats, config) {
            return getPositionProgression(stats.answerableSections.reached, stats.answerableSections.total, 'section', config);
        },

        /**
         * Indicator that shows the number of viewed items which have categories from the configuration
         * (show all if categories are not set)
         * @param {progressData} stats
         * @param {progressConfig} config
         * @param {String} config.scope - the scope of the progression
         * @param {Array} config.categories - categories to count by them
         */
        categories: function categories(stats, config) {
            return getPositionProgression(stats.matchedCategories.position, stats.matchedCategories.total, 'item', config);
        }
    };

    /**
     * Fix the test map if the current test part is linear, as the current item should not be answered.
     * @param {Object} testMap - the actual test map
     * @param {Object} testContext - the actual test context
     * @returns {Object} The fixed test map
     */
    function getFixedMap(testMap, testContext) {
        var item;
        if (testContext.itemAnswered && testContext.isLinear) {
            testMap = _.cloneDeep(testMap);
            item = mapHelper.getItemAt(testMap, testContext.itemPosition);
            item.answered = false;
        }
        return testMap;
    }

    /**
     * Gets an empty stats record
     * @returns {progressDetails}
     */
    function getEmptyStats() {
        return {
            position: 0,
            reached: 0,
            viewed: 0,
            completed: 0,
            total: 0
        };
    }

    /**
     * Updates the progress stats from the given element
     * @param {progressDetails} stats - The stats details to update
     * @param {Object} element - The element from which take the details
     * @param {Number} position - The current item position
     */
    function updateStats(stats, element, position) {
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
     * Updates the progress stats from the given element
     * @param {progressDetails} stats - The stats details to update
     * @param {Object} element - The element from which take the details
     * @param {Number} position - The current item position
     */
    function updateItemStats(stats, element, position) {
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
     * Convert list of the categories to the hashtable to improve performance
     * @param categories
     * @returns {*}
     */
    function getCategoriesToMatch(categories) {
        var matchSize = categories && categories.length;
        return matchSize && _.reduce(categories, function(map, category) {
            map[category] = true;
            return map;
        }, {});
    }

    /**
     * Completes the progression stats
     * @param {Object} testMap - the actual test map
     * @param {Object} testContext - the actual test context
     * @param {progressConfig} config
     * @param {String} config.scope - the scope of the progression
     * @param {Array} config.categories - categories to count by them
     * @param {String} [scope] - The name of the scope. Can be: test, part, section (default: test)
     * @returns {progressData}
     */
    function getProgressStats(testMap, testContext, config, scope) {
        var fixedMap = getFixedMap(testMap, testContext);
        var scopedMap = mapHelper.getScopeMap(fixedMap, testContext.itemPosition, scope);
        var stats = _.clone(scopedMap.stats);
        var categoriesToMatch;
        var matchSize;

        if (config.indicator === 'categories') {
            categoriesToMatch = getCategoriesToMatch(config.categories);
            matchSize = config.categories && config.categories.length;
            stats.matchedCategories = getEmptyStats();
        }

        stats.parts = getEmptyStats();
        stats.sections = getEmptyStats();
        stats.answerableParts = getEmptyStats();
        stats.answerableSections = getEmptyStats();

        _.forEach(scopedMap.parts, function (part) {
            updateStats(stats.parts, part, testContext.itemPosition);

            if (part.stats.questions > 0) {
                updateStats(stats.answerableParts, part, testContext.itemPosition);
            }

            _.forEach(part.sections, function (section) {
                updateStats(stats.sections, section, testContext.itemPosition);

                if (section.stats.questions > 0) {
                    updateStats(stats.answerableSections, section, testContext.itemPosition);
                }

                if (config.indicator === 'categories') {
                    _.forEach(section.items, function (item) {
                        if (matchCategories(item.categories, categoriesToMatch, matchSize)) {
                            updateItemStats(stats.matchedCategories, item, testContext.itemPosition);
                        }
                    });
                }
            });
        });

        return stats;
    }

    /**
     *
     * @param {Array} categories - List of categories to check
     * @param {Object} expectedCategories - Hashtable of expected categories
     * @param {Number} minWanted - Minimal number of expected categories that should match
     * @returns {Boolean}
     */
    function matchCategories(categories, expectedCategories, minWanted) {
        var matched = 0;

        if (expectedCategories) {
            _.forEach(categories, function(category) {
                if (expectedCategories[category]) {
                    matched ++;
                    if (matched >= minWanted) {
                        return false;
                    }
                }
            });
        }
        return matched === minWanted;
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
     * @param {String} config.scope - the scope of the progression
     * @param {Array} config.categories - categories to count by them
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
     * @param {String} config.scope - the scope of the progression
     * @param {Array} config.categories - categories to count by them
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
         * Checks that categories matched
         * @param categories
         * @param expectedCategories
         * @returns {Boolean}
         */
        isMatchedCategories: function validCategories(categories, expectedCategories) {
            var categoriesToMatch = getCategoriesToMatch(expectedCategories);
            var matchSize = expectedCategories && expectedCategories.length;
            return matchCategories(categories, categoriesToMatch, matchSize);
        },

        /**
         * Computes the progress stats for the specified scope
         * @param {Object} testMap - the actual test map
         * @param {Object} testContext - the actual test context
         * @param {progressConfig} config - a config object
         * @param {String} config.scope - the scope of the progression
         * @param {Array} config.categories - categories to count by them
         * @returns {progressData}
         */
        computeStats: function computeStats(testMap, testContext, config) {
            var statsComputer = (config.scope && scopes[config.scope]) || scopes.test;
            var stats = statsComputer(testMap, testContext, config || defaultConfig);
            stats.overallCompleted = testContext.numberCompleted;
            stats.overall = testContext.numberItems;
            return stats;
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
