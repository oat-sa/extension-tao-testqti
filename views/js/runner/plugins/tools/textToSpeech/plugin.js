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
 * Copyright (c) 2017 (original work) Open Assessment Technologies SA ;
 */

define([
    'jquery',
    'lodash',
    'i18n',
    'taoTests/runner/plugin',
    'ui/hider',
    'ui/stacker',
    'taoQtiTest/runner/plugins/tools/textToSpeech/textToSpeech',
], function (
    $,
    _,
    __,
    pluginFactory,
    hider,
    stackerFactory,
    ttsFactory
) {
    'use strict';

    /**
     * Returns the configured plugin
     * @returns {Object}
     */
    return pluginFactory({

        /**
         * Plugin name
         * @type {String}
         */
        name: 'textToSpeech',

        /**
         * Initialize plugin
         * @returns {this}
         */
        init: function init() {
            var self = this;
            var testRunner = this.getTestRunner();

            this.ttsButton = this.getAreaBroker().getToolbox().createEntry({
                control: 'tts',
                icon: 'headphones',
                text: __('Text to Speech'),
                title: __('Text to Speech')
            })
            .on('render', function () {
                var stacker = stackerFactory('test-runner');

                self.tts = ttsFactory({
                    $contentArea: testRunner.getAreaBroker().getContentArea(),
                    $navigationArea: testRunner.getAreaBroker().getNavigationArea()
                })
                .render(self.ttsButton.getElement())
                .disable() // disable & hide by default
                .hide();

                stacker.autoBringToFront(self.tts.getElement());
            })
            .on('click', function (e) {
                var ttsEl = self.tts.getElement();

                // prevent action if the click is made inside the tts controls which is a sub part of the button
                if ($(e.target).closest(ttsEl).length) {
                    return;
                }

                hider.toggle(ttsEl);

                if (ttsEl.hasClass('hidden')) {
                    self.tts.disable();
                } else {
                    self.tts.enable();
                }
            })
            .disable() // disable & hide by default
            .hide();

            testRunner
            .on('loaditem', function () {
                self.disable();
                self.ttsButton.hide();
            })
            .on('enabletools', function () {
                self.enable();
            })
            .on('renderitem', function () {
                var context = testRunner.getTestContext();
                var config = testRunner.getConfig();

                if (context.options.textToSpeech) {
                    self.enable();
                    self.ttsButton.show();

                    //If we are in multi-tenant context then we choose tenantName as bookId for caching
                    //in other cases - deliveryUri will be used as bookId for caching on textHelp side
                    var testData = testRunner.getTestData() || {};
                    var testConfig = testData.config || {};
                    var testPlugins = testConfig.plugins || {};
                    var TtsConfig = testPlugins.textToSpeech || {};

                    var tenantName = false;
                    if (TtsConfig.hasOwnProperty('tenantName')) {
                        tenantName = TtsConfig['tenantName'];
                    }

                    var bookId = tenantName ? tenantName : config.serviceCallId;

                    self.tts.updateTexthelpCache(
                        bookId,
                        this.itemRunner._item.attributes.identifier
                    );
                }
            })
            .on('disabletools unloaditem', function () {
                var context = testRunner.getTestContext();
                if (context.options && context.options.textToSpeech && typeof self.tts !== typeof undefined) {
                    //textHelp requested stopping of running playback on item unload
                    self.tts.stop();
                    self.tts._exec('setCurrentTarget', null);
                }

                self.disable();
            });

            return this;
        },

        /**
         * Enable plugin
         */
        enable: function enable() {
            if (this.tts) {
                this.tts.enable();
            }

            if (this.ttsButton) {
                this.ttsButton.enable();
            }
        },

        /**
         * Disable plugin
         */
        disable: function disable() {
            if (this.tts) {
                this.tts.disable();
            }

            if (this.ttsButton) {
                this.ttsButton.disable();
            }
        }
    });
});
