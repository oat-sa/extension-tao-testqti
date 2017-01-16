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
    'tpl!taoQtiTest/runner/plugins/templates/button',
    'tpl!taoQtiTest/runner/plugins/tools/itemThemeSwitcher/itemThemeSwitcher'
], function ($, _, __, pluginFactory, hider, themeHandler, shortcut, namespaceHelper, buttonTpl, itemThemeSwitcherTpl) {
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
                selectedTheme: '',
                hoveredIndex: 0
            };

            //handle state change
            /**
             * Load the selected theme
             * @param themeId
             */
            function changeTheme(themeId) {
                var $qtiItem = $('.qti-item');
                if (state.selectedTheme) {
                    self.$ul.find('[data-control="' + state.selectedTheme + '"]').removeClass('selected');
                }
                state.selectedTheme = themeId;

                self.$ul.find('[data-control="' + state.selectedTheme + '"]').addClass('selected');

                if ($qtiItem) {
                    _.defer(function(){
                        $qtiItem.trigger('themechange', [state.selectedTheme]);
                    });
                }
            }

            /**
             * Move the hovered index to the next available index
             */
            function moveDown() {
                state.hoveredIndex++;
                if (state.hoveredIndex === state.availableThemes.length) {
                    state.hoveredIndex = 0;
                }
                highlightMenuEntry();
            }

            /**
             * Move the hovered index to the next previous available index
             */
            function moveUp() {
                state.hoveredIndex--;
                if (state.hoveredIndex < 0) {
                    state.hoveredIndex = state.availableThemes.length - 1;
                }
                highlightMenuEntry();
            }

            /**
             * highlight the currently hovered menu entry
             */
            function highlightMenuEntry() {
                self.$menuItems.removeClass('hover');
                self.$menuItems.eq(state.hoveredIndex).addClass('hover');
            }


            /**
             * register plugin's own shortcuts
             */
            function registerInnerShortcuts() {
                var shortcuts = ['up', 'down', 'select'];
                if (testConfig.allowShortcuts) {
                    shortcuts.forEach(function (shortcutId) {
                        shortcut.add(namespaceHelper.namespaceAll(pluginShortcuts[shortcutId], self.getName(), true), function () {
                            testRunner.trigger('tool-themeswitcher-' + shortcutId);
                        }, {
                            avoidInput: true
                        });
                    });
                }
            }

            /**
             * unregister plugin's own shortcuts
             */
            function unregisterInnerShortcuts() {
                shortcut.remove('up.' + self.getName());
                shortcut.remove('down.' + self.getName());
                shortcut.remove('select.' + self.getName());
            }

            /**
             * get the theme index from an Id
             * @param {String} themeId
             * @returns {boolean|number}
             */
            function getThemeIndex(themeId) {
                var indexFound = false;
                state.availableThemes.forEach(function(theme, index) {
                    if (theme.id === themeId) {
                        indexFound = index;
                    }
                });
                return indexFound;
            }

            //build element (detached)
            this.$button = $(buttonTpl({
                control: 'color-contrast',
                title: __('Change the current color preset'),
                icon: 'preview',
                text: __('Contrast')
            }));

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

            //get access to controls
            this.$menu = $(itemThemeSwitcherTpl({
                themes: state.availableThemes
            }));
            this.$menu.appendTo(this.$button);
            this.$ul = this.$button.find('[data-control="item-theme-switcher-list"]');
            this.$menuItems = this.$menu.find('.menu-item');

            //attach behavior
            this.$button.on('click', function (e) {
                e.preventDefault();
                testRunner.trigger('tool-themeswitcher-toggle');
            });

            this.$menuItems.on('click', function (e) {
                var themeId = e.currentTarget.getAttribute('data-control');
                e.preventDefault();
                changeTheme(themeId);
            });

            this.$menuItems.on('mouseenter', function (e) {
                var themeId = e.currentTarget.getAttribute('data-control');
                state.hoveredIndex = getThemeIndex(themeId);
                highlightMenuEntry();
            });

            if (testConfig.allowShortcuts) {
                if (pluginShortcuts.toggle) {
                    shortcut.add(namespaceHelper.namespaceAll(pluginShortcuts.toggle, this.getName(), true), function () {
                        testRunner.trigger('tool-themeswitcher-toggle');
                        highlightMenuEntry();
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
                        hider.toggle(self.$menu);
                        if (!hider.isHidden(self.$menu)) {
                            registerInnerShortcuts();

                            //focus the switcher
                            document.activeElement.blur();
                            $('.selected a', self.$menu).focus();
                        } else {
                            unregisterInnerShortcuts();
                        }
                    }
                })
                .on('tool-themeswitcher-up', function () {
                    if (!hider.isHidden(self.$menu)) {
                        moveUp();
                    }
                })
                .on('tool-themeswitcher-down', function () {
                    if (!hider.isHidden(self.$menu)) {
                        moveDown();
                    }
                })
                .on('tool-themeswitcher-select', function() {
                    if (!hider.isHidden(self.$menu)) {
                        changeTheme(state.availableThemes[state.hoveredIndex].id);
                        hider.toggle(self.$menu);
                        unregisterInnerShortcuts();
                    }
                });
        },


        /**
         * Called during the runner's render phase
         */
        render: function render() {
            var $container = this.getAreaBroker().getToolboxArea();
            $container.append(this.$button);
        },

        /**
         * Called during the runner's destroy phase
         */
        destroy: function destroy() {
            shortcut.remove('.' + this.getName());
            this.$button.remove();
        },

        /**
         * Enable the button
         */
        enable: function enable() {
            this.$button.removeProp('disabled')
                .removeClass('disabled');
        },

        /**
         * Disable the button
         */
        disable: function disable() {
            hider.hide(this.$menu);
            this.$button.prop('disabled', true)
                .addClass('disabled');
        },

        /**
         * Show the button
         */
        show: function show() {
            hider.show(this.$button);
        },

        /**
         * Hide the button
         */
        hide: function hide() {
            hider.hide(this.$menu);
            hider.hide(this.$button);
        }
    });
});
