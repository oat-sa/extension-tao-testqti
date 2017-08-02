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
    'lodash',
    'taoQtiTest/provider/testItems',
    'ui/resource/selector',
], function($, _, testItemProviderFactory, resourceSelectorFactory){
    'use strict';


    var testItemProvider = testItemProviderFactory();

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
                type : 'items',
                classUri : 'http://www.tao.lu/Ontologies/TAOItem.rdf#Item',
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
                .catch(function(err){

                    //FIXME use logger instead
                    console.error(err);
                });

            })
            .on('change', function(values){

                $panel.trigger('itemselect.creator', [values]);

            });


        }).catch(function(err){
            console.error(err);
        });

    };

    return itemView;
});
