define(['taoTests/runner/plugin', 'taoQtiTest/runner/helpers/map', 'taoQtiTest/runner/plugins/controls/progressbar/progress', 'taoQtiTest/runner/plugins/controls/progressbar/renderer/percentage', 'taoQtiTest/runner/plugins/controls/progressbar/renderer/position'], function (pluginFactory, mapHelper, progressHelper, percentageRendererFactory, positionRendererFactory) { 'use strict';

    pluginFactory = pluginFactory && Object.prototype.hasOwnProperty.call(pluginFactory, 'default') ? pluginFactory['default'] : pluginFactory;
    mapHelper = mapHelper && Object.prototype.hasOwnProperty.call(mapHelper, 'default') ? mapHelper['default'] : mapHelper;
    progressHelper = progressHelper && Object.prototype.hasOwnProperty.call(progressHelper, 'default') ? progressHelper['default'] : progressHelper;
    percentageRendererFactory = percentageRendererFactory && Object.prototype.hasOwnProperty.call(percentageRendererFactory, 'default') ? percentageRendererFactory['default'] : percentageRendererFactory;
    positionRendererFactory = positionRendererFactory && Object.prototype.hasOwnProperty.call(positionRendererFactory, 'default') ? positionRendererFactory['default'] : positionRendererFactory;

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
     * List of available progress indicator renderers
     * @type {Object}
     */

    var renderers = {
      percentage: percentageRendererFactory,
      position: positionRendererFactory
    };
    /**
     * Returns the configured plugin
     */

    var progressbar = pluginFactory({
      name: 'progressBar',

      /**
       * Initialize the plugin (called during runner's init)
       */
      init: function init() {
        var testRunner = this.getTestRunner();
        var testRunnerConfig = testRunner.getOptions();
        var config = Object.assign({}, testRunnerConfig.progressIndicator || {}, this.getConfig());
        var self = this;
        var rendererFactory = renderers[config.renderer] || renderers.percentage;
        var progressConfig = {
          indicator: config.type || 'percentage',
          scope: config.scope || 'test',
          showLabel: config.showLabel,
          showTotal: config.showTotal,
          categories: config.categories
        };

        var hiddenByQuestions = function hiddenByQuestions(item) {
          return item && item.informational && progressConfig.indicator === 'questions';
        };

        var hiddenByCategories = function hiddenByCategories(item) {
          return item && progressConfig.indicator === 'categories' && !progressHelper.isMatchedCategories(item.categories, progressConfig.categories);
        };
        /**
         * Check if progress bar should be hidden
         */


        var isProgressbarHidden = function isProgressbarHidden(item) {
          return hiddenByQuestions(item) || hiddenByCategories(item);
        };
        /**
         * Update the progress bar
         */


        var update = function update() {
          var testContext = testRunner.getTestContext();
          var testMap = testRunner.getTestMap();
          var item = mapHelper.getItemAt(testMap, testContext.itemPosition);

          if (isProgressbarHidden(item)) {
            self.renderer.hide();
          } else {
            self.renderer.show();
            self.renderer.update(progressHelper.computeProgress(testMap, testContext, progressConfig));
          }
        }; //create the progressbar


        this.renderer = rendererFactory(progressConfig); //let update the progression

        update();
        testRunner.on('ready loaditem', update);
      },

      /**
       * Called during the runner's render phase
       */
      render: function render() {
        var $container = this.getAreaBroker().getControlArea();
        this.renderer.render($container);
      },

      /**
       * Called during the runner's render phase
       */
      destroy: function destroy() {
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

    return progressbar;

});
