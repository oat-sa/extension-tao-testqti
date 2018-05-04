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
 * This helper provides more statistics about the test
 *
 * @author Jean-Sébastien Conan <jean-sebastien.conan@vesperiagroup.com>
 */
define([
    'lodash',
    'taoQtiTest/runner/helpers/map',
    'taoQtiTest/runner/helpers/currentItem'
], function (_, mapHelper, currentItemHelper) {
    'use strict';

    /**
     * Return scope stats that takes into account any test taker interaction made since the item has been loaded
     * @param {String} scope - scope to consider for calculating the stats
     * @param {Object} runner - testRunner instance
     * @param {Boolean} sync - flag for sync the unanswered stats in exit message and the unanswered stats in the toolbox. Default false
     * @returns {Object}
     */
    function getInstantStats(scope, runner, sync) {
        var map = runner.getTestMap(),
            context = runner.getTestContext(),
            stats = _.clone(mapHelper.getScopeStats(map, context.itemPosition, scope)),
            item = mapHelper.getItemAt(map, context.itemPosition),
            isItemCurrentlyAnswered;

        if (!item.informational) {
            isItemCurrentlyAnswered = currentItemHelper.isAnswered(runner);
            if (!isItemCurrentlyAnswered && context.itemAnswered) {
                stats.answered--;
            } else if ((isItemCurrentlyAnswered || sync) && !context.itemAnswered) {
                stats.answered++;
            } else if (sync && !isItemCurrentlyAnswered && context.itemAnswered && context.isLinear) {
                stats.answered++;
            }
        }

        return stats;
    }

    return {
        getInstantStats: getInstantStats
    };
});
