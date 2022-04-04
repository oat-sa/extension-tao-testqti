define(['jquery', 'i18n', 'ui/hider', 'taoTests/runner/plugin', 'taoQtiTest/runner/helpers/messages', 'handlebars', 'taoQtiTest/runner/helpers/navigation', 'taoQtiTest/runner/helpers/map'], function ($$1, __, hider, pluginFactory, messages, Handlebars, navigationHelper, mapHelper) { 'use strict';

    $$1 = $$1 && Object.prototype.hasOwnProperty.call($$1, 'default') ? $$1['default'] : $$1;
    __ = __ && Object.prototype.hasOwnProperty.call(__, 'default') ? __['default'] : __;
    hider = hider && Object.prototype.hasOwnProperty.call(hider, 'default') ? hider['default'] : hider;
    pluginFactory = pluginFactory && Object.prototype.hasOwnProperty.call(pluginFactory, 'default') ? pluginFactory['default'] : pluginFactory;
    messages = messages && Object.prototype.hasOwnProperty.call(messages, 'default') ? messages['default'] : messages;
    Handlebars = Handlebars && Object.prototype.hasOwnProperty.call(Handlebars, 'default') ? Handlebars['default'] : Handlebars;
    navigationHelper = navigationHelper && Object.prototype.hasOwnProperty.call(navigationHelper, 'default') ? navigationHelper['default'] : navigationHelper;
    mapHelper = mapHelper && Object.prototype.hasOwnProperty.call(mapHelper, 'default') ? mapHelper['default'] : mapHelper;

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
    function buttonTpl(data, options, asString) {
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
     * Copyright (c) 2016-2019 (original work) Open Assessment Technologies SA ;
     */
    /**
     * The display of the skip
     */

    var buttonData = {
      skip: {
        control: 'skip',
        title: __('Skip and go to the next item'),
        icon: 'external',
        text: __('Skip')
      },
      end: {
        control: 'skip-end',
        title: __('Skip and go to the end of the test'),
        icon: 'external',
        text: __('Skip and end test')
      }
    };
    /**
     * Create the button based on the current context
     * @param {Object} testRunner - testRunner
     * @returns {jQueryElement} the button
     */

    var createElement = function createElement(testRunner) {
      var testContext = testRunner.getTestContext();
      var testMap = testRunner.getTestMap();
      var isLast = navigationHelper.isLast(testMap, testContext.itemIdentifier);
      var dataType = isLast ? 'end' : 'skip';
      return $$1(buttonTpl(buttonData[dataType]));
    };
    /**
     * Update the button based on the context
     * @param {jQueryElement} $element - the element to update
     * @param {Boolean} [isLast=false] - are we on the last item ?
     */


    var updateElement = function updateElement($element) {
      var isLast = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
      var dataType = isLast ? 'end' : 'skip';
      var button = buttonData[dataType];

      if (button && $element.attr('data-control') !== button.control) {
        $element.attr('data-control', button.control).attr('title', button.title).find('.text').text(button.text);
      }
    };
    /**
     * Returns the configured plugin
     */


    var skip = pluginFactory({
      name: 'skip',

      /**
       * Initialize the plugin (called during runner's init)
       */
      init: function init() {
        var _this = this;

        var testRunner = this.getTestRunner();

        var toggle = function toggle() {
          var testContext = testRunner.getTestContext();

          if (testContext.allowSkipping === true) {
            _this.show();

            return true;
          }

          _this.hide();

          return false;
        };

        function doSkip() {
          testRunner.skip();
        }

        this.$element = createElement(testRunner);
        this.$element.on('click', function (e) {
          var enable = _this.enable.bind(_this);

          var testContext = testRunner.getTestContext();
          var testMap = testRunner.getTestMap();
          var isLast = navigationHelper.isLast(testMap, testContext.itemIdentifier);
          var endTestWarning = mapHelper.hasItemCategory(testMap, testContext.itemIdentifier, 'endTestWarning', true);
          e.preventDefault();

          if (_this.getState('enabled') !== false) {
            _this.disable();

            if (endTestWarning && isLast) {
              testRunner.trigger('confirm.endTest', messages.getExitMessage('test', testRunner), doSkip, // if the test taker accept
              enable // if the test taker refuse
              );
            } else {
              doSkip();
            }
          }
        });
        toggle();
        this.disable();
        testRunner.on('loaditem', function () {
          if (toggle()) {
            var testContext = testRunner.getTestContext();
            var testMap = testRunner.getTestMap();
            var isLast = navigationHelper.isLast(testMap, testContext.itemIdentifier);
            updateElement(_this.$element, isLast);
          }
        }).on('enablenav', function () {
          return _this.enable();
        }).on('disablenav', function () {
          return _this.disable();
        }).on('hidenav', function () {
          return _this.hide();
        }).on('shownav', function () {
          return _this.show();
        });
      },

      /**
       * Called during the runner's render phase
       */
      render: function render() {
        var $container = this.getAreaBroker().getNavigationArea();
        $container.append(this.$element);
      },

      /**
       * Called during the runner's destroy phase
       */
      destroy: function destroy() {
        this.$element.remove();
      },

      /**
       * Enable the button
       */
      enable: function enable() {
        this.$element.removeProp('disabled').removeClass('disabled');
      },

      /**
       * Disable the button
       */
      disable: function disable() {
        this.$element.prop('disabled', true).addClass('disabled');
      },

      /**
       * Show the button
       */
      show: function show() {
        hider.show(this.$element);
      },

      /**
       * Hide the button
       */
      hide: function hide() {
        hider.hide(this.$element);
      }
    });

    return skip;

});
