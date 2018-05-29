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
 * Copyright (c) 2018 (original work) Open Assessment Technologies SA ;
 */

/**
 * Test Previewer Control Plugin : Close
 *
 * @author Jean-Sébastien Conan <jean-sebastien@taotesting.com>
 */
define([
    'jquery',
    'lodash',
    'i18n',
    'ui/hider',
    'taoTests/runner/plugin',
    'tpl!taoQtiTest/runner/plugins/templates/button'
], function ($, _, __, hider, pluginFactory, buttonTpl) {
    'use strict';

    return pluginFactory({

        name: 'close',

        /**
         * Initialize the plugin (called during runner's init)
         */
        init: function init() {
            var self = this;
            var testRunner = this.getTestRunner();

            this.$element = $(buttonTpl({
                control: 'close',
                title: __('Close the previewer'),
                icon: 'close',
                text: __('Close'),
                className: 'context-action'
            }));

            this.$element.on('click', function (e) {
                e.preventDefault();
                if (self.getState('enabled') !== false) {
                    self.disable();
                    testRunner.trigger('finish');
                }
            });

            this.disable();

            testRunner
                .on('enablenav', function () {
                    self.enable();
                })
                .on('disablenav', function () {
                    self.disable();
                });
        },

        /**
         * Called during the runner's render phase
         */
        render: function render() {

            //attach the element to the navigation area
            var $container = this.getAreaBroker().getArea('context');
            $container.append(this.$element);
        },

        /**
         * Called during the runner's destroy phase
         */
        destroy: function destroy() {
            this.$element.remove();
        },

        /**
         * Enable the button
         */
        enable: function enable() {
            this.$element.removeProp('disabled')
                .removeClass('disabled');
        },

        /**
         * Disable the button
         */
        disable: function disable() {
            this.$element.prop('disabled', true)
                .addClass('disabled');
        },

        /**
         * Show the button
         */
        show: function show() {
            hider.show(this.$element);
        },

        /**
         * Hide the button
         */
        hide: function hide() {
            hider.hide(this.$element);
        }
    });
});
