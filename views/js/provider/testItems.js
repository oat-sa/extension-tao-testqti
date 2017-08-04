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
    'core/dataProvider/request'
], function (_, __, urlUtil, request) {
    'use strict';

    /**
     * Per function requests configuration.
     */
    var defaultConfig = {
        getItemClasses : {
            url : urlUtil.route('getItemClasses', 'Items', 'taoQtiTest')
        },
        getItems : {
            url : urlUtil.route('getItems', 'Items', 'taoQtiTest')
        },
        getItemClassProperties : {
            url : urlUtil.route('create', 'RestFormItem', 'taoItems')
        }
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
             * Get the list of Items classes and sub classes
             * @returns {Promise} that resolves with the classes
             */
            getItemClasses: function getItemClasses(){
                return request(config.getItemClasses.url);
            },

            /**
             * Get QTI Items in different formats
             * @param {Object} [params] - the parameters to pass through the request
             * @returns {Promise} that resolves with the classes
             */
            getItems : function getItems(params){
                return request(config.getItems.url, params);
            },

            /**
             * Get the properties of a the given item class
             * @param {String} classUri - the item class URI
             * @returns {Promise} that resolves with the classes
             */
            getItemClassProperties: function getItemClassProperties(classUri) {
                return request(config.getItemClassProperties.url, { classUri : classUri });
            }
        };
    };
});
