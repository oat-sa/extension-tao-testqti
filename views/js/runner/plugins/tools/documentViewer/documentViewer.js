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
 * Test Runner Tool Plugin : View a document
 *
 * @author Jean-Sébastien Conan <jean-sebastien.conan@vesperiagroup.com>
 */
define([
    'jquery',
    'lodash',
    'ui/hider',
    'ui/documentViewer',
    'ui/documentViewer/providers/pdfViewer',
    'taoTests/runner/plugin',
    'tpl!taoQtiTest/runner/plugins/tools/documentViewer/panel'
], function ($, _, hider, viewerFactory, pdfViewer, pluginFactory, panelTpl) {
    'use strict';

    /**
     * The name of the plugin
     * @type {String}
     */
    var pluginName = 'documentViewer';

    /**
     * Shows the panel, trigger the `panelshow` event
     *
     * @param plugin
     */
    function showPanel(plugin) {
        hider.show(plugin.controls.$panel);
        plugin.trigger('panelshow');
        $(window).on('resize.' + plugin.getName(), _.debounce(_.partial(resizeViewer, plugin), 50));
    }

    /**
     * Hides the panel, trigger the `panelhide` event
     *
     * @param plugin
     */
    function hidePanel(plugin) {
        hider.hide(plugin.controls.$panel);
        plugin.trigger('panelhide');
        $(window).off('resize.' + plugin.getName());
    }

    /**
     * Hides the panel if it is visible
     *
     * @param plugin
     * @returns {Boolean} Returns `true` if the panel was visible and has been hidden
     */
    function hideIfVisible(plugin) {
        var isVisible = !hider.isHidden(plugin.controls.$panel, true);
        if (isVisible) {
            hidePanel(plugin);
        }
        return isVisible;
    }

    /**
     * Initializes the event handlers for the panel container
     *
     * @param plugin
     */
    function initPanelEvents(plugin) {
        var namespace = '.' + plugin.getName();
        var stopEvents = ['click', 'mousedown', 'mouseup', 'touchstart', 'touchend', 'keyup', 'keydow', 'keypress', 'scroll', 'drop'].join(namespace + ' ') + namespace;
        var hideViewer = _.partial(hidePanel, plugin);

        function stopPropagation(e) {
            e.stopImmediatePropagation();
            e.stopPropagation();
        }

        plugin.controls.$overlay
            .off(namespace)
            .on('click' + namespace, hideViewer)
            .on(stopEvents, stopPropagation);

        plugin.controls.$panel
            .off(namespace)
            .on('click' + namespace, '.icon-close', hideViewer)
            .on(stopEvents, stopPropagation);
    }

    /**
     * Resizes the viewer to fit the panel content area
     * @param plugin
     */
    function resizeViewer(plugin) {
        var $content = plugin.controls.$content;
        plugin.viewer.setSize($content.width(), $content.height());
    }

    // all document viewers need to be registered
    viewerFactory.registerProvider('pdf', pdfViewer);

    /**
     * Returns the configured plugin
     */
    return pluginFactory({

        name: pluginName,

        /**
         * Initialize the plugin (called during runner's init)
         */
        init: function init() {
            var self = this;
            var testRunner = this.getTestRunner();
            var $panel = $(panelTpl());

            /**
             * @param {Object} data
             * @param {String} data.label - document title
             * @param {String} data.document - document url
             */
            function displayViewer(data) {
                if (self.getState('enabled') !== false) {
                    showPanel(self);
                    self.controls.$title.text(data.label);
                    resizeViewer(self);
                    self.viewer.load(data.document, 'pdf');
                }
            }

            this.controls = {
                $panel: $panel,
                $overlay: $panel.find('.viewer-overlay'),
                $title: $panel.find('.viewer-title'),
                $content: $panel.find('.viewer-content')
            };

            this.viewer = viewerFactory({
                renderTo: this.controls.$content,
                replace: true,
                fitToWidth: true,
                allowSearch: true
            });

            //update plugin state based on changes
            testRunner
                .on('renderitem enabletools', function () {
                    self.enable();
                })
                .on('renderitem', function () {
                    self.getAreaBroker().getContentArea()
                        .append(self.controls.$panel)
                        .off('.' + self.getName())
                        .on('viewDocument.' + self.getName(), function (event) {
                            var data = event.originalEvent.detail;
                            displayViewer(data);
                        });
                    initPanelEvents(self);
                })
                .on('move', function () {
                    hideIfVisible(self);
                })
                .on('skip', function () {
                    hideIfVisible(self);
                })
                .on('unloaditem disabletools', function () {
                    self.disable();
                })
                .on('tool-documentViewer', function(data) {
                    displayViewer(data);
                });
        },

        /**
         * Called during the runner's render phase
         */
        render: function render() {
        },

        /**
         * Called during the runner's destroy phase
         */
        destroy: function destroy() {
            this.getAreaBroker().getContentArea().off('.' + this.getName());

            if (this.viewer) {
                this.viewer.destroy();
            }

            if (this.controls.$panel) {
                this.controls.$panel.remove();
            }

            this.viewer = null;
            this.controls = {};
        },

        /**
         * Enable the button
         */
        enable: function enable() {
        },

        /**
         * Disable the button
         */
        disable: function disable() {
            hideIfVisible(this);
        },

        /**
         * Show the button
         */
        show: function show() {
        },

        /**
         * Hide the button
         */
        hide: function hide() {
            hideIfVisible(this);
        }
    });
});
