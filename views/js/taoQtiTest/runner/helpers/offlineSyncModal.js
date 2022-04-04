define(['jquery', 'i18n', 'core/polling', 'ui/hider', 'ui/waitingDialog/waitingDialog', 'handlebars', 'util/shortcut/registry', 'util/shortcut'], function ($$1, __, polling, hider, waitingDialogFactory, Handlebars, shortcutRegistry, globalShortcut) { 'use strict';

    $$1 = $$1 && Object.prototype.hasOwnProperty.call($$1, 'default') ? $$1['default'] : $$1;
    __ = __ && Object.prototype.hasOwnProperty.call(__, 'default') ? __['default'] : __;
    polling = polling && Object.prototype.hasOwnProperty.call(polling, 'default') ? polling['default'] : polling;
    hider = hider && Object.prototype.hasOwnProperty.call(hider, 'default') ? hider['default'] : hider;
    waitingDialogFactory = waitingDialogFactory && Object.prototype.hasOwnProperty.call(waitingDialogFactory, 'default') ? waitingDialogFactory['default'] : waitingDialogFactory;
    Handlebars = Handlebars && Object.prototype.hasOwnProperty.call(Handlebars, 'default') ? Handlebars['default'] : Handlebars;
    shortcutRegistry = shortcutRegistry && Object.prototype.hasOwnProperty.call(shortcutRegistry, 'default') ? shortcutRegistry['default'] : shortcutRegistry;
    globalShortcut = globalShortcut && Object.prototype.hasOwnProperty.call(globalShortcut, 'default') ? globalShortcut['default'] : globalShortcut;

    var Template = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
      this.compilerInfo = [4,'>= 1.0.0'];
    helpers = this.merge(helpers, Handlebars.helpers);  


      return "<p class=\"button-subtext\"></p>\n";
      });
    function offlineSyncModalCountdownTpl(data, options, asString) {
      var html = Template(data, options);
      return (asString || true) ? html : $(html);
    }

    var Template$1 = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
      this.compilerInfo = [4,'>= 1.0.0'];
    helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
      var buffer = "", helper, options, helperMissing=helpers.helperMissing, escapeExpression=this.escapeExpression;


      buffer += "<div class=\"wait-content\">\n    <p>"
        + escapeExpression((helper = helpers.__ || (depth0 && depth0.__),options={hash:{},data:data},helper ? helper.call(depth0, "It is not possible to save your responses while working offline.", options) : helperMissing.call(depth0, "__", "It is not possible to save your responses while working offline.", options)))
        + "</p>\n    <p class=\"wait-content_text\"><strong>"
        + escapeExpression((helper = helpers.__ || (depth0 && depth0.__),options={hash:{},data:data},helper ? helper.call(depth0, "Option A", options) : helperMissing.call(depth0, "__", "Option A", options)))
        + "</strong></p>\n    <ul class=\"wait-content_actions-list\">\n        <li>"
        + escapeExpression((helper = helpers.__ || (depth0 && depth0.__),options={hash:{},data:data},helper ? helper.call(depth0, "Wait for your connection to come back online.", options) : helperMissing.call(depth0, "__", "Wait for your connection to come back online.", options)))
        + "</li>\n        <li>"
        + escapeExpression((helper = helpers.__ || (depth0 && depth0.__),options={hash:{},data:data},helper ? helper.call(depth0, "Try connecting the machine to the internet via cable, or move to an area with a better wifi signal.", options) : helperMissing.call(depth0, "__", "Try connecting the machine to the internet via cable, or move to an area with a better wifi signal.", options)))
        + "</li>\n        <li>"
        + escapeExpression((helper = helpers.__ || (depth0 && depth0.__),options={hash:{},data:data},helper ? helper.call(depth0, "If the connection cannot be restored, see option B.", options) : helperMissing.call(depth0, "__", "If the connection cannot be restored, see option B.", options)))
        + "</li>\n    </ul>\n    <p class=\"wait-content_text\"><strong>"
        + escapeExpression((helper = helpers.__ || (depth0 && depth0.__),options={hash:{},data:data},helper ? helper.call(depth0, "Option B", options) : helperMissing.call(depth0, "__", "Option B", options)))
        + "</strong></p>\n    <ul class=\"wait-content_actions-list\">\n        <li>"
        + escapeExpression((helper = helpers.__ || (depth0 && depth0.__),options={hash:{},data:data},helper ? helper.call(depth0, "Download the pupil responses and submit manually.", options) : helperMissing.call(depth0, "__", "Download the pupil responses and submit manually.", options)))
        + "</li>\n    </ul>\n    <p>"
        + escapeExpression((helper = helpers.__ || (depth0 && depth0.__),options={hash:{},data:data},helper ? helper.call(depth0, "Step 1: Download the file (see below when available).", options) : helperMissing.call(depth0, "__", "Step 1: Download the file (see below when available).", options)))
        + " <strong>"
        + escapeExpression((helper = helpers.__ || (depth0 && depth0.__),options={hash:{},data:data},helper ? helper.call(depth0, "Do not rename it.", options) : helperMissing.call(depth0, "__", "Do not rename it.", options)))
        + "</strong></p>\n    <p>"
        + escapeExpression((helper = helpers.__ || (depth0 && depth0.__),options={hash:{},data:data},helper ? helper.call(depth0, "Step 2: When you are online again, please send the downloaded file to receptionbaseline@nfer.ac.uk together with the ", options) : helperMissing.call(depth0, "__", "Step 2: When you are online again, please send the downloaded file to receptionbaseline@nfer.ac.uk together with the ", options)))
        + "\n        <strong>"
        + escapeExpression((helper = helpers.__ || (depth0 && depth0.__),options={hash:{},data:data},helper ? helper.call(depth0, "name of the pupil", options) : helperMissing.call(depth0, "__", "name of the pupil", options)))
        + "</strong> "
        + escapeExpression((helper = helpers.__ || (depth0 && depth0.__),options={hash:{},data:data},helper ? helper.call(depth0, "and", options) : helperMissing.call(depth0, "__", "and", options)))
        + " <strong>"
        + escapeExpression((helper = helpers.__ || (depth0 && depth0.__),options={hash:{},data:data},helper ? helper.call(depth0, "the assessment (LCL or Mathematics)", options) : helperMissing.call(depth0, "__", "the assessment (LCL or Mathematics)", options)))
        + "</strong> "
        + escapeExpression((helper = helpers.__ || (depth0 && depth0.__),options={hash:{},data:data},helper ? helper.call(depth0, "that was being taken.", options) : helperMissing.call(depth0, "__", "that was being taken.", options)))
        + "\n    </p>\n    <p>"
        + escapeExpression((helper = helpers.__ || (depth0 && depth0.__),options={hash:{},data:data},helper ? helper.call(depth0, "Step 3: Once you have downloaded the file you can close the browser window. Do not do anything further with the assessment whilst it shows as \"in progress\"; the status will be updated once the helpline has uploaded the file.", options) : helperMissing.call(depth0, "__", "Step 3: Once you have downloaded the file you can close the browser window. Do not do anything further with the assessment whilst it shows as \"in progress\"; the status will be updated once the helpline has uploaded the file.", options)))
        + "</p>\n    <br />\n    <p>"
        + escapeExpression((helper = helpers.__ || (depth0 && depth0.__),options={hash:{},data:data},helper ? helper.call(depth0, "If you need help, please contact our Helpline on 0330 088 4171.", options) : helperMissing.call(depth0, "__", "If you need help, please contact our Helpline on 0330 088 4171.", options)))
        + "</p>\n</div>";
      return buffer;
      });
    function offlineSyncModalWaitContentTpl(data, options, asString) {
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
     * Copyright (c) 2019 (original work) Open Assessment Technologies SA ;
     */
    /**
     * Display the waiting dialog, while waiting the connection to be back
     * @param {Object} [proxy] - test runner proxy
     * @returns {waitingDialog} resolves once the wait is over and the user click on 'proceed'
     */

    function offlineSyncModalFactory(proxy) {
      var waitingConfig = {
        message: __('You are currently working offline.'),
        waitContent: offlineSyncModalWaitContentTpl(),
        proceedContent: __('Your connection seems to be back, please proceed.'),
        proceedButtonText: __('PROCEED & END ASSESSMENT'),
        showSecondary: true,
        secondaryButtonText: __('Download'),
        secondaryButtonIcon: 'download',
        buttonSeparatorText: __('or'),
        width: '600px'
      };
      var $secondaryButton;
      var betweenButtonTextSelector = '.between-buttons-text';
      var secondaryButtonWait = 60; // seconds to wait until it enables

      var delaySec;
      var $countdown = $$1(offlineSyncModalCountdownTpl());
      var countdownPolling;
      var dialogShortcut = shortcutRegistry($$1('body'), {
        propagate: false,
        prevent: true
      }); // starts with shortcuts disabled, prevents the TAB key to be used to move outside the dialog box

      dialogShortcut.disable().set('Tab Shift+Tab'); //creates the waiting modal dialog

      var waitingDialog = waitingDialogFactory(waitingConfig);

      var getDialogEl = function getDialogEl(selector) {
        return waitingDialog.dialog.getDom().find(selector);
      };

      waitingDialog.on('render', function () {
        delaySec = secondaryButtonWait;
        $secondaryButton = getDialogEl('button[data-control="secondary"]');
        $countdown.insertAfter($secondaryButton);
        proxy.after('reconnect.waiting', function () {
          waitingDialog.endWait();
          hider.hide(getDialogEl('p.message'));
        });
        proxy.before('disconnect.waiting', function () {
          // need to open dialog again if it is closed
          waitingDialog.dialog.show();
          waitingDialog.beginWait();
        }); // if render comes before beginWait:

        if (waitingDialog.is('waiting')) {
          waitingDialog.trigger('begincountdown');
        }

        globalShortcut.disable();
        dialogShortcut.enable();
      }).on('destroy', function () {
        proxy.off('.waiting');
        globalShortcut.enable();
        dialogShortcut.disable();
        dialogShortcut.clear();
      }).on('wait', function () {
        hider.show(getDialogEl(betweenButtonTextSelector));
        hider.show(getDialogEl('p.message')); // if beginWait comes before render:

        if (waitingDialog.is('rendered')) {
          waitingDialog.trigger('begincountdown');
        }
      }).on('begincountdown', function () {
        // Set up secondary button time delay:
        // it can only be clicked after 60 seconds have passed
        // if disconnect-reconnect delay will be left seconds
        $secondaryButton.prop('disabled', true);
        countdownPolling = polling({
          action: function countdownAction() {
            delaySec--;
            $countdown.html(__('The download will be available in <strong>%d</strong> seconds', delaySec));

            if (delaySec < 1) {
              this.stop();
              $secondaryButton.removeProp('disabled');
              $countdown.html('');
            }
          },
          interval: 1000,
          autoStart: true
        });
      }).on('unwait', function () {
        countdownPolling.stop();
        $secondaryButton.prop('disabled', true);
        $countdown.html('');
        hider.hide(getDialogEl(betweenButtonTextSelector));
      });
      return waitingDialog;
    }

    return offlineSyncModalFactory;

});
