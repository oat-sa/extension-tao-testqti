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
    'tpl!taoQtiTest/runner/plugins/navigation/button',
    'tpl!taoQtiTest/runner/plugins/tools/itemThemeSwitcher/itemThemeSwitcher'
], function ($, _, __, pluginFactory, hider, themeHandler, buttonTpl, itemThemeSwitcherTpl) {
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
            var themesConfig = themeHandler.get('items') || {};
            var state = {
                availableThemes: [],
                defaultTheme: '',
                selectedTheme: ''
            };

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

            //handle state change
            function changeTheme(id) {
                var $qtiItem = $('.qti-item');
                if (state.selectedTheme) {
                    self.$ul.find('[data-control="' + state.selectedTheme + '"]').removeClass('selected');
                }
                state.selectedTheme = id;

                self.$ul.find('[data-control="' + state.selectedTheme + '"]').addClass('selected');

                if ($qtiItem) {
                    _.defer(function(){
                        $qtiItem.trigger('themechange', [state.selectedTheme]);
                    });
                }
            }

            //attach behavior
            this.$button.on('click', function (e) {
                e.preventDefault();
                if (self.getState('enabled') !== false) {
                    hider.toggle(self.$menu);
                }
            });

            this.$ul.find('li').on('click', function (e) {
                var themeId = e.currentTarget.getAttribute('data-control');
                e.preventDefault();
                changeTheme(themeId);
            });

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
