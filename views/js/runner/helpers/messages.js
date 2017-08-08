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
        var stats = statsHelper.getInstantStats(scope, runner),
            unansweredCount = stats && (stats.questions - stats.answered),
            flaggedCount = stats && stats.flagged,
            itemsCountMessage = '';

        var testData = runner.getTestData(),
            testConfig = testData && testData.config,
            messageEnabled = testConfig ? testConfig.enableUnansweredItemsWarning : true;

        if (messageEnabled) {
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

            if (flaggedCount !== 0) {
                itemsCountMessage += ', ';
                itemsCountMessage +=  __('and flagged %s of them.', flaggedCount.toString());
            } else {
                itemsCountMessage += '.';
            }

        }
        return (itemsCountMessage + " " + message).trim();
    }

    return {
        getExitMessage: getExitMessage
    };
});
