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
 * Copyright (c) 2015-2023 (original work) Open Assessment Technologies SA;
 */
define(['lodash', 'i18n', 'core/errorHandler'], function (_, __, errorHandler) {
    'use strict';

    const _ns = '.sectionCategory';

    /**
     * Check if the given object is a valid assessmentSection model object
     *
     * @param {object} model
     * @returns {boolean}
     */
    function isValidSectionModel(model) {
        return _.isObject(model) && model['qti-type'] === 'assessmentSection' && _.isArray(model.sectionParts);
    }

    /**
     * Set an array of categories to the section model (affect the childen itemRef)
     *
     * @param {object} model
     * @param {array} selected - all categories active for the whole section
     * @param {array} partial - only categories in an indeterminate state
     * @returns {undefined}
     */
    function setCategories(model, selected, partial) {
        const currentCategories = getCategories(model);

        partial = partial || [];

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
     * Get the categories assign to the section model, infered by its interal itemRefs
     *
     * @param {object} model
     * @returns {object}
     */
    function getCategories(model) {
        let categories= [],
            arrays,
            union,
            propagated,
            partial,
            itemCount = 0;

        if (!isValidSectionModel(model)) {
            return errorHandler.throw(_ns, 'invalid tool config format');
        }

        const getCategoriesRecursive = sectionModel => _.forEach(sectionModel.sectionParts, function (sectionPart) {
            if (
                sectionPart['qti-type'] === 'assessmentItemRef' &&
                ++itemCount &&
                _.isArray(sectionPart.categories)
            ) {
                categories.push(_.compact(sectionPart.categories));
            }
            if (sectionPart['qti-type'] === 'assessmentSection' && _.isArray(sectionPart.sectionParts)) {
                getCategoriesRecursive(sectionPart);
            }
        });

        getCategoriesRecursive(model);

        if (!itemCount) {
            return createCategories(model.categories, model.categories);
        }

        //array of categories
        arrays = _.values(categories);
        union = _.union.apply(null, arrays);

        //categories that are common to all itemRef
        propagated = _.intersection.apply(null, arrays);

        //the categories that are only partially covered on the section level : complementary of "propagated"
        partial = _.difference(union, propagated);

        return createCategories(union, propagated, partial);
    }

    /**
     * Add an array of categories to a section model (affect the childen itemRef)
     *
     * @param {object} model
     * @param {array} categories
     * @returns {undefined}
     */
    function addCategories(model, categories) {
        if (isValidSectionModel(model)) {
            _.forEach(model.sectionParts, function (sectionPart) {
                if (sectionPart['qti-type'] === 'assessmentItemRef') {
                    if (!_.isArray(sectionPart.categories)) {
                        sectionPart.categories = [];
                    }
                    sectionPart.categories = _.union(sectionPart.categories, categories);
                }
                if (sectionPart['qti-type'] === 'assessmentSection') {
                    addCategories(sectionPart, categories);
                }
            });
        } else {
            errorHandler.throw(_ns, 'invalid tool config format');
        }
    }

    /**
     * Remove an array of categories from a section model (affect the childen itemRef)
     *
     * @param {object} model
     * @param {array} categories
     * @returns {undefined}
     */
    function removeCategories(model, categories) {
        if (isValidSectionModel(model)) {
            _.forEach(model.sectionParts, function (sectionPart) {
                if (sectionPart['qti-type'] === 'assessmentItemRef' && _.isArray(sectionPart.categories)) {
                    sectionPart.categories = _.difference(sectionPart.categories, categories);
                }
                if (sectionPart['qti-type'] === 'assessmentSection') {
                    removeCategories(sectionPart, categories);
                }
            });
        } else {
            errorHandler.throw(_ns, 'invalid tool config format');
        }
    }

    function createCategories(all = [], propagated = [], partial = []) {
        return _.mapValues(
            {
                all: all,
                propagated: propagated,
                partial: partial
            },
            function (categories) {
                return categories.sort();
            }
        );
    }

    return {
        isValidSectionModel: isValidSectionModel,
        setCategories: setCategories,
        getCategories: getCategories,
        addCategories: addCategories,
        removeCategories: removeCategories
    };
});
