
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
 * Copyright (c) 2016 (original work) Open Assessment Technologies SA;
 */

/**
 * Area Masking Plugin
 *
 * @author Bertrand Chevrier <bertrand@taotesting.com>
 */
define([
    'jquery',
    'lodash',
    'i18n',
    'ui/hider',
    'util/shortcut',
    'util/namespace',
    'taoTests/runner/plugin',
    'taoQtiTest/runner/plugins/tools/areaMasking/mask'
], function ($, _, __, hider, shortcut, namespaceHelper, pluginFactory, maskComponent){
    'use strict';

    /**
     * The public name of the plugin
     * @type {String}
     */
    var pluginName = 'area-masking';

    /**
     * The prefix of actions triggered through the event loop
     * @type {String}
     */
    var actionPrefix = 'tool-' + pluginName + '-';

    /**
     * Some default options for the plugin
     * @type {Object}
     */
    var defaultConfig = {
        max : 5,
        foo : true
    };

    /**
     * Returns the configured plugin
     */
    return pluginFactory({

        name: pluginName,

        /**
         * Initialize the plugin (called during runner's init)
         */
        init : function init(){
            var self = this;

            var testRunner = this.getTestRunner();
            var $container = testRunner.getAreaBroker().getContentArea().parent();
            var testConfig = testRunner.getTestData().config || {};
            var config     = _.defaults(_.clone((testConfig.plugins || {})[pluginName]) || {}, defaultConfig);
            var pluginShortcuts = (testConfig.shortcuts || {})[pluginName] || {};

            function addMask() {
                maskComponent()
                    .on('render', function(){
                        self.masks.push(this);
                        self.button.turnOn();

                        /**
                         * @event areaMasking#maskadd
                         */
                        self.trigger('maskadd');
                    })
                    .on('destroy', function(){
                        self.masks = _.without(self.masks, this);
                        if(self.masks.length < config.max){
                            self.enable();
                        }
                        if (self.masks.length === 0) {
                            self.button.turnOff();
                            self.trigger('close');
                        }

                        /**
                         * @event areaMasking#maskclose
                         */
                        self.trigger('maskclose');
                    })
                    .init({
                        x : self.masks.length * 10,
                        y : self.masks.length * 10
                    })
                    .render($container);
            }

            //keep a ref to all masks
            this.masks = [];

            // register the element in the Toolbox
            this.button = this.getAreaBroker().getToolbox().createEntry({
                control : 'area-masking',
                text : __('Masking'),
                title : __('Covers parts of the item'),
                icon : 'eye-slash'
            });

            //add a new mask each time the button is pressed
            this.button.on('click', function (e){
                e.preventDefault();
                testRunner.trigger(actionPrefix + 'toggle');
            });

            // handle the plugin's shortcuts
            if (testConfig.allowShortcuts) {
                _.forEach(pluginShortcuts, function (command, key) {
                    shortcut.add(namespaceHelper.namespaceAll(command, pluginName, true), function () {
                        // just fire the action using the event loop
                        testRunner.trigger(actionPrefix + key);
                    }, {
                        avoidInput: true
                    });
                });
            }

            //start disabled
            this.disable();

            /**
             * Checks if the plugin is currently available
             * @returns {Boolean}
             */
            function isEnabled() {
                var context = testRunner.getTestContext(),
                    options = context.options || {};
                //to be activated with the special category x-tao-option-areaMasking
                return !!options.areaMasking;
            }

            /**
             * Is plugin activated ? if not, then we hide the plugin
             */
            function togglePlugin() {
                if (isEnabled()) {
                    self.show();
                } else {
                    self.hide();
                }
            }
            //update plugin state based on changes
            testRunner
                .on('loaditem', togglePlugin)
                .on('enabletools renderitem', function (){
                    self.enable();
                })
                .on('disabletools unloaditem', function (){
                    self.disable();
                    //remove all masks
                    _.invoke(self.masks, 'destroy');
                })
                // commands that controls the plugin
                .on(actionPrefix + 'toggle', function () {
                    if (isEnabled()) {
                        if (self.masks.length === 0) {
                            self.trigger('open');
                        }
                        if (self.masks.length < config.max) {
                            addMask();
                        } else if (config.max === 1) {
                            _.invoke(self.masks, 'destroy');
                        }
                    }
                });

        },

        /**
         * Called during the runner's destroy phase
         */
        destroy : function destroy(){
            shortcut.remove('.' + pluginName);
        },

        /**
         * Enable the button
         */
        enable : function enable(){
            this.button.enable();
        },

        /**
         * Disable the button
         */
        disable : function disable(){
            this.button.disable();
        },

        /**
         * Show the button
         */
        show : function show(){
            this.button.show();
        },

        /**
         * Hide the button
         */
        hide : function hide(){
            this.button.hide();
        }
    });
});
