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
 * @author Jean-Sébastien Conan <jean-sebastien.conan@vesperiagroup.com>
 */
define([
    'jquery',
    'lodash',
    'i18n',
    'core/promise',
    'core/polling',
    'ui/waitingDialog/waitingDialog',
    'taoTests/runner/plugin',
    'tpl!taoQtiTest/runner/plugins/controls/connectivity/connectivity'
], function ($, _, __, Promise, pollingFactory, waitingDialog, pluginFactory, connectivityTpl) {
    'use strict';

    /**
     * Connectivity check interval, in ms
     * @type {Number}
     */
    var checkInterval = 30 * 1000;

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
            var self = this;

            var waiting    = false;

            var testRunner = this.getTestRunner();
            var proxy      = testRunner.getProxy();

            /**
             * Display the waiting dialog, while waiting the connection to be back
             * @param {String} [messsage] - additional message for the dialog
             * @returns {Promise} resolves once the wait is over and the user click on 'proceed'
             */
            var displayWaitingDialog = function displayWaitingDialog(message){

                var dialog;
                return new Promise(function(resolve) {
                    if(!waiting){
                        waiting = true;

                        //if a pause event occurs while waiting,
                        //we also wait the connection to be back
                        testRunner.before('pause.waiting', function(){
                            return new Promise(function(pauseResolve){
                                proxy.off('reconnect.pausing')
                                    .after('reconnect.pausing', pauseResolve);
                            });
                        });

                        //creates the waiting modal dialog
                        dialog = waitingDialog({
                            message : __('You are encountering a prolonged connectivity loss. ') + message,
                            waitContent : __('Please wait while we try to restore the connection.'),
                            proceedContent : __('The connection seems to be back, please proceed')
                        })
                        .on('proceed', function(){
                            resolve();
                        })
                        .on('render', function(){
                            proxy
                                .off('reconnect.waiting')
                                .after('reconnect.waiting', function(){
                                    testRunner.off('pause.waiting');
                                    waiting = false;
                                    dialog.endWait();
                                });
                        });
                    }
                });
            };

            //Last chance to check the connection,
            //by regular polling on the "up" signal
            this.polling = pollingFactory({
                action: function action () {
                    testRunner.getProxy()
                        .telemetry(testRunner.getTestContext().itemIdentifier, 'up')
                        .catch(_.noop);
                },
                interval: checkInterval,
                autoStart: false
            });

            //create the indicator
            this.$element = $(connectivityTpl({
                state: proxy.isOnline() ? 'connected' : 'disconnected'
            }));

            //the Proxy is the only one to know something about connectivity
            proxy.on('disconnect', function disconnect(source) {
                if (!testRunner.getState('disconnected')) {
                    testRunner.setState('disconnected', true);
                    testRunner.trigger('disconnect', source);
                    self.$element.removeClass('connected').addClass('disconnected');
                    self.polling.start();
                }
            })
            .on('reconnect', function reconnect() {
                if (testRunner.getState('disconnected')) {
                    testRunner.setState('disconnected', false);
                    testRunner.trigger('reconnect');
                    self.$element.removeClass('disconnected').addClass('connected');
                    self.polling.stop();
                }
            });

            //intercept tries to leave while offline
            //this could be caused by pauses for example.
            //If caused by an action like exitTest it will be handled
            //by navigation errors (see below)
            testRunner.before('leave', function(e, data){
                if (proxy.isOffline()) {
                    displayWaitingDialog(data.message)
                        .then(function(){
                            testRunner.trigger('leave', data);
                        })
                        .catch(function(generalErr){
                            testRunner.trigger('error', generalErr);
                        });

                    return false;
                }
            });

            //intercept offline navigation errors
            testRunner.before('error', function(e, err) {

                // detect and prevent connectivity errors
                if (proxy.isConnectivityError(err)){
                    return false;
                }

                if (proxy.isOffline()) {
                    displayWaitingDialog(err.message)
                        .then(function(){
                            if(err.type === 'nav'){
                                testRunner.loadItem(testRunner.getTestContext().itemIdentifier);
                            }
                            if(err.type === 'finish'){
                                testRunner.finish();
                            }
                            if(err.type === 'pause'){
                                testRunner.trigger('pause', {
                                    reasons: err.data && err.data.reasons,
                                    message : err.data && err.data.comment
                                });
                            }
                        })
                        .catch(function(generalErr){
                            testRunner.trigger('error', generalErr);
                        });
                    return false;
                }
            });
        },

        /**
         * Called during the runner's render phase
         */
        render : function render(){
            var $container = this.getAreaBroker().getControlArea();
            $container.append(this.$element);
        }
    });
});
