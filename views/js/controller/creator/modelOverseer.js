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
 * Copyright (c) 2017 (original work) Open Assessment Technologies SA ;
 */
/**
 * @author Jean-Sébastien Conan <jean-sebastien@taotesting.com>
 */
define([
    'lodash',
    'core/eventifier',
    'core/statifier'
], function (_, eventifier, statifier) {
    'use strict';

    /**
     * Wraps the test model in a manager, provides API to handle events and states
     * @param {Object} model
     * @returns {Object}
     */
    function modelOverseerFactory(model) {
        var modelOverseer = {
            /**
             * Gets the nested model
             * @returns {Object}
             */
            getModel: function getModel() {
                return model;
            },

            /**
             * Sets the nested model
             *
             * @param {Object} newModel
             * @returns {modelOverseer}
             */
            setModel: function setModel(newModel) {
                model = newModel;
                return this;
            }
        };

        return statifier(eventifier(modelOverseer));
    }

    return modelOverseerFactory;
});
