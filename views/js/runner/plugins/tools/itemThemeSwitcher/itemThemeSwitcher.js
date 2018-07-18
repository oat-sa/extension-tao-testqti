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
    'util/namespace',
    'ui/themeLoader'
], function ($, _, __, pluginFactory, hider, themeHandler, shortcut, namespaceHelper, themeLoader) {
    'use strict';

    /**
     * Returns the configured plugin
     */
    return pluginFactory({

        name: 'itemThemeSwitcher',

        /**
         * Install step, add behavior before the lifecycle.
         */
        install: function install() {
            //define the "itemThemeSwitcher" store as "volatile" (removed on browser change).
            this.getTestRunner().getTestStore().setVolatile(this.getName());
        },

        /**
         * Initialize the plugin (called during runner's init)
         */
        init: function init() {
            var self = this;
            var pluginName = this.getName();
            var testRunner = this.getTestRunner();
            var testData = testRunner.getTestData() || {};
            var testConfig = testData.config || {};
            var pluginShortcuts = (testConfig.shortcuts || {})[this.getName()] || {};

            var pluginConfig = self.getConfig();
            var oldNamespace = themeHandler.getActiveNamespace();
            var themesConfig = {};
            var state = {
                availableThemes: [],
                defaultTheme: '',
                selectedTheme: ''
            };
            var allMenuEntries = [];

            if (pluginConfig.activeNamespace) {
                themeHandler.setActiveNamespace(pluginConfig.activeNamespace);
            }
            themesConfig = themeHandler.get('items') || {};
            if (pluginConfig.activeNamespace !== oldNamespace && !_.isEmpty(themesConfig)) {
                reloadThemes();
            }

            /**
             * Tells if the component is enabled
             * @returns {Boolean}
             */
            function isPluginAllowed() {
                return themesConfig && _.size(themesConfig.available) > 1;
            }

            /**
             * Reloads theme config and changes theme
             */
            function reloadThemes() {
                var themeConfig = themeHandler.get('items');

                themeLoader(themeConfig).load();
                if (state && state.selectedTheme) {
                    changeTheme(state.selectedTheme);
                } else {
                    changeTheme(themeConfig.default);
                }
            }

            /**
             * Load the selected theme
             * @param themeId
             */
            function changeTheme(themeId) {
                var $qtiItem = $('.qti-item');
                var previousTheme = state.selectedTheme;
                state.selectedTheme = themeId;

                if ($qtiItem) {
                    _.defer(function(){
                        $qtiItem.trigger('themechange', [state.selectedTheme]);
                    });
                }
                if (self.storage) {
                    self.storage.setItem('itemThemeId', themeId);
                }

                if (previousTheme !== state.selectedTheme) {
                    testRunner.trigger('themechange', state.selectedTheme, previousTheme);
                }

                allMenuEntries.forEach(function (menuEntry) {
                    if (menuEntry.getId() === themeId) {
                        menuEntry.turnOn();
                    } else {
                        menuEntry.turnOff();
                    }
                });
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
            }).on('click', function (e) {
                e.preventDefault();
                testRunner.trigger('tool-themeswitcher-toggle');
            }).on('openmenu', function() {
                testRunner.trigger('plugin-open.' + pluginName, state.selectedTheme);
            }).on('closemenu', function() {
                testRunner.trigger('plugin-close.' + pluginName, state.selectedTheme);
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
                allMenuEntries.push(themeEntry);
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

            if (!isPluginAllowed()) {
                this.hide();
            }

            //start disabled
            this.disable();

            //update plugin state based on changes
            testRunner
                .on('loaditem', function() {
                    if (isPluginAllowed()) {
                        self.show();
                    } else {
                        self.hide();
                    }
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

            return testRunner.getPluginStore(this.getName())
                .then(function (itemThemesStore) {
                    self.storage = itemThemesStore;
                    self.storage.getItem('itemThemeId')
                        .then(function (itemThemeId) {
                            if (itemThemeId && state.selectedTheme !== itemThemeId) {
                                changeTheme(itemThemeId);
                            }
                        });
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
