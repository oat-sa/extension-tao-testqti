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
 * Copyright (c) 2016 (original work) Open Assessment Technologies SA ;
 */
/**
 * @author Jean-Sébastien Conan <jean-sebastien.conan@vesperiagroup.com>
 */
define([
    'i18n',
    'taoTests/runner/plugin'
], function (__, pluginFactory) {
    'use strict';

    /**
     * Creates the autoPause plugin.
     * Auto pause the assessment when the connectivity is lost
     */
    return pluginFactory({

        name: 'autoPause',

        /**
         * Initializes the plugin (called during runner's init)
         */
        init: function init() {
            var testRunner = this.getTestRunner();

            // auto pause when disconnected
            testRunner
                .on('disconnect', function() {
                    var states = testRunner.getTestData().states;
                    testRunner
                        .trigger('autopause')
                        .trigger('leave', {
                            message: __('You are encountering a connectivity loss. The test has been suspended.'),
                            code: states.suspended
                        });
                });
        }
    });
});
