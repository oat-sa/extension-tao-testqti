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
     * @param {array} selected - all categories active for the whole section
     * @param {array} partial - only categories in an indeterminate state
     * @returns {undefined}
     */
    function setCategories(model, selected, partial){

        var toRemove,
            toAdd,
            currentCategories = getCategories(model);

        partial = partial || [];

        //the categories that are no longer in the new list of categories should be removed
        toRemove = _.difference(currentCategories.all, selected.concat(partial));

        //the categories that are not in the current categories collection should be added to the children
        toAdd = _.difference(selected, currentCategories.propagated);

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
