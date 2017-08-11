/*
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
 * Store test takers' actions
 *
 * @author Bertrand Chevrier <bertrand@taotesting.com>
 */
define([
    'lodash',
    'core/store'
], function(_, store) {
    'use strict';

    var storeName = 'actions';
    var storeKey  = 'queue';

    /**
     * Create an action store
     *
     * @param {String} id - the store id, to identify a test
     * @returns {actionStore}
     */
    return function actionStoreFatory(id) {

        var storeId;
        var actionQueue = [];

        if(_.isEmpty(id)){
            throw new TypeError('Please specify the action store id');
        }
        storeId = storeName + '-' + id;

        /**
         * @typedef {actionStore}
         */
        return {

            /**
             * Push an action to the store
             * @param {String} action - the action name
             * @param {Object} params - the action parameters
             * @returns {Promise} resolves when the action is stored
             */
            push: function push(action, params) {
                actionQueue.push({
                    action : action,
                    timestamp : Date.now(),
                    parameters : params
                });
                return store(storeId).then(function(actionStore) {
                    return actionStore.setItem(storeKey, actionQueue);
                });
            },

            /**
             * Flush the action store and retrieve the data
             * @returns {Promise} resolves with the flushed data
             */
            flush : function flush(){
                actionQueue = [];
                return store(storeId).then(function(actionStore) {
                    return actionStore.getItem(storeKey).then(function(queue){
                        return actionStore.setItem(storeKey, actionQueue).then(function(){
                            return queue;
                        });
                    });
                });
            }
        };
    };
});
