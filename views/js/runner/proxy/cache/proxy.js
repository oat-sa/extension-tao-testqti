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
 * Copyright (c) 2017 Open Assessment Technologies SA
 */

/**
 */
define([
    'lodash',
    'core/promise',
    'taoQtiTest/runner/proxy/qtiServiceProxy',
    'taoQtiTest/runner/proxy/cache/itemStore',
    'taoQtiTest/runner/proxy/cache/assetLoader',
], function(_, Promise, qtiServiceProxy, itemStoreFactory, assetLoader) {
    'use strict';

    var cacheSize     = 15;
    var loadNextDelay = 350;

    /**
     * QTI proxy definition
     * Related to remote services calls
     * @type {Object}
     */
    var cacheProxy = _.defaults({

        init: function init(config, params) {

            this.itemStore    = itemStoreFactory(cacheSize);
            this.nextCalledBy = [];
            this.startOnMove  = false;
            this.isLastItem   = false;

            return qtiServiceProxy.init.call(this, config, params);
        },

        destroy: function destroy() {

            this.itemStore.clear();
            this.nextCalledBy = [];
            this.startOnMove = false;
            this.isLastItem  = false;

            return qtiServiceProxy.destroy.call(this);
        },


        /**
         * Gets an item definition by its URI, also gets its current state
         * @param {String} uri - The URI of the item to get
         * @returns {Promise} - Returns a promise. The item data will be provided on resolve.
         *                      Any error will be provided if rejected.
         */
        getItem: function getItem(uri) {
            var self = this;

            var loadNextItem = function loadNextItem(){
                if(!self.isLastItem && !_.contains(self.nextCalledBy, uri)){
                    _.delay(function(){
                        self.request(self.configStorage.getItemActionUrl(uri, 'getNextItemData'))
                        .then(function(response){
                            if(response && response.itemDefinition){
                                self.itemStore.set(response.itemDefinition, response);
                                self.startOnMove = true;
                                self.nextCalledBy.push(uri);

                                if(response.baseUrl && response.itemData && response.itemData.assets){
                                    assetLoader(response.baseUrl, response.itemData.assets);
                                }
                            }
                        })
                        .catch(function(err){
                            console.error(err);
                        });
                    }, loadNextDelay);
                }
            };

            if(this.itemStore.has(uri)){
                loadNextItem();

                return Promise.resolve(this.itemStore.get(uri));
            }

            return this.request(this.configStorage.getItemActionUrl(uri, 'getItem'))
                    .then(function(data){
                        loadNextItem();
                        return data;
                    });
        },

        /**
         * Calls an action related to a particular item
         * @param {String} uri - The URI of the item for which call the action
         * @param {String} action - The name of the action to call
         * @param {Object} [params] - Some optional parameters to join to the call
         * @returns {Promise} - Returns a promise. The result of the request will be provided on resolve.
         *                      Any error will be provided if rejected.
         */
        callItemAction: function callItemAction(uri, action, params) {
            var self = this;

            if(this.startOnMove){
                params.start = true;
            }
            return this.request(this.configStorage.getItemActionUrl(uri, action), params)
                    .then(function(response){
                        self.isLast = response && response.testContext && response.testContext.isLast;
                        return response;
                    });
        },
    }, qtiServiceProxy);


    return cacheProxy;
});
