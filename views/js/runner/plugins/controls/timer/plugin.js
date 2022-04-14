define(['jquery', 'lodash', 'taoTests/runner/plugin', 'taoQtiTest/runner/plugins/controls/timer/strategy/strategyHandler', 'taoQtiTest/runner/plugins/controls/timer/component/timerbox', 'taoQtiTest/runner/plugins/controls/timer/timers', 'taoQtiTest/runner/helpers/isReviewPanelEnabled', 'taoQtiTest/runner/helpers/stats', 'handlebars'], function ($$1, _, pluginFactory, getStrategyHandler, timerboxFactory, timersFactory, isReviewPanelEnabled, statsHelper, Handlebars) { 'use strict';

  $$1 = $$1 && Object.prototype.hasOwnProperty.call($$1, 'default') ? $$1['default'] : $$1;
  _ = _ && Object.prototype.hasOwnProperty.call(_, 'default') ? _['default'] : _;
  pluginFactory = pluginFactory && Object.prototype.hasOwnProperty.call(pluginFactory, 'default') ? pluginFactory['default'] : pluginFactory;
  getStrategyHandler = getStrategyHandler && Object.prototype.hasOwnProperty.call(getStrategyHandler, 'default') ? getStrategyHandler['default'] : getStrategyHandler;
  timerboxFactory = timerboxFactory && Object.prototype.hasOwnProperty.call(timerboxFactory, 'default') ? timerboxFactory['default'] : timerboxFactory;
  timersFactory = timersFactory && Object.prototype.hasOwnProperty.call(timersFactory, 'default') ? timersFactory['default'] : timersFactory;
  isReviewPanelEnabled = isReviewPanelEnabled && Object.prototype.hasOwnProperty.call(isReviewPanelEnabled, 'default') ? isReviewPanelEnabled['default'] : isReviewPanelEnabled;
  statsHelper = statsHelper && Object.prototype.hasOwnProperty.call(statsHelper, 'default') ? statsHelper['default'] : statsHelper;
  Handlebars = Handlebars && Object.prototype.hasOwnProperty.call(Handlebars, 'default') ? Handlebars['default'] : Handlebars;

  function _defineProperty(obj, key, value) {
    if (key in obj) {
      Object.defineProperty(obj, key, {
        value: value,
        enumerable: true,
        configurable: true,
        writable: true
      });
    } else {
      obj[key] = value;
    }

    return obj;
  }

  var Template = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
    this.compilerInfo = [4,'>= 1.0.0'];
  helpers = this.merge(helpers, Handlebars.helpers);  


    return "<div aria-live=\"polite\" class=\"visible-hidden\"></div>\n";
    });
  function screenreaderNotificationTpl(data, options, asString) {
    var html = Template(data, options);
    return (asString || true) ? html : $(html);
  }

  var screenreaderNotificationTimeout = 20000;
  /**
   * Creates the plugin
   */

  var plugin = pluginFactory({
    name: 'timer',

    /**
     * Install step, add behavior before the lifecycle
     */
    install: function install() {
      var testRunner = this.getTestRunner();
      /**
       * Load the timers, from the given timeConstraints and reading the current value in the store
       * @param {store} timeStore - where the values are read
       * @param {Object} config - the current config, especially for the warnings
       * @returns {Promise<Object[]>} the list of timers for the current context
       */

      this.loadTimers = function loadTimers(timeStore, config) {
        var testContext = testRunner.getTestContext();
        var testPart = testRunner.getCurrentPart();
        var isLinear = testPart && testPart.isLinear;
        var timeConstraints = testContext.timeConstraints;
        var timers = timersFactory(timeConstraints, isLinear, config);
        return Promise.all(_.map(timers, function (timer) {
          return timeStore.getItem("consumed_".concat(timer.id)).then(function (savedConsumedTime) {
            if (_.isNumber(savedConsumedTime) && savedConsumedTime >= 0 && config.restoreTimerFromClient) {
              timer.remainingTime = timer.originalTime + timer.extraTime.total - savedConsumedTime;
            }
          });
        })).then(function () {
          return timers;
        });
      };
      /**
       * Save consumed time values into the store
       * @param {store} timeStore - where the values are saved
       * @param {Object[]} timers - the timers to save
       * @returns {Promise} resolves once saved
       */


      this.saveTimers = function saveTimers(timeStore, timers) {
        return Promise.all(_.map(timers, function (timer) {
          return timeStore.setItem("consumed_".concat(timer.id), timer.originalTime + timer.extraTime.total - timer.remainingTime);
        }));
      }; //define the "timer" store as "volatile" (removed on browser change).


      testRunner.getTestStore().setVolatile(this.getName());
    },

    /**
     * Initializes the plugin (called during runner's init)
     *
     * @returns {Promise}
     */
    init: function init() {
      var self = this;
      var testRunner = this.getTestRunner();
      var testRunnerOptions = testRunner.getOptions();
      var screenreaderNotifcationTimeoutId;
      var stats = {};
      ['test', 'testPart', 'section', 'item'].forEach(function (scope) {
        return Object.assign(stats, _defineProperty({}, scope, statsHelper.getInstantStats(scope, testRunner)));
      });
      /**
       * Plugin config,
       */

      var config = Object.assign({
        /**
         * An option to control is the warnings are contextual or global
         */
        contextualWarnings: false,

        /**
         * The list of configured warnings
         */
        warnings: testRunnerOptions.timerWarning || {},

        /**
         * The list of configured warnings for screenreaders
         */
        warningsForScreenreader: testRunnerOptions.timerWarningForScreenreader || {},

        /**
         * The guided navigation option
         */
        guidedNavigation: testRunnerOptions.guidedNavigation,

        /**
         * Restore timer from client.
         */
        restoreTimerFromClient: testRunnerOptions.timer && testRunnerOptions.timer.restoreTimerFromClient,

        /**
         * Questions stats
         */
        questionsStats: stats
      }, this.getConfig());
      /**
       * Set up the strategy handler
       */

      var strategyHandler = getStrategyHandler(testRunner);
      /**
       * dispatch errors to the test runner
       * @param {Error} err - to dispatch
       */

      var handleError = function handleError(err) {
        testRunner.trigger('error', err);
      };

      function loadSavedTimers(timeStore) {
        var testContext = testRunner.getTestContext(); //update the timers before each item

        if (self.timerbox && testContext.timeConstraints) {
          return self.loadTimers(timeStore, config).then(function (timers) {
            return self.timerbox.update(timers);
          }).catch(handleError);
        }
      }

      return new Promise(function (resolve) {
        //load the plugin store
        return testRunner.getPluginStore(self.getName()).then(function (timeStore) {
          testRunner.before('renderitem', function () {
            return loadSavedTimers(timeStore);
          }).before('enableitem', function () {
            if (config.restoreTimerFromClient) {
              return loadSavedTimers(timeStore);
            }
          }).on('tick', function (elapsed) {
            if (self.timerbox) {
              var timers = self.timerbox.getTimers();
              var updatedTimers = Object.keys(timers).reduce(function (acc, timerName) {
                var statsScope = statsHelper.getInstantStats(timers[timerName].scope, testRunner);
                var unansweredQuestions = statsScope && statsScope.questions - statsScope.answered;
                acc[timerName] = Object.assign({}, timers[timerName], {
                  remainingTime: timers[timerName].remainingTime - elapsed,
                  unansweredQuestions: unansweredQuestions
                });
                return acc;
              }, {});
              self.timerbox.update(updatedTimers).catch(handleError);
            }
          }).after('renderitem', function () {
            if (self.timerbox) {
              $$1(self.timerbox.getElement()).find('.timer-wrapper').attr('aria-hidden', isReviewPanelEnabled(testRunner));
              self.timerbox.start();
            }

            self.$screenreaderWarningContainer.text('');
          }).after('enableitem', function () {
            if (self.timerbox && config.restoreTimerFromClient) {
              //this will "resume" the countdowns if timers have client mode
              self.timerbox.start();
            }
          }).on('move skip', function () {
            if (self.timerbox) {
              //this will "pause" the countdowns
              self.timerbox.stop();
            }
          }).on('disableitem', function () {
            if (self.timerbox && config.restoreTimerFromClient) {
              //this will "pause" the countdowns if timers have client mode
              self.timerbox.stop();
            }
          });
          timeStore.getItem('zen-mode').then(function (startZen) {
            //set up the timerbox
            self.timerbox = timerboxFactory({
              ariaHidden: isReviewPanelEnabled(testRunner),
              zenMode: {
                enabled: true,
                startHidden: !!startZen
              },
              displayWarning: config.contextualWarnings
            }).on('change', _.throttle(function () {
              //update the store with the current timer values
              self.saveTimers(timeStore, this.getTimers());
            }, 1000)).on('timeradd', function (timer) {
              strategyHandler.setUp(timer).catch(handleError);
            }).on('timerremove', function (timer) {
              strategyHandler.tearDown(timer).catch(handleError);
            }).on('timerstart', function (timer) {
              strategyHandler.start(timer).catch(handleError);
            }).on('timerstop', function (timer) {
              strategyHandler.stop(timer).catch(handleError);
            }).on('timerend', function (timer) {
              strategyHandler.complete(timer).catch(handleError);
            }).on('timerchange', function (action, timer) {
              //backward compatible events
              self.trigger("".concat(action, "timer"), timer.qtiClassName, timer);
            }).on('zenchange', function (isZen) {
              timeStore.setItem('zen-mode', !!isZen);
            }).on('init', resolve).on('error', handleError); // share this timer values to use in other components

            self.timerbox.spread(testRunner, 'timertick');

            if (!config.contextualWarnings) {
              self.timerbox.on('warn', function (message, level) {
                if (level && message) {
                  testRunner.trigger(level, message);
                }
              }); // debounce used to prevent multiple invoking at the same time

              self.timerbox.on('warnscreenreader', _.debounce(function (message, remainingTime, scope) {
                var statsScope = statsHelper.getInstantStats(scope, testRunner);
                var unansweredQuestions = statsScope && statsScope.questions - statsScope.answered;

                if (screenreaderNotifcationTimeoutId) {
                  clearTimeout(screenreaderNotifcationTimeoutId);
                }

                self.$screenreaderWarningContainer.text(message(remainingTime, unansweredQuestions));
                screenreaderNotifcationTimeoutId = setTimeout(function () {
                  return self.$screenreaderWarningContainer.text('');
                }, screenreaderNotificationTimeout);
              }, 1000, {
                'leading': true,
                'trailing': false
              }));
            }
          }).catch(handleError);
        });
      });
    },

    /**
     * Called during the runner's render phase
     */
    render: function render() {
      var $container = this.getAreaBroker().getControlArea();
      this.$screenreaderWarningContainer = $$1(screenreaderNotificationTpl());
      this.timerbox.render($container);
      $container.append(this.$screenreaderWarningContainer);
    },

    /**
     * Called during the runner's destroy phase
     */
    destroy: function destroy() {
      if (this.timerbox) {
        this.timerbox.stop().destroy();
      }
    },

    /**
     * Shows the timers
     */
    show: function show() {
      if (this.timerbox) {
        this.timerbox.show();
      }
    },

    /**
     * Hides the timers
     */
    hide: function hide() {
      if (this.timerbox) {
        this.timerbox.hide();
      }
    }
  });

  return plugin;

});
