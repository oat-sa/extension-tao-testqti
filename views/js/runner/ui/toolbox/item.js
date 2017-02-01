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
        activate: function activate() {
            this.setState('active', true);
        },

        deactivate: function deactivate() {
            this.setState('active', false);
        }
    };


    return function buttonComponentFactory(specs, defaults) {
        var buttonComponent;

        specs = _.defaults(specs || {}, buttonComponentApi);

        buttonComponent = componentFactory(specs, defaults)
            .setTemplate(buttonTpl)
            .on('enable', function() {
                if (this.$component) {
                    this.$component.removeProp('disabled');
                }
            })
            .on('disable', function() {
                if (this.$component) {
                    this.$component.prop('disabled', true);
                }
            })
            .on('render', function() {
                var self = this;
                this.$component
                    .on('mousedown', function(event) {
                        self.trigger('mousedown', event);
                    })
                    .on('click', function(event) {
                        self.trigger('click', event);
                    });

            })
            .init();

        return buttonComponent;
    };
});