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
    'taoQtiTest/runner/helpers/map',
    'tpl!taoQtiTest/runner/plugins/templates/button'
], function ($, _, __, hider, pluginFactory, shortcut, namespaceHelper, navigationHelper, mapHelper, buttonTpl){
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
                var previousSection;
                var previousPart;

                // check TestMap if empty
                if( _.isPlainObject(testMap) && _.size(testMap) === 0){
                    return false;
                }

                //first item of the test
                if (navigationHelper.isFirst(testMap, context.itemIdentifier)) {
                    return false;
                }

                //first item of a section
                if (navigationHelper.isFirstOf(testMap, context.itemIdentifier, 'section')) {

                    //when entering an adaptive section,
                    //you can't leave the section from the beginning
                    if(context.isCatAdaptive){
                        return false;
                    }

                    //if the previous section is adaptive or a timed section
                    previousSection = mapHelper.getItemSection(testMap, context.itemPosition - 1);
                    if(previousSection.isCatAdaptive || (previousSection.timeConstraint && !context.options.noExitTimedSectionWarning) ){
                        return false;
                    }
                }

                if (navigationHelper.isFirstOf(testMap, context.itemIdentifier, 'part')) {

                    //if the previous part is linear, we don't enter it too
                    previousPart = mapHelper.getItemPart(testMap, context.itemPosition - 1);
                    if(previousPart.isLinear){
                        return false;
                    }

                }
                return context.isLinear === false && context.canMoveBackward === true;
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

                function enableNav() {
                    testRunner.trigger('disablenav');
                }

                testRunner.trigger('disablenav');

                if(self.getState('enabled') !== false){
                    if (previousItemWarning && context.remainingAttempts !== -1) {
                        testRunner.trigger(
                            'confirm.previous',
                            __('You are about to go to the previous item. Click OK to continue and go to the previous item.'),
                            testRunner.previous, // if the test taker accept
                            enableNav()          // if he refuses
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
                shortcut.add(namespaceHelper.namespaceAll(pluginShortcuts.trigger, this.getName(), true), function() {
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
                .on('hidenav', function(){
                    self.hide();
                })
                .on('shownav', function(){
                    self.show();
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
