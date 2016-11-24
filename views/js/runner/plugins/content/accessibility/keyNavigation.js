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
 * Test Runner Content Plugin : Navigate through the item focusable elements using the keyboard
 *
 * @author Jean-Sébastien Conan <jean-sebastien.conan@vesperiagroup.com>
 */
define([
    'jquery',
    'lodash',
    'util/shortcut',
    'util/namespace',
    'taoTests/runner/plugin',
    'css!taoQtiTestCss/plugins/key-navigation'
], function ($, _, shortcut, namespaceHelper, pluginFactory) {
    'use strict';

    /**
     * Returns the configured plugin
     */
    return pluginFactory({

        name: 'keyNavigation',

        /**
         * Initialize the plugin (called during runner's init)
         */
        init: function init() {
            var self = this;
            var testRunner = this.getTestRunner();
            var testData = testRunner.getTestData() || {};
            var testConfig = testData.config || {};
            var pluginShortcuts = (testConfig.shortcuts || {})[this.getName()] || {};
            var focusables = [];
            var count = 1;
            var cursor = null;

            /**
             * Gets the tabindex of the currently selected focusable element
             */
            function findCurrentIndex() {
                var $content = testRunner.getAreaBroker().getContentArea();
                var isFocused = false;
                var $input;

                if (document.activeElement && $.contains($content.get(0), document.activeElement)) {
                    // try to find the focused element within the known list of focusable elements
                    _.forEach(focusables, function(focusable, index) {
                        if (document.activeElement === focusable) {
                            cursor = index;
                            isFocused = true;
                            return false;
                        }
                    });
                }

                if (!isFocused) {
                    // from the current cursor retrieve the related interaction, then find the selected focusable element
                    $input = $(':input:eq(' + (cursor || 0) +')', $content).closest('.qti-interaction').find(':checked');
                    if ($input.length) {
                        _.forEach(focusables, function(focusable, index) {
                            if ($input.is(focusable)) {
                                cursor = index;
                                isFocused = true;
                                return false;
                            }
                        });
                    }
                }

                if (!isFocused) {
                    cursor = null;
                }
            }

            /**
             * Select the previous item focusable element
             */
            function previousFocusable() {
                findCurrentIndex();
                if (_.isNumber(cursor)) {
                    cursor = (cursor + count - 1) % count;
                } else {
                    cursor = count - 1;
                }
                if (focusables[cursor]) {
                    focusables[cursor].focus();
                }
            }

            /**
             * Select the next item focusable element
             */
            function nextFocusable() {
                findCurrentIndex();
                if (_.isNumber(cursor)) {
                    cursor = (cursor + 1) % count;
                    if (focusables[cursor]) {
                        focusables[cursor].focus();
                    }
                } else {
                    cursor = 0;
                    //find the first input
                    _.forEach(focusables, function(focusable, index){
                        if(focusable.nodeName !== 'IMG'){
                            cursor = index;
                            focusable.focus();
                            return false;
                        }
                    });
                }

            }

            if (testConfig.allowShortcuts) {
                shortcut.add(namespaceHelper.namespaceAll(pluginShortcuts.previous, this.getName(), true), function () {
                    testRunner.trigger('previous-focusable');
                }, {
                    prevent: true
                });

                shortcut.add(namespaceHelper.namespaceAll(pluginShortcuts.next, this.getName(), true), function () {
                    testRunner.trigger('next-focusable');
                }, {
                    prevent: true
                });
            }

            //start disabled
            this.disable();

            //update plugin state based on changes
            testRunner
                .on('renderitem', function () {

                    var $content = testRunner.getAreaBroker().getContentArea();
                    var index = 1;

                    focusables = $(':input,img', $content).addClass('key-navigation-focusable').each(function(){
                        var $this = $(this);
                        //redistribute focus order
                        $this.attr('tabindex', index);
                        index++;
                    }).toArray();

                    count = focusables.length || 1;
                    cursor = null;
                    self.enable();
                })
                .on('unloaditem', function () {
                    self.disable();
                })
                .on('previous-focusable', function() {
                    console.log('aaa');
                    if (self.getState('enabled')) {
                        previousFocusable();
                    }
                })
                .on('next-focusable', function() {
                    if (self.getState('enabled')) {
                        nextFocusable();
                    }
                });
        },

        /**
         * Called during the runner's render phase
         */
        render: _.noop,

        /**
         * Called during the runner's destroy phase
         */
        destroy: function destroy() {
            shortcut.remove('.' + this.getName());
        }
    });
});
