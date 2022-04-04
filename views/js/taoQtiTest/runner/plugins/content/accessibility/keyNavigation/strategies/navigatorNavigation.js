define(['lodash', 'ui/keyNavigation/navigator', 'ui/keyNavigation/navigableDomElement', 'taoQtiTest/runner/plugins/content/accessibility/keyNavigation/helpers'], function (_, keyNavigator, navigableDomElement, helpers) { 'use strict';

    _ = _ && Object.prototype.hasOwnProperty.call(_, 'default') ? _['default'] : _;
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
     * List of CSS selectors for the navigables
     * @type {Object}
     */

    var selectors = {
      filters: '.qti-navigator-filters .qti-navigator-filter',
      enabledItems: '.qti-navigator-tree .qti-navigator-item:not(.disabled) .qti-navigator-label'
    };
    /**
     * For 'fizzy' navigator layout, builds the navigator navigation strategy.
     *
     * @returns {keyNavigationStrategy}
     */

    function initFizzy(config, $panel, $navigator, keyNavigators, managedNavigators) {
      var itemsNavigator;
      var $navigatorTree = $panel.find('.qti-navigator-tree');
      var $enabledItems = $navigator.find('.qti-navigator-tree .buttonlist-item:not(.disabled) .buttonlist-btn');
      var navigableItems = navigableDomElement.createFromDoms($enabledItems);
      /**
       * Get item wrapper from navigable button
       * (`navigable`: '.buttonlist-btn'; `parent()`: '.buttonlist-item')
       * @returns {jQuery}
       */

      var getItemFromNavigable = function getItemFromNavigable(navigable) {
        return navigable.getElement().parent();
      };

      if (navigableItems.length) {
        itemsNavigator = keyNavigator({
          id: 'navigator-items',
          elements: navigableItems,
          group: $navigatorTree,
          loop: true,
          defaultPosition: function defaultPosition(navigableElements) {
            var pos = _.findIndex(navigableElements, function (navigable) {
              var $parent = getItemFromNavigable(navigable);

              if ($parent.hasClass('buttonlist-item-active') && $parent.is(':visible')) {
                return true;
              }
            });

            return pos >= 0 ? pos : 0;
          }
        }).on('focus', function (cursor) {
          getItemFromNavigable(cursor.navigable).addClass('key-navigation-highlight');
        }).on('blur', function (cursor) {
          getItemFromNavigable(cursor.navigable).removeClass('key-navigation-highlight');
        });
        helpers.setupItemsNavigator(itemsNavigator, {
          keyNextItem: config.keyNextItem,
          keyPrevItem: config.keyPrevItem
        });
        helpers.setupClickableNavigator(itemsNavigator);
        keyNavigators.push(itemsNavigator);
        managedNavigators.push(itemsNavigator);
      }
    }
    /**
     * Key navigator strategy applying onto the navigation panel.
     * @type {Object} keyNavigationStrategy
     */


    var navigatorNavigation = {
      name: 'navigator',

      /**
       * Builds the navigator navigation strategy.
       *
       * @returns {keyNavigationStrategy}
       */
      init: function init() {
        var config = this.getConfig();
        var $panel = this.getTestRunner().getAreaBroker().getPanelArea();
        var $navigator = $panel.find('.qti-navigator');
        var isFizzyLayout = $navigator.hasClass('qti-navigator-fizzy');
        this.managedNavigators = [];
        this.keyNavigators = [];

        if ($navigator.length && !$navigator.hasClass('disabled')) {
          if (isFizzyLayout) {
            initFizzy(config, $panel, $navigator, this.keyNavigators, this.managedNavigators);
          } else {
            var $testStatusHeader = $navigator.find('.qti-navigator-info.collapsible > .qti-navigator-label');
            var navigableTestStatus = navigableDomElement.createFromDoms($testStatusHeader);
            $testStatusHeader.addClass('key-navigation-actionable');

            if (navigableTestStatus.length) {
              var testStatusNavigation = keyNavigator({
                keepState: config.keepState,
                id: 'navigator-test-status',
                propagateTab: false,
                elements: navigableTestStatus,
                group: $testStatusHeader
              });
              helpers.setupItemsNavigator(testStatusNavigation, {
                keyNextItem: config.keyNextTab || config.keyNextItem,
                keyPrevItem: config.keyPrevTab || config.keyPrevItem
              });
              this.keyNavigators.push(testStatusNavigation);
              this.managedNavigators.push(testStatusNavigation);
            }

            var filtersNavigator;
            var itemsNavigator; //the tag to identify if the item listing has been browsed, to only "smart jump" to active item only on the first visit

            var itemListingVisited = false; //the position of the filter in memory, to only "smart jump" to active item only on the first visit

            var currentFilter;
            var $filters = $navigator.find(selectors.filters);
            var navigableFilters = navigableDomElement.createFromDoms($filters);

            if (navigableFilters.length) {
              filtersNavigator = keyNavigator({
                keepState: config.keepState,
                id: 'navigator-filters',
                propagateTab: false,
                elements: navigableFilters,
                group: $navigator.find('.qti-navigator-filters')
              });
              helpers.setupItemsNavigator(filtersNavigator, {
                keyNextItem: config.keyNextTab || config.keyNextItem,
                keyPrevItem: config.keyPrevTab || config.keyPrevItem
              });
              helpers.setupClickableNavigator(filtersNavigator);

              if (config.keepState) {
                filtersNavigator.on('focus', function (cursor) {
                  if (config.keepState) {
                    var $element = cursor.navigable.getElement();
                    var filter = $element.data('mode');
                    $element.click();

                    if (currentFilter !== filter) {
                      itemListingVisited = false;
                    }

                    currentFilter = filter;
                  }
                });
              }

              if (config.keyNextContent) {
                filtersNavigator.on(config.keyNextContent, function (elem) {
                  if (helpers.allowedToNavigateFrom(elem) && itemsNavigator) {
                    _.defer(function () {
                      if (itemListingVisited) {
                        itemsNavigator.first();
                      } else {
                        itemsNavigator.focus();
                      }
                    });
                  }
                });
              }

              if (config.keyPrevContent) {
                filtersNavigator.on(config.keyPrevContent, function (elem) {
                  if (helpers.allowedToNavigateFrom(elem) && itemsNavigator) {
                    _.defer(function () {
                      itemsNavigator.last();
                    });
                  }
                });
              }

              this.keyNavigators.push(filtersNavigator);
              this.managedNavigators.push(filtersNavigator);
            }

            var $navigatorTree = $panel.find('.qti-navigator-tree');
            var $trees = $navigator.find(selectors.enabledItems);
            var navigableTrees = navigableDomElement.createFromDoms($trees);
            $trees.first().addClass('key-navigation-scrollable-up');
            $trees.last().addClass('key-navigation-scrollable-down');

            if (navigableTrees.length) {
              //instantiate a key navigator but do not add it to the returned list of navigators as this is not supposed to be reached with tab key
              itemsNavigator = keyNavigator({
                id: 'navigator-items',
                elements: navigableTrees,
                group: $navigatorTree,
                defaultPosition: function defaultPosition(navigableElements) {
                  var pos = 0;

                  if (config.flatNavigation || currentFilter !== 'flagged') {
                    pos = _.findIndex(navigableElements, function (navigable) {
                      var $parent = navigable.getElement().parent('.qti-navigator-item');

                      if ($parent.hasClass('active') && $parent.is(':visible')) {
                        return true;
                      }
                    });
                  }

                  return pos;
                }
              }).on('focus', function (cursor) {
                itemListingVisited = true;
                cursor.navigable.getElement().parent().addClass('key-navigation-highlight');
              }).on('blur', function (cursor) {
                cursor.navigable.getElement().parent().removeClass('key-navigation-highlight');
              });
              helpers.setupItemsNavigator(itemsNavigator, {
                keyNextItem: config.keyNextContent || config.keyNextItem,
                keyPrevItem: config.keyPrevContent || config.keyPrevItem
              });
              helpers.setupClickableNavigator(itemsNavigator);

              if (config.keepState) {
                itemsNavigator.on('lowerbound upperbound', function () {
                  if (filtersNavigator) {
                    filtersNavigator.focus();
                  }
                });
              }

              if (config.keyNextTab && config.keyPrevTab) {
                itemsNavigator.on(config.keyNextTab, function (elem) {
                  if (helpers.allowedToNavigateFrom(elem) && filtersNavigator) {
                    filtersNavigator.focus().next();
                  }
                });
                itemsNavigator.on(config.keyPrevTab, function (elem) {
                  if (helpers.allowedToNavigateFrom(elem) && filtersNavigator) {
                    filtersNavigator.focus().previous();
                  }
                });
              } else {
                this.keyNavigators.push(itemsNavigator);
              }

              this.managedNavigators.push(itemsNavigator);
            }
          }
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
        this.managedNavigators.forEach(function (navigator) {
          return navigator.destroy();
        });
        this.managedNavigators = [];
        this.keyNavigators = [];
        return this;
      }
    };

    return navigatorNavigation;

});
