define(['lodash', 'jquery', 'core/statifier', 'ui/component', 'handlebars'], function (_, $$1, statifier, componentFactory, Handlebars) { 'use strict';

    _ = _ && Object.prototype.hasOwnProperty.call(_, 'default') ? _['default'] : _;
    $$1 = $$1 && Object.prototype.hasOwnProperty.call($$1, 'default') ? $$1['default'] : $$1;
    statifier = statifier && Object.prototype.hasOwnProperty.call(statifier, 'default') ? statifier['default'] : statifier;
    componentFactory = componentFactory && Object.prototype.hasOwnProperty.call(componentFactory, 'default') ? componentFactory['default'] : componentFactory;
    Handlebars = Handlebars && Object.prototype.hasOwnProperty.call(Handlebars, 'default') ? Handlebars['default'] : Handlebars;

    var Template = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
      this.compilerInfo = [4,'>= 1.0.0'];
    helpers = this.merge(helpers, Handlebars.helpers);  


      return "<div class=\"answer-mask\">\n    <span class=\"answer-mask-toggle\"></span>\n</div>";
      });
    function maskTpl(data, options, asString) {
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
     * Copyright (c) 2017 (original work) Open Assessment Technologies SA;
     */
    var ns = '.answerMasking';
    /**
     * @param {jQuery} $contentArea - DOM element containing the rendered item
     */

    function answerMaskingFactory($contentArea) {
      var answerMasking,
          allMasks = [],
          maskApi = {
        /**
         * Toggle mask visibility
         * @returns {component}
         */
        toggle: function toggle() {
          if (this.is('masked')) {
            return this.reveal();
          } else {
            return this.mask();
          }
        },

        /**
         * Show the choice under the current mask
         * @returns {component}
         */
        reveal: function reveal() {
          var $container = this.getContainer();
          $container.removeClass('masked');
          $container.find('input').removeAttr('disabled');
          this.setState('masked', false);
          return this;
        },

        /**
         * Cover the whole choice with the mask
         * @returns {component}
         */
        mask: function mask() {
          var $container = this.getContainer();
          $container.addClass('masked');
          $container.find('input').attr('disabled', 'disabled');
          this.setState('masked', true);
          return this;
        }
      };
      /**
       * Creates a ui/component to serve as a mask over a QTI Choice
       * @param {jQuery} $container - the qti-choice element
       * @returns {component}
       */

      function createMask($container) {
        return componentFactory(maskApi).setTemplate(maskTpl).on('render', function () {
          var self = this,
              $component = this.getElement();
          $component.on("click".concat(ns), function (e) {
            e.stopPropagation();
            e.preventDefault();
            self.toggle();
          });
        }).on('destroy', function () {
          var $component = this.getElement();
          $component.off(ns);
        }).init().render($container).mask();
      }
      /**
       * The answer masking helper
       */


      answerMasking = {
        /**
         * Enable the answer masking functionality by creating masks over the Qti Choices
         */
        enable: function enable() {
          var $choiceInteractions = $contentArea.find('.qti-choiceInteraction'),
              $qtiChoices = $contentArea.find('.qti-choice');
          allMasks = [];
          $choiceInteractions.addClass('maskable');
          $qtiChoices.each(function () {
            var $choice = $$1(this);
            allMasks.push(createMask($choice));
          });
          this.setState('enabled', true);
        },

        /**
         * Remove any answerMasking-related markup from the rendered item
         */
        disable: function disable() {
          var $choiceInteractions = $contentArea.find('.qti-choiceInteraction');
          $choiceInteractions.removeClass('maskable');
          allMasks.forEach(function (mask) {
            mask.reveal(); // remove class on container

            mask.destroy();
          });
          allMasks = [];
          this.setState('enabled', false);
        },

        /**
         * Return the current state of the masks
         * @returns {Boolean[]} - true if the choice is masked, false if the choice is revealed
         */
        getMasksState: function getMasksState() {
          var state = allMasks.map(function (mask) {
            return mask.is('masked');
          });
          return state;
        },

        /**
         * Restore a previously saved state for the masked choices
         * @param {Boolean[]} state - array of boolean, most probably given by the getMasksState method
         */
        setMasksState: function setMasksState(state) {
          state = state || [];
          state.forEach(function (masked, index) {
            var mask = allMasks[index];

            if (_.isObject(mask) && _.isFunction(mask.reveal) && !masked) {
              mask.reveal();
            }
          });
        }
      };
      statifier(answerMasking);
      return answerMasking;
    }

    return answerMaskingFactory;

});
