define(['jquery', 'lodash', 'ui/component', 'ui/autoscroll', 'taoQtiTest/runner/helpers/map', 'handlebars'], function ($$1, _, component, autoscroll, mapHelper, Handlebars) { 'use strict';

    $$1 = $$1 && Object.prototype.hasOwnProperty.call($$1, 'default') ? $$1['default'] : $$1;
    _ = _ && Object.prototype.hasOwnProperty.call(_, 'default') ? _['default'] : _;
    component = component && Object.prototype.hasOwnProperty.call(component, 'default') ? component['default'] : component;
    autoscroll = autoscroll && Object.prototype.hasOwnProperty.call(autoscroll, 'default') ? autoscroll['default'] : autoscroll;
    mapHelper = mapHelper && Object.prototype.hasOwnProperty.call(mapHelper, 'default') ? mapHelper['default'] : mapHelper;
    Handlebars = Handlebars && Object.prototype.hasOwnProperty.call(Handlebars, 'default') ? Handlebars['default'] : Handlebars;

    var Template = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
      this.compilerInfo = [4,'>= 1.0.0'];
    helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
      var buffer = "", stack1, helper, options, helperMissing=helpers.helperMissing, escapeExpression=this.escapeExpression, self=this;

    function program1(depth0,data) {
      
      
      return " hidden";
      }

    function program3(depth0,data) {
      
      var buffer = "", helper, options;
      buffer += "\n    <div class=\"qti-navigator-info collapsible\">\n                <span class=\"qti-navigator-label\">\n                    <span class=\"qti-navigator-text\">"
        + escapeExpression((helper = helpers.__ || (depth0 && depth0.__),options={hash:{},data:data},helper ? helper.call(depth0, "Test status", options) : helperMissing.call(depth0, "__", "Test status", options)))
        + "</span>\n                    <span class=\"icon-up\"></span>\n                    <span class=\"icon-down\"></span>\n                </span>\n        <ul class=\"collapsible-panel plain\">\n            <li class=\"qti-navigator-viewed\" title=\""
        + escapeExpression((helper = helpers.__ || (depth0 && depth0.__),options={hash:{},data:data},helper ? helper.call(depth0, "Viewed items", options) : helperMissing.call(depth0, "__", "Viewed items", options)))
        + "\">\n                        <span class=\"qti-navigator-label\">\n                            <span class=\"qti-navigator-icon icon-viewed\"></span>\n                            <span class=\"qti-navigator-text\">"
        + escapeExpression((helper = helpers.__ || (depth0 && depth0.__),options={hash:{},data:data},helper ? helper.call(depth0, "Viewed", options) : helperMissing.call(depth0, "__", "Viewed", options)))
        + "</span>\n                            <span class=\"qti-navigator-counter\">-/-</span>\n                        </span>\n            </li>\n            <li class=\"qti-navigator-answered\" title=\""
        + escapeExpression((helper = helpers.__ || (depth0 && depth0.__),options={hash:{},data:data},helper ? helper.call(depth0, "Completed items", options) : helperMissing.call(depth0, "__", "Completed items", options)))
        + "\">\n                        <span class=\"qti-navigator-label\">\n                            <span class=\"qti-navigator-icon icon-answered\"></span>\n                            <span class=\"qti-navigator-text\">"
        + escapeExpression((helper = helpers.__ || (depth0 && depth0.__),options={hash:{},data:data},helper ? helper.call(depth0, "Answered", options) : helperMissing.call(depth0, "__", "Answered", options)))
        + "</span>\n                            <span class=\"qti-navigator-counter\">-/-</span>\n                        </span>\n            </li>\n            <li class=\"qti-navigator-unanswered\" title=\""
        + escapeExpression((helper = helpers.__ || (depth0 && depth0.__),options={hash:{},data:data},helper ? helper.call(depth0, "Unanswered items", options) : helperMissing.call(depth0, "__", "Unanswered items", options)))
        + "\">\n                        <span class=\"qti-navigator-label\">\n                            <span class=\"qti-navigator-icon icon-unanswered\"></span>\n                            <span class=\"qti-navigator-text\">"
        + escapeExpression((helper = helpers.__ || (depth0 && depth0.__),options={hash:{},data:data},helper ? helper.call(depth0, "Unanswered", options) : helperMissing.call(depth0, "__", "Unanswered", options)))
        + "</span>\n                            <span class=\"qti-navigator-counter\">-/-</span>\n                        </span>\n            </li>\n            <li class=\"qti-navigator-flagged\" title=\""
        + escapeExpression((helper = helpers.__ || (depth0 && depth0.__),options={hash:{},data:data},helper ? helper.call(depth0, "Items marked for later review", options) : helperMissing.call(depth0, "__", "Items marked for later review", options)))
        + "\">\n                        <span class=\"qti-navigator-label\">\n                            <span class=\"qti-navigator-icon icon-flagged\"></span>\n                            <span class=\"qti-navigator-text\">"
        + escapeExpression((helper = helpers.__ || (depth0 && depth0.__),options={hash:{},data:data},helper ? helper.call(depth0, "Flagged", options) : helperMissing.call(depth0, "__", "Flagged", options)))
        + "</span>\n                            <span class=\"qti-navigator-counter\">-/-</span>\n                        </span>\n            </li>\n        </ul>\n    </div>\n    ";
      return buffer;
      }

    function program5(depth0,data) {
      
      
      return "(<span class=\"qti-navigator-counter\">0</span>)";
      }

    function program7(depth0,data) {
      
      
      return "icon-unanswered ";
      }

    function program9(depth0,data) {
      
      var buffer = "", helper, options;
      buffer += escapeExpression((helper = helpers.__ || (depth0 && depth0.__),options={hash:{},data:data},helper ? helper.call(depth0, "Unanswered", options) : helperMissing.call(depth0, "__", "Unanswered", options)))
        + " (<span class=\"qti-navigator-counter\">0</span>)";
      return buffer;
      }

    function program11(depth0,data) {
      
      
      return "icon-flagged ";
      }

    function program13(depth0,data) {
      
      var buffer = "", helper, options;
      buffer += escapeExpression((helper = helpers.__ || (depth0 && depth0.__),options={hash:{},data:data},helper ? helper.call(depth0, "Flagged", options) : helperMissing.call(depth0, "__", "Flagged", options)))
        + " (<span class=\"qti-navigator-counter\">0</span>)";
      return buffer;
      }

      buffer += "<div class=\"qti-panel qti-navigator qti-navigator-default";
      stack1 = helpers['if'].call(depth0, (depth0 && depth0.hidden), {hash:{},inverse:self.noop,fn:self.program(1, program1, data),data:data});
      if(stack1 || stack1 === 0) { buffer += stack1; }
      buffer += "\">\n    <div class=\"qti-navigator-collapsible\">\n        <span class=\"qti-navigator-collapse icon icon-left\" title=\""
        + escapeExpression((helper = helpers.__ || (depth0 && depth0.__),options={hash:{},data:data},helper ? helper.call(depth0, "Collapse the review panel", options) : helperMissing.call(depth0, "__", "Collapse the review panel", options)))
        + "\"></span>\n        <span class=\"qti-navigator-expand icon icon-right\" title=\""
        + escapeExpression((helper = helpers.__ || (depth0 && depth0.__),options={hash:{},data:data},helper ? helper.call(depth0, "Expand the review panel", options) : helperMissing.call(depth0, "__", "Expand the review panel", options)))
        + "\"></span>\n    </div>\n    ";
      stack1 = helpers['if'].call(depth0, (depth0 && depth0.showLegend), {hash:{},inverse:self.noop,fn:self.program(3, program3, data),data:data});
      if(stack1 || stack1 === 0) { buffer += stack1; }
      buffer += "\n\n\n    <div class=\"qti-navigator-filters\">\n        <ul role=\"tablist\" class=\"plain clearfix\">\n            <li role=\"tab\" aria-selected=\"true\" class=\"qti-navigator-filter active\" data-mode=\"all\">\n                <span title=\""
        + escapeExpression((helper = helpers.__ || (depth0 && depth0.__),options={hash:{},data:data},helper ? helper.call(depth0, "Reset filters", options) : helperMissing.call(depth0, "__", "Reset filters", options)))
        + "\" class=\"qti-navigator-tab\">"
        + escapeExpression((helper = helpers.__ || (depth0 && depth0.__),options={hash:{},data:data},helper ? helper.call(depth0, "All", options) : helperMissing.call(depth0, "__", "All", options)))
        + "\n                    ";
      stack1 = helpers.unless.call(depth0, (depth0 && depth0.showLegend), {hash:{},inverse:self.noop,fn:self.program(5, program5, data),data:data});
      if(stack1 || stack1 === 0) { buffer += stack1; }
      buffer += "\n                </span>\n            </li>\n\n            <li role=\"tab\" class=\"qti-navigator-filter\" data-mode=\"unanswered\">\n                <span class=\"";
      stack1 = helpers['if'].call(depth0, (depth0 && depth0.showLegend), {hash:{},inverse:self.noop,fn:self.program(7, program7, data),data:data});
      if(stack1 || stack1 === 0) { buffer += stack1; }
      buffer += "qti-navigator-tab\" title=\""
        + escapeExpression((helper = helpers.__ || (depth0 && depth0.__),options={hash:{},data:data},helper ? helper.call(depth0, "Only display the unanswered items", options) : helperMissing.call(depth0, "__", "Only display the unanswered items", options)))
        + "\">\n                    ";
      stack1 = helpers.unless.call(depth0, (depth0 && depth0.showLegend), {hash:{},inverse:self.noop,fn:self.program(9, program9, data),data:data});
      if(stack1 || stack1 === 0) { buffer += stack1; }
      buffer += "\n                </span>\n            </li>\n\n            <li role=\"tab\" class=\"qti-navigator-filter\" data-mode=\"flagged\">\n                <span class=\"";
      stack1 = helpers['if'].call(depth0, (depth0 && depth0.showLegend), {hash:{},inverse:self.noop,fn:self.program(11, program11, data),data:data});
      if(stack1 || stack1 === 0) { buffer += stack1; }
      buffer += "qti-navigator-tab\" title=\""
        + escapeExpression((helper = helpers.__ || (depth0 && depth0.__),options={hash:{},data:data},helper ? helper.call(depth0, "Only display the items marked for review", options) : helperMissing.call(depth0, "__", "Only display the items marked for review", options)))
        + "\">\n                    ";
      stack1 = helpers.unless.call(depth0, (depth0 && depth0.showLegend), {hash:{},inverse:self.noop,fn:self.program(13, program13, data),data:data});
      if(stack1 || stack1 === 0) { buffer += stack1; }
      buffer += "\n                </span>\n            </li>\n        </ul>\n    </div>\n\n    <nav class=\"qti-navigator-tree\"></nav>\n\n    <div id=\"qti-navigator-linear\" class=\"qti-navigator-linear\">\n        <span class=\"icon icon-info\" title=\""
        + escapeExpression((helper = helpers.__ || (depth0 && depth0.__),options={hash:{},data:data},helper ? helper.call(depth0, "In this part of the test navigation is not allowed.", options) : helperMissing.call(depth0, "__", "In this part of the test navigation is not allowed.", options)))
        + "\"></span>\n        <p class=\"qti-navigator-message\">\n            "
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
      var buffer = "", stack1, helperMissing=helpers.helperMissing, escapeExpression=this.escapeExpression, functionType="function", self=this;

    function program1(depth0,data) {
      
      var buffer = "", stack1, helper;
      buffer += "\n    <li class=\"qti-navigator-part collapsible ";
      stack1 = helpers['if'].call(depth0, (depth0 && depth0.active), {hash:{},inverse:self.program(4, program4, data),fn:self.program(2, program2, data),data:data});
      if(stack1 || stack1 === 0) { buffer += stack1; }
      buffer += "\" data-id=\"";
      if (helper = helpers.id) { stack1 = helper.call(depth0, {hash:{},data:data}); }
      else { helper = (depth0 && depth0.id); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
      buffer += escapeExpression(stack1)
        + "\">\n        <span class=\"qti-navigator-label\" title=\"";
      if (helper = helpers.label) { stack1 = helper.call(depth0, {hash:{},data:data}); }
      else { helper = (depth0 && depth0.label); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
      buffer += escapeExpression(stack1)
        + "\">\n            <span class=\"qti-navigator-text\">";
      if (helper = helpers.label) { stack1 = helper.call(depth0, {hash:{},data:data}); }
      else { helper = (depth0 && depth0.label); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
      buffer += escapeExpression(stack1)
        + "</span>\n            <span class=\"icon-up\"></span>\n            <span class=\"icon-down\"></span>\n        </span>\n        ";
      stack1 = helpers['if'].call(depth0, (depth0 && depth0.isLinear), {hash:{},inverse:self.program(8, program8, data),fn:self.program(6, program6, data),data:data});
      if(stack1 || stack1 === 0) { buffer += stack1; }
      buffer += "\n    </li>\n    ";
      return buffer;
      }
    function program2(depth0,data) {
      
      
      return "active";
      }

    function program4(depth0,data) {
      
      
      return "collapsed";
      }

    function program6(depth0,data) {
      
      var buffer = "", stack1, helper, options;
      buffer += "\n        <div class=\"qti-navigator-linear-part collapsible-panel\">\n            <span class=\"icon icon-info\" title=\""
        + escapeExpression((helper = helpers.__ || (depth0 && depth0.__),options={hash:{},data:data},helper ? helper.call(depth0, "In this part of the test navigation is not allowed.", options) : helperMissing.call(depth0, "__", "In this part of the test navigation is not allowed.", options)))
        + "\"></span>\n            <p class=\"qti-navigator-message\">\n                "
        + escapeExpression((helper = helpers.__ || (depth0 && depth0.__),options={hash:{},data:data},helper ? helper.call(depth0, "In this part of the test navigation is not allowed.", options) : helperMissing.call(depth0, "__", "In this part of the test navigation is not allowed.", options)))
        + "\n            </p>\n            <p class=\"qti-navigator-actions\">\n                <button class=\"btn-info small\" data-position=\"";
      if (helper = helpers.position) { stack1 = helper.call(depth0, {hash:{},data:data}); }
      else { helper = (depth0 && depth0.position); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
      buffer += escapeExpression(stack1)
        + "\" title=\""
        + escapeExpression((helper = helpers.__ || (depth0 && depth0.__),options={hash:{},data:data},helper ? helper.call(depth0, "Start Test-part", options) : helperMissing.call(depth0, "__", "Start Test-part", options)))
        + "\">\n                    <span class=\"qti-navigator-text\">"
        + escapeExpression((helper = helpers.__ || (depth0 && depth0.__),options={hash:{},data:data},helper ? helper.call(depth0, "Start Test-part", options) : helperMissing.call(depth0, "__", "Start Test-part", options)))
        + "</span>\n                    <span class=\"icon-play r\"></span>\n                </button>\n            </p>\n        </div>\n        ";
      return buffer;
      }

    function program8(depth0,data) {
      
      var buffer = "", stack1, helper;
      buffer += "\n        <ul aria-label=\"";
      if (helper = helpers.label) { stack1 = helper.call(depth0, {hash:{},data:data}); }
      else { helper = (depth0 && depth0.label); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
      buffer += escapeExpression(stack1)
        + "\" class=\"qti-navigator-sections collapsible-panel plain\">\n            ";
      stack1 = helpers.each.call(depth0, (depth0 && depth0.sections), {hash:{},inverse:self.noop,fn:self.program(9, program9, data),data:data});
      if(stack1 || stack1 === 0) { buffer += stack1; }
      buffer += "\n        </ul>\n        ";
      return buffer;
      }
    function program9(depth0,data) {
      
      var buffer = "", stack1, helper;
      buffer += "\n            <li class=\"qti-navigator-section collapsible ";
      stack1 = helpers['if'].call(depth0, (depth0 && depth0.active), {hash:{},inverse:self.program(4, program4, data),fn:self.program(2, program2, data),data:data});
      if(stack1 || stack1 === 0) { buffer += stack1; }
      buffer += "\" data-id=\"";
      if (helper = helpers.id) { stack1 = helper.call(depth0, {hash:{},data:data}); }
      else { helper = (depth0 && depth0.id); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
      buffer += escapeExpression(stack1)
        + "\">\n                <span class=\"qti-navigator-label\" title=\"";
      if (helper = helpers.label) { stack1 = helper.call(depth0, {hash:{},data:data}); }
      else { helper = (depth0 && depth0.label); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
      buffer += escapeExpression(stack1)
        + "\">\n                    <span class=\"qti-navigator-text\">";
      if (helper = helpers.label) { stack1 = helper.call(depth0, {hash:{},data:data}); }
      else { helper = (depth0 && depth0.label); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
      buffer += escapeExpression(stack1)
        + "</span>\n                    <span class=\"qti-navigator-counter\">"
        + escapeExpression(((stack1 = ((stack1 = (depth0 && depth0.stats)),stack1 == null || stack1 === false ? stack1 : stack1.answered)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
        + "/"
        + escapeExpression(((stack1 = ((stack1 = (depth0 && depth0.stats)),stack1 == null || stack1 === false ? stack1 : stack1.total)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
        + "</span>\n                </span>\n                <ul aria-label=\"";
      if (helper = helpers.label) { stack1 = helper.call(depth0, {hash:{},data:data}); }
      else { helper = (depth0 && depth0.label); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
      buffer += escapeExpression(stack1)
        + "\" class=\"qti-navigator-items collapsible-panel plain\">\n                    ";
      stack1 = helpers.each.call(depth0, (depth0 && depth0.items), {hash:{},inverse:self.noop,fn:self.programWithDepth(10, program10, data, depth0),data:data});
      if(stack1 || stack1 === 0) { buffer += stack1; }
      buffer += "\n                </ul>\n            </li>\n            ";
      return buffer;
      }
    function program10(depth0,data,depth1) {
      
      var buffer = "", stack1, helper;
      buffer += "\n                    <li class=\"qti-navigator-item ";
      if (helper = helpers.cls) { stack1 = helper.call(depth0, {hash:{},data:data}); }
      else { helper = (depth0 && depth0.cls); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
      buffer += escapeExpression(stack1)
        + "\" data-id=\"";
      if (helper = helpers.id) { stack1 = helper.call(depth0, {hash:{},data:data}); }
      else { helper = (depth0 && depth0.id); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
      buffer += escapeExpression(stack1)
        + "\" data-position=\"";
      if (helper = helpers.position) { stack1 = helper.call(depth0, {hash:{},data:data}); }
      else { helper = (depth0 && depth0.position); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
      buffer += escapeExpression(stack1)
        + "\">\n                        <span class=\"qti-navigator-label truncate\" title=\"";
      if (helper = helpers.label) { stack1 = helper.call(depth0, {hash:{},data:data}); }
      else { helper = (depth0 && depth0.label); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
      buffer += escapeExpression(stack1)
        + "\"\n                              role=\"link\" aria-disabled=\"";
      stack1 = helpers['if'].call(depth0, (depth0 && depth0.viewed), {hash:{},inverse:self.program(13, program13, data),fn:self.program(11, program11, data),data:data});
      if(stack1 || stack1 === 0) { buffer += stack1; }
      buffer += "\"\n                              ";
      stack1 = helpers['if'].call(depth0, (depth0 && depth0.active), {hash:{},inverse:self.noop,fn:self.program(15, program15, data),data:data});
      if(stack1 || stack1 === 0) { buffer += stack1; }
      buffer += "\n                              aria-label=\"";
      if (helper = helpers.index) { stack1 = helper.call(depth0, {hash:{},data:data}); }
      else { helper = (depth0 && depth0.index); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
      buffer += escapeExpression(stack1)
        + " of "
        + escapeExpression(((stack1 = ((stack1 = (depth1 && depth1.stats)),stack1 == null || stack1 === false ? stack1 : stack1.total)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
        + " ";
      if (helper = helpers.icon) { stack1 = helper.call(depth0, {hash:{},data:data}); }
      else { helper = (depth0 && depth0.icon); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
      buffer += escapeExpression(stack1)
        + "\">\n                            <span class=\"qti-navigator-icon icon-";
      if (helper = helpers.icon) { stack1 = helper.call(depth0, {hash:{},data:data}); }
      else { helper = (depth0 && depth0.icon); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
      buffer += escapeExpression(stack1)
        + "\"></span>\n                            <span class=\"qti-navigator-number\">";
      if (helper = helpers.index) { stack1 = helper.call(depth0, {hash:{},data:data}); }
      else { helper = (depth0 && depth0.index); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
      buffer += escapeExpression(stack1)
        + "</span>\n                            ";
      if (helper = helpers.label) { stack1 = helper.call(depth0, {hash:{},data:data}); }
      else { helper = (depth0 && depth0.label); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
      buffer += escapeExpression(stack1)
        + "\n                        </span>\n                    </li>\n                    ";
      return buffer;
      }
    function program11(depth0,data) {
      
      
      return "false";
      }

    function program13(depth0,data) {
      
      
      return "true";
      }

    function program15(depth0,data) {
      
      
      return "aria-current=\"page\"";
      }

      buffer += "<ul class=\"qti-navigator-parts plain\">\n    ";
      stack1 = helpers.each.call(depth0, (depth0 && depth0.parts), {hash:{},inverse:self.noop,fn:self.program(1, program1, data),data:data});
      if(stack1 || stack1 === 0) { buffer += stack1; }
      buffer += "\n</ul>\n";
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
     * Copyright (c) 2016-2019 (original work) Open Assessment Technologies SA ;
     */
    /**
     * Some default values
     * @type {Object}
     * @private
     */

    var _defaults = {
      scope: 'test',
      canCollapse: false,
      preventsUnseen: true,
      hidden: false
    };
    /**
     * List of CSS classes
     * @type {Object}
     * @private
     */

    var _cssCls = {
      active: 'active',
      collapsed: 'collapsed',
      collapsible: 'collapsible',
      hidden: 'hidden',
      disabled: 'disabled',
      flagged: 'flagged',
      answered: 'answered',
      viewed: 'viewed',
      unseen: 'unseen',
      info: 'info',
      icon: 'qti-navigator-icon',
      scope: {
        test: 'scope-test',
        testPart: 'scope-test-part',
        testSection: 'scope-test-section'
      }
    };
    /**
     * List of icon CSS classes
     * @type {Array}
     * @private
     */

    var _iconCls = [_cssCls.info, _cssCls.flagged, _cssCls.answered, _cssCls.viewed];
    /**
     * List of common CSS selectors
     * @type {Object}
     * @private
     */

    var _selectors = {
      component: '.qti-navigator',
      filterBar: '.qti-navigator-filters',
      filter: '.qti-navigator-filter',
      tree: '.qti-navigator-tree',
      collapseHandle: '.qti-navigator-collapsible',
      linearState: '.qti-navigator-linear',
      infoAnswered: '.qti-navigator-answered .qti-navigator-counter',
      infoViewed: '.qti-navigator-viewed .qti-navigator-counter',
      infoUnanswered: '.qti-navigator-unanswered .qti-navigator-counter',
      infoFlagged: '.qti-navigator-flagged .qti-navigator-counter',
      infoPanel: '.qti-navigator-info',
      infoPanelLabels: '.qti-navigator-info > .qti-navigator-label',
      tabInfoAll: '[data-mode="all"] .qti-navigator-counter',
      tabInfoUnanswered: '[data-mode="unanswered"] .qti-navigator-counter',
      tabInfoFlagged: '[data-mode="flagged"] .qti-navigator-counter',
      parts: '.qti-navigator-part',
      partLabels: '.qti-navigator-part > .qti-navigator-label',
      sections: '.qti-navigator-section',
      sectionLabels: '.qti-navigator-section > .qti-navigator-label',
      items: '.qti-navigator-item',
      itemLabels: '.qti-navigator-item > .qti-navigator-label',
      itemIcons: '.qti-navigator-item > .qti-navigator-icon',
      activeItem: '.qti-navigator-item.active',
      icons: '.qti-navigator-icon',
      linearStart: '.qti-navigator-linear-part button',
      counters: '.qti-navigator-counter',
      actives: '.active',
      collapsible: '.collapsible',
      collapsiblePanels: '.collapsible-panel',
      unseen: '.unseen',
      answered: '.answered',
      flagged: '.flagged',
      notFlagged: ':not(.flagged)',
      notAnswered: ':not(.answered)',
      notInformational: ':not(.info)',
      informational: '.info',
      hidden: '.hidden',
      disabled: '.disabled'
    };
    /**
     * Maps the filter mode to filter criteria.
     * Each filter criteria is a CSS selector used to find and mask the items to be discarded by the filter.
     * @type {Object}
     * @private
     */

    var _filterMap = {
      all: '',
      unanswered: [_selectors.answered, _selectors.informational].join(','),
      flagged: _selectors.notFlagged,
      answered: _selectors.notAnswered,
      filtered: _selectors.hidden
    };
    /**
     *
     * @type {Object}
     */

    var navigatorApi = {
      /**
       * Updates the stats on the flagged items in the current map
       * @param {Number} position
       * @param {Boolean} flag
       */
      updateStats: function updateStats(position, flag) {
        var map = this.map;
        var item;

        if (map) {
          item = mapHelper.getItemAt(map, position);

          if (item) {
            item.flagged = flag;
            mapHelper.updateItemStats(map, position);
          }
        }
      },

      /**
       * Gets the total number of items for the provided target
       * @param {Object} progression
       * @param {String} target
       * @returns {Number}
       */
      getProgressionTotal: function getProgressionTotal(progression, target) {
        var total;

        if ('questions' === target) {
          total = progression.questions;
        } else {
          total = progression.total;
        }

        return total;
      },

      /**
       * Set the marked state of an item
       * @param {Number|String|jQuery} position
       * @param {Boolean} flag
       */
      setItemFlag: function setItemFlag(position, flag) {
        var $item = position && position.jquery ? position : this.controls.$tree.find("[data-position=".concat(position, "]"));
        var progression = this.progression;
        var icon; // update the map stats

        this.updateStats(position, flag); // update the item flag

        $item.toggleClass(_cssCls.flagged, flag); // set the item icon according to its state

        icon = _.find(_iconCls, _.bind($item.hasClass, $item)) || _cssCls.unseen;
        $item.find(_selectors.icons).attr('class', "".concat(_cssCls.icon, " icon-").concat(icon)); // update the info panel

        progression.flagged = this.controls.$tree.find(_selectors.flagged).length;
        this.writeCount(this.controls.$infoFlagged, progression.flagged, this.getProgressionTotal(progression, 'questions')); // recompute the filters

        this.filter(this.currentFilter);
      },

      /**
       * Filters the items by a criteria
       * @param {String} criteria
       */
      filter: function filter(criteria) {
        var self = this; // remove the current filter by restoring all items

        var $items = this.controls.$tree.find(_selectors.items).removeClass(_cssCls.hidden); // filter the items according to the provided criteria

        var filterCb = _filterMap[criteria];

        if (filterCb) {
          $items.filter(filterCb).addClass(_cssCls.hidden);
        } // update the section counters


        this.controls.$tree.find(_selectors.sections).each(function () {
          var $section = $$1(this);
          var $itemsFound = $section.find(_selectors.items).not(_selectors.hidden);
          var $filtered = $itemsFound.not(_selectors.disabled);
          self.writeCount($section.find(_selectors.counters), $filtered.length, $itemsFound.length);
        });
        this.currentFilter = criteria;
      },

      /**
       * Update the config
       * @param {Object} [config]
       * @returns {navigatorApi}
       */
      updateConfig: function updateConfig(config) {
        var $component = this.getElement();
        var scopeClass = _cssCls.scope[this.config.scope || _defaults.scope]; // apply the new config

        config = _.merge(this.config, config || {}); // enable/disable the collapsing of the panel

        $component.toggleClass(_cssCls.collapsible, config.canCollapse); // update the component CSS class according to the scope

        $component.removeClass(scopeClass);
        scopeClass = _cssCls.scope[this.config.scope || _defaults.scope];
        $component.addClass(scopeClass);
        return this;
      },

      /**
       * Keep the active item visible, auto scroll if needed
       */
      autoScroll: function autoScroll() {
        autoscroll(this.controls.$tree.find(_selectors.activeItem), this.controls.$tree);
      },

      /**
       * Updates the review screen
       * @param {Object} map The current test map
       * @param {Object} context The current test context
       * @returns {navigatorApi}
       * @fires navigator#update
       */
      update: function update(map, context) {
        var scopedMap = this.getScopedMap(map, context);
        var testPart = mapHelper.getPart(map, context.testPartId);
        var progression = scopedMap.stats || {
          questions: 0,
          answered: 0,
          flagged: 0,
          viewed: 0,
          total: 0
        };
        var totalQuestions = this.getProgressionTotal(progression, 'questions');
        this.map = map;
        this.progression = progression; // update the info panel

        this.writeCount(this.controls.$infoAnswered, progression.answered, totalQuestions);
        this.writeCount(this.controls.$infoUnanswered, totalQuestions - progression.answered, totalQuestions);
        this.writeCount(this.controls.$infoViewed, progression.viewed, this.getProgressionTotal(progression, 'total'));
        this.writeCount(this.controls.$infoFlagged, progression.flagged, totalQuestions);
        this.writeCount(this.controls.$infoAll, totalQuestions, null); // rebuild the tree

        if (!testPart.isLinear) {
          this.controls.$filterBar.show();
          this.controls.$linearState.hide();
          this.controls.$tree.html(navigatorTreeTpl(scopedMap));
          this.autoScroll();
          var activeItem = mapHelper.getActiveItem(scopedMap);
          this.setState('prevents-unseen', this.config.preventsUnseen);
          var isSkipaheadEnabled = activeItem && activeItem.categories && _.indexOf(activeItem.categories, 'x-tao-option-review-skipahead') >= 0;
          this.setState('skipahead-enabled', isSkipaheadEnabled);

          if (this.config.preventsUnseen && !isSkipaheadEnabled) {
            // disables all unseen items to prevent the test taker has access to.
            this.controls.$tree.find(_selectors.unseen).addClass(_cssCls.disabled);
          }
        } else {
          this.controls.$filterBar.hide();
          this.controls.$linearState.show();
          this.controls.$tree.empty();
        } // apply again the current filter


        this.filter(this.controls.$filters.filter(_selectors.actives).data('mode'));
        /**
         * @event navigator#update the navigation data have changed
         */

        this.trigger('update');
        return this;
      },

      /**
       * Gets the scoped map
       * @param {Object} map The current test map
       * @param {Object} context The current test context
       * @returns {object} The scoped map
       */
      getScopedMap: function getScopedMap(map, context) {
        var scopedMap = mapHelper.getScopeMapFromContext(map, context, this.config.scope);
        var testPart = mapHelper.getPart(scopedMap, context.testPartId) || {};
        var section = mapHelper.getSection(scopedMap, context.sectionId) || {};
        var item = mapHelper.getItem(scopedMap, context.itemIdentifier) || {}; // set the active part/section/item

        testPart.active = true;
        section.active = true;
        item.active = true; //interactive item counter

        var counter = 0; // adjust each item with additional meta

        return mapHelper.each(scopedMap, function (itm) {
          var cls = [];
          var icon = '';

          if (itm.active) {
            cls.push('active');
          }

          if (itm.informational) {
            cls.push('info');
            icon = icon || 'info';
          }

          if (itm.flagged) {
            cls.push('flagged');
            icon = icon || 'flagged';
          }

          if (itm.answered) {
            cls.push('answered');
            icon = icon || 'answered';
          }

          if (itm.viewed) {
            cls.push('viewed');
            icon = icon || 'viewed';
          } else {
            cls.push('unseen');
            icon = icon || 'unseen';
          }

          if (!itm.informational) {
            counter += 1;
            itm.numberTest = counter; //item position in whole test from 1
          }

          itm.cls = cls.join(' ');
          itm.icon = icon;
        });
      },

      /**
       * Updates a counter
       * @param {jQuery} $place
       * @param {Number} count
       * @param {Number|Null} total
       * @private
       */
      writeCount: function writeCount($place, count, total) {
        var display = 0;

        if ($place.parent().hasClass('qti-navigator-tab')) {
          display = Math.max(count, 0);
        } else if (total > 0) {
          display = "".concat(Math.min(count, total), "/").concat(total);
        }

        $place.text(display);
      },

      /**
       * Selects an item
       * @param {String|jQuery} position The item's position
       * @param {Boolean} [open] Forces the tree to be opened on the selected item
       * @returns {jQuery} Returns the selected item
       */
      select: function select(position, open) {
        // find the item to select and extract its hierarchy
        var $tree = this.controls.$tree;
        var selected = position && position.jquery ? position : $tree.find("[data-position=".concat(position, "]"));
        var hierarchy = selected.parentsUntil($tree);
        var previousPosition = 0;
        var $previous = $tree.find(_selectors.activeItem);

        if ($previous.length) {
          previousPosition = $previous.data('position');
        } // collapse the full tree and open only the hierarchy of the selected item


        if (open) {
          this.openOnly(hierarchy);
        } // select the item


        $tree.find(_selectors.actives).removeClass(_cssCls.active);
        hierarchy.add(selected).addClass(_cssCls.active);
        position = selected.data('position');
        /**
         * An item is selected
         *
         * @param {Number} position - The item position on which select
         * @param {Number} previousPosition - The item position from which select
         * @event navigator#selected
         */

        this.trigger('selected', position, previousPosition);
        return selected;
      },

      /**
       * Opens the tree on the selected item only
       * @returns {jQuery} Returns the selected item
       */
      openSelected: function openSelected() {
        // find the selected item and extract its hierarchy
        var $tree = this.controls.$tree;
        var selected = $tree.find(_selectors.items + _selectors.actives);
        var hierarchy = selected.parentsUntil($tree); // collapse the full tree and open only the hierarchy of the selected item

        this.openOnly(hierarchy);
        return selected;
      },

      /**
       * Collapses the full tree and opens only the provided branch
       * @param {jQuery} opened The element to be opened
       * @param {jQuery} [root] The root element from which collapse the panels
       */
      openOnly: function openOnly(opened, root) {
        (root || this.controls.$tree).find(_selectors.collapsible).addClass(_cssCls.collapsed);
        opened.removeClass(_cssCls.collapsed);
      },

      /**
       * Toggles a panel
       * @param {jQuery} panel The panel to toggle
       * @param {String} [collapseSelector] Selector of panels to collapse
       * @returns {Boolean} Returns `true` if the panel just expanded now
       */
      togglePanel: function togglePanel(panel, collapseSelector) {
        var collapsed = panel.hasClass(_cssCls.collapsed);

        if (collapseSelector) {
          this.controls.$tree.find(collapseSelector).addClass(_cssCls.collapsed);
        }

        if (collapsed) {
          panel.removeClass(_cssCls.collapsed);
        } else {
          panel.addClass(_cssCls.collapsed);
        }

        return collapsed;
      },

      /**
       * Toggles the display state of the component
       * @param {Boolean} [show] External condition that's tells if the component must be shown or hidden
       * @returns {navigatorApi}
       */
      toggle: function toggle(show) {
        if (typeof show === 'undefined') {
          show = this.is('hidden');
        }

        if (show) {
          this.show();
        } else {
          this.hide();
        }

        return this;
      }
    };
    /**
     *
     * @param {Object} config
     * @param {String} [config.scope] Limit the review screen to a particular scope: test, testPart, testSection
     * @param {Boolean} [config.preventsUnseen] Prevents the test taker to access unseen items
     * @param {Boolean} [config.canCollapse] Allow the test taker to collapse the component
     * @param {Boolean} [config.canFlag] Allow the test taker to flag items
     * @param {Boolean} [config.hidden] Hide the component at init
     * @returns {*}
     */

    function navigatorFactory(config) {
      var navigator;
      /**
       * Flags an item
       * @param {jQuery} $item
       */

      function flagItem($item) {
        var position = $item.data('position');
        var flagged = !$item.hasClass(_cssCls.flagged); // update the display

        navigator.setItemFlag(position, flagged);
        /**
         * An item is flagged
         * @event navigator#flag
         * @param {Number} position - The item position on which jump
         * @param {Boolean} flag - Tells whether the item is marked for review or not
         */

        navigator.trigger('flag', position, flagged);
      }
      /**
       * Jumps to an item
       * @param {jQuery} $item
       * @private
       */


      function jump($item) {
        var position = $item.data('position');
        /**
         * A jump to a particular item is required
         * @event navigator#jump
         * @param {Number} position - The item position on which jump
         */

        navigator.trigger('jump', position);
      }

      navigator = component(navigatorApi, _defaults).setTemplate(navigatorTpl) // uninstalls the component
      .on('destroy', function () {
        this.controls = null;
      }) // keep the activ item visible
      .on('show', function () {
        this.autoScroll();
      }) // renders the component
      .on('render', function () {
        var self = this; // main component elements

        var $component = this.getElement();
        var $filterBar = $component.find(_selectors.filterBar);
        var $filters = $filterBar.find('li');
        var $tree = $component.find(_selectors.tree); // links the component to the underlying DOM elements

        this.controls = {
          // access to info panel displaying counters
          $infoAnswered: $component.find(_selectors.infoAnswered),
          $infoViewed: $component.find(_selectors.infoViewed),
          $infoAll: $component.find(_selectors.tabInfoAll),
          $infoUnanswered: this.config.showLegend ? $component.find(_selectors.infoUnanswered) : $component.find(_selectors.tabInfoUnanswered),
          $infoFlagged: this.config.showLegend ? $component.find(_selectors.infoFlagged) : $component.find(_selectors.tabInfoFlagged),
          // access to filter switches
          $filterBar: $filterBar,
          $filters: $filters,
          // access to the tree of parts/sections/items
          $tree: $tree,
          // access to the panel displayed when a linear part is reached
          $linearState: $component.find(_selectors.linearState)
        }; // apply options

        this.updateConfig(); // click on the collapse handle: collapse/expand the review panel

        $component.on("click".concat(_selectors.component), _selectors.collapseHandle, function () {
          if (!self.is('disabled')) {
            $component.toggleClass(_cssCls.collapsed);

            if ($component.hasClass(_cssCls.collapsed)) {
              self.openSelected();
            }
          }
        }); // click on the info panel title: toggle the related panel

        $component.on("click".concat(_selectors.component), _selectors.infoPanelLabels, function () {
          if (!self.is('disabled')) {
            self.togglePanel($$1(this).closest(_selectors.infoPanel), _selectors.infoPanel);
          }
        }); // click on a part title: toggle the related panel

        $tree.on("click".concat(_selectors.component), _selectors.partLabels, function () {
          var $panel;

          if (!self.is('disabled')) {
            $panel = $$1(this).closest(_selectors.parts);

            if (self.togglePanel($panel, _selectors.parts)) {
              if ($panel.hasClass(_cssCls.active)) {
                self.openSelected();
              } else {
                self.openOnly($panel.find(_selectors.sections).first(), $panel);
              }
            }
          }
        }); // click on a section title: toggle the related panel

        $tree.on("click".concat(_selectors.component), _selectors.sectionLabels, function () {
          if (!self.is('disabled')) {
            self.togglePanel($$1(this).closest(_selectors.sections), _selectors.sections);
          }
        }); // click on an item: jump to the position

        $tree.on("click".concat(_selectors.component), _selectors.itemLabels, function (event) {
          var $item, $target;

          if (!self.is('disabled')) {
            $item = $$1(this).closest(_selectors.items);

            if (!$item.hasClass(_cssCls.disabled)) {
              $target = $$1(event.target);

              if (self.config.canFlag && $target.is(_selectors.icons) && !$component.hasClass(_cssCls.collapsed)) {
                // click on the icon, just flag the item, unless the panel is collapsed
                if (!$item.hasClass(_cssCls.unseen) && !$item.hasClass(_cssCls.info)) {
                  flagItem($item);
                }
              } else if (!$item.hasClass(_cssCls.active)) {
                // go to the selected item
                self.select($item);
                jump($item);
              }
            }
          }
        }); // click on the start button inside a linear part: jump to the position

        $tree.on("click".concat(_selectors.component), _selectors.linearStart, function () {
          var $btn;

          if (!self.is('disabled')) {
            $btn = $$1(this); // go to the first item of the linear part

            if (!$btn.hasClass(_cssCls.disabled)) {
              $btn.addClass(_cssCls.disabled);
              jump($btn);
            }
          }
        }); // click on a filter button

        $filterBar.on("click".concat(_selectors.component), _selectors.filter, function () {
          var $btn, mode;

          if (!self.is('disabled')) {
            $btn = $$1(this);
            mode = $btn.data('mode'); // select the button

            $filters.removeClass(_cssCls.active);
            $filters.attr('aria-selected', false);
            $component.removeClass(_cssCls.collapsed);
            $btn.addClass(_cssCls.active);
            $btn.attr('aria-selected', true); // filter the items

            self.filter(mode); //after filtering, ensure that the active item (if exists) is visible

            self.autoScroll();
          }
        });
      }); // set default filter

      navigator.currentFilter = 'all'; // the component will be ready

      return navigator.init(config);
    }

    return navigatorFactory;

});
