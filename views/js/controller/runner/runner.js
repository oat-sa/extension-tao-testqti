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
    'layout/loading-bar',

    'taoTests/runner/runner',
    'taoQtiTest/runner/provider/qti',
    'taoTests/runner/proxy',
    'taoQtiTest/runner/proxy/qtiServiceProxy',
    'taoQtiTest/runner/plugins/loader',

    'css!taoQtiTestCss/new-test-runner'
], function(
    $, _, __, Promise, loadingBar,
    runner, qtiProvider, proxy, qtiServiceProxy, pluginLoader
) {
    'use strict';


    /*
     *TODO plugins list, provider registration should be loaded dynamically
     */
    runner.registerProvider('qti', qtiProvider);
    proxy.registerProxy('qtiServiceProxy', qtiServiceProxy);


    /**
     * The runner controller
     */
    var runnerController = {

        /**
         * Controller entry point
         *
         * TODO verify required options
         *
         * @param {Object} options - the testRunner options
         * @param {String} options.testDefinition
         * @param {String} options.testCompilation
         * @param {String} options.serviceCallId
         * @param {String} options.serviceController
         * @param {String} options.serviceExtension
         * @param {String} options.exitUrl - the full URL where to return at the final end of the test
         */
        start : function start(options){
            var config = _.defaults(options || {}, {
                renderTo : $('.runner')
            });

            var plugins = pluginLoader.getPlugins();

            //TODO move the loading bar into a plugin
            loadingBar.start();

            //instantiate the QtiTestRunner
            runner('qti', plugins, config)
                .on('error', function(err){

                    loadingBar.stop();

                    //TODO to be replaced by the logger
                    window.console.error(err);

                    if(err && err.type && err.type === 'TestState') {
                        // TODO: test has been closed/suspended => redirect to the index page after message acknowledge
                    }
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

                    //at the end, we are redirected to the exit URL
                    window.location = config.exitUrl;
                })
                .init();
        }
    };

    return runnerController;
});
