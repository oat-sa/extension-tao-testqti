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
 * Get timers from timeConstraints and test configuration.
 *
 * @author Bertrand Chevrier <bertrand@taotesting.com>
 */
define([
    'lodash',
    'i18n',
    'moment',
    'core/format',
    'core/logger'
], function(_, __, moment, format, loggerFactory){
    'use strict';

    var logger = loggerFactory('taoQtiTest/runner/plugins/controls/timer/timers');

    /**
     * We receive values in seconds, so we convert them to milliseconds
     */
    var precision = 1000;

    /**
     * The timer's scope
     */
    var scopes = ['item', 'section', 'testPart', 'test'];

    /**
     * Map qti class names to scopes
     */
    var scopeMapping = {
        assessmentTest    : 'test',
        assessmentSection : 'section',
        assessmentItemRef : 'item'
    };

    /**
     * helps you get the scope from a scope or qti class name
     * @param {String} value - scope or qti class name
     * @returns {String?} the scope
     */
    var getScope = function getScope(value){
        if(scopeMapping[value]){
            return scopeMapping[value];
        }
        if(_.contains(scopes, value)){
            return value;
        }
        return null;
    };

    /**
     * The text of warning messages
     * TODO add warning messages for other timers types
     */
    var warningMessages = {
        item    : __("Warning – You have %s remaining to complete this item."),
        section : __("Warning – You have %s remaining to complete this section."),
        testPart: __("Warning – You have %s remaining to complete this test part."),
        test    : __("Warning – You have %s remaining to complete this test.")
    };


    /**
     * Get the timers objects from the time constraints andt the given config
     * @param {Object[]} timeConstraints - as defined in the testContext
     * @param {Boolean} isLinear - is the current navigation mode linear
     * @param {Object} [config] - timers config
     * @param {Object[]} [config.warnings] - the warnings to apply to the timers (max only for now)
     * @param {Object[]} [config.warnings] - the warnings to apply to the timers (max only for now)
     * @returns {timer[]} the timers
     */
    return function getTimers(timeConstraints, isLinear, config){
        var timers = {};

        /**
         * The warnings comes in a weird format (ie. {scope:{threshold:level}}) , so we reformat them
         */
        var constraintsWarnings = _.reduce(config.warnings, function(acc, warnings, qtiScope){
            var scope = getScope(qtiScope);
            acc[scope] = _.map(warnings, function(value, key){
                return {
                    threshold : (parseInt(key, 10) * precision),
                    message : function applyMessage(remainingTime){
                        var displayRemaining = moment.duration(remainingTime / precision, "seconds").humanize();
                        return format(warningMessages[scope], displayRemaining);
                    },
                    level : value,
                    shown : false
                };
            });
            return acc;
        }, {});

        /**
         * Build a timer of a given type from a time constraints
         * @param {String} type - min, max, locked
         * @param {Object} constraintData
         * @returns {timer} timer
         */
        var buildTimer = function buildTimer(type, constraintData){

            /**
             * @typedef {Object} timer
             * @property {String} id - identify the timer (for max, it's the source for backward compat)
             * @property {String} type - min, max or locked
             * @property {String} label - the title to display
             * @property {String} scope - the timer's scope (item, section, etc.)
             * @property {String} qtiClassName - the QTI class of the timers applies to
             * @property {String} source - the ID of the element the timers belongs to
             * @property {Number} extraTime - additional time data, object
             * @property {Number} originalTime - the starting value of the timer, never changes, in ms.
             * @property {Number} remainingTime - current value, in ms.
             * @property {Number} remainingWithoutExtraTime - remaining time without extra time, in ms.
             * @property {Number} total - total time (original time + extra time), in ms.
             */
            var timer  = _.pick(constraintData, ['label', 'scope', 'source', 'extraTime', 'qtiClassName']);

            timer.type = type;
            timer.allowLateSubmission = constraintData.allowLateSubmission;

            if(type === 'min'){
                timer.id  = type + '-' + constraintData.scope + '-' + constraintData.source;
                timer.originalTime  = constraintData.minTime * precision;
                timer.remainingTime = constraintData.minTimeRemaining * precision;
            } else {
                timer.id  = constraintData.source;
                timer.originalTime  = constraintData.maxTime * precision;
                timer.remainingTime = constraintData.maxTimeRemaining * precision;
            }

            timer.remainingWithoutExtraTime = timer.remainingTime;
            if (timer.extraTime) {
                timer.extraTime.consumed = timer.extraTime.consumed * precision;
                timer.extraTime.remaining = timer.extraTime.remaining * precision;
                timer.extraTime.total = timer.extraTime.total * precision;
                timer.total = timer.originalTime + (timer.extraTime.total);
                timer.remainingTime += timer.extraTime.remaining;
            }

            //TODO supports warnings for other types
            if (type === 'max' && _.isArray(constraintsWarnings[timer.scope])) {
                timer.warnings = constraintsWarnings[timer.scope];
            }
            return timer;
        };


        _.forEach(timeConstraints, function(timeConstraint){
            var constraintData = _.clone(timeConstraint);
            var newTimer;

            constraintData.scope = getScope(timeConstraint.scope || timeConstraint.qtiClassName);

            if(!constraintData.scope){

                logger.warning('Wrong data, a time constraint should apply to a valid scope, skipping');

            } else if(constraintData.minTime === false && constraintData.maxTime === false){

                logger.warning('Time constraint defined with no time, skipping');

            // minTime = maxTime -> one locked timer
            } else if ( config.guidedNavigation && isLinear &&
                    constraintData.maxTime && constraintData.minTime &&
                    constraintData.minTime === constraintData.maxTime &&
                    constraintData.maxTime > 0){

                newTimer =  buildTimer('locked', constraintData);
                timers[newTimer.id] = newTimer;

            } else {

                //minTime -> min timer
                if(isLinear && constraintData.minTime  && constraintData.minTime > 0){

                    newTimer = buildTimer('min', constraintData);
                    timers[newTimer.id] = newTimer;
                }

                //maxTime -> max timer
                if(constraintData.maxTime  && constraintData.maxTime > 0){

                    newTimer = buildTimer('max', constraintData);
                    timers[newTimer.id] = newTimer;
                }
            }
        });

        logger.debug('Timers built from timeConstraints', timers);

        return timers;
    };

});
