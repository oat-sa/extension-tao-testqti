define(['jquery', 'handlebars', 'cards/incrementer', 'uri', 'ckeditor-jquery'], function($, Handlebars, incrementer, uri){
    'use strict';
   
   var SectionView = {
   
    _sectionTmpl : Handlebars.compile($('#section-template').html()),
    _itemRefTmpl : Handlebars.compile($('#item-ref-template').html()),
    _sectionRefTmpl : Handlebars.compile($('#section-ref-template').html()),
    _$sectionContainer : $('#sections'),
    
    setUp: function(options){

         var self = this;

         this.labels = options.labels || [];
         this.getIdentifier = options.getIdentifier;

         //get the list of sections already inseted
         var $sections = this._$sectionContainer.find('.section');

         //set up the adder component
         var $adder = this.createAdder();

         if($sections.length === 0){
             //if no sections we create the first one by default
             $adder.adder('add');    
         } else {
             //setup of the existing sections
             $sections.each(function(){
                  self.setUpSection($(this));
             });
             this.syncLabels();
         }
         
         this._$sectionContainer.find('textarea').each(function(){
             var $elt = $(this);
             
             $elt.ckeditor();
             $elt.siblings('.hide-rubricblock').on('click', function(){
                 //todo
                 $elt.trigger('change');
            });
         });

         //make the sections sortable
         this.createSectionsSortable();

         //live listening of position update 
         this.listenForItemPositionChange();
     },
    
    setUpSection : function ($section){
        
        //set up the incrementer widget inside the options form
        incrementer($section);
        
        //set up the droppable/sortable list
        this.createItemSortable($section);
        //this.createSectionDraggable($section);
        
        this.udpateItemsNumber($section);
    },
    
    createAdder : function (){
        var self = this;
    
        return $('#section-adder').adder({
                target: self._$sectionContainer,
                content: self._sectionTmpl,
                templateData : function(cb){
                    var length = self._$sectionContainer.find('.section').length;
                    var sectionData = {
                        index : length,
                        title : 'Section ' + (length + 1),
                        'qti-type' : 'assessmentSection',
                        ordering : {
                            'qti-type' : 'ordering'
                        },
                        rubricBlocks: [{
                               rubricBlock : {
                                   'qti-type' : 'rubricBlock',
                                   content : [],
                                   views : [1]
                               }
                        }]
                    };
                    self.getIdentifier('assessmentSection', function(response){
                        if(response.identifier){
                           sectionData.identifier = response.identifier;
                        }
                        cb(sectionData);
                    });
                }
            }).on('add.adder', function(e, target, added){
                //set up section once added
                self.setUpSection($(added));
            });
    },
    
    
    createSectionsSortable : function (){
        this._$sectionContainer.sortable({
            containement : 'parent',
            placeholder : 'placeholder',
            handle : '.sort',
            items: '> .section',
            zIndex: 800,
            axis: 'y',
            stop: function(){
                $(this).trigger('change');
            }
        });
    }, 
    
    createSectionDraggable: function ($section){
        var targetSelector = '.section:not(#' + $section.attr('id') + ') > ul';
        $section.addClass('selectable').draggable({
            helper : 'clone',
            handle : '.ref-into',
            scroll: false,
            revert: 'invalid',
            opacity: 0.8,
            connectToSortable: targetSelector,
            zIndex: 100000,
            forceHelperSize: true,
            forcePlaceholderSize: true,
            start : function(){
                $(targetSelector).addClass('active');
            }, 
            stop: function(){
                $(targetSelector).removeClass('active');
            }
        });
    },

    createItemSortable : function ($section){
        var self = this; 
        $section.children('ul').sortable({
            containement : 'parent',
            placeholder : 'placeholder',
            zIndex: 800,
            axis: 'y',
            update: function(){
               self.udpateItemsNumber($section);
               if($(this).find('.selectable').length === 0){
                   $(this).trigger('change');
               }
            },
            over : function(){
                $(this).addClass('valid');
            },
            out : function(){
                $(this).removeClass('valid');
            },
            stop: function(){
              $section.find('.selectable').remove();  
            },
            receive: function(event, ui){
                var $list = $(this);
                $section.find('.selectable').remove();  
                
                if(ui.item.hasClass('section')){
                    
                   self.addSectionRef($list, {
                        identifier : ui.item.attr('id'),
                        title : ui.item.find('[data-bind="title"]').text(),
                        'qti-type' : 'assessmentSectionRef'
                    });
                    
                } else {
                    var itemUri = uri.decode(ui.item.attr('data-uri'));
                    self.addItemRef($list, {
                        href : itemUri,
                        label : $.trim(ui.item.clone().children().remove().end().text()),
                        'qti-type' : 'assessmentItemRef'
                    });
                }
                
                return false;
            }
        });
    },
    
    addItemRef : function ($list, data){
        var self = this;
        
        data.index = $list.children('li').not('.selectable').length + 1;
        this.getIdentifier('assessmentItemRef', function(response){
            if(response.identifier){
               data.identifier = response.identifier;
               $list.append(self._itemRefTmpl(data));
               $list.trigger('add', [data]);
            }
        });
    },
    
    addSectionRef : function ($list, data){
        var self = this;
        
        data.index = $list.children('li').not('.selectable').length + 1;
        this.getIdentifier('assessmentSectionRef', function(response){
            if(response.identifier){
                data.identifier = response.identifier;
                $list.append(self._sectionRefTmpl(data));
                $list.parent('.section').trigger('add', [data]);
            }
        });
    },
    
    udpateItemsNumber : function ($section){
        $section.find('ul').children('li').not('.selectable').each(function(index, elt){
            var $label = $(elt).find('.label');
            var current = index + 1;
            if(parseInt($label.text(), 10) !== current){
                $label.text(current);
            }
        });
    },
    
    updateItemPosition : function ($section, $item, position){
        var self = this;
        var size = $section.find('li').length;
        var $relativeItem;
        var before = false;
        if(position >= 0){
            if(position <= 1){
                $relativeItem = $section.find('li:nth-child(1)');
                before = true;
            } else if (position >= size) {
                 $relativeItem = $section.find('li:last-child');
            } else {
                $relativeItem = $section.find('li:nth-child(' + (position - 1) + ')');
            }
            if($relativeItem.length > 0){
                if(before === true) {
                    $item.insertBefore($relativeItem);
                } else {
                    $item.insertAfter($relativeItem);
                }
                $section.find('ul').trigger('sortupdate');
                self.udpateItemsNumber($section);
            }
        }
    },
    
    //update the labels as they are not contained in the QTI Test
    syncLabels : function (){
        var self = this;
        this._$sectionContainer.find('li[data-uri]').each(function(){
            var label = self.labels[uri.encode($(this).data('uri'))];
            if(label){
                $(this).find('.title').text(label); 
            }
        });
    },
    
    listenForItemPositionChange : function (){
        var self = this;
         $(document)
            .on('leave.inplacer', '.section li .label', function(event, value){
                var $this = $(this);
                self.updateItemPosition($this.parents('.section'),  $this.parent('li'), parseInt(value, 10) );
            })
            .on('close.closer', '.section li .closer', function(event, $closed){
                $closed.addClass('selectable');
                self.udpateItemsNumber($(this).parents('.section'));
            });
    }
    
 
    };
    
    return {
        setUp : function(options){
            SectionView.setUp(options);
        }
    };
});


