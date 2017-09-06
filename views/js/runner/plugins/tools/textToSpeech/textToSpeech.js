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
    'tpl!taoQtiTest/runner/plugins/tools/textToSpeech/textToSpeech',
    'css!taoQtiTest/runner/plugins/tools/textToSpeech/textToSpeech',
    '//taotoolbar.speechstream.net/tao/configQA.js'
], function (
    $,
    _,
    __,
    pluginFactory,
    hider,
    stackerFactory,
    tpl
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
            var testRunner = this.getTestRunner();
            var self = this;
            var stacker = stackerFactory('test-runner');

            /**
             * Show/hide tts panel
             */
            function toggleTts() {
                if (self.getState('enabled')) {
                    hider.toggle(self.$tts);
                }
            }

            this.ttsButton = this.getAreaBroker().getToolbox().createEntry({
                control: 'tts',
                icon: 'audio',
                text: __('Text to Speech'),
                title: __('Text to Speech')
            })
            .on('render', function () {
                self.$tts = $(tpl()).appendTo(self.ttsButton.getElement());

                stacker.autoBringToFront(self.$tts);
            })
            .on('click', function () {
                toggleTts();
                console.log('here');
            });

            testRunner
            .on('loaditem', function () {
                self.show();
                self.disable();
            })
            .on('renderitem enabletools', function () {
                self.enable();
            })
            .on('disabletools unloaditem', function () {
                self.disable();
            });

            // testRunner
            // .on('ready', function () {
            //     var areaBroker = testRunner.getAreaBroker();
            //     var container;
            //     var testContext = testRunner.getTestContext();
            //     var tss = window.TexthelpSpeechStream;

            //     if (testContext.enableTextToSpeech && testContext.textToSpeech) {
            //         container = areaBroker.getContainer();

            //         console.log(container);
            //         container.append(tpl());

            //         tss.addToolbar('bookId', 'pageId');
            //         //play, pause, stop, speed control, volume control (if available), click-to-pronounce
            //     }
            // });

            return this;
        },

        /**
         * Enable tts button
         */
        enable: function enable() {
            this.ttsButton.enable();
        },

        /**
         * Disable tts button
         */
        disable: function disable() {
            this.ttsButton.disable();
        },

        /**
         * Show tts button
         */
        show: function show() {
            this.ttsButton.show();
        },

        /**
         * Hide tts button
         */
        hide: function hide() {
            this.ttsButton.hide();
        }
    });
});
