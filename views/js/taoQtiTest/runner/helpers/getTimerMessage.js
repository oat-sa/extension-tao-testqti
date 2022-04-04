define(['i18n'], function (__) { 'use strict';

    __ = __ && Object.prototype.hasOwnProperty.call(__, 'default') ? __['default'] : __;

    /**
     * Returns timer information string
     * @returns {Boolean}
     */

    function getTimerMessage(hours, minutes, seconds, unansweredQuestions, scope) {
      var timerMessage;
      var timeArr = [hours, minutes, seconds];
      var timeArgArr = [];
      [__('hours'), __('minutes'), __('seconds')].forEach(function (unit, idx) {
        if (timeArr[idx] > 0) {
          timeArgArr.push("".concat(timeArr[idx], " ").concat(unit));
        }
      });
      var answeredMessage;

      if (!unansweredQuestions || scope === 'item') {
        answeredMessage = __('the current question');
      } else {
        var questionsMessage = __('questions');

        if (unansweredQuestions === 1) {
          questionsMessage = __('question');
        }

        answeredMessage = __('remaining %s %s', unansweredQuestions, questionsMessage);
      }

      if (timeArgArr.length === 0) {
        timerMessage = __('%s to answer %s', 'no time left', answeredMessage);
      } else {
        timerMessage = __('%s to answer %s', timeArgArr.join(', '), answeredMessage);
      }

      return timerMessage;
    }

    return getTimerMessage;

});
