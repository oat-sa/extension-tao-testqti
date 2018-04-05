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
    'taoQtiTest/runner/helpers/stats'
], function (_, __, mapHelper, statsHelper) {
    'use strict';

    /**
     * Completes an exit message
     * @param {String} message - custom message that will be appended to the unanswered stats count
     * @param {String} scope - scope to consider for calculating the stats
     * @param {Object} runner - testRunner instance
     * @param {Boolean} sync - flag for sync the unanswered stats in exit message and the unanswered stats in the toolbox
     * @returns {String} Returns the message text
     */
    function getExitMessage(message, scope, runner, sync) {
        var itemsCountMessage = '';

        var testData = runner.getTestData(),
            testConfig = testData && testData.config,
            messageEnabled = testConfig ? testConfig.enableUnansweredItemsWarning : true;
        
        if (messageEnabled) {
            itemsCountMessage = getUnansweredItemsWarning(scope, runner, sync);
        }

        return (itemsCountMessage + " " + message).trim();
    }

    /**
     * Build message if not all items have answers
     * @param {String} scope - scope to consider for calculating the stats
     * @param {Object} runner - testRunner instance
     * @param {Boolean} sync - flag for sync the unanswered stats in exit message and the unanswered stats in the toolbox. Default false
     * @returns {String} Returns the message text
     */
    function getUnansweredItemsWarning(scope, runner, sync) {
        var stats = statsHelper.getInstantStats(scope, runner, sync);
        var unansweredCount = stats && (stats.questions - stats.answered);
        var flaggedCount = stats && stats.flagged;
        var itemsCountMessage = '';

        if (scope === 'section' || scope === 'testSection'){
            if (unansweredCount === 0) {
                itemsCountMessage = __('You answered all %s question(s) in this section', stats.questions.toString());
            } else {
                itemsCountMessage = __('You answered only %s of the %s question(s) in this section',
                    stats.answered.toString(),
                    stats.questions.toString()
                );
            }
            if (flaggedCount) {
                itemsCountMessage += ', ' + __('and flagged %s of them', flaggedCount.toString());
            }
        } else if(scope === 'test') {
            if (unansweredCount === 0) {
                itemsCountMessage = __('You answered all %s question(s) in this test', stats.questions.toString());
            } else {
                itemsCountMessage = __('You have %s unanswered question(s)', unansweredCount.toString());
            }
            if (flaggedCount) {
                itemsCountMessage += ' ' + __('and you flagged %s item(s) that you can review now', flaggedCount.toString());
            }
        } else if(scope === 'part') {
            if (unansweredCount === 0) {
                itemsCountMessage = __('You answered all %s question(s)', stats.questions.toString());
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

    return {
        getExitMessage: getExitMessage
    };
});
