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
    'jquery',
    'lodash',
    'taoQtiTest/previewer/runner',
    'taoQtiTest/previewer/provider/item',
    'taoQtiTest/previewer/plugins/itemPlugins',
    'css!taoQtiTestCss/item-previewer'
], function ($, _, previewerFactory, itemProvider, itemPluginsLoader) {
    'use strict';

    /**
     * Builds a test runner to preview test item
     * @param {Object}   config - The testRunner options
     * @param {String}   config.provider - The provider to use
     * @param {Object[]} [config.plugins] - A collection of plugins to load
     * @param {Object[]} [config.providers] - A collection of providers to load.
     *                                        Will be filtered to only the 'previewer' category.
     * @param {Boolean} [config.replace] - When the component is appended to its container, clears the place before
     * @param {Number|String} [config.width] - The width in pixels, or 'auto' to use the container's width
     * @param {Number|String} [config.height] - The height in pixels, or 'auto' to use the container's height
     * @param {jQuery|HTMLElement|String} [container] - The container in which renders the component
     * @returns {previewer}
     */
    return function itemPreviewerFactory(config, container) {
        var itemPlugins = itemPluginsLoader();

        config = config || {};
        config.loadedPlugins = config.loadedPlugins || {};
        _.forEach(itemPlugins, function(plugins, category) {
            config.loadedPlugins[category] = (config.loadedPlugins[category] || []).concat(plugins);
        });

        config.loadProviders = config.loadProviders || {};
        config.loadProviders.previewer = [itemProvider];
        config.provider = config.provider || itemProvider.name;

        return previewerFactory(container || $(document.body), config)
            .on('render', function() {
                this.setState('fullpage', true);
            })
            .on('ready', function(runner) {
                var self = this;
                runner.on('destroy', function() {
                    self.destroy();
                });
            });
    };
});
