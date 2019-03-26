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
 * Copyright (c) 2019 (original work) Open Assessment Technologies SA ;
 */
/**
 * @author Péter Halász <peter@taotesting.com>
 */
define([
    'lodash',
    'i18n'
], function(
    _,
    __
) {
    'use strict';

    return {
        /**
         * Error type in case when the test taker is unable to navigate offline
         * @type {Error}
         */
        offlineNavError: _.assign(
            new Error(__('We are unable to connect to the server to retrieve the next item.')),
            {
                success : false,
                source: 'navigator',
                purpose: 'proxy',
                type: 'nav',
                code : 404
            }
        ),

        /**
         * Error type in case when the test taker is unable to exit the test offline
         * @type {Error}
         */
        offlineExitError: _.assign(
            new Error(__('We are unable to connect the server to submit your results.')),
            {
                success : false,
                source: 'navigator',
                purpose: 'proxy',
                type: 'finish',
                code : 404
            }
        ),

        /**
         * Error type in case when the test get paused in offline mode
         * @type {Error}
         */
        offlinePauseError: _.assign(
            new Error(__('The test has been paused, we are unable to connect to the server.')),
            {
                success : false,
                source: 'navigator',
                purpose: 'proxy',
                type: 'pause',
                code : 404
            }
        )
    };
});
