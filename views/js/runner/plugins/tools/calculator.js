define(['jquery', 'lodash', 'i18n', 'ui/hider', 'ui/calculator', 'ui/maths/calculator/basicCalculator', 'ui/maths/calculator/scientificCalculator', 'util/shortcut', 'util/namespace', 'taoTests/runner/plugin', 'taoQtiTest/runner/helpers/map', 'handlebars'], function ($$1, _, __, hider, calculatorFactory, basicCalculatorFactory, scientificCalculatorFactory, shortcut, namespaceHelper, pluginFactory, mapHelper, Handlebars) { 'use strict';

    $$1 = $$1 && Object.prototype.hasOwnProperty.call($$1, 'default') ? $$1['default'] : $$1;
    _ = _ && Object.prototype.hasOwnProperty.call(_, 'default') ? _['default'] : _;
    __ = __ && Object.prototype.hasOwnProperty.call(__, 'default') ? __['default'] : __;
    calculatorFactory = calculatorFactory && Object.prototype.hasOwnProperty.call(calculatorFactory, 'default') ? calculatorFactory['default'] : calculatorFactory;
    basicCalculatorFactory = basicCalculatorFactory && Object.prototype.hasOwnProperty.call(basicCalculatorFactory, 'default') ? basicCalculatorFactory['default'] : basicCalculatorFactory;
    scientificCalculatorFactory = scientificCalculatorFactory && Object.prototype.hasOwnProperty.call(scientificCalculatorFactory, 'default') ? scientificCalculatorFactory['default'] : scientificCalculatorFactory;
    shortcut = shortcut && Object.prototype.hasOwnProperty.call(shortcut, 'default') ? shortcut['default'] : shortcut;
    namespaceHelper = namespaceHelper && Object.prototype.hasOwnProperty.call(namespaceHelper, 'default') ? namespaceHelper['default'] : namespaceHelper;
    pluginFactory = pluginFactory && Object.prototype.hasOwnProperty.call(pluginFactory, 'default') ? pluginFactory['default'] : pluginFactory;
    mapHelper = mapHelper && Object.prototype.hasOwnProperty.call(mapHelper, 'default') ? mapHelper['default'] : mapHelper;
    Handlebars = Handlebars && Object.prototype.hasOwnProperty.call(Handlebars, 'default') ? Handlebars['default'] : Handlebars;

    var Template = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
      this.compilerInfo = [4,'>= 1.0.0'];
    helpers = this.merge(helpers, Handlebars.helpers);  


      return "<div class=\"widget-calculator\" dir=\"ltr\"></div>";
      });
    function calculatorTpl(data, options, asString) {
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
     * Default config for calculator components
     * @type {Object}
     */

    var defaultCalcConfig = {
      height: 380,
      width: 280,
      top: 50,
      left: 10,
      stackingScope: 'test-runner',
      proportionalResize: true
    };
    /**
     * Default config for BODMAS calculator component
     * @type {Object}
     */

    var bodmasCalcConfig = _.defaults({
      height: 380,
      width: 280
    }, defaultCalcConfig);
    /**
     * Default config for scientific calculator component
     * @type {Object}
     */


    var scientificCalcConfig = _.defaults({
      width: 490,
      height: 420,
      calculator: {
        maths: {
          degree: true
        }
      }
    }, defaultCalcConfig);
    /**
     * Returns the configured plugin
     */


    var calculator = pluginFactory({
      name: 'calculator',

      /**
       * Initialize the plugin (called during runner's init)
       */
      init: function init() {
        var self = this;
        var testRunner = this.getTestRunner();
        var areaBroker = this.getAreaBroker();
        var testRunnerOptions = testRunner.getOptions();
        var config = this.getConfig();
        var pluginShortcuts = (testRunnerOptions.shortcuts || {})[this.getName()] || {};
        /**
         * Retrieve the calculators categories of the current item
         * @returns {Object} the calculator categories
         */

        function getCalculatorCategories() {
          var testContext = testRunner.getTestContext();
          var itemIdentifier = testContext.itemIdentifier;
          var testMap = testRunner.getTestMap();
          return {
            calculator: mapHelper.hasItemCategory(testMap, itemIdentifier, 'calculator', true),
            bodmas: mapHelper.hasItemCategory(testMap, itemIdentifier, 'calculator-bodmas', true),
            scientific: mapHelper.hasItemCategory(testMap, itemIdentifier, 'calculator-scientific', true)
          };
        }
        /**
         * Checks if the plugin is currently available
         * @returns {Boolean}
         */


        function isEnabled() {
          //to be activated with a special category from:
          // - x-tao-option-calculator
          // - x-tao-option-calculator-bodmas
          // - x-tao-option-calculator-scientific
          var categories = getCalculatorCategories();
          return categories.calculator || categories.bodmas || categories.scientific;
        }
        /**
         * Is calculator activated ? if not, then we hide the plugin
         */


        function togglePlugin() {
          if (isEnabled()) {
            //allow calculator
            self.show();
          } else {
            self.hide();
          }
        }
        /**
         * Build the calculator component
         * @param {Function} [calcTpl] - An optional alternative template for the calculator.
         *                               Only compatible with the four-functions version
         */


        function buildCalculator(calcTpl) {
          var categories = getCalculatorCategories();
          var factory, calcConfig;

          if (categories.scientific) {
            factory = scientificCalculatorFactory;
            calcConfig = scientificCalcConfig;
            calcConfig.calculator.maths.degree = _.isUndefined(config.degree) ? scientificCalcConfig.calculator.maths.degree : config.degree;
          } else if (categories.bodmas) {
            factory = basicCalculatorFactory;
            calcConfig = bodmasCalcConfig;
          } else {
            factory = calculatorFactory;
            calcConfig = defaultCalcConfig;
          }

          self.calculator = factory(_.defaults({
            renderTo: self.$calculatorContainer,
            replace: true,
            draggableContainer: areaBroker.getContainer(),
            alternativeTemplate: calcTpl || null
          }, calcConfig)).on('show', function () {
            self.trigger('open');
            self.button.turnOn();
          }).on('hide', function () {
            self.trigger('close');
            self.button.turnOff();
          }).after('render', function () {
            this.show();
          });
        }
        /**
         * Show/hide the calculator
         */


        function toggleCalculator() {
          if (self.getState('enabled') !== false) {
            if (self.calculator) {
              //just show/hide the calculator widget
              if (self.calculator.is('hidden')) {
                self.calculator.show();
              } else {
                self.calculator.hide();
              }
            } else {
              //build calculator widget
              if (config.template) {
                require(["tpl!".concat(config.template.replace(/\.tpl$/, ''))], function (calcTpl) {
                  buildCalculator(calcTpl);
                }, function () {
                  //in case of error, display the default calculator:
                  buildCalculator();
                });
              } else {
                buildCalculator();
              }
            }
          }
        } //build element (detached)


        this.button = this.getAreaBroker().getToolbox().createEntry({
          control: 'calculator',
          title: __('Open Calculator'),
          icon: 'table',
          text: __('Calculator')
        });
        this.$calculatorContainer = $$1(calculatorTpl()); //init calculator instance var, it will be created only necessary

        this.calculator = null; //attach behavior

        this.button.on('click', function (e) {
          //prevent action if the click is made inside the form which is a sub part of the button
          if ($$1(e.target).closest('.widget-calculator').length) {
            return;
          }

          e.preventDefault();
          testRunner.trigger('tool-calculator');
        });

        if (testRunnerOptions.allowShortcuts) {
          if (pluginShortcuts.toggle) {
            shortcut.add(namespaceHelper.namespaceAll(pluginShortcuts.toggle, this.getName(), true), function () {
              testRunner.trigger('tool-calculator');
            }, {
              avoidInput: true,
              allowIn: '.widget-calculator'
            });
          }
        } //start disabled


        togglePlugin();
        this.disable(); //update plugin state based on changes

        testRunner.on('loaditem', togglePlugin).on('enabletools renderitem', function () {
          self.enable();
        }).on('disabletools unloaditem', function () {
          self.disable();

          if (self.calculator) {
            //destroy calculator to create a new instance of calculator each time
            self.calculator.destroy();
            self.calculator = null;
          }
        }).on('tool-calculator', function () {
          if (isEnabled()) {
            toggleCalculator();
          }
        });
      },

      /**
       * Called during the runner's render phase
       */
      render: function render() {
        var areaBroker = this.getAreaBroker();
        areaBroker.getContainer().append(this.$calculatorContainer);
      },

      /**
       * Called during the runner's destroy phase
       */
      destroy: function destroy() {
        shortcut.remove(".".concat(this.getName()));
        this.$calculatorContainer.remove();

        if (this.calculator) {
          this.calculator.destroy();
        }
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

        if (this.calculator) {
          this.calculator.hide();
        }
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

        if (this.calculator) {
          this.calculator.hide();
        }
      }
    });

    return calculator;

});
