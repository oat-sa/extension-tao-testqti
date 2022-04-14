define(['jquery', 'lodash', 'i18n', 'ui/dialog', 'handlebars'], function ($$1, _, __, dialog, Handlebars) { 'use strict';

    $$1 = $$1 && Object.prototype.hasOwnProperty.call($$1, 'default') ? $$1['default'] : $$1;
    _ = _ && Object.prototype.hasOwnProperty.call(_, 'default') ? _['default'] : _;
    __ = __ && Object.prototype.hasOwnProperty.call(__, 'default') ? __['default'] : __;
    dialog = dialog && Object.prototype.hasOwnProperty.call(dialog, 'default') ? dialog['default'] : dialog;
    Handlebars = Handlebars && Object.prototype.hasOwnProperty.call(Handlebars, 'default') ? Handlebars['default'] : Handlebars;

    var Template = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
      this.compilerInfo = [4,'>= 1.0.0'];
    helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
      var buffer = "", stack1, helper, functionType="function", escapeExpression=this.escapeExpression, self=this;

    function program1(depth0,data) {
      
      
      return "checked";
      }

      buffer += "<label for=\"";
      if (helper = helpers.id) { stack1 = helper.call(depth0, {hash:{},data:data}); }
      else { helper = (depth0 && depth0.id); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
      buffer += escapeExpression(stack1)
        + "\">\n    <input type=\"checkbox\" id=\"";
      if (helper = helpers.id) { stack1 = helper.call(depth0, {hash:{},data:data}); }
      else { helper = (depth0 && depth0.id); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
      buffer += escapeExpression(stack1)
        + "\" name=\"";
      if (helper = helpers.id) { stack1 = helper.call(depth0, {hash:{},data:data}); }
      else { helper = (depth0 && depth0.id); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
      buffer += escapeExpression(stack1)
        + "\" ";
      stack1 = helpers['if'].call(depth0, (depth0 && depth0.checked), {hash:{},inverse:self.noop,fn:self.program(1, program1, data),data:data});
      if(stack1 || stack1 === 0) { buffer += stack1; }
      buffer += " />\n    <span class=\"icon-checkbox\"></span>\n    ";
      if (helper = helpers.text) { stack1 = helper.call(depth0, {hash:{},data:data}); }
      else { helper = (depth0 && depth0.text); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
      buffer += escapeExpression(stack1)
        + "\n</label>";
      return buffer;
      });
    function checkboxTpl(data, options, asString) {
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
     * Copyright (c) 2019 (original work) Open Assessment Technologies SA ;
     */
    /**
     * Displays a confirmation dialog with a checkbox in it
     *
     * @param {String} heading - Above the main message
     * @param {String} message - The displayed message
     * @param {Function} accept - An action called when the dialog is accepted
     * @param {Function} refuse - An action called when the dialog is refused
     * @param {Object} checkboxParams - Checkbox options
     * @param {Boolean} [checkboxParams.checked] - True to render it checked
     * @param {Function} [checkboxParams.submitChecked] - Action called when dialog accepted with checkbox checked
     * @param {Function} [checkboxParams.submitUnchecked] - Action called when dialog accepted with checkbox unchecked
     * @returns {dialog} - Returns the dialog instance
     */

    function dialogConfirmNext(heading, message, accept, refuse, checkboxParams, dialogOptions) {
      var accepted = false;
      var dlg;
      var content = null;

      if (checkboxParams && checkboxParams.checked !== true) {
        content = checkboxTpl({
          checked: false,
          text: "Don't show this again next time",
          id: 'dont-show-again'
        });
      }

      dialogOptions = _.defaults({
        heading: heading,
        message: message,
        content: content,
        autoRender: true,
        autoDestroy: true,
        buttons: [{
          id: 'cancel',
          type: 'regular',
          label: __('Cancel'),
          close: true
        }, {
          id: 'ok',
          type: 'info',
          label: __('Go to next item'),
          close: true
        }],
        onOkBtn: function onOkBtn() {
          var $checkbox;
          accepted = true;

          if (_.isFunction(accept)) {
            accept.call(this);

            if (checkboxParams) {
              // handle checkbox callbacks:
              $checkbox = $$1('input[name="dont-show-again"]', this);

              if ($checkbox.prop('checked') && _.isFunction(checkboxParams.submitChecked)) {
                checkboxParams.submitChecked();
              } else if (!$checkbox.prop('checked') && _.isFunction(checkboxParams.submitUnchecked)) {
                checkboxParams.submitUnchecked();
              }
            }
          }
        }
      }, dialogOptions);
      dlg = dialog(dialogOptions);

      if (_.isFunction(refuse)) {
        dlg.on('closed.modal', function () {
          if (!accepted) {
            refuse.call(this);
          }
        });
      }

      return dlg;
    }

    return dialogConfirmNext;

});
