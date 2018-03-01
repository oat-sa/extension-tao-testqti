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
 * The timerbox manages timers and display multiple countdowns.
 *
 * @example
 * timerbox({
 *     timers : [{
 *         id : 'timer1',
 *         label : 'Max test time',
 *         type : 'max',
 *         scope: 'test',
 *         remainingTime: 60000
 *      }, {
 *         id : 'timer2',
 *         label : 'Stay at least',
 *         type : 'min',
 *         scope: 'item',
 *         remainingTime: 15000
 *      }]
 *  })
 *  .on('render', function(){
 *     this.start();
 *  })
 *  .render(document.querySelector('nav'));
 *
 *
 * @author Bertrand Chevrier <bertrand@taotesting.com>
 */
define([
    'jquery',
    'lodash',
    'i18n',
    'core/promise',
    'ui/component',
    'ui/hider',
    'taoQtiTest/runner/plugins/controls/timer/component/countdown',
    'tpl!taoQtiTest/runner/plugins/controls/timer/component/tpl/timerbox',
    'css!taoQtiTest/runner/plugins/controls/timer/component/css/timerbox.css'
], function ($, _, __, Promise, component, hider, countdownFactory, timerboxTpl) {
    'use strict';

    /**
     * Default config values, see below.
     */
    var defaults = {
        zenMode : {
            enabled : true,
            startHidden : false
        }
    };

    /**
     * Creates and initialize the timerbox component.
     * Please not the component IS NOT rendered.
     * You'll have to render it by yourself.
     *
     * @param {Object} config
     * @param {Boolean} [config.zenMode = true] - zen mode adds a button to hide the countdowns to stay zen
     * @param {Object[]} [config.timers] - the timers to start with
     * @param {Boolean} [config.displayWarning = true] - let the countdown display their warning (contextual)
     * @returns {timerbox} the component, initialized and rendered
     */
    return function timerboxFactory(config){
        var $zenModeToggler;
        var $countdownContainer;

        /**
         * @typedef {Object} timerbox
         */
        var timerbox = component({

            /***
             * Update the displayed timers.
             * Compare the current and the given, it will add,remove and update timers.
             *
             * @param {Object[]} timers - the new timers
             * @returns {Promise<Array>} resolves when all timers are up to date (with the result of all the update operations)
             *
             * @fires timerbox#update the update is done
             */
            update : function update(timers){
                var self = this;

                var updating = [];

                //remove timers
                var timerIdsToRemove =_.difference(_.keys(this.timers), _.keys(timers));
                if(timerIdsToRemove.length){
                    _.forEach(timerIdsToRemove, function(timerId) {
                        updating.push(self.removeTimer(timerId));
                    });
                }

                //add/update
                _.forEach(timers, function(timer, id){
                    if(typeof self.timers[id] === 'undefined'){
                        updating.push(self.addTimer(id, timer));
                    } else {
                        updating.push(self.updateTimer(id, timer));
                    }
                });

                return Promise.all(updating)
                    .then(function(results){

                        //show the toggler only if there's timers
                        if(_.size(self.timers) > 0){
                            hider.show($zenModeToggler);
                        } else {
                            hider.hide($zenModeToggler);
                        }

                        /**
                         * The timer box update is done
                         * @event timerbox#update
                         * @param {Object[]} timers - ALL update results (includes removals)
                         */
                        self.trigger('update', results);

                        return results;
                    });
            },

            /**
             * Get the current timers
             * @return {Object[]} the timers
             */
            getTimers : function getTimers(){
                return this.timers;
            },

            /**
             * Adds a new timer to the box
             * @param {String} id - the timer unique identifier
             * @param {Object} timer - the new timer
             * @return {Promise<Object|Boolean>} resolves with the timer once added or false
             *
             * @fires timerbox#timerchange something changes in a timer
             * @fires timerbox#timeradd a new timer is in the box
             * @fires timerbox#timerstart a timer get started
             * @fires timerbox#timerstop a timer get stopped
             * @fires timerbox#timerend a timer get completed
             * @fires timerbox#change spread from the countdown
             */
            addTimer: function addTimer(id, timer){
                var self = this;

                if (this.is('rendered') && typeof this.timers[id] === 'undefined') {
                    return new Promise(function(resolve){
                        var countdown = countdownFactory($countdownContainer, _.defaults(timer, {
                            displayWarning : self.config.displayWarning
                        }))
                        .on('render', function(){

                            //keep track of the new timer
                            //and the countdown component
                            self.timers[id] = _.clone(timer);
                            self.timers[id].countdown = this;

                            /**
                             * The timers have changed (add, update, remove)
                             * @event timerbox#timerchange
                             * @param {String} action - add, update, remove
                             * @param {Object} timer
                             */
                            self.trigger('timerchange', 'add', self.timers[id]);

                            /**
                             * A new timer is added
                             * @event timerbox#timeradd
                             * @param {Object} timer
                             */
                            self.trigger('timeradd', self.timers[id]);

                            resolve(self.timers[id]);
                        })
                        .on('start', function(){

                            /**
                              * A timer starts
                              * @event timerbox#timerstart
                              * @param {Object} timer
                              */
                            self.trigger('timerstart', self.timers[id]);
                        })
                        .on('stop', function(){

                            /**
                                * A timer stops
                                * @event timerbox#timerstop
                                * @param {Object} timer
                                */
                            self.trigger('timerstop', self.timers[id]);

                        })
                        .on('end', function(){

                            /**
                                * A timer ends
                                * @event timerbox#timerend
                                * @param {Object} timer
                                */
                            self.trigger('timerend', self.timers[id]);

                        })
                        .on('change', function(value){
                            if(self.timers[id]){
                                //keep the current timer data in sync
                                self.timers[id].remainingTime = value;
                            }
                        });
                        countdown.spread(self, ['error', 'change', 'warn']);
                    });
                }
                return Promise.resolve(false);
            },

            /**
             * Updates an existing timer
             * @param {String} id - the timer unique identifier
             * @param {Object} timer - the new timer
             * @return {Promise<Object|Boolean>} resolves with the timer once updated or false
             *
             * @fires timerbox#timerchange something changes in a timer
             * @fires timerbox#timerupdate an existing timer is updated
             */
            updateTimer: function updateTimer(id, timer){

                if (this.is('rendered') && typeof this.timers[id] !== 'undefined') {

                    this.timers[id].remainingTime = timer.remainingTime;
                    this.timers[id].extraTime     = timer.extraTime;

                    if(_.isNumber(timer.remainingWithoutExtraTime)){
                        this.timers[id].remainingWithoutExtraTime = timer.remainingWithoutExtraTime;
                    }

                    if (this.timers[id].countdown){
                        this.timers[id].countdown.update(timer.remainingTime);
                    }

                    this.trigger('timerchange', 'update', this.timers[id]);

                    /**
                     * A timer has been updated with external values
                     * @event timerbox#timerupdate
                     * @param {Object} timer
                     */
                    this.trigger('timerupdate', this.timers[id]);

                    return Promise.resolve(this.timers[id]);
                }
                return Promise.resolve(false);
            },

            /**
             * Remove a timer
             * @param {String} id - the timer unique identifier
             * @return {Promise<Object|Boolean>} resolves with the timer once removed or false
             *
             * @fires timerbox#timerchange something changes in a timer
             * @fires timerbox#timerremove a timer is removed
             */
            removeTimer: function removeTimer(id){

                var self = this;

                if (this.is('rendered') && typeof this.timers[id] !== 'undefined') {
                    return new Promise(function(resolve){

                        /**
                         * Artifact function, remove the timer from the component index
                         */
                        var deindex = function deindex(){
                            //keep a clone, without the component, for the event
                            var removed = _.omit(self.timers[id], 'countdown');

                            //remove the timer from the list
                            self.timers = _.omit(self.timers, id);

                            self.trigger('timerchange', 'remove', removed);

                            /**
                             * A timer has been updated with external values
                             * @event timerbox#timerupdate
                             * @param {Object} timer
                             */
                            self.trigger('timerremove', removed);

                            resolve(removed);
                        };
                        if(self.timers[id].countdown){
                            self.timers[id].countdown
                                .on('destroy', deindex)
                                .destroy();
                        } else {
                            deindex();
                        }
                    });
                }
                return Promise.resolve();
            },

            /**
             * Starts all the timers contained in the box
             * @returns {timerbox} chains
             */
            start : function start(){
                _.forEach(this.timers, function(timer){
                    if(timer.countdown){
                        timer.countdown.start();
                    }
                });
                return this;
            },

            /**
             * Stops all the timers contained in the box
             * @returns {timerbox} chains
             */
            stop : function stop(){
                _.forEach(this.timers, function(timer){
                    if(timer.countdown){
                        timer.countdown.stop();
                    }
                });
                return this;
            },

            /**
             * Show/hide the timers aka "zen mode"
             * @returns {timerbox} chains
             * @fires timerbox#zenchange
             */
            toggleZenMode : function toggleZenMode() {
                if(this.is('rendered') && this.config.zenMode.enabled ){
                    if(this.is('zen')){
                        this.setState('zen', false);
                        $zenModeToggler.attr('title', __('Hide timers'));
                    } else {
                        this.setState('zen', true);
                        $zenModeToggler.attr('title', __('Show timers'));
                    }

                    /**
                     * @event timerbox#zenchange
                     * @param {Boolean} isZen
                     */
                    this.trigger('zenchange', this.is('zen'));
                }
                return this;
            }

        }, defaults)
        .on('init', function(){

            //index the current timers
            this.timers = {};
        })
        .on('render', function(){
            var self = this;
            var $element = this.getElement();

            //where we append the countdowns components
            $countdownContainer = $('.timer-wrapper', $element);

            //set up the zen mode toggler
            if(this.config.zenMode.enabled){
                $zenModeToggler = $('.timer-toggler', $element);
                self.setState('zen', !!self.config.zenMode.startHidden);
                $zenModeToggler.on('click', function(e){
                    e.preventDefault();
                    self.toggleZenMode();
                });
            }

            //if timers are provided with the config, we perform the 1st update
            if(this.config.timers){
                this.update(this.config.timers);
            }
        });

        timerbox.setTemplate(timerboxTpl);

        _.defer(function(){
            timerbox.init(config);
        });

        return timerbox;
    };
});
