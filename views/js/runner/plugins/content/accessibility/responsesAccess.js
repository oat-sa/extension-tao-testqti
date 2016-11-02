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
 * Test Runner Content Plugin : Navigate through the item responses using the keyboard
 *
 * @author Jean-Sébastien Conan <jean-sebastien.conan@vesperiagroup.com>
 */
define([
    'jquery',
    'lodash',
    'util/shortcut',
    'taoTests/runner/plugin'
], function ($, lodash, shortcut, pluginFactory) {
    'use strict';

    /**
     * @type {String}
     */
    var pluginName = 'responsesAccess';

    /**
     * Returns the configured plugin
     */
    return pluginFactory({

        name: pluginName,

        /**
         * Initialize the plugin (called during runner's init)
         */
        init: function init() {
            var self = this;
            var testRunner = this.getTestRunner();
            var testData = testRunner.getTestData() || {};
            var testConfig = testData.config || {};
            var responses = [];
            var count = 1;
            var cursor = 0;

            /**
             * Gets the tabindex of the currently selected response
             * @returns {Number}
             */
            function getCurrentIndex() {
                var $content = testRunner.getAreaBroker().getContentArea();

                if ($.contains($content.get(0), document.activeElement)) {
                    _.forEach(responses, function(response, index) {
                        if (document.activeElement === response) {
                            cursor = index;
                            return false;
                        }
                    });
                }

                return cursor;
            }

            /**
             * Select the next item response
             */
            function previousResponse() {
                cursor = (getCurrentIndex() + count - 1) % count;
                if (responses[cursor]) {
                    responses[cursor].focus();
                }
            }

            /**
             * Select the previous item response
             */
            function nextResponse() {
                cursor = (getCurrentIndex() + 1) % count;
                if (responses[cursor]) {
                    responses[cursor].focus();
                }
            }

            if (testConfig.allowShortcuts) {
                shortcut.add('Shift+Tab.' + pluginName, function () {
                    testRunner.trigger('previous-response');
                }, {
                    prevent: true
                });

                shortcut.add('Tab.' + pluginName, function () {
                    testRunner.trigger('next-response');
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

                    responses = $(':input', $content).toArray();
                    responses.sort(function (a, b) {
                        return parseInt(a.tabIndex, 10) - parseInt(b.tabIndex, 10);
                    });
                    count = responses.length || 1;
                    cursor = 0;
                    self.enable();
                })
                .on('unloaditem', function () {
                    self.disable();
                })
                .on('previous-response', previousResponse)
                .on('next-response', nextResponse);
        },

        /**
         * Called during the runner's render phase
         */
        render: function render() {
            var $container = this.getAreaBroker().getToolboxArea();
            $container.append(this.$button);
        },

        /**
         * Called during the runner's destroy phase
         */
        destroy: function destroy() {
            shortcut.remove('.' + pluginName);
        }
    });
});
