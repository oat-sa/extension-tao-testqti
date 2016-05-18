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
    'i18n',
    'ui/hider',
    'ui/calculator',
    'taoTests/runner/plugin',
    'tpl!taoQtiTest/runner/plugins/navigation/button'
], function ($, __, hider, calculator, pluginFactory, buttonTpl) {
    'use strict';

    /**
     * Returns the configured plugin
     */
    return pluginFactory({

        name: 'calculator',

        /**
         * Initialize the plugin (called during runner's init)
         */
        init: function init() {
            
        },

        /**
         * Called during the runner's render phase
         */
        render: function render() {
            
            var self = this;
            var testRunner = this.getTestRunner();

            /**
             * Is calculator activated ? if not, then we hide the plugin
             */
            function togglePlugin() {
                var context = testRunner.getTestContext();
                //to be activated with the special category x-tao-option-calculator
                if (context.options.calculator) {//allow calculator
                    self.show();
                } else {
                    self.hide();
                }
            }
            
            //build element (detached)
            this.$button = $(buttonTpl({
                control: 'calculator',
                title: __('Open Calculator'),
                icon: 'maths',
                text: __('Calculator')
            }));
            
            this.$calculator = $('<div class="widget-calculator">');
            
            ///build calculator widget
            var calc = calculator({
                renderTo: this.$calculator,
                replace: true,
                draggableContainer : $('.test-runner-sections')[0],
                width : 280,
                height : 360,
                top : $(window).height() - 470
            });
            calc.hide();
            
            //attach behavior
            this.$button.on('click', function (e) {
                
                //prevent action if the click is made inside the form which is a sub part of the button
                if ($(e.target).closest('.widget-container').length) {
                    return;
                }

                e.preventDefault();

                if (self.getState('enabled') !== false) {
                    //lazy loading...
                    
                    //just show/hide the calculator widget
                    if (calc.is('hidden')) {
                        calc.show();
                    }else{
                        calc.hide();
                    }
                }
            });

            //start disabled
            togglePlugin();
            this.disable();

            //update plugin state based on changes
            testRunner
                .on('loaditem', togglePlugin)
                .on('renderitem', function () {
                    self.enable();
                })
                .on('unloaditem', function () {
                    self.disable();
                    calc.hide();
                    calc.reset();
                });
                
            this.getAreaBroker().getToolboxArea().append(this.$button);
            this.getAreaBroker().getPanelArea().append(this.$calculator);
        },

        /**
         * Called during the runner's destroy phase
         */
        destroy: function destroy() {
            this.$button.remove();
        },

        /**
         * Enable the button
         */
        enable: function enable() {
            this.$button.removeProp('disabled')
                .removeClass('disabled');
        },

        /**
         * Disable the button
         */
        disable: function disable() {
            hider.hide(this.$form);
            this.$button.prop('disabled', true)
                .addClass('disabled');
        },

        /**
         * Show the button
         */
        show: function show() {
            hider.show(this.$button);
        },

        /**
         * Hide the button
         */
        hide: function hide() {
            hider.hide(this.$form);
            hider.hide(this.$button);
        }
    });
});
