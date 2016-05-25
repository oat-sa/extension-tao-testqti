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
    'jquery',
    'lodash',
    'i18n',
    'taoTests/runner/plugin'
], function ($, _, __, pluginFactory) {
    'use strict';

    /**
     * Creates the connectivity plugin.
     * Detects connectivity issues
     */
    return pluginFactory({

        name: 'connectivity',

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

            function disconnect() {
                if (!testRunner.getState('disconnected')) {
                    testRunner.trigger('disconnect');
                }
            }

            function reconnect() {
                if (testRunner.getState('disconnected')) {
                    testRunner.trigger('reconnect');
                }
            }

            // immediate detection of connectivity loss using Offline API
            $(window).on('offline.connectivity', function() {
                disconnect();
            });

            // immediate detection of connectivity back using Offline API
            $(window).on('online.connectivity', function() {
                reconnect();
            });

            testRunner
                .on('disconnect', function() {
                    testRunner.setState('disconnected', true);
                })
                .on('reconnect', function() {
                    testRunner.setState('disconnected', false);
                })
                .before('error', function(e, error) {
                    // detect connectivity errors as network error without error code
                    if (_.isObject(error) && error.source === 'network' && !error.code) {
                        disconnect();

                        // prevent default error handling
                        return false;
                    }
                });

            testRunner.getProxy()
                .on('receive', function() {
                    // any message received, state the runner is connected
                    reconnect();
                });
        },

        /**
         * Called during the runner's destroy phase
         */
        destroy : function destroy (){
            $(window).off('offline.connectivity');
            $(window).off('online.connectivity');
        }
    });
});
