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

                config.collapseOrder = config.collapseInOrder && config.collapseOrder.length ?
                    config.collapseOrder :
                    getNaturalCollapseOrder();

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
                    collapseInOrder();
                } else {
                    expandInOrder();
                }

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
                return (getToolbarWidth() + extraWidth) <= getAvailableWidth();
            }

            function getAvailableWidth() {
                return $actionsBar.width();
            }

            function getToolbarWidth() {
                return $toolbox.outerWidth(true) + $navigation.outerWidth(true);
            }

            /**
             * Build the collapse order from the left to the right, related elements are grouped.
             * If config.collapseInOrder is false there will be only one element, ie. all buttons
             * will be collapsed at once
             */
            function getNaturalCollapseOrder() {
                var collection = [],
                    $controls = $(),
                    groups;

                if(config.collapseTools) {
                    $controls = $controls.add($toolbox.find('>ul>[data-control]'));
                }

                if(config.collapseNavigation) {
                    $controls = $controls.add($navigation.find('>ul>[data-control]'));
                }

                if(!$controls.length) {
                    return collection;
                }

                if(config.collapseInOrder) {
                    groups = {};
                    // group items by prefix
                    // eg. zoomIn and zoomOut -> zoom
                    $controls.each(function() {
                        var ctrl = this.dataset.control,
                            // re makes group `foo` from `foo-bar`, `fooBar` and `foo_bar`
                            group = ctrl.substring(0, ctrl.search(/[A-Z-_]/));
                        groups[group] = groups[group] || [];
                        groups[group].push(ctrl);
                    });

                    // move items to collection
                    _.forOwn(groups, function(values) {
                        var ctrls = [];
                        _.forEach(values, function(ctrl) {
                            ctrls.push('[data-control="' + ctrl + '"]');
                        });
                        collection.push(ctrls.join(','));
                    });
                }
                else {
                    // collapse/expand all in one go
                    $controls.each(function() {
                        var ctrl = this.dataset.control;
                        collection.push('[data-control="' + ctrl + '"]');
                    });
                    collection = [collection.join(',')];
                }

                return collection;
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
