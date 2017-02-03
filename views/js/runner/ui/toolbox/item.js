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
    'tpl!taoQtiTest/runner/ui/toolbox/templates/item'
], function(_, componentFactory, buttonTpl) {
    'use strict';

    var buttonComponentApi = {
        getId: function getId() {
            return this.id;
        },

        setMenuId: function setMenuId(menuId) {
            this.menuId = menuId;
        },

        getMenuId: function getMenuId() {
            return this.menuId;
        },

        activate: function activate() {
            this.setState('active', true);
        },

        deactivate: function deactivate() {
            this.setState('active', false);
        },

        highlight: function highlight() {
            this.setState('hover', true);
        },

        turnOff: function turnOff() {
            this.setState('hover', false);
        }
    };


    return function buttonComponentFactory(specs, defaults) {
        var buttonComponent;

        specs = _.defaults(specs || {}, buttonComponentApi);

        buttonComponent = componentFactory(specs, defaults)
            .setTemplate(buttonTpl)
            .on('enable', function() {
                if (this.is('rendered')) {
                    this.$component.removeProp('disabled');
                }
            })
            .on('disable', function() {
                if (this.is('rendered')) {
                    this.$component.prop('disabled', true);
                }
            })
            .on('init', function () {
                this.id = this.config.control;
                this.menu = null;
            })
            .on('render', function() {
                var self = this;

                this.disable(); // we always render disabled by default

                this.$component
                    .on('mousedown', function(event) {
                        self.trigger('mousedown', event);
                    })
                    .on('click', function(event) {
                        self.trigger('click', event);
                    });

            });

        return buttonComponent;
    };
});