define(['core/eventifier', 'core/polling', 'core/timer'], function (eventifier, pollingFactory, timerFactory) { 'use strict';

    eventifier = eventifier && Object.prototype.hasOwnProperty.call(eventifier, 'default') ? eventifier['default'] : eventifier;
    pollingFactory = pollingFactory && Object.prototype.hasOwnProperty.call(pollingFactory, 'default') ? pollingFactory['default'] : pollingFactory;
    timerFactory = timerFactory && Object.prototype.hasOwnProperty.call(timerFactory, 'default') ? timerFactory['default'] : timerFactory;

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
     * Copyright (c) 2020 (original work) Open Assessment Technologies SA
     *
     */
    var defaultOptions = {
      interval: 1000
    };
    /**
     * The stopwatch factory
     * @param {Object} options
     * @param {Number} [options.interval]
     * @returns {Object} stopwatch instance
     */

    function stopwatchFactory() {
      var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
      var config = Object.assign({}, defaultOptions, options);
      var initialized = false;
      var polling;
      var stopwatch;
      return eventifier({
        /**
         * Is this instance initialized
         * @returns {Boolean}
         */
        isInitialized: function isInitialized() {
          return initialized;
        },

        /**
         * Initialize stopwatch
         */
        init: function init() {
          var _this = this;

          stopwatch = timerFactory({
            autoStart: false
          });
          /**
           * @fires tick - every time when interval is elapsed
           */

          polling = pollingFactory({
            action: function action() {
              return _this.trigger('tick', stopwatch.tick());
            },
            interval: config.interval,
            autoStart: false
          });
          initialized = true;
        },

        /**
         * Start stopwatch
         */
        start: function start() {
          if (this.isInitialized()) {
            stopwatch.resume();
            polling.start();
          }
        },

        /**
         * Stop stopwatch
         */
        stop: function stop() {
          if (this.isInitialized()) {
            stopwatch.pause();
            polling.stop();
          }
        },

        /**
         * Destory stopwatch by stoping the timer
         */
        destroy: function destroy() {
          if (this.isInitialized()) {
            initialized = false;
            polling.stop();
            polling = null;
            stopwatch.stop();
            stopwatch = null;
          }
        }
      });
    }

    return stopwatchFactory;

});
