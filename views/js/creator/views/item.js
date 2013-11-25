/**
 * @author Bertrand Chevrier <bertrand@taotesting.com>
 */
define(['jquery', 'handlebars'], function($, Handlebars){
    'use strict';
   
   /**
     * The ItemView setup items related components
     * @exports creator/views/item
     */
   var ItemView = {
       
        //compile the item template
        _template : Handlebars.compile($('#item-template').html()),
    
        /**
         * View entry point
         * @public
         * @param {Object} options 
         * @param {Function} options.loadItems - the function used to get items from the server
         */
        setUp: function(options){
            var self = this;
            
            this._$searchField = $('#items .search');
            this._$itemContainer = $('#items .listbox');
            
            this.loadItems = options.loadItems;
            
            if(typeof this.loadItems === 'function'){
                //search pattern is empty the 1st time, give it undefined
                this.loadItems(undefined, function(items){
                    self.update(items);
                    self.setUpLiveSearch();
                });
            }
        },
        
        /**
         * Set up the search behavior: once 3 chars are enters into the field,
         * we load the items that matches the given search pattern.
         * @public
         */
        setUpLiveSearch: function(){
            var self = this;
            var timeout;
            
            var liveSearch = function(){
                var pattern = self._$searchField.val();
                if(pattern.length > 3 || pattern.length === 0){
                    clearTimeout(timeout);
                    timeout = setTimeout(function(){
                        self.loadItems(pattern, function(items){
                            self.update(items);
                        });
                    }, 300);
                }
            };
            
            //trigger the search on keyp and on the magnifer button click
            this._$searchField.keyup(liveSearch)
                     .siblings('.ctrl').click(liveSearch);
        },
        
        /**
         * Update the items list
         * @public
         * @param {Array} items - the new items
         */
        update : function(items){
            this._$itemContainer.empty().append(this._template(items));
            this._enableDragging();
        },
    
    
        /**
         * Enable to drag the items to sections,
         * using the jquery-ui draggable.
         * @private
         */
        _enableDragging : function (){
            this._$itemContainer.find('li').addClass('selectable').draggable({
                helper : 'clone',
                scroll: false,
                revert: 'invalid',
                opacity: 0.8,
                connectToSortable: '.section ul',
                zIndex: 100000,
                start : function(){
                    $('.section ul').addClass('active');
                }, 
                stop: function(){
                    $('.section ul').removeClass('active');
                }
            });
        }
   };
    
    return ItemView;
});


