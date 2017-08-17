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
    'lodash',
    'i18n',
    'taoQtiTest/runner/helpers/map',
    'taoQtiTest/runner/helpers/stats',
    'taoQtiTest/runner/helpers/currentItem'
], function (_, __, mapHelper, statsHelper, currentItemHelper) {
    'use strict';

    /**
     * Completes an exit message
     * @param {String} message - custom message that will be appended to the unanswered stats count
     * @param {String} scope - scope to consider for calculating the stats
     * @param {Object} runner - testRunner instance
     * @returns {String} Returns the message text
     */
    function getExitMessage(message, scope, runner) {
        var itemsCountMessage = '';

        var testData = runner.getTestData(),
            testConfig = testData && testData.config,
            messageEnabled = testConfig ? testConfig.enableUnansweredItemsWarning : true;

        if (messageEnabled) {
            itemsCountMessage = getUnansweredItemsWarning(scope, runner);
        }

        return (itemsCountMessage + " " + message).trim();
    }

    /**
     * Build message if not all items have answers
     * @param {String} scope - scope to consider for calculating the stats
     * @param {Object} runner - testRunner instance
     * @returns {String} Returns the message text
     */
    function getUnansweredItemsWarning(scope, runner) {
        var stats = statsHelper.getInstantStats(scope, runner);
        var unansweredCount = stats && (stats.questions - stats.answered);
        var flaggedCount = stats && stats.flagged;
        var itemsCountMessage = '';
        var map = runner.getTestMap();
        var jump = mapHelper.getJump(map, runner.getTestContext().itemPosition);
        var belowSections;

        if (scope === 'section' || scope === 'testSection'){
            if (unansweredCount === 0) {
                itemsCountMessage += __('You answered all %s question(s) in this section',
                    stats.questions.toString()
                );
            } else {
                itemsCountMessage = __('You answered only %s of the %s question(s) in this section',
                    stats.answered.toString(),
                    stats.questions.toString()
                );
            }
            if (flaggedCount) {
                itemsCountMessage += ', ';
                itemsCountMessage +=  __('and flagged %s of them', flaggedCount.toString());
            }
        } else if(scope === 'test') {
            //collect statistics from current section and below
            belowSections = getNextSections(map, jump.section);
            stats = _.clone(mapHelper.getSectionStats(runner.getTestMap(), jump.section));

            _.forEach(belowSections, function (section) {
                _.forEach(mapHelper.getSectionStats(runner.getTestMap(), section.id), function (sectionStats, statsKey){
                    stats[statsKey] += sectionStats;
                });
            });

            unansweredCount = stats && (stats.questions - stats.answered);
            flaggedCount = stats && stats.flagged;

            if (currentItemHelper.isAnswered(runner)) {
                unansweredCount--;
            }

            if (unansweredCount === 0) {
                itemsCountMessage = __('You answered all %s question(s) in this test',
                    stats.questions.toString()
                );
            } else {
                itemsCountMessage = __('You have %s unanswered question(s)', unansweredCount.toString());
            }
            if (flaggedCount) {
                itemsCountMessage += ' ' + __('and you flagged %s item(s) that you can review now', flaggedCount.toString());
            }
        } else if(scope === 'part') {
            if (unansweredCount === 0) {
                itemsCountMessage = __('You answered all %s question(s)',
                    stats.questions.toString()
                );
            } else {
                itemsCountMessage = __('You have %s unanswered question(s)', unansweredCount.toString());
            }
            if (flaggedCount) {
                itemsCountMessage += ' ' + __('and you flagged %s item(s) that you can review now', flaggedCount.toString());
            }
        }

        if (itemsCountMessage) {
            itemsCountMessage += '.';
        }
        return itemsCountMessage;
    }

    /**
     * Return sections below current.
     * @param map
     * @param currentSectionId
     * @return {Object}
     */
    function getNextSections(map, currentSectionId) {
        var sections = mapHelper.getSections(map),
            result = {},
            below = false;

        _.forEach(sections, function (section) {
            if (below) {
                result[section.id] = section;
            }
            if (section.id === currentSectionId) {
                below = true;
            }
        });

        return result;
    }

    return {
        getExitMessage: getExitMessage
    };
});
