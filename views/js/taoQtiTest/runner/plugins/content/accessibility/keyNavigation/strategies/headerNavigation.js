define(['jquery', 'ui/keyNavigation/navigator', 'ui/keyNavigation/navigableDomElement', 'taoQtiTest/runner/plugins/content/accessibility/keyNavigation/helpers'], function ($, keyNavigator, navigableDomElement, helpers) { 'use strict';

    $ = $ && Object.prototype.hasOwnProperty.call($, 'default') ? $['default'] : $;
    keyNavigator = keyNavigator && Object.prototype.hasOwnProperty.call(keyNavigator, 'default') ? keyNavigator['default'] : keyNavigator;
    navigableDomElement = navigableDomElement && Object.prototype.hasOwnProperty.call(navigableDomElement, 'default') ? navigableDomElement['default'] : navigableDomElement;

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
     * Copyright (c) 2020 Open Assessment Technologies SA ;
     */
    /**
     * The identifier the keyNavigator group
     * @type {String}
     */

    var groupId = 'header-toolbar';
    /**
     * Key navigator strategy applying onto the header bar.
     * @type {Object} keyNavigationStrategy
     */

    var headerNavigation = {
      name: 'header',

      /**
       * Builds the header navigation strategy.
       *
       * @returns {keyNavigationStrategy}
       */
      init: function init() {
        var _this = this;

        var config = this.getConfig(); // we need a global selector as there is currently no way to access the delivery frame from the test runner

        var $headerBar = $('header');
        var $headerElements = $headerBar.find('a:visible');

        var registerHeaderNavigator = function registerHeaderNavigator(id, group, $elements) {
          var elements = navigableDomElement.createFromDoms($elements);

          if (elements.length) {
            var navigator = keyNavigator({
              id: id,
              group: group,
              elements: elements,
              propagateTab: false,
              defaultPosition: 0
            });
            helpers.setupItemsNavigator(navigator, config);
            helpers.setupClickableNavigator(navigator);

            _this.keyNavigators.push(navigator);
          }
        };

        this.keyNavigators = [];

        if (config.flatNavigation) {
          $headerElements.each(function (index, element) {
            return registerHeaderNavigator("".concat(groupId, "-").concat(index), $headerBar, $(element));
          });
        } else {
          registerHeaderNavigator(groupId, $headerBar, $headerElements);
        }

        return this;
      },

      /**
       * Gets the list of applied navigators
       * @returns {keyNavigator[]}
       */
      getNavigators: function getNavigators() {
        return this.keyNavigators;
      },

      /**
       * Tears down the keyNavigator strategy
       * @returns {keyNavigationStrategy}
       */
      destroy: function destroy() {
        this.keyNavigators.forEach(function (navigator) {
          return navigator.destroy();
        });
        this.keyNavigators = [];
        return this;
      }
    };

    return headerNavigation;

});
