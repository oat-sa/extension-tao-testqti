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
 * @author Jean-Sébastien Conan <jean-sebastien.conan@vesperiagroup.com>
 */
define([
    'lodash',
    'core/promise',
    'taoTests/runner/plugin'
], function (_, Promise, pluginFactory) {
    'use strict';

    /**
     * Creates the testState plugin.
     * Displays exit message, then leaves the runner once the user has acknowledged
     */
    return pluginFactory({

        name: 'exitMessages',

        /**
         * Initializes the plugin (called during runner's init)
         */
        init: function init() {
            // this function is mandatory
        },

        /**
         * Installs the plugin (called when the runner bind the plugin)
         */
        install: function install() {
            var testRunner = this.getTestRunner();

            // intercepts the `leave` event,
            // then if a message needs to be displayed displays it and waits the user acknowledges it
            testRunner.before('leave', function leave(e, data) {
                if (_.isObject(data) && data.message) {
                    return new Promise(function(resolve) {
                        var context = testRunner.getTestContext();

                        // the leave can occurs when the runner is in inconsistent state (i.e. error)
                        // prevent side error with item disabling
                        if (context && context.itemIdentifier) {
                            testRunner.disableItem(context.itemIdentifier);
                        }
                        // wait for the message acknowledge before leaving the runner
                        testRunner
                            .trigger('disablefeedbackalerts')
                            .trigger('alert.leave', data.message, function() {
                                testRunner.trigger('enablefeedbackalerts');
                                resolve();
                            });
                    });
                }
            });
        }
    });
});
