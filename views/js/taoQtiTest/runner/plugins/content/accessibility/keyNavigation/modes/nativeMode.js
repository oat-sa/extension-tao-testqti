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
     * Native key navigation mode
     */
    var nativeMode = {
      name: 'native',

      /**
       * Builds the key navigation config for the "native" mode
       * @param {keyNavigationStrategyConfig} config - additional config to set
       * @returns {keyNavigationMode}
       */
      init: function init() {
        var config = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
        return {
          // todo: add access to the page and the rubric blocks
          strategies: ['jump-links', 'header', 'top-toolbar', 'navigator', 'page', 'rubrics', 'stimulus', 'item', 'toolbar'],
          config: Object.assign({
            autoFocus: false,
            wcagBehavior: false,
            keepState: false,
            propagateTab: true,
            flatNavigation: true,
            keyNextGroup: 'tab',
            keyPrevGroup: 'shift+tab',
            keyNextItem: 'right down',
            keyPrevItem: 'left up',
            keyNextTab: '',
            keyPrevTab: '',
            keyNextContent: '',
            keyPrevContent: ''
          }, config)
        };
      }
    };

    return nativeMode;

});
