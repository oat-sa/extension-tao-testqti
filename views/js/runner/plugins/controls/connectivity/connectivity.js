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
    'i18n',
    'ui/waitingDialog/waitingDialog',
    'taoTests/runner/plugin',
    'tpl!taoQtiTest/runner/plugins/controls/connectivity/connectivity'
], function ($, __, waitingDialog, pluginFactory, connectivityTpl) {
    'use strict';

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
                }
            })
            .on('reconnect', function reconnect() {
                if (testRunner.getState('disconnected')) {
                    testRunner.setState('disconnected', false);
                    testRunner.trigger('reconnect');
                    self.$element.removeClass('disconnected').addClass('connected');
                }
            });

            testRunner.before('error', function(e, err) {
                var dialog;

                // detect and prevent connectivity errors
                if (proxy.isConnectivityError(err)){
                    return false;
                }

                //offline navigation error, we pause the test
                if (proxy.isOffline()) {
                    if(!waiting){
                        waiting = true;

                        dialog = waitingDialog({
                            message : __('You are encountering a prolonged connectivity loss'),
                            waitContent : __('Please wait while we try to restore the connection.'),
                            proceedContent : __('The connection seems to be back, please proceed')
                        })
                        .on('proceed', function(){
                            testRunner
                                .trigger('pause', {
                                    reasons : {
                                        category : __('technical'),
                                        subCategory : __('network')
                                    }
                                });
                        })
                        .on('render', function(){
                            proxy
                                .off('reconnect.waiting')
                                .on('reconnect.waiting', function(){
                                    waiting = false;
                                    dialog.endWait();
                                });
                        });
                    }

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
