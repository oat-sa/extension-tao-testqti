/**
 * @author Bertrand Chevrier <bertrand@taotesting.com>
 * @requires jquery
 * @requires cards/core/pluginifier
 * @requires cards/core/dataattrhandler
 */
define(['jquery', 'cards/core/pluginifier', 'cards/core/dataattrhandler'], function($, Pluginifier, DataAttrHandler){
   'use strict';
   
   var ns = 'btngrouper';
   var dataNs = 'cards.' + ns;
   
   var defaults = {
       bindEvent   : 'click',
       activeClass : 'active',
       innerElt : 'a',
       action : 'toggle'
   };
   
   //to be extended
   var availableActions = ['toggle'];
   
   /** 
    * The BtnGrouper component, hepls you to manage a group of buttons
    * @exports cards/btngrouper
    */
   var BtnGrouper = {
       
        /**
         * Initialize the plugin.
         * 
         * Called the jQuery way once registered by the Pluginifier.
         * @example $('selector').btngrouper({action : 'toggle' });
         * @public
         * 
         * @constructor
         * @param {Object} options - the plugin options
         * @param {string|boolean} [options.bindEvent = 'click'] - the event that trigger the close
         * @param {String} [options.action = 'toggle'] - the action type to be executed
         * @param {string} [options.activeClass = 'active'] - the css class to apply when an element of the button is active
         * @param {string} [options.innerElt = 'a'] - the element that compose the group
         * @fires BtnGrouper#create.btngrouper
         * @returns {jQueryElement} for chaining
         */
        init : function(options){
            
            //get options using default
            options = $.extend(true, {}, defaults, options);
            
            if(availableActions.indexOf[options.actions] === -1){
                return $.error('Action ' + options.action + ' not supported');
            }
           
            return this.each(function() {
                var $elt = $(this);
                
                //add data to the element
                $elt.data(dataNs, options);
                
                //bind an event to trigger the action
                if(options.bindEvent !== false){
                    //the event is bound to the 
                    $elt.on(options.bindEvent, options.innerElt, function(e){
                        e.preventDefault();
                        //execute the private method that corresponds to tha action
                        BtnGrouper['_' + options.action]($(this));
                     });
                }
                
                /**
                 * The plugin have been created.
                 * @event BtnGrouper#create.btngrouper
                 */
                $elt.trigger('create.' + ns);
            });
       },
       
       /**
        * Toggle the button state.
        * 
        * Called the jQuery way once registered by the Pluginifier.
        * @example $('selector').btngrouper('toggle');
        * @public
        * 
        * @returns {jQueryElement} for chaining
        */
       toggle : function(){
           return this.each(function() {
                BtnGrouper._toggle($(this));
           });
       },
               
       /**
        * Internal toggling mechanism.
        * 
        * @private
        * @param {jQueryElement} $elt - plugin's element 
        * @fires BtnGrouper#toggle.btngrouper
        */
       _toggle: function($elt){
            var options = $elt.data(dataNs);

            $elt.find(options.innerElt).toggleClass(options.activeClass);
        
           /**
            * The target has been toggled. 
            * @event BtnGrouper#toggle.btngrouper
            */
            $elt.trigger('toggle.' + ns);
       },
               
       /**
        * Destroy completely the plugin.
        * 
        * Called the jQuery way once registered by the Pluginifier.
        * @example $('selector').btngrouper('destroy');
        * @public
        */
       destroy : function(){
            this.each(function() {
                var $elt = $(this);
                var options = $elt.data(dataNs);
                if(options.bindEvent !== false){
                    $elt.off(options.bindEvent, options.innerElt);
                }
                
                /**
                 * The plugin have been destroyed.
                 * @event BtnGrouper#destroy.btngrouper
                 */
                $elt.trigger('destroy.' + ns);
            });
        }
   };
   
   //Register the btngrouper to behave as a jQuery plugin.
   Pluginifier.register(ns, BtnGrouper);
   
   /**
    * The only exposed function is used to start listening on data-attr
    * 
    * @public
    * @example define(['cards/btngrouper'], function(btngrouper){ btngrouper($('rootContainer')); });
    * @param {jQueryElement} $container - the root context to listen in
    */
   return function listenDataAttr($container){
       
        new DataAttrHandler('button-group', {
            container: $container,
            inner : 'a',
            listenerEvent: 'click',
            namespace: dataNs,
            useTarget: false
        }).init(function($elt) {
            $elt.btngrouper({
                bindEvent: false,
                action : $elt.data('button-group')
            });
        }).trigger(function($elt) {
            $elt.btngrouper($elt.data('button-group'));
        });
    };
});

