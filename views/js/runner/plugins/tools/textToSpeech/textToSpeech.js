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
     * @param {Boolean} [options.enableClickToSpeak = false]
     * @param {Array} [options.ignoreEls = ['header', '.left-bar', '.right-bar', '.modal', 'footer', '.action-bar', '.sts-scope', '.media-container']]
     * @param {String} [options.toolbarUrl = '//taotoolbar.speechstream.net/tao/configQA.js']
     * @param {String} options.tenantId
     * @param {Object} [config]
     * @returns {ui/component}
     */
    return function factory(options, config) {
        var component;
        var mapping = {
            enableClickToSpeak:                 '$rw_enableClickToSpeak',
            enableContinuousReading:            '$rw_enableContinuousReading',
            enableSpeech:                       '$rw_enableSpeech',
            event_pause:                        '$rw_event_pause',
            event_play:                         '$rw_event_play',
            event_stop_limited:                 '$rw_event_stop_limited',
            disableSpeech:                      '$rw_disableSpeech',
            getCurrentTarget:                   '$rw_getCurrentTarget',
            getSpeed:                           '$rw_getSpeed',
            hasReachedEnd:                      '$rw_hasReachedEnd',
            isPaused:                           '$rw_isPaused',
            isSpeaking:                         '$rw_isSpeaking',
            isTextSelectedForPlay:              '$rw_isTextSelectedForPlay',
            isUsingMathjax:                     '$rw_isUsingMathjax',
            readNextTarget:                     '$rw_readNextTarget',
            setCurrentTarget:                   '$rw_setCurrentTarget',
            setSpeechModeClick:                 '$rw_setSpeechModeClick',
            setSpeedValue:                      '$rw_setSpeedValue',
            setStartPoint:                      '$rw_setStartPoint',
            setUsingMath:                       '$rw_setUsingMath',
            setUsingMaths:                      '$rw_setUsingMaths',
            setUsingMathjax:                    '$rw_setUsingMathjax',
            setVolumeValue:                     '$rw_setVolumeValue',
            speak:                              '$rw_speak',
            speakCurrentSentence:               '$rw_speakCurrentSentence',
            speakCurrentSentenceHighlightOnly:  '$rw_speackCurrentSentenceHighlightOnly',
            speakFirstSentence:                 '$rw_speakFirstSentence',
            speakNextSentence:                  '$rw_speakNextSentence',
            speakNextSentenceHighlightOnly:     '$rw_speakNextSentenceHighlightOnly',
            speakPreviousSentence:              '$rw_speakPreviousSentence',
            speakPreviousSentenceHighlightOnly: '$rw_speakPreviousSentenceHighlightOnly',
            speakSentenceAtNode:                '$rw_speakSentenceAtNode',
            speakText:                          '$rw_speakText',
            stopSpeech:                         '$rw_stopSpeech'
        };
        var speed;
        var SPEEDS = [0, 20, 40, 60, 80, 100];

        _.assign(options || {}, {
            enableClickToSpeak: false,
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
                var args = [].slice.call(arguments, 1);
                var fn = window[mapping[action]];

                if (fn && _.isFunction(fn)) {
                    return fn.apply(this, args);
                }
            },

            /**
             * Enable texthelp
             */
            enable: function enable() {
                this._exec('enableSpeech');
            },

            /**
             * Disable texthelp
             */
            disable: function disable() {
                this._exec('disableSpeech');
            },

            /**
             * Play
             */
            play: function play() {
                if (!this._exec('isSpeaking') || this._exec('isPaused')) {
                    this._exec('event_play');
                    this.trigger('play');
                }
            },

            /**
             * Pause
             */
            pause: function pause() {
                if (this._exec('isSpeaking')) {
                    this._exec('event_pause');
                    this._exec('pause');
                }
            },

            /**
             * Stop
             */
            stop: function stop() {
                this._exec('stopSpeech');
                this.trigger('stop');
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
            clickToSpeak: function clickToSpeak() {
                options.enableClickToSpeak = !options.enableClickToSpeak;
                this._exec('enableClickToSpeak', options.enableClickToSpeak);
                this.trigger('clickToSpeak');
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

                    self._exec('enableClickToSpeak', options.enableClickToSpeak);
                    self._exec('setSpeed', SPEEDS[speed]);
                });
            });
        })
        .init(config)
        .on('render', function () {
            var $this = this.getElement();

            // prevents clicks from removing highlighted text
            $this.on('mousedown', function (e) {
                e.preventDefault();
                return false;
            });

            $this.find('.click-to-speak').on('click', this.clickToSpeak);
            $this.find('.play')          .on('click', this.play);
            $this.find('.pause')         .on('click', this.pause);
            $this.find('.stop')          .on('click', this.stop);
            $this.find('.speed-down')    .on('click', this.speedDown);
            $this.find('.speed-up')      .on('click', this.speedUp);
        })
        .on('clickToSpeak', function (args) {
            // begins in clickToSpeak
            // sets state clickToSpeak to true
            // disables play/pause
            // hides clickToSpeak (shows resumeClickToSpeak)
            // $('.play', this.getElement()).hide();
            // $('.pause', this.getElement()).show();
        })
        .on('play playBeginning', function (args) {
            // sets state playing to true
            // hides play (shows pause)
            // $('.play', this.getElement()).hide();
            // $('.pause', this.getElement()).show();
        })
        .on('pause', function (args) {
            // $('.play', this.getElement()).show();
            // $('.pause', this.getElement()).hide();
        })
        .on('stop', function (args) {
            // sets state playing to false
            // shows play (hides pause)
            // $('.play', this.getElement()).show();
            // $('.pause', this.getElement()).hide();
        })
        .on('setSpeed', function (args) {
        });

        return component;
    };
});
