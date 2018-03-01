
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
 * Track consumed extra time and add it to the next move request
 *
 * Applies when the timer contains an extraTime
 *
 * @author Bertrand Chevrier <bertrand@taotesting.com>
 */
define([
    'lodash'
], function(_){
    'use strict';

    var precision = 1000;
    var lastConsumedExtraTime = 0;

    /**
     * Creates the strategy if it applies to the given timer
     * @param {runner} testRunner
     * @param {Object} timer
     * @returns {strategy|Boolean} the strategy if applies or false
     */
    return function extraTimeStrategy(testRunner, timer){

        /**
         * Apply the extra time to the timer 'once' and
         * listen for test movment to add the consumed extrat time as parameter
         * Since the extra time is global, if multiple timers use the extra time part,
         * we take the biggest consumed extra time.
         */
        var applyExtraTime = function applyExtraTime(){
            if(_.isNumber(timer.extraTime) && timer.extraTime > 0 && !timer.extraTimeSetup){
                timer.extraTimeSetup = true;

                testRunner.before('move.extra skip.extra exit.extra timeout.extra', function() {
                    var consumedExtraTime = 0;
                    var testContext = testRunner.getTestContext();
                    if(timer.remainingTime < timer.extraTime){
                        consumedExtraTime = Math.max(timer.extraTime - timer.remainingTime, 0) / precision;
                        lastConsumedExtraTime = Math.max(
                                consumedExtraTime,
                                lastConsumedExtraTime,
                                testContext.extraTime.consumed
                            );

                        testRunner.getProxy().addCallActionParams({
                            consumedExtraTime: lastConsumedExtraTime
                        });
                    }
                })
                .after('move.extra skip.extra exit.extra timeout.extra', function(){
                    lastConsumedExtraTime = 0;
                });

            }
        };

        if( timer && timer.type === 'max'){
            return {
                name : 'extraTime',

                /**
                 * setUp entry point : adds the extratime to the timer
                 */
                setUp : function setUp(){
                    applyExtraTime();
                },

                /**
                 * setUp entry point : adds the extratime to the timer
                 */
                start : function start(){
                    //apply at start also in case the extra time is added in between
                    applyExtraTime();
                },

                /**
                 * tearDown entry point : remove the listeners
                 */
                tearDown : function tearDown(){
                    testRunner.off('move.extra skip.extra exit.extra timeout.extra');
                }
            };
        }
        return false;
    };
});
