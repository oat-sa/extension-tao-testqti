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
 * Copyright (c) 2015 (original work) Open Assessment Technologies SA ;
 */

/**
 * @author Bertrand Chevrier <bertrand@taotesting.com>
 */
define([
    'lodash',
    'i18n',
    'taoQtiTest/controller/creator/helpers/outcome',
    'taoQtiTest/controller/creator/helpers/qtiElement'
], function(_, __, outcomeHelper, qtiElementHelper){
    'use strict';

    /**
     * Utils to manage the QTI Test model
     * @exports taoQtiTest/controller/creator/qtiTestHelper
     */
    var qtiTestHelper = {

        /**
         * Extract qti identifiers from a model
         * @param {Object} obj - the model to extract id from
         * @returns {Array} the extracted identifiers
         */
        extractIdentifiers : function extractIdentifiers(obj){
            var self = this;
            var identifiers = [];
            if(_.has(obj, 'identifier')){
                identifiers = identifiers.concat(obj.identifier.toLowerCase());
            }
            _.flatten(_.forEach(obj, function(value) {
                identifiers = identifiers.concat(typeof value === "object" ? self.extractIdentifiers(value) : []);
            }), true);
            return identifiers;
        },

        /**
         * Get a valid and avialable qti identifier
         * @param {String} qtiType - the type of element you want an id for
         * @param {Array} lockedIdentifiers - the list of identifiers you cannot use anymore
         * @returns {String} the identifier
         */
        getIdentifier : function getIdentifier(qtiType, lockedIdentifiers){
            var index = 1;
            var suggestion;
            var glue =  '-';

            do {
                suggestion = qtiType +  glue + (index++);
            } while(_.contains(lockedIdentifiers, suggestion.toLowerCase()));

            lockedIdentifiers.push(suggestion.toLowerCase());

            return suggestion;
        },

        /**
         * Gives you a validator that check QTI id format
         * @returns {Object} the validator
         */
        idFormatValidator : function idFormatValidator(){
            var qtiIdPattern = /^[_a-zA-Z]{1}[a-zA-Z0-9\-._]{0,31}$/i;
            return {
                name : 'idFormat',
                message : __('is not a valid identifier (alphanum, underscore, dash and dots)'),
                validate : function(value, callback){
                    if(typeof callback === 'function'){
                        callback(qtiIdPattern.test(value));
                    }
                }
            };
        },

        /**
         * Gives you a validator that check QTI id format of the test (it is different from the others...)
         * @returns {Object} the validator
         */
        testidFormatValidator : function testidFormatValidator(){
            var qtiTestIdPattern = /^\S+$/;
            return {
                name : 'testIdFormat',
                message : __('is not a valid identifier (everything except spaces)'),
                validate : function(value, callback){
                    if(typeof callback === 'function'){
                        callback(qtiTestIdPattern.test(value));
                    }
                }
            };
        },

        /**
         * Gives you a validator that check if a QTI id is available
         * @param {Array} lockedIdentifiers - deprecated, get them trough the modelOverseer
         * @param {Object} modelOverseer - let's you get the data model
         * @returns {Object} the validator
         */
        idAvailableValidator : function idAvailableValidator(lockedIdentifiers, modelOverseer){
            var self = this;
            return {
                name : 'testIdAvailable',
                message : __('is already used in the test.'),
                validate : function(value, callback){
                    var counts = {};
                    var key    = value.toLowerCase();
                    var identifiers = lockedIdentifiers;
                    if(!identifiers && modelOverseer) {
                        identifiers = self.extractIdentifiers(modelOverseer.getModel());
                    }

                    if(typeof callback === 'function'){
                        counts = _.countBy(identifiers);
                        //the identifier list always contains itself
                        //so we check if another one is identical (ie. >= 2)
                        callback(typeof counts[key] === 'undefined' || counts[key] < 2);
                    }
                }
            };
        },

        /**
         * Does the value contains the type type
         * @param {Object} value
         * @param {string} type
         * @returns {boolean}
         */
        filterQtiType : function filterQtiType (value, type){
            return value['qti-type'] && value['qti-type'] === type;
        },

        /**
         * Add the 'qti-type' properties to object that miss it, using the parent key name
         * @param {Object|Array} collection
         * @param {string} parentType
         */
        addMissingQtiType : function addMissingQtiType(collection, parentType) {
            var self = this;
            _.forEach(collection, function(value, key) {
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
                    self.addMissingQtiType(value, key.replace(/s$/, ''));
                } else if (_.isObject(value)) {
                    self.addMissingQtiType(value);
                }
            });
        },

        /**
         * Applies consolidation rules to the model
         * @param {Object} model
         * @returns {Object}
         */
        consolidateModel : function consolidateModel(model){
            if(model && model.testParts && _.isArray(model.testParts)){

                _.forEach(model.testParts, function(testPart) {

                    if(testPart.assessmentSections && _.isArray(testPart.assessmentSections)){

                        _.forEach(testPart.assessmentSections, function(assessmentSection) {

                            //remove ordering is shuffle is false
                            if(assessmentSection.ordering &&
                                typeof assessmentSection.ordering.shuffle !== 'undefined' && assessmentSection.ordering.shuffle === false){
                                delete assessmentSection.ordering;
                            }

                            // clean categories (QTI identifier can't be empty string)
                            if(assessmentSection.sectionParts && _.isArray(assessmentSection.sectionParts)) {
                                _.forEach(assessmentSection.sectionParts, function(part) {
                                    if(part.categories && _.isArray(part.categories) && (part.categories.length === 0 || part.categories[0].length === 0)) {
                                        part.categories = [];
                                    }
                                });
                            }

                            if(assessmentSection.rubricBlocks && _.isArray(assessmentSection.rubricBlocks)) {

                                //remove rubrick blocks if empty
                                if (assessmentSection.rubricBlocks.length === 0 ||
                                    (assessmentSection.rubricBlocks.length === 1 && assessmentSection.rubricBlocks[0].content.length === 0) ) {

                                    delete assessmentSection.rubricBlocks;
                                }
                                //ensure the view attribute is present
                                else if(assessmentSection.rubricBlocks.length > 0){
                                    _.forEach(assessmentSection.rubricBlocks, function(rubricBlock){
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
         * Validates the provided model
         * @param {Object} model
         * @throws {Error} if the model is not valid
         */
        validateModel: function validateModel(model) {
            var identifiers = this.extractIdentifiers(model);
            var nonUniqueIdentifiers = [];
            var outcomes = _.indexBy(outcomeHelper.listOutcomes(model));

            _(identifiers)
                .countBy()
                .forEach(function(count, id){
                    if(count > 1){
                        nonUniqueIdentifiers.push(id);
                    }
                });
            if(nonUniqueIdentifiers.length === 1){
                throw new Error(__('The identifier "%s" is not unique accross the test.', nonUniqueIdentifiers[0]));
            }
            if(nonUniqueIdentifiers.length > 1){
                throw new Error(__('The following identifiers "%s" are not unique accross the test.', nonUniqueIdentifiers.join('", "')));
            }

            _.forEach(model.testParts, function (testPart) {
                _.forEach(testPart.assessmentSections, function (assessmentSection) {
                    _.forEach(assessmentSection.rubricBlocks, function (rubricBlock) {
                        var feedbackBlock = qtiElementHelper.lookupElement(rubricBlock, 'rubricBlock.div.feedbackBlock', 'content');
                        if (feedbackBlock && !outcomes[feedbackBlock.outcomeIdentifier]) {
                            throw new Error(__('The outcome "%s" does not exist, but it is referenced by a feedback block!', feedbackBlock.outcomeIdentifier));
                        }
                    });
                });
            });
        }
    };

    return  qtiTestHelper;
});

