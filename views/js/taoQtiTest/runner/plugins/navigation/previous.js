define(['jquery', 'lodash', 'i18n', 'ui/hider', 'taoTests/runner/plugin', 'util/shortcut', 'util/namespace', 'taoQtiTest/runner/helpers/navigation', 'taoQtiTest/runner/helpers/map', 'handlebars'], function ($$1, _, __, hider, pluginFactory, shortcut, namespaceHelper, navigationHelper, mapHelper, Handlebars) { 'use strict';

    $$1 = $$1 && Object.prototype.hasOwnProperty.call($$1, 'default') ? $$1['default'] : $$1;
    _ = _ && Object.prototype.hasOwnProperty.call(_, 'default') ? _['default'] : _;
    __ = __ && Object.prototype.hasOwnProperty.call(__, 'default') ? __['default'] : __;
    hider = hider && Object.prototype.hasOwnProperty.call(hider, 'default') ? hider['default'] : hider;
    pluginFactory = pluginFactory && Object.prototype.hasOwnProperty.call(pluginFactory, 'default') ? pluginFactory['default'] : pluginFactory;
    shortcut = shortcut && Object.prototype.hasOwnProperty.call(shortcut, 'default') ? shortcut['default'] : shortcut;
    namespaceHelper = namespaceHelper && Object.prototype.hasOwnProperty.call(namespaceHelper, 'default') ? namespaceHelper['default'] : namespaceHelper;
    navigationHelper = navigationHelper && Object.prototype.hasOwnProperty.call(navigationHelper, 'default') ? navigationHelper['default'] : navigationHelper;
    mapHelper = mapHelper && Object.prototype.hasOwnProperty.call(mapHelper, 'default') ? mapHelper['default'] : mapHelper;
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
     * Returns the configured plugin
     */

    var previous = pluginFactory({
      name: 'previous',

      /**
       * Initialize the plugin (called during runner's init)
       */
      init: function init() {
        var _this = this;

        var self = this;
        var testRunner = this.getTestRunner();
        var testRunnerOptions = testRunner.getOptions();
        var pluginShortcuts = (testRunnerOptions.shortcuts || {})[this.getName()] || {};
        /**
         * Check if the "Previous" functionality should be available or not
         */

        var canDoPrevious = function canDoPrevious() {
          var testMap = testRunner.getTestMap();
          var context = testRunner.getTestContext();
          var currentSection = testRunner.getCurrentSection();
          var noExitTimedSectionWarning = mapHelper.hasItemCategory(testMap, context.itemIdentifier, 'noExitTimedSectionWarning', true);
          var currentPart = testRunner.getCurrentPart();
          var previousSection;
          var previousPart; // check TestMap if empty

          if (_.isPlainObject(testMap) && _.size(testMap) === 0) {
            return false;
          } //first item of the test


          if (navigationHelper.isFirst(testMap, context.itemIdentifier)) {
            return false;
          } //first item of a section


          if (navigationHelper.isFirstOf(testMap, context.itemIdentifier, 'section')) {
            //when entering an adaptive section,
            //you can't leave the section from the beginning
            if (currentSection.isCatAdaptive) {
              return false;
            } //if the previous section is adaptive or a timed section


            previousSection = mapHelper.getItemSection(testMap, context.itemPosition - 1);

            if (previousSection.isCatAdaptive || previousSection.timeConstraint && !noExitTimedSectionWarning) {
              return false;
            }
          }

          if (navigationHelper.isFirstOf(testMap, context.itemIdentifier, 'part')) {
            //if the previous part is linear, we don't enter it too
            previousPart = mapHelper.getItemPart(testMap, context.itemPosition - 1);

            if (previousPart.isLinear) {
              return false;
            }
          }

          return currentPart.isLinear === false && context.canMoveBackward === true;
        };
        /**
         * Hide the plugin if the Previous functionality shouldn't be available
         */


        var toggle = function toggle() {
          if (canDoPrevious()) {
            self.show();
          } else {
            self.hide();
          }
        }; //build element (detached)


        this.$element = $$1(buttonTpl({
          control: 'move-backward',
          title: __('Submit and go to the previous item'),
          icon: 'backward',
          text: __('Previous')
        })); //attach behavior

        function doPrevious(previousItemWarning) {
          var context = testRunner.getTestContext();

          function enableNav() {
            testRunner.trigger('enablenav');
          }

          function triggerAction() {
            testRunner.previous();
          }

          testRunner.trigger('disablenav');

          if (self.getState('enabled') !== false) {
            if (previousItemWarning && context.remainingAttempts !== -1) {
              testRunner.trigger('confirm.previous', __('You are about to go to the previous item. Click OK to continue and go to the previous item.'), triggerAction, // if the test taker accept
              enableNav // if he refuses
              );
            } else {
              triggerAction();
            }
          }
        }

        this.$element.on('click', function (e) {
          e.preventDefault();
          testRunner.trigger('nav-previous');
        });

        var registerShortcut = function registerShortcut(kbdShortcut) {
          if (testRunnerOptions.allowShortcuts && kbdShortcut) {
            shortcut.add(namespaceHelper.namespaceAll(kbdShortcut, _this.getName(), true), function () {
              if (canDoPrevious() && self.getState('enabled') === true) {
                testRunner.trigger('nav-previous', [true]);
              }
            }, {
              avoidInput: true,
              prevent: true
            });
          }
        };

        registerShortcut(pluginShortcuts.trigger); //start disabled

        toggle();
        self.disable(); //update plugin state based on changes

        testRunner.on('loaditem', toggle).on('enablenav', function () {
          self.enable();
        }).on('disablenav', function () {
          self.disable();
        }).on('hidenav', function () {
          self.hide();
        }).on('shownav', function () {
          self.show();
        }).on('nav-previous', function (previousItemWarning) {
          doPrevious(previousItemWarning);
        }).on('enableaccessibilitymode', function () {
          var kbdShortcut = pluginShortcuts.triggerAccessibility;

          if (kbdShortcut && !_this.getState('eaccessibilitymode')) {
            shortcut.remove(".".concat(_this.getName()));
            registerShortcut(kbdShortcut);

            _this.setState('eaccessibilitymode');
          }
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
        shortcut.remove(".".concat(this.getName()));
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

    return previous;

});
