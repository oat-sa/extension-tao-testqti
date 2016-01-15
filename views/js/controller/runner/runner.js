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
    'i18n',
    'core/promise',
    'ui/feedback',
    'taoTests/runner/runner',
    'taoQtiTest/runner/provider/qti',
    'taoTests/runner/proxy',
    'taoQtiTest/runner/proxy/qtiServiceProxy',
    'taoQtiTest/runner/plugins/controls/title/title',
    'taoQtiTest/runner/plugins/controls/progressbar/progressbar',
    'taoQtiTest/runner/plugins/navigation/next',
    'taoQtiTest/runner/plugins/navigation/previous',
    'taoQtiTest/runner/plugins/navigation/nextSection',
    'taoQtiTest/runner/plugins/navigation/skip',

    'json!taoQtiTest/test/samples/json/QtiRunnerData',
    'json!taoQtiTest/test/samples/json/itemData',
    'css!taoQtiTestCss/new-test-runner'
], function($, _, __, Promise, feedback, runner, qtiProvider, proxy, qtiServiceProxy, title, progressbar, next, previous, nextSection, skip, runnerData, itemData) {
    'use strict';

    runner.registerProvider('qti', qtiProvider);
    //proxy.registerProxy('qtiServiceProxy', qtiServiceProxy);
    //

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
        callTestAction: function callTestAction(action, params) {
            return Promise.resolve({});
        },
        getItemData: function getItemData(uri) {
            return Promise.resolve(itemData);
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

    var plugins = {
        title       : title,
        progress    : progressbar,
        previous    : previous,
        next        : next,
        skip        : skip,
        nextSection : nextSection
    };

    var runnerController = {
        start : function start(options){

            var config = _.defaults(options || {}, {
                renderTo : $('.runner')
            });

            runner('qti', plugins, config)
                .on('error', function(err){
                    var message = err;
                    var type = 'error';

                    if ('object' === typeof err) {
                        message = err.message;
                        type = err.type;
                    }

                    if (!message) {
                        switch (type) {
                            case 'TestState':
                                message = __('The test has been closed/suspended!');
                                break;

                            case 'FileNotFound':
                                message = __('File not found!');
                                break;

                            default:
                                message = __('An error occurred!');
                        }
                    }

                    console.error(err);
                    feedback().error(message);

                    if ('TestState' === type) {
                        // TODO: test has been closed/suspended => redirect to the index page after message acknowledge
                    }
                })
                .on('ready', function(){

                })
                .init();
        }
    };

    return runnerController;
});
