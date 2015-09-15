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
    'core/errorHandler'
], function (_, errorHandler){

    'use strict';

    var _ns = '.sectionCategory';

    function isValidSectionModel(model){
        return (_.isObject(model) && model['qti-type'] === 'assessmentSection' && _.isArray(model.sectionParts));
    }

    function setCategories(model, categories){

        var oldCategories = getCategories(model);
        //the categories that are no longer in the new list of categories should be removed
        var removed = _.without(oldCategories.all, categories);
        //the categories that are not in the old categories collection should be propagated
        var propagated = _.without(categories, oldCategories.all);

        //process the modification
        addCategories(model, propagated);
        removeCategories(model, removed);
    }

    function getCategories(model){

        if(isValidSectionModel(model)){
            var categories = _.map(model.sectionParts, function (itemRef){
                if(itemRef['qti-type'] === 'assessmentItemRef' && _.isArray(itemRef.categories)){
                    return itemRef.categories;
                }
            });
            //array of categories
            var arrays = _.values(categories);
            var union = _.union.apply(null, arrays);
            
            //categories that are common to all itemRef
            var propagated = _.intersection.apply(null, arrays);
            
            //the categories that are only partially covered on the section level : complementary of "propagated"
            var _argsWithout = _.clone(propagated);
            _argsWithout.unshift(union);
            var partial = _.without.apply(null, _argsWithout);
            
            return {
                all : union.sort(),
                propagated : propagated.sort(),
                partial : partial.sort()
            };
        }else{
            errorHandler.throw(_ns, 'invalid tool config format');
        }
    }

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

    function removeCategories(model, categories){
        if(isValidSectionModel(model)){
            _.each(model.sectionParts, function (itemRef){
                if(itemRef['qti-type'] === 'assessmentItemRef' && _.isArray(itemRef.categories)){
                    _.pull(itemRef.categories, [categories]);
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