define(['i18n', 'lodash', 'ui/component', 'ui/keyNavigation/navigator', 'ui/keyNavigation/navigableDomElement', 'handlebars'], function (__, _, component, keyNavigator, navigableDomElement, Handlebars) { 'use strict';

    __ = __ && Object.prototype.hasOwnProperty.call(__, 'default') ? __['default'] : __;
    _ = _ && Object.prototype.hasOwnProperty.call(_, 'default') ? _['default'] : _;
    component = component && Object.prototype.hasOwnProperty.call(component, 'default') ? component['default'] : component;
    keyNavigator = keyNavigator && Object.prototype.hasOwnProperty.call(keyNavigator, 'default') ? keyNavigator['default'] : keyNavigator;
    navigableDomElement = navigableDomElement && Object.prototype.hasOwnProperty.call(navigableDomElement, 'default') ? navigableDomElement['default'] : navigableDomElement;
    Handlebars = Handlebars && Object.prototype.hasOwnProperty.call(Handlebars, 'default') ? Handlebars['default'] : Handlebars;

    var Template = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
      this.compilerInfo = [4,'>= 1.0.0'];
    helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
      var buffer = "", stack1, helper, options, functionType="function", escapeExpression=this.escapeExpression, self=this, helperMissing=helpers.helperMissing;

    function program1(depth0,data) {
      
      var buffer = "", stack1, helper;
      buffer += "\n        <div class=\"shortcuts-group-wrapper\">\n            <h3 class=\"shortcuts-group-title\">";
      if (helper = helpers.label) { stack1 = helper.call(depth0, {hash:{},data:data}); }
      else { helper = (depth0 && depth0.label); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
      buffer += escapeExpression(stack1)
        + "</h3>\n            <ul class=\"shortcuts-group-list\">\n                ";
      stack1 = helpers.each.call(depth0, (depth0 && depth0.shortcuts), {hash:{},inverse:self.noop,fn:self.program(2, program2, data),data:data});
      if(stack1 || stack1 === 0) { buffer += stack1; }
      buffer += "\n            </ul>\n        </div>\n        ";
      return buffer;
      }
    function program2(depth0,data) {
      
      var buffer = "", stack1, helper;
      buffer += "\n                <li class=\"shortcut-item\">\n                    <span class=\"shortcut-item-shortcut\">\n                        <kbd>";
      if (helper = helpers.shortcut) { stack1 = helper.call(depth0, {hash:{},data:data}); }
      else { helper = (depth0 && depth0.shortcut); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
      buffer += escapeExpression(stack1)
        + "</kbd>\n                    </span>\n                    <span class=\"shortcut-item-action\">\n                        ";
      if (helper = helpers.label) { stack1 = helper.call(depth0, {hash:{},data:data}); }
      else { helper = (depth0 && depth0.label); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
      buffer += escapeExpression(stack1)
        + "\n                    </span>\n                </li>\n                ";
      return buffer;
      }

      buffer += "<div class=\"shortcuts-list-wrapper\">\n    <div class=\"shortcuts-list\" role=\"dialog\" aria-modal=\"true\" aria-labelledby=\"jumplinks/shortcuts-heading\"\n        aria-describedby=\"jumplinks/shortcuts-description\">\n        <h2 class=\"shortcuts-list-title\" id=\"jumplinks/shortcuts-heading\">\n            "
        + escapeExpression((helper = helpers.__ || (depth0 && depth0.__),options={hash:{},data:data},helper ? helper.call(depth0, "Keyboard Navigation", options) : helperMissing.call(depth0, "__", "Keyboard Navigation", options)))
        + "\n        </h2>\n        <div id=\"jumplinks/shortcuts-description\">\n            <p class=\"shortcuts-list-description\">\n                "
        + escapeExpression((helper = helpers.__ || (depth0 && depth0.__),options={hash:{},data:data},helper ? helper.call(depth0, "Keyboard shortcuts for the Accessibility Tools are available to the Test-taker.", options) : helperMissing.call(depth0, "__", "Keyboard shortcuts for the Accessibility Tools are available to the Test-taker.", options)))
        + "\n            </p>\n            <p class=\"shortcuts-list-description\">\n                "
        + escapeExpression((helper = helpers.__ || (depth0 && depth0.__),options={hash:{},data:data},helper ? helper.call(depth0, "You can magnify the content by up to 200%. Check your browser settings to find out how to do it.", options) : helperMissing.call(depth0, "__", "You can magnify the content by up to 200%. Check your browser settings to find out how to do it.", options)))
        + "\n            </p>\n        </div>\n        <button aria-label=\"Close dialog\" class=\"btn-close small\" data-control=\"close-btn\" type=\"button\">\n            <span class=\"icon-close\"></span>\n        </button>\n        ";
      stack1 = helpers.each.call(depth0, (depth0 && depth0.shortcutsGroups), {hash:{},inverse:self.noop,fn:self.program(1, program1, data),data:data});
      if(stack1 || stack1 === 0) { buffer += stack1; }
      buffer += "\n    </div>\n</div>\n";
      return buffer;
      });
    function shortcutsTpl(data, options, asString) {
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
     * Copyright (c) 2020 (original work) Open Assessment Technologies SA ;
     */
    /**
     * Default config values, see below.
     */

    var defaults = {
      shortcutsGroups: [{
        id: 'navigation-shortcuts',
        label: __('Navigation shortcuts'),
        shortcuts: [{
          id: 'next',
          shortcut: 'ALT + Shift + N',
          label: __('Go to the next question')
        }, {
          id: 'previous',
          shortcut: 'ALT + Shift + P',
          label: __('Go to the previous question')
        }, {
          id: 'current',
          shortcut: 'ALT + Shift + Q',
          label: __('Go to the current question')
        }, {
          id: 'top',
          shortcut: 'ALT + Shift + T',
          label: __('Go to the top of the page')
        }]
      }]
    };
    /**
     * Creates and initialize the shortcuts component.
     * Please not the component IS NOT rendered.
     * You'll have to render it by yourself.
     *
     * @param {Object} config
     * @returns {shortcutsBox} the component, initialized and rendered
     */

    function shortcutsBoxFactory(config) {
      var ESK_KEY_CODE = 27;
      var shortcutsBox = component({}, defaults).on('render', function () {
        var _this = this;

        var $element = this.getElement();
        var $closeBtn = $element.find('.btn-close');
        var $keyNavigationItems = this.getElement().find('.shortcuts-list, .btn-close');
        $closeBtn.on('click', function () {
          return _this.trigger('close');
        }); // handle overlay click

        $element.on('click', function (e) {
          if ($element.is(e.target)) {
            _this.trigger('close');
          }
        });
        $element.on('keyup', function (e) {
          if (e.keyCode === ESK_KEY_CODE) {
            _this.trigger('close');
          }
        });
        this.navigator = keyNavigator({
          elements: navigableDomElement.createFromDoms($keyNavigationItems),
          propagateTab: false
        }) // keep cursor at close button
        .on('tab', function () {
          this.setCursorAt(1);
        }).on('shift+tab', function () {
          this.setCursorAt(1);
        }) // prevent focus move from shortcuts modal
        .on('blur', function () {
          _.defer(function () {
            if (!_this.navigator.isFocused()) {
              _this.navigator.focus();
            }
          });
        }).on('activate', function (cursor) {
          cursor.navigable.getElement().click();
        });
        this.navigator.first();
      }).on('destroy', function () {
        this.navigator.destroy();
        this.getElement().remove();
      });
      shortcutsBox.setTemplate(shortcutsTpl);
      shortcutsBox.init(config);
      return shortcutsBox;
    }

    return shortcutsBoxFactory;

});
