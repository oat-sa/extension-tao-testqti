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
 * Test Runner Navigation Plugin : add exit codes to the
 *
 * @author Bertrand Chevrier <bertrand@taotesting.com>
 */
define([
    'jquery',
    'lodash',
    'i18n',
    'taoTests/runner/plugin',
    'taoQtiTest/testRunner/testMetaData'
], function ($, _, __, pluginFactory, testMetaDataFactory){
    'use strict';

    /**
     * Creates the exitCode plugin
     */
    return pluginFactory({
        name: 'metaData',

        /**
         * Initializes the plugin (called during runner's init)
         */
        init: function init() {
            var self = this;
            var testRunner = this.getTestRunner();
            var proxy = testRunner.getProxy();
            var config = testRunner.getConfig();
            var testData = testRunner.getTestData() || {};
            var itemStates = testData.itemStates || {};
            var testMetaData = testMetaDataFactory({
                testServiceCallId: config.serviceCallId
            });

            testRunner.before('move', function(e){
                var done = e.done();
                testMetaData.addData({'ITEM' : {
                        'ITEM_END_TIME_CLIENT' : Date.now() / 1000
                    }
                });
                proxy.addCallActionParams({metaData : testMetaData.getData()});
                testMetaData.clearData();
                done();
            })
            .before('skip', function(e){
                var done = e.done();
                testMetaData.addData({'ITEM' : {
                        'ITEM_END_TIME_CLIENT' : Date.now() / 1000
                    }
                });
                proxy.addCallActionParams({metadata : testMetaData.getData()});
                testMetaData.clearData();
                done();
            })
            .before('exit', function(e){
                var done = e.done();
                testMetaData.addData({
                    'TEST' : {
                        'TEST_EXIT_CODE' : testMetaData.TEST_EXIT_CODE.INCOMPLETE
                    },
                    'SECTION' : {
                        SECTION_EXIT_CODE : testMetaData.SECTION_EXIT_CODE.QUIT
                    }
                });
                proxy.addCallActionParams({metaData : testMetaData.getData()});
                testMetaData.clearData();
                done();
            })
            .before('timeout', function(e){
                var done = e.done();
                testMetaData.addData({
                    'TEST' : {
                        'TEST_EXIT_CODE' : testMetaData.TEST_EXIT_CODE.INCOMPLETE
                    },
                    'SECTION' : {
                        SECTION_EXIT_CODE : testMetaData.SECTION_EXIT_CODE.TIMEOUT
                    }
                });
                proxy.addCallActionParams({metaData : testMetaData.getData()});
                testMetaData.clearData();
                done();
            })
            .before('finish', function(e){
                var done = e.done();
                testMetaData.addData({
                    'TEST' : {
                        'TEST_EXIT_CODE' : testMetaData.TEST_EXIT_CODE.INCOMPLETE
                    },
                    'SECTION' : {
                        SECTION_EXIT_CODE : testMetaData.SECTION_EXIT_CODE.QUIT
                    }
                });
                proxy.addCallActionParams({metaData : testMetaData.getData()});
                testMetaData.clearData();
                done();
            })
            .on('renderitem', function(e){
                testMetaData.addData({'ITEM' : {
                        'ITEM_START_TIME_CLIENT' : Date.now() / 1000
                    }
                });
            });
        }
    });
});
