
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
    'core/promise',
    'taoTests/runner/areaBroker',
    'taoTests/runner/proxy',
    'taoQtiItem/runner/qtiItemRunner',
    'tpl!taoQtiTest/runner/provider/layout'
], function($, _, Promise, areaBroker, proxyFactory, qtiItemRunner, layoutTpl) {
    'use strict';

    var qtiProvider = {
        name : 'qti',

        loadAreaBroker : function loadAreaBroker(){
            var $layout = $(layoutTpl());
            return areaBroker($layout, {
                'content' : $('#qti-content', $layout),
                'toolbox' : $('.tools-box', $layout),
                'navigation' : $('.navi-box-list', $layout),
                'control' : $('.top-action-bar .control-box', $layout),
                'panel' : $('.test-sidebar', $layout),
                'header' : $('.title-box', $layout)
            });
        },

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

        init : function init(){
            var self = this;

            //install behavior events handlers
            this.on('ready', function(){
                var context = this.getTestContext();
                self.loadItem(context.itemUri);
            })
            .on('next', function(){
                var context = this.getTestContext();

                debugger;
                self.unloadItem();

                self.getProxy()
                    .callItemAction(context.itemUri, 'next')
                    .then(function(results){
                        console.log(results);
                        self.setTestData(results.testData);
                        self.setTestContext(results.testContext);

                        self.loadItem(results.testContext.itemUri);
                    })
                    .catch(function(err){
                        self.trigger('error', err);
                    });

            })
            .on('skip', function(){

            })
            .on('finish', function(){

            });

            //load data and current context in parrallel at initialization
            return this.getProxy().init()
                       .then(function(results){
                            self.setTestData(results.testData);
                            self.setTestContext(results.testContext);
                       });
        },

        render : function render(){

            var config = this.getConfig();
            var broker = this.getAreaBroker();

            config.renderTo.append(broker.getContainer());
        },

        loadItem : function loadItem(itemRef){
            var self = this;
            return new Promise(function(resolve, reject){

                Promise.all([
                    self.getProxy().getItemData(itemRef),
                    self.getProxy().getItemState(itemRef)
                ])
                .then(function(results){
                    resolve({
                        data : results[0],
                        state : results[1]
                    });
                })
                .catch(reject);
            });
        },

        renderItem : function renderItem(item){
            var self = this;

            return new Promise(function(resolve, reject){
                self.itemRunner = qtiItemRunner(item.data.type, item.data.data)
                    .on('error', reject)
                    .on('render', resolve)
                    .on('statechange', function(state){
                        console.log(state);
                    })
                    .on('responsechange', function(responses){
                        console.log(responses);
                    })
                    .init()
                    .setState(item.state)
                    .render(self.getAreaBroker().getContentArea());
            });
        },

        unloadItem : function unloadItem(itemRef){
            var self = this;
            return new Promise(function(resolve, reject){
                if(self.itemRunner){
                    self.itemRunner
                        .on('clear', resolve)
                        .clear();
                }
            });
        },

        finish : function finish(){

        },

        destroy : function destroy(){
            this.itemRunner = null;
        }

    };

    return qtiProvider;
});
