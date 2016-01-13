
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
                'content' : $('.qti-content', $layout),
                'toolbox' : $('.tools-box', $layout),
                'navigation' : $('.navi-box-list', $layout),
                'control' : $('.control-box', $layout),
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
                this.next();    //load 1st item
            })
            .on('move', function(){

                this.getProxy().getTestContext().then(function(context){
                    self.setTestContext(context);
                });

            });

            //load data and current context in parrallel at initialization
            return Promise.all([
                this.getProxy().getTestData(),
                this.getProxy().getTestContext()
            ])
            .then(function(data, context){
                self.setTestData(data);
                self.setTestContext(context);
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
                .then(function(data, state){
                    resolve({
                        data : data,
                        state : state
                    });
                })
                .catch(reject);
            });
        },

        renderItem : function renderItem(item){
            var self = this;

            return new Promise(function(resolve, reject){
                self.itemRunner = qtiItemRunner(item.data)
                    .on('error', reject)
                    .on('render', resolve)
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
