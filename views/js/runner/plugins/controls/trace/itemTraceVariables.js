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
 * Copyright (c) 2017 (original work) Open Assessment Technologies SA ;
 */
/**
 * Test Runner Control Plugin : Item Trace Variables
 *
 * @author Jean-Sébastien Conan <jean-sebastien@taotesting.com>
 */
define([
    'lodash',
    'moment',
    'core/store',
    'taoTests/runner/plugin'
], function (_, moment, storeFactory, pluginFactory) {
    'use strict';

    /**
     * Duration of a second in the timer's base unit
     * @type {Number}
     */
    var precision = 1000;

    /**
     * Gets the current timestamp
     * @returns {Number}
     */
    function timestamp() {
        return Date.now() / precision;
    }

    /**
     * Creates the timer plugin
     */
    return pluginFactory({

        name: 'itemTraceVariables',

        /**
         * Installation of the plugin (called before init)
         */
        install: function install() {
            var self = this;
            self.getTestRunner().on('storechange', function () {
                self.shouldClearStorage = true;
            });
        },

        /**
         * Initializes the plugin (called during runner's init)
         */
        init: function init() {

            var self = this;
            var testRunner = this.getTestRunner();
            var variables = {};

            function onError(err) {
                testRunner.trigger('error', err);
            }

            return storeFactory('trace-' + testRunner.getConfig().serviceCallId)
                .then(function (tracesStore) {
                    if (self.shouldClearStorage) {
                        return tracesStore.clear().then(function () {
                            return tracesStore;
                        });
                    }
                    return tracesStore;
                }).then(function (tracesStore) {
                    testRunner
                        .after('renderitem enableitem', function () {
                            var context = testRunner.getTestContext();

                            variables = {
                                ITEM_START_TIME_CLIENT: timestamp()
                            };

                            tracesStore.getItem(context.itemUri)
                                .then(function (data) {
                                    if (data) {
                                        _.merge(variables, data);
                                    }

                                    return tracesStore.setItem(context.itemUri, variables);
                                })
                                .catch(onError);
                        })

                        .before('move skip exit timeout', function () {
                            var context = testRunner.getTestContext();

                            variables.ITEM_END_TIME_CLIENT = timestamp();
                            variables.ITEM_TIMEZONE = moment().utcOffset(moment().utcOffset()).format('Z');

                            return tracesStore.setItem(context.itemUri, variables).catch(onError);
                        })

                        .before('unloaditem', function () {
                            var context = testRunner.getTestContext();
                            return testRunner.getProxy().callItemAction(context.itemIdentifier, 'storeTraceData', {
                                traceData: JSON.stringify(variables)
                            });
                        })

                        .before('finish', function () {
                            return new Promise(function (resolve) {
                                tracesStore.removeStore()
                                    .then(resolve)
                                    .catch(resolve);
                            });
                        });
                });
        }
    });
});
