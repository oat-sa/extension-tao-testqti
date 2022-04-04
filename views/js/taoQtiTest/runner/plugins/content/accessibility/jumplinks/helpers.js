define(['exports', 'i18n'], function (exports, __) { 'use strict';

    __ = __ && Object.prototype.hasOwnProperty.call(__, 'default') ? __['default'] : __;

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
     * Returns factory-like object.
     *
     * @param {AreaBroker} broker
     *
     * @returns {Object} - when you access properties it returns the corresponding element and move the focus on it.
     *  List of availiable properties
     *      - question
     *      - navigation
     *      - toolbox
     *      - teststatus
     */

    var getJumpElementFactory = function getJumpElementFactory(broker) {
      return {
        get container() {
          return broker.getContainer();
        },

        get question() {
          return broker.getContainer().find('.content-wrapper').first();
        },

        get navigation() {
          return broker.getNavigationArea().find(':not(.hidden)[tabindex]').first();
        },

        get toolbox() {
          return broker.getToolboxArea().find(':not(.hidden)[tabindex]').first();
        },

        get teststatus() {
          return broker.getPanelArea().find(':not(.hidden)[tabindex]').first();
        }

      };
    };
    /**
     * Returns testrunner item status.
     *
     * @param {Object} item - testrunner item
     *
     * @returns {String} - localized string.
     */

    var getItemStatus = function getItemStatus(item) {
      if (item.flagged) {
        return __('Flagged for review');
      }

      if (item.answered) {
        return __('Answered');
      }

      if (item.viewed) {
        return __('Not answered');
      }

      return __('Not seen');
    };
    /**
     * Detects if review panel hidden or not.
     *
     * @param {TestRunner} testRunner
     *
     * @returns {Boolean}
     */

    var isReviewPanelHidden = function isReviewPanelHidden(testRunner) {
      return testRunner.getAreaBroker().getPanelArea().find('.qti-navigator').is('.hidden');
    };

    exports.getItemStatus = getItemStatus;
    exports.getJumpElementFactory = getJumpElementFactory;
    exports.isReviewPanelHidden = isReviewPanelHidden;

    Object.defineProperty(exports, '__esModule', { value: true });

});
