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
    var noLabelCls = 'no-tool-label';

    /**
     * Name of the CSS class used to collapse the buttons and allow to expand on mouse over
     * @type {String}
     */
    var noLabelHoverCls = 'no-tool-label-hover';

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
            var testRunner = this.getTestRunner();
            var testData = testRunner.getTestData() || {};
            var testConfig = testData.config || {};
            var pluginsConfig = testConfig.plugins || {};
            var config = _.defaults(pluginsConfig.collapser || {}, defaults);
            var areaBroker = testRunner.getAreaBroker();
            var $actionsBar = areaBroker.getArea('actionsBar');
            var $toolbox = areaBroker.getToolboxArea();
            var $navigation = areaBroker.getNavigationArea();
            var collapseCls = config.hover ? noLabelHoverCls : noLabelCls;


            function collapse() {
                collapseAll(false);
                if (shouldCollapseInOrder()) {
                    collapseInOrder();
                } else {
                    collapseAll(collapseNeeded());
                }
            }

            function getAvailableWidth() {
                return $actionsBar.width();
            }

            function getToolbarWidth() {
                return $toolbox.width() + $navigation.width();
            }

            function collapseNeeded() {
                return getToolbarWidth() > getAvailableWidth();
            }

            function collapseAll(yes) {
                if (config.collapseTools) {
                    $toolbox.toggleClass(collapseCls, yes);
                }
                if (config.collapseNavigation) {
                    $navigation.toggleClass(collapseCls, yes);
                }
            }

            function shouldCollapseInOrder() {
                return config.collapseInOrder && _.isArray(config.collapseOrder) && config.collapseOrder.length;
            }

            function collapseInOrder() {
                var collapseOrderCopy = _.clone(config.collapseOrder),
                    toCollapse;

                while (collapseNeeded() && collapseOrderCopy.length) {
                    toCollapse = collapseOrderCopy.shift();
                    $actionsBar.find(toCollapse).toggleClass(collapseCls, true);
                }
            }

            $window.on('resize' + ns, _.throttle(collapse, 100));

            testRunner
                .on('renderitem loaditem', collapse);
        },

        destroy: function destroy() {
            $window.off(ns);
        }
    });
});
