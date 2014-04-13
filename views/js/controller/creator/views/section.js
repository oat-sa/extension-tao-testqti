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
'jquery', 'lodash', 'uri', 
'taoQtiTest/controller/creator/views/actions',
'taoQtiTest/controller/creator/views/itemref',
'taoQtiTest/controller/creator/views/rubricblock',
'taoQtiTest/controller/creator/templates/index', 
'taoQtiTest/controller/creator/helpers/qtiTest'],
function($, _, uri, actions, itemRefView, rubricBlockView, templates, qtiTestHelper){
    'use strict';
        
   /**
    * Set up a section: init action beahviors. Called for each section.
    *
    * @param {jQueryElement} $sectuin - the section to set up
    * @param {Object} model - the data model to bind to the test part
    * @param {Object} [data] - additionnal data used by the setup
    * @param {Array} [data.identifiers] - the locked identifiers
    */
   var setUp = function setUp ($section, model, data){

        var $actionContainer = $('h2', $section);

        
        actions.properties($actionContainer, 'section', model, propHandler);
        actions.move($actionContainer, 'sections', 'section');
        itemRefs();
        acceptItemRefs();
        rubricBlocks();
        addRubricBlock();

        //trigger for the case the section is added an a selection is ongoing


        /**
         *  Perform some binding once the property view is create
         *  @param {propView} propView - the view object
         */
        function propHandler (propView) {
            $section.parents('.testpart').on('delete', removePropHandler);
            $section.on('delete', removePropHandler);
            
            function removePropHandler(){
                if(propView !== null){
                    propView.destroy();
                }
            }
        }

        /**
         * Set up the item refs that already belongs to the section
         * @private
         */
        function itemRefs(){
            
            if(!model.sectionParts){
                model.sectionParts = [];
            }                   
            $('.itemref', $section).each(function(){
                var $itemRef = $(this);
                var index = $itemRef.data('bind-index');
                if(!model.sectionParts[index]){
                    model.sectionParts[index] = {};
                }

                itemRefView.setUp($itemRef, model.sectionParts[index]);
                $itemRef.find('.title').text(
                    data.labels[uri.encode($itemRef.data('uri'))]
                );
            });
        }

        /**
         * Make the section to accept the selected items
         * @private
         */
        function acceptItemRefs(){
            var $selected;
            var $items     = $('.test-creator-items'); 
            
             //the item selector trigger a select event 
             $items.on('itemselect.creator', function(e){
                var selection = Array.prototype.slice.call(arguments, 1);
                var $placeholder = $('.itemref-placeholder', $section);
                var $placeholders = $('.itemref-placeholder');
 
                if(selection.length > 0){
                    $placeholder.show().off('click').on('click', function(e){

                        _.forEach(selection, function(item){
                            var $item = $(item);
                            
                            addItemRef($('.itemrefs', $section), undefined, {
                                href        : uri.decode($item.data('uri')),
                                label       : $.trim($item.clone().children().remove().end().text()),
                                'qti-type'  : 'assessmentItemRef'
                            });
                        }); 

                        //reset the current selection
                        $('.ui-selected', $items).removeClass('ui-selected').removeClass('selected');
                        $placeholders.hide().off('click');
                    });    
                } else {
                    $placeholders.hide().off('click');
                }
             });


            //we listen the event not from the adder but  from the data binder to be sure the model is up to date
            $(document).on('add.binder', '#' + $section.attr('id') + ' .itemrefs', function(e, $itemRef){
                if(e.namespace === 'binder' && $itemRef.hasClass('itemref')){
                    var index = $itemRef.data('bind-index'); 

                    //initialize the new item ref
                    itemRefView.setUp($itemRef, model.sectionParts[index]);
                } 
            });

            //on set up, if there is a selection ongoing, we trigger the event
            $selected = $('.selected', $items); 
            if($selected.length > 0){
                $items.trigger('itemselect.creator', $selected);
            }

        }

        /**
         * Add a new item ref to the section
         * @param {jQueryElement} $refList - the element to add the item to
         * @param {Number} [index] - the position of the item to add
         * @param {Object} [itemData] - the data to bind to the new item ref
         */
        function addItemRef($refList, index, itemData){
           var $itemRef;
           var $items = $refList.children('li');
           index = index || $items.length;
           itemData.identifier = qtiTestHelper.getIdentifier('item', data.identifiers);
           itemData.index = index + 1;
           $itemRef = $(templates.itemref(itemData));
           if(index > 0){
               $itemRef.insertAfter($items.eq(index - 1));
           } else {
               $itemRef.appendTo($refList); 
           }
           $refList.trigger('add', [$itemRef, itemData]);
        }


        function rubricBlocks () {
            if(!model.rubricBlocks){
                model.rubricBlocks = [];
            }                   
            $('.rubricblock', $section).each(function(){
                var $rubricBlock = $(this);
                var index = $rubricBlock.data('bind-index');
                if(!model.rubricBlocks[index]){
                    model.rubricBlocks[index] = {};
                }

                rubricBlockView.setUp($rubricBlock, model.rubricBlocks[index]);
            });
        }

        /**
         * Set up the rubric blocks already belongs to the section
         * @private
         */
        function addRubricBlock () {

            $('.rublock-adder', $section).adder({
                target: $('.rubricblocks', $section),
                content : templates.rubricblock,
                templateData : function(cb){
                    cb({
                        'qti-type' : 'rubricBlock',
                        index  : $('.rubricblock', $section).length,
                        content : [],
                        views : [1]
                    });
                }
            });

            //we listen the event not from the adder but  from the data binder to be sure the model is up to date
            $(document).on('add.binder', '#' + $section.attr('id') + ' .rubricblocks', function(e, $rubricBlock, data){
                if(e.namespace === 'binder' && $rubricBlock.hasClass('rubricblock')){
                    var index = $rubricBlock.data('bind-index'); 
                    rubricBlockView.setUp($rubricBlock, model.rubricBlocks[index]);
                }
            });
        }        
   };

   /**
    * Listen for state changes to enable/disable . Called globally.
    */
   var listenActionState =  function listenActionState (){

        var $sections;
        var $actionContainer;
        
        $('.sections').each(function(){
            $sections = $('.section', $(this));

            actions.removable($sections, 'h2');
            actions.movable($sections, 'section', 'h2');
        });
       
        $(document)
        .on('add change deleted', '.sections',  function(e){
            var $target = $(e.target);
            if($target.hasClass('section') || $target.hasClass('sections')){
                $sections = $('.section', $target.hasClass('sections') ? $target : $target.parents('.sections'));

                actions.removable($sections, 'h2');
                actions.movable($sections, 'section', 'h2');
            }
        })
        .on('open.toggler', '.rub-toggler', function(e){
            if(e.namespace === 'toggler'){
               $(this).parents('h2').addClass('active'); 
            }
        })
        .on('close.toggler', '.rub-toggler', function(e){
            if(e.namespace === 'toggler'){
               $(this).parents('h2').removeClass('active'); 
            }
        });
   };
   
 
   /**
     * The sectionView setup section related components and beahvior
     * 
     * @exports taoQtiTest/controller/creator/views/section
     */
    return {
        setUp : setUp,
        listenActionState: listenActionState
   };
});
