define(['ui/keyNavigation/navigator', 'taoQtiTest/runner/plugins/content/accessibility/keyNavigation/helpers', 'taoQtiTest/runner/plugins/content/accessibility/keyNavigation/modesManager', 'util/shortcut'], function (keyNavigator, helpers, modeFactory, shortcut) { 'use strict';

    keyNavigator = keyNavigator && Object.prototype.hasOwnProperty.call(keyNavigator, 'default') ? keyNavigator['default'] : keyNavigator;
    modeFactory = modeFactory && Object.prototype.hasOwnProperty.call(modeFactory, 'default') ? modeFactory['default'] : modeFactory;
    shortcut = shortcut && Object.prototype.hasOwnProperty.call(shortcut, 'default') ? shortcut['default'] : shortcut;

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
     * Copyright (c) 2016-2020 (original work) Open Assessment Technologies SA ;
     */
    /**
     * The event namespace used to register removable listeners
     * @type {String}
     */

    var eventNS = '.keyNavigation';
    /**
     * Builds a key navigator that can apply onto a test runner
     * @param {testRunner} testRunner - the test runner instance to control
     * @param {Object} config - the config to apply
     * @param {String} config.contentNavigatorType - the keyboard navigation mode
     * @returns {testRunnerKeyNavigator}
     */

    function keyNavigationFactory(testRunner) {
      var config = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
      var contentNavigatorType = config.contentNavigatorType;
      var groupNavigator = null;
      var strategies = [];
      /**
       * @typedef {Object} testRunnerKeyNavigator
       */

      return {
        /**
         * Setup the keyNavigator
         * @returns {testRunnerKeyNavigator}
         */
        init: function init() {
          var navigationMode = modeFactory(contentNavigatorType, config);
          var navigationConfig = navigationMode.config;
          strategies = helpers.getStrategies(navigationMode, testRunner);
          var navigators = helpers.getNavigators(strategies); //blur current focused element, to reinitialize keyboard navigation

          if (document.activeElement) {
            document.activeElement.blur();
          }

          groupNavigator = keyNavigator({
            id: 'test-runner',
            loop: true,
            elements: navigators,
            propagateTab: navigationConfig.propagateTab
          });
          helpers.setupItemsNavigator(groupNavigator, {
            keyNextItem: navigationConfig.keyNextGroup,
            keyPrevItem: navigationConfig.keyPrevGroup
          });
          shortcut.remove(eventNS).add("tab".concat(eventNS, " shift+tab").concat(eventNS), function (e) {
            if (!helpers.allowedToNavigateFrom(e.target)) {
              return false;
            }

            if (!groupNavigator.isFocused()) {
              groupNavigator.focus();
            }
          });
          return this;
        },

        /**
         * Gets the attached testRunner
         * @returns {testRunner}
         */
        getTestRunner: function getTestRunner() {
          return testRunner;
        },

        /**
         * Switches the navigation mode
         * @param {String} newMode
         * @returns {testRunnerKeyNavigator}
         */
        setMode: function setMode(newMode) {
          contentNavigatorType = newMode;
          return this;
        },

        /**
         * Gets the active navigation mode
         * @returns {String}
         */
        getMode: function getMode() {
          return contentNavigatorType;
        },

        /**
         * Returns keyNavigation active state
         * @returns {Boolean}
         */
        isActive: function isActive() {
          return groupNavigator !== null;
        },

        /**
         * Tears down the keyNavigator
         * @returns {testRunnerKeyNavigator}
         */
        destroy: function destroy() {
          shortcut.remove(eventNS);
          strategies.forEach(function (strategy) {
            return strategy.destroy();
          });

          if (groupNavigator) {
            groupNavigator.destroy();
          }

          groupNavigator = null;
          strategies = [];
          return this;
        }
      };
    }

    return keyNavigationFactory;

});
