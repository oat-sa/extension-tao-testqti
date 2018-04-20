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

    //Identifiers must be unique across
    //those QTI types
    var qtiTypesForUniqueIds = [
        'assessmentTest',
        'testPart',
        'assessmentSection',
        'assessmentItemRef'
    ];

    /**
     * Utility to manage the QTI Test model
     * @exports taoQtiTest/controller/creator/qtiTestHelper
     */
    var qtiTestHelper = {

        /**
         * Extracts the identifiers from a QTI model
         * @param {Object|Object[]} model - the JSON QTI model
         * @param {String[]} [includesOnlyTypes] - list of qti-type to include, exclusively
         * @param {String[]} [excludeTypes] - list of qti-type to exclude, it excludes the children too
         * @returns {Object[]} a collection of identifiers (with some meta), if the id is not unique it will appear multiple times, as extracted.
         */
        extractIdentifiers : function extractIdentifiers(model, includesOnlyTypes, excludeTypes){

            var identifiers = [];

            var extract = function extract( element ) {
                if(element && _.has(element, 'identifier') && _.isString(element.identifier)){
                    if(!includesOnlyTypes.length || _.contains(includesOnlyTypes, element['qti-type'])){
                        identifiers.push({
                            identifier : element.identifier.toUpperCase(),
                            originalIdentifier :  element.identifier,
                            type      : element['qti-type'],
                            label     : element.title || element.identifier
                        });
                    }
                }
                _.forEach(element, function(subElement) {
                    if(_.isPlainObject(subElement) || _.isArray(subElement)){
                        if(!excludeTypes.length || !_.contains(excludeTypes, subElement['qti-type']) ){
                            extract(subElement);
                        }
                    }
                });
            };

            if (_.isPlainObject(model) || _.isArray(model)) {
                excludeTypes = excludeTypes || [];
                includesOnlyTypes = includesOnlyTypes || [];

                extract(model);
            }
            return identifiers;
        },

        /**
         * Get the list of unique identifiers for the given model.
         * @param {Object|Object[]} model - the JSON QTI model
         * @param {String[]} [includesOnlyTypes] - list of qti-type to include, exclusively
         * @param {String[]} [excludeTypes] - list of qti-type to exclude, it excludes the children too
         * @returns {String[]} the list of unique identifiers
         */
        getIdentifiers : function getIdentifiers(model, includesOnlyTypes, excludeTypes){
            return _.uniq(_.pluck(this.extractIdentifiers(model, includesOnlyTypes, excludeTypes), 'identifier'));
        },

        /**
         * Get the list of identifiers for a given QTI type, only.
         * @param {Object|Object[]} model - the JSON QTI model
         * @param {String} qtiType - the type of QTI element to get the identifiers.
         * @returns {String[]} the list of unique identifiers
         */
        getIdentifiersOf : function getIdentifiersOf(model, qtiType){
            return this.getIdentifiers(model, [qtiType]);
        },

        /**
         * Get a valid and available QTI identifier for the given type
         * @param {Object|Object[]} model - the JSON QTI model to check the existing IDs
         * @param {String} qtiType - the type of element you want an id for
         * @param {String} [suggestion] - the default pattern body, we use the type otherwise
         * @returns {String} the generated identifier
         */
        getAvailableIdentifier : function getAvailableIdentifier(model, qtiType, suggestion){
            var index = 1;
            var glue =  '-';
            var identifier;
            var current;
            if(_.contains(qtiTypesForUniqueIds, qtiType)){
                current = this.getIdentifiers(model, qtiTypesForUniqueIds);
            } else {
                current = this.getIdentifiersOf(model, qtiType);
            }

            suggestion = suggestion || qtiType;

            do {
                identifier = suggestion +  glue + (index++);
            } while(_.contains(current, identifier.toUpperCase()));

            return identifier;
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
         * @param {Object} modelOverseer - let's you get the data model
         * @returns {Object} the validator
         */
        idAvailableValidator : function idAvailableValidator(modelOverseer){
            var self = this;

            return {
                name : 'testIdAvailable',
                message : __('is already used in the test.'),
                validate : function(value, callback){
                    var counts = {};
                    var key    = value.toUpperCase();
                    var identifiers = self.extractIdentifiers(modelOverseer.getModel(), qtiTypesForUniqueIds);
                    if(typeof callback === 'function'){
                        counts = _.countBy(identifiers, 'identifier');
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

                                //remove rubric blocks if empty
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
            var identifiers = this.extractIdentifiers(model, qtiTypesForUniqueIds);
            var nonUniqueIdentifiers = 0;
            var outcomes = _.indexBy(outcomeHelper.listOutcomes(model));
            var messageDetails = '';

            _(identifiers)
                .countBy('identifier')
                .forEach(function(count, id){
                    if(count > 1){
                        nonUniqueIdentifiers++;
                        messageDetails += '\n' + id.originalIdentifier + ' : ' +
                                          id.type + ' ' +
                                          id.label;
                    }
                });
            if(nonUniqueIdentifiers.length > 1){
                throw new Error(__('The following identifiers are not unique accross the test : %s', messageDetails));
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

