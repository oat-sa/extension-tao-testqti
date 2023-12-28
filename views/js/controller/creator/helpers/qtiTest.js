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
 * Copyright (c) 2015-2022 (original work) Open Assessment Technologies SA ;
 */

/**
 * @author Bertrand Chevrier <bertrand@taotesting.com>
 */
define(['jquery', 'lodash', 'taoQtiTest/controller/creator/helpers/validators'], function ($, _, validators) {
    'use strict';

    /**
     * Utility to manage the QTI Test model
     * @exports taoQtiTest/controller/creator/qtiTestHelper
     */
    const qtiTestHelper = {
        /**
         * Get the list of unique identifiers for the given model.
         * @param {Object|Object[]} model - the JSON QTI model
         * @param {String[]} [includesOnlyTypes] - list of qti-type to include, exclusively
         * @param {String[]} [excludeTypes] - list of qti-type to exclude, it excludes the children too
         * @returns {String[]} the list of unique identifiers
         */
        getIdentifiers: function getIdentifiers(model, includesOnlyTypes, excludeTypes) {
            return _.uniqBy(_.map(validators.extractIdentifiers(model, includesOnlyTypes, excludeTypes), 'identifier'));
        },

        /**
         * Get the list of identifiers for a given QTI type, only.
         * @param {Object|Object[]} model - the JSON QTI model
         * @param {String} qtiType - the type of QTI element to get the identifiers.
         * @returns {String[]} the list of unique identifiers
         */
        getIdentifiersOf: function getIdentifiersOf(model, qtiType) {
            return this.getIdentifiers(model, [qtiType]);
        },

        /**
         * Does the value contains the type type
         * @param {Object} value
         * @param {string} type
         * @returns {boolean}
         */
        filterQtiType: function filterQtiType(value, type) {
            return value['qti-type'] && value['qti-type'] === type;
        },

        /**
         * Add the 'qti-type' properties to object that miss it, using the parent key name
         * @param {Object|Array} collection
         * @param {string} parentType
         */
        addMissingQtiType: function addMissingQtiType(collection, parentType) {
            _.forEach(collection, (value, key) => {
                if (_.isObject(value) && !_.isArray(value) && !_.has(value, 'qti-type')) {
                    if (_.isNumber(key)) {
                        if (parentType) {
                            value['qti-type'] = parentType;
                        }
                    } else {
                        value['qti-type'] = key;
                    }
                }
                if (_.isArray(value)) {
                    this.addMissingQtiType(value, key.replace(/s$/, ''));
                } else if (_.isObject(value)) {
                    this.addMissingQtiType(value);
                }
            });
        },

        /**
         * Applies consolidation rules to the model
         * @param {Object} model
         * @returns {Object}
         */
        consolidateModel: function consolidateModel(model) {
            if (model && model.testParts && _.isArray(model.testParts)) {
                _.forEach(model.testParts, function (testPart) {
                    if (testPart.assessmentSections && _.isArray(testPart.assessmentSections)) {
                        _.forEach(testPart.assessmentSections, function (assessmentSection) {
                            //remove ordering is shuffle is false
                            if (
                                assessmentSection.ordering &&
                                typeof assessmentSection.ordering.shuffle !== 'undefined' &&
                                assessmentSection.ordering.shuffle === false
                            ) {
                                delete assessmentSection.ordering;
                            }

                            // clean categories (QTI identifier can't be empty string)
                            if (assessmentSection.sectionParts && _.isArray(assessmentSection.sectionParts)) {
                                _.forEach(assessmentSection.sectionParts, function (part) {
                                    if (
                                        part.categories &&
                                        _.isArray(part.categories) &&
                                        (part.categories.length === 0 || part.categories[0].length === 0)
                                    ) {
                                        part.categories = [];
                                    }
                                });
                            }

                            if (assessmentSection.rubricBlocks && _.isArray(assessmentSection.rubricBlocks)) {
                                //remove rubric blocks if empty
                                if (
                                    assessmentSection.rubricBlocks.length === 0 ||
                                    (assessmentSection.rubricBlocks.length === 1 &&
                                        assessmentSection.rubricBlocks[0].content.length === 0)
                                ) {
                                    delete assessmentSection.rubricBlocks;
                                } else if (assessmentSection.rubricBlocks.length > 0) {
                                    //ensure the view attribute is present
                                    _.forEach(assessmentSection.rubricBlocks, function (rubricBlock) {
                                        rubricBlock.views = ['candidate'];
                                        //change once views are supported
                                        //if(rubricBlock && rubricBlock.content && (!rubricBlock.views || (_.isArray(rubricBlock.views) && rubricBlock.views.length === 0))){
                                        //rubricBlock.views = ['candidate'];
                                        //}
                                    });
                                }
                            }
                        });
                    }
                });
            }
            return model;
        },
        /**
         * Get a valid and available QTI identifier for the given type
         * @param {Object|Object[]} model - the JSON QTI model to check the existing IDs
         * @param {String} qtiType - the type of element you want an id for
         * @param {String} [suggestion] - the default pattern body, we use the type otherwise
         * @returns {String} the generated identifier
         */
        getAvailableIdentifier: function getAvailableIdentifier(model, qtiType, suggestion) {
            let index = 1;
            const glue = '-';
            let identifier;
            let current;
            if (_.includes(validators.qtiTypesForUniqueIds, qtiType)) {
                current = this.getIdentifiers(model, validators.qtiTypesForUniqueIds);
            } else {
                current = this.getIdentifiersOf(model, qtiType);
            }

            suggestion = suggestion || qtiType;

            do {
                identifier = suggestion + glue + index++;
            } while (
                _.includes(current, identifier.toUpperCase()) || // identifier exist in model
                $(`#${identifier}`).length // identifier was in model but still exist in DOM
            );

            return identifier;
        }
    };

    return qtiTestHelper;
});
