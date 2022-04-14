define(['lodash', 'i18n', 'ui/hider', 'util/shortcut', 'util/namespace', 'taoTests/runner/plugin', 'taoQtiTest/runner/helpers/map', 'ui/keyNavigation/navigator', 'ui/keyNavigation/navigableDomElement', 'taoQtiTest/runner/plugins/tools/apipTextToSpeech/textToSpeech', 'taoQtiTest/runner/plugins/tools/apipTextToSpeech/ttsApipDataProvider'], function (_, __, hider, shortcut, namespaceHelper, pluginFactory, mapHelper, keyNavigator, navigableDomElement, ttsComponentFactory, ttsApipDataProvider) { 'use strict';

    _ = _ && Object.prototype.hasOwnProperty.call(_, 'default') ? _['default'] : _;
    __ = __ && Object.prototype.hasOwnProperty.call(__, 'default') ? __['default'] : __;
    shortcut = shortcut && Object.prototype.hasOwnProperty.call(shortcut, 'default') ? shortcut['default'] : shortcut;
    namespaceHelper = namespaceHelper && Object.prototype.hasOwnProperty.call(namespaceHelper, 'default') ? namespaceHelper['default'] : namespaceHelper;
    pluginFactory = pluginFactory && Object.prototype.hasOwnProperty.call(pluginFactory, 'default') ? pluginFactory['default'] : pluginFactory;
    mapHelper = mapHelper && Object.prototype.hasOwnProperty.call(mapHelper, 'default') ? mapHelper['default'] : mapHelper;
    keyNavigator = keyNavigator && Object.prototype.hasOwnProperty.call(keyNavigator, 'default') ? keyNavigator['default'] : keyNavigator;
    navigableDomElement = navigableDomElement && Object.prototype.hasOwnProperty.call(navigableDomElement, 'default') ? navigableDomElement['default'] : navigableDomElement;
    ttsComponentFactory = ttsComponentFactory && Object.prototype.hasOwnProperty.call(ttsComponentFactory, 'default') ? ttsComponentFactory['default'] : ttsComponentFactory;
    ttsApipDataProvider = ttsApipDataProvider && Object.prototype.hasOwnProperty.call(ttsApipDataProvider, 'default') ? ttsApipDataProvider['default'] : ttsApipDataProvider;

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
     * Copyright (c) 2016-2019  (original work) Open Assessment Technologies SA;
     *
     * @author Anton Tsymuk <anton@taotesting.com>
     */
    var pluginName = 'apiptts';
    var actionPrefix = "tool-".concat(pluginName, "-");
    /**
     * Returns the configured plugin
     */

    var plugin = pluginFactory({
      name: pluginName,

      /**
       * Initialize the plugin (called during runner's init)
       */
      init: function init() {
        var _this = this;

        var testRunner = this.getTestRunner();
        var testRunnerOptions = testRunner.getOptions();
        var pluginShortcuts = (testRunnerOptions.shortcuts || {})[this.getName()] || {};
        var ttsComponent;
        var ttsApipData;

        var createNavigationGroup = function createNavigationGroup() {
          var $container = testRunner.getAreaBroker().getContainer();

          var $navigationGroupElement = _this.button.getElement();

          var groupNavigationId = "".concat(pluginName, "_navigation_group");
          var $navigationElements = $container.find(ttsApipData.map(function (_ref) {
            var selector = _ref.selector;
            return selector;
          }).join(', '));
          _this.navigationGroup = keyNavigator({
            id: groupNavigationId,
            group: $navigationGroupElement,
            elements: navigableDomElement.createFromDoms($navigationElements.add($navigationGroupElement)),
            propagateTab: false,
            loop: true,
            keepState: true
          }).on('tab', function () {
            if (ttsComponent.is('sfhMode')) {
              _this.navigationGroup.next();

              testRunner.trigger("".concat(actionPrefix, "next"));
            }
          }).on('shift+tab', function () {
            if (ttsComponent.is('sfhMode')) {
              _this.navigationGroup.previous();

              testRunner.trigger("".concat(actionPrefix, "previous"));
            }
          }).on('activate', function () {
            if (ttsComponent.is('sfhMode')) {
              testRunner.trigger("".concat(actionPrefix, "togglePlayback"));
            }
          }).on('blur', function () {
            setTimeout(function () {
              if (!_this.navigationGroup.isFocused()) {
                _this.navigationGroup.focus();
              }
            }, 0);
          }).setCursorAt($navigationElements.length);
          ttsComponent.on('next finish', function () {
            if (ttsComponent.is('sfhMode')) {
              var $currentElement = _this.navigationGroup.getCursor().navigable.getElement();

              var _ref2 = ttsComponent.getCurrentItem() || {},
                  selector = _ref2.selector;

              if (!selector || !$currentElement.is(selector)) {
                _this.navigationGroup.next();
              }
            }
          });
        };
        /**
         * Creates the tts component on demand
         * @returns {textToSpeech}
         */


        var getTTSComponent = function getTTSComponent() {
          if (!ttsComponent) {
            var $container = testRunner.getAreaBroker().getContainer();
            ttsComponent = ttsComponentFactory($container, {}).on('close', function () {
              if (_this.getState('active')) {
                testRunner.trigger("".concat(actionPrefix, "toggle"));
              }
            }).hide();
          }

          return ttsComponent;
        };
        /**
         * Checks if the plugin is currently available.
         * To be activated with the special category x-tao-option-apiptts
         *
         * @returns {Boolean}
         */


        var isConfigured = function isConfigured() {
          return mapHelper.hasItemCategory(testRunner.getTestMap(), testRunner.getTestContext().itemIdentifier, 'apiptts', true);
        };
        /**
         * Is plugin activated ? if not, then we hide the plugin
         */


        var togglePlugin = function togglePlugin() {
          if (isConfigured()) {
            _this.show();
          } else {
            _this.hide();
          }
        };
        /**
         * Show the plugin panel
         *
         * @fires plugin-open.apiptts
         */


        var enablePlugin = function enablePlugin() {
          createNavigationGroup();

          _this.button.turnOn();

          _this.setState('active', true);

          _this.trigger('open');

          if (ttsComponent.is('hidden')) {
            ttsComponent.show();
          }
        };
        /**
         * Hide the plugin panel
         *
         * @fires plugin-close.apiptts
         */


        var disablePlugin = function disablePlugin() {
          if (_this.getState('active')) {
            _this.navigationGroup.blur();

            _this.navigationGroup.destroy();

            _this.setState('active', false);

            _this.button.turnOff();

            _this.trigger('close');

            if (ttsComponent && !ttsComponent.is('hidden')) {
              ttsComponent.close();
              ttsComponent.hide();
            }
          }
        };
        /**
         * Shows/hides the plugin
         */


        var toggleTool = function toggleTool() {
          if (_this.getState('enabled')) {
            if (_this.getState('active')) {
              disablePlugin();

              _this.setState('sleep', true);
            } else {
              enablePlugin();

              _this.setState('sleep', false);
            }
          }
        }; // Add plugin button to toolbox


        this.button = this.getAreaBroker().getToolbox().createEntry({
          className: "".concat(this.getName(), "-plugin"),
          control: this.getName(),
          icon: 'headphones',
          text: __('Text To Speech'),
          title: __('Enable text to speech')
        }); // Handle plugin button click

        this.button.on('click', function (e) {
          e.preventDefault();
          testRunner.trigger("".concat(actionPrefix, "toggle"));
        }); // Register plugin shortcuts

        if (testRunnerOptions.allowShortcuts) {
          _.forEach(pluginShortcuts, function (command, key) {
            shortcut.add(namespaceHelper.namespaceAll(command, pluginName, true), function () {
              if (key === 'spaceTogglePlayback' && ttsComponent && ttsComponent.is('sfhMode')) {
                return;
              }

              var eventKey = key.endsWith('TogglePlayback') ? 'togglePlayback' : key;
              testRunner.trigger(actionPrefix + eventKey);
            }, {
              avoidInput: true
            });
          });
        } // Hide plugin by default


        togglePlugin();
        this.disable();
        this.hide(); //update plugin state based on changes

        testRunner.on('loaditem', function () {
          togglePlugin();

          _this.disable();
        }).on('enabletools renderitem', function () {
          _this.enable();
        }).on('disabletools unloaditem', function () {
          disablePlugin();

          _this.disable();
        }).on("".concat(actionPrefix, "toggle"), function () {
          if (isConfigured()) {
            toggleTool();
          }
        }).on("".concat(actionPrefix, "togglePlayback"), function () {
          if (_this.getState('enabled')) {
            if (_this.getState('active')) {
              if (ttsComponent.is('sfhMode')) {
                var $currentElement = _this.navigationGroup.getCursor().navigable.getElement();

                var _ref3 = ttsComponent.getCurrentItem() || {},
                    selector = _ref3.selector;

                if (!$currentElement.is(selector)) {
                  if (_this.button.getElement()[0] !== $currentElement[0]) {
                    $currentElement.trigger('click');
                  }

                  return;
                }
              }

              ttsComponent.togglePlayback();
            }
          }
        }).on('renderitem', function () {
          if (!isConfigured()) {
            return;
          }

          ttsApipData = ttsApipDataProvider(testRunner.itemRunner.getData().apipAccessibility || {}).map(function (apipItemData) {
            return Object.assign({}, apipItemData, {
              url: testRunner.itemRunner.assetManager.resolve(apipItemData.url)
            });
          });

          if (!ttsApipData.length) {
            disablePlugin();

            _this.hide();

            return;
          }

          getTTSComponent().setMediaContentData(ttsApipData);

          _this.show();

          if (!_this.getState('sleep')) {
            _this.setState('enabled', true);

            toggleTool();
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
        this.button.disable();
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
        this.button.hide();
      }
    });

    return plugin;

});
