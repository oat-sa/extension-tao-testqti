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
    'tpl!taoQtiTest/runner/ui/toolbox/templates/text'
], function(_, componentFactory, textTpl) {
    'use strict';

    var buttonComponentApi = {
        getId: function getId() {
            return this.id;
        }
    };


    return function buttonComponentFactory(specs, defaults) {
        var buttonComponent;

        specs = _.defaults(specs || {}, buttonComponentApi);

        buttonComponent = componentFactory(specs, defaults)
            .setTemplate(textTpl)
            .on('init', function() {
                this.id = this.config.control;
            });

        return buttonComponent;
    };
});