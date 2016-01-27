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
    'moment',
    'core/polling',
    'core/timer',
    'core/encoder/time',
    'taoTests/runner/plugin',
    'tpl!taoQtiTest/runner/plugins/controls/timer/timer'
], function ($, _, __, moment, pollingFactory, timerFactory, time, pluginFactory, timerTpl) {
    'use strict';

    /**
     * Time interval between timer refreshes, in milliseconds
     * @type {Number}
     */
    var timerRefresh = 1000;

    /**
     * Duration of a second in the timer's base unit
     * @type {Number}
     */
    var precision = 1000;

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
            var testRunner = this.getTestRunner();
            var testData = testRunner.getTestData() || {};
            var itemStates = testData.itemStates || {};
            var timerWarning = testData.config && testData.config.timerWarning || {};
            var timers = [];

            /**
             * Gets the config for the current timers
             * @returns {Object}
             */
            function getTimerConfig() {
                var context = testRunner.getTestContext();
                var config = {
                    index : {},
                    timers : []
                };

                // get the config of each timer
                if (!context.isTimeout && context.itemSessionState === itemStates.interacting) {
                    _.forEach(context.timeConstraints, function(timeConstraint) {
                        var timer = {
                            label: timeConstraint.label,
                            type: timeConstraint.qtiClassName,
                            remaining: timeConstraint.seconds * precision,
                            control: timeConstraint.source,
                            value: time.encode(timeConstraint.seconds),
                            running: true
                        };

                        if (timerWarning[timer.type]) {
                            timer.warning = parseInt(timerWarning[timer.type], 10) * precision;
                        }

                        if (!timeConstraint.allowLateSubmission) {
                            config.timers.push(timer);
                            config.index[timer.control] = timer;
                        }
                    });
                }
                return config;
            }

            /**
             * Creates a new display for the timers
             * @returns {*|jQuery|HTMLElement}
             */
            function createElement() {
                var timerConfig = getTimerConfig();
                var $element = $(timerTpl(timerConfig));
                var index = timerConfig.index;

                // link each timer with the related DOM element
                $element.find('[data-control]').each(function() {
                    var $control = $(this);
                    var controlId = $control.data('control');
                    index[controlId].$control = $control;
                    index[controlId].$time = $control.find('.qti-timer_time');
                });

                timers = timerConfig.timers;

                return $element;
            }

            /**
             * Refreshes the display
             */
            function updateElement() {
                _.forEach(timers, function(timer) {
                    timer.value = time.encode(timer.remaining / precision);
                    if (timer.$time) {
                        timer.$time.text(timer.value);
                    }
                    if (timer.$control) {
                        timer.$control.toggleClass('disabled', !timer.running);
                    }
                });
            }

            /**
             * Display a warning message with the remaining time
             * @param timer
             */
            function warning(timer) {
                var remaining = moment.duration(timer.remaining / precision, "seconds").humanize();
                var message;

                switch (timer.type) {
                    case 'assessmentItemRef':
                        message = __("Warning – You have %s remaining to complete this item.", remaining);
                        break;

                    case 'assessmentSection':
                        message = __("Warning – You have %s remaining to complete this section.", remaining);
                        break;

                    case 'testPart':
                        message = __("Warning – You have %s remaining to complete this test part.", remaining);
                        break;

                    case 'assessmentTest':
                        message = __("Warning – You have %s remaining to complete the test.", remaining);
                        break;
                }

                testRunner.trigger('warning', message);
                timer.$control.addClass('qti-timer__warning');
                timer.warning = 0;
            }

            /**
             * Updates each timer
             */
            function tick() {
                // get the time elapsed since the last tick
                var elapsed = self.timer.tick();
                var timeout = false;

                // update the timers, detect timeout
                _.forEach(timers, function(timer) {
                    if (timer.running) {
                        timer.remaining -= elapsed;

                        if (timer.remaining <= 0) {
                            timer.remaining = 0;
                            timer.running = 0;
                            timeout = true;
                        }

                        if (!timeout && _.isFinite(timer.warning) && timer.remaining <= timer.warning) {
                            warning(timer);
                        }
                    }
                });

                // timeout ?
                if (timeout) {
                    testRunner.timeout();
                    self.disable();
                }

                return timeout;
            }

            this.$element = createElement();
            this.timer = timerFactory({
                autoStart : false
            });
            this.polling = pollingFactory({
                action : function() {
                    tick();
                    updateElement();
                },
                interval : timerRefresh,
                autoStart : false
            });

            //disabled by default
            this.disable();

            //change plugin state
            testRunner
                .before('move', function(){
                    if (self.getState('enabled')) {
                        self.disable();
                    }
                })
                .on('loaditem', function(){
                    updateElement();
                })
                .on('renderitem', function(){
                    var $element = createElement();
                    self.$element.replaceWith($element);
                    self.$element = $element;
                    self.enable();
                })
                .on('unloaditem', function(){
                    if (self.getState('enabled')) {
                        self.disable();
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
            this.timer.stop();
            this.polling.stop();
            this.$element.remove();
        },

        /**
         * Enables the button
         */
        enable : function enable (){
            this.$element.removeClass('disabled');
            this.polling.start();
            this.timer.resume();
        },

        /**
         * Disables the button
         */
        disable : function disable (){
            this.timer.pause();
            this.polling.stop();
            this.$element.addClass('disabled');
        },

        /**
         * Shows the button
         */
        show: function show(){
            this.$element.show();
        },

        /**
         * Hides the button
         */
        hide: function hide(){
            this.$element.hide();
        }
    });
});
