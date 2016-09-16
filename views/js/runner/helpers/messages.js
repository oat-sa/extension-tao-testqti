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
 * Copyright (c) 2016 (original work) Open Assessment Technologies SA ;
 */
/**
 * @author Jean-Sébastien Conan <jean-sebastien.conan@vesperiagroup.com>
 */
define([
    'jquery',
    'lodash',
    'i18n',
    'taoQtiTest/runner/helpers/map'
], function ($, _, __, mapHelper) {
    'use strict';

    /**
     * List of QTI model cardinalities
     * @type {Object}
     */
    var responseCardinalities = {
        single : 'base',
        multiple : 'list',
        ordered : 'list',
        record : 'record'
    };

    /**
     * Checks if the provided value can be considered as null
     * @param {Object} value
     * @param {String} baseType
     * @param {String} cardinality
     * @returns {boolean}
     */
    function isQtiValueNull(value, baseType, cardinality) {
        var mappedCardinality = responseCardinalities[cardinality];
        if (_.isObject(value) && value[mappedCardinality] && 'undefined' !== typeof value[mappedCardinality][baseType]) {
            value = value[mappedCardinality][baseType];
        }
        return null === value || ('string' === baseType && _.isEmpty(value)) || (cardinality !== 'single' && _.isEmpty(value));
    }

    /**
     * Convert a value to a response object
     * @param {Array} value
     * @param {String} baseType
     * @param {String} cardinality
     * @returns {Object}
     */
    function toResponse(value, baseType, cardinality) {
        var mappedCardinality = responseCardinalities[cardinality];
        var response = {};

        if (mappedCardinality) {
            if (mappedCardinality === 'base') {
                if (!value || value.length === 0) {
                    //return empty response:
                    response.base = null;
                } else {
                    response.base = {};
                    response.base[baseType] = value[0];
                }
            } else {
                response[mappedCardinality] = {};
                response[mappedCardinality][baseType] = value;
            }
        }

        return response;
    }

    /**
     * Tells is the current item has been answered or not
     * The item is considered answered when at least one response has been set to not empty {base : null}
     *
     * @returns {Boolean}
     */
    function isCurrentItemAnswered(runner) {
        var itemRunner = runner.itemRunner;
        var responses = itemRunner && itemRunner.getResponses();
        var count = 0;
        var empty = 0;

        if (itemRunner) {
            _.forEach(itemRunner._item && itemRunner._item.responses, function (declaration) {
                var attributes = declaration.attributes || {};
                var response = responses[attributes.identifier];
                var baseType = attributes.baseType;
                var cardinality = attributes.cardinality;

                count ++;
                if (isQtiValueNull(response, baseType, cardinality)) {
                    if (isQtiValueNull(declaration.defaultValue, baseType, cardinality)) {
                        empty++;
                    }
                } else if (_.isEqual(response, toResponse(declaration.defaultValue, baseType, cardinality))) {
                    empty++;
                }
            });
        }

        return count !== 0 && empty !== count;
    }

    /**
     * Completes an exit message
     * @param {String} message
     * @param {Object} runner
     * @returns {String} Returns the message text
     */
    function getExitMessage(message, scope, runner) {
        var map = runner.getTestMap();
        var context = runner.getTestContext();
        var stats = mapHelper.getScopeStats(map, context.itemPosition, scope);
        var unansweredCount = stats && (stats.total - stats.answered);
        var flaggedCount = stats && stats.flagged;
        var itemsCountMessage = '';
        var isItemCurrentlyAnswered;

        if (unansweredCount){
            isItemCurrentlyAnswered = isCurrentItemAnswered(runner);

            if (!isItemCurrentlyAnswered && context.itemAnswered) {
                unansweredCount++;
            }

            if (isItemCurrentlyAnswered && !context.itemAnswered) {
                unansweredCount--;
            }
        }


        if (flaggedCount && unansweredCount) {
            itemsCountMessage = __('You have %s unanswered question(s) and have %s item(s) marked for review.',
                unansweredCount.toString(),
                flaggedCount.toString()
            );
        } else {
            if (flaggedCount) {
                itemsCountMessage = __('You have %s item(s) marked for review.', flaggedCount.toString());
            }

            if (unansweredCount) {
                itemsCountMessage = __('You have %s unanswered question(s).', unansweredCount.toString());
            }
        }

        return (itemsCountMessage + ' ' + message).trim();
    }

    return {
        getExitMessage: getExitMessage
    };
});
