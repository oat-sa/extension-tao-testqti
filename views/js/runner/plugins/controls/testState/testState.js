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
    'taoTests/runner/plugin'
], function (_, pluginFactory) {
    'use strict';

    /**
     * Creates the testState plugin.
     * Handle particular states of the assessment test
     */
    return pluginFactory({

        name: 'testState',

        /**
         * Installs the plugin (called when the runner bind the plugin)
         */
        install: function install() {
            var testRunner = this.getTestRunner();

            // middleware invoked on every requests
            testRunner.getProxy()
                .use(function qtiFilter(req, res, next) {
                    var data = res && res.data;

                    // test has been closed/suspended => redirect to the index page after message acknowledge
                    if (data && data.type && data.type === 'TestState' && !testRunner.getState('closedOrSuspended')) {

                        // spread the world about the reason of the leave
                        testRunner.setState('closedOrSuspended', true);

                        if (!testRunner.getState('ready')) {
                            // if we open an inconsistent test just leave
                            // should happen if we refresh an auto paused test
                            testRunner.trigger('destroy');
                        } else if (_.isEmpty(data.messages) || !_.find(data.messages, {channel: 'teststate'})) {
                            testRunner.trigger('leave', data);
                        }
                        // break the chain to avoid uncaught exception in promise...
                        // this will lead to unresolved promise, but the browser will be redirected soon!
                        return;
                    }
                    next();
                });
        },

        /**
         * Initializes the plugin (called during runner's init)
         */
        init: function init() {
            var testRunner = this.getTestRunner();
            var isLeaving = false;

            // immediate handling of proctor's actions
            testRunner.getProxy()
                .channel('teststate', function (data) {
                    if (!isLeaving && data && ('close' === data.type || 'pause' === data.type) && !testRunner.getState('closedOrSuspended')) {
                        isLeaving = true;

                        testRunner.setState('closedOrSuspended', true);

                        testRunner.trigger('leave', data);
                    }
                });
        }
    });
});
