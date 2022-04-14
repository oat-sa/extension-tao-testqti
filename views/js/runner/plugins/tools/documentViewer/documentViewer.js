define(['jquery', 'lodash', 'ui/hider', 'ui/documentViewer', 'ui/documentViewer/providers/pdfViewer', 'taoTests/runner/plugin', 'handlebars'], function ($$1, _, hider, viewerFactory, pdfViewer, pluginFactory, Handlebars) { 'use strict';

    $$1 = $$1 && Object.prototype.hasOwnProperty.call($$1, 'default') ? $$1['default'] : $$1;
    _ = _ && Object.prototype.hasOwnProperty.call(_, 'default') ? _['default'] : _;
    hider = hider && Object.prototype.hasOwnProperty.call(hider, 'default') ? hider['default'] : hider;
    viewerFactory = viewerFactory && Object.prototype.hasOwnProperty.call(viewerFactory, 'default') ? viewerFactory['default'] : viewerFactory;
    pdfViewer = pdfViewer && Object.prototype.hasOwnProperty.call(pdfViewer, 'default') ? pdfViewer['default'] : pdfViewer;
    pluginFactory = pluginFactory && Object.prototype.hasOwnProperty.call(pluginFactory, 'default') ? pluginFactory['default'] : pluginFactory;
    Handlebars = Handlebars && Object.prototype.hasOwnProperty.call(Handlebars, 'default') ? Handlebars['default'] : Handlebars;

    var Template = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
      this.compilerInfo = [4,'>= 1.0.0'];
    helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
      var buffer = "", stack1, helper, functionType="function", escapeExpression=this.escapeExpression;


      buffer += "<div class=\"document-viewer-plugin hidden\">\n    <div class=\"viewer-overlay\"></div>\n    <div class=\"viewer-panel\">\n        <div class=\"viewer-header\">\n            <span class=\"viewer-title\">";
      if (helper = helpers.title) { stack1 = helper.call(depth0, {hash:{},data:data}); }
      else { helper = (depth0 && depth0.title); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
      buffer += escapeExpression(stack1)
        + "</span>\n            <span class=\"icon icon-close\"></span>\n        </div>\n        <div class=\"viewer-content\">";
      if (helper = helpers.content) { stack1 = helper.call(depth0, {hash:{},data:data}); }
      else { helper = (depth0 && depth0.content); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
      if(stack1 || stack1 === 0) { buffer += stack1; }
      buffer += "</div>\n        <div class=\"viewer-footer\"></div>\n    </div>\n</div>\n";
      return buffer;
      });
    function panelTpl(data, options, asString) {
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
     * Copyright (c) 2016 (original work) Open Assessment Technologies SA ;
     */
    /**
     * The name of the plugin
     * @type {String}
     */

    var pluginName = 'documentViewer';
    /**
     * Shows the panel, trigger the `panelshow` event
     *
     * @param plugin
     */

    function showPanel(plugin) {
      hider.show(plugin.controls.$panel);
      plugin.trigger('panelshow');
      $$1(window).on("resize.".concat(plugin.getName()), _.debounce(_.partial(resizeViewer, plugin), 50));
    }
    /**
     * Hides the panel, trigger the `panelhide` event
     *
     * @param plugin
     */


    function hidePanel(plugin) {
      hider.hide(plugin.controls.$panel);
      plugin.trigger('panelhide');
      $$1(window).off("resize.".concat(plugin.getName()));
    }
    /**
     * Hides the panel if it is visible
     *
     * @param plugin
     * @returns {Boolean} Returns `true` if the panel was visible and has been hidden
     */


    function hideIfVisible(plugin) {
      var isVisible = !hider.isHidden(plugin.controls.$panel, true);

      if (isVisible) {
        hidePanel(plugin);
      }

      return isVisible;
    }
    /**
     * Initializes the event handlers for the panel container
     *
     * @param plugin
     */


    function initPanelEvents(plugin) {
      var namespace = ".".concat(plugin.getName());
      var stopEvents = ['click', 'mousedown', 'mouseup', 'touchstart', 'touchend', 'keyup', 'keydow', 'keypress', 'scroll', 'drop'].join("".concat(namespace, " ")) + namespace;

      var hideViewer = _.partial(hidePanel, plugin);

      function stopPropagation(e) {
        e.stopImmediatePropagation();
        e.stopPropagation();
      }

      plugin.controls.$overlay.off(namespace).on("click".concat(namespace), hideViewer).on(stopEvents, stopPropagation);
      plugin.controls.$panel.off(namespace).on("click".concat(namespace), '.icon-close', hideViewer).on(stopEvents, stopPropagation);
    }
    /**
     * Resizes the viewer to fit the panel content area
     * @param plugin
     */


    function resizeViewer(plugin) {
      var $content = plugin.controls.$content;
      plugin.viewer.setSize($content.width(), $content.height());
    } // all document viewers need to be registered


    viewerFactory.registerProvider('pdf', pdfViewer);
    /**
     * Returns the configured plugin
     */

    var documentViewer = pluginFactory({
      name: pluginName,

      /**
       * Initialize the plugin (called during runner's init)
       */
      init: function init() {
        var self = this;
        var testRunner = this.getTestRunner();
        var $panel = $$1(panelTpl());
        /**
         * @param {Object} data
         * @param {String} data.label - document title
         * @param {String} data.document - document url
         */

        function displayViewer(data) {
          if (self.getState('enabled') !== false) {
            showPanel(self);
            self.controls.$title.text(data.label);
            resizeViewer(self);
            self.viewer.load(data.document, 'pdf');
          }
        }

        this.controls = {
          $panel: $panel,
          $overlay: $panel.find('.viewer-overlay'),
          $title: $panel.find('.viewer-title'),
          $content: $panel.find('.viewer-content')
        };
        this.viewer = viewerFactory({
          renderTo: this.controls.$content,
          replace: true,
          fitToWidth: true,
          allowSearch: true
        }); //update plugin state based on changes

        testRunner.on('renderitem enabletools', function () {
          self.enable();
        }).on('renderitem', function () {
          self.getAreaBroker().getContentArea().append(self.controls.$panel).off(".".concat(self.getName())).on("viewDocument.".concat(self.getName()), function (event) {
            var data = event.originalEvent.detail;
            displayViewer(data);
          });
          initPanelEvents(self);
        }).on('move', function () {
          hideIfVisible(self);
        }).on('skip', function () {
          hideIfVisible(self);
        }).on('unloaditem disabletools', function () {
          self.disable();
        }).on('tool-documentViewer', function (data) {
          displayViewer(data);
        });
      },

      /**
       * Called during the runner's render phase
       */
      render: function render() {},

      /**
       * Called during the runner's destroy phase
       */
      destroy: function destroy() {
        this.getAreaBroker().getContentArea().off(".".concat(this.getName()));

        if (this.viewer) {
          this.viewer.destroy();
        }

        if (this.controls.$panel) {
          this.controls.$panel.remove();
        }

        this.viewer = null;
        this.controls = {};
      },

      /**
       * Enable the button
       */
      enable: function enable() {},

      /**
       * Disable the button
       */
      disable: function disable() {
        hideIfVisible(this);
      },

      /**
       * Show the button
       */
      show: function show() {},

      /**
       * Hide the button
       */
      hide: function hide() {
        hideIfVisible(this);
      }
    });

    return documentViewer;

});
