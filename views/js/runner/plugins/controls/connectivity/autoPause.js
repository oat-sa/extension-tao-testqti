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
    'i18n',
    'taoTests/runner/plugin'
], function (__, pluginFactory) {
    'use strict';

    /**
     * The name of the state used to persist the auto pause
     * @type {String}
     */
    var pausedState = 'paused';

    /**
     * Creates the autoPause plugin.
     * Auto pause the assessment when the connectivity is lost
     */
    return pluginFactory({

        name: 'autoPause',
        
        /**
         * Installs the plugin (called when the runner bind the plugin)
         */
        install: function install() {
            var testRunner = this.getTestRunner();
            if (testRunner.getPersistentState(pausedState)) {
                testRunner
                    .before('destroy.autopause', function(e) {
                        testRunner.off('destroy.autopause');

                        // if the server acknowledged the auto pause then the test has been suspended
                        // so no need to keep the state
                        if (testRunner.getState('closedOrSuspended')) {
                            var done = e.done();
                            testRunner.setPersistentState(pausedState, false).then(done);
                        }
                    })
                    // will notify the server that the test was auto paused
                    .getProxy().addCallActionParams({
                        clientState: 'paused'
                    });
            }
        },

        /**
         * Initializes the plugin (called during runner's init)
         */
        init: function init() {
            var testRunner = this.getTestRunner();
            var states = testRunner.getTestData().states;

            return testRunner.setPersistentState(pausedState, false).then(function() {
                // auto pause when disconnected
                testRunner
                    .on('disconnect', function() {
                        testRunner.setPersistentState(pausedState, true).then(function() {
                            testRunner
                                .trigger('autopause')
                                .trigger('leave', {
                                    message: __('You are encountering a connectivity loss. The test has been suspended.'),
                                    code: states.suspended
                                });    
                        });
                    });    
            });
        }
    });
});
