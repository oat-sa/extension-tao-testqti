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
     * (Pre)load images.
     *
     * @author Bertrand Chevrier <bertrand@taotesting.com>
     */

    var image = {
      /**
       * The name of the preloader
       * @type {string}
       */
      name: 'img',

      /**
       * Manages the preloading of images
       * @returns {assetPreloader}
       */
      init: function init() {
        //keep references to preloaded images attached
        //in order to prevent garbage collection of cached images
        var images = {};
        return {
          /**
           * Tells whether an image was preloaded or not
           * @param {string} url - the url of the image to preload
           * @param {string} sourceUrl - the unresolved URL (used to index)
           * @param {string} itemIdentifier - the id of the item the asset belongs to
           * @returns {boolean}
           */
          loaded: function loaded(url, sourceUrl, itemIdentifier) {
            return !!(images[itemIdentifier] && images[itemIdentifier][sourceUrl]);
          },

          /**
           * Preloads an image, using the in memory Image object
           * @param {string} url - the url of the image to preload
           * @param {string} sourceUrl - the unresolved URL (used to index)
           * @param {string} itemIdentifier - the id of the item the asset belongs to
           * @returns {Promise}
           */
          load: function load(url, sourceUrl, itemIdentifier) {
            images[itemIdentifier] = images[itemIdentifier] || {};

            if ('Image' in window && !images[itemIdentifier][sourceUrl]) {
              images[itemIdentifier][sourceUrl] = new Image();
              images[itemIdentifier][sourceUrl].src = url;
            }

            return Promise.resolve();
          },

          /**
           * Removes images ref so they can be garbage collected
           * @param {string} url - the url of the image to unload
           * @param {string} sourceUrl - the unresolved URL (used to index)
           * @param {string} itemIdentifier - the id of the item the asset belongs to
           * @returns {Promise}
           */
          unload: function unload(url, sourceUrl, itemIdentifier) {
            if (images[itemIdentifier]) {
              images[itemIdentifier] = _.omit(images[itemIdentifier], sourceUrl);
            }

            return Promise.resolve();
          }
        };
      }
    };

    return image;

});
