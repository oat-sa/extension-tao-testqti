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
    'core/cachedStore',
    'taoTests/runner/areaBroker',
    'taoTests/runner/proxy',
    'taoTests/runner/probeOverseer',
    'taoTests/runner/testStore',
    'taoQtiTest/runner/provider/dataUpdater',
    'taoQtiTest/runner/provider/toolStateBridge',
    'taoQtiTest/runner/helpers/currentItem',
    'taoQtiTest/runner/helpers/map',
    'taoQtiTest/runner/helpers/navigation',
    'taoQtiTest/runner/ui/toolbox/toolbox',
    'taoQtiItem/runner/qtiItemRunner',
    'taoQtiTest/runner/config/assetManager',
    'tpl!taoQtiTest/runner/provider/layout'
], function(
    $,
    _,
    __,
    Promise,
    cachedStore,
    areaBrokerFactory,
    proxyFactory,
    probeOverseerFactory,
    testStoreFactory,
    dataUpdater,
    toolStateBridgeFactory,
    currentItemHelper,
    mapHelper,
    navigationHelper,
    toolboxFactory,
    qtiItemRunner,
    getAssetManager,
    layoutTpl) {
    'use strict';

    /**
     * A Test runner provider to be registered against the runner
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

            return areaBrokerFactory($layout, {
                content:    $('#qti-content', $layout),
                toolbox:    $('.tools-box', $layout),
                navigation: $('.navi-box-list', $layout),
                control:    $('.top-action-bar .control-box', $layout),
                actionsBar: $('.bottom-action-bar .control-box', $layout),
                panel:      $('.test-sidebar-left', $layout),
                header:     $('.title-box', $layout)
            });
        },

        /**
         * Initialize and load the test runner proxy
         * @returns {proxy}
         */
        loadProxy : function loadProxy(){
            var config = this.getConfig();

            var proxyProvider   = config.proxyProvider || 'qtiServiceProxy';
            var proxyConfig = _.pick(config, [
                'testDefinition',
                'testCompilation',
                'serviceCallId',
                'bootstrap'
            ]);

            return proxyFactory(proxyProvider, proxyConfig);
        },

        /**
         * Initialize and load the probe overseer
         * @returns {probeOverseer}
         */
        loadProbeOverseer : function loadProbeOverseer(){

            //the test run needs to be identified uniquely
            return probeOverseerFactory(this);
        },

        /**
         * Initialize and load the test store
         * @returns {testStore}
         */
        loadTestStore : function loadTestStore(){
            var config = this.getConfig();

            //the test run needs to be identified uniquely
            var identifier = config.serviceCallId || 'test-' + Date.now();
            return testStoreFactory(identifier);
        },


        /**
         * Loads the persistent states storage
         *
         * @returns {Promise}
         */
        loadPersistentStates : function loadPersistentStates() {
            var self = this;
            var config = this.getConfig();
            var persistencePromise = cachedStore('test-states-' + config.serviceCallId, 'states');

            persistencePromise.catch(function(err) {
                self.trigger('error', err);
            });

            return persistencePromise
                .then(function(storage) {
                    self.stateStorage = storage;
                });
        },

        /**
         * Checks a runner persistent state
         *
         * @param {String} name - the state name
         * @returns {Boolean} if active, false if not set
         */
        getPersistentState : function getPersistentState(name) {
            if (this.stateStorage) {
                return this.stateStorage.getItem(name);
            }
        },

        /**
         * Defines a runner persistent state
         *
         * @param {String} name - the state name
         * @param {Boolean} active - is the state active
         * @returns {Promise} Returns a promise that:
         *                      - will be resolved once the state is fully stored
         *                      - will be rejected if any error occurs or if the state name is not a valid string
         */
        setPersistentState : function setPersistentState(name, active) {
            var self = this;
            var setPromise;

            if (this.stateStorage) {
                setPromise = this.stateStorage.setItem(name, active);

                setPromise.catch(function(err) {
                    self.trigger('error', err);
                });

                return setPromise;
            }
        },

        /**
         * Install step : install new methods/behavior
         *
         * @this {runner} the runner context, not the provider
         * @returns {Promise} to chain
         */
        install : function install(){

            /**
             * Delegates the udpate of testMap, testContext and testData
             * to a 3rd part component, the dataUpdater.
             */
            this.dataUpdater = dataUpdater(this.getDataHolder());

            this.toolStateBridge = toolStateBridgeFactory(this.getTestStore(), _.keys(this.getPlugins()));
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
            var areaBroker = this.getAreaBroker();

            /**
             * Retrieve the item results
             * @returns {Object} the results
             */
            function getItemResults() {
                var results = {};
                var context = self.getTestContext();
                var states = self.getTestData().states;
                if(context && self.itemRunner && context.itemSessionState <= states.interacting){
                    results = {
                        itemResponse   : self.itemRunner.getResponses(),
                        itemState      : self.itemRunner.getState()
                    };
                }
                return results;
            }

            /**
             * Compute the next item for the given action
             * @param {String} action - item action like move/next, skip, etc.
             * @param {Object} [params] - the item action additional params
             * @param {Promise} [loadPromise] - wait this Promise to resolve before loading the item.
             */
            function computeNext(action, params, loadPromise){

                var context = self.getTestContext();

                //catch server errors
                var submitError = function submitError(err){
                    //some server errors are valid, so we don't fail (prevent empty responses)
                    if(err.code === 200){
                        self.trigger('alert.submitError',
                            err.message || __('An error occurred during results submission. Please retry.'),
                            load
                        );
                    } else {
                        self.trigger('error', err);
                    }
                };

                //if we have to display modal feedbacks, we submit the responses before the move
                var feedbackPromise = new Promise( function(resolve){
                    if(context.hasFeedbacks){
                        params = _.omit(params, ['itemState', 'itemResponse']);

                        self.getProxy()
                            .submitItem(context.itemIdentifier, self.itemRunner.getState(), self.itemRunner.getResponses(), params)
                            .then(function(results){
                                if (results.itemSession) {
                                    context.itemAnswered = results.itemSession.itemAnswered;

                                    if(results.displayFeedbacks === true && results.feedbacks) {
                                        self.itemRunner.renderFeedbacks(results.feedbacks, results.itemSession, function(queue){
                                            self.trigger('modalFeedbacks', queue, resolve);
                                        });
                                        return;
                                    }
                                }
                                return resolve();
                            })
                            .catch(submitError);
                    } else {
                        if (action === 'skip') {
                            context.itemAnswered = false;
                        } else {
                            // when the test part is linear, the item is always answered as we cannot come back to it
                            context.itemAnswered = currentItemHelper.isAnswered(self) || context.isLinear;
                        }
                        self.setTestContext(context);
                        resolve();
                    }
                });

                feedbackPromise.then(function(){
                    return self.toolStateBridge.getStates();
                })
                .then(function(toolStates){

                    if(toolStates && _.size(toolStates) > 0){
                        params.toolStates = toolStates;
                    }

                    // ensure the answered state of the current item is correctly set and the stats are aligned
                    self.setTestMap(self.dataUpdater.updateStats());
                    //to be sure load start after unload...
                    //we add an intermediate ns event on unload
                    self.on('unloaditem.' + action, function(){
                        self.off('.'+action);

                        self.getProxy()
                            .callItemAction(context.itemIdentifier, action, params)
                            .then(function(results){
                                loadPromise = loadPromise || Promise.resolve();

                                return loadPromise.then(function(){
                                    return results;
                                });
                            })
                            .then(function(results){

                                //update testData, testContext and build testMap
                                self.dataUpdater.update(results);

                                load();
                            })
                            .catch(submitError);
                    });

                    self.unloadItem(context.itemIdentifier);
                })
                .catch(submitError);
            }

            /**
             * Load the next action: load the current item or call finish based the test state
             */
            function load(){
                var context = self.getTestContext();
                var states = self.getTestData().states;
                if(context.state <= states.interacting){
                    self.loadItem(context.itemIdentifier);
                } else if (context.state === states.closed){
                    self.finish();
                }
            }

            areaBroker.setComponent('toolbox', toolboxFactory());
            areaBroker.getToolbox().init();

            /*
             * Install behavior on events
             */
            this
                .on('ready', function(){
                    //load the 1st item
                    load();
                })
                .on('move', function(direction, scope, position){

                    // get the item results/state before disabling the tools
                    // otherwise the state could be partially lost for tools that clean up when disabling
                    var itemResults = getItemResults();

                    this.trigger('disablenav disabletools');

                    computeNext('move', _.merge(itemResults, {
                        direction : direction,
                        scope     : scope || 'item',
                        ref       : position
                    }));
                })
                .on('skip', function(scope){

                    this.trigger('disablenav disabletools');

                    computeNext('skip', {
                        scope     : scope || 'item'
                    });
                })
                .on('exit', function(reason){
                    var context = self.getTestContext();

                    this.disableItem(context.itemIdentifier);

                    this.getProxy()
                        .callTestAction('exitTest', _.merge(getItemResults(), {
                            itemDefinition : context.itemIdentifier,
                            reason: reason
                        }))
                        .then(function(){
                            return self.finish();
                        })
                        .catch(function(err){
                            self.trigger('error', err);
                        });
                })
                .on('timeout', function(scope, ref, timer){

                    var context = self.getTestContext();

                    context.isTimeout = true;

                    this.setTestContext(context);

                    if (timer && timer.allowLateSubmission) {
                        self.trigger('alert.timeout', __('Time limit reached, this part of the test has ended. However you are allowed to finish the current item.'));
                        self.before('move.latetimeout', function() {
                            self.off('move.latetimeout');
                            computeNext(
                                'timeout',
                                _.merge(getItemResults(), {
                                    scope: scope,
                                    ref: ref,
                                    late: true
                                })
                            );
                            return Promise.reject({cancel: true});
                        });
                    } else {
                        this.disableItem(context.itemIdentifier);

                        computeNext(
                            'timeout',
                            _.merge(getItemResults(), {
                                scope: scope,
                                ref: ref
                            }),
                            new Promise(function (resolve) {
                                if (context.options
                                    && context.options.hasOwnProperty('noAlertTimeout')
                                    && context.options.noAlertTimeout
                                ) {
                                    resolve();
                                } else {
                                    self.trigger('alert.timeout', __('Time limit reached, this part of the test has ended.'), resolve);
                                }
                            })
                        );
                    }
                })
                .on('pause', function(data){

                    this.setState('closedOrSuspended', true);

                    this.getProxy().callTestAction('pause', {
                        reason: {
                            reasons: data && data.reasons,
                            comment : data && data.message
                        }
                    })
                    .then(function() {
                        self.trigger('leave', {
                            code: self.getTestData().states.suspended,
                            message: data && data.message
                        });
                    })
                    .catch(function(err){
                        self.trigger('error', err);
                    });
                })
                .on('loaditem', function(){
                    var context = this.getTestContext();
                    var states = this.getTestData().itemStates;
                    var warning = false;

                    /**
                     * Get the label of the current item
                     * @returns {String} the label (fallback to the item identifier);
                     */
                    var getItemLabel = function getItemLabel(){
                        var item = mapHelper.getItem(self.getTestMap(), context.itemIdentifier);
                        return item && item.label ? item.label : context.itemIdentifier;
                    };

                    //The item is rendered but in a state that prevents us from interacting
                    if (context.isTimeout) {
                        warning = __('Time limit reached for item "%s".', getItemLabel());

                    } else if (context.itemSessionState > states.interacting) {

                        if (context.remainingAttempts === 0) {
                            warning = __('No more attempts allowed for item "%s".',  getItemLabel());
                        } else {
                            warning = __('Item "%s" is completed.', getItemLabel());
                        }
                    }

                    //we disable the item and warn the user
                    if (warning) {
                        self.disableItem(context.itemIdentifier);
                        self.trigger('warning', warning);
                    }

                })
                .on('renderitem', function(){
                    var context = this.getTestContext();

                    if(!this.getItemState(context.itemIdentifier, 'disabled')){
                        this.trigger('enabletools');
                    }
                    this.trigger('enablenav');
                })
                .on('resumeitem', function(){
                    this.trigger('enableitem enablenav');
                })
                .on('disableitem', function(){
                    this.trigger('disabletools');
                })
                .on('enableitem', function(){
                    this.trigger('enabletools');
                })
                .on('error', function(){
                    this.trigger('disabletools enablenav');
                })
                .on('finish', function () {
                    this.flush();
                })
                .on('leave', function () {
                    this.trigger('endsession');
                    this.flush();
                })
                .on('flush', function () {
                    this.destroy();
                });

            //starts the event collection
            if(this.getProbeOverseer()){
                this.getProbeOverseer().start();
            }

            //get the current store identifier to send it along with the init call
            return this.getTestStore().getStorageIdentifier().then(function(storeId){

                //load data and current context in parallel at initialization
                return self.getProxy()
                    .init({
                        storeId : storeId
                    })
                    .then(function(response){

                        //fill the dataHolder, build the jump table, etc.
                        self.dataUpdater.update(response);

                        //set the plugin config from the test data
                        self.dataUpdater.updatePluginsConfig(self.getPlugins());

                        //this checks the received storeId and clear the volatiles stores
                        return self.getTestStore()
                                .clearVolatileIfStoreChange(response.lastStoreId)
                                .then(function(){
                                    return response;
                                });

                    })
                    .then(function(response){
                        var isNewStore = !response.lastStoreId || response.lastStoreId !== storeId;
                        if( response.toolStates && isNewStore ){
                            return self.toolStateBridge
                                .setTools(_.keys(response.toolStates))
                                .restoreStates(response.toolStates);
                        }
                    });
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
            var areaBroker = this.getAreaBroker();

            config.renderTo.append(areaBroker.getContainer());

            areaBroker.getToolbox().render(areaBroker.getToolboxArea());
        },

        /**
         * LoadItem phase of the test runner
         *
         * We call the proxy in order to get the item data
         *
         * @this {runner} the runner context, not the provider
         * @param {String} itemIdentifier - The identifier of the item to update
         * @returns {Promise} that calls in parallel the state and the item data
         */
        loadItem : function loadItem(itemIdentifier){
            return this.getProxy().getItem(itemIdentifier)
                .then(function(data){
                    //aggregate the results
                    return {
                        content : data.itemData,
                        baseUrl : data.baseUrl,
                        state : data.itemState,
                        portableElements : data.portableElements
                    };
                });
        },

        /**
         * RenderItem phase of the test runner
         *
         * Here we initialize the item runner and wrap it's call to the test runner
         *
         * @this {runner} the runner context, not the provider
         * @param {String} itemIdentifier - The identifier of the item to update
         * @param {Object} itemData - The definition data of the item
         * @returns {Promise} resolves when the item is ready
         */
        renderItem : function renderItem(itemIdentifier, itemData){
            var self = this;

            var config = this.getConfig();

            var assetManager = getAssetManager(config.serviceCallId);

            var changeState = function changeState(){
                self.setItemState(itemIdentifier, 'changed', true);
            };

            return new Promise(function(resolve, reject){
                assetManager.setData('baseUrl', itemData.baseUrl);
                assetManager.setData('itemIdentifier', itemIdentifier);
                assetManager.setData('assets', itemData.content.assets);

                itemData.content = itemData.content || {};

                self.itemRunner = qtiItemRunner(itemData.content.type, itemData.content.data, {
                    assetManager: assetManager
                })
                    .on('error', function(err){
                        self.trigger('enablenav');
                        reject(err);
                    })
                    .on('init', function(){
                        var itemContainer        = self.getAreaBroker().getContentArea();
                        var itemRenderingOptions = _.pick(itemData, ['state', 'portableElements']);

                        this.render(itemContainer, itemRenderingOptions);
                    })
                    .on('render', function(){

                        this.on('responsechange', changeState);
                        this.on('statechange', changeState);

                        resolve();
                    })
                    .init();
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
        unloadItem : function unloadItem(){
            var self = this;

            self.trigger('beforeunloaditem disablenav disabletools');

            return new Promise(function(resolve){
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
         * Calls proxy.finish to close the test
         *
         * @this {runner} the runner context, not the provider
         * @returns {Promise} proxy.finish
         */
        finish : function finish(){
            if (!this.getState('finish')) {
                this.trigger('disablenav disabletools');

                if (this.stateStorage) {
                    return this.stateStorage.removeStore();
                }
            }
        },

        /**
         * Flushes the test variables before leaving the runner
         *
         * Clean up
         *
         * @this {runner} the runner context, not the provider
         */
        flush : function flush(){
            var self = this;
            var probeOverseer = this.getProbeOverseer();
            var proxy = this.getProxy();
            var flushPromise;

            //if there is trace data collected by the probes
            if(probeOverseer && !this.getState('disconnected')){
                flushPromise = probeOverseer.flush()
                    .then(function(data){
                        var traceData = {};

                        //we reformat the time set into a trace variables
                        if(data && data.length){
                            _.forEach(data, function(entry){
                                var id = entry.type + '-' + entry.id;

                                if(entry.marker){
                                    id = entry.marker + '-' + id;
                                }
                                traceData[id] = entry;
                            });
                            //and send them
                            return self.getProxy().sendVariables(traceData);
                        }
                    })
                    .then(function(){
                        probeOverseer.stop();
                    });
            } else {
                flushPromise = Promise.resolve();
            }

            return flushPromise.then(function () {
                // safely stop the communicator to prevent inconsistent communication while leaving
                if (proxy.hasCommunicator()) {
                    proxy.getCommunicator()
                        .then(function (communicator) {
                            return communicator.close();
                        })
                        // Silently catch the potential errors to avoid polluting the console.
                        // The code above is present to close an already open communicator in order to avoid later
                        // communication while the test is destroying. So if any error occurs here it is not very important,
                        // the most time it will be a missing communicator error, due to disabled config.
                        .catch(_.noop);
                }
            });
        },

        /**
         * Destroy phase of the test runner
         *
         * Clean up
         *
         * @this {runner} the runner context, not the provider
         */
        destroy : function destroy(){
            var areaBroker = this.getAreaBroker();

            // prevent the item to be displayed while test runner is destroying
            if (this.itemRunner) {
                this.itemRunner.clear();
            }
            this.itemRunner = null;

            if(areaBroker){
                areaBroker.getToolbox().destroy();
            }

            //we remove the store(s) only if the finish step was reached
            if(this.getState('finish')){
                return this.getTestStore().remove();
            }
        }
    };

    return qtiProvider;
});
