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
 * Copyright (c) 2015 (original work) Open Assessment Technologies SA;
 *
 * Keep duration of test-taker activity in localstorage
 */

define([
    'lodash'
], function (_) {
    'use strict';

    /**
     * @param {Object} options
     * @param {string} options.accuracy - period of user status checking
     */
    var sessionStateFactory = function sessionStateFactory(options) {
        var _storageKey = 'testtaker_active_for',
            _accuracy,
            _interval = null;

        var sessionState = {

            start: function start() {
                if (null !== _interval) {
                    throw TypeError('Tracking is already started');
                }
                _interval = setInterval(function () {
                    setLocalStorageData(getLocalStorageData() + _accuracy);
                }, _accuracy)
            },

            stop: function stop() {
                clearInterval(_interval);
                _interval = null;
            },

            getDuration: function getDuration() {
                return getLocalStorageData();
            },

            reset: function reset() {
                this.stop();
                clearLocalStorage();
            },

            restart: function restart(){
                this.reset();
                this.start();
            }

        };

        function init() {
            _accuracy = options.accuracy || 1000;
        }

        init();

        /**
         * Store duration in ms to local storage
         * @param {*} val - data to be stored.
         */
        function setLocalStorageData(val) {
            window.localStorage.setItem(_storageKey, val);
        }

        /**
         * Get duration from local storage
         * @returns {int} in ms
         */
        function getLocalStorageData() {
            var data = window.localStorage.getItem(_storageKey),
                result = JSON.parse(data) || 0;
            return result;
        }

        /**
         * Clear storage
         */
        function clearLocalStorage() {
            window.localStorage.removeItem(_storageKey);
        }

        return sessionState;
    };

    return sessionStateFactory;
});