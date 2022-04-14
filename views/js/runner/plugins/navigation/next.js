define(['jquery', 'i18n', 'ui/hider', 'taoTests/runner/plugin', 'taoQtiTest/runner/plugins/navigation/next/nextWarningHelper', 'taoQtiTest/runner/helpers/messages', 'taoQtiTest/runner/helpers/map', 'taoQtiTest/runner/helpers/navigation', 'taoQtiTest/runner/helpers/stats', 'util/shortcut', 'util/namespace', 'handlebars'], function ($$1, __, hider, pluginFactory, nextWarningHelper, messages, mapHelper, navigationHelper, statsHelper, shortcut, namespaceHelper, Handlebars) { 'use strict';

    $$1 = $$1 && Object.prototype.hasOwnProperty.call($$1, 'default') ? $$1['default'] : $$1;
    __ = __ && Object.prototype.hasOwnProperty.call(__, 'default') ? __['default'] : __;
    hider = hider && Object.prototype.hasOwnProperty.call(hider, 'default') ? hider['default'] : hider;
    pluginFactory = pluginFactory && Object.prototype.hasOwnProperty.call(pluginFactory, 'default') ? pluginFactory['default'] : pluginFactory;
    nextWarningHelper = nextWarningHelper && Object.prototype.hasOwnProperty.call(nextWarningHelper, 'default') ? nextWarningHelper['default'] : nextWarningHelper;
    messages = messages && Object.prototype.hasOwnProperty.call(messages, 'default') ? messages['default'] : messages;
    mapHelper = mapHelper && Object.prototype.hasOwnProperty.call(mapHelper, 'default') ? mapHelper['default'] : mapHelper;
    navigationHelper = navigationHelper && Object.prototype.hasOwnProperty.call(navigationHelper, 'default') ? navigationHelper['default'] : navigationHelper;
    statsHelper = statsHelper && Object.prototype.hasOwnProperty.call(statsHelper, 'default') ? statsHelper['default'] : statsHelper;
    shortcut = shortcut && Object.prototype.hasOwnProperty.call(shortcut, 'default') ? shortcut['default'] : shortcut;
    namespaceHelper = namespaceHelper && Object.prototype.hasOwnProperty.call(namespaceHelper, 'default') ? namespaceHelper['default'] : namespaceHelper;
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
     * The display of the next button
     */

    var buttonData = {
      next: {
        control: 'move-forward',
        title: __('Submit and go to the next item'),
        specificTitle: __('Submit and go to the item %s'),
        icon: 'forward',
        text: __('Next')
      },
      end: {
        control: 'move-end',
        title: __('Submit and go to the end of the test'),
        icon: 'fast-forward',
        text: __('End test')
      }
    };
    /**
     * Create the button based on the current context
     * @param {Boolean} [isLast=false] - is the current item the last
     * @returns {jQueryElement} the button
     */

    var createElement = function createElement() {
      var isLast = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;
      var dataType = isLast ? 'end' : 'next';
      return $$1(buttonTpl(buttonData[dataType]));
    };
    /**
     * Makes an element enabled
     * @param  {jQuery} $element
     * @returns {jQuery}
     */


    var enableElement = function enableElement($element) {
      return $element.removeProp('disabled').removeClass('disabled');
    };
    /**
     * Makes an element disabled
     * @param  {jQuery} $element
     * @returns {jQuery}
     */


    var disableElement = function disableElement($element) {
      return $element.prop('disabled', true).addClass('disabled');
    };
    /**
     * Update the button based on the context
     * @param {jQueryElement} $element - the element to update
     * @param {TestRunner} [testRunner] - the test runner instance
     * @param {Boolean} [isLast=false] - is the current item the last
     */


    var updateElement = function updateElement($element, testRunner) {
      var isLast = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;
      var dataType = isLast ? 'end' : 'next';
      var testContext = testRunner.getTestContext();

      if (dataType === 'next' && !testContext.isAdaptive && !testContext.isCatAdaptive) {
        var testMap = testRunner.getTestMap();
        var nextItem = navigationHelper.getNextItem(testMap, testContext.itemPosition);
        $element.attr('title', __(buttonData.next.specificTitle, nextItem.label));
      } else {
        $element.attr('title', buttonData[dataType].title);
      }

      if ($element.attr('data-control') !== buttonData[dataType].control) {
        $element.attr('data-control', buttonData[dataType].control).find('.text').text(buttonData[dataType].text);

        if (dataType === 'next') {
          $element.find(".icon-".concat(buttonData.end.icon)).removeClass("icon-".concat(buttonData.end.icon)).addClass("icon-".concat(buttonData.next.icon));
        } else {
          $element.find(".icon-".concat(buttonData.next.icon)).removeClass("icon-".concat(buttonData.next.icon)).addClass("icon-".concat(buttonData.end.icon));
        }
      }
    };
    /**
     * Returns the configured plugin
     */


    var next = pluginFactory({
      name: 'next',

      /**
       * Initialize the plugin (called during runner's init)
       */
      init: function init() {
        var _this = this;

        var testRunner = this.getTestRunner();
        var testRunnerOptions = testRunner.getOptions();
        var pluginShortcuts = (testRunnerOptions.shortcuts || {})[this.getName()] || {};
        /**
         * Check if the current item is the last item
         * @returns {Boolean} true if the last
         */

        var isLastItem = function isLastItem() {
          var testContext = testRunner.getTestContext();
          var testMap = testRunner.getTestMap();
          var itemIdentifier = testContext.itemIdentifier;
          return navigationHelper.isLast(testMap, itemIdentifier);
        }; //plugin behavior

        /**
         * @param {Boolean} nextItemWarning - enable the display of a warning when going to the next item.
         * Note: the actual display of the warning depends on other conditions (see nextWarningHelper)
         */


        var doNext = function doNext(nextItemWarning) {
          var testContext = testRunner.getTestContext();
          var testMap = testRunner.getTestMap();
          var testPart = testRunner.getCurrentPart();
          var nextItemPosition = testContext.itemPosition + 1;
          var itemIdentifier = testContext.itemIdentifier; // x-tao-option-unansweredWarning is a deprecated option whose behavior now matches the one of

          var unansweredWarning = mapHelper.hasItemCategory(testMap, itemIdentifier, 'unansweredWarning', true); // x-tao-option-nextPartWarning with the unansweredOnly option

          var nextPartWarning = mapHelper.hasItemCategory(testMap, itemIdentifier, 'nextPartWarning', true) || unansweredWarning;
          var endTestWarning = mapHelper.hasItemCategory(testMap, itemIdentifier, 'endTestWarning', true); // this check to avoid an edge case where having both endTestWarning
          // and unansweredWarning options would prevent endTestWarning to behave normally

          var unansweredOnly = !endTestWarning && unansweredWarning;
          var warningScope = nextPartWarning ? 'part' : 'test';

          var enableNav = function enableNav() {
            return testRunner.trigger('enablenav');
          };

          var triggerNextAction = function triggerNextAction() {
            if (isLastItem()) {
              _this.trigger('end');
            }

            testRunner.next();
          };

          testRunner.trigger('disablenav');

          if (_this.getState('enabled') !== false) {
            var warningHelper = nextWarningHelper({
              endTestWarning: endTestWarning,
              isLast: isLastItem(),
              isLinear: testPart.isLinear,
              nextItemWarning: nextItemWarning,
              nextPartWarning: nextPartWarning,
              nextPart: mapHelper.getItemPart(testMap, nextItemPosition),
              remainingAttempts: testContext.remainingAttempts,
              testPartId: testContext.testPartId,
              unansweredWarning: unansweredWarning,
              stats: statsHelper.getInstantStats(warningScope, testRunner),
              unansweredOnly: unansweredOnly
            });

            if (warningHelper.shouldWarnBeforeEndPart()) {
              var submitButtonLabel = __('SUBMIT THIS PART');

              testRunner.trigger('confirm.endTestPart', messages.getExitMessage(warningScope, testRunner, '', false, submitButtonLabel), triggerNextAction, // if the test taker accept
              enableNav, // if he refuse
              {
                buttons: {
                  labels: {
                    ok: submitButtonLabel,
                    cancel: __('CANCEL')
                  }
                }
              });
            } else if (warningHelper.shouldWarnBeforeEnd()) {
              var _submitButtonLabel = __('SUBMIT THE TEST');

              testRunner.trigger('confirm.endTest', messages.getExitMessage(warningScope, testRunner, '', false, _submitButtonLabel), triggerNextAction, // if the test taker accept
              enableNav, // if he refuse
              {
                buttons: {
                  labels: {
                    ok: _submitButtonLabel,
                    cancel: __('CANCEL')
                  }
                }
              });
            } else if (warningHelper.shouldWarnBeforeNext()) {
              testRunner.trigger('confirm.next', __('You are about to go to the next item. Click OK to continue and go to the next item.'), triggerNextAction, // if the test taker accept
              enableNav // if he refuse
              );
            } else {
              triggerNextAction();
            }
          }
        }; //create the button (detached)


        this.$element = createElement(isLastItem()); //attach behavior

        this.$element.on('click', function (e) {
          e.preventDefault();
          disableElement(_this.$element);
          testRunner.trigger('nav-next');
        });

        var registerShortcut = function registerShortcut(kbdShortcut) {
          if (testRunnerOptions.allowShortcuts && kbdShortcut) {
            shortcut.add(namespaceHelper.namespaceAll(kbdShortcut, _this.getName(), true), function () {
              if (_this.getState('enabled') === true) {
                testRunner.trigger('nav-next', true);
              }
            }, {
              avoidInput: true,
              prevent: true
            });
          }
        };

        registerShortcut(pluginShortcuts.trigger); //disabled by default

        this.disable(); //change plugin state

        testRunner.on('loaditem', function () {
          updateElement(_this.$element, testRunner, isLastItem());
        }).on('enablenav', function () {
          return _this.enable();
        }).on('disablenav', function () {
          return _this.disable();
        }).on('hidenav', function () {
          return _this.hide();
        }).on('shownav', function () {
          return _this.show();
        }).on('nav-next', function (nextItemWarning) {
          return doNext(nextItemWarning);
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
        //attach the element to the navigation area
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
        enableElement(this.$element);
      },

      /**
       * Disable the button
       */
      disable: function disable() {
        disableElement(this.$element);
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

    return next;

});
