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
    'core/promise',
    'ui/feedback',
    'layout/loading-bar',

    'taoTests/runner/runner',
    'taoQtiTest/runner/provider/qti',
    'taoTests/runner/proxy',

    'taoQtiTest/runner/proxy/qtiServiceProxy',
    'taoQtiTest/runner/plugins/controls/title/title',
    'taoQtiTest/runner/plugins/controls/progressbar/progressbar',
    'taoQtiTest/runner/plugins/navigation/next',
    'taoQtiTest/runner/plugins/navigation/previous',
    'taoQtiTest/runner/plugins/navigation/nextSection',
    'taoQtiTest/runner/plugins/navigation/skip',

    'css!taoQtiTestCss/new-test-runner'
], function(
    $, _, Promise, feedback, loadingBar,
    runner, qtiProvider, proxy, qtiServiceProxy,
    title, progressbar, next, previous, nextSection, skip
) {
    'use strict';


    /*
     *TODO plugins list, provider registration should be loaded dynamically
     */

    runner.registerProvider('qti', qtiProvider);
    proxy.registerProxy('qtiServiceProxy', qtiServiceProxy);


    var plugins = {
        title       : title,
        progress    : progressbar,
        previous    : previous,
        next        : next,
        skip        : skip,
        nextSection : nextSection
    };

    /**
     * The runner controller
     */
    var runnerController = {

        /**
         * Controller entry point
         * @param {Object} options - options to give to the test runner
         * @param {String} options.testDefinition
         * @param {String} options.testCompilation
         * @param {String} options.serviceCallId
         * @param {String} options.serviceExtension
         * @param {String} options.serviceController
         * @param {String} options.exitUrl
         */
        start : function start(options){

            var config = _.defaults(options || {}, {
                renderTo : $('.runner')
            });

            loadingBar.start();

            //instantiate the QtiTestRunner
            runner('qti', plugins, config)
                .on('error', function(err){

                    loadingBar.stop();

                    //TODO to be replaced by the logger
                    window.console.error(err);

                    feedback().error(err);
                })
                .on('ready', function(){
                    _.defer(function(){
                        $('.runner').removeClass('hidden');
                    });
                })
                .on('unloaditem', function(){
                    loadingBar.start();
                })
                .on('renderitem', function(){
                    loadingBar.stop();
                })
                .on('finish', function(){
                    this.destroy();
                })
                .on('destroy', function(){
                    window.location = config.exitUrl;
                })
                .init();
        }
    };

    return runnerController;
});
