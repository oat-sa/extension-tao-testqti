define(['jquery', 'i18n', 'taoTests/runner/plugin', 'ui/hider', 'ui/stacker', 'util/shortcut', 'util/namespace', 'handlebars'], function ($$1, __, pluginFactory, hider, stackerFactory, shortcut, namespaceHelper, Handlebars) { 'use strict';

    $$1 = $$1 && Object.prototype.hasOwnProperty.call($$1, 'default') ? $$1['default'] : $$1;
    __ = __ && Object.prototype.hasOwnProperty.call(__, 'default') ? __['default'] : __;
    pluginFactory = pluginFactory && Object.prototype.hasOwnProperty.call(pluginFactory, 'default') ? pluginFactory['default'] : pluginFactory;
    hider = hider && Object.prototype.hasOwnProperty.call(hider, 'default') ? hider['default'] : hider;
    stackerFactory = stackerFactory && Object.prototype.hasOwnProperty.call(stackerFactory, 'default') ? stackerFactory['default'] : stackerFactory;
    shortcut = shortcut && Object.prototype.hasOwnProperty.call(shortcut, 'default') ? shortcut['default'] : shortcut;
    namespaceHelper = namespaceHelper && Object.prototype.hasOwnProperty.call(namespaceHelper, 'default') ? namespaceHelper['default'] : namespaceHelper;
    Handlebars = Handlebars && Object.prototype.hasOwnProperty.call(Handlebars, 'default') ? Handlebars['default'] : Handlebars;

    var Template = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
      this.compilerInfo = [4,'>= 1.0.0'];
    helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
      var buffer = "", helper, options, helperMissing=helpers.helperMissing, escapeExpression=this.escapeExpression;


      buffer += "<div data-control=\"qti-comment\" class=\"hidden\">\n    <textarea data-control=\"qti-comment-text\" placeholder=\""
        + escapeExpression((helper = helpers.__ || (depth0 && depth0.__),options={hash:{},data:data},helper ? helper.call(depth0, "Your comment…", options) : helperMissing.call(depth0, "__", "Your comment…", options)))
        + "\"></textarea>\n    <button data-control=\"qti-comment-cancel\" class=\"btn-info small\"></span>"
        + escapeExpression((helper = helpers.__ || (depth0 && depth0.__),options={hash:{},data:data},helper ? helper.call(depth0, "Cancel", options) : helperMissing.call(depth0, "__", "Cancel", options)))
        + "</button>\n    <button data-control=\"qti-comment-send\" class=\"btn-info small\">"
        + escapeExpression((helper = helpers.__ || (depth0 && depth0.__),options={hash:{},data:data},helper ? helper.call(depth0, "Send", options) : helperMissing.call(depth0, "__", "Send", options)))
        + "</button>\n</div>\n";
      return buffer;
      });
    function commentTpl(data, options, asString) {
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
     * Copyright (c) 2016 (original work) Open Assessment Technologies SA ;
     */
    /**
     * Returns the configured plugin
     */

    var comment = pluginFactory({
      name: 'comment',

      /**
       * Initialize the plugin (called during runner's init)
       */
      init: function init() {
        var self = this;
        var testRunner = this.getTestRunner();
        var testRunnerOptions = testRunner.getOptions();
        var pluginShortcuts = (testRunnerOptions.shortcuts || {})[this.getName()] || {};
        var stacker = stackerFactory('test-runner');
        /**
         * Checks if the plugin is currently available
         * @returns {Boolean}
         */

        function isEnabled() {
          var currentItem = testRunner.getCurrentItem();

          if (typeof currentItem.allowComment === 'boolean') {
            return currentItem.allowComment;
          } //@deprecated use allowComment from the testMap


          var testContext = testRunner.getTestContext();
          var contextOptions = testContext.options || {};
          return !!contextOptions.allowComment;
        }
        /**
         * Can we comment ? if not, then we hide the plugin
         */


        function togglePlugin() {
          if (isEnabled()) {
            self.show();
          } else {
            self.hide();
          }
        }
        /**
         * Show/hide the comment panel
         */


        function toggleComment() {
          if (self.getState('enabled') !== false) {
            //just show/hide the form
            hider.toggle(self.$form);

            if (!hider.isHidden(self.$form)) {
              //reset the form on each display
              self.$input.val('').focus();
              self.button.turnOn();
              stacker.bringToFront(self.$form);
            } else {
              self.button.turnOff();
            }
          }
        } // register button in toolbox


        this.button = this.getAreaBroker().getToolbox().createEntry({
          control: 'comment',
          title: __('Leave a comment'),
          icon: 'tag',
          text: __('Comment')
        }); //get access to controls

        this.button.on('render', function () {
          self.$button = self.button.getElement();
          self.$form = $$1(commentTpl()).appendTo(self.$button);
          self.$input = self.$button.find('[data-control="qti-comment-text"]');
          self.$cancel = self.$button.find('[data-control="qti-comment-cancel"]');
          self.$submit = self.$button.find('[data-control="qti-comment-send"]');
          stacker.autoBringToFront(self.$form); //hide the form without submit

          self.$cancel.on('click', function () {
            hider.hide(self.$form);
            self.button.turnOff();
          }); //submit the comment, then hide the form

          self.$submit.on('click', function () {
            var comment = self.$input.val();

            if (comment) {
              self.disable();
              self.button.turnOff();
              testRunner.getProxy().callTestAction('comment', {
                comment: comment
              }).then(function () {
                hider.hide(self.$form);
                self.enable();
              }).catch(function () {
                hider.hide(self.$form);
                self.enable();
              });
            }
          });
        }); //attach behavior

        this.button.on('click', function (e) {
          //prevent action if the click is made inside the form which is a sub part of the button
          if ($$1(e.target).closest('[data-control="qti-comment"]').length) {
            return;
          }

          e.preventDefault();
          testRunner.trigger('tool-comment');
        });

        if (testRunnerOptions.allowShortcuts) {
          if (pluginShortcuts.toggle) {
            shortcut.add(namespaceHelper.namespaceAll(pluginShortcuts.toggle, this.getName(), true), function () {
              testRunner.trigger('tool-comment');
            }, {
              avoidInput: true
            });
          }
        } //start disabled


        togglePlugin();
        this.disable(); //update plugin state based on changes

        testRunner.on('loaditem', togglePlugin).on('renderitem enabletools', function () {
          self.enable();
        }).on('unloaditem disabletools', function () {
          self.disable();
        }).on('tool-comment', function () {
          if (isEnabled()) {
            toggleComment();
          }
        });
      },

      /**
       * Called during the runner's destroy phase
       */
      destroy: function destroy() {
        shortcut.remove(".".concat(this.getName()));
      },

      /**
       * Enable the button
       */
      enable: function enable() {
        this.button.enable();
      },

      /**
       * Disable the button
       */
      disable: function disable() {
        if (this.$form) {
          hider.hide(this.$form);
        }

        this.button.disable();
        this.button.turnOff();
      },

      /**
       * Show the button
       */
      show: function show() {
        this.button.show();
      },

      /**
       * Hide the button
       */
      hide: function hide() {
        if (this.$form) {
          hider.hide(this.$form);
        }

        this.button.hide();
      }
    });

    return comment;

});
