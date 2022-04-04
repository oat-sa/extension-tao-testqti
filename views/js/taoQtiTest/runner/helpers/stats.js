define(['lodash', 'taoQtiTest/runner/helpers/map', 'taoQtiTest/runner/helpers/currentItem'], function (_, mapHelper, currentItemHelper) { 'use strict';

    _ = _ && Object.prototype.hasOwnProperty.call(_, 'default') ? _['default'] : _;
    mapHelper = mapHelper && Object.prototype.hasOwnProperty.call(mapHelper, 'default') ? mapHelper['default'] : mapHelper;
    currentItemHelper = currentItemHelper && Object.prototype.hasOwnProperty.call(currentItemHelper, 'default') ? currentItemHelper['default'] : currentItemHelper;

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
     * Copyright (c) 2016-2019 (original work) Open Assessment Technologies SA ;
     */
    var stats = {
      /**
       * Return scope stats that takes into account any test taker interaction made since the item has been loaded
       * @param {String} scope - scope to consider for calculating the stats
       * @param {Object} runner - testRunner instance
       * @param {Boolean} sync - flag for sync the unanswered stats in exit message and the unanswered stats in the toolbox. Default false
       * @returns {Object} the stats
       */
      getInstantStats: function getInstantStats(scope, runner, sync) {
        var map = runner.getTestMap();
        var context = runner.getTestContext();
        var item = runner.getCurrentItem();
        var testPart = runner.getCurrentPart();

        var stats = _.clone(mapHelper.getScopeStats(map, context.itemPosition, scope));

        if (!item.informational) {
          var isItemCurrentlyAnswered = currentItemHelper.isAnswered(runner);

          if (!isItemCurrentlyAnswered && item.answered) {
            stats.answered--;
          } else if ((isItemCurrentlyAnswered || sync) && !item.answered) {
            stats.answered++;
          } else if (sync && !isItemCurrentlyAnswered && item.answered && testPart.isLinear) {
            stats.answered++;
          }
        }

        return stats;
      }
    };

    return stats;

});
