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
    'lodash',
    'i18n',
    'ui/hider',
    'taoTests/runner/plugin',
    'util/shortcut',
    'util/namespace',
    'taoQtiTest/runner/helpers/navigation',
    'tpl!taoQtiTest/runner/plugins/templates/button'
], function ($, _, __, hider, pluginFactory, shortcut, namespaceHelper, navigationHelper, buttonTpl){
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
            var testConfig = testData.config || {};
            var pluginShortcuts = (testConfig.shortcuts || {})[this.getName()] || {};

            /**
             * Check if the "Previous" functionality should be available or not
             */
            var canDoPrevious = function canDoPrevious() {
                var testMap = testRunner.getTestMap();
                var context = testRunner.getTestContext();
                var canMove = !navigationHelper.isFirst(testMap, context.itemIdentifier);

                //when entering an adaptive section,
                //you can't leave the section from the beginning
                if (canMove && context.isCatAdaptive) {
                    canMove = !navigationHelper.isFirstOf(testMap, context.itemIdentifier, 'section');
                }
                return canMove && context.isLinear === false && context.canMoveBackward === true;
            };

            /**
             * Hide the plugin if the Previous functionality shouldn't be available
             */
            var toggle = function toggle(){
                if(canDoPrevious()){
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
                var context = testRunner.getTestContext();

                function enable() {
                    testRunner.trigger('enablenav enabletools');
                }

                if(self.getState('enabled') !== false){
                    testRunner.trigger('disablenav disabletools');

                    if (previousItemWarning && context.remainingAttempts !== -1) {
                        testRunner.trigger(
                            'confirm.previous',
                            __('You are about to go to the previous item. Click OK to continue and go to the previous item.'),
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
                testRunner.trigger('nav-previous');
            });

            if(testConfig.allowShortcuts && pluginShortcuts.trigger){
                shortcut.add(namespaceHelper.namespaceAll(pluginShortcuts.trigger, this.getName(), true), function(e) {
                    if (canDoPrevious() && self.getState('enabled') === true) {
                        testRunner.trigger('nav-previous', [true]);
                    }
                }, {
                    avoidInput: true,
                    prevent: true
                });
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
                })
                .on('nav-previous', function(previousItemWarning){
                    doPrevious(previousItemWarning);
                });
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
            shortcut.remove('.' + this.getName());
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
