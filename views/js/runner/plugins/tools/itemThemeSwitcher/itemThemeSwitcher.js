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
 * Test Runner Tool Plugin : item Theme Switcher
 *
 * @author
 */
define([
    'jquery',
    'lodash',
    'i18n',
    'taoTests/runner/plugin',
    'ui/hider',
    'ui/themes',
    'util/shortcut',
    'util/namespace'
], function ($, _, __, pluginFactory, hider, themeHandler, shortcut, namespaceHelper) {
    'use strict';

    /**
     * Returns the configured plugin
     */
    return pluginFactory({

        name: 'itemThemeSwitcher',

        /**
         * Initialize the plugin (called during runner's init)
         */
        init: function init() {
            var self = this;
            var testRunner = this.getTestRunner();
            var testData = testRunner.getTestData() || {};
            var testConfig = testData.config || {};
            var pluginShortcuts = (testConfig.shortcuts || {})[this.getName()] || {};
            var themesConfig = themeHandler.get('items') || {};
            var state = {
                availableThemes: [],
                defaultTheme: '',
                selectedTheme: ''
            };

            /**
             * Load the selected theme
             * @param themeId
             */
            function changeTheme(themeId) {
                var $qtiItem = $('.qti-item');
                state.selectedTheme = themeId;

                if ($qtiItem) {
                    _.defer(function(){
                        $qtiItem.trigger('themechange', [state.selectedTheme]);
                    });
                }
            }

            //init plugin state
            if (themesConfig) {
                if (themesConfig.default) {
                    state.defaultTheme = themesConfig.default;
                    state.selectedTheme = themesConfig.default;
                }
                if (themesConfig.available) {
                    _.forEach(themesConfig.available, function (theme) {
                        state.availableThemes.push({
                            id: theme.id,
                            label: theme.name
                        });
                    });
                }
            }

            // register toolbox button
            this.menuButton = this.getAreaBroker().getToolbox().createMenu({
                control: 'color-contrast',
                title: __('Change the current color preset'),
                icon: 'contrast',
                text: __('Contrast')
            });

            this.menuButton.on('click', function (e) {
                e.preventDefault();
                testRunner.trigger('tool-themeswitcher-toggle');
            });


            // register menu entries
            state.availableThemes.forEach(function (theme) {
                var themeEntry = self.getAreaBroker().getToolbox().createEntry({
                    control: theme.id,
                    title: theme.label,
                    icon: 'preview',
                    text: __(theme.label)
                });

                themeEntry.setMenuId('color-contrast');

                themeEntry.on('click', function(e) {
                    var themeId = this.config.control;
                    e.preventDefault();

                    self.menuButton.turnOffAll();
                    this.turnOn();

                    changeTheme(themeId);
                });

                if (state.defaultTheme === theme.id) {
                    themeEntry.on('render', function() {
                        this.turnOn();
                    });
                }
            });

            if (testConfig.allowShortcuts) {
                if (pluginShortcuts.toggle) {
                    shortcut.add(namespaceHelper.namespaceAll(pluginShortcuts.toggle, this.getName(), true), function () {
                        testRunner.trigger('tool-themeswitcher-toggle');
                    }, {
                        avoidInput: true
                    });
                }
            }

            //start disabled
            this.disable();

            //update plugin state based on changes
            testRunner
                .on('loaditem', function() {
                    self.show();
                })
                .on('renderitem', function () {
                    self.enable();
                    changeTheme(state.selectedTheme);
                })
                .on('enabletools', function() {
                    self.enable();
                })
                .on('disabletools unloaditem', function () {
                    self.disable();
                })
                .on('tool-themeswitcher-toggle', function () {
                    if (self.getState('enabled') !== false) {
                        self.menuButton.toggleMenu();
                    }
                });
        },

        /**
         * Called during the runner's destroy phase
         */
        destroy: function destroy() {
            shortcut.remove('.' + this.getName());
        },

        /**
         * Enable the button
         */
        enable: function enable() {
            this.menuButton.enable();
        },

        /**
         * Disable the button
         */
        disable: function disable() {
            this.menuButton.disable();

        },

        /**
         * Show the button
         */
        show: function show() {
            this.menuButton.show();
        },

        /**
         * Hide the button
         */
        hide: function hide() {
            this.menuButton.hide();
        }
    });
});
