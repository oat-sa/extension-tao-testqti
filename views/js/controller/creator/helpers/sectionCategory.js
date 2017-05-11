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
 * Copyright (c) 2015 (original work) Open Assessment Technologies SA;
 */
define([
    'lodash',
    'i18n',
    'core/errorHandler'
], function (_, __, errorHandler){

    'use strict';

    var _ns = '.sectionCategory';

    /**
     * Check if the given object is a valid assessmentSection model object
     *
     * @param {object} model
     * @returns {boolean}
     */
    function isValidSectionModel(model){
        return (_.isObject(model) && model['qti-type'] === 'assessmentSection' && _.isArray(model.sectionParts));
    }

    /**
     * Set an array of categories to the section model (affect the childen itemRef)
     *
     * @param {object} model
     * @param {array} allCategories - all active categories, whether in a checked or indeterminate state
     * @param {array} indeterminate - only categories in an indeterminate state, in case we work on a section level
     * @returns {undefined}
     */
    function setCategories(model, allCategories, indeterminate){

        var toRemove,
            toAdd,
            currentCategories = getCategories(model),
            existingSelectedOrIndeterminate;

        indeterminate = indeterminate || [];

        // if we have some indeterminate categories declared, then we need to do some extra math
        // before we can determine what are the categories to add
        // Categories to add are categories which are in the new list and that:
        // - where not previously checked (propagated)
        // - are not in the current indeterminate state
        existingSelectedOrIndeterminate = (indeterminate.length)
            ? currentCategories.propagated.concat(indeterminate)
            : currentCategories.all;
        toAdd = _.difference(allCategories, existingSelectedOrIndeterminate);

        //the categories that are no longer in the new list of categories should be removed
        toRemove = _.difference(currentCategories.all, allCategories);

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
    function getCategories(model){
        var categories,
            arrays,
            union,
            propagated,
            partial;

        if(isValidSectionModel(model)){
            categories = _.map(model.sectionParts, function (itemRef){
                if(itemRef['qti-type'] === 'assessmentItemRef' && _.isArray(itemRef.categories)){
                    return _.compact(itemRef.categories);
                }
            });
            //array of categories
            arrays = _.values(categories);
            union = _.union.apply(null, arrays);

            //categories that are common to all itemRef
            propagated = _.intersection.apply(null, arrays);

            //the categories that are only partially covered on the section level : complementary of "propagated"
            partial = _.difference(union, propagated);

            return {
                all : union.sort(),
                propagated : propagated.sort(),
                partial : partial.sort()
            };
        }else{
            errorHandler.throw(_ns, 'invalid tool config format');
        }
    }

    /**
     * Add an array of categories to a section model (affect the childen itemRef)
     *
     * @param {object} model
     * @param {array} categories
     * @returns {undefined}
     */
    function addCategories(model, categories){
        if(isValidSectionModel(model)){
            _.each(model.sectionParts, function (itemRef){
                if(itemRef['qti-type'] === 'assessmentItemRef'){
                    if(!_.isArray(itemRef.categories)){
                        itemRef.categories = [];
                    }
                    itemRef.categories = _.union(itemRef.categories, categories);
                }
            });
        }else{
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
    function removeCategories(model, categories){
        if(isValidSectionModel(model)){
            _.each(model.sectionParts, function (itemRef){
                if(itemRef['qti-type'] === 'assessmentItemRef' && _.isArray(itemRef.categories)){
                    itemRef.categories = _.difference(itemRef.categories, categories);
                }
            });
        }else{
            errorHandler.throw(_ns, 'invalid tool config format');
        }
    }

    return {
        isValidSectionModel : isValidSectionModel,
        setCategories : setCategories,
        getCategories : getCategories,
        addCategories : addCategories,
        removeCategories : removeCategories
    };
});
