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
    'tpl!taoQtiTest/runner/ui/toolbox/templates/toolbox'
], function(_, componentFactory, itemFactory, menuFactory, toolboxTpl) {
    'use strict';

    var toolbarComponentApi = {

        initToolbar: function initToolbar() {
            this.entries = []; // we use an array to maintain insertion order
        },

        createMenu: function createMenu(config) {
            var menu = menuFactory()
                .init(config);
            this.entries.push({
                id: config.control,
                type: 'menu',
                entry: menu
            });
            return menu;
        },

        createItem: function createItem(config, menuId)  {
            var item = itemFactory()
                .init(config);
            this.entries.push({
                id: config.control,
                type: 'item', //todo: replace with getType()
                entry: item,
                menuId: menuId
            });
            return item;
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
     * Default renderer. It simply appends all the registered entries in the toolbar and the menus
     * @param {jQuery} $container - where to render
     */
    function defaultRenderer($container) {
        var self = this,
            menuEntries = [];

        // render first level
        if (this.entries && _.isArray(this.entries)) {
            this.entries.forEach(function (current) {

                // do not render directly items belonging to menus
                if (!current.menuId) {
                    current.entry.render($container);

                // but save for later
                } else {
                    menuEntries.push(current);
                }

            });
        }

        // delegates the rendering of menu entries to the menu components
        menuEntries.forEach(function (current) {
            var menu = _.find(self.entries, { id: current.menuId }); //fixme: this needs optimizing!!!

            if (menu) {
                menu.entry.renderEntry(current.entry);
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