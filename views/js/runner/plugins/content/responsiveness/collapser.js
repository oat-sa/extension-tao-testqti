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
 * @author Dieter Raber <dieter@taotesting.com>
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
     * Name of the  CSS class for separators
     * @type {string}
     */
    var separatorCls = 'separator';

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
        collapseOrder: []
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
                previousAvailableWidth;

            /**
             * Get a reference of all collapsibles
             */
            function buildCollapsiblesList() {

                // use the given order to build the collapsibles list or generate on in natural order
                if(config.collapseInOrder && config.collapseOrder.length) {
                    allCollapsibles = getCollapsiblesFromConfig();
                }
                // get values from DOM, grouped by prefix
                else if(config.collapseInOrder) {
                    allCollapsibles = getSortedCollapsiblesFromDom();
                }
                // get all in one chunk
                else {
                    allCollapsibles = getUnsortedCollapsiblesFromDom();
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

                availableWidth < previousAvailableWidth ? collapseInOrder() : expandInOrder();

                previousAvailableWidth = availableWidth;
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
                return (getToolbarWidth() + extraWidth) < getAvailableWidth();
            }

            function getAvailableWidth() {
                // Scrollbars are commonly between ~12px and ~18px in width. Subtracting 20px from the available width
                // makes sure that scrollbars are always taken in account. The worst case scenario is that the buttons
                // start to collapse, although they would still have had 20px available.
                return $actionsBar.width() - 20;
            }

            function getToolbarWidth() {
                return $toolbox.outerWidth(true) + $navigation.outerWidth(true);
            }

            /**
             * Parse DOM for controls that can be collapsed
             * @returns {*|jQuery|HTMLElement}
             */
            function getControlsFromDom() {
                var $controls = $(),
                    selector = '>ul>[data-control]';

                if(config.collapseTools) {
                    $controls = $controls.add($toolbox.find(selector).not('.' + labelHiddenCls).not('.' + separatorCls));
                }

                if(config.collapseNavigation) {
                    $controls = $controls.add($navigation.find(selector).not('.' + labelHiddenCls).not('.' + separatorCls));
                }

                return $controls;
            }

            /**
             * Get allCollapsibles based on configuration
             *
             * @returns {Array}
             */
            function getCollapsiblesFromConfig() {

                return _.compact(config.collapseOrder.map(function(selector) {
                    // some buttons are collapsed by configuration, some other are only separators: we should leave them alone
                    var $elements = $(selector).not('.' + labelHiddenCls).not('.' + separatorCls);
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
                }));
            }

            /**
             * Get allCollapsibles based on DOM
             * Build the collapse order from the left to the right, related elements are grouped.
             *
             * @returns {Array}
             */
            function getSortedCollapsiblesFromDom() {

                var $elements = getControlsFromDom(),
                    _allCollapsibles = [],
                    order = {};

                // group items by prefix
                // eg. zoomIn and zoomOut -> zoom
                $elements.each(function() {
                    var ctrl = this.dataset.control,
                        // re makes group `foo` from `foo-bar`, `fooBar` and `foo_bar`
                        // if we do not have a prefix use the control name as key to ensure uniqueness
                        key = ctrl.substring(0, ctrl.search(/[A-Z-_]/)) || ctrl;

                    order[key] = order[key] || $();
                    order[key] = order[key].add($(this));
                });

                // move items to allCollapsibles
                _.forOwn(order, function($elements) {
                    var extraWidth = 0;
                    $elements.each(function() {
                        extraWidth += getExtraWidth($(this));
                    });
                    _allCollapsibles.push({
                        $elements: $elements,
                        extraWidth: extraWidth
                    })
                });

                return _.compact(_allCollapsibles);
            }

            /**
             * Get allCollapsibles based on DOM, all buttons will be collapsed at once
             *
             * @returns {Array}
             */
            function getUnsortedCollapsiblesFromDom() {
                var $elements = getControlsFromDom(),
                    _allCollapsibles = [],
                    extraWidth = 0;

                $elements.each(function() {
                    extraWidth += getExtraWidth($(this));
                });

                _allCollapsibles.push({
                    $elements: $elements,
                    extraWidth: extraWidth
                });

                return _.compact(_allCollapsibles);
            }



            $window.on('resize' + ns, _.throttle(function() {
                testRunner.trigger('collapseTools');
            }, 40));

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
