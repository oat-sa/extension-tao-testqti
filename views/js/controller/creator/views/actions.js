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
'taoQtiTest/controller/creator/views/property'], 
function($, propertyView){
    'use strict';

    var disabledClass = 'disabled';
    var activeClass = 'active';
    var btnOnClass = 'tlb-button-on';

    /**
     * Set up the property view for an element
     * @param {jQueryElement} $container - that contains the property opener
     * @param {String} template - the name of the template to give to the propertyView
     * @param {Object} model - the model to bind
     * @param {PropertyViewCallback} cb - execute at view setup phase
     */ 
    function properties ($container, template, model, cb) {
        var propView = null;
        $container.find('.property-toggler').on('click', function(e){
            e.preventDefault();
            var $elt = $(this);
            if(!$(this).hasClass(disabledClass)){

                $elt.blur(); //to remove the focus

                if(propView === null){

                    $container.addClass(activeClass);
                    $elt.addClass(btnOnClass);

                    propView = propertyView(template, model);
                    propView.open();
                    
                    propView.onOpen(function(){
                        $container.addClass(activeClass);
                        $elt.addClass(btnOnClass);
                    });
                    propView.onClose(function(){
                        $container.removeClass(activeClass);
                        $elt.removeClass(btnOnClass);
                    });

                    if(typeof cb === 'function'){
                        cb(propView);
                    }
                } else { 
                    propView.toggle();
                } 
            }
        });
    }


    /**
     * Enable to move an element
     * @param {jQueryElement} $element - to move
     * @param {String} containerClass - the cssClass of the element container
     * @param {String} elementClass - the cssClass to identify elements 
     */ 
    function move ($element, containerClass, elementClass) {
        var $container = $element.parents('.' + containerClass ); 
   
        //move up a testpart
        $('.move-up:not(.' + disabledClass + ')', $element).click(function(e){
            e.preventDefault();
            var $elements = $('.' + elementClass, $container);
            var index = $elements.index($element);
            if (index > 0) {
                $element.fadeOut(200, function(){
                        $element.insertBefore($('.' + elementClass + ' :eq(' + (index - 1) + ')', $container))
                                .fadeIn(400);
                                
                        $container.trigger('change');
                        $element.trigger('move');
                    });
            }
        });

        //move down a testpart
        $('.move-down:not(.' + disabledClass + ')', $element).click(function(e){
            e.preventDefault();
            var $elements = $('.' + elementClass, $container);
            var index = $elements.index($element);
            if (index < ($elements.length - 1) && $elements.length > 1) {
                $element.fadeOut(200, function(){
                    $element.insertAfter($('.' + elementClass + ' :eq(' + (index + 1) + ')', $container))
                    .fadeIn(400);

                    $container.trigger('change');
                    $element.trigger('move');
                });
            }
        });
    }
   
    /**
     * Update the movable state of an element
     * @param {jQueryElement} $container - the movable elements (scopped) 
     * @param {String} elementClass - the cssClass to identify elements 
     * @param {String} actionContainerElt - the element name that contains the actions 
     */ 
    function movable ($container, elementClass, actionContainerElt){
        $container.each(function(){
            var $elt = $(this);
            var $actionContainer = $(actionContainerElt, $elt);

            var index = $container.index($elt);
            var $moveUp = $('.move-up', $actionContainer);
            var $moveDown = $('.move-down', $actionContainer);
            
            //only one test part, no moving               
            if( $container.length === 1 ){
                $moveUp.addClass(disabledClass);
                $moveDown.addClass(disabledClass);

            //testpart is the first, only moving down
            } else if(index === 0) {
                $moveUp.addClass(disabledClass);
                $moveDown.removeClass(disabledClass);

            //testpart is the lasst, only moving up
            } else if ( index >= ($container.length - 1) ) {
                $moveDown.addClass(disabledClass);
                $moveUp.removeClass(disabledClass);
            
            //or enable moving top/bottom
            } else {
                $moveUp.removeClass(disabledClass);
                $moveDown.removeClass(disabledClass);
            }
         });
    }

    /**
     * Update the removable state of an element
     * @param {jQueryElement} $container - that contains the removable action
     * @param {String} actionContainerElt - the element name that contains the actions 
     */ 
    function removable ($container, actionContainerElt){
        $container.each(function(){
            var $elt = $(this);
            var $actionContainer = $(actionContainerElt, $elt);
            var $delete = $('[data-delete]', $actionContainer);

            if($container.length <= 1){
                $delete.addClass(disabledClass);
            } else {
                $delete.removeClass(disabledClass);
            }
        });
    }
    
    /**
     * The actions gives you shared behavior for some actions. 
     * 
     * @exports taoQtiTest/controller/creator/views/actions
     */
    return {
        properties: properties,
        move: move,
        removable : removable,
        movable : movable
    };
});
