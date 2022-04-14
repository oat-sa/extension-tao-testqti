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

    var groupId = 'item-content-wrapper';
    /**
     * Key navigator strategy applying onto the page.
     * @type {Object} keyNavigationStrategy
     */

    var pageNavigation = {
      name: 'page',

      /**
       * Builds the page navigation strategy.
       *
       * @returns {keyNavigationStrategy}
       */
      init: function init() {
        var _this = this;

        var config = this.getConfig();
        this.keyNavigators = [];
        this.getTestRunner().getAreaBroker().getContainer().find('.content-wrapper').addClass('key-navigation-scrollable').each(function (i, el) {
          var $element = $(el);
          var navigator = keyNavigator({
            id: "".concat(groupId, "-").concat(_this.keyNavigators.length),
            elements: navigableDomElement.createFromDoms($element),
            group: $element,
            propagateTab: false
          });
          helpers.setupItemsNavigator(navigator, config);

          _this.keyNavigators.push(navigator);
        });
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

    return pageNavigation;

});
