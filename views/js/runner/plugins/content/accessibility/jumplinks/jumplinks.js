define(['lodash', 'ui/component', 'handlebars'], function (_, component, Handlebars) { 'use strict';

    _ = _ && Object.prototype.hasOwnProperty.call(_, 'default') ? _['default'] : _;
    component = component && Object.prototype.hasOwnProperty.call(component, 'default') ? component['default'] : component;
    Handlebars = Handlebars && Object.prototype.hasOwnProperty.call(Handlebars, 'default') ? Handlebars['default'] : Handlebars;

    var Template = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
      this.compilerInfo = [4,'>= 1.0.0'];
    helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
      var buffer = "", stack1, helper, options, helperMissing=helpers.helperMissing, escapeExpression=this.escapeExpression, functionType="function", self=this;

    function program1(depth0,data) {
      
      
      return "hidden";
      }

      buffer += "<nav class=\"jump-links-box\" aria-label=\""
        + escapeExpression((helper = helpers.__ || (depth0 && depth0.__),options={hash:{},data:data},helper ? helper.call(depth0, "Jump Menu", options) : helperMissing.call(depth0, "__", "Jump Menu", options)))
        + "\">\n    <ul>\n        <li class=\"jump-link-item\">\n            <button data-jump=\"question\" class=\"jump-link\" >"
        + escapeExpression((helper = helpers.__ || (depth0 && depth0.__),options={hash:{},data:data},helper ? helper.call(depth0, "Jump to:", options) : helperMissing.call(depth0, "__", "Jump to:", options)))
        + " <b>"
        + escapeExpression((helper = helpers.__ || (depth0 && depth0.__),options={hash:{},data:data},helper ? helper.call(depth0, "Question", options) : helperMissing.call(depth0, "__", "Question", options)))
        + " - ";
      if (helper = helpers.questionStatus) { stack1 = helper.call(depth0, {hash:{},data:data}); }
      else { helper = (depth0 && depth0.questionStatus); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
      buffer += escapeExpression(stack1)
        + "</b></button>\n        </li>\n        <li class=\"jump-link-item\">\n            <button data-jump=\"navigation\" class=\"jump-link\" >"
        + escapeExpression((helper = helpers.__ || (depth0 && depth0.__),options={hash:{},data:data},helper ? helper.call(depth0, "Jump to:", options) : helperMissing.call(depth0, "__", "Jump to:", options)))
        + " <b>"
        + escapeExpression((helper = helpers.__ || (depth0 && depth0.__),options={hash:{},data:data},helper ? helper.call(depth0, "Navigation", options) : helperMissing.call(depth0, "__", "Navigation", options)))
        + "</b></button>\n        </li>\n        <li class=\"jump-link-item\">\n            <button data-jump=\"toolbox\" class=\"jump-link\" >"
        + escapeExpression((helper = helpers.__ || (depth0 && depth0.__),options={hash:{},data:data},helper ? helper.call(depth0, "Jump to:", options) : helperMissing.call(depth0, "__", "Jump to:", options)))
        + " <b>"
        + escapeExpression((helper = helpers.__ || (depth0 && depth0.__),options={hash:{},data:data},helper ? helper.call(depth0, "Toolbox", options) : helperMissing.call(depth0, "__", "Toolbox", options)))
        + "</b></button>\n        </li>\n        <li class=\"jump-link-item ";
      stack1 = helpers.unless.call(depth0, (depth0 && depth0.isReviewPanelEnabled), {hash:{},inverse:self.noop,fn:self.program(1, program1, data),data:data});
      if(stack1 || stack1 === 0) { buffer += stack1; }
      buffer += "\" >\n            <button data-jump=\"teststatus\" class=\"jump-link\" >"
        + escapeExpression((helper = helpers.__ || (depth0 && depth0.__),options={hash:{},data:data},helper ? helper.call(depth0, "Jump to:", options) : helperMissing.call(depth0, "__", "Jump to:", options)))
        + " <b>"
        + escapeExpression((helper = helpers.__ || (depth0 && depth0.__),options={hash:{},data:data},helper ? helper.call(depth0, "Test Status and Structure", options) : helperMissing.call(depth0, "__", "Test Status and Structure", options)))
        + "</b></button>\n        </li>\n        <li class=\"jump-link-item\">\n            <button data-jump=\"shortcuts\" class=\"jump-link\" >"
        + escapeExpression((helper = helpers.__ || (depth0 && depth0.__),options={hash:{},data:data},helper ? helper.call(depth0, "Jump to:", options) : helperMissing.call(depth0, "__", "Jump to:", options)))
        + " <b>"
        + escapeExpression((helper = helpers.__ || (depth0 && depth0.__),options={hash:{},data:data},helper ? helper.call(depth0, "Open Keyboard Shortcuts", options) : helperMissing.call(depth0, "__", "Open Keyboard Shortcuts", options)))
        + "</b></button>\n        </li>\n    </ul>\n</nav>\n";
      return buffer;
      });
    function jumplinksTpl(data, options, asString) {
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

    var defaults = {};
    /**
     * Creates and initialize the jumplinks component.
     * Please not the component IS NOT rendered.
     * You'll have to render it by yourself.
     *
     * @returns {jumplinks} the component, initialized and rendered
     */

    function jumplinksFactory(config) {
      /**
       * @typedef {Object} jumplinksBox
       */
      var jumplinksBox = component({}, defaults).on('render', function () {
        var _this = this;

        // handle related Jump Links
        var behavior = [{
          selector: '[data-jump=question] ',
          eventName: 'jump',
          eventParam: 'question'
        }, {
          selector: '[data-jump=navigation]',
          eventName: 'jump',
          eventParam: 'navigation'
        }, {
          selector: '[data-jump=toolbox]',
          eventName: 'jump',
          eventParam: 'toolbox'
        }, {
          selector: '[data-jump=teststatus]',
          eventName: 'jump',
          eventParam: 'teststatus'
        }, {
          selector: '[data-jump=shortcuts]',
          eventName: 'shortcuts',
          eventParam: 'shortcuts'
        }];

        _.forEach(behavior, function (linkDescription) {
          var $link = _this.getElement().find(linkDescription.selector);

          var handleLink = function handleLink() {
            _this.trigger(linkDescription.eventName, linkDescription.eventParam);

            _this.getElement().find(':focus').blur();
          };

          if ($link) {
            $link.on('click', handleLink);
            $link.on('keyup', function (event) {
              var activationKeys = [32, 13]; // link can be activated by click or enter/space keys

              if (activationKeys.includes(event.keyCode)) {
                handleLink();
              }
            });
          }
        });
      });
      jumplinksBox.setTemplate(jumplinksTpl);

      _.defer(function () {
        jumplinksBox.init(config);
      });

      return jumplinksBox;
    }

    return jumplinksFactory;

});
