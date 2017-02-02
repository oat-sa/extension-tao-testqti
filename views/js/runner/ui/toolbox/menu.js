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
    'jquery',
    'lodash',
    'ui/component',
    'ui/hider',
    'tpl!taoQtiTest/runner/ui/toolbox/templates/menu',
    'tpl!taoQtiTest/runner/ui/toolbox/templates/menu-item'
], function($, _, componentFactory, hider, menuTpl, menuItemTpl) {
    'use strict';

    var menuComponentApi = {

        renderItem: function renderItem(item) {
            this.items.push(item); // keep a reference to the item
            item.component.setTemplate(menuItemTpl);
            item.component.render(this.$menuContent);
            item.component.enable();
        },

        activate: function activate() {
            this.setState('active', true);
        },

        deactivate: function deactivate() {
            this.setState('active', false);
        },

        deactivateAll: function deactivateAll() {
            this.items.forEach(function (current) {
                current.component.deactivate();
            });
        },

        toggleMenu: function showMenu() {
            if (! this.is('disabled')) {
                if (hider.isHidden(this.$menuContainer)) {
                    this.openMenu();
                } else {
                    this.closeMenu();
                }
            }
        },

        openMenu: function openMenu()  {
            hider.show(this.$menuContainer);
            this.$menuStateIcon.removeClass('icon-up');
            this.$menuStateIcon.addClass('icon-down');
            this.activate();
            this.turnOffItems();

            // focus the menu
            if(document.activeElement){
                document.activeElement.blur();
            }
            this.$menuContainer.focus();
        },

        closeMenu: function closeMenu() {
            hider.hide(this.$menuContainer);
            this.$menuStateIcon.removeClass('icon-down');
            this.$menuStateIcon.addClass('icon-up');
            this.deactivate();
            this.turnOffItems();
        },


        /**
         * highlight the currently hovered menu entry
         */
        highlightItem: function highlightItem(id) {
            var itemToHighlight = _.find(this.items, { id: id });
            this.turnOffItems();

            itemToHighlight.component.highlight();
        },

        turnOffItems: function turnOffItems() {
            this.items.forEach(function(current) {
                current.component.turnOff();
            });
        }


    };


    return function menuComponentFactory(specs, defaults) {
        var menuComponent;

        specs = _.defaults(specs || {}, menuComponentApi);

        menuComponent = componentFactory(specs, defaults)
            .setTemplate(menuTpl)
            .on('enable', function enable() {
                if (this.$component) {
                    this.$component.removeProp('disabled');
                }
            })
            .on('disable', function disable() {
                if (this.$component) {
                    this.$component.prop('disabled', true);
                }
            })
            .on('init', function init() {
                this.items = [];
            })
            .on('render', function render() {
                var self = this;

                this.$menuButton    = this.$component.find('[data-control="' + this.config.control + '-button"]');
                this.$menuContainer = this.$component.find('[data-control="' + this.config.control + '-menu"]');
                this.$menuContent   = this.$component.find('[data-control="' + this.config.control + '-list"]');
                this.$menuStateIcon = this.$menuButton.find('.icon-up');

                this.disable(); // always render disabled by default

                /*
                this.$menuContainer.on('focusout blur', function() {
                    // fixme: do not automatically close the menu if the user clicks on the button
                    console.log('blur');
                    if(document.activeElement){
                        console.dir(document.activeElement);
                    }
                    self.closeMenu();
                });
                */

                this.$component.on('click', function toggleMenu(e) {
                    e.preventDefault();
                    self.toggleMenu();
                });

                this.$menuContainer.on('click', function closeMenuOnItemClick(e) {
                    e.preventDefault();
                    e.stopPropagation(); // so the menu doesn't get toggled again
                    self.closeMenu();
                });

                this.$menuContent.on('mouseleave', this.turnOffItems);
            });

        menuComponent.on('itemsrendered', function() {
            var self = this;
            this.$menuItems     = this.$menuContent.find('.menu-item');

            this.$menuItems.on('mouseenter', function highlightHoveredEntry(e) {
                var itemId = e.currentTarget.getAttribute('data-control');
                console.log('entering ' + itemId);
                self.highlightItem(itemId);
            });
        });

        return menuComponent;
    };
});