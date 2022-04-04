define(function () { 'use strict';

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
     * Default key navigation mode
     */
    var defaultMode = {
      name: 'default',

      /**
       * Builds the key navigation config for the "default" mode
       * @param {keyNavigationStrategyConfig} config - additional config to set
       * @returns {keyNavigationMode}
       */
      init: function init() {
        var config = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
        return {
          strategies: ['rubrics', 'stimulus', 'item', 'toolbar', 'header', 'top-toolbar', 'navigator', 'page'],
          config: Object.assign({
            autoFocus: true,
            wcagBehavior: false,
            keepState: true,
            propagateTab: false,
            flatNavigation: false,
            keyNextGroup: 'tab',
            keyPrevGroup: 'shift+tab',
            keyNextItem: 'right down',
            keyPrevItem: 'left up',
            keyNextTab: 'right',
            keyPrevTab: 'left',
            keyNextContent: 'down',
            keyPrevContent: 'up'
          }, config)
        };
      }
    };

    return defaultMode;

});
