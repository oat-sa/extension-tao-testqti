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
 * Test Runner Tool Plugin : Calculator
 *
 * @author Sam <sam@taotesting.com>
 */
define([
    'jquery',
    'lodash',
    'i18n',
    'ui/hider',
    'ui/calculator',
    'util/shortcut',
    'util/namespace',
    'taoTests/runner/plugin'
], function ($, _, __, hider, calculatorFactory, shortcut, namespaceHelper, pluginFactory){
    'use strict';

    var _default = {
        height : 360,
        width : 240,
        top : 50,
        left : 10,
        stackingScope: 'test-runner'
    };

    /**
     * Returns the configured plugin
     */
    return pluginFactory({
        name : 'calculator',
        /**
         * Initialize the plugin (called during runner's init)
         */
        init : function init(){
            var self = this;
            var testRunner = this.getTestRunner();
            var areaBroker = this.getAreaBroker();
            var testData = testRunner.getTestData() || {};
            var testConfig = testData.config || {};
            var pluginsConfig = testConfig.plugins || {};
            var config = pluginsConfig.calculator || {};
            var pluginShortcuts = (testConfig.shortcuts || {})[this.getName()] || {};

            /**
             * Checks if the plugin is currently available
             * @returns {Boolean}
             */
            function isEnabled() {
                var context = testRunner.getTestContext() || {},
                    options = context.options || {};

                //to be activated with the special category x-tao-option-calculator
                return !!options.calculator;
            }

            /**
             * Is calculator activated ? if not, then we hide the plugin
             */
            function togglePlugin() {
                if (isEnabled()) {//allow calculator
                    self.show();
                } else {
                    self.hide();
                }
            }

            /**
             * Build the calculator component
             * @param {Function} [calcTpl] - an optional alternative template for the calculator
             */
            function buildCalculator(calcTpl){
                self.calculator = calculatorFactory(_.defaults({
                    renderTo: self.$calculatorContainer,
                    replace: true,
                    draggableContainer: areaBroker.getContainer(),
                    alternativeTemplate : calcTpl || null
                }, _default)).on('show', function () {
                    self.trigger('open');
                    self.button.turnOn();
                }).on('hide', function () {
                    self.trigger('close');
                    self.button.turnOff();
                }).show();
            }

            /**
             * Show/hide the calculator
             */
            function toggleCalculator() {
                if (self.getState('enabled') !== false) {
                    if (self.calculator) {
                        //just show/hide the calculator widget
                        if (self.calculator.is('hidden')) {
                            self.calculator.show();
                        } else {
                            self.calculator.hide();
                        }
                    } else {
                        //build calculator widget
                        if(config.template){
                            require(['tpl!' + config.template.replace(/\.tpl$/, '')], function(calcTpl){
                                buildCalculator(calcTpl);
                            }, function(){
                                //in case of error, display the default calculator:
                                buildCalculator();
                            });
                        }else{
                            buildCalculator();
                        }

                    }
                }
            }

            //build element (detached)
            this.button = this.getAreaBroker().getToolbox().createEntry({
                control : 'calculator',
                title : __('Open Calculator'),
                icon : 'table',
                text : __('Calculator')
            });
            this.$calculatorContainer = $('<div class="widget-calculator">');

            //init calculator instance var, it will be created only necessary
            this.calculator = null;

            //attach behavior
            this.button.on('click', function (e){
                //prevent action if the click is made inside the form which is a sub part of the button
                if($(e.target).closest('.widget-calculator').length){
                    return;
                }

                e.preventDefault();
                testRunner.trigger('tool-calculator');
            });

            if (testConfig.allowShortcuts) {
                if (pluginShortcuts.toggle) {
                    shortcut.add(namespaceHelper.namespaceAll(pluginShortcuts.toggle, this.getName(), true), function () {
                        testRunner.trigger('tool-calculator');
                    }, {
                        avoidInput: true,
                        allowIn: '.widget-calculator'
                    });
                }
            }

            //start disabled
            togglePlugin();
            this.disable();

            //update plugin state based on changes
            testRunner
                .on('loaditem', togglePlugin)
                .on('enabletools renderitem', function (){
                    self.enable();
                })
                .on('disabletools unloaditem', function (){
                    self.disable();
                    if(self.calculator){
                        //destroy calculator to create a new instance of calculator each time
                        self.calculator.destroy();
                        self.calculator = null;
                    }
                })
                .on('tool-calculator', function () {
                    if (isEnabled()) {
                        toggleCalculator();
                    }
                });
        },
        /**
         * Called during the runner's render phase
         */
        render : function render(){
            var areaBroker = this.getAreaBroker();
            areaBroker.getContainer().append(this.$calculatorContainer);
        },
        /**
         * Called during the runner's destroy phase
         */
        destroy : function destroy(){
            shortcut.remove('.' + this.getName());

            this.$calculatorContainer.remove();
            if(this.calculator){
                this.calculator.destroy();
            }
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
            if(this.calculator){
                this.calculator.hide();
            }
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
            if(this.calculator){
                this.calculator.hide();
            }
        }
    });
});
