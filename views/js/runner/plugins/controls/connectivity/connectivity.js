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
    'taoTests/runner/plugin'
], function (pluginFactory) {
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
            var proxy      = testRunner.getProxy();

            //the Proxy is the only one to know something about connectivity
            proxy.on('disconnect', function disconnect(source) {
                if (!testRunner.getState('disconnected')) {
                    testRunner.setState('disconnected', true);
                    testRunner.trigger('disconnect', source);
                    testRunner.trigger('warning', 'disconnect from ' + source);
                }
            })
            .on('reconnect', function reconnect() {
                if (testRunner.getState('disconnected')) {
                    testRunner.setState('disconnected', false);
                    testRunner.trigger('reconnect');
                    testRunner.trigger('warning', 'reconnect');
                }
            });

            // detect and prevent connectivity errors
            testRunner.before('error', function(e, err) {
                if (proxy.isConnectivityError(err)){
                    return false;
                }
            });
        }
    });
});
