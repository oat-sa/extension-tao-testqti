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
 * Timeout strategy, the given scope is timedout when the timer completes.
 *
 * Applies on all max timers
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
    return function timeoutStrategy(testRunner, timer){

        if(timer && timer.type === 'max'){
            return {
                name : 'timeout',

                /**
                 * complete entry point : timeout
                 */
                complete : function complete(){
                    if(timer.qtiClassName && timer.source){
                        return testRunner.timeout(timer.qtiClassName, timer.source, timer);
                    }
                }
            };
        }
        return false;
    };
});
