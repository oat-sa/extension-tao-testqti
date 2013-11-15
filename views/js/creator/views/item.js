define(['jquery', 'handlebars'], function($, Handlebars){
    'use strict';
   
    var template = Handlebars.compile($('#item-template').html());
    var $searchField = $('#items .search');
    var $itemContainer = $('#items .listbox');
    
    function enableDragging(){
        $itemContainer.find('li').addClass('selectable').draggable({
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
    
    return {
        setUp: function(options){
            var self = this;
            this.loadItems = options.loadItems;
            
            this.loadItems(undefined, function(items){
                self.update(items);
                self.setUpLiveSearch();
            });
        },
        
        setUpLiveSearch: function(){
            var self = this;
            var timeout;
            var liveSearch = function(){
                var pattern = $searchField.val();
                if(pattern.length > 3 || pattern.length === 0){
                    clearTimeout(timeout);
                    timeout = setTimeout(function(){
                        self.loadItems(pattern, function(items){
                            self.update(items);
                        });
                    }, 300);
                }
            };
            
             $searchField.keyup(liveSearch)
                     .siblings('.ctrl').click(liveSearch);
        },
        
        update : function(items){
            $itemContainer.empty().append(template(items));
            enableDragging();
        }  
    };
});


