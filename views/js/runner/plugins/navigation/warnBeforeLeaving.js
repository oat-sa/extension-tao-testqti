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
 * Copyright (c) 2017 (original work) Open Assessment Technologies SA ;
 */

/**
 * Warn the test taker before closing the browser window
 *
 * @author Bertrand Chevrier <bertrand@taotesting.com>
 */
define([
    'i18n',
    'taoTests/runner/plugin'
], function (__, pluginFactory) {
    'use strict';

    /**
     * There's only a few chance to have this message displayed.
     * Most browsers doesn't support custom message anymore.
     * See https://www.chromestatus.com/feature/5349061406228480
     */
    var warnMessage = __('Please confirm you want to leave the test.');

    /**
     * The beforeunload listener
     * @param {Event} e
     * @returns {String} the custom message (for some browser, just need to be a string)
     */
    var warnListener = function warnListener(e){
        e.returnValue = warnMessage;
        return warnMessage;
    };

    /**
     * Plugin factory
     * @returns {Object}
     */
    return pluginFactory({

        /**
         * Plugin name
         * @type {String}
         */
        name: 'warnBeforeLeaving',

        /**
         * Initialize plugin (called during runner's initialization)
         */
        init: function init() {
            this.enable();
        },

        /**
         * Destroy plugin (called during runner's destruction)
         */
        destroy : function destroy(){
            this.disable();
        },

        /**
         * Enables the warning
         */
        enable : function enable(){
            window.addEventListener('beforeunload', warnListener);
        },

        /**
         * Disables the warning
         */
        disable : function disable(){
            window.removeEventListener('beforeunload', warnListener);
        }
    });
});
