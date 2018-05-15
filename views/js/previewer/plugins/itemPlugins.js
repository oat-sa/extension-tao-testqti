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
 * Copyright (c) 2018 (original work) Open Assessment Technologies SA ;
 */
/**
 * @author Jean-Sébastien Conan <jean-sebastien@taotesting.com>
 */
define([
    'lodash',
    'ui/themes',
    'taoQtiTest/previewer/plugins/controls/close',
    'taoQtiTest/previewer/plugins/navigation/submit/submit',
    'taoQtiTest/runner/plugins/tools/itemThemeSwitcher/itemThemeSwitcher'
], function (_, themeHandler, close, submit, itemThemeSwitcher) {
    'use strict';

    /**
     * Gets the list of plugins required to properly preview an item, gathered by categories.
     * @returns {Object}
     */
    return function itemPluginsLoader() {
        var themesConfig = themeHandler.get('items') || {};
        var plugins = {
            controls: [
                close
            ],
            navigation: [
                submit
            ]
        };

        if (themesConfig && _.size(themesConfig.available) > 1) {
            plugins.tools = [
                itemThemeSwitcher
            ];
        }

        return plugins;
    };
});
