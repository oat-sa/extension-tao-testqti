define(['jquery', 'lodash', 'i18n', 'core/polling', 'ui/waitingDialog/waitingDialog', 'taoTests/runner/plugin', 'handlebars', 'util/namespace'], function ($$1, _, __, pollingFactory, waitingDialog, pluginFactory, Handlebars, namespaceHelper) { 'use strict';

    $$1 = $$1 && Object.prototype.hasOwnProperty.call($$1, 'default') ? $$1['default'] : $$1;
    _ = _ && Object.prototype.hasOwnProperty.call(_, 'default') ? _['default'] : _;
    __ = __ && Object.prototype.hasOwnProperty.call(__, 'default') ? __['default'] : __;
    pollingFactory = pollingFactory && Object.prototype.hasOwnProperty.call(pollingFactory, 'default') ? pollingFactory['default'] : pollingFactory;
    waitingDialog = waitingDialog && Object.prototype.hasOwnProperty.call(waitingDialog, 'default') ? waitingDialog['default'] : waitingDialog;
    pluginFactory = pluginFactory && Object.prototype.hasOwnProperty.call(pluginFactory, 'default') ? pluginFactory['default'] : pluginFactory;
    Handlebars = Handlebars && Object.prototype.hasOwnProperty.call(Handlebars, 'default') ? Handlebars['default'] : Handlebars;
    namespaceHelper = namespaceHelper && Object.prototype.hasOwnProperty.call(namespaceHelper, 'default') ? namespaceHelper['default'] : namespaceHelper;

    var Template = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
      this.compilerInfo = [4,'>= 1.0.0'];
    helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
      var buffer = "", stack1, helper, options, helperMissing=helpers.helperMissing, escapeExpression=this.escapeExpression, functionType="function", self=this;

    function program1(depth0,data) {
      
      
      return " with-message";
      }

    function program3(depth0,data) {
      
      var buffer = "", helper, options;
      buffer += "<span class=\"message-connect\">"
        + escapeExpression((helper = helpers.__ || (depth0 && depth0.__),options={hash:{},data:data},helper ? helper.call(depth0, "Online", options) : helperMissing.call(depth0, "__", "Online", options)))
        + "</span>";
      return buffer;
      }

    function program5(depth0,data) {
      
      var buffer = "", helper, options;
      buffer += "<span class=\"message-disconnected\">"
        + escapeExpression((helper = helpers.__ || (depth0 && depth0.__),options={hash:{},data:data},helper ? helper.call(depth0, "Offline", options) : helperMissing.call(depth0, "__", "Offline", options)))
        + "</span>";
      return buffer;
      }

      buffer += "<div class=\"connectivity-box ";
      if (helper = helpers.state) { stack1 = helper.call(depth0, {hash:{},data:data}); }
      else { helper = (depth0 && depth0.state); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
      buffer += escapeExpression(stack1);
      stack1 = helpers['if'].call(depth0, (depth0 && depth0.message), {hash:{},inverse:self.noop,fn:self.program(1, program1, data),data:data});
      if(stack1 || stack1 === 0) { buffer += stack1; }
      buffer += "\">\n    ";
      stack1 = helpers['if'].call(depth0, (depth0 && depth0.message), {hash:{},inverse:self.noop,fn:self.program(3, program3, data),data:data});
      if(stack1 || stack1 === 0) { buffer += stack1; }
      buffer += "<span data-control=\"connectivity-connected\" class=\"qti-controls icon-connect\" title=\""
        + escapeExpression((helper = helpers.__ || (depth0 && depth0.__),options={hash:{},data:data},helper ? helper.call(depth0, "Connected to server", options) : helperMissing.call(depth0, "__", "Connected to server", options)))
        + "\"></span>\n    ";
      stack1 = helpers['if'].call(depth0, (depth0 && depth0.message), {hash:{},inverse:self.noop,fn:self.program(5, program5, data),data:data});
      if(stack1 || stack1 === 0) { buffer += stack1; }
      buffer += "<span data-control=\"connectivity-disconnected\" class=\"qti-controls icon-disconnect\" title=\""
        + escapeExpression((helper = helpers.__ || (depth0 && depth0.__),options={hash:{},data:data},helper ? helper.call(depth0, "Disconnected from server", options) : helperMissing.call(depth0, "__", "Disconnected from server", options)))
        + "\"></span>\n</div>\n";
      return buffer;
      });
    function connectivityTpl(data, options, asString) {
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
     * The plugin default configuration
     * @type {Object}
     * @property {Number} checkInterval - when offline, interval to check if we're back online
     * @property {Boolean} indicator - do we display the indicator in the test UI
     * @property {Boolean} message - do we display the message in the test UI
     */

    var defaultConfig = {
      checkInterval: 30 * 1000,
      indicator: true,
      message: false
    };
    /**
     * Creates the connectivity plugin.
     * Detects connectivity issues
     */

    var connectivity = pluginFactory({
      name: 'connectivity',

      /**
       * Initializes the plugin (called during runner's init)
       */
      init: function init() {
        var self = this;
        var testRunner = this.getTestRunner();
        var proxy = testRunner.getProxy();
        var config = Object.assign({}, defaultConfig, this.getConfig()); //Displays a connectivity indicator

        if (config && config.indicator) {
          //create the indicator
          this.$element = $$1(connectivityTpl({
            state: proxy.isOnline() ? 'connected' : 'disconnected',
            message: config.message
          }));
          testRunner.on('disconnect', function () {
            self.$element.removeClass('connected').addClass('disconnected');
          }).on('reconnect', function () {
            self.$element.removeClass('disconnected').addClass('connected');
          });
        } //update the interval, with the new value


        if (this.polling && _.isNumber(config.checkInterval)) {
          this.polling.setInterval(config.checkInterval);
        }
      },

      /**
       * Installs the plugin (called when the runner bind the plugin)
       * We do it before init to catch even offline during the init sequence
       */
      install: function install() {
        var self = this;
        var waiting = false;
        var testRunner = this.getTestRunner();
        var proxy = testRunner.getProxy();
        /**
         * Display the waiting dialog, while waiting the connection to be back
         * @param {String} [messsage] - additional message for the dialog
         * @returns {Promise} resolves once the wait is over and the user click on 'proceed'
         */

        this.displayWaitingDialog = function displayWaitingDialog() {
          var message = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';
          var dialog;
          return new Promise(function (resolve) {
            if (!waiting) {
              waiting = true; //if a pause event occurs while waiting,
              //we also wait the connection to be back

              testRunner.before('pause.waiting', function () {
                return new Promise(function (pauseResolve) {
                  proxy.off('reconnect.pausing').after('reconnect.pausing', pauseResolve);
                });
              }); //creates the waiting modal dialog

              dialog = waitingDialog({
                message: __('You are encountering a prolonged connectivity loss. ') + message,
                waitContent: __('Please wait while we try to restore the connection.'),
                proceedContent: __('The connection seems to be back, please proceed')
              }).on('proceed', function () {
                resolve();
              }).on('render', function () {
                proxy.off('reconnect.waiting').after('reconnect.waiting', function () {
                  testRunner.off('pause.waiting');
                  waiting = false;
                  dialog.endWait();
                });
              });
            }
          });
        }; //Last chance to check the connection,
        //by regular polling on the "up" signal


        this.polling = pollingFactory({
          action: function action() {
            testRunner.getProxy().telemetry(testRunner.getTestContext().itemIdentifier, 'up').catch(_.noop);
          },
          interval: defaultConfig.checkInterval,
          autoStart: false
        }); //the Proxy is the only one to know something about connectivity

        proxy.on('disconnect', function disconnect(source) {
          if (!testRunner.getState('disconnected')) {
            testRunner.setState('disconnected', true);
            testRunner.trigger('disconnect', source);
            self.polling.start();
          }
        }).on('reconnect', function reconnect() {
          if (testRunner.getState('disconnected')) {
            testRunner.setState('disconnected', false);
            testRunner.trigger('reconnect');
            self.polling.stop();
          }
        }); //intercept tries to leave while offline
        //this could be caused by pauses for example.
        //If caused by an action like exitTest it will be handled
        //by navigation errors (see below)

        testRunner.before('leave', function (e, data) {
          if (proxy.isOffline()) {
            self.displayWaitingDialog(data.message).then(function () {
              testRunner.trigger('leave', data);
            }).catch(function (generalErr) {
              testRunner.trigger('error', generalErr);
            });
            return false;
          }
        }); //intercept offline navigation errors

        testRunner.before('error.connectivity', function (e, err) {
          // detect and prevent connectivity errors
          if (proxy.isConnectivityError(err)) {
            return false;
          }

          if (proxy.isOffline()) {
            self.displayWaitingDialog().then(function () {
              if (err.type === 'nav') {
                testRunner.loadItem(testRunner.getTestContext().itemIdentifier);
              }

              if (err.type === 'finish') {
                testRunner.finish();
              }

              if (err.type === 'pause') {
                testRunner.trigger('pause', {
                  reasons: err.data && err.data.reasons,
                  message: err.data && err.data.comment
                });
              }
            }).catch(function (generalErr) {
              testRunner.trigger('error', generalErr);
            });
            return false;
          }
        });
        testRunner.before('loaditem.connectivity', function (e, itemRef, item) {
          var testContext = testRunner.getTestContext();
          var flags = item.flags;

          if (!flags) {
            return true;
          }

          if (flags.hasFeedbacks) {
            testContext.hasFeedbacks = true;
          }

          if ((flags.containsNonPreloadedAssets || flags.hasPci) && proxy.isOffline()) {
            self.displayWaitingDialog().then(function () {
              testRunner.loadItem(itemRef);
            });
            return false;
          }
        });
        testRunner.before(namespaceHelper.namespaceAll('move skip timeout', 'connectivity'), function (e) {
          for (var _len = arguments.length, args = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
            args[_key - 1] = arguments[_key];
          }

          var testContext = testRunner.getTestContext();
          var currentItem = testRunner.getCurrentItem();

          if (proxy.isOffline() && (currentItem.hasFeedbacks || testContext.hasFeedbacks)) {
            testRunner.trigger('disableitem');
            self.displayWaitingDialog().then(function () {
              var _testRunner$trigger;

              (_testRunner$trigger = testRunner.trigger('enableitem')).trigger.apply(_testRunner$trigger, [e.name].concat(args));
            });
            return false;
          }
        });
      },
      destroy: function destroy() {
        this.getTestRunner().off('.connectivity');
      },

      /**
       * Called during the runner's render phase
       */
      render: function render() {
        var $container = this.getAreaBroker().getControlArea();

        if (this.$element) {
          $container.append(this.$element);
        }
      }
    });

    return connectivity;

});
