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
    'util/shortcut',
    'util/namespace',
    'tpl!taoQtiTest/runner/ui/toolbox/templates/menu',
    'tpl!taoQtiTest/runner/ui/toolbox/templates/menu-item'
], function($, _, componentFactory, hider, shortcut, namespaceHelper, menuTpl, menuItemTpl) {
    'use strict';

    var keyCodes = {
        ENTER: 13,
        SPACE: 32,
        UP:    38,
        DOWN:  40
    };

    var menuComponentApi = {

        getId: function getId() {
            return this.id;
        },

        renderItem: function renderItem(item) {
            this.menuItems.push(item); // keep a reference to the item
            item.setTemplate(menuItemTpl);
            item.render(this.$menuContent);
            item.enable();
        },

        getItemById: function getItemById(itemId) {
            return _.find(this.menuItems, function(item) {
                return item.getId() === itemId;
            });
        },

        hasDisplayedItems: function hasDisplayedItems() {
            return this.menuItems.some(function (item) {
                return !item.is('disabled') && !item.is('hidden');
            });
        },

        activate: function activate() {
            this.setState('active', true);
        },

        deactivate: function deactivate() {
            this.setState('active', false);
        },

        deactivateAll: function deactivateAll() {
            this.menuItems.forEach(function (current) {
                current.deactivate();
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
            // var self = this;

            // show the menu
            hider.show(this.$menuContainer);

            // change the button icon
            this.$menuStateIcon.removeClass('icon-up');
            this.$menuStateIcon.addClass('icon-down');

            this.activate();
            this.enableShortcuts();

            // handle highlighting
            this.turnOffItems();
            this.highlightIndex = this.menuItems.length; // we start on the button, not at the max array index
                                                     // which would be items.length-1
            // focus the menu
            if(document.activeElement){
                document.activeElement.blur();
            }
            this.$menuContainer.focus();

            // close on click outside of the component
            // $(document).on('click.toolboxMenu', function(e) {
            //     var $target = $(e.target);
            //     console.log('click detected');
            //     if ($target.closest('[data-control="' + self.config.control + '"]').length === 0) {
            //         self.closeMenu();
            //     }
            // });
        },

        closeMenu: function closeMenu() {
            hider.hide(this.$menuContainer);
            this.$menuStateIcon.removeClass('icon-down');
            this.$menuStateIcon.addClass('icon-up');
            this.deactivate();
            this.turnOffItems();
            this.disableShortcuts();
            $(document).off('.toolboxMenu');
        },

        mouseOverItem: function mouseOverItem(itemId) {
            var self = this;

            this.menuItems.forEach(function (item, index) { //todo: optimize this
                if (item.id === itemId) {
                    self.highlightIndex = index;
                }
            });

            this.highlightItem(itemId);
        },

        /**
         * highlight the currently hovered menu entry
         */
        highlightItem: function highlightItem(id) {
            var itemToHighlight = this.getItemById(id);
            this.turnOffItems();

            itemToHighlight.highlight();
        },

        turnOffItems: function turnOffItems() {
            this.menuItems.forEach(function(current) {
                current.turnOff();
            });
        },

        triggerActiveItem: function triggerActiveItem() {
            var activeItem;
            if (this.menuItems[this.highlightIndex]) {
                activeItem = this.menuItems[this.highlightIndex];
                activeItem.getElement().trigger('click');
                this.closeMenu();
            }
        },

        moveUp: function moveUp() {
            // move to the previous item
            if (this.highlightIndex > 0) {
                this.highlightIndex--;
                this.highlightItem(this.menuItems[this.highlightIndex].id);
            }
        },

        moveDown: function moveDown() {
            // move to the next item
            if (this.highlightIndex < (this.menuItems.length - 1)) {
                this.highlightIndex++;
                this.highlightItem(this.menuItems[this.highlightIndex].id);

            // move to the menu button
            } else if (this.highlightIndex === (this.menuItems.length - 1)) {
                this.highlightIndex++;
                this.turnOffItems();
                this.$menuButton.focus();
            }
        },

        /**
         * register menu's own shortcuts
         */
        enableShortcuts: function enableShortcuts() {
            var self = this;

            this.$menuContainer.on('keydown.menuNavigation', function (e) {
                var currentKeyCode = e.keyCode ? e.keyCode : e.charCode;

                e.preventDefault();

                switch (currentKeyCode) {
                    case keyCodes.SPACE:
                    case keyCodes.ENTER: self.triggerActiveItem(); e.stopPropagation(); break;
                    case keyCodes.UP:    self.moveUp();  e.stopPropagation(); break;
                    case keyCodes.DOWN:  self.moveDown();  e.stopPropagation(); break;
                }
            });

            this.$menuButton.on('keydown.menuNavigation', function (e) {
                var currentKeyCode = e.keyCode ? e.keyCode : e.charCode;

                if (currentKeyCode === keyCodes.UP) {
                    self.highlightIndex = self.menuItems.length - 1;
                    self.$menuContainer.focus();
                    self.highlightItem(self.menuItems[self.highlightIndex].id);
                }
            });
        },

        /**
         * unregister menu's own shortcuts
         */
        disableShortcuts: function disableShortcuts() {
            this.$menuContainer.off('.menuNavigation'); //todo: in destroy also
            this.$menuButton.off('.menuNavigation'); //todo: in destroy also
        }


    };


    return function menuComponentFactory(specs, defaults) {
        var menuComponent;

        specs = _.defaults(specs || {}, menuComponentApi);

        menuComponent = componentFactory(specs, defaults)
            .setTemplate(menuTpl)
            .on('enable', function enable() {
                if (this.is('rendered')) {
                    this.$component.removeProp('disabled');
                }
            })
            .on('disable', function disable() {
                if (this.is('rendered')) {
                    this.$component.prop('disabled', true);
                    this.closeMenu();
                }
            })
            .on('hide', function disable() {
                if (this.is('rendered')) {
                    this.closeMenu();
                }
            })
            .on('init', function init() {
                this.menuItems = [];
                this.id = this.config.control;

            })
            .on('render', function render() {
                var self = this;

                this.$menuButton    = this.$component.find('[data-control="' + this.config.control + '-button"]');
                this.$menuContainer = this.$component.find('[data-control="' + this.config.control + '-menu"]');
                this.$menuContent   = this.$component.find('[data-control="' + this.config.control + '-list"]');
                this.$menuStateIcon = this.$menuButton.find('.icon-up');

                this.disable(); // always render disabled by default

                /* * /
                this.$menuContainer.on('focusout', function() {
                    // fixme: do not automatically close the menu if the user clicks on the button
                    console.log('blur');
                    // if(document.activeElement){
                    //     console.dir(document.activeElement);
                    // }
                    self.closeMenu();
                });
                /* */

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

            }).on('itemsrendered', function() {
                var self = this;

                this.$menuItems = this.$menuContent.find('.menu-item');

                this.$menuItems.on('mouseenter', function highlightHoveredEntry(e) {
                    var itemId = e.currentTarget.getAttribute('data-control');
                    self.mouseOverItem(itemId);
                });
            });

        return menuComponent;
    };
});