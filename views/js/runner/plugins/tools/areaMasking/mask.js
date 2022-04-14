define(['lodash', 'handlebars', 'ui/dynamicComponent'], function (_, Handlebars, dynamicComponent) { 'use strict';

   _ = _ && Object.prototype.hasOwnProperty.call(_, 'default') ? _['default'] : _;
   Handlebars = Handlebars && Object.prototype.hasOwnProperty.call(Handlebars, 'default') ? Handlebars['default'] : Handlebars;
   dynamicComponent = dynamicComponent && Object.prototype.hasOwnProperty.call(dynamicComponent, 'default') ? dynamicComponent['default'] : dynamicComponent;

   var Template = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
     this.compilerInfo = [4,'>= 1.0.0'];
   helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
     var buffer = "", helper, options, helperMissing=helpers.helperMissing, escapeExpression=this.escapeExpression;


     buffer += "<div class=\"mask\">\n   <div class=\"inner\"></div>\n   <div class=\"controls\">\n        <a href=\"#\" class=\"view\"  title=\""
       + escapeExpression((helper = helpers.__ || (depth0 && depth0.__),options={hash:{},data:data},helper ? helper.call(depth0, "Preview the covered area", options) : helperMissing.call(depth0, "__", "Preview the covered area", options)))
       + "\"><span class=\"icon-preview\"></span></a>\n        <a href=\"#\" class=\"close\" title=\""
       + escapeExpression((helper = helpers.__ || (depth0 && depth0.__),options={hash:{},data:data},helper ? helper.call(depth0, "Close the mask", options) : helperMissing.call(depth0, "__", "Close the mask", options)))
       + "\"><span class=\"icon-result-nok\"></span></a>\n   </div>\n</div>\n";
     return buffer;
     });
   function areaMaskingTpl(data, options, asString) {
     var html = Template(data, options);
     return (asString || true) ? html : $(html);
   }

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
   var defaultConfig = {
     draggable: true,
     resizable: true,
     preserveAspectRatio: false,
     width: 250,
     minWidth: 160,
     maxWidth: 1000,
     minHeight: 60,
     height: 100,
     stackingScope: 'test-runner',
     top: 50,
     left: 10,
     previewDelay: 3000
   };
   /**
    * Creates a new masking component
    * @returns {maskComponent} the component (uninitialized)
    */

   function maskingComponentFactory() {
     var dynamicComponentInstance;
     /**
      * @typedef {Object} dynamicComponent
      */

     dynamicComponentInstance = dynamicComponent({
       /**
        * Preview the content under the masked area
        * @returns {maskComponent} chains
        *
        * @fires maskComponent#preview
        */
       preview: function preview() {
         var self = this;
         var delay = this.config.previewDelay || 1000;

         if (this.is('rendered') && !this.is('disabled') && !this.is('previewing')) {
           this.setState('previewing', true);
           this.trigger('preview');

           _.delay(function () {
             self.setState('previewing', false);
           }, delay);
         }

         return this;
       }
     }, defaultConfig).on('rendercontent', function ($content) {
       var self = this;
       var $element = this.getElement();
       $content.append(areaMaskingTpl({}));
       $element.addClass('mask-container');
       $element.on('click touchstart', '.view', function (e) {
         e.preventDefault();
         self.preview();
       }).on('click touchend', '.close', function (e) {
         e.preventDefault();
         self.destroy();
       });
     }).init();
     return dynamicComponentInstance;
   }

   return maskingComponentFactory;

});
