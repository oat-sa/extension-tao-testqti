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
 * Copyright (c) 2017 (original work) Open Assessment Technologies SA;
 */

/**
 * The testItem data provider
 *
 * @author Bertrand Chevrier <bertrand@taotesting.com>
 */
define([
    'lodash',
    'i18n',
    'util/url',
    'core/dataProvider/request',
    'core/promise'
], function (_, __, urlUtil, request, Promise) {
    'use strict';

    /**
     * Per function requests configuration.
     */
    var defaultConfig = {
        getItemClasses : {
            url : urlUtil.route('getItemClasses', 'Items', 'taoQtiTest')
        },
        getItems : {
            list : urlUtil.route('getItemList', 'Items', 'taoQtiTest'),
            tree : urlUtil.route('getItemTree', 'Items', 'taoQtiTest')
        },
    };

    /**
     * Creates a configured testItem provider
     *
     * @param {Object} [config] - to override the default config
     * @returns {testItemProvider} the new provider
     */
    return function testItemProviderFactory(config){

        config = _.defaults(config || {}, defaultConfig);

        /**
         * @typedef {testItemProvider}
         */
        return {

            /**
             * @returns {Promise} that resolves with the list of created assignements
             */
            getItemClasses: function getItemClasses(){
                return request(config.getItemClasses.url);
            },

            getItems : function getItems(params){
                var url = config.getItems[params.format];
                if(!url){
                    return Promise.reject(new TypeError('Wrong format parameter'));
                }
                return request(url, params);
            }

        };
    };
});
