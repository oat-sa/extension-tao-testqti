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
 * @author Péter Halász <peter@taotesting.com>
 */
define(function() {
    'use strict';

    var storage = {
        correctResponses: {},
        responses: {}
    };

    return {
        /**
         * Returns the correct responses
         *
         * @returns {Object}
         */
        getCorrectResponses: function getCorrectResponses() {
            return storage.correctResponses;
        },

        /**
         * Returns the given responses
         *
         * @returns {Object}
         */
        getResponses: function getResponses() {
            return storage.responses;
        },

        /**
         * Returns the requested correct response
         *
         * @param {string} identifier
         * @returns {Array}
         */
        getCorrectResponse: function getCorrectResponse(identifier) {
            if (identifier in storage.correctResponses) {
                return storage.correctResponses[identifier];
            }

            return [];
        },

        /**
         * Returns the requested given response
         *
         * @param {string} identifier
         * @returns {string}
         */
        getResponse: function getResponse(identifier) {
            return storage.responses[identifier];
        },

        /**
         * Adds a correct response to the response store
         *
         * @param {string} identifier
         * @param {Array} data
         */
        addCorrectResponse: function addCorrectResponse(identifier, data) {
            storage.correctResponses[identifier] = data;
        },

        /**
         * Adds a given response to the response store
         *
         * @param {string} identifier
         * @param {string} data
         */
        addResponse: function addResponse(identifier, data) {
            storage.responses[identifier] = data;
        },

        clearStorage: function clearStorage() {
            storage.responses = {};
            storage.correctResponses = {};
        }
    };
});
