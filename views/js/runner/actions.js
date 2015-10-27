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
 * Copyright (c) 2015 (original work) Open Assessment Technologies SA ;
 */
/**
 * @author Jean-Sébastien Conan <jean-sebastien.conan@vesperiagroup.com>
 */
define([
    'jquery',
    'lodash',
    'i18n',
    'taoQtiTest/runner/plugin'
], function ($, _, __, plugin) {
    'use strict';

    /**
     * Defines the Actions plugin for the QTI test runner
     * @type {runnerAction}
     */
    var runnerAction = {
        /**
         * Setups the plugin: register actions
         * @param {Function} resolve
         */
        setup : function setup(resolve) {
            var self = this;
            var runner = this.testRunner;
            _({
                next: function(event, params) {
                    runner.request('moveForward', params);
                },
                previous: function(event, params) {
                    runner.request('moveBackward', params);
                }
            }).forEach(function(handler, action) {
                runner.registerAction(action, handler);
            });


            if (_.isFunction(resolve)) {
                resolve();
            }
        }


    };

    /**
     * Builds an instance of the Actions plugin
     * @param testRunner
     * @param config
     * @param resolve
     * @returns {runnerAction}
     */
    var runnerActionFactory = function runnerActionFactory(testRunner, config, resolve) {
        return plugin(runnerAction).init(testRunner, config, resolve);
    };

    return runnerActionFactory;
});
