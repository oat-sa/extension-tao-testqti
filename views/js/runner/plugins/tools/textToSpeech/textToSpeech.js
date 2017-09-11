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
    'ui/component',
    'tpl!taoQtiTest/runner/plugins/tools/textToSpeech/textToSpeech',
    'css!taoQtiTest/runner/plugins/tools/textToSpeech/textToSpeech',
    '//taotoolbar.speechstream.net/tao/configQA.js'
], function (
    $,
    _,
    __,
    componentFactory,
    tpl
) {
    'use strict';

    /**
     * The factory
     * @param {Object} options.tenantId
     * @param {Object} options.deliveryId
     * @param {Object} [config]
     * @returns {ui/component}
     */
    return function factory(options, config) {
        var component;

        component = componentFactory({
            /**
             * Play
             */
            play: function play() {
                console.log('play');
            },

            /**
             * Pause
             */
            pause: function pause() {
                console.log('pause');
            },

            /**
             * Stop
             */
            stop: function stop() {
                console.log('stop');
            },

            /**
             * Speed down
             */
            speedDown: function speedDown() {
                console.log('speedDown');
            },

            /**
             * Speed up
             */
            speedUp: function speedUp() {
                console.log('speedUp');
            },

            /**
             * Click to pronounce
             */
            clickToPronounce: function clickToPronounce() {
                console.log('click to pronounce');
            }
        }, {
            // defaults
        })
        .setTemplate(tpl)
        .on('init', function () {
            window.TexthelpSpeechStream.addToolbar(options.tenantId, options.deliveryId);
        })
        .init(config)
        .on('render', function () {
            var $this = this.getElement();

            $this.find('.play')              .on('click', this.play);
            $this.find('.pause')             .on('click', this.pause);
            $this.find('.stop')              .on('click', this.stop);
            $this.find('.speed-down')        .on('click', this.speedDown);
            $this.find('.speed-up')          .on('click', this.speedUp);
            $this.find('.click-to-pronounce').on('click', this.clickToPronounce);
        });

        return component;
    };
});
