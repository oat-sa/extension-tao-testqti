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
    'ui/autoscroll',
    'util/strPad',
    'taoTests/runner/plugin',
    'taoQtiItem/qtiCommonRenderer/helpers/PciResponse',
    'taoQtiTest/runner/helpers/messages',
    'tpl!taoQtiTest/runner/plugins/templates/button',
    'tpl!taoQtiTest/previewer/plugins/navigation/submit/preview-console',
    'tpl!taoQtiTest/previewer/plugins/navigation/submit/preview-console-line',
    'tpl!taoQtiTest/previewer/plugins/navigation/submit/preview-console-closer'
], function (
    $,
    _,
    __,
    hider,
    autoscroll,
    strPad,
    pluginFactory,
    pciResponse,
    messages,
    buttonTpl,
    consoleTpl,
    consoleLineTpl,
    consoleCloserTpl
) {
    'use strict';

    return pluginFactory({

        name: 'submit',

        /**
         * Initialize the plugin (called during runner's init)
         */
        init: function init() {
            var self = this;
            var testRunner = this.getTestRunner();

            /**
             * Tells if the component is enabled
             * @returns {Boolean}
             */
            function isPluginAllowed() {
                var config = testRunner.getConfig();
                return !config.readOnly;
            }

            // display the console and its related controls, then auto scrolls to the last element
            function showConsole() {
                hider.show(self.controls.$console);
                hider.show(self.controls.$consoleBody);
                hider.show(self.controls.$consoleCloser);
                autoscroll(self.controls.$consoleBody.children().last(), self.controls.$consoleBody);
            }

            // hide the console and its related controls
            function hideConsole() {
                hider.hide(self.controls.$console);
                hider.hide(self.controls.$consoleCloser);
            }

            // add a line to the console
            function addConsoleLine(type, message) {
                var time = new Date();
                var data = {
                    time: strPad([
                        strPad(time.getHours(), 2, '0', 'STR_PAD_LEFT'),
                        strPad(time.getMinutes(), 2, '0', 'STR_PAD_LEFT'),
                        strPad(time.getSeconds(), 2, '0', 'STR_PAD_LEFT')
                    ].join(':'), 12, ' '),
                    type: strPad(type || '', 18, ' '),
                    message: strPad(message || '', 18, ' ')
                };
                self.controls.$consoleBody.append($(consoleLineTpl(data)));
            }

            // display responses in the console
            function showResponses(type, responses) {
                _.forEach(responses, function (response, identifier) {
                    addConsoleLine(type, strPad(identifier + ': ', 15, ' ') + _.escape(pciResponse.prettyPrint(response)));
                });
            }

            this.controls = {
                $button: $(buttonTpl({
                    control: 'submit',
                    title: __('Submit and show the result'),
                    icon: 'forward',
                    text: __('Submit')
                })),
                $console: $(consoleTpl()),
                $consoleCloser: $(consoleCloserTpl())
            };
            this.controls.$consoleBody = this.controls.$console.find('.preview-console-body');

            this.controls.$button.on('click', function (e) {
                e.preventDefault();
                if (self.getState('enabled') !== false) {
                    self.disable();
                    testRunner.trigger('submititem');
                }
            });

            this.controls.$consoleCloser.on('click', function (e) {
                e.preventDefault();
                hideConsole();
            });

            if (!isPluginAllowed()) {
                this.hide();
            }

            this.disable();

            testRunner
                .on('render', function () {
                    if (isPluginAllowed()) {
                        self.show();
                    } else {
                        self.hide();
                    }
                })
                .on('submitresponse', function (responses) {
                    showResponses(__('Submitted data'), responses);
                    showConsole();
                })
                .on('scoreitem', function (responses) {
                    if (responses.itemSession) {
                        showResponses(__('Output data'), responses.itemSession);
                        showConsole();
                    }
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
            this.controls.$button.removeProp('disabled').removeClass('disabled');
        },

        /**
         * Disable the button
         */
        disable: function disable() {
            this.controls.$button.prop('disabled', true).addClass('disabled');
        },

        /**
         * Show the button
         */
        show: function show() {
            hider.show(this.controls.$button);
        },

        /**
         * Hide the button
         */
        hide: function hide() {
            _.forEach(this.controls, hider.hide);
        }
    });
});
