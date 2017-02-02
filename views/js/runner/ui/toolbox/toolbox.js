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
    'ui/component',
    'taoQtiTest/runner/ui/toolbox/item',
    'taoQtiTest/runner/ui/toolbox/menu',
    'tpl!taoQtiTest/runner/ui/toolbox/templates/toolbox',
    'tpl!taoQtiTest/runner/ui/toolbox/templates/text'
], function(_, componentFactory, itemFactory, menuFactory, toolboxTpl, textTpl) {
    'use strict';

    var toolbarComponentApi = {

        initToolbar: function initToolbar() {
            this.items = []; // we use an array to maintain insertion order
        },

        createMenu: function createMenu(config) {
            var menu = menuFactory()
                .init(config);
            this.items.push({
                id: config.control,
                type: 'menu',
                item: menu
            });
            return menu;
        },

        createItem: function createItem(config, menuId)  {
            var item = itemFactory()
                .init(config);
            this.items.push({
                id: config.control,
                type: 'item', //todo: replace with getType() ? useful ?
                item: item,
                menuId: menuId
            });
            return item;
        },

        createText: function createText(config) {
            var text = componentFactory()
                .setTemplate(textTpl)
                .init(config);
            this.items.push({
                id: config.control,
                item: text
            });
            return text;
        },

        /**
         * Set the elements that composes the area
         * @param allElements
         */
        setElements: function setElements(allElements) {
            this.elements = allElements;
        },

        /**
         * Returns the elements that compose the area
         * @returns {*}
         */
        getElements: function getElements() {
            return this.elements;
        }
    };


    /**
     * Default renderer. It simply appends all the registered items in the toolbar and the menus
     * @param {jQuery} $container - where to render
     */
    function defaultRenderer($container) {
        var self = this,
            menuEntries = [];

        // render first level
        if (this.items && _.isArray(this.items)) {
            this.items.forEach(function (current) {

                // do not render directly items belonging to menus
                if (!current.menuId) {
                    current.item.render($container);

                // but save for later
                } else {
                    menuEntries.push(current);
                }

            });
        }

        // delegates the rendering of menu items to the menu components
        menuEntries.forEach(function (current) {
            var menu = _.find(self.items, { id: current.menuId }); //fixme: this needs optimizing!!!

            if (menu) {
                menu.item.renderItem(current.item);
            }
        });
    }

    return function toolbarComponentFactory(specs, defaults) {
        var toolbarComponent;

        specs = _.defaults(specs || {}, toolbarComponentApi);

        toolbarComponent = componentFactory(specs, defaults)
            .on('init', function () {
                this.initToolbar();
            })
            .on('render.defaultRenderer', defaultRenderer)
            .setTemplate(toolboxTpl);

        return toolbarComponent;
    };
});