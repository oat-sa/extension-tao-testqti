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
            speechCompleteCallback:             '$rw_speechCompleteCallback',
            stopSpeech:                         '$rw_stopSpeech',
        };
        var speed;
        var volume;

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
                    this.trigger('pause');
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
             * Speech speed
             */
            setSpeed: function setSpeed() {
                speed = 40;

                this._exec('setSpeedValue', speed);
                this.trigger('setSpeed', speed);
            },

            /**
             * Volume
             */
            setVolume: function setVolume() {
                volume = 40;

                this._exec('setVolumeValue', volume);
                this.trigger('setVolume', volume);
            },

            /**
             * Click to pronounce
             */
            clickToSpeak: function clickToSpeak() {
                options.enableClickToSpeak = !options.enableClickToSpeak;
                this._exec('enableClickToSpeak', options.enableClickToSpeak);
                this._exec('enableContinuousReading', !options.enableClickToSpeak); // continuous reading is off when click to speak is on
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
                    self._exec('setSpeedValue', speed);
                    self._exec('setVolumeValue', volume);
                });
            });
        })
        .init(config)
        .on('render', function () {
            var $this = this.getElement();
            var self = this;

            // prevents clicks from removing highlighted text
            $this.on('mousedown', function (e) {
                e.preventDefault();
                return false;
            });

            // prevents disabled actions from being triggered
            $this.find('.action').on('click', function (e) {
                if ($(this).hasClass('disabled')) {
                    e.stopImmediatePropagation();
                }
            });

            // Settings menu
            $this.find('.settings-menu')

            // prevent child elements triggering a click on settings menu
            .on('click', function (e) {
                if ($(this).closest('.settings-menu').length) {
                    e.stopPropagation();
                }
            })

            // Hide settings menu to begin
            .hide();

            // Show/hide settings menu
            $this.find('.settings').on('click', function () {
                $(this).toggleClass('active');
                $this.find('.settings-menu').toggle();
            });

            // Set texthelp callbacks
            window.eba_speech_started_callback = function () {
                console.log('speech started');
                self.trigger('play');
            };
            window.eba_speech_stopped_callback = function () {
                console.log('speech stopped');
                self.trigger('stop');
            };
            window.eba_speech_complete_callback = function () {
                console.log('speech complete', arguments);
                self.trigger('stop');
            };
            window.eba_page_complete_callback = function () {
                console.log('page complete');
                self.trigger('stop');
            };

            $this.find('.click-to-speak').on('click', this.clickToSpeak);
            $this.find('.play')          .on('click', this.play);
            $this.find('.pause')         .on('click', this.pause)       .hide();
            $this.find('.stop')          .on('click', this.stop);
            $this.find('.speed')         .on('click', this.setSpeed);
            $this.find('.volume')        .on('click', this.setVolume);
        })
        .on('clickToSpeak', function () {
            var $el = this.getElement();

            if (options.enableClickToSpeak) {
                $('.click-to-speak', $el).addClass('active');
                $('.play', $el).addClass('disabled').show();
                $('.pause', $el).addClass('disabled').hide();
            } else {
                $('.click-to-speak', $el).removeClass('active');
                $('.play', $el).removeClass('disabled').show();
                $('.pause', $el).removeClass('disabled').hide();
            }
        })
        .on('play', function () {
            var $el = this.getElement();

            $('.play', $el).hide();
            $('.pause', $el).show();
        })
        .on('pause', function () {
            var $el = this.getElement();

            $('.play', $el).show();
            $('.pause', $el).hide();
        })
        .on('stop', function () {
            var $el = this.getElement();

            $('.play', $el).show();
            $('.pause', $el).hide();
        })
        .on('setSpeed', function (args) {
            var $el = this.getElement();

            $('.speed-down', $el).removeClass('disabled');
            $('.speed-up', $el).removeClass('disabled');

            if (args  === 0) {
                $('.speed-down', $el).addClass('disabled');
            }

            if (args + 1 === SPEEDS.length) {
                $('.speed-up', $el).addClass('disabled');
            }
        });

        return component;
    };
});
