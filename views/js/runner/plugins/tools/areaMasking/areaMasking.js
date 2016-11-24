
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
    'taoTests/runner/plugin',
    'taoQtiTest/runner/plugins/tools/areaMasking/mask',
    'tpl!taoQtiTest/runner/plugins/templates/button'
], function ($, _, __, hider, pluginFactory, maskComponent, buttonTpl){
    'use strict';

    /**
     * Returns the configured plugin
     */
    return pluginFactory({

        name : 'area-masking',

        /**
         * Initialize the plugin (called during runner's init)
         */
        init : function init(){
            var self = this;

            var testRunner = this.getTestRunner();
            var $container = testRunner.getAreaBroker().getContentArea().parent();

            //keep a ref to all masks
            this.masks = [];

            //build the control button
            this.$button = $(buttonTpl({
                control : 'area-masking',
                title : __('Covers parts of the item'),
                icon : 'eye-slash'
            }));

            //add a new mask each time the button is pressed
            this.$button.on('click', function (e){
                e.preventDefault();

                maskComponent()
                    .on('render', function(){

                        self.masks.push(this);

                        /**
                         * @event areaMaksing#maskadd
                         */
                        self.trigger('maskadd');
                    })
                    .on('destroy', function(){

                        self.masks = _.without(self.masks, this);

                        /**
                         * @event areaMaksing#maskclose
                         */
                        self.trigger('maskclose');
                    })
                    .init({
                        x : self.masks.length * 10,
                        y : self.masks.length * 10
                    })
                    .render($container);
            });

            //start disabled
            this.disable();

            //update plugin state based on changes
            testRunner
                .on('unloaditem', function (){
                    //remove all masks
                    _.invoke(self.masks, 'destroy');
                    self.masks = [];
                })
                .on('enabletools renderitem', function (){
                    self.enable();
                })
                .on('disabletools unloaditem', function (){
                    self.disable();
                });
        },

        /**
         * Called during the runner's render phase
         */
        render : function render(){
            this.getAreaBroker().getToolboxArea().append(this.$button);
        },

        /**
         * Called during the runner's destroy phase
         */
        destroy : function destroy(){
            this.$button.remove();
        },

        /**
         * Enable the button
         */
        enable : function enable(){
            this.$button
                .removeProp('disabled')
                .removeClass('disabled');
        },

        /**
         * Disable the button
         */
        disable : function disable(){
            this.$button
                .prop('disabled', true)
                .addClass('disabled');
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
        }
    });
});
