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
    'jquery',
    'lodash',
    'i18n',
    'taoQtiTest/runner/helpers/map'
], function ($, _, __, mapHelper) {
    'use strict';

    /**
     * Completes an exit message
     * @param {String} message
     * @param {Object} runner
     * @returns {String} Returns the message text
     */
    function getExitMessage(message, scope, runner) {
        var map = runner.getTestMap();
        var context = runner.getTestContext();
        var stats = mapHelper.getScopeStats(map, context.itemPosition, scope);
        var unansweredCount = stats && (stats.total - stats.answered);
        var flaggedCount = stats && stats.flagged;
        var itemsCountMessage = '';

        if (flaggedCount && unansweredCount) {
            itemsCountMessage = __('You have %s unanswered question(s) and have %s item(s) marked for review.',
                unansweredCount.toString(),
                flaggedCount.toString()
            );
        } else {
            if (flaggedCount) {
                itemsCountMessage = __('You have %s item(s) marked for review.', flaggedCount.toString());
            }

            if (unansweredCount) {
                itemsCountMessage = __('You have %s unanswered question(s).', unansweredCount.toString());
            }
        }

        return (itemsCountMessage + ' ' + message).trim();
    }

    return {
        getExitMessage: getExitMessage
    };
});
