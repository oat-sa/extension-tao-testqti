define(['lodash', 'core/store', 'taoQtiTest/runner/proxy/cache/itemPreloader'], function (_, store, itemPreloaderFactory) { 'use strict';

    _ = _ && Object.prototype.hasOwnProperty.call(_, 'default') ? _['default'] : _;
    store = store && Object.prototype.hasOwnProperty.call(store, 'default') ? store['default'] : store;
    itemPreloaderFactory = itemPreloaderFactory && Object.prototype.hasOwnProperty.call(itemPreloaderFactory, 'default') ? itemPreloaderFactory['default'] : itemPreloaderFactory;

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
     * The default number of items to store
     */

    var defaultConfig = {
      itemTTL: 0,
      maxSize: 10,
      preload: false
    };
    /**
     * Create an item store
     * @param {object} [options]
     * @param {number} [options.itemTTL = 0] - The TTL for each item in the store, in milliseconds. 0 means no TTL.
     * @param {number} [options.maxSize = 10] - the store limit
     * @param {boolean} [options.preload] - do we preload items when storing them
     * @param {string} [options.testId] - the unique identifier of the test instance, required if preload is true
     *
     * @returns {itemStore}
     */

    function itemStoreFactory(options) {
      var config = _.defaults(options || {}, defaultConfig); // in memory storage


      var getStore = function getStore() {
        return store('item-cache', store.backends.memory);
      }; // maintain an index to resolve existence synchronously


      var index = new Map();
      var lastIndexedPosition = 0; // check if a key has expired

      var isExpired = function isExpired(key) {
        var meta = index.get(key);

        if (meta) {
          return config.itemTTL && Date.now() - meta.timestamp >= config.itemTTL;
        }

        return false;
      }; // retrieve the first item by position from the index


      var findFirstIndexedItem = function findFirstIndexedItem() {
        var first = null;
        var lowest = Number.POSITIVE_INFINITY;
        index.forEach(function (item, key) {
          if (item.position < lowest) {
            lowest = item.position;
            first = key;
          }
        });
        return first;
      }; // retrieve all expired items from the index


      var findExpiredItems = function findExpiredItems() {
        var expired = [];
        index.forEach(function (item, key) {
          if (isExpired(key)) {
            expired.push(key);
          }
        });
        return expired;
      };

      var itemPreloader;

      if (config.preload) {
        itemPreloader = itemPreloaderFactory(_.pick(config, ['testId']));
      }
      /**
       * @typedef itemStore
       */


      return {
        /**
         * Setter to override the cache size
         *
         * @param {number} cacheSize
         */
        setCacheSize: function setCacheSize(cacheSize) {
          config.maxSize = cacheSize;
        },

        /**
         * Sets the item store TTL.
         * @param {number} ttl
         */
        setItemTTL: function setItemTTL(ttl) {
          config.itemTTL = ttl;
        },

        /**
         * Get the item form the given key/id/uri
         * @param {string} key - something identifier
         * @returns {Promise<Object>} the item
         */
        get: function get(key) {
          if (!this.has(key)) {
            return Promise.resolve();
          }

          return getStore().then(function (itemStorage) {
            return itemStorage.getItem(key);
          });
        },

        /**
         * Check whether the given item is in the store
         * @param {string} key - something identifier
         * @returns {boolean}
         */
        has: function has(key) {
          return index.has(key) && !isExpired(key);
        },

        /**
         * Add/Set an item into the store, under the given key
         * @param {string} key - something identifier
         * @param {object} item - the item
         * @returns {Promise<boolean>} chains
         */
        set: function set(key, item) {
          var _this = this;

          return getStore().then(function (itemStorage) {
            return itemStorage.setItem(key, item).then(function (updated) {
              if (updated) {
                if (!index.has(key)) {
                  index.set(key, {
                    position: lastIndexedPosition++,
                    timestamp: Date.now()
                  });
                }

                if (config.preload) {
                  _.defer(function () {
                    return itemPreloader.preload(item);
                  });
                }
              } //do we reach the limit ? then remove one


              if (index.size > 1 && index.size > config.maxSize) {
                return _this.remove(findFirstIndexedItem()).then(function (removed) {
                  return updated && removed;
                });
              }

              return updated;
            });
          });
        },

        /**
         * Update some data of a store item
         * @param {string} key - something identifier
         * @param {string} updateKey - key to update
         * @param {*} updateValue - new data for the updateKey
         * @returns {Promise<boolean>} resolves with the update status
         */
        update: function update(key, updateKey, updateValue) {
          if (index.has(key) && _.isString(updateKey)) {
            return getStore().then(function (itemStorage) {
              return itemStorage.getItem(key).then(function (itemData) {
                if (_.isPlainObject(itemData)) {
                  itemData[updateKey] = updateValue;
                  return itemStorage.setItem(key, itemData);
                }
              });
            });
          }

          return Promise.resolve(false);
        },

        /**
         * Remove the item from the store
         * @param {string} key - something identifier
         * @returns {Promise<boolean>} resolves once removed
         */
        remove: function remove(key) {
          if (index.has(key)) {
            return getStore().then(function (itemStorage) {
              index.delete(key);
              return itemStorage.getItem(key).then(function (item) {
                if (config.preload) {
                  _.defer(function () {
                    return itemPreloader.unload(item);
                  });
                }
              }).then(function () {
                return itemStorage.removeItem(key);
              });
            });
          }

          return Promise.resolve(false);
        },

        /**
         * Prune the store from expired content.
         * @returns {Promise}
         */
        prune: function prune() {
          return Promise.all(findExpiredItems().map(this.remove));
        },

        /**
         * Clear the store
         * @returns {Promise}
         */
        clear: function clear() {
          return getStore().then(function (itemStorage) {
            index.clear();
            return itemStorage.clear();
          });
        }
      };
    }

    return itemStoreFactory;

});
