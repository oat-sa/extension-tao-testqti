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
 * Component that controls the display of a countdown.
 *
 * You can either control the countdown externally  or internally
 *
 * @example
 * countdown(document.querySelector('.stopwatch'), {
 *      id : 'timer1',
 *      label : 'Stop watch',
 *      remaingTime : 60000
 * })
 * .on('complete', () => console.log('done'))
 * .start();
 *
 *
 * @author Bertrand Chevrier <bertrand@taotesting.com>
 */
define([
    'jquery',
    'lodash',
    'core/encoder/time',
    'core/polling',
    'core/timer',
    'ui/component',
    'tpl!taoQtiTest/runner/plugins/controls/timer/component/tpl/countdown',
    'ui/tooltip',
    'css!taoQtiTest/runner/plugins/controls/timer/component/css/countdown.css'
], function ($, _, timeEncoder, pollingFactory, timerFactory, component, countdownTpl, tooltip) {
    'use strict';

    //Precision is milliseconds
    var precision = 1000;

    /**
     * Default config values, see below.
     */
    var defaults = {
        showBeforeStart : true,
        displayWarning : true,
        polling   : true,
        frequency : 500
    };

    /**
     * time to display warnings
     */
    var warningTimeout =  {
        info:    2000,
        success: 2000,
        warning: 4000,
        danger:  4000,
        error:   8000
    };

    /**
     * Creates, initialize and render a countdown component.
     *
     * @param {jQueryElement|HTMLElement} $container - where to append the countdown
     * @param {Object} config
     * @param {String} config.id - the timer unique identifier
     * @param {String} config.label - the text to display above the timer
     * @param {String} config.type - the type of countdown (to categorize them)
     * @param {Number} [config.remainingTime] - the current value of the countdown, in milliseconds
     * @param {Boolean} [config.polling = true] - does the countdown handles the polling itself ?
     * @param {Number} [config.frequency = 500] - polling frequency in ms (if active)
     * @param {Boolean} [config.showBeforeStart = true] - do we show the time before starting
     * @param {Boolean} [config.displayWarning = true] - do we display the warnings or trigger only the event
     * @param {Object[]} [config.warnings] - define warnings thresholds
     * @param {Number} [config.warnings.threshold] - when the warning is shown, in milliseconds
     * @param {String} [config.warnings.message] - the warning message
     * @param {String} [config.warnings.level = warn] - the feedback level in (success, info, warn, danger and error)
     * @returns {countdown} the component, initialized and rendered
     */
    return function countdownFactory($container, config){
        var $time;

        /**
         * @typedef {Object} countdown
         */
        var countdown = component({

            /**
             * Update the countdown
             * @param {Number} remainingTime - the time remaining (milliseconds)
             * @returns {countdown} chains
             * @fires countdown#change - when the value has changed
             * @fires countdown#warn - when a threshold is reached
             */
            update: function udpate(remainingTime){
                var self = this;
                var encodedTime;
                var warningId;
                var warningMessage;

                if(!this.is('completed')){
                    if(remainingTime <= 0){
                        this.remainingTime = 0;
                    } else {
                        this.remainingTime = parseInt(remainingTime, 10);
                    }
                    if (this.is('rendered') && this.is('running')){

                        encodedTime = timeEncoder.encode(this.remainingTime / precision );
                        if(encodedTime !== this.encodedTime){
                            this.encodedTime = encodedTime;

                            $time.text(this.encodedTime);
                        }

                        if(this.warnings) {
                            //the warnings have already be sorted
                            warningId =  _.findLastKey(this.warnings, function(warning){
                                return warning && !warning.shown &&
                                       warning.threshold > 0 &&
                                       warning.threshold >= self.remainingTime;

                            });
                            if(warningId){

                                this.warnings[warningId].shown = true;

                                if(_.isFunction(this.warnings[warningId].message)){
                                    warningMessage = this.warnings[warningId].message(this.remainingTime);
                                } else {
                                    warningMessage = this.warnings[warningId].message;
                                }

                                /**
                                 * Warn user the timer reach a threshold
                                 * @event countdown#warn
                                 * @param {String} message
                                 * @param {String} level
                                 */
                                this.trigger('warn', warningMessage, this.warnings[warningId].level);
                            }
                        }

                        /**
                         * The current value has changed
                         * @event countdown#change
                         * @param {Number} remainingTime - the updated time
                         * @param {String} displayed - the displayed value
                         */
                        this.trigger('change', this.remainingTime, encodedTime);
                    }
                    if(this.remainingTime === 0){
                        this.complete();
                    }
                }
                return this;
            },

            /**
             * Starts the countdown
             * @returns {countdown} chains
             * @fires countdown#start
             */
            start : function start(){
                if(this.is('rendered') && !this.is('running') && !this.is('completed')){

                    this.enable();
                    this.setState('running', true);

                    if(this.polling){
                        this.polling.start();

                        if(!this.is('started')){
                            this.setState('started', true);
                            this.timer.start();
                        } else {
                            this.timer.resume();
                        }
                    }

                    /**
                     * The count has started
                     * @event countdown#start
                     */
                    this.trigger('start');
                }
                return this;
            },


            /**
             * Stops the countdown (can be restarted then)
             * @returns {countdown} chains
             * @fires countdown#stop
             */
            stop : function stop(){
                if(this.is('rendered') && this.is('running')){

                    this.setState('running', false);

                    if(this.polling){
                        this.timer.pause();
                        this.polling.stop();
                    }

                    /**
                     * The count is stopped
                     * @event countdown#stop
                     */
                    this.trigger('stop');
                }
                return this;
            },

            /**
             * Calls to complete the countdown,
             * it can't be resumed after.
             *
             * @returns {countdown} chains
             *
             * @fires countdown#complete
             * @fires countdown#end
             */
            complete : function complete(){
                if(this.is('rendered') && this.is('running') && !this.is('completed')){

                    this.stop();
                    this.setState('completed', true);

                    /**
                     * The countdown has ended, is completed
                     * @event countdown#complete
                     * @event countdown#end (alias)
                     */
                    this.trigger('complete end');
                }
                return this;
            }


        }, defaults)
        .on('init', function(){
            var self = this;

            this.remainingTime = this.config.remainingTime;

            if(this.config.warnings){
                this.warnings = _.sortBy(this.config.warnings, 'threshold');
            }

            //if configured, create a polling for the countdown
            if(this.config.polling === true && this.config.frequency > 0){
                this.timer   = timerFactory({
                    autoStart: false
                });
                this.polling = pollingFactory({
                    action: function pollingAction(){
                        var elapsed = self.timer.tick();
                        self.update(self.remainingTime - elapsed);
                    },
                    interval: this.config.frequency,
                    autoStart: false
                });
            }

            //auto renders
            this.render($container);
        })
        .on('render', function(){
            $time = $('.time', this.getElement());

            if(this.config.showBeforeStart === true){
                $time.text(timeEncoder.encode(this.remainingTime / precision ));
            }
        })
        .on('warn', function(message, level){
            var countdownTooltip;
            level = level || 'warning';

            if (this.is('rendered') && this.is('running') &&
                _.isString(message) && !_.isEmpty(message)) {

                $time
                    .removeClass('txt-success txt-info txt-warning txt-danger txt-error')
                    .addClass('txt-' + level);

                if(this.config.displayWarning === true){
                    countdownTooltip = tooltip.create(this.getElement(), message, {
                        trigger: 'manual',
                        theme : level,
                        placement:'bottom'
                    });
                    countdownTooltip.show();
                    setTimeout(function () {
                        countdownTooltip.hide();
                        countdownTooltip.dispose();
                    }, warningTimeout[level] || 2000);
                }
            }
        });

        countdown.setTemplate(countdownTpl);

        _.defer(function(){
            countdown.init(config);
        });

        return countdown;
    };
});
