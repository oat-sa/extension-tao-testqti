define(['i18n', 'jquery', 'taoTests/runner/plugin', 'taoQtiTest/runner/helpers/isReviewPanelEnabled', 'taoQtiTest/runner/plugins/content/accessibility/jumplinks/helpers', 'taoQtiTest/runner/plugins/content/accessibility/jumplinks/jumplinks', 'taoQtiTest/runner/plugins/content/accessibility/jumplinks/shortcuts', 'util/shortcut', 'util/namespace', 'handlebars'], function (__, $$1, pluginFactory, isReviewPanelEnabled, helpers, jumplinksFactory, shortcutsFactory, shortcut, namespaceHelper, Handlebars) { 'use strict';

    __ = __ && Object.prototype.hasOwnProperty.call(__, 'default') ? __['default'] : __;
    $$1 = $$1 && Object.prototype.hasOwnProperty.call($$1, 'default') ? $$1['default'] : $$1;
    pluginFactory = pluginFactory && Object.prototype.hasOwnProperty.call(pluginFactory, 'default') ? pluginFactory['default'] : pluginFactory;
    isReviewPanelEnabled = isReviewPanelEnabled && Object.prototype.hasOwnProperty.call(isReviewPanelEnabled, 'default') ? isReviewPanelEnabled['default'] : isReviewPanelEnabled;
    jumplinksFactory = jumplinksFactory && Object.prototype.hasOwnProperty.call(jumplinksFactory, 'default') ? jumplinksFactory['default'] : jumplinksFactory;
    shortcutsFactory = shortcutsFactory && Object.prototype.hasOwnProperty.call(shortcutsFactory, 'default') ? shortcutsFactory['default'] : shortcutsFactory;
    shortcut = shortcut && Object.prototype.hasOwnProperty.call(shortcut, 'default') ? shortcut['default'] : shortcut;
    namespaceHelper = namespaceHelper && Object.prototype.hasOwnProperty.call(namespaceHelper, 'default') ? namespaceHelper['default'] : namespaceHelper;
    Handlebars = Handlebars && Object.prototype.hasOwnProperty.call(Handlebars, 'default') ? Handlebars['default'] : Handlebars;

    var Template = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
      this.compilerInfo = [4,'>= 1.0.0'];
    helpers = this.merge(helpers, Handlebars.helpers);  


      return "<div class=\"jump-links-container\"></div>\n";
      });
    function containerTpl(data, options, asString) {
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
    /**
     * Creates the JumpLinks plugin.
     * adding jumplinks accessibility feature for quick navigation
     */

    var plugin = pluginFactory({
      name: 'jumplinks',

      /**
       * Initializes the plugin (called during runner's init)
       */
      init: function init() {
        var _this = this;

        var testRunner = this.getTestRunner();
        var item = testRunner.getCurrentItem();
        var config = {
          isReviewPanelEnabled: isReviewPanelEnabled(testRunner),
          questionStatus: helpers.getItemStatus(item)
        };
        var testRunnerOptions = testRunner.getOptions();
        var pluginShortcuts = (testRunnerOptions.shortcuts || {})[this.getName()] || {};
        var areaBroker = this.getAreaBroker();
        var getJumpElement = helpers.getJumpElementFactory(areaBroker);
        var shortcutsConfig = navigator.appVersion.indexOf("Mac") !== -1 ? {
          shortcutsGroups: [{
            id: 'navigation-shortcuts',
            label: __('Navigation shortcuts'),
            shortcuts: [{
              id: 'next',
              shortcut: 'OPTION + Shift + N',
              label: __('Go to the next question')
            }, {
              id: 'previous',
              shortcut: 'OPTION + Shift + P',
              label: __('Go to the previous question')
            }, {
              id: 'current',
              shortcut: 'OPTION + Shift + Q',
              label: __('Go to the current question')
            }, {
              id: 'top',
              shortcut: 'OPTION + Shift + T',
              label: __('Go to the top of the page')
            }]
          }]
        } : {};

        if (testRunnerOptions.allowShortcuts) {
          pluginShortcuts.goToTop && shortcut.add(namespaceHelper.namespaceAll(pluginShortcuts.goToTop, this.getName(), true), function () {
            $$1('[tabindex]').first().focus();
          }, {
            avoidInput: true,
            prevent: true
          });
          pluginShortcuts.goToQuestion && shortcut.add(namespaceHelper.namespaceAll(pluginShortcuts.goToQuestion, this.getName(), true), function () {
            getJumpElement.question.focus();
          }, {
            avoidInput: true,
            prevent: true
          });
        }

        this.jumplinks = jumplinksFactory(config).on('render', function () {
          _this.jumplinks.on('jump', function (jumpTo) {
            var $element = getJumpElement[jumpTo];
            $element.focus();
          });

          _this.jumplinks.on('shortcuts', function () {
            if (_this.shortcuts) {
              return;
            }

            _this.shortcuts = shortcutsFactory(shortcutsConfig);

            _this.shortcuts.render(_this.getAreaBroker().getControlArea());

            _this.shortcuts.on('close', function () {
              _this.shortcuts.destroy();

              _this.shortcuts = null;
            });
          });
        }).on('update', function update(params) {
          this.trigger('changeReviewPanel', params.isReviewPanelEnabled);
          this.trigger('changeQuesitionStatus', params.questionStatus);
        }).on('changeReviewPanel', function changeReviewPanel(enabled) {
          var elem = this.getElement();
          var panelJumplink = elem.find('[data-jump="teststatus"]').parent();

          if (enabled) {
            panelJumplink.removeClass('hidden');
          } else {
            panelJumplink.addClass('hidden');
          }
        }).on('changeQuesitionStatus', function changeQuesitionStatus(questionStatus) {
          var elem = this.getElement();
          var text = "".concat(__('Question'), " - ").concat(questionStatus);
          elem.find('[data-jump="question"] > b').text(text);
        });
        testRunner.on('renderitem', function () {
          var currentItem = testRunner.getCurrentItem();
          var updatedConfig = {
            isReviewPanelEnabled: !helpers.isReviewPanelHidden(testRunner) && isReviewPanelEnabled(testRunner),
            questionStatus: helpers.getItemStatus(currentItem)
          };

          var announcedText = __('Item %s loaded', currentItem.position);

          var $announce = $$1('[aria-live=polite][role=alert]').first();

          if ($announce.length !== 1) {
            $announce = $$1('<div aria-live="polite" role="alert" class="visible-hidden"></div>');
            $$1('main').first().append($announce);
          }

          $announce.text(announcedText);

          _this.jumplinks.trigger('update', updatedConfig);
        }).on('tool-flagitem', function () {
          var currentItem = testRunner.getCurrentItem();
          var questionStatus = helpers.getItemStatus(Object.assign({}, currentItem, {
            flagged: !currentItem.flagged
          }));

          _this.jumplinks.trigger('changeQuesitionStatus', questionStatus);
        }).on('tool-reviewpanel', function () {
          var wasHidden = helpers.isReviewPanelHidden(testRunner);

          _this.jumplinks.trigger('changeReviewPanel', wasHidden);
        }).after('renderitem', function () {
          getJumpElement.question.attr('tabindex', '-1').focus();
        });
      },

      /**
       * Called during the runner's render phase
       */
      render: function render() {
        var jumplinksContainer = $$1(containerTpl());
        $$1('.content-wrap').prepend(jumplinksContainer);
        this.jumplinks.render(jumplinksContainer);
      }
    });

    return plugin;

});
