define(['lodash'], function (_) { 'use strict';

    _ = _ && Object.prototype.hasOwnProperty.call(_, 'default') ? _['default'] : _;

    /*
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
     * Copyright (c) 2017-2021 Open Assessment Technologies SA
     */
    /**
     * Test the support of possible `<link rel>` values.
     * @param {string} feature - the value to test
     * @returns {boolean}
     * @private
     */

    var relSupport = function relSupport(feature) {
      var fakeLink = document.createElement('link');

      try {
        if (fakeLink.relList && 'function' === typeof fakeLink.relList.supports) {
          return fakeLink.relList.supports(feature);
        }
      } catch (err) {
        return false;
      }
    };
    /**
     * Does the current env supports `<link ref="preload">`
     * @type {boolean}
     * @private
     */


    var supportPreload = relSupport('preload');
    /**
     * Does the current env supports `<link ref="prefetch">`
     * @type {boolean}
     * @private
     */

    var supportPrefetch = relSupport('prefetch');
    /**
     * (Pre)load stylesheets.
     *
     * @author Bertrand Chevrier <bertrand@taotesting.com>
     */

    var stylesheet = {
      /**
       * The name of the preloader
       * @type {string}
       */
      name: 'css',

      /**
       * Manages the preloading of stylesheets
       * @returns {assetPreloader}
       */
      init: function init() {
        //keep references to preloaded CSS files
        var stylesheets = {};
        return {
          /**
           * Tells whether a stylesheet was preloaded or not
           * @param {string} url - the url of the stylesheet to preload
           * @param {string} sourceUrl - the unresolved URL (used to index)
           * @param {string} itemIdentifier - the id of the item the asset belongs to
           * @returns {boolean}
           */
          loaded: function loaded(url, sourceUrl, itemIdentifier) {
            return !!(stylesheets[itemIdentifier] && stylesheets[itemIdentifier][sourceUrl]);
          },

          /**
           * Preloads a stylesheet
           * @param {string} url - the url of the stylesheet to preload
           * @param {string} sourceUrl - the unresolved URL (used to index)
           * @param {string} itemIdentifier - the id of the item the asset belongs to
           * @returns {Promise}
           */
          load: function load(url, sourceUrl, itemIdentifier) {
            stylesheets[itemIdentifier] = stylesheets[itemIdentifier] || {};

            if (!stylesheets[itemIdentifier][sourceUrl]) {
              var link = document.createElement('link');

              if (supportPreload) {
                link.setAttribute('rel', 'preload');
                link.setAttribute('as', 'style');
              } else if (supportPrefetch) {
                link.setAttribute('rel', 'prefetch');
                link.setAttribute('as', 'style');
              } else {
                link.disabled = true;
                link.setAttribute('rel', 'stylesheet');
                link.setAttribute('type', 'text/css');
              }

              link.setAttribute('data-preload', true);
              link.setAttribute('href', url);
              document.querySelector('head').appendChild(link);
              stylesheets[itemIdentifier][sourceUrl] = link;
            }

            return Promise.resolve();
          },

          /**
           * Removes the prefetched stylesheet
           * @param {string} url - the url of the stylesheet to unload
           * * @param {string} sourceUrl - the unresolved URL (used to index)
           * @param {string} itemIdentifier - the id of the item the asset belongs to
           * @returns {Promise}
           */
          unload: function unload(url, sourceUrl, itemIdentifier) {
            if (stylesheets[itemIdentifier]) {
              var link = stylesheets[itemIdentifier][sourceUrl] || document.querySelector("head link[data-preload][href=\"".concat(url, "\"]"));

              if (link) {
                document.querySelector('head').removeChild(link);
              }

              stylesheets[itemIdentifier] = _.omit(stylesheets[itemIdentifier], sourceUrl);
            }

            return Promise.resolve();
          }
        };
      }
    };

    return stylesheet;

});
