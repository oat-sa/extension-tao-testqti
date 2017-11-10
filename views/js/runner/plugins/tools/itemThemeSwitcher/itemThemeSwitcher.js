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
    'core/store',
    'taoTests/runner/plugin',
    'ui/hider',
    'ui/themes',
    'util/shortcut',
    'util/namespace'
], function ($, _, __, storeFactory, pluginFactory, hider, themeHandler, shortcut, namespaceHelper) {
    'use strict';

    /**
     * The public name of the plugin
     * @type {String}
     */
    var pluginName = 'itemThemeSwitcher';

    /**
     * Returns the configured plugin
     */
    return pluginFactory({

        name: pluginName,

        /**
         * Installation of the plugin (called before init)
         */
        install: function install() {
            var self = this;
            //the storechange event is fired early (before runner's init is done)
            //so we attach the handler early
            var testRunner = this.getTestRunner();
            testRunner.on('storechange', function handleStoreChange() {
                self.shouldClearStorage = true;
            });
        },

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
            var allMenuEntries = [];

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

            return storeFactory(pluginName + '-' + testRunner.getConfig().serviceCallId)
                .then(function (itemThemesStore) {
                    if (self.shouldClearStorage) {
                        return itemThemesStore.clear().then(function () {
                            return itemThemesStore;
                        });
                    }
                    return itemThemesStore;
                }).then(function (itemThemesStore) {
                    testRunner
                        .after('renderitem enableitem', function () {
                            self.storage = itemThemesStore;

                            self.storage.getItem('itemThemeId')
                                .then(function (itemThemeId) {
                                    if (itemThemeId && state.selectedTheme !== itemThemeId) {
                                        changeTheme(itemThemeId);

                                        allMenuEntries.forEach(function (menuEntry) {
                                            if (menuEntry.getId() === itemThemeId) {
                                                menuEntry.turnOn();
                                            } else {
                                                menuEntry.turnOff();
                                            }
                                        });
                                    }
                                });
                        })

                        .before('finish', function() {
                            return new Promise(function(resolve) {
                                self.storage.removeStore()
                                    .then(resolve)
                                    .catch(resolve);
                            });
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
