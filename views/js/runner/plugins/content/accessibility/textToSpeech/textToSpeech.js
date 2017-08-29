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
    'tpl!taoQtiTest/runner/plugins/content/accessibility/textToSpeech/textToSpeech',
    'css!taoQtiTest/runner/plugins/content/accessibility/textToSpeech/textToSpeech',
    '//taotoolbar.speechstream.net/tao/configQA.js'
], function (
    $,
    _,
    __,
    pluginFactory,
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

            testRunner
            .on('ready', function () {
                var areaBroker = testRunner.getAreaBroker();
                var container;
                var testContext = testRunner.getTestContext();
                var tss = window.TexthelpSpeechStream;

                if (testContext.enableTextToSpeech && testContext.textToSpeech) {
                    container = areaBroker.getContainer();

                    console.log(container);
                    container.append(tpl());

                    tss.addToolbar('bookId', 'pageId');
                    //play, pause, stop, speed control, volume control (if available), click-to-pronounce
                }
            })
            .render('#display-and-play > .test-container');

            return this;
        }
    });
});
