define(['jquery', 'i18n', 'ui/keyNavigation/navigator', 'ui/keyNavigation/navigableDomElement', 'taoQtiTest/runner/plugins/content/accessibility/keyNavigation/helpers'], function ($, __, keyNavigator, navigableDomElement, helpers) { 'use strict';

    $ = $ && Object.prototype.hasOwnProperty.call($, 'default') ? $['default'] : $;
    __ = __ && Object.prototype.hasOwnProperty.call(__, 'default') ? __['default'] : __;
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

    var groupId = 'stimulus-element-navigation-group';
    /**
     * Key navigator strategy applying on stimulus items with scrollbar.
     * Navigable item content are body elements with the special class "stimulus-container".
     * @type {Object} keyNavigationStrategy
     */

    var stimulusNavigation = {
      name: 'stimulus',

      /**
       * Builds the item navigation strategy.
       *
       * @returns {keyNavigationStrategy}
       */
      init: function init() {
        var _this = this;

        var config = this.getConfig();
        var $content = this.getTestRunner().getAreaBroker().getContentArea();
        this.keyNavigators = []; // decorate isEnabled navigableDomElement method to check for dom node height

        var isEnabledDecorator = function isEnabledDecorator(element) {
          var originalIsEnabled = element.isEnabled;

          element.isEnabled = function isEnabled() {
            if (originalIsEnabled.call(this)) {
              var node = this.getElement().get(0);
              return node.scrollHeight > node.clientHeight;
            }

            return false;
          };

          return element;
        };

        $content.find('.stimulus-container').addClass('key-navigation-scrollable').each(function (i, el) {
          var $element = $(el);
          var elements = navigableDomElement.createFromDoms($element).map(isEnabledDecorator); // assign aria attributes

          $element.attr('aria-label', __('Passage'));
          var navigator = keyNavigator({
            id: "".concat(groupId, "-").concat(i),
            elements: elements,
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

    return stimulusNavigation;

});
