define(['i18n', 'taoTests/runner/plugin', 'ui/feedback'], function (__, pluginFactory, feedback$1) { 'use strict';

  __ = __ && Object.prototype.hasOwnProperty.call(__, 'default') ? __['default'] : __;
  pluginFactory = pluginFactory && Object.prototype.hasOwnProperty.call(pluginFactory, 'default') ? pluginFactory['default'] : pluginFactory;
  feedback$1 = feedback$1 && Object.prototype.hasOwnProperty.call(feedback$1, 'default') ? feedback$1['default'] : feedback$1;

  function _typeof(obj) {
    "@babel/helpers - typeof";

    return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) {
      return typeof obj;
    } : function (obj) {
      return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
    }, _typeof(obj);
  }

  /**
   * Returns the configured plugin
   */

  var feedback = pluginFactory({
    name: 'feedback',

    /**
     * Initialize the plugin (called during runner's init)
     */
    init: function init() {
      var self = this; //keep a ref of the feedbacks

      var currentFeedback;
      var testRunner = this.getTestRunner();
      /**
       * Close the current feedback
       */

      var closeCurrent = function closeCurrent() {
        if (currentFeedback) {
          currentFeedback.close();
        }
      };

      this.setState('enabled', true); //change plugin state

      testRunner.on('error', function (err) {
        var message = err;
        var type = 'error';

        if (self.getState('enabled')) {
          if ('object' === _typeof(err)) {
            message = err.message;
            type = err.type;
          }

          if (!message) {
            switch (type) {
              case 'TestState':
                message = __('The test has been closed/suspended!');
                break;

              case 'FileNotFound':
                message = __('File not found!');
                break;

              default:
                message = __('An error occurred!');
            }
          }

          currentFeedback = feedback$1().error(message);
        }
      }).on('danger', function (message) {
        if (self.getState('enabled')) {
          currentFeedback = feedback$1().danger(message);
        }
      }).on('warning', function (message) {
        if (self.getState('enabled')) {
          currentFeedback = feedback$1().warning(message);
        }
      }).on('info', function (message) {
        if (self.getState('enabled')) {
          currentFeedback = feedback$1().info(message);
        }
      }).on('alert.* confirm.* unloaditem', closeCurrent).on('disablefeedbackalerts', function () {
        closeCurrent();
        self.setState('enabled', false);
      }).on('enablefeedbackalerts', function () {
        self.setState('enabled', true);
      });
    }
  });

  return feedback;

});
