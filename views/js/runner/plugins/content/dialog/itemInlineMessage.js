define(['jquery', 'i18n', 'ui/hider', 'taoTests/runner/plugin', 'handlebars', 'taoQtiTest/runner/helpers/navigation'], function ($$1, __, hider, pluginFactory, Handlebars, navigationHelper) { 'use strict';

    $$1 = $$1 && Object.prototype.hasOwnProperty.call($$1, 'default') ? $$1['default'] : $$1;
    __ = __ && Object.prototype.hasOwnProperty.call(__, 'default') ? __['default'] : __;
    pluginFactory = pluginFactory && Object.prototype.hasOwnProperty.call(pluginFactory, 'default') ? pluginFactory['default'] : pluginFactory;
    Handlebars = Handlebars && Object.prototype.hasOwnProperty.call(Handlebars, 'default') ? Handlebars['default'] : Handlebars;
    navigationHelper = navigationHelper && Object.prototype.hasOwnProperty.call(navigationHelper, 'default') ? navigationHelper['default'] : navigationHelper;

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
     * Copyright (c) 2016  (original work) Open Assessment Technologies SA;
     *
     * @author Alexander Zagovorichev <zagovorichev@1pt.com>
     */
    /**
     * The display of the next button
     */

    var buttonData = {
      next: {
        control: 'move-forward',
        title: __('Submit and go to the next item'),
        icon: 'forward',
        text: __('OK')
      },
      end: {
        control: 'move-end',
        title: __('Submit and go to the end of the test'),
        icon: 'fast-forward',
        text: __('OK & End test')
      }
    };
    /**
     * Returns the configured plugin
     */

    var itemInlineMessage = pluginFactory({
      name: 'itemInlineMessage',

      /**
       * Initialize the plugin (called during runner's init)
       */
      init: function init() {
        var self = this;
        var testRunner = this.getTestRunner();
        /**
         * Create the button based on the current context
         * @returns {*|jQuery|HTMLElement} the button
         */

        var createOkButton = function createElement() {
          var testContext = testRunner.getTestContext();
          var testMap = testRunner.getTestMap();
          var dataType = navigationHelper.isLast(testMap, testContext.itemIdentifier) ? 'end' : 'next';
          var $btn = $$1(buttonTpl(buttonData[dataType]));
          $btn.addClass('modalFeedback-button'); //plugin behavior

          $btn.on('click', function (e) {
            e.preventDefault();
            self.disable();

            if ($$1(this).data('control') === 'move-end') {
              self.trigger('end');
            }

            $btn.remove();
            self.$element.remove();
            self.trigger('resume', self);
          });
          return $btn;
        };

        this.$button = createOkButton();
        this.$element = $$1(this.getContent().dom);
      },

      /**
       * Called during the runner's render phase
       */
      render: function render() {
        var $navigationContainer = this.getAreaBroker().getNavigationArea();
        var testRunner = this.getTestRunner();
        var itemRunner = testRunner.itemRunner;
        var $inlineContainer = this.getContent().$container;

        if (!$inlineContainer && itemRunner._item.container) {
          $inlineContainer = $$1('.qti-itemBody', itemRunner._item.container);
        }

        $inlineContainer.append(this.$element); // hide all navigation buttons, create new instead of

        if (!$$1('.modalFeedback-button', $navigationContainer).length) {
          $navigationContainer.append(this.$button);
        }
      },

      /**
       * Enable the button
       */
      enable: function enable() {
        this.$button.removeProp('disabled').removeClass('disabled');
      },
      disable: function disable() {
        this.$button.prop('disabled', true).addClass('disabled');
      },

      /**
       * Called during the runner's destroy phase
       */
      destroy: function destroy() {
        this.$button.click();
      }
    });

    return itemInlineMessage;

});
