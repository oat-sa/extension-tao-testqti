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
], function ($, __, hider, calculatorFactory, pluginFactory, buttonTpl){
    'use strict';

    var _default = {
        height : 360,
        width : 240
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
            
            /**
             * Is calculator activated ? if not, then we hide the plugin
             */
            function togglePlugin(){
                var context = testRunner.getTestContext();
                //to be activated with the special category x-tao-option-calculator
                if(context.options.calculator){//allow calculator
                    self.show();
                }else{
                    self.hide();
                }
            }

            //build element (detached)
            this.$button = $(buttonTpl({
                control : 'calculator',
                title : __('Open Calculator'),
                icon : 'maths',
                text : __('Calculator')
            }));
            this.$calculatorContainer = $('<div class="widget-calculator">');
            
            //init calculator instance var, it will be created only necessary
            this.calculator = null;

            //attach behavior
            this.$button.on('click', function (e){
                
                //get the offset of the button to position the calculator widget close to it
                var offset = $(this).offset();

                //prevent action if the click is made inside the form which is a sub part of the button
                if($(e.target).closest('.widget-container').length){
                    return;
                }

                e.preventDefault();

                if(self.getState('enabled') !== false){
                    if(self.calculator){
                        //just show/hide the calculator widget
                        if(self.calculator.is('hidden')){
                            self.calculator.show();
                        }else{
                            self.calculator.hide();
                        }
                    }else{
                        //build calculator widget
                        self.calculator = calculatorFactory({
                            renderTo : self.$calculatorContainer,
                            replace : true,
                            draggableContainer : areaBroker.getContainer().find('.test-runner-sections')[0],
                            width : _default.width,
                            height : _default.height,
                            top : offset.top - _default.height - 40,
                            left : offset.left
                        });
                    }
                }
            });

            //start disabled
            togglePlugin();
            this.disable();

            //update plugin state based on changes
            testRunner
                .on('loaditem', togglePlugin)
                .on('renderitem', function (){
                    self.enable();
                })
                .on('unloaditem', function (){
                    self.disable();
                    if(self.calculator){
                        //destroy calculator to create a new instance of calculator each time
                        self.calculator.destroy();
                        self.calculator = null;
                    }
                });
        },
        /**
         * Called during the runner's render phase
         */
        render : function render(){
            var areaBroker = this.getAreaBroker();    
            areaBroker.getToolboxArea().append(this.$button);
            areaBroker.getPanelArea().append(this.$calculatorContainer);
        },
        /**
         * Called during the runner's destroy phase
         */
        destroy : function destroy(){
            this.$button.remove();
            this.$calculatorContainer.remove();
            if(this.calculator){
                this.calculator.destroy();
            }
        },
        /**
         * Enable the button
         */
        enable : function enable(){
            this.$button.removeProp('disabled')
                .removeClass('disabled');
        },
        /**
         * Disable the button
         */
        disable : function disable(){
            this.$button.prop('disabled', true)
                .addClass('disabled');
            if(this.calculator){
                this.calculator.hide();
            }
        },
        /**
         * Show the button
         */
        show : function show(){
            hider.show(this.$button);
        },
        /**
         * Hide the button
         */
        hide : function hide(){
            hider.hide(this.$button);
            if(this.calculator){
                this.calculator.hide();
            }
        }
    });
});
