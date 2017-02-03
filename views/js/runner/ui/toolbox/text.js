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
 * This factory creates a component to be used as a toolbox item.
 * It will be rendered as text with no special behavior, and can be used to create buttons separators, for example.

 * Do not instanciate directly, but use the relevant toolbox method:
 * toolbox.createText({
 *      control: 'text-id',
 *      text: __('Text content')
 * });

 * @author Christophe Noël <christophe@taotesting.com>
 */
define([
    'lodash',
    'ui/component',
    'tpl!taoQtiTest/runner/ui/toolbox/templates/text'
], function(_, componentFactory, textTpl) {
    'use strict';

    var textComponentApi = {
        /**
         * Initialise text
         * @returns {String}
         */
        initText: function initText() {
            this.id = this.config.control;
        },

        /**
         * Get the type of the component
         */
        getType: function getType() {
            return 'text';
        },

        /**
         * Get the item Id
         * @returns {String}
         */
        getId: function getId() {
            return this.id;
        }
    };


    /**
     * The text factory
     */
    return function textComponentFactory(specs, defaults) {
        var textComponent;

        specs = _.defaults(specs || {}, textComponentApi);

        textComponent = componentFactory(specs, defaults)
            .setTemplate(textTpl)
            .on('init', function() {
                this.initText();
            })
            .on('render', function() {
                this.disable(); // always render disabled first
            });

        return textComponent;
    };
});