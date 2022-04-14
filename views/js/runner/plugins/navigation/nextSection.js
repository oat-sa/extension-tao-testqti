define(['jquery', 'lodash', 'i18n', 'ui/hider', 'taoTests/runner/plugin', 'taoQtiTest/runner/helpers/messages', 'handlebars', 'taoQtiTest/runner/helpers/map'], function ($$1, _, __, hider, pluginFactory, messages, Handlebars, mapHelper) { 'use strict';

    $$1 = $$1 && Object.prototype.hasOwnProperty.call($$1, 'default') ? $$1['default'] : $$1;
    _ = _ && Object.prototype.hasOwnProperty.call(_, 'default') ? _['default'] : _;
    __ = __ && Object.prototype.hasOwnProperty.call(__, 'default') ? __['default'] : __;
    hider = hider && Object.prototype.hasOwnProperty.call(hider, 'default') ? hider['default'] : hider;
    pluginFactory = pluginFactory && Object.prototype.hasOwnProperty.call(pluginFactory, 'default') ? pluginFactory['default'] : pluginFactory;
    messages = messages && Object.prototype.hasOwnProperty.call(messages, 'default') ? messages['default'] : messages;
    Handlebars = Handlebars && Object.prototype.hasOwnProperty.call(Handlebars, 'default') ? Handlebars['default'] : Handlebars;
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
     * Copyright (c) 2015-2019 (original work) Open Assessment Technologies SA ;
     */
    var nextSection = pluginFactory({
      name: 'nextsection',
      init: function init() {
        var self = this;
        var testRunner = this.getTestRunner();
        var testRunnerOptions = testRunner.getOptions();
        /**
         * Retrieve the nexSection categories of the current item
         * @returns {Object} the calculator categories
         */

        function getNextSectionCategories() {
          var testContext = testRunner.getTestContext();
          var testMap = testRunner.getTestMap();
          return {
            nextSection: mapHelper.hasItemCategory(testMap, testContext.itemIdentifier, 'nextSection', true),
            nextSectionWarning: mapHelper.hasItemCategory(testMap, testContext.itemIdentifier, 'nextSectionWarning', true),
            noExitTimedSectionWarning: mapHelper.hasItemCategory(testMap, testContext.itemIdentifier, 'noExitTimedSectionWarning', true)
          };
        }

        function toggle() {
          var categories = getNextSectionCategories();

          if (testRunnerOptions.nextSection && (categories.nextSection || categories.nextSectionWarning)) {
            self.show();
          } else {
            self.hide();
          }
        }

        function nextSection() {
          testRunner.next('section');
        }
        /**
         * Check if warn section leaving dialog enabled to prevent showing double dialogs
         * @returns {Boolean}
         */


        var isWarnSectionLeavingEabled = function isWarnSectionLeavingEabled() {
          var testContext = testRunner.getTestContext();
          var categories = getNextSectionCategories();
          var timeConstraints = testContext.timeConstraints || [];
          return timeConstraints.some(function (_ref) {
            var source = _ref.source;
            return source === testContext.sectionId;
          }) && !categories.noExitTimedSectionWarning && !(testRunnerOptions.timer || {}).keepUpToTimeout;
        };

        this.$element = $$1(buttonTpl({
          control: 'next-section',
          title: __('Skip to the next section'),
          icon: 'fast-forward',
          text: __('Next Section')
        }));
        this.$element.on('click', function (e) {
          var enable = _.bind(self.enable, self);

          var categories = getNextSectionCategories();
          e.preventDefault();

          if (self.getState('enabled') !== false) {
            self.disable();

            if (categories.nextSectionWarning && !isWarnSectionLeavingEabled()) {
              var submitButtonLabel = __('CONTINUE TO THE NEXT SECTION');

              testRunner.trigger('confirm.nextsection', messages.getExitMessage('section', testRunner, '', false, submitButtonLabel), nextSection, // if the test taker accept
              enable, // if the test taker refuse
              {
                buttons: {
                  labels: {
                    ok: submitButtonLabel,
                    cancel: __('CANCEL')
                  }
                }
              });
            } else {
              nextSection();
            }
          }
        });
        this.disable();
        toggle();
        testRunner.on('loaditem', toggle).on('enablenav', function () {
          self.enable();
        }).on('disablenav', function () {
          self.disable();
        }).on('hidenav', function () {
          self.hide();
        }).on('shownav', function () {
          self.show();
        });
      },

      /**
       * Called during the runner's render phase
       */
      render: function render() {
        //attach the element to the navigation area
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

    return nextSection;

});
