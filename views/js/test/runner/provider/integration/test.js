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
define([
    'jquery',
    'lodash',
    'core/promise',
    'taoTests/runner/runner',
    'taoTests/runner/proxy',
    'taoQtiTest/runner/provider/qti',
    'json!taoQtiTest/test/samples/json/QtiRunnerData',
    'json!taoQtiTest/test/samples/json/itemData',
    'taoQtiTest/runner/plugins/controls/title/title',
    'taoQtiTest/runner/plugins/controls/progressbar/progressbar',
    'taoQtiTest/runner/plugins/navigation/next',
    'taoQtiTest/runner/plugins/navigation/previous',
    'taoQtiTest/runner/plugins/navigation/nextSection',
    'taoQtiTest/runner/plugins/navigation/skip',
], function($, _, Promise, runner, proxy, qtiProvider, runnerData, itemData, title, progressbar, next, previous, nextSection, skip) {
    'use strict';

    runner.registerProvider('qti', qtiProvider);

    /** Mock the proxy */
    proxy.registerProxy('qtiServiceProxy', {
        init: function () { return Promise.resolve(runnerData); },
        destroy: _.noop,
        getTestData: function getTestData() {
            return Promise.resolve(runnerData.testData);
        },
        getTestContext: function getTestContext() {
            return Promise.resolve(runnerData.testContext);
        },
        getTestMap: function getTestMap() {
            return Promise.resolve({});
        },
        callTestAction: function callTestAction(action, params) {
            return Promise.resolve({});
        },
        getItemData: function getItemData(uri) {
            return Promise.resolve({ itemData : itemData });
        },
        getItemState: function getItemState(uri) {
            return Promise.resolve({});
        },
        submitItemState: function submitItemState(uri, state) {
            return Promise.resolve({});
        },
        storeItemResponse: function storeItemResponse(uri, response) {
            return Promise.resolve({});
        },
        callItemAction: function callItemAction(uri, action, params) {
            return Promise.resolve({});
        }
    });

    QUnit.test('integration', function(assert){
        assert.ok(true, 'dummy test');
    });


    QUnit.asyncTest('visual integration', function(assert){
        QUnit.expect(1);

        runner('qti', {
            title       : title,
            progress    : progressbar,
            previous    : previous,
            next        : next,
            skip        : skip,
            nextSection : nextSection
        }, {
            renderTo : $('#external')
        })
        .on('error', function(err){
            console.error(err);
        })
        .on('ready', function(){

            assert.ok(true, 'dummy test');

            QUnit.start();
        }).init();
    });
});
