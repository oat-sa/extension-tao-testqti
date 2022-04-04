define(['lodash', 'module', 'taoTests/runner/proxy'], function (_, module, proxy) { 'use strict';

    _ = _ && Object.prototype.hasOwnProperty.call(_, 'default') ? _['default'] : _;
    module = module && Object.prototype.hasOwnProperty.call(module, 'default') ? module['default'] : module;
    proxy = proxy && Object.prototype.hasOwnProperty.call(proxy, 'default') ? proxy['default'] : proxy;

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
     * Copyright (c) 2017-2019 Open Assessment Technologies SA ;
     */
    /**
     * The configuration of the provider to use with it's AMD module
     */

    var config = _.defaults(module.config(), {
      providerName: 'qtiServiceProxy',
      module: 'taoQtiTest/runner/proxy/qtiServiceProxy'
    });
    /**
     * Load and register the configured providers
     * @returns {Promise} resolves with the regsitered provider name
     */


    function load() {
      return new Promise(function (resolve, reject) {
        require([config.module], function (proxyProvider) {
          proxy.registerProvider(config.providerName, proxyProvider);
          resolve(config.providerName);
        }, reject);
      });
    }

    return load;

});
