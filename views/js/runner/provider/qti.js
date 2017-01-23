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
    'core/store',
    'core/promise',
    'core/cachedStore',
    'taoTests/runner/areaBroker',
    'taoTests/runner/proxy',
    'taoTests/runner/probeOverseer',
    'taoQtiTest/runner/helpers/map',
    'taoQtiItem/runner/qtiItemRunner',
    'taoItems/assets/manager',
    'taoItems/assets/strategies',
    'taoQtiItem/portableElementRegistry/assetManager/portableAssetStrategy',
    'tpl!taoQtiTest/runner/provider/layout'
], function(
    $,
    _,
    __,
    store,
    Promise,
    cachedStore,
    areaBroker,
    proxyFactory,
    probeOverseerFactory,
    mapHelper,
    qtiItemRunner,
    assetManagerFactory,
    assetStrategies,
    assetPortableElement,
    layoutTpl) {
    'use strict';

    //the asset strategies
    var assetManager = assetManagerFactory([
        assetStrategies.external,
        assetStrategies.base64,
        assetStrategies.baseUrl,
        assetPortableElement
    ], { baseUrl: '' });

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
            return areaBroker($layout, {
                content:    $('#qti-content', $layout),
                toolbox:    $('.tools-box-list', $layout),
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

            var proxyConfig = _.pick(config, [
                'testDefinition',
                'testCompilation',
                'serviceCallId',
                'bootstrap'
            ]);

            return proxyFactory('qtiServiceProxy', proxyConfig);
        },

        /**
         * Initialize and load the probe overseer
         * @returns {probeOverseer}
         */
        loadProbeOverseer : function loadProbeOverseer(){
            var config = this.getConfig();

            //the test run needs to be identified uniquely
            var identifier = config.serviceCallId || 'test-' + Date.now();
            return probeOverseerFactory(identifier, this);
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
             * @param {Object} [params] - the item action additional params
             */
            function computeNext(action, params){

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
                        });
                });

                self.unloadItem(context.itemUri);
            }

            /**
             * Load the next action: load the current item or call finish based the test state
             */
            function load(){

                var context = self.getTestContext();
                var states = self.getTestData().states;
                if(context.state <= states.interacting){
                    self.loadItem(context.itemUri);
                } else if (context.state === states.closed){
                    self.finish();
                }
            }

            /**
             * Store the item state and responses, if needed
             * @param {Boolean} [force=false] - Forces the submit even if responses are empty
             * @returns {Promise} - resolve with a boolean at true if the response is submitted
             */
            function submit(force){

                var context = self.getTestContext();
                var states = self.getTestData().itemStates;
                var itemRunner = self.itemRunner;
                var params = {
                    emptyAllowed: context.isTimeout || !!force
                };

                var performSubmit = function performSubmit(){
                    //we submit the responses
                    var submitItem = self.getProxy().submitItem(context.itemUri, itemRunner.getState(), itemRunner.getResponses(), params)
                        .then(function(result){
                            return new Promise(function(resolve, reject){

                                if (result.notAllowed) {
                                    // the context might be updated
                                    if (result.testContext) {
                                        self.setTestContext(result.testContext);
                                        context = self.getTestContext();
                                    }

                                    if (result.message) {
                                        self.trigger('alert.notallowed',
                                            result.message,
                                            function() {
                                                self.trigger('resumeitem');
                                            }
                                        );
                                    }

                                    return reject(true);
                                }

                                if (result.itemSession) {
                                    context.itemAnswered = result.itemSession.itemAnswered;
                                }

                                if(result.displayFeedbacks === true && result.feedbacks && result.itemSession){

                                    itemRunner.renderFeedbacks(result.feedbacks, result.itemSession, function(queue){
                                        self.trigger('modalFeedbacks', queue, resolve);
                                    });

                                } else {
                                    return resolve();
                                }
                            });
                        });

                    submitItem.catch(function() {
                        self.trigger('alert.submitError',
                            __('An error occurred during results submission. Please retry.'),
                            function () {
                                self.trigger('resumeitem');
                            }
                        );
                    });

                    return submitItem;
                };

                if(context.itemSessionState >= states.closed) {
                    return Promise.resolve(false);
                }

                return performSubmit();
            }

            /**
             * Update the stats on the TestMap
             */
            function updateStats(){

                var context = self.getTestContext();
                var testMap = self.getTestMap();
                var states = self.getTestData().states;
                var item = mapHelper.getItemAt(testMap, context.itemPosition);

                if(context.state !== states.interacting){
                    return;
                }

                //flag as viewed, always
                item.viewed = true;

                //flag as answered only if a response has been set
                if ("undefined" !== typeof context.itemAnswered) {
                    item.answered = context.itemAnswered;
                }

                //update the map stats, then reassign the map
                self.setTestMap(mapHelper.updateItemStats(testMap, context.itemPosition));
            }

            /**
             * Check whether test taker leaving section
             *
             * @param {string} direction
             * @param {string} scope
             * @param {integer} position
             * @todo this kind of function is generic enough to be moved to a util/helper
             * @returns {boolean}
             */
            function leaveSection(direction, scope, position)
            {
                var context = self.getTestContext();
                var map     = self.getTestMap();
                var section = mapHelper.getSection(map, context.sectionId);
                var sectionStats = mapHelper.getSectionStats(map, context.sectionId);
                var nbItems = sectionStats && sectionStats.total;
                var item = mapHelper.getItem(map, context.itemIdentifier);

                return (direction === 'next' && (scope === 'section' || item.positionInSection + 1 === nbItems)) ||
                    (direction === 'previous' && item.positionInSection === 0) ||
                    (direction === 'jump' && position > 0 && (position < section.position || position >= section.position + nbItems));
            }

            /*
             * Install behavior on events
             */
            this
                .on('ready', function(){
                    //load the 1st item
                    load();
                })
                .on('move', function(direction, scope, position){

                    //ask to move:
                    // 1. try to submit state and responses
                    // 2. update stats on the map
                    // 3. compute the next item to load

                    var computeNextMove = _.partial(computeNext, 'move', {
                        direction : direction,
                        scope     : scope || 'item',
                        ref       : position
                    });

                    this.trigger('disablenav disabletools');

                    // submit the response, but can break if empty
                    submit()
                        .then(updateStats)
                        .then(computeNextMove)
                        .catch(function (err) {
                            // do no trigger error if the promise is rejected for an architectural purpose
                            if (err !== true) {
                                self.trigger('error', err);
                            }
                        });

                })
                .after('move', function (direction, scope, position) {
                    if (leaveSection(direction, scope, position)) {
                        self.trigger('endsession');
                    }
                })
                .on('skip', function(scope){

                    this.trigger('disablenav disabletools');

                    computeNext('skip', {
                        scope     : scope || 'item'
                    });

                })
                .on('exit', function(why){
                    var context = self.getTestContext();
                    self.disableItem(context.itemUri);

                    // submit the response even if empty
                    submit(true)
                        .then(function() {
                            return self.getProxy()
                                .callTestAction('exitTest', {reason: why})
                                .then(function(){
                                    return self.finish();
                                });
                        })
                        .catch(function(err){
                            self.trigger('error', err);
                        });
                })
                .on('timeout', function(scope, ref){

                    var context = self.getTestContext();

                    context.isTimeout = true;

                    self.disableItem(context.itemUri);

                    // submit the response even if empty
                    submit(true)
                        .then(updateStats)
                        .then(function() {
                            self.trigger('alert.timeout', __('Time limit reached, this part of the test has ended.'), function() {
                                computeNext('timeout', {
                                    scope: scope,
                                    ref: ref
                                });
                            });
                        })
                        .catch(function(err){
                            self.trigger('error', err);
                        });
                })
                .after('timeout', function (scope, ref) {
                    if (scope === 'assessmentSection' || scope === 'testPart') {
                        self.trigger('endsession');
                    }
                })
                .on('pause', function(data){
                    var pause;

                    if (!self.getState('disconnected')) {
                    // will notify the server that the test was auto paused
                        pause = self.getProxy().callTestAction('pause');
                    } else {
                        pause = Promise.resolve();
                    }

                    pause
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
                .on('renderitem', function(){

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

                    this.trigger('enablenav enabletools');


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
                        self.disableItem(context.itemUri);
                        self.trigger('warning', warning);
                    }
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
            return store.getIdentifier().then(function(storeId){

                //load data and current context in parallel at initialization
                return self.getProxy().init({
                    storeId : storeId
                }).then(function(results){
                    self.setTestData(results.testData);
                    self.setTestContext(results.testContext);
                    self.setTestMap(results.testMap);

                    //check if we need to trigger a storeChange
                    if(!_.isEmpty(storeId) && !_.isEmpty(results.lastStoreId) && results.lastStoreId !== storeId){

                        /**
                         * We are changed the local storage engine (could be a browser change)
                         * @event runner/provider/qti#storechange
                         */
                        self.trigger('storechange');
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

            return self.getProxy().getItem(itemRef)
                .then(function(data){
                    //aggregate the results
                    return {
                        content : data.itemData,
                        baseUrl : data.baseUrl,
                        state : data.itemState,
                        rubrics : data.rubrics
                    };
                });
        },

        /**
         * RenderItem phase of the test runner
         *
         * Here we initialize the item runner and wrap it's call to the test runner
         *
         * @this {runner} the runner context, not the provider
         * @returns {Promise} resolves when the item is ready
         */
        renderItem : function renderItem(itemRef, itemData){
            var self = this;

            var changeState = function changeState(){
                self.setItemState(itemRef, 'changed', true);
            };

            if (itemData.rubrics) {
                this.trigger('loadrubricblock', itemData.rubrics);
            }

            return new Promise(function(resolve, reject){
                assetManager.setData('baseUrl', itemData.baseUrl);

                self.itemRunner = qtiItemRunner(itemData.content.type, itemData.content.data, {
                    assetManager: assetManager
                })
                    .on('error', function(err){
                        self.trigger('enablenav');
                        reject(err);
                    })
                    .on('init', function(){
                        if(itemData.state){
                            this.setState(itemData.state);
                        }
                        this.render(self.getAreaBroker().getContentArea());
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
            var self = this;

            if (!this.getState('finish')) {
                this.trigger('disablenav disabletools');

                // will be executed after the runner has been flushed
                // use the "before" queue to ensure the query will be fully processed before destroying
                // we do not use the "destroy" event because the proxy is destroyed before this event is triggered
                this.before('flush', function() {
                    var finishPromise = this.getProxy()
                        .callTestAction('finish')
                        .then(function() {
                            if (self.stateStorage) {
                                return self.stateStorage.removeStore();
                            }
                        });

                    finishPromise.catch(function(err) {
                        self.trigger('error', err);
                    });

                    return finishPromise;
                });
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
            // prevent the item to be displayed while test runner is destroying
            if (this.itemRunner) {
                this.itemRunner.clear();
            }
            this.itemRunner = null;
        }
    };

    return qtiProvider;
});
