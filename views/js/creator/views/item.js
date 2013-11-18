define(['jquery', 'handlebars'], function($, Handlebars){
    'use strict';
   
   var ItemView = {
       
        _template : Handlebars.compile($('#item-template').html()),
    
        setUp: function(options){
            var self = this;
            
            this._$searchField = $('#items .search');
            this._$itemContainer = $('#items .listbox');
            
            this.loadItems = options.loadItems;
            
            if(typeof this.loadItems === 'function'){
                this.loadItems(undefined, function(items){
                    self.update(items);
                    self.setUpLiveSearch();
                });
            }
        },
        
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
            
             this._$searchField.keyup(liveSearch)
                     .siblings('.ctrl').click(liveSearch);
        },
        
        update : function(items){
            this._$itemContainer.empty().append(this._template(items));
            this._enableDragging();
        },
    
    
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


