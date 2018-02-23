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
 * This module loads all timers' strategies,
 * activate them by timer when relevant,
 * then apply the behavior based on the lifecycle.
 *
 * @author Bertrand Chevrier <bertrand@taotesting.com>
 */
define([
    'lodash',
    'core/promise',
    'taoQtiTest/runner/plugins/controls/timer/strategy/enforcedStay',
    'taoQtiTest/runner/plugins/controls/timer/strategy/extraTime',
    'taoQtiTest/runner/plugins/controls/timer/strategy/guidedNavigation',
    'taoQtiTest/runner/plugins/controls/timer/strategy/timeout',
    'taoQtiTest/runner/plugins/controls/timer/strategy/warnSectionLeaving',
], function(_, Promise, extraTimeStrategy, enforcedStayStrategy, guidedNavigationStrategy, timeoutStrategy, warnSectionLeavingStrategy){
    'use strict';


    /**
     * The list of available strategies
     * TODO this list could come from the configuration
     */
    var defaultAvailableStrategies = [
        extraTimeStrategy,
        enforcedStayStrategy,
        guidedNavigationStrategy,
        timeoutStrategy,
        warnSectionLeavingStrategy
    ];

    /**
     * Get a strategyHandler object for a testRunner instance
     * @param {runner} testRunner - the test runner instance
     * @param {strategy[]} strategies - the list of available strategies, to override the defaults
     * @returns {strategyHandler} the handler
     */
    return function getStrategyHandler(testRunner, strategies){
        var strategyHandler;

        /**
         * To keep track of the active strategies, per timer
         */
        var actives = {};

        /**
         * Artifact function to apply an action to a list of strategy
         * @param {String} timerId - the id of the timer to run the actions against
         * @param {String} action -
         */
        var applyToStrategies = function applyToStrategies(timerId, action){
            var api = _.keys(strategyHandler);
            if(_.isEmpty(timerId) || _.isEmpty(action) || !_.contains(api, action)){
                throw new TypeError('Invalid timer id or unauthorized action');
            }

            if(!_.isArray(actives[timerId])){
                return Promise.resolve();
            }
            return  Promise.all( _.map( actives[timerId], function(strategy){
                if (_.isFunction(strategy[action])) {
                    return strategy[action]();
                }
            }));
        };

        var availableStrategies = strategies || defaultAvailableStrategies;

        //quick validation of the test runner
        if(!testRunner || !_.isFunction(testRunner.on) || !_.isFunction(testRunner.getTestContext)){
            throw new TypeError('The strategy handler needs a valid test runner.');
        }

        /**
         * @typedef {Object} strategyHandler
         */
        strategyHandler = {

            /**
             * Try to set up strategies for the given timer
             * @param {Object} timer
             * @returns {Promise} resolves once the set up is done
             */
            setUp : function setUp (timer) {
                _.forEach(availableStrategies, function(availableStrategy){
                    var strategy = availableStrategy(testRunner, timer);
                    if(strategy !== false){
                        actives[timer.id] = actives[timer.id] || [];

                        actives[timer.id].push(strategy);
                    }
                });
                return applyToStrategies(timer.id, 'setUp');
            },

            /**
             * Get the actives strategies for the given timer
             * @returns {strategy[]} the actives strategies
             */
            getActives : function getActives(timer){
                if(timer && timer.id && _.isArray(actives[timer.id])){
                    return actives[timer.id];
                }
                return [];
            },

            /**
             * Call the timer's strategies "start"
             * @param {Object} timer
             * @returns {Promise}
             */
            start: function start(timer){
                return applyToStrategies(timer.id, 'start');
            },

            /**
             * Call the timer's strategies "stop"
             * @param {Object} timer
             * @returns {Promise}
             */
            stop : function stop(timer){
                return applyToStrategies(timer.id, 'stop');
            },

            /**
             * Call the timer's strategies "complete"
             * @param {Object} timer
             * @returns {Promise}
             */
            complete : function complete(timer){
                return applyToStrategies(timer.id, 'complete');
            },

            /**
             * Call the timer's strategies "tearDown"
             * will also un-reference the strategies
             * @param {Object} timer
             * @returns {Promise}
             */
            tearDown : function tearDown(timer){
                return applyToStrategies(timer.id, 'tearDown').then(function(){
                    actives = _.omit(actives, timer.id);
                });
            }
        };

        return strategyHandler;
    };
});
