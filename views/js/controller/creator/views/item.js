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
    'taoQtiTest/controller/creator/templates/index'
], function($, _, templates){
    'use strict';

    var itemTemplate = templates.item;



   /**
     * The ItemView setup items related components
     * @exports taoQtiTest/controller/creator/views/item
     * @param {Function} loadItems - the function used to get items from the server
     * @param {Function} getCategories - the function used to get items' categories
     */
    var itemView =  function(loadItems, getCategories){

        var $panel     = $('.test-creator-items .item-selection');
        var $search    = $('#item-filter');
        var $itemBox   = $('.item-box', $panel);

        var getItems = function getItems(pattern){

            return loadItems(pattern).then(function(items){
                if(!items || !items.length){
                    return update();
                }
                return getCategories(_.pluck(items, 'uri')).then(function(categories){
                    update(_.map(items, function(item){
                        item.categories = _.isArray(categories[item.uri]) ? categories[item.uri] : [];
                        return item;
                    }));
                });
            });
        };

        getItems().then(setUpLiveSearch);

        /**
         * Set up the search behavior: once 3 chars are enters into the field,
         * we load the items that matches the given search pattern.
         * @private
         */
        function setUpLiveSearch (){
            var launched = false;

            var liveSearch = function(){
                var pattern = $search.val();
                if(pattern.length > 1 || pattern.length === 0){
                    if(!launched){
                        launched = true;
                        _.delay(function(){
                            getItems($search.val())
                                .then(function(){
                                    launched = false;
                                })
                                .catch(function(){
                                    launched = false;
                                });
                        }, 300);
                    }
                }
            };

            //trigger the search on keyp and on the magnifer button click
            $search.keyup(liveSearch)
                     .siblings('.ctrl').click(liveSearch);
        }

        /**
         * Update the items list
         * @private
         * @param {Array} items - the new items
         */
        function update (items){
            disableSelection();
            $itemBox.empty().append(itemTemplate(items));
            enableSelection();
        }

        /**
         * Disable the selectable component
         * @private
         * @param {Array} items - the new items
         */
        function disableSelection (){
            if($panel.data('selectable')){
                $panel.selectable('disable');
            }
        }

        /**
         * Enable to select items to be added to sections
         * using the jquery-ui selectable.
         * @private
         */
        function enableSelection (){

            if($panel.data('selectable')){
                $panel.selectable('enable');
            } else {
                $panel.selectable({
                    filter: 'li',
                    selected: function( event, ui ) {
                        $(ui.selected).addClass('selected');
                    },
                    unselected: function( event, ui ) {
                        $(ui.unselected).removeClass('selected');
                    },
                    stop: function(){
                        $(this).trigger('itemselect.creator', $('.selected'));
                    }
                });
            }
        }
    };

    return itemView;
});
