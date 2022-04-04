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
     * (Pre)load audio content.
     *
     * @author Bertrand Chevrier <bertrand@taotesting.com>
     */

    var audio = {
      /**
       * The name of the preloader
       * @type {string}
       */
      name: 'audio',

      /**
       * Manages the preloading of audio files
       * @param assetManager - A reference to the assetManager
       * @returns {assetPreloader}
       */
      init: function init(assetManager) {
        //keep references to preloaded audio blobs
        var audioBlobs = {}; //prepend a strategy to resolves cached assets

        assetManager.prependStrategy({
          name: 'precaching-audio',
          handle: function handle(url, data) {
            var sourceUrl = url.toString(); //resolves precached audio files

            if (data.itemIdentifier && audioBlobs[data.itemIdentifier] && 'undefined' !== typeof audioBlobs[data.itemIdentifier][sourceUrl]) {
              //creates an internal URL to link the audio blob
              return URL.createObjectURL(audioBlobs[data.itemIdentifier][sourceUrl]);
            }
          }
        });
        return {
          /**
           * Tells whether an audio file was preloaded or not
           * @param {string} url - the url of the  audio file to preload
           * @param {string} sourceUrl - the unresolved URL (used to index)
           * @param {string} itemIdentifier - the id of the item the asset belongs to
           * @returns {boolean}
           */
          loaded: function loaded(url, sourceUrl, itemIdentifier) {
            return !!(audioBlobs[itemIdentifier] && audioBlobs[itemIdentifier][sourceUrl]);
          },

          /**
           * Preloads audio files : save the blobs for later use in the asset manager
           * @param {string} url - the url of the audio file to preload
           * @param {string} sourceUrl - the unresolved URL (used to index)
           * @param {string} itemIdentifier - the id of the item the asset belongs to
           * @returns {Promise}
           */
          load: function load(url, sourceUrl, itemIdentifier) {
            return new Promise(function (resolve) {
              audioBlobs[itemIdentifier] = audioBlobs[itemIdentifier] || {};

              if ('undefined' === typeof audioBlobs[itemIdentifier][sourceUrl]) {
                //direct XHR to benefit from the "blob" response type
                var request = new XMLHttpRequest();
                request.open('GET', url, true);
                request.responseType = 'blob';
                request.onerror = resolve;
                request.onabort = resolve;

                request.onload = function () {
                  if (request.status === 200) {
                    //save the blob, directly
                    audioBlobs[itemIdentifier][sourceUrl] = request.response;
                  }

                  resolve();
                }; //ignore failed requests, best effort only


                request.send();
              } else {
                resolve();
              }
            });
          },

          /**
           * Removes loaded audio files
           * @param {string} url - the url of the audio file to unload
           * @param {string} sourceUrl - the unresolved URL
           * @param {string} itemIdentifier - the id of the item the asset belongs to
           * @returns {Promise}
           */
          unload: function unload(url, sourceUrl, itemIdentifier) {
            if (audioBlobs[itemIdentifier]) {
              audioBlobs[itemIdentifier] = _.omit(audioBlobs[itemIdentifier], sourceUrl);
            }

            return Promise.resolve();
          }
        };
      }
    };

    return audio;

});
