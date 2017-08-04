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
], function($, __, loggerFactory, testItemProviderFactory, resourceSelectorFactory, feedback){
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
     * @param {Function} loadItems - the function used to get items from the server
     * @param {Function} getCategories - the function used to get items' categories
     */
    var itemView =  function(){

        var $panel  = $('.test-creator-items .item-selection');

        testItemProvider.getItemClasses().then(function(classes){
            resourceSelectorFactory($panel, {
                type : __('items'),
                classUri : classes[0].uri,
                classes : classes
            })
            .on('render', function(){
                var self = this;
                $panel.on('itemselected.creator', function(){
                    self.clearSelection();
                });
            })
            .on('query', function(params){
                var self = this;

                testItemProvider.getItems(params).then(function(items){
                    self.update(items, params);
                })
                .catch(onError);
            })
            .on('change', function(values){
                $panel.trigger('itemselect.creator', [values]);
            });
        })
        .catch(onError);
    };

    return itemView;
});
