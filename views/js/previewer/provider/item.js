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
    'taoTests/runner/areaBroker',
    'taoTests/runner/proxy',
    'taoQtiTest/previewer/proxy/item',
    'taoQtiTest/runner/ui/toolbox/toolbox',
    'taoQtiItem/runner/qtiItemRunner',
    'taoQtiTest/runner/config/assetManager',
    'tpl!taoQtiTest/previewer/provider/item'
], function ($,
             _,
             __,
             store,
             Promise,
             areaBrokerFactory,
             proxyFactory,
             proxyProvider,
             toolboxFactory,
             qtiItemRunner,
             assetManagerFactory,
             layoutTpl) {
    'use strict';

    //the asset strategies
    var assetManager = assetManagerFactory();

    var $layout = $(layoutTpl());

    var areaBroker = areaBrokerFactory($layout, {
        content: $('#qti-content', $layout),
        toolbox: $('.tools-box', $layout),
        navigation: $('.navi-box-list', $layout),
        control: $('.top-action-bar .control-box', $layout),
        actionsBar: $('.bottom-action-bar .control-box', $layout),
        panel: $('.test-sidebar-left', $layout),
        header: $('.title-box', $layout)
    });

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
            return areaBroker;
        },

        /**
         * Initialize and load the test runner proxy
         * @returns {proxy}
         */
        loadProxy: function loadProxy() {
            var config = this.getConfig();

            var proxyProvider = config.proxyProvider || 'qtiItemPreviewerProxy';
            var proxyConfig = _.pick(config, [
                'bootstrap'
            ]);

            return proxyFactory(proxyProvider, proxyConfig);
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
            areaBroker.setComponent('toolbox', toolboxFactory());
            areaBroker.getToolbox().init();

            /*
             * Install behavior on events
             */
            this
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

            return this.getProxy().init();
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
            var broker = this.getAreaBroker();

            config.renderTo.append(broker.getContainer());

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
            return this.getProxy().getItem(itemIdentifier)
                .then(function (data) {
                    //aggregate the results
                    return {
                        content: data.itemData,
                        baseUrl: data.baseUrl,
                        state: data.itemState
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

            // prevent the item to be displayed while test runner is destroying
            if (this.itemRunner) {
                this.itemRunner.clear();
            }
            this.itemRunner = null;

            if (areaBroker) {
                areaBroker.getToolbox().destroy();
                areaBroker = null;
            }
        }
    };
});
