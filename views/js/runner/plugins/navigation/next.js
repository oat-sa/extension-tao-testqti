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
 * Test Runner Navigation Plugin : Next
 *
 * @author Bertrand Chevrier <bertrand@taotesting.com>
 */
define([
    'jquery',
    'lodash',
    'i18n',
    'ui/hider',
    'taoTests/runner/plugin',
    'taoQtiTest/runner/plugins/navigation/next/nextWarningHelper',
    'taoQtiTest/runner/helpers/messages',
    'taoQtiTest/runner/helpers/map',
    'taoQtiTest/runner/helpers/stats',
    'util/shortcut',
    'util/namespace',
    'tpl!taoQtiTest/runner/plugins/templates/button'
], function ($, _, __, hider, pluginFactory, nextWarningHelper, messages, mapHelper, statsHelper, shortcut, namespaceHelper, buttonTpl){
    'use strict';

    /**
     * The display of the next button
     */
    var buttonData = {
        next : {
            control : 'move-forward',
            title   : __('Submit and go to the next item'),
            icon    : 'forward',
            text    : __('Next')
        },
        end : {
            control : 'move-end',
            title   : __('Submit and go to the end of the test'),
            icon    : 'fast-forward',
            text    : __('End test')
        }
    };

    /**
     * Create the button based on the current context
     * @param {Object} context - the test context
     * @returns {jQueryElement} the button
     */
    var createElement = function createElement(context){
        var dataType = context.isLast ? 'end' : 'next';
        return $(buttonTpl(buttonData[dataType]));
    };

    /**
     * Update the button based on the context
     * @param {jQueryElement} $element - the element to update
     * @param {Object} context - the test context
     */
    var updateElement = function updateElement($element, context){
        var dataType = context.isLast ? 'end' : 'next';
        if($element.attr('data-control') !== buttonData[dataType].control){

            $element.attr('data-control', buttonData[dataType].control)
                    .attr('title', buttonData[dataType].title)
                    .find('.text').text(buttonData[dataType].text);

            if(dataType === 'next'){
                $element.find('.icon-' + buttonData.end.icon)
                        .removeClass('icon-' + buttonData.end.icon)
                        .addClass('icon-' + buttonData.next.icon);
            } else {
                $element.find('.icon-' + buttonData.next.icon)
                        .removeClass('icon-' + buttonData.next.icon)
                        .addClass('icon-' + buttonData.end.icon);
            }
        }
    };

    /**
     * Returns the configured plugin
     */
    return pluginFactory({
        name : 'next',

        /**
         * Initialize the plugin (called during runner's init)
         */
        init : function init(){
            var self = this;
            var testRunner = this.getTestRunner();
            var testData = testRunner.getTestData();
            var testConfig = testData.config || {};
            var pluginShortcuts = (testConfig.shortcuts || {})[this.getName()] || {};

            //plugin behavior
            /**
             * @param {Boolean} nextItemWarning - enable the display of a warning when going to the next item.
             * Note: the actual display of the warning depends on other conditions (see nextWarningHelper)
             */
            function doNext(nextItemWarning) {
                var context = testRunner.getTestContext(),
                    testOptions = context.options || {};

                var map = testRunner.getTestMap();
                var nextItemPosition = context.itemPosition + 1;

                // x-tao-option-unansweredWarning is a deprecated option whose behavior now matches the one of
                // x-tao-option-nextPartWarning with the unansweredOnly option
                var nextPartWarning = testOptions.nextPartWarning || testOptions.unansweredWarning;
                var unansweredOnly =
                    !testOptions.endTestWarning // this check to avoid an edge case where having both endTestWarning
                                                // and unansweredWarning options would prevent endTestWarning to behave normally
                    && testOptions.unansweredWarning;

                var warningScope = (nextPartWarning) ? 'part' : 'test';


                function enableNav() {
                    testRunner.trigger('enablenav');
                }

                testRunner.trigger('disablenav');

                if (self.getState('enabled') !== false) {
                    var warningHelper = nextWarningHelper({
                        endTestWarning:     testOptions.endTestWarning,
                        isLast:             context.isLast,
                        isLinear:           context.isLinear,
                        nextItemWarning:    nextItemWarning,
                        nextPartWarning:    nextPartWarning,
                        nextPart:           mapHelper.getItemPart(map, nextItemPosition),
                        remainingAttempts:  context.remainingAttempts,
                        testPartId:         context.testPartId,
                        unansweredWarning:  testOptions.unansweredWarning,
                        stats:              statsHelper.getInstantStats(warningScope, testRunner),
                        unansweredOnly:     unansweredOnly
                    });

                    if (warningHelper.shouldWarnBeforeEnd()) {
                        testRunner.trigger(
                            'confirm.endTest',
                            messages.getExitMessage(
                                __('You are about to submit the test. You will not be able to access this test once submitted. Click OK to continue and submit the test.'),
                                warningScope, testRunner),
                            _.partial(triggerNextAction, context), // if the test taker accept
                            enableNav                              // if he refuse
                        );

                    } else if (warningHelper.shouldWarnBeforeNext()) {
                        testRunner.trigger(
                            'confirm.next',
                            __('You are about to go to the next item. Click OK to continue and go to the next item.'),
                            _.partial(triggerNextAction, context), // if the test taker accept
                            enableNav                              // if he refuse
                        );

                    } else {
                        triggerNextAction(context);
                    }
                }
            }

            function triggerNextAction(context) {
                if(context.isLast){
                    self.trigger('end');
                }
                testRunner.next();
            }

            //create the button (detached)
            this.$element = createElement(testRunner.getTestContext());

            //attach behavior
            this.$element.on('click', function(e){
                e.preventDefault();
                testRunner.trigger('nav-next');
            });

            if(testConfig.allowShortcuts && pluginShortcuts.trigger){
                shortcut.add(namespaceHelper.namespaceAll(pluginShortcuts.trigger, this.getName(), true), function(e) {
                    if (self.getState('enabled') === true) {
                        testRunner.trigger('nav-next', true);
                    }
                }, {
                    avoidInput: true,
                    prevent: true
                });
            }

            //disabled by default
            this.disable();

            //change plugin state
            testRunner
                .on('loaditem', function(){
                    updateElement(self.$element, testRunner.getTestContext());
                })
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
                .on('nav-next', function(nextItemWarning) {
                    doNext(nextItemWarning);
                });
        },

        /**
         * Called during the runner's render phase
         */
        render : function render(){

            //attach the element to the navigation area
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
