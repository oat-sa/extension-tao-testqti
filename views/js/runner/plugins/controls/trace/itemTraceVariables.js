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
    'taoTests/runner/plugin'
], function (_, moment, pluginFactory) {
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
         * Install step, add behavior before the lifecycle.
         */
        install: function install() {
            //define the "trace" store as "volatile" (removed on browser change).
            // the store name is "trace" for backward compatibility,
            // best practice is to use the plugin name
            this.getTestRunner().getTestStore().setVolatile('trace');
        },

        /**
         * Initializes the plugin (called during runner's init)
         */
        init: function init() {
            var testRunner = this.getTestRunner();
            var variables = {};

            function onError(err) {
                testRunner.trigger('error', err);
            }

            return testRunner.getPluginStore('trace')
                .then(function (tracesStore) {
                    testRunner
                        .after('renderitem enableitem', function () {
                            var context = testRunner.getTestContext();

                            variables = {
                                ITEM_START_TIME_CLIENT: timestamp()
                            };

                            tracesStore.getItem(context.itemIdentifier)
                                .then(function (data) {
                                    if (data) {
                                        _.merge(variables, data);
                                    }

                                    return tracesStore.setItem(context.itemIdentifier, variables);
                                })
                                .catch(onError);
                        })

                        .before('move skip exit timeout', function () {
                            var context = testRunner.getTestContext();

                            variables.ITEM_END_TIME_CLIENT = timestamp();
                            variables.ITEM_TIMEZONE = moment().utcOffset(moment().utcOffset()).format('Z');

                            return tracesStore.setItem(context.itemIdentifier, variables).catch(onError);
                        })

                        .before('unloaditem', function () {
                            var context = testRunner.getTestContext();
                            return testRunner.getProxy().callItemAction(context.itemIdentifier, 'storeTraceData', {
                                traceData: JSON.stringify(variables)
                            }, true);
                        });
                });
        }
    });
});
