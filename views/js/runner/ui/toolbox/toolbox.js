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
/**
 * Component to be registered in the area broker
 *
 * @author Christophe Noël <christophe@taotesting.com>
 */
define([
    'lodash',
    'jquery',
    'ui/component',
    'taoQtiTest/runner/ui/toolbox/item',
    'taoQtiTest/runner/ui/toolbox/menu',
    'taoQtiTest/runner/ui/toolbox/text',
    'tpl!taoQtiTest/runner/ui/toolbox/templates/toolbox'
], function(_, $, componentFactory, itemFactory, menuFactory, textFactory, toolboxTpl) {
    'use strict';

    var toolbarComponentApi = {

        initToolbox: function initToolbox() {
            this.allItems = [];
            this.allMenus = [];
        },

        createMenu: function createMenu(config) {
            var self = this,
                menu = menuFactory().init(config);
            this.allItems.push(menu);
            this.allMenus.push(menu);

            // add an event handler to close all opened menu when opening
            menu.on('openmenu', function closeAllMenuExcept(openedMenu) {
                self.allMenus.forEach(function(current) {
                    if (openedMenu.getId() !== current.getId()) {
                        current.closeMenu();
                    }
                });
            });

            return menu;
        },

        createItem: function createItem(config)  {
            var item = itemFactory().init(config);
            this.allItems.push(item);
            return item;
        },

        createText: function createText(config) {
            var text = textFactory().init(config);
            this.allItems.push(text);
            return text;
        },

        hasMenu: function hasMenu(item) {
            return item && _.isFunction(item.getMenuId) && item.getMenuId();
        }
    };


    /**
     * Default renderer. It simply appends all the registered items in the toolbar and the menus
     * @param {jQuery} $container - where to render
     */
    function defaultRenderer($container) {
        var self = this,
            allMenus = {},
            menuEntries = [];

        // render first level
        if (_.isArray(this.allItems)) {
            this.allItems.forEach(function (current) {

                // save items belonging to menus for later processing
                if (self.hasMenu(current)) {
                    menuEntries.push(current);

                // and render the others
                } else {
                    current.render($container);
                }

            });
        }

        // Render the menu entries of each menu
        menuEntries.forEach(function (menuItem) {
            var menuId = menuItem.getMenuId();

            //fixme : we have this in this.allMenus now !
            // retrieve the menu instance if needed
            if (menuId && !allMenus[menuId]) {
                allMenus[menuId] = _.find(self.allItems, function(item) {
                    return item.getId() === menuId;
                });
            }

            // delegates the rendering to the menu instance
            if (allMenus[menuId]) {
                allMenus[menuId].renderItem(menuItem);
            }
        });

        // we tell the menus that all their items have been rendered
        _.forOwn(allMenus, function(menu) {
            menu.trigger('itemsrendered');
        });
    }

    return function toolbarComponentFactory(specs, defaults) {
        var toolbarComponent;

        specs = _.defaults(specs || {}, toolbarComponentApi);

        toolbarComponent = componentFactory(specs, defaults)
            .on('init', function () {
                this.initToolbox();
            })
            // overridable renderer
            .on('render.defaultRenderer', defaultRenderer)

            // non-overridable renderer
            .on('render', function() {
                var self = this;

                // fixme: try to bind this behavior on the blur event of each menu
                $(document).off('.toolboxmenu');
                $(document).on('click.toolboxmenu', function() {
                    self.allMenus.forEach(function(menu) {
                        if (menu.is('opened')) {
                            menu.closeMenu();
                        }
                    });
                });
            })
            .on('destroy', function() {
                $(document).off('.toolboxmenu');
            })
            .setTemplate(toolboxTpl);

        // todo: implement destroy behavior on each component

        return toolbarComponent;
    };
});