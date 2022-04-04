define(['lodash', 'taoQtiTest/runner/plugins/content/accessibility/keyNavigation/keyNavigation', 'taoTests/runner/plugin', 'css!taoQtiTest/runner/plugins/content/accessibility/css/key-navigation.css'], function (_, keyNavigatorFactory, pluginFactory, keyNavigation_css) { 'use strict';

    _ = _ && Object.prototype.hasOwnProperty.call(_, 'default') ? _['default'] : _;
    keyNavigatorFactory = keyNavigatorFactory && Object.prototype.hasOwnProperty.call(keyNavigatorFactory, 'default') ? keyNavigatorFactory['default'] : keyNavigatorFactory;
    pluginFactory = pluginFactory && Object.prototype.hasOwnProperty.call(pluginFactory, 'default') ? pluginFactory['default'] : pluginFactory;

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
     * Copyright (c) 2016-2020 (original work) Open Assessment Technologies SA ;
     */
    /**
     * If we have now config from backend side - we set this default dataset
     *
     * @typedef {object}
     * @properties {string} contentNavigatorType - ('default' | 'linear') - type of content navigation
     */

    var defaultPluginConfig = {
      contentNavigatorType: 'default'
    };
    /**
     * Returns the configured plugin
     */

    var plugin = pluginFactory({
      name: 'keyNavigation',

      /**
       * Initialize the plugin (called during runner's init)
       */
      init: function init() {
        var testRunner = this.getTestRunner();

        var pluginConfig = _.defaults(this.getConfig(), defaultPluginConfig);

        var keyNavigator = keyNavigatorFactory(testRunner, pluginConfig);
        /**
         *  Update plugin state based on changes
         */

        testRunner.after('renderitem', function () {
          // make sure that keyNavigator is destroyed
          // to preevent multiple instances to be active at the same time
          if (keyNavigator.isActive()) {
            keyNavigator.destroy();
          }

          keyNavigator.init();
        }).on('unloaditem', function () {
          keyNavigator.destroy();
        })
        /**
         * @param {string} type - type of content tab navigation,
         * can be: 'default', 'linear', 'native'
         */
        .on('setcontenttabtype', function (type) {
          keyNavigator.setMode(type);
          pluginConfig.contentNavigatorType = type;
        });
      }
    });

    return plugin;

});
