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
 * Copyright (c) 2016 (original work) Open Assessment Technologies SA;
 */

/**
 * Create a movable and resizable element in order to mask areas.
 *
 * @author Bertrand Chevrier <bertrand@taotesting.com>
 */
define([
    'lodash',
    'ui/component',
    'tpl!taoQtiTest/runner/plugins/tools/areaMasking/mask',
    'ui/dynamicComponent',
], function (_, component, areaMaskingTpl, dynamicComponent) {
    'use strict';

    var defaultConfig = {
        previewDelay: 3000,
        stackingScope: 'test-runner'
    };

    var dynamicComponentDefaultConfig = {
        draggable: true,
        resizable: true,
        preserveAspectRatio: false,
        width: 250,
        minWidth: 160,
        maxWidth: 1000,
        minHeight: 60,
        height: 100,
        stackingScope: 'test-runner',
        top: 50,
        left: 10,
    };

    /**
     * Creates a new masking component
     *
     * @param {Object} config - to overrides the default
     * @param {Object} dynamicComponentConfig - to overrides the default
     * @param {jQuery|HTMLElement|String} [dynamicComponentConfig.renderTo] - An optional container in which renders the component
     * @param {jQuery|HTMLElement|String} [dynamicComponentConfig.draggableContainer] - the DOMElement the draggable component will be constraint in
     * @returns {maskComponent} the component (uninitialized)
     */
    function maskingComponentFactory() {
        var dynamicComponentInstance;

        /**
         * @typedef {Object} maskComponent
         */
        var maskComponent = component({
            /**
             * Preview the content under the masked area
             * @returns {maskComponent} chains
             *
             * @fires maskComponent#preview
             */
            preview: function preview() {
                var self = this;
                var delay = this.config.previewDelay || 1000;
                if (this.is('rendered') && !this.is('disabled') && !this.is('previewing')) {
                    this.setState('previewing', true);
                    dynamicComponentInstance.setState('previewing', true);
                    dynamicComponentInstance.trigger('preview');
                    _.delay(function () {
                        self.setState('previewing', false);
                        dynamicComponentInstance.setState('previewing', false);
                    }, delay);
                }
                return this;
            }
        }, defaultConfig);

        dynamicComponentInstance = dynamicComponent({}, dynamicComponentDefaultConfig)
            .on('rendercontent', function ($content) {
                var dynamicComponentContext = this;
                var $element = this.getElement();

                $element.addClass('mask-container');

                maskComponent
                    .setTemplate(areaMaskingTpl)
                    .on('render', function () {
                        var self = this;

                        $element
                            .on('click touchstart', '.view', function (e) {
                                e.preventDefault();

                                self.preview();
                            })
                            .on('click touchend', '.close', function (e) {
                                e.preventDefault();

                                self.destroy();
                            });
                    })
                    .after('destroy', function () {
                        dynamicComponentContext.destroy();
                    })
                    .init()
                    .render($content);
            });

        return dynamicComponentInstance;
    }

    return maskingComponentFactory;
});
