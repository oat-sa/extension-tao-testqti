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
 * @author Bertrand Chevrier <bertrand@taotesting.com>
 */
define([
    'jquery',
    'lodash',
    'i18n',
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
], function ($, _, __, Promise, communicator, pollProvider, loggerFactory, loadingBar, feedback,
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
        'exitUrl',
        'plugins'
    ];



    /*
     *TODO provider registration should be loaded dynamically
     */
    runner.registerProvider('qti', qtiProvider);
    communicator.registerProvider('poll', pollProvider);



    /**
     * Initializes and launches the test runner
     * @param {Object} config
     */
    function initRunner(config) {
        var plugins = pluginLoader.getPlugins();
        var reason = '';

        config = _.defaults(config, {
            renderTo: $('.runner')
        });

        //instantiate the QtiTestRunner
        runner('qti', plugins, config)
            .on('error', onError)
            .on('ready', function () {
                _.defer(function () {
                    $('.runner').removeClass('hidden');
                });
            })
            .on('pause', function(data) {
                if (data && data.reason) {
                    // change exit Url
                    reason = data.reason;
                }
            })
            .after('destroy', function () {

                // at the end, we are redirected to the exit URL
                var url = config.exitUrl;
                if (reason && reason.length) {
                    url = urlUtil.build(url, {
                        warning: reason
                    });
                }

                window.location = url;
            })
            .init();
    }

    /**
     * The runner controller
     */
    return {

        /**
         * Controller entry point
         *
         * @param {Object} options - the testRunner options
         * @param {String} options.testDefinition
         * @param {String} options.testCompilation
         * @param {String} options.serviceCallId
         * @param {Object} options.bootstrap
         * @param {String} options.exitUrl - the full URL where to return at the final end of the test
         */
        start: function start(options) {

            var logger = loggerFactory('controller/runner', loggerFactory.levels.warn, options);

            var hasOption = function hasOption(name){
                return typeof options[name] !== 'undefined';
            };

            /**
            * Catches errors
            * @param {Object} err
            */
            var onError = function onError(err) {

                loadingBar.stop();

                feedback().error(err.message);

                logger.error(err);
            };



            var loadPlugins = function loadPlugins(plugins){
                var pluginLoader = pluginLoaderFactory();

                _.forEach(plugins, function (plugin, module) {
                    pluginLoader.add(module, plugin.category);
                });
                return pluginLoader
                        .load()
                        .then(function(){
                            return pluginLoader.getPlugins();
                        });
            };

            var loadProxy = function loadProxy(){
                return proxyLoader();
            };

            loadingBar.start();

            // verify required options
            if( ! _.every(requiredOptions, hasOption)) {
                return onError({
                    success: false,
                    code: 0,
                    type: 'error',
                    message: __('Missing required option %s', name)
                });

            }





                //load the plugins and the proxy provider
                Promise
                    .all([

                        pluginLoader.load()
                    ])
                    .then(function () {

                        //here we initialize the Test Runner
                        initRunner(_.omit(startOptions, 'plugins'));
                    })
                    .catch(function () {
                        onError({
                            success: false,
                            code: 0,
                            type: 'error',
                            message: __('Plugin dependency error!')
                        });
                    });
        }
    };
});
