
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
 *
 *
 * @author Bertrand Chevrier <bertrand@taotesting.com>
 */
define([
    'jquery',
    'lodash',
    'i18n',
    'ui/hider',
    'taoTests/runner/plugin',
    'taoQtiTest/runner/plugins/tools/answerMasking/mask',
    'tpl!taoQtiTest/runner/plugins/navigation/button'
], function ($, _, __, hider, pluginFactory, maskComponent, buttonTpl){
    'use strict';

    /**
     * Returns the configured plugin
     */
    return pluginFactory({

        name : 'answerMasking',

        /**
         * Initialize the plugin (called during runner's init)
         */
        init : function init(){
            var self = this;
            var testRunner = this.getTestRunner();

            //build element (detached)
            this.$button = $(buttonTpl({
                control : 'answer-masking',
                title : __('Mask areas of the screen'),
                icon : 'eye-slash'
            }));

            //attach behavior
            this.$button.on('click', function (e){
                e.preventDefault();

                maskComponent()
                    .init()
                    .render(
                        testRunner.getAreaBroker().getItemContentArea()
                    );
            });

            //start disabled
            this.disable();

            //update plugin state based on changes
            testRunner
                .on('loaditem', function (){

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
