define(['core/providerRegistry'], function (providerRegistry) { 'use strict';

    providerRegistry = providerRegistry && Object.prototype.hasOwnProperty.call(providerRegistry, 'default') ? providerRegistry['default'] : providerRegistry;

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
     * Copyright (c) 2021 Open Assessment Technologies SA
     */
    /**
     * @typedef {object} preloaderManager
     * @property {Function} has - Tells whether an asset is loaded or not
     * @property {preloaderManagerAction} loaded - Tells whether an asset is loaded or not
     * @property {preloaderManagerAction} load - Preload an asset
     * @property {preloaderManagerAction} unload - Unload an asset
     */

    /**
     * @callback preloaderManagerAction
     * @param {string} name - The type of asset to preload
     * @param {...any} args - The list of args related to the preloader.
     * @returns {any}
     */

    /**
     * Creates a preloader manager.
     * @return {Function}
     */

    function preloaderManagerFactory() {
      /**
       * Manages the preloading of assets
       * @param assetManager - A reference to the assetManager
       * @return {preloaderManager}
       */
      function preloaderFactory(assetManager) {
        var preloaders = {};
        preloaderFactory.getAvailableProviders().forEach(function (name) {
          preloaders[name] = preloaderFactory.getProvider(name).init(assetManager);
        });
        /**
         * @typedef preloaderManager
         */

        return {
          /**
           * Checks whether or not an asset preloader exists for a particular type
           * @param {string} name
           * @returns {boolean}
           */
          has: function has(name) {
            return !!preloaders[name];
          },

          /**
           * Tells whether an asset was preloaded or not
           * @param {string} name - The type of asset to preload
           * @param {...any} args - The list of args related to the preloader.
           * @returns {boolean}
           */
          loaded: function loaded(name) {
            var preloader = preloaders[name];

            if (preloader && 'function' === typeof preloader.loaded) {
              for (var _len = arguments.length, args = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
                args[_key - 1] = arguments[_key];
              }

              return !!preloader.loaded.apply(preloader, args);
            }

            return false;
          },

          /**
           * Preloads an asset with respect to it type
           * @param {string} name - The type of asset to preload
           * @param {...any} args - The list of args related to the preloader.
           * @returns {Promise}
           */
          load: function load(name) {
            var preloader = preloaders[name];

            if (preloader && 'function' === typeof preloader.load) {
              for (var _len2 = arguments.length, args = new Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
                args[_key2 - 1] = arguments[_key2];
              }

              return Promise.resolve(preloader.load.apply(preloader, args));
            }

            return Promise.resolve();
          },

          /**
           * Unloads an asset with respect to it type
           * @param {string} name - The type of asset to unload
           * @param {...any} args - The list of args related to the preloader.
           * @returns {Promise}
           */
          unload: function unload(name) {
            var preloader = preloaders[name];

            if (preloader && 'function' === typeof preloader.unload) {
              for (var _len3 = arguments.length, args = new Array(_len3 > 1 ? _len3 - 1 : 0), _key3 = 1; _key3 < _len3; _key3++) {
                args[_key3 - 1] = arguments[_key3];
              }

              return Promise.resolve(preloader.unload.apply(preloader, args));
            }

            return Promise.resolve();
          }
        };
      }

      return providerRegistry(preloaderFactory);
    }

    return preloaderManagerFactory;

});
