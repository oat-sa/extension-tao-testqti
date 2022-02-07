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
 * Copyright (c) 2022 (original work) Open Assessment Technologies SA
 *
 */
define([
    'ui/validator/validators',
    'jquery',
    'lodash',
    'i18n',
    'taoQtiTest/controller/creator/helpers/outcome',
    'taoQtiTest/controller/creator/helpers/qtiElement',
    'taoQtiItem/qtiCreator/widgets/helpers/qtiIdentifier'
], function (validators, $, _, __, outcomeHelper, qtiElementHelper, qtiIdentifier) {
    'use strict';

    const qtiIdPattern = qtiIdentifier.pattern;
    //Identifiers must be unique across
    //those QTI types
    const qtiTypesForUniqueIds = ['assessmentTest', 'testPart', 'assessmentSection', 'assessmentItemRef'];

    /**
     * Gives you a validator that check QTI id format
     * @returns {Object} the validator
     */
    function idFormatValidator() {
        return {
            name: 'idFormat',
            message: qtiIdentifier.invalidQtiIdMessage,
            validate: function (value, callback) {
                if (typeof callback === 'function') {
                    callback(qtiIdPattern.test(value));
                }
            }
        };
    }

    /**
     * Gives you a validator that check QTI id format of the test (it is different from the others...)
     * @returns {Object} the validator
     */
    function testidFormatValidator() {
        const qtiTestIdPattern = /^\S+$/;
        return {
            name: 'testIdFormat',
            message: __('is not a valid identifier (everything except spaces)'),
            validate: function (value, callback) {
                if (typeof callback === 'function') {
                    callback(qtiTestIdPattern.test(value));
                }
            }
        };
    }

    /**
     * Gives you a validator that check if a QTI id is available
     * @param {Object} modelOverseer - let's you get the data model
     * @returns {Object} the validator
     */
    function idAvailableValidator(modelOverseer) {
        return {
            name: 'testIdAvailable',
            message: __('is already used in the test.'),
            validate: function (value, callback, options) {
                if (options.identifier) {
                    const key = value.toUpperCase();
                    const identifiers = extractIdentifiers(modelOverseer.getModel(), qtiTypesForUniqueIds);
                    const $idInUI = $(`#props-${options.identifier}:contains("${value}")`);
                    if (typeof callback === 'function') {
                        const counts = _.countBy(identifiers, 'identifier');
                        //the identifier list contains itself after change on input
                        //on keyup $idInUI.length === 0
                        //on change and blur $idInUI.length === 1 and text equal value
                        callback(
                            typeof counts[key] === 'undefined' ||
                            $idInUI.length === 1 && $idInUI.text() === value && counts[key] === 1
                        );
                    }
                } else {
                    throw new Error('missing required option "identifier"');
                }
            }
        };
    }

    /**
     * Gives you a validator that check if a QTI id is available
     * @param {Object} modelOverseer - let's you get the data model
     */
    function registerValidators(modelOverseer) {
        //register validators
        validators.register('idFormat', idFormatValidator());
        validators.register('testIdFormat', testidFormatValidator());
        validators.register('testIdAvailable', idAvailableValidator(modelOverseer), true);
    }

    /**
     * Validates the provided model
     * @param {Object} model
     * @throws {Error} if the model is not valid
     */
    function validateModel(model) {
        const identifiers = extractIdentifiers(model, qtiTypesForUniqueIds);
        let nonUniqueIdentifiers = 0;
        const outcomes = _.indexBy(outcomeHelper.listOutcomes(model));
        let messageDetails = '';

        _(identifiers)
            .countBy('identifier')
            .forEach(function (count, id) {
                if (count > 1) {
                    nonUniqueIdentifiers++;
                    messageDetails += `\n${id.originalIdentifier} : ${id.type} ${id.label}`;
                }
            });
        if (nonUniqueIdentifiers.length > 1) {
            throw new Error(__('The following identifiers are not unique accross the test : %s', messageDetails));
        }

        _.forEach(model.testParts, function (testPart) {
            _.forEach(testPart.assessmentSections, function (assessmentSection) {
                _.forEach(assessmentSection.rubricBlocks, function (rubricBlock) {
                    const feedbackBlock = qtiElementHelper.lookupElement(
                        rubricBlock,
                        'rubricBlock.div.feedbackBlock',
                        'content'
                    );
                    if (feedbackBlock && !outcomes[feedbackBlock.outcomeIdentifier]) {
                        throw new Error(
                            __(
                                'The outcome "%s" does not exist, but it is referenced by a feedback block!',
                                feedbackBlock.outcomeIdentifier
                            )
                        );
                    }
                });
            });
        });
    }
    /**
     * Extracts the identifiers from a QTI model
     * @param {Object|Object[]} model - the JSON QTI model
     * @param {String[]} [includesOnlyTypes] - list of qti-type to include, exclusively
     * @param {String[]} [excludeTypes] - list of qti-type to exclude, it excludes the children too
     * @returns {Object[]} a collection of identifiers (with some meta), if the id is not unique it will appear multiple times, as extracted.
     */
    function extractIdentifiers(model, includesOnlyTypes, excludeTypes) {
        const identifiers = [];

        const extract = function extract(element) {
            if (element && _.has(element, 'identifier') && _.isString(element.identifier)) {
                if (!includesOnlyTypes.length || _.contains(includesOnlyTypes, element['qti-type'])) {
                    identifiers.push({
                        identifier: element.identifier.toUpperCase(),
                        originalIdentifier: element.identifier,
                        type: element['qti-type'],
                        label: element.title || element.identifier
                    });
                }
            }
            _.forEach(element, function (subElement) {
                if (_.isPlainObject(subElement) || _.isArray(subElement)) {
                    if (!excludeTypes.length || !_.contains(excludeTypes, subElement['qti-type'])) {
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
    }
    return {
        qtiTypesForUniqueIds,
        extractIdentifiers,
        registerValidators,
        validateModel
    };
});
