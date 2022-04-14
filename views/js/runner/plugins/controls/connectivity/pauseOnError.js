define(['i18n', 'taoTests/runner/plugin', 'handlebars'], function (__, pluginFactory, Handlebars) { 'use strict';

    __ = __ && Object.prototype.hasOwnProperty.call(__, 'default') ? __['default'] : __;
    pluginFactory = pluginFactory && Object.prototype.hasOwnProperty.call(pluginFactory, 'default') ? pluginFactory['default'] : pluginFactory;
    Handlebars = Handlebars && Object.prototype.hasOwnProperty.call(Handlebars, 'default') ? Handlebars['default'] : Handlebars;

    var Template = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
      this.compilerInfo = [4,'>= 1.0.0'];
    helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
      var buffer = "", stack1, helper, functionType="function", escapeExpression=this.escapeExpression;


      buffer += "<b>";
      if (helper = helpers.title) { stack1 = helper.call(depth0, {hash:{},data:data}); }
      else { helper = (depth0 && depth0.title); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
      buffer += escapeExpression(stack1)
        + "</b><br><br>\n";
      if (helper = helpers.message) { stack1 = helper.call(depth0, {hash:{},data:data}); }
      else { helper = (depth0 && depth0.message); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
      buffer += escapeExpression(stack1);
      return buffer;
      });
    function dialogTpl(data, options, asString) {
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
    var name = 'pauseOnError';
    var dialogMessage = {
      title: __('Something unexpected happened.'),
      message: __('Please try reloading the page or pause the test. If you pause, you will be able to resume the test from this page.')
    };
    var dialogConfig = {
      focus: 'cancel',
      buttons: {
        labels: {
          ok: __('Pause the test'),
          cancel: __('Reload the page')
        }
      }
    };
    var pauseContext = {
      reasons: {
        category: 'technical',
        subCategory: 'error'
      },
      originalMessage: 'Due to an unexpected issue the test has been suspended.'
    };
    var pauseOnError = pluginFactory({
      name: name,

      /**
       * Initialize the plugin (called during runner's init)
       */
      init: function init() {
        var testRunner = this.getTestRunner();

        var returnToHome = function returnToHome() {
          return testRunner.trigger('pause', pauseContext);
        };

        var reloadPage = function reloadPage() {
          return testRunner.trigger('reloadpage');
        };

        var processError = function processError(error) {
          testRunner.on('reloadpage', function () {
            return window.location.reload();
          }).trigger('disablenav disabletools hidenav').trigger("confirm.".concat(name), dialogTpl(dialogMessage), returnToHome, reloadPage, dialogConfig);

          if (error.code === 500) {
            error.originalCode = error.code;
            delete error.code;
            testRunner.trigger("disablefeedbackalerts");
            testRunner.after('error.pauseOnError', function () {
              testRunner.off('error.pauseOnError');
              testRunner.trigger("enablefeedbackalerts");
            });
          }
        };

        testRunner.before('error', function (e, error) {
          return processError(error);
        });
      }
    });

    return pauseOnError;

});
