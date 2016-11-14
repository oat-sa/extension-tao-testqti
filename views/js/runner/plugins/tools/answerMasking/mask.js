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
 * Copyright (c) 2016 (original work) Open Assessment Technologies SA;
 */

/**
 * Create a movable and resizable element in order to mask areas.
 *
 * @author Bertrand Chevrier <bertrand@taotesting.com>
 */
define([
    'jquery',
    'lodash',
    'interact',
    'ui/component',
    'tpl!taoQtiTest/runner/plugins/tools/answerMasking/mask'
], function ($, _, interact, component, answerMaskingTpl) {
    'use strict';



    var maskingComponentFactory = function maskingComponentFactory () {

        var maskComponent = component({
            place : function place(){
                var $container = this.getContainer();
                var $element = this.getElement();
                if( this.is('rendered') && !this.is('disabled')){
                    if($container.length) {
                        $element.css({
                            left:  $container.width() / 2 - $element.width() / 2,
                            top :  $container.height() / 2 - $element.height() / 2
                        });
                    }
                }
                return this;
            },
            moveTo : function moveTo(x, y){
                var element = this.getElement()[0];
                if( this.is('rendered') && !this.is('disabled') && element) {
                    this.config.x = this.config.x + x,
                    this.config.y = this.config.y + y;

                    // translate the element
                    element.style.transform = 'translate(' + this.config.x + 'px, ' + this.config.y + 'px)';
                }
            },

            preview : function preview(){
                var self   = this;
                var delay  = this.config.previewDelay || 2000;
                if( this.is('rendered') && !this.is('disabled') && !this.is('previewing') ){
                    this.setState('previewing', true);
                    _.delay(function(){
                        self.setState('previewing', false);
                    }, delay);
                }
            }
        }, {
            x : 0,
            y : 0,
            width: 250,
            height: 100
        });


        maskComponent
            .setTemplate(answerMaskingTpl)
            .on('render', function(){
                var self       = this;
                var $element   = this.getElement();
                var element    = $element[0];
                var $container = this.getContainer();
                var container  = $container[0];

                this.setSize(this.config.width, this.config.height)
                    .place();

                interact(element)
                    .draggable({
                        autoScroll: true,
                        restrict  : {
                            restriction : container,
                            elementRect: { left: 0, right: 1, top: 0, bottom: 1 }
                        },
                        onmove : function onMove(event){
                            self.moveTo(event.dx, event.dy);
                        }
                    })
                    .resizable({
                        autoScroll: true,
                        restrict  : {
                            restriction : container,
                            elementRect: { left: 0, right: 1, top: 0, bottom: 1 },
                        },
                        edges: { left: true, right: true, bottom: true, top: true }
                    })
                    .on('resizemove', function (event) {
                        self.setSize(event.rect.width, event.rect.height);
                        self.moveTo(event.deltaRect.left, event.deltaRect.top);
                    })
                    .on('dragstart', function(){
                        $element.addClass('moving');
                    })
                    .on('dragend', function(){
                        $element.removeClass('moving');
                    })
                    .on('resizestart', function(){
                        $element.addClass('sizing');
                    })
                    .on('resizeend', function(){
                        $element.removeClass('sizing');
                    });

                $element.on('click', '.view', function(e){
                    e.preventDefault();
                    self.preview();
                });
                $element.on('click', '.close', function(e){
                    e.preventDefault();
                    self.destroy();
                });
            });


        return maskComponent;

    };

    return maskingComponentFactory;
});
