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
 * Copyright (c) 2022 (original work) Open Assessment Technologies SA;
 */
define([
    'lodash',
    'i18n',
    'taoQtiTest/controller/creator/helpers/sectionCategory',
    'taoQtiTest/controller/creator/helpers/testModel',
    'core/errorHandler'
], function(_, __, sectionCategory, testModelHelper, errorHandler) {
    'use strict';

    const _ns = '.testPartCategory';

    /**
     * Check if the given object is a valid testPart model object
     *
     * @param {object} model
     * @returns {boolean}
     */
    function isValidTestPartModel(model) {
        return _.isObject(model)
            && model['qti-type'] === 'testPart'
            && _.isArray(model.assessmentSections)
            && model.assessmentSections.every(section => sectionCategory.isValidSectionModel(section));
    }

    /**
     * Set an array of categories to the testPart model (affects the children itemRef, and after propagation, the section models)
     *
     * @param {object} model
     * @param {array} selected - all categories active for the whole testPart
     * @param {array} partial - only categories in an indeterminate state
     * @returns {undefined}
     */
    function setCategories(model, selected, partial = []) {

        const currentCategories = getCategories(model);

        // partial = partial || [];

        //the categories that are no longer in the new list of categories should be removed
        const toRemove = _.difference(currentCategories.all, selected.concat(partial));

        //the categories that are not in the current categories collection should be added to the children
        const toAdd = _.difference(selected, currentCategories.propagated);

        model.categories = _.difference(model.categories, toRemove);
        model.categories = model.categories.concat(toAdd);

        //process the modification
        addCategories(model, toAdd);
        removeCategories(model, toRemove);
    }

    /**
     * @typedef {object} CategoriesSummary
     * @property {string[]} all - array of all categories of itemRef descendents
     * @property {string[]} propagated - array of categories propagated to every itemRef descendent
     * @property {string[]} partial - array of categories propagated to a partial set of itemRef descendents
     */

    /**
     * Get the categories assigned to the testPart model, inferred by its internal itemRefs
     *
     * @param {object} model
     * @returns {CategoriesSummary}
     */
    function getCategories(model) {
        if (!isValidTestPartModel(model)) {
            return errorHandler.throw(_ns, 'invalid tool config format');
        }

        let itemCount = 0;

        /**
         * List of lists of categories of each itemRef in the testPart
         * @type {string[][]}
         */
        const itemRefCategories = [];
        testModelHelper.eachItemInTestPart(model, itemRef => {
            if (++itemCount && _.isArray(itemRef.categories)) {
                itemRefCategories.push(_.compact(itemRef.categories));
            }
        });

        if (!itemCount) {
            return createCategories(model.categories, model.categories);
        }

        //all item categories
        const union = _.union.apply(null, itemRefCategories);
        //categories that are common to all itemRefs
        const propagated = _.intersection.apply(null, itemRefCategories);
        //the categories that are only partially covered on the section level : complementary of "propagated"
        const partial = _.difference(union, propagated);

        return createCategories(union, propagated, partial);
    }

    /**
     * Add an array of categories to a testPart model (affects the children itemRef, and after propagation, the section models)
     *
     * @param {object} model
     * @param {array} categories
     * @returns {undefined}
     */
    function addCategories(model, categories) {
        if (isValidTestPartModel(model)) {
            testModelHelper.eachItemInTestPart(model, itemRef => {
                if (!_.isArray(itemRef.categories)) {
                    itemRef.categories = [];
                }
                itemRef.categories = _.union(itemRef.categories, categories);
            });
        } else {
            errorHandler.throw(_ns, 'invalid tool config format');
        }
    }

    /**
     * Remove an array of categories from a testPart model (affects the children itemRef, and after propagation, the section models)
     *
     * @param {object} model
     * @param {array} categories
     * @returns {undefined}
     */
    function removeCategories(model, categories) {
        if (isValidTestPartModel(model)) {
            testModelHelper.eachItemInTestPart(model, itemRef => {
                if (_.isArray(itemRef.categories)) {
                    itemRef.categories = _.difference(itemRef.categories, categories);
                }
            });
        } else {
            errorHandler.throw(_ns, 'invalid tool config format');
        }
    }

    /**
     * Assigns input category arrays to output object, while sorting each one
     * @param {string[]} all
     * @param {string[]} propagated
     * @param {string[]} partial
     * @returns {CategoriesSummary}
     */
    function createCategories(all = [], propagated = [], partial = []) {
        return {
            all: all,
            propagated: propagated,
            partial: partial
        };
    }

    return {
        isValidTestPartModel : isValidTestPartModel,
        setCategories : setCategories,
        getCategories : getCategories,
        addCategories : addCategories,
        removeCategories : removeCategories
    };
});
