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
    'module',
    'core/promise',
    'core/communicator',
    'core/communicator/poll',
    'layout/loading-bar',
    'ui/feedback',
    'taoTests/runner/runner',
    'taoQtiTest/runner/provider/qti',
    'taoTests/runner/proxy',
    'taoQtiTest/runner/proxy/qtiServiceProxy',
    'taoQtiTest/runner/plugins/loader',
    'css!taoQtiTestCss/new-test-runner'
], function ($, _, __, module, Promise, communicator, pollProvider, loadingBar, feedback,
             runner, qtiProvider, proxy, qtiServiceProxy, pluginLoader) {
    'use strict';


    /*
     *TODO plugins list, provider registration should be loaded dynamically
     */

    runner.registerProvider('qti', qtiProvider);
    proxy.registerProvider('qtiServiceProxy', qtiServiceProxy);
    communicator.registerProvider('poll', pollProvider);

    /**
     * Catches errors
     * @param {Object} err
     */
    function onError(err) {
        loadingBar.stop();

        feedback().error(err.message);

        //TODO to be replaced by the logger
        window.console.error(err);
    }

    /**
     * Initializes and launches the test runner
     * @param {Object} config
     */
    function initRunner(config) {
        var plugins = pluginLoader.getPlugins();

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
            .on('destroy', function () {
                // at the end, we are redirected to the exit URL
                window.location = config.exitUrl;
            })
            .init();
    }

    /**
     * List of options required by the controller
     * @type {String[]}
     */
    var requiredOptions = [
        'testDefinition',
        'testCompilation',
        'serviceCallId',
        'exitUrl'
    ];

    /**
     * The runner controller
     */
    var runnerController = {

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
            var startOptions = options || {};
            var config = module.config();
            var missingOption = false;

            // verify required options
            _.forEach(requiredOptions, function(name) {
                if (!startOptions[name]) {
                    onError({
                        success: false,
                        code: 0,
                        type: 'error',
                        message: __('Missing required option %s', name)
                    });
                    missingOption = true;
                    return false;
                }
            });

            if (!missingOption) {
                loadingBar.start();

                if (config) {
                    _.forEach(config.plugins, function (plugin) {
                        pluginLoader.add(plugin.module, plugin.category, plugin.position);
                    });
                }

                pluginLoader.load()
                    .then(function () {
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
        }
    };

    return runnerController;
});
