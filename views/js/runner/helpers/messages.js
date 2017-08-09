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
    'i18n',
    'taoQtiTest/runner/helpers/map',
    'taoQtiTest/runner/helpers/stats'
], function (__, mapHelper, statsHelper) {
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
     * The verbiage states how many questions were unanswered in the current test section AND beyond
     * and how many were flagged in the current test section AND beyond:
     * “You have X unanswered questions and you flagged Y items that you can review now.
     * If you quit the test now, you cannot return to it.” So for example if a test battery has four sections
     * and the user has completed all items in the first section, are currently in the second section and click
     * Exit Test, the 'X' amount should be the total amount of the remaining in section two and items in 3 thru 4.
     * The 'Y' amount would only be for that second test section (as they hadn't gotten to further test sections to flag).
     */
    function getUnansweredItemsWarning(scope, runner) {
        var stats = statsHelper.getInstantStats(scope, runner),
            unansweredCount = stats && (stats.questions - stats.answered),
            flaggedCount = stats && stats.flagged,
            itemsCountMessage = '',
            map = runner.getTestMap(),
            jump = mapHelper.getJump(map, runner.getTestContext().itemPosition),
            belowSections;

        if (scope === 'section') {
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
            belowSections = getBelowSections(map, jump.section);
            stats = _.clone(mapHelper.getSectionStats(runner.getTestMap(), jump.section));

            _.forEach(belowSections, function (section) {
                _.forEach(mapHelper.getSectionStats(runner.getTestMap(), section.id), function (sectionStats, statsKey){
                    stats[statsKey] += sectionStats;
                });
            });

            unansweredCount = stats && (stats.questions - stats.answered);
            flaggedCount = stats && stats.flagged,

            itemsCountMessage = __('You have %s unanswered question(s)', unansweredCount.toString());

            if (flaggedCount) {
                itemsCountMessage += ' ' + __('and you flagged %s item(s)', flaggedCount.toString());
            }

            if (itemsCountMessage) {
                itemsCountMessage += ' ' + __('that you can review now');
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
    function getBelowSections(map, currentSectionId) {
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
