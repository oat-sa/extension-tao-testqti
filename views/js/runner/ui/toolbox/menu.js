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
 * This factory creates a component that allows to create a toolbox menu.
 * It contains both the menu button and the menu itself.
 * Entries have to be added manually by the addItem() method.
 *
 * Do not instanciate directly, but use the relevant toolbox method:
 * toolbox.createMenu({
 *      control: 'menu-id',
 *      title: __('Html title'),
 *      icon: 'icon',
 *      text: __('Displayed label')
 * });
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
        LEFT:  37,
        UP:    38,
        RIGHT: 39,
        DOWN:  40
    };

    var menuComponentApi = {
        /**
         * Initialise the menu
         */
        initMenu: function initMenu() {
            this.id = this.config.control;
            this.menuItems = [];
        },

        /**
         * Get the type of the component
         */
        getType: function getType() {
            return 'menu';
        },

        /**
         * Get the menu Id
         * @returns {String}
         */
        getId: function getId() {
            return this.id;
        },

        /**
         * Set the menu as active, essentially meaning that the menu panel is opened
         */
        activate: function activate() {
            this.setState('active', true);
        },

        /**
         * Set the menu as inactive
         */
        deactivate: function deactivate() {
            this.setState('active', false);
        },


        /**
         * =====================
         * Actions on menu panel
         * =====================
         */


        /**
         * open/close the menu
         */
        toggleMenu: function showMenu() {
            if (! this.is('disabled')) {
                if (this.is('opened')) {
                    this.closeMenu();
                } else {
                    this.openMenu();
                }
            }
        },

        /**
         * open the menu
         */
        openMenu: function openMenu()  {
            // show the DOM element
            hider.show(this.$menuContainer);

            // change the menu button icon
            this.$menuStateIcon.removeClass('icon-up');
            this.$menuStateIcon.addClass('icon-down');

            // turn on the menu button
            this.activate();

            // setup keyboard navigation & highlighting
            this.enableShortcuts();
            this.turnOffItems();
            this.highlightIndex = this.menuItems.length; // we start on the button, not at the max array index
                                                         // which would be menuItems.length-1

            // focus the button, for keyboard navigation
            if(document.activeElement){
                document.activeElement.blur();
            }
            this.$menuButton.focus();

            // component inner state
            this.setState('opened', true);
            this.trigger('openmenu', this);
        },

        /**
         * close the menu
         */
        closeMenu: function closeMenu() {
            // hide the DOM element
            hider.hide(this.$menuContainer);

            // change the menu button icon
            this.$menuStateIcon.removeClass('icon-down');
            this.$menuStateIcon.addClass('icon-up');

            // turn off the button
            this.deactivate();

            // disable keyboard navigation & highlighting
            this.disableShortcuts();
            this.turnOffItems();

            // component inner state
            this.setState('opened', false);
            this.trigger('closemenu', this);
        },


        /**
         * =====================
         * Actions on menu items
         * =====================
         */


        /**
         * Look for a item in the internal item registry
         * @param {String} itemId
         * @returns {Object|undefined}
         */
        getItemById: function getItemById(itemId) {
            return _.find(this.menuItems, function(item) {
                return item.getId() === itemId;
            });
        },

        /**
         * Adds an item to the menu
         * @param {Component} item
         */
        addItem: function addItem(item) {
            this.menuItems.push(item);
        },

        /**
         * Render menu items into the menu panel
         */
        renderItems: function renderItems() {
            var self = this;
            this.menuItems.forEach(function (item) {
                item.setTemplate(menuItemTpl);  // the item has been created as generic. Let's give him now the menu entry template
                item.render(self.$menuContent);
                item.enable();
            });

            // bind mouse behavior on menu items
            this.$menuItems = this.$menuContent.find('.menu-item');

            this.$menuItems.on('mouseenter', function highlightHoveredEntry(e) {
                var itemId = e.currentTarget.getAttribute('data-control');
                self.mouseOverItem(itemId);
            });
        },

        /**
         * Highlight the currently hovered item
         * @param {String} itemId
         */
        mouseOverItem: function mouseOverItem(itemId) {
            var self = this;

            // look for item index
            this.menuItems.forEach(function (item, index) {
                if (item.id === itemId) {
                    self.highlightIndex = index;
                }
            });
            this.highlightItem(itemId);
        },

        /**
         * Check that the menu has at least one of its entries displayed
         * @returns {boolean}
         */
        hasDisplayedItems: function hasDisplayedItems() {
            return this.menuItems.some(function (item) {
                return !item.is('disabled') && !item.is('hidden');
            });
        },

        /**
         * Set all entries in the menu to inactive
         */
        deactivateAll: function deactivateAll() {
            this.menuItems.forEach(function (current) {
                current.deactivate();
            });
        },


        /**
         * =====================
         * Menu items navigation
         * =====================
         */


        /**
         * register the event handlers for keyboard navigation
         */
        enableShortcuts: function enableShortcuts() {
            var self = this;

            this.$menuContainer.on('keydown.menuNavigation', function (e) {
                var currentKeyCode = e.keyCode ? e.keyCode : e.charCode;

                e.preventDefault();

                switch (currentKeyCode) {
                    case keyCodes.SPACE:
                    case keyCodes.ENTER: self.triggerHighlightedItem(); e.stopPropagation(); break;
                    case keyCodes.LEFT:
                    case keyCodes.UP:    self.moveUp();                 e.stopPropagation(); break;
                    case keyCodes.RIGHT:
                    case keyCodes.DOWN:  self.moveDown();               e.stopPropagation(); break;
                }
            });

            this.$menuButton.on('keydown.menuNavigation', function (e) {
                var currentKeyCode = e.keyCode ? e.keyCode : e.charCode;

                if (currentKeyCode === keyCodes.UP) {
                    e.stopPropagation();
                    self.highlightIndex = self.menuItems.length - 1;
                    self.$menuContainer.focus();
                    self.highlightItem(self.menuItems[self.highlightIndex].id);
                }
            });
        },

        /**
         * remove the event handlers for keyboard navigation
         */
        disableShortcuts: function disableShortcuts() {
            this.$menuContainer.off('.menuNavigation');
            this.$menuButton.off('.menuNavigation');
        },

        /**
         * Move the highlight to the previous item
         */
        moveUp: function moveUp() {
            if (this.highlightIndex > 0) {
                this.highlightIndex--;
                this.highlightItem(this.menuItems[this.highlightIndex].id);
            }
        },

        /**
         * Move the highlight to the next item, or to the menu button if we are on the last item
         */
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
         * Highlight the given item
         * @param {String} itemId
         */
        highlightItem: function highlightItem(itemId) {
            var itemToHighlight = this.getItemById(itemId);
            this.turnOffItems();

            itemToHighlight.highlight();
        },

        /**
         * Remove highlight from all items
         */
        turnOffItems: function turnOffItems() {
            this.menuItems.forEach(function(current) {
                current.turnOff();
            });
        },

        /**
         * Run a click event on the DOM element of the currently highlighted item
         */
        triggerHighlightedItem: function triggerHighlightedItem() {
            var activeItem;
            if (this.menuItems[this.highlightIndex]) {
                activeItem = this.menuItems[this.highlightIndex];
                activeItem.getElement().trigger('click');
                this.closeMenu();
            }
        }
    };


    /**
     * The menu component factory
     */
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
                this.initMenu();

            })
            .on('render', function render() {
                var self = this;

                // get access to DOM elements
                this.$menuButton    = this.$component.find('[data-control="' + this.config.control + '-button"]');
                this.$menuContainer = this.$component.find('[data-control="' + this.config.control + '-menu"]');
                this.$menuContent   = this.$component.find('[data-control="' + this.config.control + '-list"]');
                this.$menuStateIcon = this.$menuButton.find('.icon-up');

                this.disable(); // always render disabled by default

                // add behavior
                this.$component.on('click', function toggleMenu(e) {
                    e.preventDefault();

                    if(! self.is('opened')) {
                        e.stopPropagation(); // prevent higher handler to auto-close the menu on click
                    }
                    self.toggleMenu();
                });

                this.$menuContainer.on('click', function closeMenuOnItemClick(e) {
                    e.preventDefault();
                    e.stopPropagation(); // so the menu doesn't get toggled again when the event bubble to the component
                    self.closeMenu();
                });

                this.$menuContent.on('mouseleave', this.turnOffItems);

            })
            .on('destroy', function() {
                this.$menuContainer.off('.menuNavigation');
                this.$menuButton.off('.menuNavigation');
            });

        return menuComponent;
    };
});