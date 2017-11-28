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
    'i18n',
    'core/logger',
    'taoQtiTest/provider/testItems',
    'ui/resource/selector',
    'ui/feedback'
], function($, __, loggerFactory, testItemProviderFactory, resourceSelector, feedback){
    'use strict';

   /**
    * Create a dedicated logger
    */
    var logger = loggerFactory('taoQtiTest/creator/views/item');

    /**
     * Let's you access the data
     */
    var testItemProvider = testItemProviderFactory();

    /**
     * Handles errors
     * @param {Error} err
     */
    var onError = function onError(err){
        logger.error(err);
        feedback.error(err.message || __('An error occured while retrieving items'));
    };

   /**
     * The ItemView setup items related components
     * @exports taoQtiTest/controller/creator/views/item
     * @param {jQueryElement} $container - where to append the view
     */
    return function itemView($container){

        var selectorConfig = {
            type : __('items'),
            selectionMode : resourceSelector.selectionModes.multiple
        };

        //load the classes hierarchy
        testItemProvider.getItemClasses()
            .then(function(classes){
                selectorConfig.classes = classes;
                selectorConfig.classUri = classes[0].uri;
            })
            .then(function(){
                //load the class properties
                return testItemProvider.getItemClassProperties(selectorConfig.classUri);
            })
            .then(function(filters){
                //set the filters from the properties
                selectorConfig.filters = filters;
            })
            .then(function(){
                //set up the resource selector
                resourceSelector($container, selectorConfig)
                    .on('render', function(){
                        var self = this;
                        $container.on('itemselected.creator', function(){
                            self.clearSelection();
                        });
                    })
                    .on('query', function(params){
                        var self = this;

                        //ask the server the item from the component query
                        testItemProvider.getItems(params)
                            .then(function(items){
                                //and update the item list
                                self.update(items, params);
                            })
                            .catch(onError);
                    })
                    .on('classchange', function(classUri){
                        var self = this;

                        //by changing the class we need to change the
                        //properties filters
                        testItemProvider
                            .getItemClassProperties(classUri)
                            .then(function(filters){
                                self.updateFilters(filters);
                            })
                            .catch(onError);
                    })
                    .on('change', function(values){

                        /**
                         * We've got a selection, triggered on the view container
                         *
                         * TODO replace jquery events by the eventifier
                         *
                         * @event jQuery#itemselect.creator
                         * @param {Object[]} values - the selection
                         */
                        $container.trigger('itemselect.creator', [values]);
                    });
            })
            .catch(onError);
    };
});
