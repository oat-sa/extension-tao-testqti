define(['util/capitalize', 'taoQtiTest/runner/services/offlineJumpTable', 'taoQtiTest/runner/helpers/testContextBuilder'], function (capitalize, offlineJumpTableFactory, testContextBuilder) { 'use strict';

    capitalize = capitalize && Object.prototype.hasOwnProperty.call(capitalize, 'default') ? capitalize['default'] : capitalize;
    offlineJumpTableFactory = offlineJumpTableFactory && Object.prototype.hasOwnProperty.call(offlineJumpTableFactory, 'default') ? offlineJumpTableFactory['default'] : offlineJumpTableFactory;
    testContextBuilder = testContextBuilder && Object.prototype.hasOwnProperty.call(testContextBuilder, 'default') ? testContextBuilder['default'] : testContextBuilder;

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
     * @param {itemStore} itemStore
     * @param {responseStore} responseStore
     * @returns {Object}
     */

    function offlineNavigatorFactory(itemStore, responseStore) {
      var testContext,
          testMap,
          offlineJumpTableHelper = offlineJumpTableFactory(itemStore, responseStore);
      return {
        /**
         * @deprecated
         * @param {Object} data
         * @returns {this}
         */
        setTestData: function setTestData() {
          return this;
        },

        /**
         * @param {Object} context
         * @returns {this}
         */
        setTestContext: function setTestContext(context) {
          testContext = context;
          return this;
        },

        /**
         * @param {Object} map
         * @returns {this}
         */
        setTestMap: function setTestMap(map) {
          testMap = map;
          return this;
        },

        /**
         * Initialization method for the offline navigator component
         * It get called in proxy init function 
         *
         * @returns {Promise}
         */
        init: function init() {
          offlineJumpTableHelper.setTestMap(testMap);
          return offlineJumpTableHelper.init(testContext);
        },

        /**
         * Helper function to clear the jump table
         * It's used only in tests
         *
         * @returns {this}
         */
        clearJumpTable: function clearJumpTable() {
          offlineJumpTableHelper.clearJumpTable();
          return this;
        },

        /**
         * Performs the navigation action and returns the new test context.
         *
         * @param {String} direction
         * @param {String} scope
         * @param {Integer} position
         * @param {Object} params
         * @returns {Promise} the new test context
         */
        navigate: function navigate(direction, scope, position, params) {
          return new Promise(function (resolve, reject) {
            var lastJump,
                navigationActionName = "jumpTo".concat(capitalize(direction)).concat(capitalize(scope));

            if (typeof offlineJumpTableHelper[navigationActionName] === 'undefined' || typeof offlineJumpTableHelper[navigationActionName] !== 'function') {
              throw new Error('Invalid navigation action');
            }

            offlineJumpTableHelper[navigationActionName](params).then(function () {
              lastJump = offlineJumpTableHelper.getLastJump(); // new textContext doesn't know about item attempt
              // attempt is stored in itemStore
              // 1. get attempt from itemStore and increase it
              // 2. set it in new textContext
              // 3. store new attempt in itemStore
              // 4. return new textContext with right attempt

              itemStore.get(lastJump.item).then(function (itemFromStore) {
                var newTestContext = testContextBuilder.buildTestContextFromJump(testContext, testMap, lastJump, itemFromStore.attempt);
                itemStore.update(newTestContext.itemIdentifier, 'attempt', newTestContext.attempt).then(function () {
                  return resolve(newTestContext);
                });
              });
            }).catch(function (err) {
              reject(err);
            });
          });
        }
      };
    }

    return offlineNavigatorFactory;

});
