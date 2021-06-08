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
 * Copyright (c) 2016-2019 (original work) Open Assessment Technologies SA ;
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
    'util/locale',
    'taoTests/runner/providerLoader',
    'taoTests/runner/runner',
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
    locale,
    providerLoader,
    runner
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
        'options',
        'providers'
    ];

    /**
     * The runner controller
     */
    return {

        /**
         * Controller entry point
         *
         * @param {Object} config - the testRunner config
         * @param {String} config.testDefinition - the test definition id
         * @param {String} config.testCompilation - the test compilation id
         * @param {String} config.serviceCallId - the service call id
         * @param {Object} config.bootstrap - contains the extension and the controller to call
         * @param {Object} config.options - the full URL where to return at the final end of the test
         * @param {Object[]} config.providers - the collection of providers to load
         */
        start(config) {
            let exitReason;
            const $container = $('.runner');

            const logger = loggerFactory('controller/runner', {
                serviceCallId : config.serviceCallId,
                plugins : config && config.providers && Object.keys(config.providers.plugins)
            });

            let preventFeedback = false;
            let errorFeedback = null;

            /**
             * Exit the test runner using the configured exitUrl
             * @param {String} [reason] - to add a warning once left
             * @param {String} [level] - error level
             */
            const exit = function exit(reason, level){
                let url = config.options.exitUrl;
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
             * @param {Error} err - the thrown error
             * @param {String} [displayMessage] - an alternate message to display
             */
            const onWarning = function onWarning(err, displayMessage) {
                onFeedback(err, displayMessage, "warning");
            };

            /**
             * Handles errors & warnings
             * @param {Error} err - the thrown error
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

            const moduleConfig = module.config();

            loadingBar.start();

            // adding attr for RTL languages
            $('.delivery-scope').attr({dir: locale.getLanguageDirection(context.locale)});
            // tune classes to remove page header RTL artifacts
            const menuItemSelector = '.delivery-scope[dir=rtl] .settings-menu li';
            $(menuItemSelector).addClass('sep-before');
            $(`${menuItemSelector}:visible:last`).removeClass('sep-before');


            // verify required config
            if ( ! requiredOptions.every( option => typeof config[option] !== 'undefined') ) {
                return onError(new TypeError(__('Missing required configuration option %s', name)));
            }

            // dispatch any extra registered routes
            if (moduleConfig && _.isArray(moduleConfig.extraRoutes) && moduleConfig.extraRoutes.length) {
                router.dispatch(moduleConfig.extraRoutes);
            }

            //for the qti provider to be selected here
            config.provider = Object.assign( config.provider || {}, { runner: 'qti' });

            //load the plugins and the proxy provider
            providerLoader(config.providers, context.bundle)
                .then(function (results) {

                    const testRunnerConfig = _.omit(config, ['providers']);
                    testRunnerConfig.renderTo = $container;

                    if (results.proxy && typeof results.proxy.getAvailableProviders === 'function') {
                        const loadedProxies = results.proxy.getAvailableProviders();
                        testRunnerConfig.provider.proxy = loadedProxies[0];
                    }

                    logger.debug({
                        config: testRunnerConfig,
                        providers : config.providers
                    }, 'Start test runner');

                    //instantiate the QtiTestRunner
                    runner(config.provider.runner, results.plugins, testRunnerConfig)
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

                        //FIXME this event should not be triggered on the test runner
                        .on('disablefeedbackalerts', function() {
                            if (errorFeedback) {
                                errorFeedback.close();
                            }
                            preventFeedback = true;
                        })

                        //FIXME this event should not be triggered on the test runner
                        .on('enablefeedbackalerts', function() {
                            preventFeedback = false;
                        })
                        .init();
                })
                .catch(function(err){
                    onError(err, __('An error occurred during the test initialization!'));
                });
        }
    };
});
