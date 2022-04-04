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

    var groupId = 'top-toolbar';
    /**
     * Key navigator strategy applying onto the top toolbar' bar.
     * @type {Object} keyNavigationStrategy
     */

    var topToolbarNavigation = {
      name: 'top-toolbar',

      /**
       * Builds the top toolbar navigation strategy.
       *
       * @returns {keyNavigationStrategy}
       */
      init: function init() {
        var _this = this;

        var config = this.getConfig();
        var $topToolbar = this.getTestRunner().getAreaBroker().getContainer().find('.top-action-bar');
        var $toolbarElements = $topToolbar.find('.timer-toggler');

        var registerTopToolbarNavigator = function registerTopToolbarNavigator(id, group, $elements) {
          var elements = navigableDomElement.createFromDoms($elements);

          if (elements.length) {
            var navigator = keyNavigator({
              id: id,
              group: group,
              elements: elements,
              propagateTab: false
            });
            helpers.setupItemsNavigator(navigator, config);
            helpers.setupClickableNavigator(navigator);

            _this.keyNavigators.push(navigator);
          }
        };

        this.keyNavigators = [];
        $toolbarElements.each(function (index, element) {
          return registerTopToolbarNavigator("".concat(groupId, "-").concat(index), $topToolbar, $(element));
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

    return topToolbarNavigation;

});
