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
    'css!taoQtiTest/runner/plugins/tools/textToSpeech/textToSpeech'
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
     * @param {String} options.deliveryId
     * @param {Array} [options.ignoreEls = ['header', '.left-bar', '.right-bar', '.modal', 'footer', '.action-bar', '.sts-scope', '.media-container']]
     * @param {String} [options.toolbarUrl = '//taotoolbar.speechstream.net/tao/configQA.js']
     * @param {String} options.tenantId
     * @param {Object} [config]
     * @returns {ui/component}
     */
    return function factory(options, config) {
        var component;
        var mapping = {
            play:           '$rw_event_play',
            playBeginning:  '$rw_speakFirstSentence',
            pause:          '$rw_event_pause',
            stop:           '$rw_stopSpeech',
            isTextSelected: '$rw_isTextSelectedForPlay',
            setVolume:      '$rw_setVolumeValue',
            setSpeed:       '$rw_setSpeedValue',
            getSpeed:       '$rw_getSpeed',
            clickToSpeak:   'TexthelpSpeechStream.clickToSpeak'
        };
        var speed;
        var SPEEDS = [0, 20, 40, 60, 80, 100];

        _.assign(options || {}, {
            ignoreEls: ['header', '.left-bar', '.right-bar', '.modal', 'footer', '.action-bar', '.sts-scope', '.media-container'],
            toolbarUrl: '//taotoolbar.speechstream.net/tao/configQA.js'
        });

        component = componentFactory({
            /**
             * Execute action
             * @param {String} action
             * @param {...} arguments
             */
            _exec: function _exec(action) {
                var fn = window[mapping[action]];

                if (fn && _.isFunction(fn)) {
                    return fn.apply(this, [].slice.call(arguments, 1));
                }
            },

            /**
             * Play
             */
            play: function play() {
                if (this._exec('isTextSelected')) {
                    this._exec('play');
                } else {
                    this._exec('playBeginning');
                }
            },

            /**
             * Pause
             */
            pause: function pause() {
                this._exec('pause');
            },

            /**
             * Stop
             */
            stop: function stop() {
                this._exec('stop');
            },

            /**
             * Speed down
             */
            speedDown: function speedDown() {
                if (SPEEDS[speed - 1]) {
                    speed -= 1;
                }
                this._exec('setSpeed', SPEEDS[speed]);
            },

            /**
             * Speed up
             */
            speedUp: function speedUp() {
                if (SPEEDS[speed + 1]) {
                    speed += 1;
                }
                this._exec('setSpeed', SPEEDS[speed]);
            },

            /**
             * Click to pronounce
             */
            clickToPronounce: function clickToPronounce() {
                this._exec('clickToSpeak');
            }
        }, {
            // defaults
        })
        .setTemplate(tpl)
        .on('init', function () {
            var self = this;

            speed = 2; // getSpeed()

            // we have to mark some blocks as ignored to prevent TTS accessing it
            $(options.ignoreEls.join(','))
            .each(function () {
                $(this).attr('ignore', true);
            });

            require([options.toolbarUrl], function () {
                var tss = window.TexthelpSpeechStream;

                require(["//" + tss.g_strServer + "/SpeechStream/v" + tss.g_strBuild + "/texthelpMain.js"], function () {
                    window.$rw_barDynamicStart();
                    window.$rw_barInit();

                    self._exec('setSpeed', SPEEDS[speed]);
                });
            });
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
