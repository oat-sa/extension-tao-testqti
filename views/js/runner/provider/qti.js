
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
 * Test Runner provider for QTI Tests.
 *
 * @author Bertrand Chevrier <bertrand@taotesting.com>
 */
define([
    'jquery',
    'lodash',
    'i18n',
    'core/promise',
    'taoTests/runner/areaBroker',
    'taoTests/runner/proxy',
    'taoQtiItem/runner/qtiItemRunner',
    'taoItems/assets/manager',
    'taoItems/assets/strategies',
    'tpl!taoQtiTest/runner/provider/layout'
], function($, _, __, Promise, areaBroker, proxyFactory, qtiItemRunner, assetManagerFactory, assetStrategies, layoutTpl) {
    'use strict';

    //the asset strategies
    var assetManager = assetManagerFactory([
        assetStrategies.external,
        assetStrategies.base64,
        assetStrategies.baseUrl
    ], { baseUrl: '' });

    /**
     * A Test runner provider to be registered againt the runner
     */
    var qtiProvider = {

        //provider name
        name : 'qti',

        /**
         * Initialize and load the area broker with a correct mapping
         * @returns {areaBroker}
         */
        loadAreaBroker : function loadAreaBroker(){
            var $layout = $(layoutTpl());
            return areaBroker($layout, {
                'content' : $('#qti-content', $layout),
                'toolbox' : $('.tools-box', $layout),
                'navigation' : $('.navi-box-list', $layout),
                'control' : $('.top-action-bar .control-box', $layout),
                'panel' : $('.test-sidebar-left', $layout),
                'header' : $('.title-box', $layout)
            });
        },

        /**
         * Initialize and load the test runner proxy
         * @returns {proxy}
         */
        loadProxy : function loadProxy(){

            var config = this.getConfig();

            var proxyConfig = _.pick(config, [
                'testDefinition',
                'testCompilation',
                'serviceCallId',
                'serviceController',
                'serviceExtension'
            ]);
            return proxyFactory('qtiServiceProxy', proxyConfig);
        },

        /**
         * Initialization of the provider, called during test runner init phase.
         *
         * We install behaviors during this phase (ie. even handlers)
         * and we call proxy.init.
         *
         * @this {runner} the runner context, not the provider
         * @returns {Promise} to chain proxy.init
         */
        init : function init(){
            var self = this;

            /**
             * Compute the next item for the given action
             * @param {String} action - item action like move/next, skip, etc.
             * @param {Object} [params] - the item action additionnal params
             */
            var computeNext = function computeNext(action, params){

                var context = self.getTestContext();

                //to be sure load start after unload...
                //we add an intermediate ns event on unload
                self.on('unloaditem.' + action, function(){
                    self.off('.'+action);

                    self.getProxy()
                        .callItemAction(context.itemUri, action, params)
                        .then(function(results){

                            self.setTestContext(results.testContext);

                            if (results.testMap) {
                                self.setTestMap(results.testMap);
                            } else {
                                updateStats();
                            }

                            load();
                        })
                        .catch(function(err){
                            self.trigger('error', err);
                        });
                })
                .unloadItem(context.itemUri);
            };

            /**
             * Load the next action: load the current item or call finish based the test state
             */
            var load = function load(){

                var context = self.getTestContext();
                var states = self.getTestData().states;
                if(context.state <= states.interacting){
                    self.loadItem(context.itemUri);
                } else if (context.state === states.closed){
                    self.finish();
                }
            };

            /**
             * Store the item state and responses, if needed
             * @returns {Promise}
             */
            var store = function store(){

               var context = self.getTestContext();

               //we store only the responses and the state only if the user has interacted with the item.
               if(self.getItemState(context.itemUri, 'changed')){
                    return Promise.all([
                        self.getProxy().submitItemState(context.itemUri, self.itemRunner.getState()),
                        self.getProxy().storeItemResponse(context.itemUri, self.itemRunner.getResponses())
                    ]);
               }
               return Promise.resolve([]);
            };

            /**
             * Update the stats on the TestMap
             * @param {Boolean} answered - if we flag the current item as answered
             */
            var updateStats = function updateStats(answered){

               var testPart, section, item;
               var stats = {
                    answered : 0,
                    flagged : 0,
                    viewed : 0,
                    total : 0
               };

               var context = self.getTestContext();
               var testMap = self.getTestMap();
               var states = self.getTestData().states;

               //reduce by sum up the stats
               var accStats = function accStats(acc, level){
                    acc.answered += level.stats.answered;
                    acc.flagged += level.stats.flagged;
                    acc.viewed += level.stats.viewed;
                    acc.total += level.stats.total;
                    return acc;
               };

               if(context.state !== states.interacting){
                   return;
               }

               testPart = testMap.parts[context.testPartId];
               section  = testPart.sections[context.sectionId];
               item     = section.items[context.itemIdentifier];

               //flag as viewed, always
               item.viewed = true;
               if(answered){
                    item.answered = true;
               }

               //compute section stats from it's items
               section.stats = _.reduce(section.items, function(acc, item){
                    if(item.answered){
                        acc.answered++;
                    }
                    if(item.flagged){
                        acc.flagged++;
                    }
                    if(item.viewed){
                        acc.viewed++;
                    }
                    acc.total ++;
                    return acc;
                }, _.clone(stats));

               //compute testParts and test stats
               testPart.stats =_.reduce(testPart.sections, accStats, _.clone(stats));
               testMap.stats =_.reduce(testMap.parts, accStats, _.clone(stats));

               //reassign the map
               self.setTestMap(testMap);
            };

            //install behavior events handlers
            this.on('ready', function(){
                load();
            })
            .on('move', function(direction, scope, position){


                //Try to store the data
                store()
                 .then(function(results){

                    //if we have an item session, then the item is answered
                    if(results && results[1] && results[1].itemSession){
                        updateStats(true);
                    } else {
                        updateStats();
                    }

                    //and then load the next item
                    computeNext('move', {
                        direction : direction,
                        scope     : scope || 'item',
                        position  : position
                    });
                }).catch(function(err){
                    self.trigger('error', err);
                });
            })
            .on('skip', function(scope){
                computeNext('skip', {
                    scope     : scope || 'item'
                });
            })
            .on('timeout', function(){
                var context = self.getTestContext();

                context.isTimeout = true;
                self.disableItem(context.itemUri);

                self.trigger('warning', __('Time limit reached, this part of the test has ended.'));

                // TODO: handle the action after the test taker has validated the message
                computeNext('timeout');
            })
            .on('renderitem', function(itemRef){
                var context = self.getTestContext();
                var states = self.getTestData().itemStates;

                //should we disable the item ?
                if(context.itemSessionState > states.interacting){
                    self.disableItem(context.itemUri);

                    if(context.isTimeout){
                        self.trigger('warning', __('Time limit reached for item "%s".', context.itemIdentifier));
                    }
                    else if(context.remainingAttempts === 0){

                        self.trigger('warning', __('No more attempts allowed for item "%s".', context.itemIdentifier));
                    } else {

                        self.trigger('warning', __('Item "%s" is completed.', context.itemIdentifier));
                    }
                }
            });

            //load data and current context in parrallel at initialization
            return this.getProxy().init()
                       .then(function(results){
                            self.setTestData(results.testData);
                            self.setTestContext(results.testContext);
                            self.setTestMap(results.testMap);
                       });
        },

        /**
         * Rendering phase of the test runner
         *
         * Attach the test runner to the DOM
         *
         * @this {runner} the runner context, not the provider
         */
        render : function render(){

            var config = this.getConfig();
            var broker = this.getAreaBroker();

            config.renderTo.append(broker.getContainer());
        },

        /**
         * LoadItem phase of the test runner
         *
         * We call the proxy in order to get the item data
         *
         * @this {runner} the runner context, not the provider
         * @returns {Promise} that calls in parallel the state and the item data
         */
        loadItem : function loadItem(itemRef){
            var self = this;

            //FIXME check if we can't just return the sub promise instead of wrapping
            return new Promise(function(resolve, reject){

                Promise.all([
                    self.getProxy().getItemData(itemRef),
                    self.getProxy().getItemState(itemRef)
                ])
                .then(function(results){

                    //aggregate the results
                    resolve({
                        content : results[0].itemData,
                        baseUrl : results[0].baseUrl,
                        state : results[1].itemState || {}
                    });
                })
                .catch(reject);
            });
        },

        /**
         * RenderItem phase of the test runner
         *
         * Here we iniitialize the item runner and wrap it's call to the test runner
         *
         * @this {runner} the runner context, not the provider
         * @returns {Promise} resolves when the item is ready
         */
        renderItem : function renderItem(itemRef, itemData){
            var self = this;

            var changeState = function changeState(){
                self.setItemState(itemRef, 'changed', true);
            };

            return new Promise(function(resolve, reject){
                assetManager.setData('baseUrl', itemData.baseUrl);

                self.itemRunner = qtiItemRunner(itemData.content.type, itemData.content.data, {
                    assetManager: assetManager
                })
                .on('error', reject)
                .on('render', function(){

                    this.on('responsechange', changeState);
                    this.on('statechange', changeState);

                    resolve();
                })
                .init()
                .setState(itemData.state)
                .render(self.getAreaBroker().getContentArea());
            });
        },

        /**
         * UnloadItem phase of the test runner
         *
         * Item clean up
         *
         * @this {runner} the runner context, not the provider
         * @returns {Promise} resolves when the item is cleared
         */
        unloadItem : function unloadItem(itemRef){
            var self = this;
            return new Promise(function(resolve, reject){
                if(self.itemRunner){
                    self.itemRunner
                        .on('clear', resolve)
                        .clear();
                    return;
                }
                resolve();
            });
        },

        /**
         * Finish phase of the test runner
         *
         * Calls proxy.finish to close the testj
         *
         * @this {runner} the runner context, not the provider
         * @returns {Promise} proxy.finish
         */
        finish : function finish(){
            return this.getProxy().callTestAction('finish');
        },

        /**
         * Destroy phase of the test runner
         *
         * Clean up
         *
         * @this {runner} the runner context, not the provider
         */
        destroy : function destroy(){
            this.itemRunner = null;
        }
    };

    return qtiProvider;
});
