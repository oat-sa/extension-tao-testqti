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
    'taoTests/runner/plugin'
], function (_, pluginFactory) {
    'use strict';

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
        hover: false                // expand when the mouse is over a button
    };

    /**
     * Creates the responsiveness collapser plugin.
     * Reduce the size of the action bar tools when the available space is below the needed one.
     */
    return pluginFactory({

        name: 'collapser',

        /**
         * Initializes the plugin (called during runner's init)
         */
        init: function init() {
            // this function is mandatory
        },

        /**
         * Installs the plugin (called when the runner bind the plugin)
         */
        install: function install() {
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


            function getAvailableWidth() {
                return $actionsBar.width();
            }

            function getToolbarWidth() {
                return $toolbox.width() + $navigation.width();
            }

            function collapseNeeded() {
                return getToolbarWidth() > getAvailableWidth();
            }

            function reduceFormat(yes) {
                if (config.collapseTools) {
                    $toolbox.toggleClass(collapseCls, yes);
                }
                if (config.collapseNavigation) {
                    $navigation.toggleClass(collapseCls, yes);
                }
            }

            testRunner
                .on('renderitem loaditem', function() {
                    reduceFormat(false);
                    reduceFormat(collapseNeeded());
                });
        }
    });
});
