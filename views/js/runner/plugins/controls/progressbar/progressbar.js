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
 * Test Runner Control Plugin : Progress Bar
 *
 * @author Bertrand Chevrier <bertrand@taotesting.com>
 */
define([
    'taoTests/runner/plugin',
    'taoQtiTest/runner/helpers/map',
    'taoQtiTest/runner/helpers/progress',
    'taoQtiTest/runner/plugins/controls/progressbar/renderer/percentage'
], function (pluginFactory, mapHelper, progressHelper, percentageRendererFactory){
    'use strict';

    /**
     * Returns the configured plugin
     */
    return pluginFactory({

        name : 'progressBar',

        /**
         * Initialize the plugin (called during runner's init)
         */
        init : function init(){
            var testRunner = this.getTestRunner();
            var testData   = testRunner.getTestData();
            var config     = testData.config.progressIndicator || {};
            var self       = this;

            var progressConfig = {
                indicator: config.type || 'percentage',
                scope: config.scope || 'test',
                showLabel: config.showLabel,
                showTotal: config.showTotal
            };

            /**
             * Update the progress bar
             */
            var update = function update (){
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
            this.renderer = percentageRendererFactory(progressConfig);

            //let update the progression
            update();

            testRunner.on('ready loaditem', update);
        },

        /**
         * Called during the runner's render phase
         */
        render : function render(){
            var $container = this.getAreaBroker().getControlArea();
            this.renderer.render($container);
        },

        /**
         * Called during the runner's render phase
         */
        destroy : function destroy(){
            if (this.renderer) {
                this.renderer.destroy();
            }
            this.renderer = null;
        },

        /**
         * Show the progress bar
         */
        show: function show(){
            if (this.renderer) {
                this.renderer.show();
            }
        },

        /**
         * Hide the progress bar
         */
        hide: function hide(){
            if (this.renderer) {
                this.renderer.hide();
            }
        }
    });
});
