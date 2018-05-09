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
 * Test runner provider for the QTI item previewer
 *
 * @author Jean-Sébastien Conan <jean-sebastien@taotesting.com>
 */
define([
    'jquery',
    'lodash',
    'i18n',
    'core/store',
    'core/promise',
    'core/cachedStore',
    'taoTests/runner/areaBroker',
    'taoTests/runner/testStore',
    'taoTests/runner/proxy',
    'taoQtiTest/previewer/proxy/item',
    'taoQtiTest/runner/ui/toolbox/toolbox',
    'taoQtiItem/runner/qtiItemRunner',
    'taoQtiTest/runner/config/assetManager',
    'tpl!taoQtiTest/previewer/provider/item'
], function (
    $,
    _,
    __,
    store,
    Promise,
    cachedStore,
    areaBrokerFactory,
    testStoreFactory,
    proxyFactory,
    proxyProvider,
    toolboxFactory,
    qtiItemRunner,
    assetManagerFactory,
    layoutTpl
) {
    'use strict';

    //the asset strategies
    var assetManager = assetManagerFactory();

    proxyFactory.registerProvider('qtiItemPreviewerProxy', proxyProvider);

    /**
     * A Test runner provider to be registered against the runner
     */
    return {

        //provider name
        name: 'qtiItemPreviewer',

        /**
         * Initialize and load the area broker with a correct mapping
         * @returns {areaBroker}
         */
        loadAreaBroker: function loadAreaBroker() {
            var $layout = $(layoutTpl());

            return areaBrokerFactory($layout, {
                content: $('#qti-content', $layout),
                toolbox: $('.tools-box', $layout),
                navigation: $('.navi-box-list', $layout),
                control: $('.top-action-bar .control-box', $layout),
                actionsBar: $('.bottom-action-bar .control-box', $layout),
                panel: $('.test-sidebar-left', $layout),
                header: $('.title-box', $layout)
            });
        },

        /**
         * Initialize and load the test runner proxy
         * @returns {proxy}
         */
        loadProxy: function loadProxy() {
            var config = this.getConfig();
            var proxyConfig = _.pick(config, [
                'serviceCallId',
                'bootstrap',
                'timeout'
            ]);

            return proxyFactory(config.proxyProvider || 'qtiItemPreviewerProxy', proxyConfig);
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
         * Initialization of the provider, called during test runner init phase.
         *
         * We install behaviors during this phase (ie. even handlers)
         * and we call proxy.init.
         *
         * @this {runner} the runner context, not the provider
         * @returns {Promise} to chain proxy.init
         */
        init: function init() {
            var self = this;
            var dataHolder = this.getDataHolder();
            var areaBroker = this.getAreaBroker();

            areaBroker.setComponent('toolbox', toolboxFactory());
            areaBroker.getToolbox().init();

            /*
             * Install behavior on events
             */
            this
                .on('submititem', function () {
                    var itemRunner = this.itemRunner;
                    this.trigger('disabletools enablenav');
                    return this.getProxy()
                        .submitItem(dataHolder.get('itemIdentifier'), itemRunner.getState(), itemRunner.getResponses())
                        .then(function submitSuccess(response) {
                            self.trigger('responseitem', response);
                            self.trigger('resumeitem');
                        })
                        .catch(function submitError(err) {
                            //some server errors are valid, so we don't fail (prevent empty responses)
                            if (err.code === 200) {
                                self.trigger('alert.submitError',
                                    err.message || __('An error occurred during results submission. Please retry.'),
                                    function () {
                                        self.trigger('resumeitem');
                                    }
                                );
                            }
                        });
                })
                .on('ready', function () {
                    var itemIdentifier = dataHolder.get('itemIdentifier');
                    var itemData = dataHolder.get('itemData');

                    if (itemIdentifier) {
                        if (itemData) {
                            self.renderItem(itemIdentifier, itemData);
                        } else {
                            self.loadItem(itemIdentifier);
                        }
                    }
                })
                .on('loaditem', function (itemRef, itemData) {
                    dataHolder.set('itemIdentifier', itemRef);
                    dataHolder.set('itemData', itemData);
                })
                .on('renderitem', function () {
                    this.trigger('enabletools enablenav');
                })
                .on('resumeitem', function () {
                    this.trigger('enableitem enablenav');
                })
                .on('disableitem', function () {
                    this.trigger('disabletools');
                })
                .on('enableitem', function () {
                    this.trigger('enabletools');
                })
                .on('error', function () {
                    this.trigger('disabletools enablenav');
                })
                .on('finish leave', function () {
                    this.trigger('disablenav disabletools');
                    this.trigger('endsession');
                    this.flush();
                })
                .on('flush', function () {
                    this.destroy();
                });

            return this.getProxy().init().then(function (data) {
                dataHolder.set('itemIdentifier', data.itemIdentifier);
                dataHolder.set('itemData', data.itemData);
            });
        },

        /**
         * Rendering phase of the test runner
         *
         * Attach the test runner to the DOM
         *
         * @this {runner} the runner context, not the provider
         */
        render: function render() {

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
        loadItem: function loadItem(itemIdentifier) {
            return this.getProxy().getItem(itemIdentifier);
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
        renderItem: function renderItem(itemIdentifier, itemData) {
            var self = this;

            var changeState = function changeState() {
                self.setItemState(itemIdentifier, 'changed', true);
            };

            return new Promise(function (resolve, reject) {
                assetManager.setData('baseUrl', itemData.baseUrl);

                itemData.content = itemData.content || {};

                self.itemRunner = qtiItemRunner(itemData.content.type, itemData.content.data, {
                    assetManager: assetManager
                })
                    .on('error', function (err) {
                        self.trigger('enablenav');
                        reject(err);
                    })
                    .on('init', function () {
                        var options = {};
                        if (itemData.state) {
                            this.setState(itemData.state);
                            options.state = itemData.state;//official ims portable element requires state information during rendering
                        }
                        this.render(self.getAreaBroker().getContentArea(), options);
                    })
                    .on('render', function () {

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
        unloadItem: function unloadItem() {
            var self = this;

            self.trigger('beforeunloaditem disablenav disabletools');

            return new Promise(function (resolve) {
                if (self.itemRunner) {
                    self.itemRunner
                        .on('clear', resolve)
                        .clear();
                    return;
                }
                resolve();
            });
        },

        /**
         * Destroy phase of the test runner
         *
         * Clean up
         *
         * @this {runner} the runner context, not the provider
         */
        destroy: function destroy() {
            var areaBroker = this.getAreaBroker();

            // prevent the item to be displayed while test runner is destroying
            if (this.itemRunner) {
                this.itemRunner.clear();
            }
            this.itemRunner = null;

            if (areaBroker) {
                areaBroker.getToolbox().destroy();
            }
        }
    };
});
