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
                    $contentArea: testRunner.getAreaBroker().getContentArea()
                })
                .render(self.ttsButton.getElement());

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
            });

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

                    self.tts.updateTexthelpCache(
                        config.serviceCallId,
                        this.itemRunner._item.attributes.identifier
                    );
                }
            })
            .on('disabletools unloaditem', function () {
                self.disable();
            });

            return this;
        },

        /**
         * Enable plugin
         */
        enable: function enable() {
            if (self.tts) {
                self.tts.enable();
                self.ttsButton.enable();
            } else {
                self.ttsButton.disable();
            }
        },

        /**
         * Disable plugin
         */
        disable: function disable() {
            if (self.tts) {
                self.tts.disable();
                self.ttsButton.disable();
            } else {
                self.ttsButton.disable();
            }
        }
    });
});
