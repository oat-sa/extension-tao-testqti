define(['lodash', 'core/logger', 'taoQtiItem/runner/qtiItemRunner', 'taoQtiTest/runner/config/assetManager', 'taoQtiTest/runner/proxy/cache/assetPreloader', 'taoQtiTest/runner/proxy/cache/interactionPreloader', 'util/url'], function (_, loggerFactory, qtiItemRunner, getAssetManager, assetPreloaderFactory, interactionPreloaderFactory, urlUtil) { 'use strict';

    _ = _ && Object.prototype.hasOwnProperty.call(_, 'default') ? _['default'] : _;
    loggerFactory = loggerFactory && Object.prototype.hasOwnProperty.call(loggerFactory, 'default') ? loggerFactory['default'] : loggerFactory;
    qtiItemRunner = qtiItemRunner && Object.prototype.hasOwnProperty.call(qtiItemRunner, 'default') ? qtiItemRunner['default'] : qtiItemRunner;
    getAssetManager = getAssetManager && Object.prototype.hasOwnProperty.call(getAssetManager, 'default') ? getAssetManager['default'] : getAssetManager;
    assetPreloaderFactory = assetPreloaderFactory && Object.prototype.hasOwnProperty.call(assetPreloaderFactory, 'default') ? assetPreloaderFactory['default'] : assetPreloaderFactory;
    interactionPreloaderFactory = interactionPreloaderFactory && Object.prototype.hasOwnProperty.call(interactionPreloaderFactory, 'default') ? interactionPreloaderFactory['default'] : interactionPreloaderFactory;
    urlUtil = urlUtil && Object.prototype.hasOwnProperty.call(urlUtil, 'default') ? urlUtil['default'] : urlUtil;

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
     * @type {logger}
     * @private
     */

    var logger = loggerFactory('taoQtiTest/runner/proxy/cache/itemPreloader');
    /**
     * Check if the given item object matches the expectations
     * @param {object} item
     * @param {string} item.itemIdentifier - the item identifier
     * @param {string} item.baseUrl - item baseUrl
     * @param {object} item.itemData.assets - assets per types :  img : ['url1', 'url2' ]
     * @returns {boolean}
     * @private
     */

    var isItemObjectValid = function isItemObjectValid(item) {
      return _.isPlainObject(item) && _.isString(item.baseUrl) && _.isString(item.itemIdentifier) && !_.isEmpty(item.itemIdentifier) && _.isPlainObject(item.itemData);
    };
    /**
     * Sets a flag onto an item
     * @param {object} item - The item to flag
     * @param {string} flag - The flag name to set
     */


    var setItemFlag = function setItemFlag(item, flag) {
      item.flags = item.flags || {};
      item.flags[flag] = true;
    };
    /**
     * Extracts the list of interactions from the item
     * @param {object} itemData
     * @returns {object[]}
     */


    var getItemInteractions = function getItemInteractions(itemData) {
      var interactions = [];

      if (itemData.data && itemData.data.body && itemData.data.body.elements) {
        _.forEach(itemData.data.body.elements, function (elements) {
          return interactions.push(elements);
        });
      }

      return interactions;
    };
    /**
     * Create an instance of an item preloader
     * @param {object} options
     * @param {string} options.testId - the unique identifier of the test instance, required to get the asset manager
     * @returns {itemPreloader}
     * @throws {TypeError} if the testId is not defined
     */


    function itemPreloaderFactory(options) {
      //we also have a specific instance of the asset manager to
      //resolve assets of a next item (we can't use the test asset manager).
      var preloadAssetManager = getAssetManager('item-preloader');
      /**
       * Resolves assets URLS using the assetManager
       * @param {object} item
       * @param {string} item.itemIdentifier - the item identifier
       * @param {string} item.baseUrl - item baseUrl
       * @param {string} item.itemData.type - type of item
       * @param {object} item.itemData.data - item data
       * @param {object} item.itemData.assets - assets per types :  img : ['url1', 'url2' ]
       * @returns {Promise<Object>} assets with URLs resolved
       * @private
       */

      var resolveAssets = function resolveAssets(item) {
        return new Promise(function (resolve) {
          var assets = item.itemData.assets;
          preloadAssetManager.setData('baseUrl', item.baseUrl);
          preloadAssetManager.setData('assets', assets);
          return resolve(_.reduce(assets, function (acc, assetList, type) {
            var resolved = {};

            _.forEach(assetList, function (url) {
              //filter base64 (also it seems sometimes we just have base64 data, without the protocol...)
              if (!urlUtil.isBase64(url)) {
                resolved[url] = preloadAssetManager.resolve(url);
              }
            });

            if (_.size(resolved) > 0) {
              acc[type] = resolved;
            }

            return acc;
          }, {}));
        });
      };

      if (!options || !options.testId) {
        throw new TypeError('The test identifier is mandatory to start the item preloader');
      } //this is the test asset manager, referenced under options.testId


      var testAssetManager = getAssetManager(options.testId); //mechanisms to preload assets and runtimes

      var assetPreloader = assetPreloaderFactory(testAssetManager);
      var interactionPreloader = interactionPreloaderFactory();
      /**
       * Preload the item runner
       * @param {object} item
       * @param {string} item.itemIdentifier - the item identifier
       * @param {string} item.baseUrl - item baseUrl
       * @param {string} item.itemData.type - type of item
       * @param {object} item.itemData.data - item data
       * @param {object} item.itemData.assets - assets per types :  img : ['url1', 'url2' ]
       * @returns {Promise}
       * @private
       */

      var itemLoad = function itemLoad(item) {
        logger.debug("Start preloading of item ".concat(item.itemIdentifier));
        return new Promise(function (resolve, reject) {
          qtiItemRunner(item.itemData.type, item.itemData.data, {
            assetManager: preloadAssetManager,
            preload: true
          }).on('init', function () {
            logger.debug("Preloading of item ".concat(item.itemIdentifier, " done"));
            resolve(true);
          }).on('error', reject).init();
        });
      };
      /**
       * Preload the interactions
       * @param {object} item
       * @param {string} item.itemIdentifier - the item identifier
       * @param {object} item.itemData.data - item data
       * @returns {Promise}
       * @private
       */


      var interactionLoad = function interactionLoad(item) {
        return Promise.all(getItemInteractions(item.itemData).map(function (interaction) {
          if (interactionPreloader.has(interaction.qtiClass)) {
            logger.debug("Loading interaction ".concat(interaction.serial, "(").concat(interaction.qtiClass, ") for item ").concat(item.itemIdentifier));
            return interactionPreloader.load(interaction.qtiClass, interaction, item.itemData, item.itemIdentifier);
          }

          return Promise.resolve();
        }));
      };
      /**
       * Unload the interactions
       * @param {object} item
       * @param {string} item.itemIdentifier - the item identifier
       * @param {object} item.itemData.data - item data
       * @returns {Promise}
       * @private
       */


      var interactionUnload = function interactionUnload(item) {
        return Promise.all(getItemInteractions(item.itemData).map(function (interaction) {
          if (interactionPreloader.has(interaction.qtiClass)) {
            logger.debug("Unloading interaction ".concat(interaction.serial, "(").concat(interaction.qtiClass, ") for item ").concat(item.itemIdentifier));
            return interactionPreloader.unload(interaction.qtiClass, interaction, item.itemData, item.itemIdentifier);
          }

          return Promise.resolve();
        }));
      };
      /**
       * Preload the item assets
       * @param {object} item
       * @param {string} item.itemIdentifier - the item identifier
       * @param {string} item.baseUrl - item baseUrl
       * @param {string} item.itemData.type - type of item
       * @param {object} item.itemData.data - item data
       * @param {object} item.itemData.assets - assets per types :  img : ['url1', 'url2' ]
       * @returns {Promise}
       * @private
       */


      var assetLoad = function assetLoad(item) {
        return resolveAssets(item).then(function (resolved) {
          _.forEach(resolved, function (assets, type) {
            if (assetPreloader.has(type)) {
              _.forEach(assets, function (url, sourceUrl) {
                logger.debug("Loading asset ".concat(sourceUrl, "(").concat(type, ") for item ").concat(item.itemIdentifier));
                assetPreloader.load(type, url, sourceUrl, item.itemIdentifier);
              });
            } else {
              setItemFlag(item, 'containsNonPreloadedAssets');
            }
          });

          return true;
        });
      };
      /**
       * Unload the item assets
       * @param {object} item
       * @param {string} item.itemIdentifier - the item identifier
       * @param {string} item.baseUrl - item baseUrl
       * @param {string} item.itemData.type - type of item
       * @param {object} item.itemData.data - item data
       * @param {object} item.itemData.assets - assets per types :  img : ['url1', 'url2' ]
       * @returns {Promise}
       * @private
       */


      var assetUnload = function assetUnload(item) {
        return resolveAssets(item).then(function (resolved) {
          _.forEach(resolved, function (assets, type) {
            if (assetPreloader.has(type)) {
              _.forEach(assets, function (url, sourceUrl) {
                logger.debug("Unloading asset ".concat(sourceUrl, "(").concat(type, ") for item ").concat(item.itemIdentifier));
                assetPreloader.unload(type, url, sourceUrl, item.itemIdentifier);
              });
            }
          });

          return true;
        });
      };
      /**
       * @typedef {object} itemPreloader
       */


      return {
        /**
         * Preload the given item (runtime and assets)
         *
         * @param {object} item
         * @param {string} item.itemIdentifier - the item identifier
         * @param {string} item.baseUrl - item baseUrl
         * @param {string} item.itemData.type - type of item
         * @param {object} item.itemData.data - item data
         * @param {object} item.itemData.assets - assets per types :  img : ['url1', 'url2' ]
         * @returns {Promise<Boolean>} resolves with true if the item is loaded
         */
        preload: function preload(item) {
          var loading = [];

          if (isItemObjectValid(item)) {
            loading.push(itemLoad(item));
            loading.push(interactionLoad(item));

            if (_.size(item.itemData.data && item.itemData.data.feedbacks)) {
              setItemFlag(item, 'hasFeedbacks');
            }

            if (_.size(item.portableElements && item.portableElements.pci)) {
              setItemFlag(item, 'hasPci');
            }

            if (_.size(item.itemData.assets) > 0) {
              loading.push(assetLoad(item));
            }
          }

          return Promise.all(loading).then(function (results) {
            return results.length > 0 && _.all(results, _.isTrue);
          });
        },

        /**
         * Unload the assets for the given item
         *
         * @param {object} item
         * @param {string} item.itemIdentifier - the item identifier
         * @param {string} item.baseUrl - item baseUrl
         * @param {string} item.itemData.type - type of item
         * @param {object} item.itemData.data - item data
         * @param {object} item.itemData.assets - assets per types :  img : ['url1', 'url2' ]
         * @returns {Promise}
         */
        unload: function unload(item) {
          var loading = [];

          if (isItemObjectValid(item)) {
            loading.push(interactionUnload(item));

            if (_.size(item.itemData.assets) > 0) {
              loading.push(assetUnload(item));
            }
          }

          return Promise.all(loading).then(function (results) {
            return results.length > 0 && _.all(results, _.isTrue);
          });
        }
      };
    }

    return itemPreloaderFactory;

});
