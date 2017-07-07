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
 * Test runner controller entry
 *
 * @author Bertrand Chevrier <bertrand@taotesting.com>
 */
define([
    'jquery',
    'lodash',
    'i18n',
    'context',
    'core/promise',
    'core/communicator',
    'core/communicator/poll',
    'core/logger',
    'layout/loading-bar',
    'ui/feedback',
    'taoTests/runner/runner',
    'taoQtiTest/runner/provider/qti',
    'taoQtiTest/runner/proxy/loader',
    'core/pluginLoader',
    'util/url',
    'css!taoQtiTestCss/new-test-runner'
], function ($, _, __, context, Promise, communicator, pollProvider, loggerFactory, loadingBar, feedback,
             runner, qtiProvider, proxyLoader, pluginLoaderFactory, urlUtil) {
    'use strict';

    /**
     * List of options required by the controller
     * @type {String[]}
     */
    var requiredOptions = [
        'testDefinition',
        'testCompilation',
        'serviceCallId',
        'bootstrap',
        'exitUrl',
        'plugins'
    ];

    /**
     * TODO provider registration should be loaded dynamically
     * the same way the proxy and the plugins are loaded
     */
    runner.registerProvider('qti', qtiProvider);
    communicator.registerProvider('poll', pollProvider);

    /**
     * The runner controller
     */
    return {

        /**
         * Controller entry point
         *
         * @param {Object}   options - the testRunner options
         * @param {String}   options.testDefinition - the test definition id
         * @param {String}   options.testCompilation - the test compilation id
         * @param {String}   options.serviceCallId - the service call id
         * @param {Object}   options.bootstrap - contains the extension and the controller to call
         * @param {String}   options.exitUrl - the full URL where to return at the final end of the test
         * @param {Object[]} options.plugins - the collection of plugins to load
         */
        start: function start(options) {

            var exitReason;
            var $container = $('.runner');
            var logger     = loggerFactory('controller/runner', { runnerOptions : options });

            /**
             * Does the option exists ?
             * @param {String} name - the option key
             * @returns {Boolean}
             */
            var hasOption = function hasOption(name){
                return typeof options[name] !== 'undefined';
            };

            /**
             * Exit the test runner using the configured exitUrl
             * @param {String} [reason] - to add a warning once left
             */
            var exit = function exit(reason){
                var url = options.exitUrl;
                if (reason) {
                    url = urlUtil.build(url, {
                        warning: reason
                    });
                }
                window.location = url;
            };

            /**
             * Handles errors
             * @param {Error} err - the thrown error
             * @param {String} [displayMessage] - an alternate message to display
             */
            var onError = function onError(err, displayMessage) {
                displayMessage = displayMessage || err.message;

                if(!_.isString(displayMessage)){
                    displayMessage = JSON.stringify(displayMessage);
                }
                loadingBar.stop();


                logger.error({ displayMessage : displayMessage }, err);

                if(err.code === 403) {
                    //we just leave if any 403 occurs
                    return exit();
                }
                feedback().error(displayMessage, { timeout : -1 });
            };

            /**
             * Load the plugins dynamically
             * @param {Object[]} plugins - the collection of plugins to load
             * @returns {Promise} resolves with the list of loaded plugins
             */
            var loadPlugins = function loadPlugins(plugins){

                return pluginLoaderFactory()
                        .addList(plugins)
                        .load(context.bundle);
            };

            /**
             * Load the configured proxy provider
             * @returns {Promise} resolves with the name of the proxy provider
             */
            var loadProxy = function loadProxy(){
                return proxyLoader();
            };

            loadingBar.start();

            // verify required options
            if( ! _.every(requiredOptions, hasOption)) {
                return onError(new TypeError(__('Missing required option %s', name)));
            }

            //load the plugins and the proxy provider
            Promise
                .all([
                    loadPlugins(options.plugins),
                    loadProxy()
                ])
                .then(function (results) {

                    var plugins = results[0];
                    var proxyProviderName = results[1];

                    var config = _.omit(options, 'plugins');
                    config.proxyProvider = proxyProviderName;
                    config.renderTo      = $container;

                    logger.debug({ config: config, plugins: plugins}, 'Start test runner');

                    //instantiate the QtiTestRunner
                    runner('qti', plugins, config)
                        .on('error', onError)
                        .on('ready', function () {
                            _.defer(function () {
                                $container.removeClass('hidden');
                            });
                        })
                        .on('pause', function(data) {
                            if (data && data.reason) {
                                exitReason = data.reason;
                            }
                        })
                        .after('destroy', function () {
                            this.removeAllListeners();

                            // at the end, we are redirected to the exit URL
                            exit(exitReason);
                        })
                        .init();
                })
                .catch(function(err){
                    onError(err, __('An error occurred during the test initialization!'));
                });
        }
    };
});
