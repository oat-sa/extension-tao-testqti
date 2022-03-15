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
    'core/errorHandler'
], function(_, __, sectionCategory, errorHandler) {
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
     * Get the categories assigned to the testPart model, inferred by its internal itemRefs
     *
     * @param {object} model
     * @returns {object}
     */
    function getCategories(model) {
        if (!isValidTestPartModel(model)) {
            return errorHandler.throw(_ns, 'invalid tool config format');
        }

        let itemCount = 0;

        // Should be: [[i1c], [i2c], [i3c], ...]
        const categories = _.flatten(
            _.map(model.assessmentSections, function(section) {
                return _.map(section.sectionParts, function(itemRef) {
                    if (itemRef['qti-type'] === 'assessmentItemRef' && ++itemCount && _.isArray(itemRef.categories)) {
                        return _.compact(itemRef.categories); // [i1c]
                    }
                });
            }),
            true // flatten depth: 1
        );

        if (!itemCount) {
            return createCategories(model.categories, model.categories);
        }

        //array of categories
        const arrays = _.values(categories);
        const union = _.union.apply(null, arrays);

        //categories that are common to all itemRef
        const propagated = _.intersection.apply(null, arrays);

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
            _.each(model.assessmentSections, function(section) {
                _.each(section.sectionParts, function(itemRef) {
                    if (itemRef['qti-type'] === 'assessmentItemRef') {
                        if (!_.isArray(itemRef.categories)) {
                            itemRef.categories = [];
                        }
                        itemRef.categories = _.union(itemRef.categories, categories);
                    }
                });
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
            _.each(model.assessmentSections, function(section) {
                _.each(section.sectionParts, function(itemRef) {
                    if (itemRef['qti-type'] === 'assessmentItemRef' && _.isArray(itemRef.categories)) {
                        itemRef.categories = _.difference(itemRef.categories, categories);
                    }
                });
            });
        } else {
            errorHandler.throw(_ns, 'invalid tool config format');
        }
    }

    function createCategories(all = [], propagated = [], partial = []) {
        return _.mapValues({
            all: all,
            propagated: propagated,
            partial: partial
        }, function(categories) {
            return categories.sort();
        });
    }

    return {
        isValidTestPartModel : isValidTestPartModel,
        setCategories : setCategories,
        getCategories : getCategories,
        addCategories : addCategories,
        removeCategories : removeCategories
    };
});
