define(['i18n', 'taoQtiTest/runner/helpers/stats', 'handlebars'], function (__, statsHelper, Handlebars) { 'use strict';

    __ = __ && Object.prototype.hasOwnProperty.call(__, 'default') ? __['default'] : __;
    statsHelper = statsHelper && Object.prototype.hasOwnProperty.call(statsHelper, 'default') ? statsHelper['default'] : statsHelper;
    Handlebars = Handlebars && Object.prototype.hasOwnProperty.call(Handlebars, 'default') ? Handlebars['default'] : Handlebars;

    var Template = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
      this.compilerInfo = [4,'>= 1.0.0'];
    helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
      var stack1, functionType="function", escapeExpression=this.escapeExpression, self=this;

    function program1(depth0,data) {
      
      var buffer = "", stack1, helper;
      buffer += "<b>";
      if (helper = helpers.header) { stack1 = helper.call(depth0, {hash:{},data:data}); }
      else { helper = (depth0 && depth0.header); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
      buffer += escapeExpression(stack1)
        + "</b><br><br>";
      return buffer;
      }

      stack1 = helpers['if'].call(depth0, (depth0 && depth0.header), {hash:{},inverse:self.noop,fn:self.program(1, program1, data),data:data});
      if(stack1 || stack1 === 0) { return stack1; }
      else { return ''; }
      });
    function messageHeaderTpl(data, options, asString) {
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
     * Copyright (c) 2016-2021 (original work) Open Assessment Technologies SA ;
     */
    /**
     * Completes an exit message
     * @param {String} scope - scope to consider for calculating the stats
     * @param {Object} runner - testRunner instance
     * @param {String} message - custom message that will be appended to the unanswered stats count
     * @param {Boolean} sync - flag for sync the unanswered stats in exit message and the unanswered stats in the toolbox
     * @param {String|undefined} submitButtonLabel - point the user to the submit button
     * @returns {String} Returns the message text
     */

    function getExitMessage(scope, runner) {
      var message = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : '';
      var sync = arguments.length > 3 ? arguments[3] : undefined;
      var submitButtonLabel = arguments.length > 4 ? arguments[4] : undefined;
      var itemsCountMessage = '';
      var testRunnerOptions = runner.getOptions();
      var messageEnabled = testRunnerOptions.enableUnansweredItemsWarning;

      if (messageEnabled) {
        itemsCountMessage = getUnansweredItemsWarning(scope, runner, sync).trim();

        if (itemsCountMessage) {
          itemsCountMessage += '.';
        }
      }

      return "".concat(getHeader(scope)).concat(itemsCountMessage, " ").concat(getActionMessage(scope, submitButtonLabel)).concat(message).trim();
    }
    /**
     * Build message if not all items have answers
     * @param {String} scope - scope to consider for calculating the stats
     * @returns {String} Returns the message text
     */


    function getHeader(scope) {
      var header = '';

      if (scope === 'section' || scope === 'testSection') {
        header = __('You are about to leave this section.');
      } else if (scope === 'test' || scope === 'testWithoutInaccessibleItems') {
        header = __('You are about to submit the test.');
      } else if (scope === 'part') {
        header = __('You are about to submit this test part.');
      }

      return messageHeaderTpl({
        header: header.trim()
      });
    }
    /**
     * Generates the message to help users perform the action
     * @param {String} scope - scope to consider for calculating the stats
     * @param {String} [submitButtonLabel] - Pointed user perform click on given button
     * @returns {String} Returns the message text
     */


    function getActionMessage(scope) {
      var submitButtonLabel = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : __('OK');
      var msg;

      switch (scope) {
        case 'section':
        case 'testSection':
        case 'part':
          msg = __('Click "%s" to continue', submitButtonLabel).trim();

          if (msg) {
            msg += '.';
          }

          return msg;

        case 'test':
        case 'testWithoutInaccessibleItems':
          return "".concat(__('You will not be able to access this test once submitted. Click "%s" to continue and submit the test.', submitButtonLabel));
      }

      return '';
    }
    /**
     * Build message for the flagged items if any.
     * @param {Object} stats - The stats for the current context
     * @param {String} [message] - The existing message to complete
     * @returns {string|*}
     */


    function getFlaggedItemsWarning(stats) {
      var message = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : '';
      var flaggedCount = stats && stats.flagged;

      if (!flaggedCount) {
        return message;
      }

      if (message) {
        return "".concat(message, " ").concat(__('and you flagged %s item(s) that you can review now', flaggedCount.toString()));
      }

      return __('You flagged %s item(s) that you can review now', flaggedCount.toString());
    }
    /**
     * Build message if not all items have answers
     * @param {String} scope - scope to consider for calculating the stats
     * @param {Object} runner - testRunner instance
     * @param {Boolean} sync - flag for sync the unanswered stats in exit message and the unanswered stats in the toolbox. Default false
     * @returns {String} Returns the message text
     */


    function getUnansweredItemsWarning(scope, runner, sync) {
      var stats = statsHelper.getInstantStats(scope, runner, sync);
      var unansweredCount = stats && stats.questions - stats.answered;
      var flaggedCount = stats && stats.flagged;
      var itemsCountMessage = '';

      if (scope === 'section' || scope === 'testSection') {
        itemsCountMessage = __('You answered %s of %s question(s) for this section of the test', stats.answered.toString(), stats.questions.toString());

        if (flaggedCount) {
          itemsCountMessage += ", ".concat(__('and flagged %s of them', flaggedCount.toString()));
        }
      } else if (scope === 'test' || scope === 'testWithoutInaccessibleItems') {
        if (unansweredCount > 1) {
          itemsCountMessage = __('There are %s unanswered questions', unansweredCount.toString());
        } else if (unansweredCount === 1) {
          itemsCountMessage = __('There is %s unanswered question', unansweredCount.toString());
        }

        if (flaggedCount) {
          itemsCountMessage = getFlaggedItemsWarning(stats, itemsCountMessage);
        }
      } else if (scope === 'part') {
        if (unansweredCount > 1) {
          itemsCountMessage = __('There are %s unanswered questions in this part of the test', unansweredCount.toString());
        } else if (unansweredCount === 1) {
          itemsCountMessage = __('There is %s unanswered question in this part of the test', unansweredCount.toString());
        }

        if (flaggedCount) {
          itemsCountMessage = getFlaggedItemsWarning(stats, itemsCountMessage);
        }
      }

      itemsCountMessage = itemsCountMessage.trim();
      return itemsCountMessage;
    }

    var messages = {
      getExitMessage: getExitMessage
    };

    return messages;

});
