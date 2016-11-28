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
 * Copyright (c) 2016 (original work) Open Assessment Technologies SA ;
 */
/**
 * @author Jean-Sébastien Conan <jean-sebastien.conan@vesperiagroup.com>
 */
define([
    'jquery',
    'lodash',
    'ui/movableComponent',
    'tpl!taoQtiTest/runner/plugins/tools/magnifier/magnifierPanel',
    'css!taoQtiTestCss/plugins/magnifier'
], function ($, _, movableComponent, magnifierPanelTpl) {
    'use strict';

    /**
     * The default base size
     * @type {Number}
     */
    var defaultBaseSize = 100;

    /**
     * The screen pixel ratio
     * @type {Number}
     */
    var screenRatio = window.screen.width / window.screen.height;

    /**
     * The minimum zoom level
     * @type {Number}
     */
    var defaultLevelMin = 2;

    /**
     * The maximum zoom level
     * @type {Number}
     */
    var defaultLevelMax = 8;

    /**
     * The default zoom level
     * @type {Number}
     */
    var defaultLevel = defaultLevelMin;

    /**
     * Some default values
     * @type {Object}
     */
    var defaultConfig = {
        level: defaultLevel,
        levelMin: defaultLevelMin,
        levelMax: defaultLevelMax,
        levelStep: .5,
        baseSize: defaultBaseSize,
        width: defaultBaseSize * defaultLevel,
        height: defaultBaseSize * defaultLevel / screenRatio,
        minWidth: defaultBaseSize * defaultLevelMin,
        minHeight: defaultBaseSize * defaultLevelMin / screenRatio,
        maxRatio: .5
    };

    /**
     * Creates a magnifier panel component
     * @param {Object} config
     * @param {Number} [config.level] - The default zoom level
     * @param {Number} [config.levelMin] - The minimum allowed zoom level
     * @param {Number} [config.levelMax] - The maximum allowed zoom level
     * @param {Number} [config.levelStep] - The level increment applied when using the controls + and -
     * @param {Number} [config.baseSize] - The base size used to assign the width and the height according to the zoom level
     * @param {Number} [config.maxRatio] - The ratio for the maximum size regarding the size of the window
     * @returns {magnifierPanel} the component (initialized)
     */
    function magnifierPanelFactory(config) {
        var initConfig = _.defaults(config || {}, defaultConfig);
        var zoomLevelMin = parseFloat(initConfig.levelMin);
        var zoomLevelMax = parseFloat(initConfig.levelMax);
        var zoomLevelStep = parseFloat(initConfig.levelStep);
        var zoomLevel = adjustZoomLevel(initConfig.level);
        var maxRatio = parseFloat(initConfig.maxRatio);
        var baseSize = parseInt(initConfig.baseSize, 10);
        var zoomSize = baseSize * zoomLevel;
        var controls = null;

        /**
         * @typedef {Object} magnifierPanel
         */
        var magnifierPanel = movableComponent({
            /**
             * Gets the current zoom level
             * @returns {Number}
             */
            getZoomLevel: function getZoomLevel() {
                return zoomLevel;
            },

            /**
             * Gets the content target to zoom
             * @returns {jQuery}
             */
            getTarget: function getTarget() {
                return controls && controls.$target;
            },

            /**
             * Sets the content target to zoom
             * @param {jQuery} $newTarget
             * @returns {magnifierPanel}
             * @fires targetchange
             * @fires update
             */
            setTarget: function setTarget($newTarget) {
                if (controls) {
                    controls.$target = $newTarget;

                    /**
                     * @event magnifierPanel#targetchange
                     * @param {jQuery} $target
                     */
                    this.trigger('targetchange', controls.$target);

                    this.update();
                }

                return this;
            },

            /**
             * Sets the zoom level of the magnifier
             * @param {Number} level
             * @returns {magnifierPanel}
             * @fires zoom
             */
            zoomTo: function zoomTo(level) {
                if (level && _.isFinite(level)) {
                    zoomLevel = adjustZoomLevel(level);
                }

                applyZoomLevel();
                adjustMaxSize();
                showZoomLevel();

                /**
                 * @event magnifierPanel#zoom
                 * @param {Number} zoomLevel
                 */
                this.trigger('zoom', zoomLevel);

                return this;
            },

            /**
             * Increments the zoom level of the magnifier
             * @param {Number} step
             * @returns {magnifierPanel}
             * @fires zoom
             */
            zoomBy: function zoomBy(step) {
                if (step && _.isFinite(step)) {
                    this.zoomTo(zoomLevel + parseFloat(step));
                }
                return this;
            },

            /**
             * Zoom-in using the configured level step
             * @returns {magnifierPanel}
             * @fires zoom
             */
            zoomIn: function zoomIn() {
                return this.zoomBy(zoomLevelStep);
            },

            /**
             * Zoom-out using the configured level step
             * @returns {magnifierPanel}
             * @fires zoom
             */
            zoomOut: function zoomOut() {
                return this.zoomBy(-zoomLevelStep);
            },

            /**
             *
             * @returns {magnifierPanel}
             * @fires update
             */
            update: function update() {
                if (this.is('rendered')) {
                    applyZoomLevel();
                }

                /**
                 * @event magnifierPanel#update
                 */
                this.trigger('update');

                return this;
            }
        }, defaultConfig);

        /**
         * Adjusts a provided zoom level to fit the constraints
         * @param {Number|String} level
         * @returns {Number}
         */
        function adjustZoomLevel(level) {
            return Math.max(zoomLevelMin, Math.min(parseFloat(level), zoomLevelMax));
        }

        /**
         * Applies the zoom level on the content
         */
        function applyZoomLevel() {
            if (controls) {
                controls.$large.css({
                    transform: 'scale(' + zoomLevel + ')'
                });
            }
        }

        /**
         * Shows the zoom level using a CSS animation
         */
        function showZoomLevel() {
            var $newZoomLevel;
            if (controls) {
                $newZoomLevel = controls.$zoomLevel.clone(true).html(zoomLevel);
                controls.$zoomLevel.before($newZoomLevel).remove();
                controls.$zoomLevel = $newZoomLevel;
            }
        }

        /**
         * Updates the max size according to the window's size
         */
        function adjustMaxSize() {
            var $window = $(window);
            magnifierPanel.config.maxWidth = $window.width() * maxRatio;
            magnifierPanel.config.maxHeight = $window.height() * maxRatio;
        }

        initConfig.width = zoomSize;
        initConfig.height = zoomSize / screenRatio;
        initConfig.minWidth = baseSize * zoomLevelMin;
        initConfig.minHeight = baseSize * zoomLevelMin / screenRatio;

        magnifierPanel
            .setTemplate(magnifierPanelTpl)
            .on('init', function () {
                zoomLevel = this.config.level;
            })
            .on('render', function () {
                var self = this;

                controls = {
                    $target: $(),
                    $large: $('.inner', this.getElement()),
                    $zoomLevel: $('.level', this.getElement())
                };

                this.getElement().on('click', '.control', function (event) {
                    var $button = $(event.target).closest('.control');
                    var action = $button.data('control');

                    event.preventDefault();
                    if (action && self[action]) {
                        self[action]();
                    }
                });

                adjustMaxSize();
                applyZoomLevel();
            })
            .on('resize', function() {
                adjustMaxSize();
            })
            .on('destroy', function () {
                controls = null;
            })
            .init(initConfig);

        return magnifierPanel;
    }

    return magnifierPanelFactory;
});
