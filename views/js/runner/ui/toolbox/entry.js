define(['lodash', 'ui/component', 'handlebars'], function (_, componentFactory, Handlebars) { 'use strict';

    _ = _ && Object.prototype.hasOwnProperty.call(_, 'default') ? _['default'] : _;
    componentFactory = componentFactory && Object.prototype.hasOwnProperty.call(componentFactory, 'default') ? componentFactory['default'] : componentFactory;
    Handlebars = Handlebars && Object.prototype.hasOwnProperty.call(Handlebars, 'default') ? Handlebars['default'] : Handlebars;

    var Template = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
      this.compilerInfo = [4,'>= 1.0.0'];
    helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
      var buffer = "", stack1, helper, functionType="function", escapeExpression=this.escapeExpression, self=this;

    function program1(depth0,data) {
      
      var buffer = "", stack1, helper;
      buffer += " ";
      if (helper = helpers.className) { stack1 = helper.call(depth0, {hash:{},data:data}); }
      else { helper = (depth0 && depth0.className); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
      buffer += escapeExpression(stack1);
      return buffer;
      }

    function program3(depth0,data) {
      
      var buffer = "", stack1;
      buffer += "\n        aria-"
        + escapeExpression(((stack1 = (data == null || data === false ? data : data.key)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
        + "=\""
        + escapeExpression((typeof depth0 === functionType ? depth0.apply(depth0) : depth0))
        + "\"\n    ";
      return buffer;
      }

    function program5(depth0,data) {
      
      var buffer = "", stack1, helper;
      buffer += "<span class=\"icon icon-";
      if (helper = helpers.icon) { stack1 = helper.call(depth0, {hash:{},data:data}); }
      else { helper = (depth0 && depth0.icon); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
      buffer += escapeExpression(stack1);
      stack1 = helpers.unless.call(depth0, (depth0 && depth0.text), {hash:{},inverse:self.noop,fn:self.program(6, program6, data),data:data});
      if(stack1 || stack1 === 0) { buffer += stack1; }
      buffer += "\"></span>";
      return buffer;
      }
    function program6(depth0,data) {
      
      
      return " no-label";
      }

    function program8(depth0,data) {
      
      var buffer = "", stack1, helper;
      buffer += "<span class=\"text\">";
      if (helper = helpers.text) { stack1 = helper.call(depth0, {hash:{},data:data}); }
      else { helper = (depth0 && depth0.text); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
      buffer += escapeExpression(stack1)
        + "</span>";
      return buffer;
      }

      buffer += "<li\n    data-control=\"";
      if (helper = helpers.control) { stack1 = helper.call(depth0, {hash:{},data:data}); }
      else { helper = (depth0 && depth0.control); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
      buffer += escapeExpression(stack1)
        + "\"\n    class=\"small btn-info action";
      stack1 = helpers['if'].call(depth0, (depth0 && depth0.className), {hash:{},inverse:self.noop,fn:self.program(1, program1, data),data:data});
      if(stack1 || stack1 === 0) { buffer += stack1; }
      buffer += "\"\n    title=\"";
      if (helper = helpers.title) { stack1 = helper.call(depth0, {hash:{},data:data}); }
      else { helper = (depth0 && depth0.title); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
      buffer += escapeExpression(stack1)
        + "\"\n    role=\"button\"\n    ";
      stack1 = helpers.each.call(depth0, (depth0 && depth0.aria), {hash:{},inverse:self.noop,fn:self.program(3, program3, data),data:data});
      if(stack1 || stack1 === 0) { buffer += stack1; }
      buffer += "\n>\n    <a class=\"li-inner\" href=\"#\" onclick=\"return false\" aria-hidden=\"true\" >\n        ";
      stack1 = helpers['if'].call(depth0, (depth0 && depth0.icon), {hash:{},inverse:self.noop,fn:self.program(5, program5, data),data:data});
      if(stack1 || stack1 === 0) { buffer += stack1; }
      buffer += "\n        ";
      stack1 = helpers['if'].call(depth0, (depth0 && depth0.text), {hash:{},inverse:self.noop,fn:self.program(8, program8, data),data:data});
      if(stack1 || stack1 === 0) { buffer += stack1; }
      buffer += "\n    </a>\n</li>\n";
      return buffer;
      });
    function entryTpl(data, options, asString) {
      var html = Template(data, options);
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
     * Copyright (c) 2017 (original work) Open Assessment Technologies SA;
     */
    var itemComponentApi = {
      /**
       * Initialise the item
       */
      initItem: function initItem() {
        this.id = this.config.control;
        this.menu = null;
      },

      /**
       * Get the type of the component
       */
      getType: function getType() {
        return 'entry';
      },

      /**
       * Get the item Id
       * @returns {String}
       */
      getId: function getId() {
        return this.id;
      },

      /**
       * Set the menu to whom the item belong
       * @param {String} menuId
       * @returns {String}
       */
      setMenuId: function setMenuId(menuId) {
        this.menuId = menuId;
      },

      /**
       * Get the id of the menu to whom the item belong
       * @returns {String}
       */
      getMenuId: function getMenuId() {
        return this.menuId;
      },

      /**
       * Set the item as active. For example, if it opens a tool,
       * the item should be represented 'on' as long as the tool remains opened
       */
      turnOn: function turnOn() {
        this.setState('active', true);
        var element = this.getElement();

        if (!element || element.attr('role') !== 'option') {
          // Not pretty bit quick
          return;
        }

        element.attr('aria-selected', 'true') // JAWS ignores aria-selected attribute
        .attr('aria-checked', 'true'); // NVDA not read aria-selected="true"
      },

      /**
       * Set the item as inactive
       */
      turnOff: function turnOff() {
        this.setState('active', false);
        var element = this.getElement();

        if (!element || element.attr('role') !== 'option') {
          // Not pretty bit quick
          return;
        }

        element.attr('aria-selected', 'false') // NVDA + Chrome ignores aria-checked="false"
        .attr('aria-checked', 'false');
      },

      /**
       * Set the item as hovered, whether by the mouse or by keyboard navigation
       */
      hoverOn: function hoverOn() {
        this.setState('hover', true);
      },

      /**
       * Turn off the hovered style
       */
      hoverOff: function hoverOff() {
        this.setState('hover', false);
      }
    };
    /**
     * The item factory
     */

    function itemComponentFactory(specs, defaults) {
      var itemComponent;
      specs = _.defaults(specs || {}, itemComponentApi);
      itemComponent = componentFactory(specs, defaults).setTemplate(entryTpl).on('enable', function () {
        if (this.is('rendered')) {
          this.$component.removeProp('disabled');
        }
      }).on('disable', function () {
        if (this.is('rendered')) {
          this.$component.prop('disabled', true);
          this.turnOff();
        }
      }).on('init', function () {
        this.initItem();
      }).on('render', function () {
        var self = this;
        this.disable(); // we always render disabled by default
        // forward DOM events to the component object

        this.$component.on('mousedown', function (event) {
          self.trigger('mousedown', event);
        }).on('click', function (event) {
          self.trigger('click', event);
        });
      });
      return itemComponent;
    }

    return itemComponentFactory;

});
