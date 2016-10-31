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
 * Test Runner Navigation Plugin : Previous
 *
 * @author Bertrand Chevrier <bertrand@taotesting.com>
 */
define([
    'jquery',
    'i18n',
    'ui/hider',
    'taoTests/runner/plugin',
    'util/shortcut',
    'tpl!taoQtiTest/runner/plugins/navigation/button'
], function ($, __, hider, pluginFactory, shortcuts, buttonTpl){
    'use strict';

    /**
     * Returns the configured plugin
     */
    return pluginFactory({

        name : 'previous',

        /**
         * Initialize the plugin (called during runner's init)
         */
        init : function init(){
            var self = this;

            var testRunner = this.getTestRunner();
            var testData = testRunner.getTestData();
            var testConfig = testData && testData.config;

            /**
             * Can we move backward ? if not, then we hide the plugin
             */
            var toggle = function toggle(){
                if(self.canDoPrevious()){
                    self.show();
                } else {
                    self.hide();
                }
            };

            //build element (detached)
            this.$element =  $(buttonTpl({
                control : 'move-backward',
                title   : __('Submit and go to the previous item'),
                icon    : 'backward',
                text    : __('Previous')
            }));

            //attach behavior
            function doPrevious(previousItemWarning) {
                var enable = _.bind(self.enable, self);
                var context = testRunner.getTestContext();

                previousItemWarning = previousItemWarning || false;

                if(self.getState('enabled') !== false){
                    self.disable();

                    if (previousItemWarning && context.remainingAttempts !== -1) {
                        var message = __('You are about to go to the next item. You only have a limited number of attempts to answer the current item (%s remaining). Click OK to continue and go to the next item.', context.remainingAttempts);
                        if (context.remainingAttempts === 0) {
                            message = __('You are about to go to the next item. You will not be able to come back to this item later. Click OK to continue and go to the next item.');
                        }

                        testRunner.trigger(
                            'confirm.previous',
                            message,
                            testRunner.previous, // if the test taker accept
                            enable  // if the test taker refuse
                        );

                    } else {
                        testRunner.previous();
                    }
                }
            }

            this.$element.on('click', function(e){
                e.preventDefault();
                doPrevious();
            });

            if(this.canDoPrevious() && testConfig && testConfig.allowShortcuts){
                shortcuts.add('K.previous', function(e) {
                    if (self.getState('enabled') === true) {
                        e.preventDefault();
                        doPrevious(true);
                    }
                }, { avoidInput: true });
            }

            //start disabled
            toggle();
            self.disable();

            //update plugin state based on changes
            testRunner
                .on('loaditem', toggle)
                .on('enablenav', function(){
                    self.enable();
                })
                .on('disablenav', function(){
                    self.disable();
                });
        },

        /**
         * Check if the "Previous" functionality should be available or not
         */
        canDoPrevious : function canDoPrevious() {
            var testRunner = this.getTestRunner();
            var context = testRunner.getTestContext();
            return !context.isLinear && context.canMoveBackward;
        },

        /**
         * Called during the runner's render phase
         */
        render : function render(){
            var $container = this.getAreaBroker().getNavigationArea();
            $container.append(this.$element);
        },

        /**
         * Called during the runner's destroy phase
         */
        destroy : function destroy (){
            this.$element.remove();
        },

        /**
         * Enable the button
         */
        enable : function enable (){
            this.$element.removeProp('disabled')
                         .removeClass('disabled');
        },

        /**
         * Disable the button
         */
        disable : function disable (){
            this.$element.prop('disabled', true)
                         .addClass('disabled');
        },

        /**
         * Show the button
         */
        show: function show(){
            hider.show(this.$element);
        },

        /**
         * Hide the button
         */
        hide: function hide(){
            hider.hide(this.$element);
        }
    });
});
