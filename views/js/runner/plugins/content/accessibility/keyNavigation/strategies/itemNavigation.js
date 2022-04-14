define(['jquery', 'ui/scroller', 'ui/keyNavigation/navigator', 'ui/keyNavigation/navigableDomElement', 'taoQtiTest/runner/plugins/content/accessibility/keyNavigation/helpers'], function ($, scrollHelper, keyNavigator, navigableDomElement, helpers) { 'use strict';

    $ = $ && Object.prototype.hasOwnProperty.call($, 'default') ? $['default'] : $;
    scrollHelper = scrollHelper && Object.prototype.hasOwnProperty.call(scrollHelper, 'default') ? scrollHelper['default'] : scrollHelper;
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
     * Add aria-labelledby attribute to choice interaction
     *
     * @param {Navigator} cursor
     */

    var addLabelledByAttribute = function addLabelledByAttribute(cursor) {
      var $element = cursor.navigable.getElement();
      var value = $element.attr('value');
      var name = $element.attr('name');

      if (name) {
        $element.attr('aria-labelledby', "".concat(name.replace('response-', 'choice-'), "-").concat(value));
      }
    };
    /**
     * Add aria-labelledby attribute from choice interaction
     *
     * @param {Navigator} cursor
     */


    var removeLabelledByAttribute = function removeLabelledByAttribute(cursor) {
      var $element = cursor.navigable.getElement();
      $element.removeAttr('aria-labelledby', '');
    };
    /**
     * Adds attributes on navigation focus and blur
     *
     * @param {Navigator} navigator
     */


    var manageLabelledByAttribute = function manageLabelledByAttribute(navigator) {
      if (navigator) {
        navigator.on('focus', addLabelledByAttribute);
        navigator.on('blur', removeLabelledByAttribute); // applies WCAG behavior for the radio buttons
      }
    };
    /**
     * Key navigator strategy applying inside the item.
     * Navigable item content are interaction choices and body element with the special class "key-navigation-focusable".
     * @type {Object} keyNavigationStrategy
     */


    var itemNavigation = {
      name: 'item',

      /**
       * Builds the item navigation strategy.
       *
       * @returns {keyNavigationStrategy}
       */
      init: function init() {
        var _this = this;

        this.keyNavigators = [];
        var config = this.getConfig();
        var $content = this.getTestRunner().getAreaBroker().getContentArea();
        /**
         * Gets the QTI choice element from the current position in the keyNavigation
         * @param {Object} cursor - The cursor definition supplied by the keyNavigator
         * @returns {jQuery} - The selected choice element
         */

        var getQtiChoice = function getQtiChoice(cursor) {
          return cursor && cursor.navigable.getElement().closest('.qti-choice');
        };
        /**
         * Creates and registers a keyNavigator for the supplied list of elements
         * @param {jQuery} $elements - The list of navigable elements
         * @param {jQuery} group - The group container
         * @param {Boolean} [loop=false] - Allow cycling the list when a boundary is reached
         * @param {Number|Function} [defaultPosition=0] - The default position the group should set the focus on
         * @returns {keyNavigator} - the created navigator, if the list of element is not empty
         */


        var addNavigator = function addNavigator($elements, group) {
          var loop = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;
          var defaultPosition = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 0;
          var elements = navigableDomElement.createFromDoms($elements);

          if (elements.length) {
            var navigator = keyNavigator({
              elements: elements,
              group: group,
              loop: loop,
              defaultPosition: defaultPosition,
              propagateTab: false
            });

            _this.keyNavigators.push(navigator);

            return navigator;
          }
        };
        /**
         * Creates and setups a keyNavigator for the interaction inputs.
         * @param {jQuery} $elements - The list of navigable elements
         * @param {jQuery} group - The group container
         * @param {Boolean} [loop=false] - Allow cycling the list when a boundary is reached
         * @param {Number|Function} [defaultPosition=0] - The default position the group should set the focus on
         * @returns {keyNavigator} - The supplied keyNavigator
         */


        var addInputsNavigator = function addInputsNavigator($elements, group, loop) {
          var defaultPosition = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 0;
          var navigator = addNavigator($elements, group, loop, defaultPosition);

          if (navigator) {
            helpers.setupItemsNavigator(navigator, config);
            helpers.setupClickableNavigator(navigator); // each choice is represented by more than the input, the style must be spread to the actual element

            navigator.on('focus', function (cursor) {
              return scrollHelper.scrollTo(getQtiChoice(cursor).addClass('key-navigation-highlight'), $content.closest('.content-wrapper'));
            }).on('blur', function (cursor) {
              return getQtiChoice(cursor).removeClass('key-navigation-highlight');
            });
          }

          return navigator;
        }; // list the navigable areas inside the item. This could be either the interactions choices or the prompts


        var $qtiInteractions = $content.find('.key-navigation-focusable,.qti-interaction') //filter out interaction as it will be managed separately
        .filter(function (i, node) {
          return !$(node).parents('.qti-interaction').length;
        }); // the item focusable body elements are considered scrollable

        $content.find('.key-navigation-focusable').addClass('key-navigation-scrollable'); // each navigable area will get its own keyNavigator

        $qtiInteractions.each(function (itemPos, itemElement) {
          var $itemElement = $(itemElement); // detect the type of choices: checkbox or radio

          var $choiceInput = $itemElement.find('.qti-choice input');
          var choiceType = $choiceInput.attr('type');

          if ($itemElement.hasClass('qti-interaction')) {
            //add navigable elements from prompt
            $itemElement.find('.key-navigation-focusable').each(function (navPos, nav) {
              var $nav = $(nav);

              if (!$nav.closest('.qti-choice').length) {
                addNavigator($nav, $nav);
              }
            }); //reset interaction custom key navigation to override the behaviour with the new one

            $itemElement.off('.keyNavigation'); //search for inputs that represent the interaction focusable choices

            var $inputs = $itemElement.is(':input') ? $itemElement : $itemElement.find(':input');

            if (config.flatNavigation && (config.flatRadioNavigation || choiceType !== 'radio')) {
              $inputs.each(function (i, input) {
                var navigator = addInputsNavigator($(input), $itemElement);
                manageLabelledByAttribute(navigator);
              });
            } else {
              var navigator = addInputsNavigator($inputs, $itemElement, true, function () {
                // keep default positioning for now
                var position = -1; // autofocus the selected radio button if any

                $inputs.each(function (index, input) {
                  if (input.checked) {
                    position = index;
                  }
                });
                return position;
              });
              manageLabelledByAttribute(navigator); // applies WCAG behavior for the radio buttons

              if (navigator && config.wcagBehavior) {
                navigator.on('focus', function (cursor) {
                  var $element = cursor.navigable.getElement();

                  if (!$element.is(':checked')) {
                    $element.click();
                  }
                });
              }
            }
          } else {
            addNavigator($itemElement, $itemElement);
          }
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

    return itemNavigation;

});
