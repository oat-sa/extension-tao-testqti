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
    'core/mutation-observer',
    'ui/movableComponent',
    'tpl!taoQtiTest/runner/plugins/tools/magnifier/magnifierPanel',
    'css!taoQtiTestCss/plugins/magnifier'
], function ($, _, MutationObserver, movableComponent, magnifierPanelTpl) {
    'use strict';

    /**
     * The screen pixel ratio
     * @type {Number}
     */
    var screenRatio = window.screen.width / window.screen.height;

    /**
     * Standard debounce delay for heavy process
     * @type {Number}
     */
    var debounceDelay = 50;

    /**
     * Standard scrolling throttling for the scrolling
     * It can be lower than the debounce delay as it is lighter in process and it improves the user experience
     * @type {Number}
     */
    var scrollingDelay = 20;

    /**
     * The default base size
     * @type {Number}
     */
    var defaultBaseSize = 100;

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
        var observer = null;
        var targetWidth, targetHeight, dx, dy;
        var scrolling = [];

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
             * Gets the targeted content the magnifier will zoom
             * @returns {jQuery}
             */
            getTarget: function getTarget() {
                return controls && controls.$target;
            },

            /**
             * Sets the targeted content the magnifier will zoom
             * @param {jQuery} $newTarget
             * @returns {magnifierPanel}
             * @fires targetchange
             * @fires update
             */
            setTarget: function setTarget($newTarget) {
                if (controls) {
                    controls.$target = $newTarget;

                    setScrollingListener();

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
                showZoomLevel();
                updateMaxSize();
                updateZoom();

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
             * Places the magnifier sight at a particular position on the target content
             * @param {Number} x
             * @param {Number} y
             * @returns {magnifierPanel}
             */
            zoomAt: function zoomAt(x, y) {
                if (controls) {
                    controls.$inner.css(this.translate(-x, -y));
                }
            },

            /**
             * Translates screen coordinates to zoom coordinates
             * @param {Object} x
             * @param {Object} y
             * @returns {Object}
             */
            translate: function translate(x, y) {
                return {
                    left: x * zoomLevel,
                    top: y * zoomLevel
                };
            },

            /**
             * Updates the magnifier with the target content
             * @returns {magnifierPanel}
             * @fires update
             */
            update: function update() {
                if (controls && controls.$target) {
                    controls.$clone = controls.$target.clone().removeAttr('id');
                    controls.$inner.empty().append(controls.$clone);

                    applySize();
                    applyZoomLevel();
                    updateZoom();
                    updateMaxSize();
                    applyScrolling();

                    /**
                     * @event magnifierPanel#update
                     */
                    this.trigger('update');
                }

                return this;
            }
        }, defaultConfig);

        /**
         * Will update the magnifier content with the actual content
         * @type {Function}
         */
        var updateMagnifier = _.debounce(_.bind(magnifierPanel.update, magnifierPanel), debounceDelay);

        /**
         * Will update the magnifier content with the scrolling position
         * @type {Function}
         */
        var scrollingLIstenerCallback = _.throttle(function(e){

            var $target = $(e.target);
            var scrollingTop = e.target.scrollTop;
            var scrollLeft = e.target.scrollLeft;
            var scrollId, scrollData, $clonedTarget;

            //check if the element is qlready known as a scrollable element
            if(controls && controls.$clone && $target.data('magnifier-scroll')){

                scrollId = $target.data('magnifier-scroll');
                scrollData = _.find(scrolling, {id : scrollId});
                scrollData.scrollTop = scrollingTop;
                scrollData.scrollLeft = scrollLeft;

                //if in clone, scroll it
                scrollInClone(scrollData);

            }else{
                //if the element is not yet identified as a scrollable element, tag it and register its id
                scrollId = _.uniqueId('scrolling_');
                $target.attr('data-magnifier-scroll', scrollId);
                scrolling.push({
                    id: scrollId,
                    scrollTop : scrollingTop,
                    scrollLeft : scrollLeft
                });

                //update all
                magnifierPanel.update();
            }

        }, scrollingDelay);

        /**
         * Scroll an element in the clone
         *
         * @param {Object} scrollData
         * @param {String} scrollData.id
         * @param {Number} [scrollData.scrollTop]
         * @param {Number} [scrollData.scrollLeft]
         */
        function scrollInClone(scrollData){
            var $clonedTarget;
            if(controls && controls.$clone && scrollData && scrollData.id){
                $clonedTarget = controls.$clone.find('[data-magnifier-scroll='+scrollData.id+']');
                if($clonedTarget.length){
                    if( _.isNumber(scrollData.scrollTop)){
                        $clonedTarget[0].scrollTop = scrollData.scrollTop;
                    }
                    if( _.isNumber(scrollData.scrollLeft)){
                        $clonedTarget[0].scrollLeft = scrollData.scrollLeft;
                    }
                }
            }
        }

        /**
         * Init the listener for scrolling event and transfer the scrolling
         */
        function setScrollingListener(){
            window.addEventListener('scroll', scrollingLIstenerCallback, true);
        }

        /**
         * Init the listener for scrolling event and transfer the scrolling
         */
        function removeScrollingListener(){
            window.removeEventListener('scroll', scrollingLIstenerCallback, true);
        }

        /**
         * Apply scrolling programmatically from the recorded list of elements to be scrolled
         */
        function applyScrolling(){
            _.each(scrolling, scrollInClone);
        }

        /**
         * Adjusts a provided zoom level to fit the constraints
         * @param {Number|String} level
         * @returns {Number}
         */
        function adjustZoomLevel(level) {
            return Math.max(zoomLevelMin, Math.min(parseFloat(level), zoomLevelMax));
        }

        /**
         * Applies the zoom level to the content
         */
        function applyZoomLevel() {
            if (controls) {
                controls.$inner.css({
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
        function updateMaxSize() {
            var $window = $(window);
            magnifierPanel.config.maxWidth = $window.width() * maxRatio;
            magnifierPanel.config.maxHeight = $window.height() * maxRatio;
        }

        /**
         * Forwards the size of the target to the cloned content
         */
        function applySize() {
            if (controls && controls.$clone) {
                targetWidth = controls.$target.width();
                targetHeight = controls.$target.height();

                controls.$clone
                    .width(targetWidth)
                    .height(targetHeight);
            }
        }

        /**
         * Place the zoom sight at the right place inside the magnifier
         */
        function updateZoom() {
            var position;
            if (controls && controls.$target) {
                position = magnifierPanel.getPosition();

                position.left += dx + controls.$target.scrollLeft();
                position.top += dy + controls.$target.scrollTop();

                magnifierPanel.zoomAt(position.left, position.top);
            }
        }

        /**
         * Creates the observer that will react to DOM changes to update the magnifier
         */
        function createObserver() {
            observer = new MutationObserver(updateMagnifier);
        }

        /**
         * Starts to observe the DOM of the magnifier target
         */
        function startObserver() {
            if (controls && controls.$target) {
                observer.observe(controls.$target.get(0), {
                    childList: true,        // Set to true if additions and removals of the target node's child elements (including text nodes) are to be observed.
                    attributes: true,       // Set to true if mutations to target's attributes are to be observed.
                    characterData: true,    // Set to true if mutations to target's data are to be observed.
                    subtree: true           // Set to true if mutations to target and target's descendants are to be observed.
                });
            }
            setScrollingListener();
        }

        /**
         * Stops to observe the DOM of the magnifier target
         */
        function stopObserver() {
            observer.disconnect();
            removeScrollingListener();
        }

        initConfig.width = zoomSize;
        initConfig.height = zoomSize / screenRatio;
        initConfig.minWidth = baseSize * zoomLevelMin;
        initConfig.minHeight = baseSize * zoomLevelMin / screenRatio;

        magnifierPanel
            .setTemplate(magnifierPanelTpl)
            .on('render', function () {
                var self = this;
                var $component = this.getElement();

                this.setState('hidden', true);

                // compute the padding of the magnifier content
                dx = ($component.outerWidth() - $component.width()) / 2;
                dy = ($component.outerHeight() - $component.height()) / 2;

                controls = {
                    $inner: $('.inner', $component),
                    $zoomLevel: $('.level', $component)
                };

                this.getElement().on('click', '.control', function (event) {
                    var $button = $(event.target).closest('.control');
                    var action = $button.data('control');

                    event.preventDefault();
                    if (action && self[action]) {
                        self[action]();
                    }
                });

                createObserver();
                updateMaxSize();
                applyZoomLevel();
            })
            .on('move resize', function () {
                updateZoom();
            })
            .on('show', function () {
                updateMagnifier();
                startObserver();
            })
            .on('hide', function () {
                stopObserver();
            })
            .on('resize', function () {
                updateMaxSize();
            })
            .on('destroy', function () {
                stopObserver();
                controls = null;
                observer = null;
            })
            .init(initConfig);

        return magnifierPanel;
    }

    return magnifierPanelFactory;
});
