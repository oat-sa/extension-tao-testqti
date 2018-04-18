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
    'core/statifier',
    'taoQtiTest/controller/creator/helpers/baseType',
    'taoQtiTest/controller/creator/helpers/cardinality',
    'taoQtiTest/controller/creator/helpers/outcome',
    'taoQtiTest/controller/creator/helpers/category'
], function (_, eventifier, statifier, baseTypeHelper, cardinalityHelper, outcomeHelper, categoryHelper) {
    'use strict';

    /**
     * Wraps the test model in a manager, provides API to handle events and states
     * @param {Object} model
     * @param {Object} [config]
     * @returns {Object}
     */
    function modelOverseerFactory(model, config) {
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
             * @fires setmodel
             */
            setModel: function setModel(newModel) {
                model = newModel;

                /**
                 * @event modelOverseer#setmodel
                 * @param {String} model
                 */
                modelOverseer.trigger('setmodel', model);
                return this;
            },

            /**
             * Gets the config set
             * @returns {Object}
             */
            getConfig: function getConfig() {
                return config;
            },



            /**
             * Gets the list of defined outcomes for the nested model. A descriptor is built for each outcomes:
             * {
             *      name: {String},
             *      type: {String},
             *      cardinality: {String}
             * }
             * @returns {Object[]}
             */
            getOutcomesList: function getOutcomesList() {
                return _.map(outcomeHelper.getOutcomeDeclarations(model), function(declaration) {
                    return {
                        name: declaration.identifier,
                        type: baseTypeHelper.getNameByConstant(declaration.baseType),
                        cardinality: cardinalityHelper.getNameByConstant(declaration.cardinality)
                    };
                });
            },

            /**
             * Gets the names of the defined outcomes for the nested model
             * @returns {Array}
             */
            getOutcomesNames: function getOutcomesNames() {
                return _.map(outcomeHelper.getOutcomeDeclarations(model), function(declaration) {
                    return declaration.identifier;
                });
            },

            /**
             * Gets the list of defined categories for the nested model
             * @returns {Array}
             */
            getCategories: function getCategories() {
                return categoryHelper.listCategories(model);
            },

            /**
             * Gets the list of defined options for the nested model
             * @returns {Array}
             */
            getOptions: function getOptions() {
                return categoryHelper.listOptions(model);
            }
        };

        config = _.isPlainObject(config) ? config : _.assign({}, config);

        return statifier(eventifier(modelOverseer));
    }

    return modelOverseerFactory;
});
