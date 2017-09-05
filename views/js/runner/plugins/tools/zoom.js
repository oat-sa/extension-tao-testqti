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
 * Copyright (c) 2016  (original work) Open Assessment Technologies SA;
 *
 * @author dieter <dieter@taotesting.com>
 * @author Alexander Zagovorichev <zagovorichev@1pt.com>
 */

define([
    'jquery',
    'i18n',
    'ui/hider',
    'ui/transformer',
    'util/shortcut',
    'util/namespace',
    'taoTests/runner/plugin'
], function ($, __, hider, transformer, shortcut, namespaceHelper, pluginFactory){
    'use strict';

    /**
     * The standard zoom level, in percentage
     * @type {Number}
     */
    var standard = 100;

    /**
     * Zoom-In/Zoom-Out steps
     * @type {Number}
     */
    var increment = 10;

    /**
     * The zoom boundaries, in percentage
     * @type {Object}
     */
    var threshold = {
        lower: 10,
        upper: 200
    };

    /**
     * Sets the zoom level
     * @param {jQuery} $target
     * @param {Number} level - Zoom percentage
     */
    var setZoomLevel = function($target, level) {
        transformer.setTransformOrigin($target, '0 0');
        transformer.scale($target, level / 100);
    };

    /**
     * Restores the standard zoom level
     * @param {jQuery} $target
     */
    var resetZoom = function($target) {
        transformer.reset($target);
    };

    /**
     * Forces a browser repaint
     * Solution from http://stackoverflow.com/questions/3485365/how-can-i-force-webkit-to-redraw-repaint-to-propagate-style-changes?answertab=votes#tab-top
     * @param {jQuery} $target
     */
    var forceRepaint = function($target) {
        var sel = $target[0];
        if (sel) {
            sel.style.display = 'none';
            sel.offsetHeight; // no need to store this anywhere, the reference is enough
            sel.style.display = '';
        }
    };

    /**
     * Returns the configured plugin
     */
    return pluginFactory({

        name : 'zoom',

        /**
         * Initialize the plugin (called during runner's init)
         */
        init : function init(){
            var self = this;
            var testRunner = this.getTestRunner();
            var testData = testRunner.getTestData() || {};
            var testConfig = testData.config || {};
            var pluginShortcuts = (testConfig.shortcuts || {})[this.getName()] || {};



            /**
             * Checks if the plugin is currently available
             * @returns {Boolean}
             */
            function isConfigured() {
                var context = testRunner.getTestContext() || {},
                    options = context.options || {};
                //to be activated with the special category x-tao-option-zoom
                return !!options.zoom;
            }

            /**
             * Is zoom activated ? if not, then we hide the plugin
             */
            function togglePlugin() {
                if (isConfigured()) {//allow zoom
                    self.show();
                } else {
                    self.hide();
                }
            }

            function zoomAction(dir) {

                var inc = increment * dir;
                var el, sx, sy, before, after, margin;

                if (self.$zoomTarget) {
                    el = self.$zoomTarget[0];

                    before = el.getBoundingClientRect();

                    sx = self.$container.scrollLeft();
                    sy = self.$container.scrollTop();

                    self.zoom = Math.max(threshold.lower, Math.min(threshold.upper, self.zoom + inc));

                    if (self.zoom === standard) {
                        resetZoom(self.$zoomTarget);
                    } else {
                        setZoomLevel(self.$zoomTarget, self.zoom);
                    }

                    // force a browser repaint to fix a scrollbar issue with WebKit
                    forceRepaint(self.$zoomTarget);

                    after = el.getBoundingClientRect();

                    sx = Math.max(0, sx + (after.width - before.width) / 2);
                    sy = Math.max(0, sy + (after.height - before.height) / 2);

                    self.$container.scrollLeft(sx).scrollTop(sy);
                }
            }

            function zoomIn() {
                if (self.getState('enabled') !== false) {
                    zoomAction(1);
                }
            }

            function zoomOut() {
                if (self.getState('enabled') !== false) {
                    zoomAction(-1);
                }
            }

            //build element (detached)
            this.buttonZoomOut = this.getAreaBroker().getToolbox().createEntry({
                control : 'zoomOut',
                title : __('Zoom out'),
                icon : 'remove'
            });

            this.buttonZoomIn = this.getAreaBroker().getToolbox().createEntry({
                control : 'zoomIn',
                title : __('Zoom in'),
                icon : 'add'
            });

            //attach behavior
            this.buttonZoomIn.on('click', function (e){
                e.preventDefault();
                testRunner.trigger('tool-zoomin');
            });

            //attach behavior
            this.buttonZoomOut.on('click', function (e){
                e.preventDefault();
                testRunner.trigger('tool-zoomout');
            });

            if (testConfig.allowShortcuts) {
                if (pluginShortcuts.in) {
                    shortcut.add(namespaceHelper.namespaceAll(pluginShortcuts.in, this.getName(), true), function () {
                        testRunner.trigger('tool-zoomin');
                    }, {
                        avoidInput: true
                    });
                }

                if (pluginShortcuts.out) {
                    shortcut.add(namespaceHelper.namespaceAll(pluginShortcuts.out, this.getName(), true), function () {
                        testRunner.trigger('tool-zoomout');
                    }, {
                        avoidInput: true
                    });
                }
            }

            //start disabled
            togglePlugin();
            this.disable();

            //update plugin state based on changes
            testRunner
                .on('loaditem', function (){
                    self.zoom = standard;

                    togglePlugin();
                    self.disable();
                })
                .on('renderitem', function (){
                    self.$container = $('#qti-content');
                    self.$zoomTarget = $('.qti-item');

                    self.enable();
                })
                .on('enabletools', function() {
                    self.enable();
                })
                .on('disabletools unloaditem', function (){
                    self.disable();
                })
                .on('tool-zoomin', zoomIn)
                .on('tool-zoomout', zoomOut);
        },
        /**
         * Called during the runner's destroy phase
         */
        destroy : function destroy(){
            shortcut.remove('.' + this.getName());
        },
        /**
         * Enable the button
         */
        enable : function enable(){
            this.buttonZoomIn.enable();
            this.buttonZoomOut.enable();
        },
        /**
         * Disable the button
         */
        disable : function disable(){
            this.buttonZoomIn.disable();
            this.buttonZoomOut.disable();
        },
        /**
         * Show the button
         */
        show : function show(){
            this.buttonZoomIn.show();
            this.buttonZoomOut.show();
        },
        /**
         * Hide the button
         */
        hide : function hide(){
            this.buttonZoomIn.hide();
            this.buttonZoomOut.hide();
        }
    });
});
