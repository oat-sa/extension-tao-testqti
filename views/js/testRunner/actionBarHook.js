/*
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
 * Copyright (c) 2015 (original work) Open Assessment Technologies SA ;
 *
 */
define(['jquery', 'lodash', 'tpl!taoQtiTest/testRunner/tpl/button'], function($, _, buttonTpl){

    'use strict';

    function init(config, assessmentTestContext){
        
        if(config && config.qtiTools){
            _.forIn(config.qtiTools, function(toolconfig, id){
                initQtiTool(id, toolconfig, assessmentTestContext);
            });
        }
        
    }
    
    function initQtiTool(id, toolconfig, assessmentTestContext){
        
        var $toolsContainer = $('.tools-box');
        var tplData = {
            id : id,
            navigation : false,
            title : toolconfig.label,
            label : toolconfig.label,
            icon : toolconfig.icon
        };
        var $button = $(buttonTpl(tplData));
        var amd = toolconfig.hook;
        
        require([amd], function(hook){
            if(_.isFunction(hook.init)){
                hook.init($button, toolconfig, assessmentTestContext);
                
                //only attach the button to the dom when everything is ready
                $toolsContainer.append($button);
            }
        });
    }
    
    return {
        init : init,
        initQtiTool : initQtiTool
    };
});