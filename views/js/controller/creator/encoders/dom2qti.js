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
 * Copyright (c) 2014 (original work) Open Assessment Technologies SA (under the project TAO-PRODUCT);
 */

/**
 * @author Bertrand Chevrier <bertrand@taotesting.com>
 */
define([
    'jquery',
    'lodash',
    'taoQtiTest/controller/creator/helpers/qtiElement'
], function ($, _, qtiElementHelper) {
    'use strict';

    /**
     * A mapping of QTI-XML node names in order to keep the camel case form
     * @type {Object}
     */
    var normalizedNodes = {
        feedbackblock: 'feedbackBlock',
        outcomeidentifier: 'outcomeIdentifier',
        showhide: 'showHide'
    };

    /**
     * Get the list of objects attributes to encode
     * @param {Object} object
     * @returns {Array}
     */
    function getAttributes(object) {
        return _.omit(object, [
            'qti-type',
            'content',
            'xmlBase',
            'lang',
            'label'
        ]);
    }

    /**
     * Encode object's properties to xml/html string attributes
     * @param {Object} attributes
     * @returns {String}
     */
    function attrToStr(attributes) {
        return _.reduce(attributes, function (acc, value, key) {
            if (_.isNumber(value) || (_.isString(value) && !_.isEmpty(value))) {
                return acc + ' ' + key + '="' + value + '" ';
            }
            return acc;
        }, '');
    }

    /**
     * Ensures the nodeName has a normalized form:
     * - standard HTML tags are in lower case
     * - QTI-XML tags are in the right form
     * @param {String} nodeName
     * @returns {String}
     */
    function normalizeNodeName(nodeName) {
        var normalized = nodeName.toLocaleLowerCase();
        return normalizedNodes[normalized] || normalized;
    }

    /**
     * This encoder is used to transform DOM to JSON QTI and JSON QTI to DOM.
     * It works now for the rubricBlocks components.
     * @exports creator/encoders/dom2qti
     */
    return {

        /**
         * Encode an object to a dom string
         * @param {Object} modelValue
         * @returns {String}
         */
        encode: function (modelValue) {
            var self = this;

            if (_.isArray(modelValue)) {
                return _.reduce(modelValue, function (result, value) {
                    return result + self.encode(value);
                }, '');
            } else if (_.isObject(modelValue) && modelValue['qti-type']) {
                if (modelValue['qti-type'] === 'textRun') {
                    return modelValue.content;
                }
                var startTag = '<' + modelValue['qti-type'] + attrToStr(getAttributes(modelValue));
                if (modelValue.content) {
                    return startTag + '>' + self.encode(modelValue.content) + '</' + modelValue['qti-type'] + '>';
                } else {
                    return startTag + '/>';
                }
            }
            return '' + modelValue;
        },

        /**
         * Decode a string that represents a DOM to a QTI formatted object
         * @param {String} nodeValue
         * @returns {Array}
         */
        decode: function (nodeValue) {
            var self = this;
            var $nodeValue = (nodeValue instanceof $) ? nodeValue : $(nodeValue);
            var result = [];

            _.forEach($nodeValue, function (elt) {
                var object;
                if (elt.nodeType === 3) {
                    if (!_.isEmpty($.trim(elt.nodeValue))) {
                        result.push(qtiElementHelper.create('textRun', {
                            'content': elt.nodeValue,
                            'xmlBase': ''
                        }));
                    }
                } else if (elt.nodeType === 1) {
                    object = _.merge(qtiElementHelper.create(normalizeNodeName(elt.nodeName), {
                        'id': '',
                        'class': '',
                        'xmlBase': '',
                        'lang': '',
                        'label': ''
                    }),
                    _.transform(elt.attributes, function (acc, value) {
                        if (value.nodeName) {
                            acc[normalizeNodeName(value.nodeName)] = value.nodeValue;
                        }
                    }));
                    if (elt.childNodes.length > 0) {
                        object.content = self.decode(elt.childNodes);
                    }
                    result.push(object);
                }
            });
            return result;
        }
    };
});
