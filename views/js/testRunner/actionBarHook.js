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

/**
 * This module allows adding extra buttons in the action bar of the test runner
 * 
 */
define([
    'jquery',
    'lodash',
    'core/errorHandler',
    'tpl!taoQtiTest/testRunner/tpl/button'
], function($, _, errorHandler, buttonTpl){

    'use strict';

    var _ns = '.actionBarHook';

    /**
     * Check that the toolConfig is correct
     * 
     * @param {Object} toolconfig
     * @param {String} toolconfig.label - the label to be displayed in the button
     * @param {String} toolconfig.hook - the amd module to be loaded to initialize the button
     * @param {String} [toolconfig.icon] - the icon to be displayed in the button
     * @param {String} [toolconfig.title] - the title to be displayed in the button
     * @returns {unresolved}
     */
    function isValidConfig(toolconfig){
        return _.isObject(toolconfig) && toolconfig.label && toolconfig.hook;
    }
    
    /**
     * Init a test runner button from its config
     * 
     * @param {String} id
     * @param {Object} toolconfig
     * @param {String} toolconfig.label - the label to be displayed in the button
     * @param {String} toolconfig.hook - the amd module to be loaded to initialize the button
     * @param {String} [toolconfig.icon] - the icon to be displayed in the button
     * @param {String} [toolconfig.title] - the title to be displayed in the button
     * @param {Object} assessmentTestContext - the complete state of the test
     * @param {Object} testRunner - the test runner instance
     * @fires ready.actionBarHook when the hook has been initialized
     * @returns {undefined}
     */
    function initQtiTool($toolsContainer, id, toolconfig, assessmentTestContext, testRunner){

        if(isValidConfig(toolconfig)){
            
            require([toolconfig.hook], function(hook){
                
				var order = _.parseInt(toolconfig.order);
		        if(_.isNaN(order)){
		            order = 0;
		        }
                var tplData = {
                    id : id,
                    navigation : false,
                    title : toolconfig.title || toolconfig.label,
                    label : toolconfig.label,
                    icon : toolconfig.icon || '',
					order : order
                };
                var $button = $(buttonTpl(tplData));
                if(isValidHook(hook)){
                    
                    //if an instance of the tool is already attached, remove it:
                    var $existingBtn = $toolsContainer.children('[data-control="'+id+'"]'); 
                    if($existingBtn.length){
                        hook.clear($button, toolconfig, assessmentTestContext);
                        $existingBtn.remove();
                    }
                    
                    //check if the tool is to be available
                    if(hook.isVisible(toolconfig, assessmentTestContext)){
                        
                        //init the control
                        hook.init($button, toolconfig, assessmentTestContext, testRunner);

                        //only attach the button to the dom when everything is ready
                        _appendInOrder($toolsContainer, $button);

                        //ready !
                        $button.trigger('ready' + _ns);
                    }
                    
                }else{
                    errorHandler.throw(_ns, 'invalid hook format');
                }
            }, function(e){
                errorHandler.throw(_ns, 'the hook amd module cannot be found');
            });
            
        }else{
            errorHandler.throw(_ns, 'invalid tool config format');
        }

    }
    
	/**
     * Append a dom element $button to a $container in a specific order
     * The orders are provided by data-order attribute set to the $button
     * 
     * @param {JQuery} $container
     * @param {JQuery} $button
     */
    function _appendInOrder($container, $button){
        
        var $after, $before;
        var order = $button.data('order');
        
        if(order){
            
            $container.children('.action').each(function(){

                var $btn = $(this),
                    _order = $btn.data('order');

                if(_order === order){
                    $after = $btn;
                    return false;//stops
                }else if(_order > order){
                    $before = $btn;
                    $after = null;
                }else if(_order < order){
                    $after = $btn;
                    $before = null;
                }
            });

            if($after){
                $after.after($button);
            }else if($before){
                $before.before($button);
            }else{
                $container.append($button);
            }

        }else{
            //unordered buttons are append at the end (including when order equals 0)
            $container.append($button);
        }
    }

    /**
     * Check if the hook object is valid
     * 
     * @param {Object} hook
     * @param {Function} hook.init
     * @param {Function} hook.clear
     * @param {Function} hook.isVisible
     * @returns {Boolean}
     */
    function isValidHook(hook){
        return (_.isObject(hook) && _.isFunction(hook.init) && _.isFunction(hook.clear) && _.isFunction(hook.isVisible));
    }
    
    return {
        isValid : isValidConfig,
        initQtiTool : initQtiTool
    };
});