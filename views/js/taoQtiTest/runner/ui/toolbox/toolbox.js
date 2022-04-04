define(['lodash', 'jquery', 'ui/component', 'taoQtiTest/runner/ui/toolbox/entry', 'taoQtiTest/runner/ui/toolbox/menu', 'taoQtiTest/runner/ui/toolbox/text', 'handlebars'], function (_, $$1, componentFactory, entryFactory, menuFactory, textFactory, Handlebars) { 'use strict';

    _ = _ && Object.prototype.hasOwnProperty.call(_, 'default') ? _['default'] : _;
    $$1 = $$1 && Object.prototype.hasOwnProperty.call($$1, 'default') ? $$1['default'] : $$1;
    componentFactory = componentFactory && Object.prototype.hasOwnProperty.call(componentFactory, 'default') ? componentFactory['default'] : componentFactory;
    entryFactory = entryFactory && Object.prototype.hasOwnProperty.call(entryFactory, 'default') ? entryFactory['default'] : entryFactory;
    menuFactory = menuFactory && Object.prototype.hasOwnProperty.call(menuFactory, 'default') ? menuFactory['default'] : menuFactory;
    textFactory = textFactory && Object.prototype.hasOwnProperty.call(textFactory, 'default') ? textFactory['default'] : textFactory;
    Handlebars = Handlebars && Object.prototype.hasOwnProperty.call(Handlebars, 'default') ? Handlebars['default'] : Handlebars;

    var Template = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
      this.compilerInfo = [4,'>= 1.0.0'];
    helpers = this.merge(helpers, Handlebars.helpers);  


      return "<ul class=\"plain tools-box-list\"></ul>";
      });
    function toolboxTpl(data, options, asString) {
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
     * Copyright (c) 2017 (original work) Open Assessment Technologies SA;
     */
    var toolboxComponentApi = {
      /**
       * Initialize the toolbox
       */
      initToolbox: function initToolbox() {
        this.allItems = [];
        this.allMenus = [];
      },

      /**
       * Create a menu component instance
       * @param {Object} config
       * @param {String} config.control - will be used as the instance id and in the data-control html attribute
       * @param {String} config.title - will be used in the title html attribute
       * @param {String} config.icon - the icon for the button
       * @param {String} config.text - the button label
       * @param {String} config.className - an extra class
       * @returns {Component} the create instance
       */
      createMenu: function createMenu(config) {
        var self = this,
            menu = menuFactory().init(config);
        this.allItems.push(menu);
        this.allMenus.push(menu); // add an event handler to close all opened menu when opening

        menu.on('openmenu', function closeAllMenuExcept(openedMenu) {
          self.allMenus.forEach(function (current) {
            if (openedMenu.getId() !== current.getId() && current.is('opened')) {
              current.closeMenu();
            }
          });
        });
        return menu;
      },

      /**
       * Create a entry component instance
       * @param {Object} config
       * @param {String} config.control - will be used as the instance id and in the data-control html attribute
       * @param {String} config.title - will be used in the title html attribute
       * @param {String} config.icon - the icon for the button
       * @param {String} config.text - the button label
       * @param {String} config.className - an extra class
       * @returns {Component} the create instance
       */
      createEntry: function createEntry(config) {
        var extendedConfig = Object.assign({
          role: "option"
        }, config);
        var item = entryFactory().init(extendedConfig);
        this.allItems.push(item);
        return item;
      },

      /**
       * Create a text component instance
       * @param {Object} config
       * @param {String} config.control - will be used as the instance id and in the data-control html attribute
       * @param {String} config.text - the text content
       * @param {String} config.className - an extra class
       * @returns {Component} the create instance
       */
      createText: function createText(config) {
        var text = textFactory().init(config);
        this.allItems.push(text);
        return text;
      },

      /**
       * If the given item belongs to a menu
       * @param {Object} item
       * @returns {Boolean}
       */
      hasMenu: function hasMenu(item) {
        return item && _.isFunction(item.getMenuId) && item.getMenuId();
      }
    };
    /**
     * Default renderer. It simply appends all the registered items in the toolbox, one after the other
     * @param {jQuery} $container - where to render
     */

    function defaultRenderer($container) {
      var self = this,
          menuEntries = []; // render first level

      if (_.isArray(this.allItems)) {
        this.allItems.forEach(function (item) {
          // items belonging to menus will be processed later
          if (!self.hasMenu(item)) {
            item.render($container);
          }
        });
      } // Render each menu


      this.allMenus.forEach(function (menu) {
        var menuId = menu.getId(); // first, we gather all items relevant to the current menu

        menuEntries = self.allItems.filter(function (item) {
          return item.getType() === 'entry' && item.getMenuId() === menuId;
        }); // we then add entries to the current menu

        menuEntries.forEach(function (item) {
          menu.addItem(item);
        }); // and finally render the whole menu

        menu.renderItems();
      });
    }
    /**
     * The toolbox factory
     */


    function toolboxComponentFactory(specs, defaults) {
      var $document = $$1(document),
          toolboxComponent;
      specs = _.defaults(specs || {}, toolboxComponentApi);
      toolboxComponent = componentFactory(specs, defaults).on('init', function () {
        this.initToolbox();
      }) // overridable renderer
      .on('render.defaultRenderer', defaultRenderer) // non-overridable renderer
      .on('render', function () {
        var self = this; // fixme: try to bind this behavior on the blur event of each menu

        $document.off('.toolboxmenu');
        $document.on('click.toolboxmenu', function () {
          self.allMenus.forEach(function (menu) {
            if (menu.is('opened')) {
              menu.closeMenu();
            }
          });
        });
      }).on('destroy', function () {
        $document.off('.toolboxmenu');
        this.allItems.forEach(function (item) {
          item.destroy();
        });
      }).setTemplate(toolboxTpl);
      return toolboxComponent;
    }

    return toolboxComponentFactory;

});
