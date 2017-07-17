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
    'lodash',
    'ui/movableComponent',
    'tpl!taoQtiTest/runner/plugins/tools/areaMasking/mask'
], function (_, movableComponent, areaMaskingTpl) {
    'use strict';

    var defaultConfig = {
        previewDelay: 3000,
        stackingScope: 'test-runner'
    };

    /**
     * Creates a new masking component
     * @returns {maskComponent} the component (uninitialized)
     */
    function maskingComponentFactory () {

        /**
         * @typedef {Object} maskComponent
         */
        var maskComponent = movableComponent({
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
            }
        }, defaultConfig);


        maskComponent
            .setTemplate(areaMaskingTpl)
            .on('render', function(){
                var self     = this;
                var $element = this.getElement();

                $element
                    .on('click touchstart', '.view', function(e){
                        e.preventDefault();
                        self.preview();
                    })
                    .on('click touchstart', '.close', function(e){
                        e.preventDefault();
                        self.destroy();
                    });
            });

        return maskComponent;
    }

    return maskingComponentFactory;
});
