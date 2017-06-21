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
 * @author Jean-Sébastien Conan <jean-sebastien.conan@vesperiagroup.com>
 * @author Christophe Noël <christophe@taotesting.com>
 */
define([
    'lodash',
    'jquery',
    'taoTests/runner/plugin'
], function (_, $, pluginFactory) {
    'use strict';

    /**
     * Event namespace
     * @type {String}
     */
    var ns = '.collapser';

    /**
     * Name of the CSS class used to collapse the buttons
     * @type {String}
     */
    var noLabelCls = 'tool-label-collapsed';

    /**
     * Name of the CSS class used to collapse the buttons and allow to expand on mouse over
     * @type {String}
     */
    var noLabelHoverCls = 'tool-label-collapsed-hover';

    /**
     * Name of the  CSS class used to hide the label of the button independently of responsiveness
     * @type {string}
     */
    var labelHiddenCls = 'no-tool-label';

    /**
     * Default plugin options
     * @type {Object}
     */
    var defaults = {
        collapseTools: true,        // collapse the tools buttons
        collapseNavigation: false,  // collapse the navigation buttons
        collapseInOrder: false,     // collapse any button in the given order
        hover: false,               // expand when the mouse is over a button,

        /**
         * Allow to set manually which buttons should collapse and in which order.
         * This can be set by triggering the "collapser-set-order" event on the testRunner.
         * Given as an array of jQuery selectors: first index will be the first to be collapsed, and so on.
         * If no selector is given for a button, then this one will never collapse.
         * ex:
         * var collapseOrder = [
         *      '[data-control="highlight-clear"],[data-control="highlight-trigger"]',  // those will collapse first...
         *      '[data-control="hide-review"]',                                         // this one second...
         *      '[data-control="set-item-flag"]',                                       // third...
         *      ...                                                                     // ...
         * ];
         * @type {String[]}
         */
        collaspeOrder: []
    };

    var $window = $(window);

    /**
     * Creates the responsiveness collapser plugin.
     * Reduce the size of the action bar tools when the available space is below the needed one.
     */
    return pluginFactory({

        name: 'collapser',

        /**
         * Installs the plugin (called when the runner bind the plugin)
         */
        init: function init() {
            var testRunner = this.getTestRunner(),
                testData = testRunner.getTestData() || {},
                testConfig = testData.config || {},
                pluginsConfig = testConfig.plugins || {},
                config = _.defaults(pluginsConfig.collapser || {}, defaults),
                collapseCls = config.hover ? noLabelHoverCls : noLabelCls;

            var areaBroker = testRunner.getAreaBroker();

            var $actionsBar = areaBroker.getArea('actionsBar'),
                $toolbox = areaBroker.getToolboxArea(),
                $navigation = areaBroker.getNavigationArea();

            var allCollapsibles,
                availableWidth,
                previousAvailableWidth,
                totalExtraWidth;

            /**
             * Get a reference of all collapsibles
             */
            function buildCollapsiblesList() {
                // use the given order to build the collapsibles list
                if (shouldCollapseInOrder()) {
                    allCollapsibles = config.collapseOrder.map(function(selector) {
                        var $elements = $(selector).not('.' + labelHiddenCls); // some buttons are collapsed by configuration: we should leave them alone
                        var extraWidth = 0;

                        if ($elements.length) {
                            $elements.each(function() {
                                extraWidth += getExtraWidth($(this));
                            });
                            return {
                                $elements: $elements,
                                extraWidth: extraWidth
                            };
                        }
                        return false;
                    });

                    allCollapsibles = _.compact(allCollapsibles);

                // collapsibles will be either tools and/or nav whole blocks depending on configuration
                } else {
                    allCollapsibles = [];
                    if (config.collapseTools) {
                        allCollapsibles.push({
                            $elements: $toolbox,
                            extraWidth: getExtraWidth($toolbox)
                        });
                    }
                    if (config.collapseNavigation) {
                        allCollapsibles.push({
                            $elements: $navigation,
                            extraWidth: getExtraWidth($navigation)
                        });
                    }

                    totalExtraWidth = allCollapsibles.reduce(function(total, collapsible) {
                        total += collapsible.extraWidth;
                        return total;
                    }, 0);
                }
            }

            /**
             * @param {jQuery} $element
             * @returns {number} Size difference, in pixels, between collapsed and expanded state of $element
             */
            function getExtraWidth($element) {
                var expandedWidth,
                    collapsedWidth;

                $element.removeClass(collapseCls);
                expandedWidth = $element.outerWidth(true);
                $element.addClass(collapseCls);
                collapsedWidth = $element.outerWidth(true);
                $element.removeClass(collapseCls);

                return expandedWidth - collapsedWidth;
            }

            /**
             * Expand or collapse elements
             */
            function toggleCollapsibles() {
                availableWidth = getAvailableWidth();

                if (availableWidth < previousAvailableWidth) {
                    if (shouldCollapseInOrder()) {
                        collapseInOrder();
                    } else {
                        collapseAll(collapseNeeded());
                    }
                } else {

                    if (shouldCollapseInOrder()) {
                        expandInOrder();
                    } else {
                        expandAll();
                    }
                }

                previousAvailableWidth = availableWidth;
            }

            function shouldCollapseInOrder() {
                return config.collapseInOrder && _.isArray(config.collapseOrder) && config.collapseOrder.length;
            }

            function collapseAll(yes) {
                if (config.collapseTools) {
                    $toolbox.toggleClass(collapseCls, yes);
                }
                if (config.collapseNavigation) {
                    $navigation.toggleClass(collapseCls, yes);
                }
            }

            function collapseInOrder() {
                var collapsiblesCopy = _.clone(allCollapsibles),
                    toCollapse;

                while (collapseNeeded() && collapsiblesCopy.length) {
                    toCollapse = collapsiblesCopy.shift();
                    toCollapse.$elements.addClass(collapseCls);
                }
            }

            function collapseNeeded() {
                return getToolbarWidth() > getAvailableWidth();
            }


            function expandAll() {
                if (expandPossible(totalExtraWidth)) {
                    allCollapsibles.forEach(function(collapsible) {
                        collapsible.$elements.removeClass(collapseCls);
                    });
                }
            }

            function expandInOrder() {
                _.forEachRight(allCollapsibles, function(toExpand) {
                    if (toExpand.$elements.hasClass(collapseCls)) {
                        if (expandPossible(toExpand.extraWidth)) {
                            toExpand.$elements.removeClass(collapseCls);
                        } else {
                            return false;
                        }
                    }
                });
            }

            function expandPossible(extraWidth) {
                return (getToolbarWidth() + extraWidth) <= getAvailableWidth();
            }

            function getAvailableWidth() {
                return $actionsBar.width();
            }

            function getToolbarWidth() {
                return $toolbox.outerWidth(true) + $navigation.outerWidth(true);
            }



            $window.on('resize' + ns, _.throttle(function() {
                testRunner.trigger('collapseTools');
            }, 100));

            testRunner
                .after('renderitem loaditem', function() {
                    previousAvailableWidth = Infinity;

                    buildCollapsiblesList();
                    testRunner.trigger('collapseTools');
                })
                .on('collapseTools' + ns, function() {
                    toggleCollapsibles();
                });
        },

        destroy: function destroy() {
            $window.off(ns);
        }
    });
});
