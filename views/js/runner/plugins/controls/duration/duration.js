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
 * Test Runner Control Plugin : Duration (record exact spent time duration)
 *
 * @author Bertrand Chevrier <bertrand@taotesting.com>
 */
define([
    'lodash',
    'core/polling',
    'core/timer',
    'core/promise',
    'taoTests/runner/plugin',
], function(_, pollingFactory, timerFactory, Promise, pluginFactory) {
    'use strict';

    /**
     * Time interval between duration capture in ms
     * @type {Number}
     */
    var refresh = 1000;


    /**
     * Creates the timer plugin
     */
    return pluginFactory({

        name: 'duration',

        /**
         * Install step, add behavior before the lifecycle.
         */
        install: function install() {
            //define the "duration" store as "volatile" (removed on browser change).
            this.getTestRunner().getTestStore().setVolatile(this.getName());
        },


        /**
         * Initializes the plugin (called during runner's init)
         */
        init: function init() {

            var self = this;
            var testRunner = this.getTestRunner();

            //where the duration of attempts are stored
            return testRunner.getPluginStore(this.getName())
                .then(function(durationStore) {

                    /**
                     * Gets the duration of a particular item from the store
                     * @param {String} attemptId - the attempt id to get the duration for
                     * @returns {Promise}
                     */
                    function getItemDuration(attemptId) {
                        if (!/^(.*)+#+\d+$/.test(attemptId)) {
                            return Promise.reject(new Error('Is it really an attempt id, like "itemid#attempt"'));
                        }

                        return durationStore.getItem(attemptId);
                    }

                    //one stopwatch to count the time
                    self.stopwatch = timerFactory({
                        autoStart: false
                    });

                    //update the duration on a regular basis
                    self.polling = pollingFactory({

                        action: function updateDuration() {

                            //how many time elapsed from the last tick ?

                            var context = testRunner.getTestContext();

                            //store by attempt
                            var itemAttemptId = context.itemIdentifier + '#' + context.attempt;

                            durationStore.getItem(itemAttemptId).then(function(duration){
                                var elapsed = self.stopwatch.tick();
                                duration = _.isNumber(duration) ? duration : 0;
                                elapsed = _.isNumber(elapsed) && elapsed > 0 ? (elapsed / 1000) : 0;

                                //store the last duration
                                durationStore.setItem(itemAttemptId, duration + elapsed);
                            });
                        },
                        interval: refresh,
                        autoStart: false
                    });

                    //change plugin state
                    testRunner

                        .after('renderitem', function(){
                            self.enable();
                        })
                        .on('enableitem', function() {
                            self.enable();
                        })

                        .before('move skip exit timeout', function() {
                            var context = testRunner.getTestContext();
                            var itemAttemptId = context.itemIdentifier + '#' + context.attempt;

                            return getItemDuration(itemAttemptId).then(function(duration) {
                                var params = {
                                    itemDuration: 0
                                };
                                if (_.isNumber(duration) && duration > 0) {
                                    params.itemDuration = duration;
                                }

                                // the duration will be sent to the server with the next request,
                                // usually submitItem() or callItemAction()
                                testRunner.getProxy().addCallActionParams(params);
                            });
                        })

                        .on('move skip exit timeout error disableitem', function(){
                            self.disable();
                        })

                        /**
                          * @event duration.get
                          * @param {String} attemptId - the attempt id to get the duration for
                          * @param {getDuration} getDuration - a receiver callback
                          */
                        .on('plugin-get.duration', function(e, attemptId, getDuration) {
                            if (_.isFunction(getDuration)) {
                                getDuration(getItemDuration(attemptId));
                            }
                        });
                });
        },

        /**
         * Called during the runner's destroy phase
         */
        destroy: function destroy() {
            this.polling.stop();
            this.stopwatch.stop();
        },

        /**
         * Enables the duration count
         */
        enable: function enable() {
            if (!this.getState('enabled')) {
                this.polling.start();
                this.stopwatch.resume();
            }
        },

        /**
         * Disables the duration count
         */
        disable: function disable() {
            if (this.getState('enabled')) {
                this.polling.stop();
                this.stopwatch.pause();
            }
        }
    });
});
