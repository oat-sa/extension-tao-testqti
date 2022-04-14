define(['core/providerRegistry', 'taoQtiTest/runner/plugins/content/accessibility/keyNavigation/modes/index'], function (providerRegistry, modes) { 'use strict';

    providerRegistry = providerRegistry && Object.prototype.hasOwnProperty.call(providerRegistry, 'default') ? providerRegistry['default'] : providerRegistry;

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
     * Copyright (c) 2020 Open Assessment Technologies SA ;
     */
    /**
     * Defines the mode config
     * @typedef {Object} keyNavigationMode
     * @property {String[]} strategies
     * @property {keyNavigationStrategyConfig} config
     */

    /**
     * Builds a key navigator modes manager.
     *
     * @param {String} mode - the name of the mode to get
     * @param {keyNavigationStrategyConfig} config - additional config to set
     * @returns {keyNavigationMode}
     */

    function modeFactory(mode) {
      var config = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
      var instance = modeFactory.getProvider(mode);
      return instance.init(config);
    } // bootstrap the manager and register the strategies

    providerRegistry(modeFactory);
    Object.values(modes).forEach(function (mode) {
      return modeFactory.registerProvider(mode.name, mode);
    });

    return modeFactory;

});
