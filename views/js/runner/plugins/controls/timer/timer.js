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
    'core/encoder/time',
    'ui/feedback',
    'ui/dialog/alert',
    'taoTests/runner/plugin',
    'tpl!taoQtiTest/runner/plugins/controls/timer/timer'
], function ($, _, __, pollingFactory, timerFactory, time, feedback, dialogAlert, pluginFactory, timerTpl) {
    'use strict';

    /**
     * Time interval between timer refreshes, in milliseconds
     * @type {Number}
     */
    var timerRefresh = 1000;

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
            var testData = testRunner.getTestData();
            var itemStates = testData.itemStates;
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
                            remaining: timeConstraint.seconds,
                            control: timeConstraint.source,
                            value: time.encode(timeConstraint.seconds)
                        };

                        config.timers.push(timer);
                        config.index[timer.control] = timer;
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
                    timer.value = time.encode(timer.remaining);
                    if (timer.$time) {
                        timer.$time.text(timer.value);
                    }
                });
            }

            /**
             * Updates each timer
             */
            function tick() {
                // get the time elapsed since the last tick
                var elapsed = self.timer.tick() / 1000;
                var timeout = false;

                // update the timers, detect timeout
                _.forEach(timers, function(timer) {
                    timer.remaining -= elapsed;
                    if (timer.remaining <= 0) {
                        timer.remaining = 0;
                        timeout = true;
                    }
                });

                // timeout ?
                if (timeout) {
                    self.disable();
                    testRunner.timeout();
                }

                return timeout;
            }

            this.$element = createElement();
            this.timer = timerFactory(false);
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
