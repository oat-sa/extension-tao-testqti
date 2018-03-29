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
 * Copyright (c) 2016-2018 (original work) Open Assessment Technologies SA ;
 */

/**
 * Test Runner Control Plugin : Progress Bar factory
 *
 * @author Bertrand Chevrier <bertrand@taotesting.com>
 * @author Jean-Sébastien Conan <jean-sebastien@taotesting.com>
 */
define([
    'lodash',
    'taoTests/runner/plugin',
    'taoQtiTest/runner/helpers/map',
    'taoQtiTest/runner/helpers/progress',
    'taoQtiTest/runner/plugins/controls/progressbar/renderer/percentage',
    'taoQtiTest/runner/plugins/controls/progressbar/renderer/position'
], function (_, pluginFactory, mapHelper, progressHelper, percentageRendererFactory, positionRendererFactory) {
    'use strict';

    /**
     * List of default available progress indicator renderers
     * @type {Object}
     */
    var defaultRenderers = {
        percentage: percentageRendererFactory,
        position: positionRendererFactory
    };

    /**
     * Simple configurator that leaves the config unchanged
     * @param {Object} config
     * @returns {Object}
     */
    function defaultConfigurator(config) {
        return config;
    }

    /**
     * Returns the configured plugin
     * @param {String} pluginName - The name of the plugin
     * @param {Function} [configurator] - A callback that will customize the config
     * @param {Object} [renderers] - A list of renderers to assign
     * @returns {plugin} Returns a tweaked progressbar plugin
     */
    return function progressbarPluginFactory(pluginName, configurator, renderers) {
        if (!_.isFunction(configurator)) {
            configurator = defaultConfigurator;
        }

        renderers = _.defaults(renderers || {}, defaultRenderers);

        if (!_.every(renderers, _.isFunction)) {
            throw new TypeError('Each renderer factory should be a function');
        }

        return pluginFactory({

            name : pluginName,

            /**
             * Initialize the plugin (called during runner's init)
             */
            init : function init() {
                var testRunner = this.getTestRunner();
                var testData   = testRunner.getTestData();
                var config     = configurator(testData.config.progressIndicator || {}, testRunner);
                var self       = this;

                var rendererFactory = renderers[config.renderer] || renderers.percentage;
                var progressConfig = {
                    indicator: config.type || 'percentage',
                    scope: config.scope || 'test',
                    showLabel: config.showLabel,
                    showTotal: config.showTotal
                };

                /**
                 * Update the progress bar
                 */
                var update = function update () {
                    var testContext = testRunner.getTestContext();
                    var testMap = testRunner.getTestMap();
                    var item = mapHelper.getItemAt(testMap, testContext.itemPosition);

                    if (item && item.informational && progressConfig.indicator === 'questions') {
                        self.renderer.hide();
                    } else {
                        self.renderer.show();
                        self.renderer.update(progressHelper.computeProgress(testMap, testContext, progressConfig));
                    }
                };

                //create the progressbar
                this.renderer = rendererFactory(progressConfig);

                //let update the progression
                update();

                testRunner.on('ready loaditem', update);
            },

            /**
             * Called during the runner's render phase
             */
            render : function render() {
                var $container = this.getAreaBroker().getControlArea();
                this.renderer.render($container);
            },

            /**
             * Called during the runner's render phase
             */
            destroy : function destroy() {
                if (this.renderer) {
                    this.renderer.destroy();
                }
                this.renderer = null;
            },

            /**
             * Show the progress bar
             */
            show: function show() {
                if (this.renderer) {
                    this.renderer.show();
                }
            },

            /**
             * Hide the progress bar
             */
            hide: function hide() {
                if (this.renderer) {
                    this.renderer.hide();
                }
            }
        });
    }
});
