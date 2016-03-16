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
 * Test Runner Control Plugin : Timer
 *
 * @author Jean-Sébastien Conan <jean-sebastien.conan@vesperiagroup.com>
 */
define([
    'jquery',
    'lodash',
    'i18n',
    'core/polling',
    'core/timer',
    'ui/hider',
    'taoTests/runner/plugin',
    'taoQtiTest/runner/plugins/controls/timer/timerComponent',
    'taoQtiTest/runner/helpers/messages',
    'tpl!taoQtiTest/runner/plugins/controls/timer/timers'
], function ($, _, __, pollingFactory, timerFactory, hider, pluginFactory, timerComponentFactory, messages, timerBoxTpl) {
    'use strict';

    /**
     * Time interval between timer refreshes, in milliseconds
     * @type {Number}
     */
    var timerRefresh = 1000;

    /**views/js/runner/plugins/controls/timer/timer.js
     * Duration of a second in the timer's base unit
     * @type {Number}
     */
    var precision = 1000;

    /**
     * The message to display when exiting
     */
    var exitMessage = __('After you complete the section it would be impossible to return to this section to make changes. Are you sure you want to end the section?');


    var timerTypes = {
        test:     'assessmentTest',
        testPart: 'testPart',
        section:  'assessmentSection',
        item:     'assessmentItemRef'
    };

    /**
     * Are we in a timed section
     * @param {Object} context - the current test context
     * @returns {Boolean}
     */
    var isTimedSection = function isTimedSection(context){
        var timeConstraints = context.timeConstraints || [];
        return _.some(timeConstraints, function(constraint){
            return constraint.qtiClassName === 'assessmentSection';
        });
    };


    /**
     * Creates the timer plugin
     */
    return pluginFactory({
        name: 'timer',

        /**
         * Initializes the plugin (called during runner's init)
         */
        init: function init() {

            var self = this;
            var testRunner   = this.getTestRunner();
            var testData     = testRunner.getTestData() || {};
            var itemStates   = testData.itemStates || {};
            var timerWarning = testData.config && testData.config.timerWarning || {};
            var lastDiff;

            var currentTimers = {};

            /**
             * Load the configuration of a timer from the current context
             * @param {String} type - the timer type/qtiClass
             * @returns {Object?} the timer config if there's one for the given type
             */
            var getTimerConfig = function getTimerConfig(type) {
                var timeConstraint;
                var timer;
                var context = testRunner.getTestContext();

                // get the config of each timer
                if (!context.isTimeout && context.itemSessionState === itemStates.interacting) {
                    timeConstraint = _.findLast(context.timeConstraints, { qtiClassName : type });
                    if(timeConstraint){
                        timer = {
                            label:     timeConstraint.label,
                            type:      timeConstraint.qtiClassName,
                            remaining: timeConstraint.seconds * precision,
                            id:        timeConstraint.source,
                            running:   true
                        };

                        if (timerWarning[timer.type]) {
                            timer.warning = parseInt(timerWarning[timer.type], 10) * precision;
                        }
                    }
                }
                return timer;
            };


            //TODO this kind of function is generic enough to be moved to a util/helper
            var leaveTimedSection = function leaveTimedSection(type, scope, position){
                var context = testRunner.getTestContext();
                var map     = testRunner.getTestMap();

                var section = map.parts[context.testPartId].sections[context.sectionId];
                var nbItems = _.size(section.items);
                var item    = _.find(section.items, { position : context.itemPosition });

                if (!context.isTimeout && context.itemSessionState !== itemStates.closed && isTimedSection(context) && item ){

                    return !!( (type === 'next' && (scope === 'assessmentSection' || ((item.positionInSection + 1) === nbItems) )) ||
                               (type === 'previous' && item.positionInSection === 0) ||
                               (type === 'jump' && position > 0 &&  (position < section.position || position >= section.position + nbItems)) );

                }
                return false;
            };

            /**
             * Remove a timer from the current ones
             * @param {String} type - the timer type to remove
             */
            var removeTimer = function removeTimer(type){
                if(currentTimers[type]){
                    currentTimers[type].destroy();
                    currentTimers = _.omit(currentTimers, type);
                }
            };

            /**
             * Add and initialize a timer of the given type
             * @param {Object} config - the timer config
             * @param {String} type - the timer type to remove
             */
            var addTimer = function addTimer(type, config){
                if(config){
                    currentTimers[type] = timerComponentFactory(config);
                    currentTimers[type]
                        .init()
                        .render(self.$element);
                }
            };

            /**
             * Update the timers.
             * It will remove, let, add or update the current timers based on the current context.
             */
            var updateTimers = function updateTimers(){

                _.forEach(timerTypes, function(type){
                    var timerConfig = getTimerConfig(type);

                    if(currentTimers[type]){
                        if(!timerConfig){
                            removeTimer(type);
                        } else if(currentTimers[type].id() !== timerConfig.id){
                            removeTimer(type);
                            addTimer(type, timerConfig);
                        }
                    } else {
                        addTimer(type, timerConfig);
                    }
                });
            };

            //the element that'll contain the timers
            this.$element = $(timerBoxTpl());

            //one stopwatch to count the time
            this.stopwatch = timerFactory({
                autoStart : false
            });

            //a pausewatch that counts only during pauses (between items)
            this.pausewatch = timerFactory({
                autoStart : false
            });

            //update the timers at regular intervals
            this.polling = pollingFactory({

                /**
                 * The polling action consists in updating each timers,
                 * checking timeout and warnings
                 */
                action : function updateTime() {

                    //how many time elapsed from the last tick ?
                    var elapsed = self.stopwatch.tick();
                    var timeout = false;

                    _.forEach(currentTimers, function(timer) {
                        var currentVal,
                            warnMessage;
                        if (timer.running()) {
                            currentVal = Math.max(timer.val() - elapsed, 0);
                            timer
                                .val(currentVal)
                                .refresh();

                            if (currentVal === 0) {
                                timer.running(false);
                                timeout = true;
                            }

                            if (!timeout) {
                                warnMessage = timer.warn();
                                if(warnMessage){
                                    testRunner.trigger('warning', warnMessage);
                                }
                            }
                        }
                    });
                    if (timeout) {
                        testRunner.timeout();
                        self.disable();
                    }
                },
                interval : timerRefresh,
                autoStart : false
            });

            //create the initial timers
            updateTimers();

            //change plugin state
            testRunner
                .before('move', function(e, type, scope, position){
                    var done = e.done();

                    var doMove = function doMove(){
                        removeTimer(timerTypes.item);
                        done();
                    };

                    var cancelMove = function cancelMove() {
                        testRunner.trigger('enableitem enablenav');
                        e.prevent();
                    };

                    if (self.getState('enabled')) {
                        //start to count the time before the next content is shown
                        self.pausewatch.start();

                        //and pause the running ones
                        self.disable();
                    }

                    //display a mesage if we exit a timed section
                    if(leaveTimedSection(type, scope, position)){
                        testRunner.trigger('confirm', messages.getExitMessage(exitMessage, 'section', testRunner), doMove, cancelMove);
                    } else {
                        doMove();
                    }
                })
                .on('loaditem', function(){

                    //check for new timers
                    updateTimers();
                })

                .after('renderitem', function(){
                    //get the diff of the timers pause
                    lastDiff = self.pausewatch.tick();
                    self.pausewatch.stop();

                    //start timers
                    self.enable();

                    //add the last diff to the next action call
                    if(lastDiff && _.size(currentTimers) > 0){
                        _.defer(function(){
                            testRunner.getProxy().callTestAction('time', { timerPaused : lastDiff / precision });
                        });
                    }
                });
        },

        /**
         * Called during the runner's render phase
         */
        render: function render() {
            var $container = this.getAreaBroker().getControlArea();
            $container.append(this.$element);
        },

        /**
         * Called during the runner's destroy phase
         */
        destroy : function destroy (){
            this.polling.stop();
            this.stopwatch.stop();
            this.$element.remove();
        },

        /**
         * Enables the button
         */
        enable : function enable (){
            this.polling.start();
            this.stopwatch.resume();
        },

        /**
         * Disables the button
         */
        disable : function disable (){
            this.polling.stop();
            this.stopwatch.pause();
        },

        /**
         * Shows the button
         */
        show: function show(){
            hider.show(this.$element);
        },

        /**
         * Hides the button
         */
        hide: function hide(){
            hider.hide(this.$element);
        }
    });
});
