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
 * Test Previewer Navigation Plugin : Submit
 *
 * @author Jean-Sébastien Conan <jean-sebastien@taotesting.com>
 */
define([
    'jquery',
    'lodash',
    'i18n',
    'ui/hider',
    'taoTests/runner/plugin',
    'taoQtiTest/runner/helpers/messages',
    'tpl!taoQtiTest/runner/plugins/templates/button',
    'tpl!taoQtiTest/previewer/plugins/navigation/submit/preview-console',
    'tpl!taoQtiTest/previewer/plugins/navigation/submit/preview-console-closer'
], function ($, _, __, hider, pluginFactory, messages, buttonTpl, previewConsoleTpl, previewConsoleCloserTpl) {
    'use strict';

    return pluginFactory({

        name: 'submit',

        /**
         * Initialize the plugin (called during runner's init)
         */
        init: function init() {
            var self = this;
            var testRunner = this.getTestRunner();

            this.controls = {
                $button: $(buttonTpl({
                    control: 'submit',
                    title: __('Submit and show the result'),
                    icon: 'forward',
                    text: __('Submit')
                })),
                $console: $(previewConsoleTpl()),
                $consoleCloser: $(previewConsoleCloserTpl())
            };


            this.controls.$button.on('click', function (e) {
                e.preventDefault();
                if (self.getState('enabled') !== false) {
                    self.disable();
                    testRunner.trigger('submititem');
                }
            });

            this.disable();

            testRunner
                .on('responseitem', function (response) {
                    console.log(response);
                })
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
            var $container = this.getAreaBroker().getContainer();
            var $navigation = this.getAreaBroker().getNavigationArea();
            $navigation.append(this.controls.$button);
            $navigation.append(this.controls.$consoleCloser);
            $container.append(this.controls.$console);
        },

        /**
         * Called during the runner's destroy phase
         */
        destroy: function destroy() {
            _.forEach(this.controls, function ($el) {
                $el.remove();
            });
            this.controls = null;
        },

        /**
         * Enable the button
         */
        enable: function enable() {
            _.forEach(this.controls, function ($el) {
                $el.removeProp('disabled').removeClass('disabled');
            });
        },

        /**
         * Disable the button
         */
        disable: function disable() {
            _.forEach(this.controls, function ($el) {
                $el.prop('disabled', true).addClass('disabled');
            });
        },

        /**
         * Show the button
         */
        show: function show() {
            _.forEach(this.controls, hider.show);
        },

        /**
         * Hide the button
         */
        hide: function hide() {
            _.forEach(this.controls, hider.hide);
        }
    });
});
