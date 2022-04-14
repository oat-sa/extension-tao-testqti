define(['jquery', 'lodash', 'taoTests/runner/plugin', 'handlebars', 'taoQtiTest/runner/helpers/map', 'taoQtiTest/runner/helpers/getTimerMessage', 'moment', 'taoQtiTest/runner/helpers/stats'], function ($$1, _, pluginFactory, Handlebars, mapHelper, getTimerMessage, moment, statsHelper) { 'use strict';

    $$1 = $$1 && Object.prototype.hasOwnProperty.call($$1, 'default') ? $$1['default'] : $$1;
    _ = _ && Object.prototype.hasOwnProperty.call(_, 'default') ? _['default'] : _;
    pluginFactory = pluginFactory && Object.prototype.hasOwnProperty.call(pluginFactory, 'default') ? pluginFactory['default'] : pluginFactory;
    Handlebars = Handlebars && Object.prototype.hasOwnProperty.call(Handlebars, 'default') ? Handlebars['default'] : Handlebars;
    mapHelper = mapHelper && Object.prototype.hasOwnProperty.call(mapHelper, 'default') ? mapHelper['default'] : mapHelper;
    getTimerMessage = getTimerMessage && Object.prototype.hasOwnProperty.call(getTimerMessage, 'default') ? getTimerMessage['default'] : getTimerMessage;
    moment = moment && Object.prototype.hasOwnProperty.call(moment, 'default') ? moment['default'] : moment;
    statsHelper = statsHelper && Object.prototype.hasOwnProperty.call(statsHelper, 'default') ? statsHelper['default'] : statsHelper;

    var Template = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
      this.compilerInfo = [4,'>= 1.0.0'];
    helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
      var buffer = "", stack1, functionType="function", escapeExpression=this.escapeExpression, self=this;

    function program1(depth0,data) {
      
      var buffer = "", stack1, helper;
      buffer += "\n        <span data-control=\"";
      if (helper = helpers.attribute) { stack1 = helper.call(depth0, {hash:{},data:data}); }
      else { helper = (depth0 && depth0.attribute); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
      buffer += escapeExpression(stack1)
        + "\" class=\"qti-controls ";
      if (helper = helpers.className) { stack1 = helper.call(depth0, {hash:{},data:data}); }
      else { helper = (depth0 && depth0.className); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
      buffer += escapeExpression(stack1)
        + "\"></span>\n        <div data-control=\"";
      if (helper = helpers.attribute) { stack1 = helper.call(depth0, {hash:{},data:data}); }
      else { helper = (depth0 && depth0.attribute); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
      buffer += escapeExpression(stack1)
        + "-timer\" class=\"visible-hidden\"></div>\n    ";
      return buffer;
      }

      buffer += "<div role=\"heading\" aria-level=\"1\" class=\"title-box truncate\">\n    ";
      stack1 = helpers.each.call(depth0, (depth0 && depth0.titles), {hash:{},inverse:self.noop,fn:self.program(1, program1, data),data:data});
      if(stack1 || stack1 === 0) { buffer += stack1; }
      buffer += "\n</div>\n";
      return buffer;
      });
    function titleTpl(data, options, asString) {
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
     * Copyright (c) 2016 (original work) Open Assessment Technologies SA ;
     */
    var precision = 1000;
    var title = pluginFactory({
      name: 'title',
      init: function init() {
        var _this = this;

        var testRunner = this.getTestRunner();
        var testMap = testRunner.getTestMap();

        var updateTitles = function updateTitles() {
          var testContext = testRunner.getTestContext();
          var currentPart = mapHelper.getItemPart(testMap, testContext.itemPosition);
          var currentItem = mapHelper.getItem(testMap, testContext.itemIdentifier); // update test title

          if (testMap.title) {
            _this.titles.test.$title.text(testMap.title).show();
          } // update part title


          if (currentPart && currentPart.label) {
            _this.titles.testPart.$title.text(" - ".concat(currentPart.label)).show();
          } // update section title
          //@deprecated the following block seems to
          //be very specific and need to be reworked


          if (testContext.isDeepestSectionVisible) {
            var section = mapHelper.getItemSection(testMap, testContext.itemPosition); //testContext.sectionTitle is kept only for backward compat

            _this.titles.section.$title.text(" - ".concat(section.label || testContext.sectionTitle)).show();
          } // update item title


          if (currentItem.label) {
            _this.titles.item.$title.text(" - ".concat(currentItem.label)).show();
          }
        };

        testRunner.after('renderitem', function () {
          _.forOwn(_this.titles, function (options, scope) {
            _this.titles[scope].$title.text('');

            _this.titles[scope].$timer.text('');

            if (scope !== 'item') {
              _this.titles[scope].stats = statsHelper.getInstantStats(scope, testRunner);
            }
          });

          updateTitles();
        }).on('timertick', function (remainingTime, scope) {
          var title = _this.titles[scope];

          if (!title) {
            return;
          }

          var _this$titles$scope = _this.titles[scope],
              $timer = _this$titles$scope.$timer,
              stats = _this$titles$scope.stats;
          var time = moment.duration(remainingTime / precision, 'seconds');
          var hours = time.get('hours');
          var minutes = time.get('minutes');
          var seconds = time.get('seconds');
          var unansweredQuestions = stats && stats.questions - stats.answered; // check if notification should be updated

          if ($timer) {
            $timer.text(getTimerMessage(hours, minutes, seconds, unansweredQuestions));
          }
        }).on('unloaditem', function () {
          $$1('.qti-controls', _this.$element).hide();
        });
      },
      render: function render() {
        var _this2 = this;

        var $container = this.getAreaBroker().getControlArea();
        this.titles = {
          test: {
            attribute: 'qti-test-title',
            className: ''
          },
          testPart: {
            attribute: 'qti-test-part-title',
            className: 'visible-hidden'
          },
          section: {
            attribute: 'qti-test-position',
            className: ''
          },
          item: {
            attribute: 'qti-test-item-title',
            className: 'visible-hidden'
          }
        };
        this.$element = $$1(titleTpl({
          titles: _.values(this.titles)
        })); // hide titles by default

        $$1('.qti-controls', this.$element).hide();
        $container.append(this.$element);

        _.forOwn(this.titles, function (_ref, scope) {
          var attribute = _ref.attribute;
          _this2.titles[scope].$title = $container.find("[data-control=\"".concat(attribute, "\"]"));
          _this2.titles[scope].$timer = $container.find("[data-control=\"".concat(attribute, "-timer\"]"));
        });
      }
    });

    return title;

});
