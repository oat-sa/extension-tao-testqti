define(['lodash', 'i18n', 'ui/component', 'ui/itemButtonList', 'taoQtiTest/runner/helpers/map', 'handlebars'], function (_, __, componentFactory, itemButtonListFactory, mapHelper, Handlebars) { 'use strict';

    _ = _ && Object.prototype.hasOwnProperty.call(_, 'default') ? _['default'] : _;
    __ = __ && Object.prototype.hasOwnProperty.call(__, 'default') ? __['default'] : __;
    componentFactory = componentFactory && Object.prototype.hasOwnProperty.call(componentFactory, 'default') ? componentFactory['default'] : componentFactory;
    itemButtonListFactory = itemButtonListFactory && Object.prototype.hasOwnProperty.call(itemButtonListFactory, 'default') ? itemButtonListFactory['default'] : itemButtonListFactory;
    mapHelper = mapHelper && Object.prototype.hasOwnProperty.call(mapHelper, 'default') ? mapHelper['default'] : mapHelper;
    Handlebars = Handlebars && Object.prototype.hasOwnProperty.call(Handlebars, 'default') ? Handlebars['default'] : Handlebars;

    var Template = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
      this.compilerInfo = [4,'>= 1.0.0'];
    helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
      var buffer = "", stack1, helper, options, self=this, helperMissing=helpers.helperMissing, escapeExpression=this.escapeExpression;

    function program1(depth0,data) {
      
      
      return " hidden";
      }

      buffer += "<div class=\"qti-panel qti-navigator";
      stack1 = helpers['if'].call(depth0, (depth0 && depth0.hidden), {hash:{},inverse:self.noop,fn:self.program(1, program1, data),data:data});
      if(stack1 || stack1 === 0) { buffer += stack1; }
      buffer += " qti-navigator-fizzy\">\n    <div class=\"qti-navigator-header\">\n        <div class=\"qti-navigator-text\">"
        + escapeExpression((helper = helpers.__ || (depth0 && depth0.__),options={hash:{},data:data},helper ? helper.call(depth0, "Test overview", options) : helperMissing.call(depth0, "__", "Test overview", options)))
        + "</div>\n        <a class=\"icon-close\" href=\"#\" onclick=\"return false\" aria-hidden=\"true\"></a>\n    </div>\n    <nav class=\"qti-navigator-tree\"></nav>\n    <div id=\"qti-navigator-linear\" class=\"qti-navigator-linear\">\n        <p class=\"qti-navigator-message\">\n            "
        + escapeExpression((helper = helpers.__ || (depth0 && depth0.__),options={hash:{},data:data},helper ? helper.call(depth0, "In this part of the test navigation is not allowed.", options) : helperMissing.call(depth0, "__", "In this part of the test navigation is not allowed.", options)))
        + "\n        </p>\n    </div>\n</div>\n";
      return buffer;
      });
    function navigatorTpl(data, options, asString) {
      var html = Template(data, options);
      return (asString || true) ? html : $(html);
    }

    var Template$1 = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
      this.compilerInfo = [4,'>= 1.0.0'];
    helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
      var buffer = "", stack1, functionType="function", escapeExpression=this.escapeExpression, self=this;

    function program1(depth0,data) {
      
      var buffer = "", stack1;
      buffer += "\n    ";
      stack1 = helpers.each.call(depth0, (depth0 && depth0.parts), {hash:{},inverse:self.noop,fn:self.program(2, program2, data),data:data});
      if(stack1 || stack1 === 0) { buffer += stack1; }
      buffer += "\n";
      return buffer;
      }
    function program2(depth0,data) {
      
      var buffer = "", stack1;
      buffer += "\n        ";
      stack1 = helpers.each.call(depth0, (depth0 && depth0.sections), {hash:{},inverse:self.noop,fn:self.program(3, program3, data),data:data});
      if(stack1 || stack1 === 0) { buffer += stack1; }
      buffer += "\n    ";
      return buffer;
      }
    function program3(depth0,data) {
      
      var buffer = "", stack1, helper;
      buffer += "\n            <li class=\"qti-navigator-section\">\n                <div class=\"qti-navigator-label\" title=\"";
      if (helper = helpers.label) { stack1 = helper.call(depth0, {hash:{},data:data}); }
      else { helper = (depth0 && depth0.label); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
      buffer += escapeExpression(stack1)
        + "\">\n                    ";
      if (helper = helpers.label) { stack1 = helper.call(depth0, {hash:{},data:data}); }
      else { helper = (depth0 && depth0.label); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
      buffer += escapeExpression(stack1)
        + "\n                </div>\n                <div class=\"qti-navigator-items\"></div>\n            </li>\n        ";
      return buffer;
      }

    function program5(depth0,data) {
      
      
      return "\n    <li class=\"qti-navigator-section\">\n        <div class=\"qti-navigator-items\"></div>\n    </li>\n";
      }

      buffer += "<ol class=\"qti-navigator-sections plain\">\n";
      stack1 = helpers['if'].call(depth0, (depth0 && depth0.displaySectionTitles), {hash:{},inverse:self.program(5, program5, data),fn:self.program(1, program1, data),data:data});
      if(stack1 || stack1 === 0) { buffer += stack1; }
      buffer += "\n</ol>\n";
      return buffer;
      });
    function navigatorTreeTpl(data, options, asString) {
      var html = Template$1(data, options);
      return (asString || true) ? html : $(html);
    }

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
     * Copyright (c) 2022 (original work) Open Assessment Technologies SA ;
     */
    /**
     * Some default values
     * @type {Object}
     * @private
     */

    var _defaults = {
      scope: 'test',
      preventsUnseen: true
    };
    /**
     * List of common CSS selectors
     * @type {Object}
     * @private
     */

    var _selectors = {
      component: '.qti-navigator',
      tree: '.qti-navigator-tree',
      linearState: '.qti-navigator-linear',
      closeButton: '.icon-close',
      itemButtonListContainer: '.qti-navigator-items'
    };
    /**
     * @param {Object} config
     * @param {String} [config.scope] Limit the review screen to a particular scope: test, testPart, testSection
     * @param {Boolean} [config.preventsUnseen] Prevents the test taker to access unseen items
     * @returns {*}
     */

    function navigatorFactory(config) {
      var component;
      /**
       * Handle click on an item: jump to the position, if allowed
       * @param {String} itemId
       */

      function onItemClick(itemId) {
        var item = mapHelper.getItem(component.map, itemId);
        var activeItem = mapHelper.getItem(component.map, component.testContext.itemIdentifier);

        if (item && item.id && !component.is('disabled')) {
          if (!(component.disableUnseenItems && !item.viewed) && (!activeItem || item.position !== activeItem.position)) {
            component.select(item.position);
            /**
             * A jump to a particular item is required
             * @event navigator#jump
             * @param {Number} position - The item position on which jump
             */

            component.trigger('jump', item.position);
          }
        }
      }
      /**
       * Render items
       * @param {Object} fizzyItemButtonMap - list of items in format needed for rendering
       * @param {String} activeItemId
       */


      function renderItemButtonListComponents(fizzyItemButtonMap, activeItemId) {
        component.itemButtonListComponents.forEach(function (c) {
          return c.destroy();
        });
        component.itemButtonListComponents = [];
        component.controls.$tree.find(_selectors.itemButtonListContainer).each(function (index, itemButtonListContainerElem) {
          var itemButtonListComponent = itemButtonListFactory({
            items: fizzyItemButtonMap.sections[index].items,
            scrollContainer: component.controls.$tree
          }).render(itemButtonListContainerElem).on('click', function (_ref) {
            var id = _ref.id;
            return onItemClick(id);
          });
          component.itemButtonListComponents.push(itemButtonListComponent);
        });
        component.itemButtonListComponents.forEach(function (c) {
          return c.setActiveItem(activeItemId);
        });
      }
      /**
       * Get list of items in format needed for rendering
       * @param {Object} scopedMap - test map, limited to the scope
       * @param {Boolean} disableUnseenItems
       * @returns {Object}
       */


      function getFizzyItemButtonMap(scopedMap, disableUnseenItems) {
        var _component$getConfig = component.getConfig(),
            displaySectionTitles = _component$getConfig.displaySectionTitles,
            displayItemTooltip = _component$getConfig.displayItemTooltip;

        var nonInformationalCount = 0;
        var fizzyMap = {
          sections: []
        };

        _.forEach(scopedMap.parts, function (part) {
          _.forEach(part.sections, function (dataSection) {
            var fizzySection;

            if (displaySectionTitles) {
              fizzySection = {
                label: dataSection.label,
                items: []
              };
              fizzyMap.sections.push(fizzySection);
            } else {
              if (fizzyMap.sections.length) {
                fizzySection = fizzyMap.sections[0];
              } else {
                fizzySection = {
                  items: []
                };
                fizzyMap.sections.push(fizzySection);
              }
            }

            _.forEach(dataSection.items, function (dataItem) {
              if (!dataItem.informational) {
                nonInformationalCount++;
              }

              var fizzyItem = {
                id: dataItem.id,
                position: dataItem.position
              };
              fizzySection.items.push(fizzyItem);
              fizzyItem.numericLabel = dataItem.informational ? '' : "".concat(nonInformationalCount);

              if (dataItem.informational) {
                fizzyItem.icon = 'info';
                fizzyItem.ariaLabel = __('Informational item');
              } else if (dataItem.flagged) {
                fizzyItem.icon = 'flagged';
                fizzyItem.ariaLabel = __('Bookmarked question %s', nonInformationalCount);
              } else {
                fizzyItem.icon = null;
                fizzyItem.ariaLabel = __('Question %s', nonInformationalCount);
              }

              if (dataItem.answered) {
                fizzyItem.status = 'answered';
              } else if (dataItem.viewed) {
                fizzyItem.status = 'viewed';
              } else {
                fizzyItem.status = 'unseen';
              }

              if (disableUnseenItems && !dataItem.viewed) {
                // disables all unseen items to prevent the test taker has access to.
                fizzyItem.disabled = true;
              } else if (displayItemTooltip) {
                fizzyItem.title = dataItem.label;
              }
            });
          });
        });

        return fizzyMap;
      }
      /**
       *
       * @type {Object}
       */


      var navigatorApi = {
        /**
         * Set the marked state of an item
         * @param {Number} position
         * @param {Boolean} flag
         */
        setItemFlag: function setItemFlag(position, flag) {
          var updatedMap = _.cloneDeep(this.map);

          var updatedItem = mapHelper.getItemAt(updatedMap, position);

          if (updatedItem && updatedItem.id) {
            updatedItem.flagged = flag;
            var updatedScopeMap = mapHelper.getScopeMapFromContext(updatedMap, this.testContext, this.config.scope);
            var updatedFizzyMap = getFizzyItemButtonMap(updatedScopeMap, this.disableUnseenItems);
            var updatedItemData;

            _.forEach(updatedFizzyMap.sections, function (fizzySection) {
              updatedItemData = _.find(fizzySection.items, function (fizzyItem) {
                return fizzyItem.id === updatedItem.id;
              });

              if (updatedItemData) {
                return false;
              }
            });

            this.itemButtonListComponents.forEach(function (c) {
              return c.updateItem(updatedItem.id, updatedItemData);
            });
          }
        },

        /**
         * Update the config
         * @returns {navigatorApi}
         */
        updateConfig: function updateConfig() {
          //not implemented
          return this;
        },

        /**
         * Updates the review screen
         * @param {Object} map The current test map
         * @param {Object} context The current test context
         * @returns {navigatorApi}
         * @fires navigator#update
         */
        update: function update(map, context) {
          var scopedMap = mapHelper.getScopeMapFromContext(map, context, this.config.scope);
          scopedMap.displaySectionTitles = this.getConfig().displaySectionTitles;
          var activeItemId = context.itemIdentifier;
          var isSkipaheadEnabled = mapHelper.hasItemCategory(map, activeItemId, 'x-tao-option-review-skipahead');
          this.map = map;
          this.testContext = context;
          this.disableUnseenItems = this.config.preventsUnseen && !isSkipaheadEnabled; // rebuild the tree

          var testPart = mapHelper.getPart(map, context.testPartId);

          if (!testPart.isLinear) {
            this.setState('skipahead-enabled', isSkipaheadEnabled);
            this.setState('prevents-unseen', this.config.preventsUnseen);
            this.controls.$linearState.hide();
            this.controls.$tree.html(navigatorTreeTpl(scopedMap));
            var fizzyItemButtonMap = getFizzyItemButtonMap(scopedMap, this.disableUnseenItems);
            renderItemButtonListComponents(fizzyItemButtonMap, activeItemId);
          } else {
            this.controls.$linearState.show();
            this.controls.$tree.empty();
          }
          /**
           * @event navigator#update the navigation data have changed
           */


          this.trigger('update');
          return this;
        },

        /**
         * Selects an item
         * @param {Number} position The item's position
         */
        select: function select(position) {
          var previousPosition = 0;
          var previousItem = mapHelper.getItem(this.map, this.testContext.itemIdentifier);

          if (previousItem && previousItem.id) {
            previousPosition = previousItem.position;
          }

          var item = mapHelper.getItemAt(this.map, parseInt(position));

          if (item && item.id) {
            this.itemButtonListComponents.forEach(function (c) {
              return c.setActiveItem(item.id);
            });
          }
          /**
           * An item is selected
           * @param {Number} position - The item position on which select
           * @param {Number} previousPosition - The item position from which select
           * @event navigator#selected
           */


          this.trigger('selected', position, previousPosition);
        }
      };
      component = componentFactory(navigatorApi, _defaults).setTemplate(navigatorTpl).on('init', function () {
        this.itemButtonListComponents = [];
      }).on('destroy', function () {
        this.controls = null;
        this.itemButtonListComponents.forEach(function (c) {
          return c.destroy();
        });
        this.itemButtonListComponents = [];
      }).on('render', function () {
        var $component = this.getElement();
        this.controls = {
          $tree: $component.find(_selectors.tree),
          $linearState: $component.find(_selectors.linearState),
          $closeButton: $component.find(_selectors.closeButton)
        };
        this.controls.$closeButton.on('click', function (e) {
          e.preventDefault();
          /**
           * Review screen should be closed
           * @event navigator#close
           */

          component.trigger('close');
        });
      }).on('enable', function () {
        this.itemButtonListComponents.forEach(function (c) {
          return c.enable();
        });
      }).on('disable', function () {
        this.itemButtonListComponents.forEach(function (c) {
          return c.disable();
        });
      });
      return component.init(config);
    }

    return navigatorFactory;

});
