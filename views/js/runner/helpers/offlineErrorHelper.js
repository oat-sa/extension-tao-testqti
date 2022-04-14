define(['lodash', 'i18n'], function (_, __) { 'use strict';

    _ = _ && Object.prototype.hasOwnProperty.call(_, 'default') ? _['default'] : _;
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
     * Copyright (c) 2019 (original work) Open Assessment Technologies SA ;
     */
    /**
     * @typedef {Object} OfflineErrorObject
     * @property {string} message
     * @property {Object} data
     * @property {boolean} data.success
     * @property {string} data.source
     * @property {string} data.purpose
     * @property {string} data.type
     * @property {number} data.code
     */

    var offlineErrorHelper = {
      /**
       * Builds a new Error object from the given context and returns it
       * @param {Object} errorData
       * @param {Object} [context]
       * @returns {Object}
       */
      buildErrorFromContext: function buildErrorFromContext(errorData, context) {
        var err = _.assign(new Error(errorData.message), errorData.data);

        return _.assign(err, context || {});
      },

      /**
       * Returns an object which contains the required data to compose an OfflineNavigationError.
       * This error get triggered in case when the test taker is unable to navigate offline.
       *
       * @returns {OfflineErrorObject}
       */
      getOfflineNavError: function getOfflineNavError() {
        return {
          message: __('We are unable to connect to the server to retrieve the next item.'),
          data: {
            success: false,
            source: 'navigator',
            purpose: 'proxy',
            type: 'nav',
            code: 404
          }
        };
      },

      /**
       * Returns an object which contains the required data to compose an OfflineExitError.
       * This error get triggered in case when the test taker is unable to exit the test offline.
       *
       * @returns {OfflineErrorObject}
       */
      getOfflineExitError: function getOfflineExitError() {
        return {
          message: __('We are unable to connect the server to submit your results.'),
          data: {
            success: false,
            source: 'navigator',
            purpose: 'proxy',
            type: 'finish',
            code: 404
          }
        };
      },

      /**
       * Returns an object which contains the required data to compose an OfflinePauseError.
       * This error get triggered in case when the test get paused in offline mode.
       *
       * @returns {OfflineErrorObject}
       */
      getOfflinePauseError: function getOfflinePauseError() {
        return {
          message: __('The test has been paused, we are unable to connect to the server.'),
          data: {
            success: false,
            source: 'navigator',
            purpose: 'proxy',
            type: 'pause',
            code: 404
          }
        };
      }
    };

    return offlineErrorHelper;

});
