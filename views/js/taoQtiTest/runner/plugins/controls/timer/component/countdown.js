define(['jquery', 'lodash', 'core/encoder/time', 'ui/component', 'handlebars', 'taoQtiTest/runner/helpers/getTimerMessage', 'ui/tooltip', 'css!taoQtiTest/runner/plugins/controls/timer/component/css/countdown.css', 'moment'], function ($$1, _, timeEncoder, component, Handlebars, getTimerMessage, tooltip, countdown_css, moment) { 'use strict';

    $$1 = $$1 && Object.prototype.hasOwnProperty.call($$1, 'default') ? $$1['default'] : $$1;
    _ = _ && Object.prototype.hasOwnProperty.call(_, 'default') ? _['default'] : _;
    timeEncoder = timeEncoder && Object.prototype.hasOwnProperty.call(timeEncoder, 'default') ? timeEncoder['default'] : timeEncoder;
    component = component && Object.prototype.hasOwnProperty.call(component, 'default') ? component['default'] : component;
    Handlebars = Handlebars && Object.prototype.hasOwnProperty.call(Handlebars, 'default') ? Handlebars['default'] : Handlebars;
    getTimerMessage = getTimerMessage && Object.prototype.hasOwnProperty.call(getTimerMessage, 'default') ? getTimerMessage['default'] : getTimerMessage;
    tooltip = tooltip && Object.prototype.hasOwnProperty.call(tooltip, 'default') ? tooltip['default'] : tooltip;
    moment = moment && Object.prototype.hasOwnProperty.call(moment, 'default') ? moment['default'] : moment;

    var Template = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
      this.compilerInfo = [4,'>= 1.0.0'];
    helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
      var buffer = "", stack1, helper, functionType="function", escapeExpression=this.escapeExpression;


      buffer += "<div class=\"countdown\" data-control=\"";
      if (helper = helpers.id) { stack1 = helper.call(depth0, {hash:{},data:data}); }
      else { helper = (depth0 && depth0.id); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
      buffer += escapeExpression(stack1)
        + "\" data-type=\"";
      if (helper = helpers.type) { stack1 = helper.call(depth0, {hash:{},data:data}); }
      else { helper = (depth0 && depth0.type); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
      buffer += escapeExpression(stack1)
        + "\" data-scope=\"";
      if (helper = helpers.scope) { stack1 = helper.call(depth0, {hash:{},data:data}); }
      else { helper = (depth0 && depth0.scope); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
      buffer += escapeExpression(stack1)
        + "\" title=\"";
      if (helper = helpers.label) { stack1 = helper.call(depth0, {hash:{},data:data}); }
      else { helper = (depth0 && depth0.label); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
      buffer += escapeExpression(stack1)
        + "\" disabled>\n    <span aria-label=\"";
      if (helper = helpers.label) { stack1 = helper.call(depth0, {hash:{},data:data}); }
      else { helper = (depth0 && depth0.label); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
      buffer += escapeExpression(stack1)
        + "\" class=\"label truncate\">";
      if (helper = helpers.label) { stack1 = helper.call(depth0, {hash:{},data:data}); }
      else { helper = (depth0 && depth0.label); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
      buffer += escapeExpression(stack1)
        + "</span>\n    <span class=\"time\" aria-hidden=\"true\"></span>\n    <div class=\"time--screenreader visible-hidden\"></div>\n</div>\n";
      return buffer;
      });
    function countdownTpl(data, options, asString) {
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
     * Copyright (c) 2018 (original work) Open Assessment Technologies SA ;
     */

    var precision = 1000;
    /**
     * Default config values, see below.
     */

    var defaults = {
      showBeforeStart: true,
      displayWarning: true
    };
    /**
     * time to display warnings
     */

    var warningTimeout = {
      info: 2000,
      success: 2000,
      warning: 4000,
      danger: 4000,
      error: 8000
    };
    /**
     * Creates, initialize and render a countdown component.
     *
     * @param {jQueryElement|HTMLElement} $container - where to append the countdown
     * @param {Object} config
     * @param {String} config.id - the timer unique identifier
     * @param {String} config.label - the text to display above the timer
     * @param {String} config.type - the type of countdown (to categorize them)
     * @param {String} [config.scope] - scope of a timer
     * @param {Number} [config.unansweredQuestions] - number of unanswered options
     * @param {Number} [config.remainingTime] - the current value of the countdown, in milliseconds
     * @param {Boolean} [config.showBeforeStart = true] - do we show the time before starting
     * @param {Boolean} [config.displayWarning = true] - do we display the warnings or trigger only the event
     * @param {Object[]} [config.warnings] - define warnings thresholds
     * @param {Number} [config.warnings.threshold] - when the warning is shown, in milliseconds
     * @param {String} [config.warnings.message] - the warning message
     * @param {String} [config.warnings.level = warn] - the feedback level in (success, info, warn, danger and error)
     * @returns {countdown} the component, initialized and rendered
     */

    function countdownFactory($container, config) {
      var $time;
      var $timeScreenreader;
      /**
       * @typedef {Object} countdown
       */

      var countdown = component({
        /**
         * Update the countdown
         * @param {Number} remainingTime - the time remaining (milliseconds)
         * @param {Number} unansweredQuestions
         * @returns {countdown} chains
         * @fires countdown#change - when the value has changed
         * @fires countdown#warn - when a threshold is reached
         */
        update: function udpate(remainingTime, unansweredQuestions) {
          var self = this;
          var encodedTime;
          var warningId;
          var warningMessage;

          if (!this.is('completed')) {
            if (remainingTime <= 0) {
              this.remainingTime = 0;
            } else {
              this.remainingTime = parseInt(remainingTime, 10);
            }

            if (this.is('rendered') && this.is('running')) {
              encodedTime = timeEncoder.encode(this.remainingTime / precision);

              if (encodedTime !== this.encodedTime) {
                this.encodedTime = encodedTime;
                var time = moment.duration(this.remainingTime / precision, 'seconds');
                var hours = time.get('hours');
                var minutes = time.get('minutes');
                var seconds = time.get('seconds');
                $time.text(this.encodedTime);
                $timeScreenreader.text(getTimerMessage(hours, minutes, seconds, unansweredQuestions, this.config.scope));
              }

              if (this.warnings) {
                //the warnings have already be sorted
                warningId = _.findLastKey(this.warnings, function (warning) {
                  return warning && !warning.shown && warning.threshold > 0 && warning.threshold >= self.remainingTime;
                });

                if (warningId) {
                  this.warnings[warningId].shown = true;

                  if (_.isFunction(this.warnings[warningId].message)) {
                    warningMessage = this.warnings[warningId].message(this.remainingTime);
                  } else {
                    warningMessage = this.warnings[warningId].message;
                  }
                  /**
                   * Warn user the timer reach a threshold
                   * @event countdown#warn
                   * @param {String} message
                   * @param {String} level
                   */


                  this.trigger('warn', warningMessage, this.warnings[warningId].level);
                }
              }

              if (this.warningsForScreenreader) {
                //the warnings have already be sorted
                var screenreaderWarningId = _.findLastKey(this.warningsForScreenreader, function (warning) {
                  return warning && !warning.shown && warning.threshold > 0 && warning.threshold >= self.remainingTime;
                });

                if (screenreaderWarningId) {
                  this.warningsForScreenreader[screenreaderWarningId].shown = true;
                  /**
                   * Warn user the timer reach a threshold
                   * @event countdown#warnscreenreader
                   * @param {Function} message
                   * @param {Number} remainingTime
                   * @param {String} scope
                   */

                  this.trigger('warnscreenreader', this.warningsForScreenreader[screenreaderWarningId].message, self.remainingTime, this.warningsForScreenreader[screenreaderWarningId].scope);
                }
              }
              /**
               * The current value has changed
               * @event countdown#change
               * @param {Number} remainingTime - the updated time
               * @param {String} displayed - the displayed value
               */


              this.trigger('change', this.remainingTime, encodedTime);
            }

            if (this.remainingTime === 0) {
              this.complete();
            }
          }

          return this;
        },

        /**
         * Starts the countdown
         * @returns {countdown} chains
         * @fires countdown#start
         */
        start: function start() {
          if (this.is('rendered') && !this.is('running') && !this.is('completed')) {
            this.enable();
            this.setState('running', true);
            /**
             * The count has started
             * @event countdown#start
             */

            this.trigger('start');
          }

          return this;
        },

        /**
         * Stops the countdown (can be restarted then)
         * @returns {countdown} chains
         * @fires countdown#stop
         */
        stop: function stop() {
          if (this.is('rendered') && this.is('running')) {
            this.setState('running', false);
            /**
             * The count is stopped
             * @event countdown#stop
             */

            this.trigger('stop');
          }

          return this;
        },

        /**
         * Calls to complete the countdown,
         * it can't be resumed after.
         *
         * @returns {countdown} chains
         *
         * @fires countdown#complete
         * @fires countdown#end
         */
        complete: function complete() {
          if (this.is('rendered') && this.is('running') && !this.is('completed')) {
            this.stop();
            this.setState('completed', true);
            /**
             * The countdown has ended, is completed
             * @event countdown#complete
             * @event countdown#end (alias)
             */

            this.trigger('complete end');
          }

          return this;
        }
      }, defaults).on('init', function () {
        this.remainingTime = this.config.remainingTime;
        this.unansweredQuestions = this.config.unansweredQuestions;

        if (this.config.warnings) {
          this.warnings = _.sortBy(this.config.warnings, 'threshold');
        }

        if (this.config.warningsForScreenreader) {
          this.warningsForScreenreader = _.sortBy(this.config.warningsForScreenreader, 'threshold');
        } //auto renders


        this.render($container);
      }).on('render', function () {
        $time = $$1('.time', this.getElement());
        $timeScreenreader = $$1('.time--screenreader', this.getElement());

        if (this.config.showBeforeStart === true) {
          $time.text(timeEncoder.encode(this.remainingTime / precision));
        }
      }).on('warn', function (message, level) {
        var countdownTooltip;
        level = level || 'warning';

        if (this.is('rendered') && this.is('running') && _.isString(message) && !_.isEmpty(message)) {
          $time.removeClass('txt-success txt-info txt-warning txt-danger txt-error').addClass("txt-".concat(level));

          if (this.config.displayWarning === true) {
            countdownTooltip = tooltip.create(this.getElement(), message, {
              trigger: 'manual',
              theme: level,
              placement: 'bottom'
            });
            countdownTooltip.show();
            setTimeout(function () {
              countdownTooltip.hide();
              countdownTooltip.dispose();
            }, warningTimeout[level] || 2000);
          }
        }
      });
      countdown.setTemplate(countdownTpl);

      _.defer(function () {
        countdown.init(config);
      });

      return countdown;
    }

    return countdownFactory;

});
