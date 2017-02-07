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
 * This factory creates a component to be used as a toolbox entry
 * This component will then be rendered either:
 * - as a menu entry, if given a menuId that matches an existing menu
 * - as a standalone button otherwise
 *
 * Do not instanciate directly, but use the relevant toolbox method:
 * toolbox.createEntry({
 *      control: 'item-id',
 *      title: __('Html title'),
 *      icon: 'icon',
 *      text: __('Displayed label')
 * });
 *
 * @author Christophe Noël <christophe@taotesting.com>
 */
define([
    'lodash',
    'ui/component',
    'tpl!taoQtiTest/runner/plugins/templates/button'
], function(_, componentFactory, entryTpl) {
    'use strict';

    var itemComponentApi = {
        /**
         * Initialise the item
         */
        initItem: function initItem() {
            this.id = this.config.control;
            this.menu = null;
        },

        /**
         * Get the type of the component
         */
        getType: function getType() {
            return 'entry';
        },

        /**
         * Get the item Id
         * @returns {String}
         */
        getId: function getId() {
            return this.id;
        },

        /**
         * Set the menu to whom the item belong
         * @param {String} menuId
         * @returns {String}
         */
        setMenuId: function setMenuId(menuId) {
            this.menuId = menuId;
        },

        /**
         * Get the id of the menu to whom the item belong
         * @returns {String}
         */
        getMenuId: function getMenuId() {
            return this.menuId;
        },

        /**
         * Set the item as active. For example, if it opens a tool,
         * the item should be represented 'on' as long as the tool remains opened
         */
        turnOn: function turnOn() {
            this.setState('active', true);
        },

        /**
         * Set the item as inactive
         */
        turnOff: function turnOff() {
            this.setState('active', false);
        },

        /**
         * Set the item as hovered, whether by the mouse or by keyboard navigation
         */
        hoverOn: function hoverOn() {
            this.setState('hover', true);
        },

        /**
         * Turn off the hovered style
         */
        hoverOff: function hoverOff() {
            this.setState('hover', false);
        }
    };

    /**
     * The item factory
     */
    return function itemComponentFactory(specs, defaults) {
        var itemComponent;

        specs = _.defaults(specs || {}, itemComponentApi);

        itemComponent = componentFactory(specs, defaults)
            .setTemplate(entryTpl)
            .on('enable', function() {
                if (this.is('rendered')) {
                    this.$component.removeProp('disabled');
                }
            })
            .on('disable', function() {
                if (this.is('rendered')) {
                    this.$component.prop('disabled', true);
                    this.turnOff();
                }
            })
            .on('init', function () {
                this.initItem();
            })
            .on('render', function() {
                var self = this;

                this.disable(); // we always render disabled by default

                // forward DOM events to the component object
                this.$component
                    .on('mousedown', function(event) {
                        self.trigger('mousedown', event);
                    })
                    .on('click', function(event) {
                        self.trigger('click', event);
                    });
            });

        return itemComponent;
    };
});