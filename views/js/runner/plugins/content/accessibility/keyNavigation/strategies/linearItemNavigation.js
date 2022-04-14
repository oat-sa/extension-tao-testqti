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
     * Key navigator strategy applying inside the item.
     * Navigable item content are interaction choices with the special class "key-navigation-focusable".
     * @type {Object} keyNavigationStrategy
     */

    var linearItemNavigation = {
      name: 'linearItem',

      /**
       * Builds the item navigation strategy.
       *
       * @returns {keyNavigationStrategy}
       */
      init: function init() {
        var _this = this;

        var config = this.getConfig();
        var $content = this.getTestRunner().getAreaBroker().getContentArea();
        var $qtiInteractions = $content.find('.key-navigation-focusable,.qti-interaction') //filter out interaction as it will be managed separately
        .filter(function (i, node) {
          return !$(node).parents('.qti-interaction').length;
        });
        var $qtiChoices = $qtiInteractions.find('.qti-choice');
        var $lastParent = null;
        var list = [];

        var setupListNavigator = function setupListNavigator() {
          var navigator = keyNavigator({
            elements: list,
            propagateTab: false
          });
          helpers.setupItemsNavigator(navigator, config);

          _this.choicesNavigators.push(navigator);
        }; // this strategy manages 2 navigators:
        // - keyNavigators lists all elements separately, allowing to navigate among them as identified groups
        // - choicesNavigators lists elements with the same parent, allowing to navigate "horizontally" among them


        this.keyNavigators = [];
        this.choicesNavigators = []; // the item focusable body elements are considered scrollable

        $content.find('.key-navigation-focusable').addClass('key-navigation-scrollable');
        $qtiChoices.each(function (i, el) {
          var $itemElement = $(el);
          var $parent = $itemElement.parent();
          var choiceNavigator = keyNavigator({
            elements: navigableDomElement.createFromDoms($itemElement),
            group: $itemElement,
            propagateTab: false
          });
          helpers.setupClickableNavigator(choiceNavigator);

          if ($lastParent && !$parent.is($lastParent)) {
            setupListNavigator();
            list = [];
          }

          _this.keyNavigators.push(choiceNavigator);

          list.push(choiceNavigator);
          $lastParent = $parent;
        });

        if (list.length) {
          setupListNavigator();
          list = [];
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
        this.choicesNavigators.forEach(function (navigator) {
          return navigator.destroy();
        });
        this.choicesNavigators = [];
        this.keyNavigators = [];
        return this;
      }
    };

    return linearItemNavigation;

});
