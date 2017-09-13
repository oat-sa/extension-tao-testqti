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
    'nouislider'
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
     * @param {jQuery} [options.$contentArea = '$(body)']
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
            hasReachedEnd:                      '$rw_hasReachedEnd',
            isSpeaking:                         '$rw_isSpeaking',
            isTextSelectedForPlay:              '$rw_isTextSelectedForPlay',

            isUsingMathjax:                     '$rw_isUsingMathjax',
            setUsingMath:                       '$rw_setUsingMath',
            setUsingMaths:                      '$rw_setUsingMaths',
            setUsingMathjax:                    '$rw_setUsingMathjax',

            enableClickToSpeak:                 '$rw_enableClickToSpeak',
            enableContinuousReading:            '$rw_enableContinuousReading',
            enableSpeech:                       '$rw_enableSpeech',
            event_pause:                        '$rw_event_pause',
            event_play:                         '$rw_event_play',
            disableSpeech:                      '$rw_disableSpeech',
            isPaused:                           '$rw_isPaused',
            setSpeedValue:                      '$rw_setSpeedValue',
            setVolumeValue:                     '$rw_setVolumeValue',
            stopSpeech:                         '$rw_stopSpeech',
        };
        var speed;
        var volume;

        _.assign(options || {}, {
            contentArea: $('body'),
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
            setSpeed: function setSpeed(e, value) {
                speed = +value;

                this._exec('setSpeedValue', speed);
                this.trigger('setSpeed', speed);
            },

            /**
             * Volume
             */
            setVolume: function setVolume(e, value) {
                volume = +value;

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

            speed = 40; // default speed
            volume = 40; // default volume

            // we have to mark some blocks as ignored to prevent TTS accessing it
            $(options.ignoreEls.join(',')).each(function () {
                $(this).attr('ignore', true);
            });

            require([options.toolbarUrl], function () {
                var tss = window.TexthelpSpeechStream;

                require(["//" + tss.g_strServer + "/SpeechStream/v" + tss.g_strBuild + "/texthelpMain.js"], function () {
                    window.$rw_barDynamicStart();
                    window.$rw_barInit();

                    // Set some default texthelp options
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

            // Action clicks
            $this.find('.action').on('click', function (e) {
                // prevents disabled actions from being triggered
                if ($(this).hasClass('disabled')) {
                    e.stopImmediatePropagation();
                }

                // hides settings menu when another action clicked
                if (!$(this).closest('.settings').length) {
                    $this.find('.settings').removeClass('active');
                    $this.find('.settings > .settings-menu').hide();
                }
            });

            // Show/hide settings menu
            $this.find('.settings').on('click', function () {
                $(this).toggleClass('active');
                $this.find('.settings-menu').toggle();
            });

            // Settings menu
            $this.find('.settings > .settings-menu')
            .on('click', function (e) { // prevent child elements triggering a click on settings menu
                if ($(this).closest('.settings-menu').length) {
                    e.stopPropagation();
                }
            })
            .hide(); // Hide settings menu to begin

            // Hide/show volume and speed sliders
            $this.find('.settings > .settings-menu > .option')
            .on('hover', function () {
                $(this).find('.slider-container').show();
            })
            .on('mouseleave', function () {
                $(this).find('.slider-container').hide();
            });

            // Hide slider to begin
            $this.find('.settings > .settings-menu > .option > .slider-container').hide();

            // Set texthelp callbacks
            window.eba_speech_started_callback = function () {
                self.trigger('play');
            };
            window.eba_speech_complete_callback = function () {
                self.trigger('stop');
            };

            // Text to speech actions
            $this.find('.click-to-speak').on('click', this.clickToSpeak);
            $this.find('.play')          .on('click', this.play);
            $this.find('.pause')         .on('click', this.pause)       .hide();
            $this.find('.stop')          .on('click', this.stop);

            // Settings menu's volume slider action
            $this.find('.settings > .settings-menu > .volume .slider')
            .noUiSlider({
                animate: true,
                connected: true,
                range: {
                    min: 0,
                    max: 100
                },
                start: volume,
                step: 10
            })
            .on('change', this.setVolume);

            // Settings menu's speed slider
            $this.find('.settings > .settings-menu > .speed .slider')
            .noUiSlider({
                animate: true,
                connected: true,
                range: {
                    min: 0,
                    max: 100
                },
                start: speed,
                step: 10
            })
            .on('change', this.setSpeed);
        })
        .on('clickToSpeak', function () {
            var $el = this.getElement();

            if (options.enableClickToSpeak) {
                $('.click-to-speak', $el).addClass('active');
                $('.play', $el).addClass('disabled').show();
                $('.pause', $el).addClass('disabled').hide();
                options.$contentArea.css('cursor', 'pointer');
            } else {
                $('.click-to-speak', $el).removeClass('active');
                $('.play', $el).removeClass('disabled').show();
                $('.pause', $el).removeClass('disabled').hide();
                options.$contentArea.css('cursor', 'default');
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
        });

        return component;
    };
});
