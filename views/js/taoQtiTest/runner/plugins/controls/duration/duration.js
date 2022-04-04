define(['lodash', 'taoTests/runner/plugin', 'core/logger'], function (_, pluginFactory, loggerFactory) { 'use strict';

    _ = _ && Object.prototype.hasOwnProperty.call(_, 'default') ? _['default'] : _;
    pluginFactory = pluginFactory && Object.prototype.hasOwnProperty.call(pluginFactory, 'default') ? pluginFactory['default'] : pluginFactory;
    loggerFactory = loggerFactory && Object.prototype.hasOwnProperty.call(loggerFactory, 'default') ? loggerFactory['default'] : loggerFactory;

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
    var logger = loggerFactory('taoQtiTest/runner/plugins/controls/duration/duration');
    /**
     * Creates the timer plugin
     */

    var duration = pluginFactory({
      name: 'duration',

      /**
       * Install step, add behavior before the lifecycle.
       */
      install: function install() {
        // define the "duration" store as "volatile" (removed on browser change).
        this.getTestRunner().getTestStore().setVolatile(this.getName());
      },

      /**
       * Initializes the plugin (called during runner's init)
       *
       * @returns {Promise}
       */
      init: function init() {
        var testRunner = this.getTestRunner();
        var currentUpdatePromise = Promise.resolve();

        var getItemAttempt = function getItemAttempt() {
          var context = testRunner.getTestContext();
          return "".concat(context.itemIdentifier, "#").concat(context.attempt);
        };

        var getPositiveNumber = function getPositiveNumber(value) {
          if (!_.isNumber(value) || value < 0) {
            return 0;
          }

          return value;
        }; //where the duration of attempts are stored


        return testRunner.getPluginStore(this.getName()).then(function (durationStore) {
          /**
           * Gets the duration of a particular item from the store
           *
           * @param {String} attemptId - the attempt id to get the duration for
           * @returns {Promise}
           */
          var getItemDuration = function getItemDuration(attemptId) {
            if (!/^(.*)+#+\d+$/.test(attemptId)) {
              return Promise.reject(new Error('Is it really an attempt id, like "itemid#attempt"'));
            }

            return durationStore.getItem(attemptId);
          };
          /**
           * Updates the duration of a particular item
           *
           * @param {Number} elapsed - time elapsed since previous tick
           * @returns {Promise}
           */


          var updateDuration = function updateDuration(elapsed) {
            var itemAttemptId = getItemAttempt();
            currentUpdatePromise = currentUpdatePromise.then(function () {
              return getItemDuration(itemAttemptId);
            }).then(function (duration) {
              return durationStore.setItem(itemAttemptId, getPositiveNumber(duration) + getPositiveNumber(elapsed) / 1000);
            }).catch(function (err) {
              logger.warn("Error updating item duration! ".concat(err && err.message));
            });
            return currentUpdatePromise;
          };
          /**
           * Adds the current duration to the next action request.
           * The duration will be sent to the server with the next request,
           * usually submitItem() or callItemAction()
           *
           * @returns {Promise}
           */


          var addDurationToCallActionParams = function addDurationToCallActionParams() {
            var itemAttemptId = getItemAttempt();
            return currentUpdatePromise.then(function () {
              return getItemDuration(itemAttemptId);
            }).then(function (duration) {
              return testRunner.getProxy().addCallActionParams({
                itemDuration: getPositiveNumber(duration)
              });
            }).catch(function (err) {
              logger.warn("Error retrieving item duration! ".concat(err && err.message));
            });
          }; //change plugin state


          testRunner.on('tick', updateDuration).before('move skip exit timeout pause', addDurationToCallActionParams)
          /**
           * @event duration.get
           * @param {String} attemptId - the attempt id to get the duration for
           * @param {getDuration} getDuration - a receiver callback
           */
          .on('plugin-get.duration', function (attemptId, getDuration) {
            if (_.isFunction(getDuration)) {
              getDuration(getItemDuration(attemptId));
            }
          });
        });
      }
    });

    return duration;

});
