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
     * @param {array} newCategories - all active categories, whether in a checked or indeterminate state
     * @param {array} indeterminate - only categories in an indeterminate state, in case we work on a section level
     * @returns {undefined}
     */
    function setCategories(model, newCategories, indeterminate){

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
        toAdd = _.difference(newCategories, existingSelectedOrIndeterminate);

        //the categories that are no longer in the new list of categories should be removed
        toRemove = _.difference(currentCategories.all, newCategories);

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

    /**
     * Give the list of tao pre-defined test option categories
     * Useful to have this list somewhere in the code.
     *
     * @returns {array}
     */
    function getTaoOptionCategories(){
        return [
            {
                name : 'x-tao-option-endTestWarning',
                description : __('displays a warning before the user finishes the test')
            },
            {
                name : 'x-tao-option-nextPartWarning',
                description : __('displays a warning before the user finishes the part')
            },
            {
                name : 'x-tao-option-nextSectionWarning',
                description : __('displays a next section button that warns the user that they will not be able to return to the section')
            },
            {
                name : 'x-tao-option-nextSection',
                description : __('displays a next section button')
            },
            {
                name : 'x-tao-option-unansweredWarning',
                description : __('displays a warning before the user finishes the part, only if there are unanswered/marked for review items')
            },
            {
                name : 'x-tao-option-noExitTimedSectionWarning',
                description : __('disable the warning automatically displayed upon exiting a timed section')
            },
            {
                name : 'x-tao-option-exit',
                description : __('displays an exit button')
            },
            {
                name : 'x-tao-option-markReview',
                description : __('displays a mark for review button. This option requires requires the x-tao-option-reviewScreen option')
            },
            {
                name : 'x-tao-option-reviewScreen',
                description : __('displays the review screen / navigator')
            },
            {
                name : 'x-tao-option-calculator',
                description : __('enable calculator')
            },
            {
                name : 'x-tao-option-answerMasking',
                description : __('enable answer masking tool')
            },
            {
                name : 'x-tao-option-areaMasking',
                description : __('enable area masking tool')
            },
            {
                name : 'x-tao-option-highlighter',
                description : __('enable highlighter tool')
            },
            {
                name : 'x-tao-option-lineReader',
                description : __('enable line reader tool')
            },
            {
                name : 'x-tao-option-magnifier',
                description : __('enable magnifier tool')
            },
            {
                name : 'x-tao-option-eliminator',
                description : __('enable answer eliminator tool')
            },
            {
                name : 'x-tao-itemusage-informational',
                description : __('describe the item as informational')
            }
        ];
    }

    return {
        isValidSectionModel : isValidSectionModel,
        setCategories : setCategories,
        getCategories : getCategories,
        addCategories : addCategories,
        removeCategories : removeCategories,
        getTaoOptionCategories : getTaoOptionCategories
    };
});
