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
 * Copyright (c) 2018 (original work) Open Assessment Technologies SA ;
 */
/**
 * @author Jean-Sébastien Conan <jean-sebastien@taotesting.com>
 */
define([
    'lodash',
    'core/logger',
    'taoQtiTest/previewer/item'
], function (_, loggerFactory, previewerFactory) {
    'use strict';

    var logger = loggerFactory('taoQtiTest/previewer');

    /**
     * Wraps the legacy item previewer in order to be loaded by the taoItems previewer factory
     */
    return {
        name: 'qtiItem',

        /**
         * Builds and shows the legacy item previewer
         *
         * @param {String} uri - The URI of the item to load
         * @param {Object} state - The state of the item
         * @param {Object} [config] - Some config entries
         * @param {String} [config.serviceCallId='previewer'] - The service call Id to send to the server
         * @param {logger} [config.logger] - A logger for the errors reporting
         * @param {String} [config.fullPage] - Force the previewer to occupy the full window.
         * @param {String} [config.readOnly] - Do not allow to modify the previewed item.
         * @returns {Object}
         */
        init: function init(uri, state, config) {
            config = _.defaults(config || {}, {
                serviceCallId: 'previewer',
                logger: logger
            });

            return previewerFactory(config)
                .on('error', function (err) {
                    config.logger.error(err);
                })
                .on('ready', function (runner) {
                    runner
                        .on('renderitem', function() {
                            if (state) {
                                runner.itemRunner.setState(state);
                            }
                        })
                        .loadItem(uri);
                });
        }
    };
});
