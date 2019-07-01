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
 * Copyright (c) 2016-2017 (original work) Open Assessment Technologies SA ;
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
    'module',
    'core/router',
    'core/logger',
    'layout/loading-bar',
    'ui/feedback',
    'util/url',
    'taoTests/runner/providerLoader',
    'taoQtiTest/runner/proxy/loader',
    'css!taoQtiTestCss/new-test-runner'
], function (
    $,
    _,
    __,
    context,
    module,
    router,
    loggerFactory,
    loadingBar,
    feedback,
    urlUtil,
    providerLoader,
    proxyLoader
) {
    'use strict';

    /**
     * List of options required by the controller
     * @type {String[]}
     */
    const requiredOptions = [
        'testDefinition',
        'testCompilation',
        'serviceCallId',
        'bootstrap',
        'providers'
    ];

    function getProxyConfiguration(){i
        const proxyConfig = requirejs.config();
        debugger;
        return {
            'id' : 'qtiServiceProxy',
            'module' : 'taoQtiTest/runner/proxy/qtiServiceProxy',
            'category' : 'proxy'
        };
    }

    /**
     * TODO provider registration should be loaded dynamically
     */
    //runner.registerProvider('qti', qtiProvider);
    //communicator.registerProvider('poll', pollProvider);
    //communicator.registerProvider('request', requestProvider);

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
         * @param {Object[]} options.plugins - the collection of plugins to load
         * @param {Object[]} options.providers - the collection of providers to load
         */
        start(runnerOptions = {}) {


            const $container = $('.runner');
            const logger     = loggerFactory('controller/runner', { runnerOptions : runnerOptions });
            let exitReason;
            let preventFeedback = false;
            let errorFeedback = null;

            /**
             * Does the option exists ?
             * @param {String} name - the option key
             * @returns {Boolean}
             */
            const hasOption = function hasOption(name){
                return typeof runnerOptions[name] !== 'undefined';
            };

            /**
             * Exit the test runner using the configured exitUrl
             * @param {String} [reason] - to add a warning once left
             * @param {String} [level] - error level
             */
            const exit = function exit(reason, level){
                let url = runnerOptions.exitUrl;
                const params = {};
                if (reason) {
                    if (!level) {
                        level = 'warning';
                    }
                    params[level] = reason;
                    url = urlUtil.build(url, params);
                }
                window.location = url;
            };

            /**
             * Handles errors
             * @param {Error} err - the thrown error
             * @param {String} [displayMessage] - an alternate message to display
             */
            const onError = function onError(err, displayMessage) {
                onFeedback(err, displayMessage, "error");
            };

            /**
             * Handles warnings
             * @param {Error} err
             * @param {String} [displayMessage] - an alternate message to display
             */
            const onWarning = function onWarning(err, displayMessage) {
                onFeedback(err, displayMessage, "warning");
            };

            /**
             * Handles errors & warnings
             * @param {String} [displayMessage] - an alternate message to display
             * @param {String} [type] - "error" or "warning"
             */
            const onFeedback = function onFeedback(err, displayMessage, type) {
                const typeMap = {
                    warning: {
                        logger: "warn",
                        feedback: "warning"
                    },
                    error: {
                        logger: "error",
                        feedback: "error"
                    }
                };
                const loggerByType = logger[typeMap[type].logger];
                const feedbackByType = feedback()[typeMap[type].feedback];

                displayMessage = displayMessage || err.message;

                if(!_.isString(displayMessage)){
                    displayMessage = JSON.stringify(displayMessage);
                }
                loadingBar.stop();

                loggerByType({ displayMessage : displayMessage }, err);

                if(type === "error" && (err.code === 403 || err.code === 500)) {
                    displayMessage = `${__('An error occurred during the test, please content your administrator.')} ${displayMessage}`;
                    return exit(displayMessage, 'error');
                }
                if (!preventFeedback) {
                    errorFeedback = feedbackByType(displayMessage, {timeout: -1});
                }
            };


            /**
             * Load the configured proxy provider
             * @returns {Promise} resolves with the name of the proxy provider
             */
            const loadProxy = function loadProxy(){
                return proxyLoader();
            };

            const moduleConfig = module.config();

            loadingBar.start();

            // verify required options
            if( ! _.every(requiredOptions, hasOption)) {
                return onError(new TypeError(__('Missing required option %s', name)));
            }
            if (!runnerOptions.providers.plugins.length) {
                return onError(new TypeError(__('There are no plugins configured.')));
            }

            // dispatch any extra registered routes
            if (moduleConfig && _.isArray(moduleConfig.extraRoutes) && moduleConfig.extraRoutes.length) {
                router.dispatch(moduleConfig.extraRoutes);
            }

            runnerOptions.providers.proxy = getProxyConfiguration();

            //load the plugins and the proxy provider
            providerLoader(runnerOptions)
                .then(function (results) {
                    debugger;

                    const plugins = results[0];
                    const proxyProviderName = results[1];

                    const testRunnerConfig = _.omit(runnerOptions, ['providers']);
                    testRunnerConfig.proxyProvider = proxyProviderName;
                    testRunnerConfig.renderTo      = $container;

                    logger.debug({
                        config: testRunnerConfig,
                        plugins: runnerOptions.providers.plugins
                    }, 'Start test runner');

                    //instantiate the QtiTestRunner
                    runner('qti', plugins, config)
                        .on('error', onError)
                        .on('warning', onWarning)
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
                        //FIXME remove this event : trigger and listener
                        .on('disablefeedbackalerts', function() {
                            if (errorFeedback) {
                                errorFeedback.close();
                            }
                            preventFeedback = true;
                        })
                        //FIXME remove this event : trigger and listener
                        .on('enablefeedbackalerts', function() {
                            preventFeedback = false;
                        })
                        .init();
                })
                .catch(err => {
                    onError(err, __('An error occurred during the test initialization!'));
                });
        }
    };
});
