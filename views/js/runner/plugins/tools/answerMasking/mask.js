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
    'ui/transformer',
    'tpl!taoQtiTest/runner/plugins/tools/answerMasking/mask'
], function ($, _, interact, component, transformer, answerMaskingTpl) {
    'use strict';

    var defaultConfig = {
        x : 0,
        y : 0,
        width: 250,
        height: 100,
        minWidth: 75,
        minHeight: 25,
        previewDelay: 3000
    };

    /**
     * Creates a new masking component
     * @returns {maskComponent} the component (uninitialized)
     */
    var maskingComponentFactory = function maskingComponentFactory () {

        /**
         * @typedef {Object} maskComponent
         */
        var maskComponent = component({

            /**
             * Place the container against the container (at the center/middle)
             * @returns {maskComponent} chains
             */
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

            /**
             * Moves the mask to the given position
             * @param {Number} x - the new x position
             * @param {Number} y - the new y position
             * @returns {maskComponent} chains
             *
             * @fires maskComponent#move
             */
            moveTo : function moveTo(x, y){
                var $element = this.getElement();
                if( this.is('rendered') && !this.is('disabled')) {
                    this.config.x = this.config.x + x,
                    this.config.y = this.config.y + y;

                    transformer.translate($element, this.config.x, this.config.y);

                    /**
                     * @event maskComponent#move the component has moved
                     * @param {Number} x - the new x position
                     * @param {Number} y - the new y position
                     */
                    this.trigger('move', this.config.x, this.config.y);
                }
                return this;
            },

            /**
             * Resize the mask (minimum constraints applies)
             * @param {Number} width - the new width
             * @param {Number} height - the new height
             * @returns {maskComponent} chains
             *
             * @fires maskComponent#resize
             */
            resize : function resize(width, height) {
                if( this.is('rendered') && !this.is('disabled')) {
                    this.setSize(
                        width  > this.config.minWidth  ? width  : this.config.minWidth,
                        height > this.config.minHeight ? height : this.config.minHeight
                    );

                    /**
                     * @event maskComponent#move the component has been resized
                     * @param {Number} width - the new width
                     * @param {Number} height - the new height
                     */
                    this.trigger('resize', this.config.width, this.config.height);
                }
                return this;
            },

            /**
             * Preview the content under the masked area
             * @returns {maskComponent} chains
             *
             * @fires maskComponent#preview
             */
            preview : function preview(){
                var self   = this;
                var delay  = this.config.previewDelay || 1000;
                if( this.is('rendered') && !this.is('disabled') && !this.is('previewing') ){
                    this.setState('previewing', true)
                        .trigger('preview');
                    _.delay(function(){
                        self.setState('previewing', false);
                    }, delay);
                }
                return this;
            },


        }, defaultConfig);


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
                if(this.config.x !== 0 || this.config.y !== 0){
                    this.moveTo(0, 0);
                }

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
                            endOnly: true
                        },
                        edges: { left: true, right: true, bottom: true, top: true }
                    })
                    .on('resizemove', function (event) {
                        self.resize(event.rect.width, event.rect.height);
                        self.moveTo(event.deltaRect.left, event.deltaRect.top);
                    })
                    .on('dragstart', function(){
                        self.setState('moving', true);
                    })
                    .on('dragend', function(){
                        self.setState('moving', false);
                    })
                    .on('resizestart', function(){
                        self.setState('sizing', true);
                    })
                    .on('resizeend', function(){
                        self.setState('sizing', false);
                    });

                $element
                    .on('click', '.view', function(e){
                        e.preventDefault();
                        self.preview();
                    })
                    .on('click', '.close', function(e){
                        e.preventDefault();
                        self.destroy();
                    });
            });

        return maskComponent;
    };

    return maskingComponentFactory;
});
