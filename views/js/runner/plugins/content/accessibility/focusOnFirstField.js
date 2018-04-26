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
 * Test Runner Content Plugin: Focus the first element if possible
 *
 * @author Dieter Raber <dieter@taotesting.com>
 */
define([
    'jquery',
    'lodash',
    'taoTests/runner/plugin'
], function ($, _, pluginFactory) {
    'use strict';


    /**
     * Returns the configured plugin
     */
    return pluginFactory({

        name: 'focusOnFirstField',

        /**
         * Initialize the plugin (called during runner's init)
         */
        init: function init() {
            var self = this;
            var testRunner = this.getTestRunner();

            //update plugin state based on changes
            testRunner
                .after('renderitem', function() {
                    var $item = self.getAreaBroker().getContentArea().find('.qti-itemBody');
                    var $firstInput = $item.find('input, textarea, select')
                        .not(':input[type=button], :input[type=submit], :input[type=reset]')
                        .filter(':first');
                    // var $firstInput = $('[data-serial="'  + itemData.content.data.serial + '"]')
                    //     .find('input[type=text],textarea,select').filter(':visible:first');
                    setTimeout(function() {
                        $firstInput.focus();
                        console.log($firstInput)
                    }, 2000)
                });
        }
    });
});
