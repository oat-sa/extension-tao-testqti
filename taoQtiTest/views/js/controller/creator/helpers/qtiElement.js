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
    'taoQtiTest/controller/creator/helpers/outcomeValidator'
], function (_, outcomeValidator) {
    'use strict';

    var qtiElementHelper = {
        /**
         * Creates a QTI element
         * @param {String} type - The QTI type of the element to create
         * @param {String|Object} [identifier] - An optional identifier, or a list of properties
         * @param {Object} [properties] - A list of additional properties
         * @returns {Object}
         * @throws {TypeError} if the type or the identifier is not valid
         */
        create: function create(type, identifier, properties) {
            var element = {
                'qti-type': type
            };

            if (!outcomeValidator.validateIdentifier(type)) {
                throw new TypeError('You must provide a valid QTI type!');
            }

            if (_.isPlainObject(identifier)) {
                properties = identifier;
                identifier = null;
            }

            if (identifier) {
                if (!outcomeValidator.validateIdentifier(identifier)) {
                    throw new TypeError('You must provide a valid identifier!');
                }
                element.identifier = identifier;
            }

            return _.assign(element, properties || {});
        },

        /**
         * Finds a QTI element in a collection, by its type.
         * The collection may also be a single object.
         * @param {Array|Object} collection
         * @param {Array|String} type
         * @returns {Object}
         */
        find: function find(collection, type) {
            var found = null;
            var types = forceArray(type);

            function checkType(qtiElement) {
                if (types.indexOf(qtiElement['qti-type']) >= 0) {
                    found = qtiElement;
                    return false;
                }
            }

            if (_.isArray(collection)) {
                _.forEach(collection, checkType);
            } else if (collection) {
                checkType(collection);
            }

            return found;
        },

        /**
         * Finds an element from a tree.
         * The path to the element is based on QTI types.
         * @param {Object} tree - The root of the tree from which get the property
         * @param {String|String[]} path - The path to the element, with QTI types separated by dot, like: "setOutcomeValue.gte.baseValue"
         * @param {String|String[]} nodeName - The name of the nodes that may contain subtrees
         * @returns {*}
         */
        lookupElement: function lookupElement(tree, path, nodeName) {
            var steps = _.isArray(path) ? path : path.split('.');
            var nodeNames = forceArray(nodeName);
            var len = steps.length;
            var i = 0;
            var key;

            while (tree && i < len) {
                tree = qtiElementHelper.find(tree, steps[i++]);
                if (tree && i < len) {
                    key = _.find(nodeNames, _.partial(_.has, tree));
                    tree = key && tree[key];
                }
            }

            return tree || null;
        },

        /**
         * Finds a property from a tree.
         * The path to the property is based on QTI types.
         * @param {Object} tree - The root of the tree from which get the property
         * @param {String|String[]} path - The path to the property, with QTI types separated by dot, like: "setOutcomeValue.gte.baseValue.value"
         * @param {String|String[]} nodeName - The name of the nodes that may contain subtrees
         * @returns {*}
         */
        lookupProperty: function lookupProperty(tree, path, nodeName) {
            var result = null;
            var steps = _.isArray(path) ? path : path.split('.');
            var propertyName = steps.pop();
            var element = qtiElementHelper.lookupElement(tree, steps, nodeName);

            if (element && element[propertyName]) {
                result = element[propertyName];
            }

            return result;
        }
    };

    /**
     * Ensures a value is an array
     * @param {*} value
     * @returns {Array}
     */
    function forceArray(value) {
        if (!value) {
            value = [];
        }
        if (!_.isArray(value)) {
            value = [value];
        }
        return value;
    }

    return qtiElementHelper;
});
