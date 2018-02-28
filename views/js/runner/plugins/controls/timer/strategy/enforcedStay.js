
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
 * Timer strategy that enforce the test taker to stay in
 * front of the item until the timer completes,
 * by disabling the navigation elements.
 *
 * Applies on item scope, min timers if the testPart is linear
 *
 * @author Bertrand Chevrier <bertrand@taotesting.com>
 */
define([], function(){
    'use strict';

    /**
     * Creates the strategy if it applies to the given timer
     * @param {runner} testRunner
     * @param {Object} timer
     * @returns {strategy|Boolean} the strategy if applies or false
     */
    return function enforcedStayStrategy(testRunner, timer){
        var testContext = testRunner.getTestContext();

        if( timer && timer.type === 'min' && timer.scope === 'item' &&
            testContext.isLinear){
            return {
                name : 'enforcedStay',

                /**
                 * setUp entry point : disable the navigation
                 */
                setUp : function setUp(){
                    testRunner.on('enablenav.enforcestay', function(){
                        testRunner.trigger('disablenav');
                    });
                    testRunner.trigger('disablenav');
                },

                /**
                 * complete entry point : enables back the navigation
                 */
                complete : function complete(){
                    this.tearDown();
                    testRunner.trigger('enablenav');
                },

                /**
                 * tearDown entry point : remove the listeners
                 */
                tearDown : function tearDown(){
                    testRunner.off('enablenav.enforcestay');
                }
            };
        }
        return false;
    };
});
