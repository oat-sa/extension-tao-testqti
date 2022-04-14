define(['lodash', 'taoTests/runner/plugin', 'ckeditor'], function (_, pluginFactory, ckEditor) { 'use strict';

    _ = _ && Object.prototype.hasOwnProperty.call(_, 'default') ? _['default'] : _;
    pluginFactory = pluginFactory && Object.prototype.hasOwnProperty.call(pluginFactory, 'default') ? pluginFactory['default'] : pluginFactory;
    ckEditor = ckEditor && Object.prototype.hasOwnProperty.call(ckEditor, 'default') ? ckEditor['default'] : ckEditor;

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
     * Copyright (c) 2018 (original work) Open Assessment Technologies SA;
     */
    /**
     * Check if client uses the iOS device.
     *
     * @returns {*|boolean}
     */

    function isIOSDevice() {
      return /(iPhone|iPad)/i.test(navigator.userAgent);
    }
    /**
     * Returns the configured plugin
     */


    var focusOnFirstField = pluginFactory({
      name: 'focusOnFirstField',

      /**
       * Initialize the plugin (called during runner's init)
       */
      init: function init() {
        var self = this;
        /**
         * When an Item is loaded - if we set the focus on any input then the ipad sets the focus on the
         * keyboard, so the windows lose focus
         * and we get an error message for the test in fullscreen mode
         */

        if (!isIOSDevice()) {
          this.getTestRunner().after('renderitem', function () {
            var $input = self.getAreaBroker().getContentArea().find('.qti-itemBody').find('input, textarea, select').not(':input[type=button], :input[type=submit], :input[type=reset]').first();
            var $cke = $input.closest('.qti-interaction').find('.cke');

            if ($cke.length) {
              _.delay(function () {
                ckEditor.instances[$cke.attr('id').replace(/^cke_/, '')].focus();
              }, 100);
            } else {
              $input.focus();
            }
          });
        }
      }
    });

    return focusOnFirstField;

});
