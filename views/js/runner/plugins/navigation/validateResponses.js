define(['lodash', 'i18n', 'taoTests/runner/plugin', 'taoQtiTest/runner/helpers/currentItem'], function (_, __, pluginFactory, currentItemHelper) { 'use strict';

    _ = _ && Object.prototype.hasOwnProperty.call(_, 'default') ? _['default'] : _;
    __ = __ && Object.prototype.hasOwnProperty.call(__, 'default') ? __['default'] : __;
    pluginFactory = pluginFactory && Object.prototype.hasOwnProperty.call(pluginFactory, 'default') ? pluginFactory['default'] : pluginFactory;
    currentItemHelper = currentItemHelper && Object.prototype.hasOwnProperty.call(currentItemHelper, 'default') ? currentItemHelper['default'] : currentItemHelper;

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
     * Copyright (c) 2017-2019 (original work) Open Assessment Technologies SA ;
     */
    var pluginName = 'validateResponses';
    /**
     * Plugin
     * @returns {Object}
     */

    var validateResponses = pluginFactory({
      /**
       * Plugin name
       * @type {String}
       */
      name: pluginName,

      /**
       * Initialize plugin (called during runner's initialization)
       * @returns {this}
       */
      init: function init() {
        var testRunner = this.getTestRunner();
        var testRunnerOptions = testRunner.getOptions();
        var pluginConfig = this.getConfig();
        testRunner.before('move', function (e, direction) {
          var testContext = testRunner.getTestContext();
          var isInteracting = !testRunner.getItemState(testContext.itemIdentifier, 'disabled');

          if (!pluginConfig.validateOnPreviousMove && direction === 'previous') {
            return Promise.resolve();
          }

          if (isInteracting && testRunnerOptions.enableValidateResponses) {
            var currenItem = testRunner.getCurrentItem(); //@deprecated use validateResponses from testMap instead of the testContext

            var validateResponses = typeof currenItem.validateResponses === 'boolean' ? currenItem.validateResponses : testContext.validateResponses;

            if (validateResponses) {
              return new Promise(function (resolve, reject) {
                if (_.size(currentItemHelper.getDeclarations(testRunner)) === 0) {
                  return resolve();
                }

                if (currentItemHelper.isAnswered(testRunner, false)) {
                  return resolve();
                }

                if (!testRunner.getState('alerted.notallowed')) {
                  // Only show one alert for itemSessionControl
                  testRunner.setState('alerted.notallowed', true);
                  testRunner.trigger('alert.notallowed', __('A valid response to this item is required.'), function () {
                    testRunner.trigger('resumeitem');
                    reject();
                    testRunner.setState('alerted.notallowed', false);
                  });
                }
              });
            }
          }
        });
        return this;
      }
    });

    return validateResponses;

});
