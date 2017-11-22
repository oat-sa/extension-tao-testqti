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
    'nouislider',
    'mathJax'
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
     * @param {Boolean} [options.enableClickToSpeak = false]
     * @param {Array} [options.ignoreEls = ['header', '.left-bar', '.right-bar', '.modal', 'footer', '.action-bar', '.sts-scope', '.media-container']]
     * @param {String} [options.toolbarUrl = '//taotoolbar.speechstream.net/tao/configQA.js']
     * @param {Object} [config]
     * @returns {ui/component}
     */
    return function factory(options, config) {
        var component;
        var texthelpMapping = {
            properties: {
                pageCompleteCallback:    'eba_page_complete_callback',
                texthelpSpeechStream:    'TexthelpSpeechStream',
                volumeValue:             'eba_volume_value'
            },
            functions: {
                barDynamicStart:         '$rw_barDynamicStart',
                barCacheInit:            '$rw_barCacheInit',
                barInit:                 '$rw_barInit',
                cachePage:               '$rw_cachePage',
                disableSpeech:           '$rw_disableSpeech',
                enableClickToSpeak:      '$rw_enableClickToSpeak',
                enableContinuousReading: '$rw_enableContinuousReading',
                enableSpeech:            '$rw_enableSpeech',
                event_pause:             '$rw_event_pause',
                event_play:              '$rw_event_play',
                getSpeed:                '$rw_getSpeed',
                getVoice:                '$rw_getVoice',
                hasReachedEnd:           '$rw_hasReachedEnd',
                isPaused:                '$rw_isPaused',
                isSpeaking:              '$rw_isSpeaking',
                isTextSelectedForPlay:   '$rw_isTextSelectedForPlay',
                isUsingMathjax:          '$rw_isUsingMathjax',
                setSpeedValue:           '$rw_setSpeedValue',
                setUsingMath:            '$rw_setUsingMath',
                setUsingMathjax:         '$rw_setUsingMathjax',
                setUsingMaths:           '$rw_setUsingMaths',
                setVolumeValue:          '$rw_setVolumeValue',
                stopSpeech:              '$rw_stopSpeech',
                tagSentences:            '$rw_tagSentences',
                userParameters:          '$rw_userParameters'
            }
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
             * Execute texthelp function
             * @param {String} action
             * @param {...} arguments
             */
            _exec: function _exec(action) {
                var args = [].slice.call(arguments, 1);
                var fn = window[texthelpMapping.functions[action]];

                if (fn && _.isFunction(fn)) {
                    return fn.apply(this, args);
                }
            },

            /**
             * Get texthelp property
             * @param {String} property
             */
            _get: function _get(property) {
                return window[texthelpMapping.properties[property]];
            },

            /**
             * Set texthelp property
             * @param {String} property
             * @param {*} value
             */
            _set: function _set(property, value) {
                var prop = texthelpMapping.properties[property];

                if (prop) {
                    return window[prop] = value;
                }
            },

            /**
             * Initialize texthelp
             */
            _init: function _init() {
                var self = this;

                // Initialize texthelp
                this._exec('barDynamicStart');
                this._exec('barInit');

                // Set some default texthelp options
                this._exec('enableClickToSpeak', options.enableClickToSpeak);
                this._exec('setSpeedValue', speed);
                this._exec('setVolumeValue', volume);

                // Set texthelp callbacks
                // todo: page complete isn't fired by texthelp (something to do with caching)
                this._set('pageCompleteCallback', function () {
                    self.trigger('stop');
                });

                return this;
            },

            /**
             * Re-initialize texthelp
             */
            updateTexthelpCache: function updateTexthelpCache(deliveryId, itemId) {
                var tss = this._get('texthelpSpeechStream');

                tss.g_strBookId = deliveryId;
                tss.g_strPageId = itemId;

                this._exec('tagSentences', options.$contentArea.selector);

                return this;
            },

            /**
             * Enable texthelp
             */
            enable: function enable() {
                this._exec('enableSpeech');
                return this;
            },

            /**
             * Disable texthelp
             */
            disable: function disable() {
                this._exec('disableSpeech');
                return this;
            },

            /**
             * Play
             */
            play: function play() {
                if (!this._exec('isSpeaking') || this._exec('isPaused')) {
                    this._exec('event_play');
                    this.trigger('play');
                }

                return this;
            },

            /**
             * Pause
             */
            pause: function pause() {
                this._exec('event_pause');
                this.trigger('pause');

                return this;
            },

            /**
             * Stop
             */
            stop: function stop() {
                this._exec('stopSpeech');
                this.trigger('stop');

                return this;
            },

            /**
             * Speech speed
             */
            setSpeed: function setSpeed(e, value) {
                speed = +value;

                this._exec('setSpeedValue', speed);
                this.trigger('setSpeed', speed);

                return this;
            },

            /**
             * Volume
             */
            setVolume: function setVolume(e, value) {
                volume = +value;

                this._exec('setVolumeValue', volume);
                this.trigger('setVolume', volume);

                return this;
            },

            /**
             * Click to pronounce
             */
            clickToSpeak: function clickToSpeak() {
                var self = this;

                options.enableClickToSpeak = !options.enableClickToSpeak;

                this._exec('enableClickToSpeak', options.enableClickToSpeak);
                this._exec('enableContinuousReading', !options.enableClickToSpeak); // continuous reading is off when click to speak is on
                this.trigger('clickToSpeak');

                //adding each item a special class by presence of which normal click handling could be prevented and passed to click-to-speak handling
                options['$contentArea'].find('.qti-item').each(function() {
                    $(this).toggleClass('prevent-click-handler');
                });

                //we should disable click-to-speak while navigating through test, if it was enabled on some item page
                //just to ensure that after other item load click-to-speak will function normally, and tao click handlers won't work on item-part click
                options['$navigationArea'].on('click', 'a', function() {
                    if (options['$contentArea'].find('.qti-item.prevent-click-handler').length > 0) {
                        self.clickToSpeak();
                    }
                });

                return this;
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
            $(options.ignoreEls.join(',')).attr('ignore', true);

            require([options.toolbarUrl], function () {
                var tss = self._get('texthelpSpeechStream');

                require(["//" + tss.g_strServer + "/SpeechStream/v" + tss.g_strBuild + "/texthelpMain.js"], function () {
                    self._init();
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

            // Action clicks
            $this.find('.action').on('click', function (e) {
                var $action = $(this);

                // prevents disabled actions from being triggered
                if ($action.hasClass('disabled')) {
                    e.stopImmediatePropagation();
                }

                // hides settings menu when another action clicked
                if (!$action.closest('.settings').length) {
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
                e.stopPropagation();
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
                step: 15 //actual step for speed slider, so the values will be 0,15,30,etc,etc,100.
            })
            .on('change', this.setSpeed);
        })
        .on('clickToSpeak', function () {
            var $el = this.getElement();

            if (options.enableClickToSpeak) {
                $el.find('.click-to-speak').addClass('active');
                $el.find('.play').addClass('disabled').show();
                $el.find('.pause').addClass('disabled').hide();
                options.$contentArea.css('cursor', 'pointer');
            } else {
                $el.find('.click-to-speak').removeClass('active');
                $el.find('.play').removeClass('disabled').show();
                $el.find('.pause').removeClass('disabled').hide();
                options.$contentArea.css('cursor', 'default');
            }
        })
        .on('play', function () {
            var $el = this.getElement();

            $el.find('.play').hide();
            $el.find('.pause').show();
        })
        .on('pause', function () {
            var $el = this.getElement();

            $el.find('.play').show();
            $el.find('.pause').hide();
        })
        .on('stop', function () {
            var $el = this.getElement();

            $el.find('.play').show();
            $el.find('.pause').hide();
        });

        return component;
    };
});
