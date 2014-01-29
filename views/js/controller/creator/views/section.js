/**
 * @author Bertrand Chevrier <bertrand@taotesting.com>
 */
define(
['jquery', 'handlebars', 'ui/incrementer', 'uri', 'ckeditor-jquery'], 
function($, Handlebars, incrementer, uri){
    'use strict';
   
   /**
    * The SectionView setup sections related components
    * @exports creator/views/section
    */
   var SectionView = {
   
    //compile templates
    _sectionTmpl : Handlebars.compile($('#section-template').html()),
    _itemRefTmpl : Handlebars.compile($('#item-ref-template').html()),
    _sectionRefTmpl : Handlebars.compile($('#section-ref-template').html()),
    
   /**
    * View entry point
    * @param {Object} options 
    * @param {Object} options.labels - the labels of the sections already loaded
    *                                   (we need to sync them, because QTI doesn't has label or title for itemRefs)
    * @param {Function} options.getIdentifier - the function used to get identifiers from the server
    */
    setUp: function(options){

         var self = this;
         
         this._$sectionContainer = $('#sections');

         this.labels = options.labels || {};
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
         
         //make the sections sortable
         this.createSectionsSortable();

         //live listening of position update 
         this.listenForItemPositionChange();
     },
    
    /**
     * Set up one section's components
     * @param {jQueryElement} $section - the section to set up (ensure there is only ONE element) 
     */
    setUpSection : function ($section){
        
        //set up the incrementer widget inside the options form
        incrementer($section);
        
        //set up the droppable/sortable list
        this.createItemSortable($section);
        //this.createSectionDraggable($section);
        
        //display the item's position
        this.udpateItemsNumber($section);
        
        //section properties behavior
        this.setUpSectionProperties($section);
        
        //section rubricBlocks behavior
        this.setUpRubricBlocks($section);
    },
    
    /**
     * Enables to add new section, using the adder plugin
     */
    createAdder : function (){
        var self = this;
    
        return $('#section-adder').adder({
                target: self._$sectionContainer,
                content: self._sectionTmpl,
                templateData : function(cb){
                    //data to pass to the template
                    var length = self._$sectionContainer.find('.section').length;
                    var sectionData = {
                        index : length,
                        title : 'Section ' + (length + 1),
                        'qti-type' : 'assessmentSection',
                        ordering : {
                            'qti-type' : 'ordering',
                            'shuffle'  : false
                        },
                        rubricBlocks: [{
                               rubricBlock : {
                                   'qti-type' : 'rubricBlock',
                                   content : [],
                                   views : [1]
                               }
                        }]
                    };
                    //ensure the section has a unique id
                    self.getIdentifier('assessmentSection', function(response){
                        if(response.identifier){
                           sectionData.identifier = response.identifier;
                        }
                        
                        //ok, add the section
                        cb(sectionData);
                    });
                }
            }).on('add.adder', function(e, target, added){
                //set up section once added
                self.setUpSection($(added).filter('.section'));
            });
        },

        /**
         * Make the sections sortables
         */
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

    /*    createSectionDraggable: function ($section){
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
        },*/

        /**
         * Make the items of a section sortable
         * @param {jQueryElement} $section
         */
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

                  /*  if(ui.item.hasClass('section')){

                       self.addSectionRef($list, {
                            identifier : ui.item.attr('id'),
                            title : ui.item.find('[data-bind="title"]').text(),
                            'qti-type' : 'assessmentSectionRef'
                        });

                    } else {*/
                        var itemUri = uri.decode(ui.item.attr('data-uri'));
                        self.addItemRef($list, {
                            href : itemUri,
                            label : $.trim(ui.item.clone().children().remove().end().text()),
                            'qti-type' : 'assessmentItemRef'
                        });
                    //}

                    return false;
                }
            });
        },

        /**
         * Add an itemRef to a section
         * @param {jQueryElement} $list - the section list to add the item to
         * @param {Object} data - the item's data to give to the template
         */
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

     /*   addSectionRef : function ($list, data){
            var self = this;

            data.index = $list.children('li').not('.selectable').length + 1;
            this.getIdentifier('assessmentSectionRef', function(response){
                if(response.identifier){
                    data.identifier = response.identifier;
                    $list.append(self._sectionRefTmpl(data));
                    $list.parent('.section').trigger('add', [data]);
                }
            });
        },*/

        /**
         * Update and display the item's position inside a section
         * @param {jQueryElement} $section
         */
        udpateItemsNumber : function ($section){
            $section.find('ul').children('li').not('.selectable').each(function(index, elt){
                var $label = $(elt).find('.label');
                var current = index + 1;
                if(parseInt($label.text(), 10) !== current){
                    $label.text(current);
                }
            });
        },

        //

        /**
         *  Udate the labels as they are not contained in the QTI Test
         */
        syncLabels : function (){
            var self = this;
            this._$sectionContainer.find('li[data-uri]').each(function(){
                var label = self.labels[uri.encode($(this).data('uri'))];
                if(label){
                    $(this).find('.title').text(label); 
                }
            });
        },

        /**
         * Listen for events that may change the position of items 
         * and trigger the udpateItemsNumber accordingly
         */
        listenForItemPositionChange : function (){
            var self = this;
             $(document)
                .on('leave.inplacer', '.section li .label', function(event, value){
                    var $this = $(this);
                    var $item = $this.parent('li');
                    var currentPos = parseInt($item.data('bind-index'), 10) + 1;
                    value = parseInt(value, 10);

                    self.updateItemPosition($this.parents('.section'), $item,  value, currentPos );
                })
                .on('close.closer', '.section li .closer', function(event, $closed){
                    $closed.addClass('selectable');
                    self.udpateItemsNumber($(this).parents('.section'));
                });
        },

        /**
         * Move items (re-order) 
         * @param {jQueryElement} $section - the section that contain the item
         * @param {jQueryElement} $item - the item to move
         * @param {Number} position - the expected position of the item
         * @param {Number} currentPosiion - the current position
         */
        updateItemPosition : function ($section, $item, position, currentPosiion){
            var self = this;
            var size = $section.find('li').length;
            var $relativeItem;
            var before = false;
            var relativeItemPosition;
            if(position >= 0 && position !== currentPosiion){
                if(position <= 1){
                    relativeItemPosition = 1;
                    before = true;
                } else if (position >= size) {
                     relativeItemPosition = size;
                } else {
                    if( (position - 1) === currentPosiion){
                         relativeItemPosition = position + 1;
                    } else {
                         relativeItemPosition = position - 1;
                    }
                }
                $relativeItem = $section.find('li:nth-child(' + relativeItemPosition + ')');
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

        /**
         * Custom behavior in the section properties
         * @param {jQueryElement} $section - the section that contains the properties
         */
        setUpSectionProperties : function($section){
            var sectionId = $section.attr('id');
            //trigger the bindings when the selection sub form is opened (it reset values)
            $('#' + sectionId + '-selection-rand').on('change', function(){
                if($(this).prop('checked') === true){
                     $('#' + sectionId + '-select').trigger('change');
                     $('#' + sectionId + '-with-replacement').trigger('change');
                }
            });
        },

        /**
         * Custom behavior for the rubricBlocks
         * @param {jQueryElement} $section - the section that contains the rubricBlocks
         */
        setUpRubricBlocks : function($section){
            var sectionId = $section.attr('id');
            $('#' + sectionId + '-back').find('textarea').each(function(){
                 var $elt = $(this);

                 //set up the wysiwyg
          //       $elt.ckeditor();

                 $elt.siblings('.hide-rubricblock').on('click', function(){
                     if($.trim($elt.val()) === ''){
                         //trigger removal binding if value is empty
                         $elt.siblings('input[data-bind-rm]').trigger('change');
                    } else {
                        //trigger default values binding
                        $elt.siblings('input[data-bind]').trigger('change');
                        $elt.trigger('change');
                    }
                });
            });
        }
    };
    
    
    return {
        //expose only SectionView.setUp 
        setUp : function(options){
            SectionView.setUp(options);
        }
    };
});


