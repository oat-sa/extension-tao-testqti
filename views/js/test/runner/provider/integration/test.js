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
 * @author Jean-Sébastien Conan <jean-sebastien.conan@vesperiagroup.com>
 */
define([
    'jquery',
    'lodash',
    'core/promise',
    'taoTests/runner/runner',
    'taoTests/runner/proxy',
    'taoQtiTest/runner/provider/qti',
    'taoQtiTest/runner/plugins/controls/title',
    'taoQtiTest/runner/plugins/navigation/next',
    'taoQtiTest/runner/plugins/navigation/previous',
    'taoQtiTest/runner/plugins/navigation/nextSection',
    'taoQtiTest/runner/plugins/navigation/skip',
], function($, _, Promise, runner, proxy, qtiProvider, title, next, previous, nextSection, skip) {
    'use strict';

    runner.registerProvider('qti', qtiProvider);

    /** Mock the proxy */
    proxy.registerProxy('qtiServiceProxy', {
        init: _.noop,
        destroy: _.noop,
        getTestData: function getTestData() {
            return Promise.resolve({
                "title": "QTI Example Test",
                "hasTimeLimits": true,
                "timeLimits": {
                    "maxTime": {
                        "duration": 7810,
                        "iso": "PT2H10M10S"
                    }
                },
                "config": {
                    "timerWarning": {
                        "assessmentItemRef": null,
                        "assessmentSection": null,
                        "testPart": null
                    },
                    "progress-indicator": "percentage",
                    "progress-indicator-scope": "testSection",
                    "progress-indicator-forced": false,
                    "test-taker-review": false,
                    "test-taker-review-region": "left",
                    "test-taker-review-force-title": false,
                    "test-taker-review-item-title": "Item %d",
                    "test-taker-review-scope": "test",
                    "test-taker-review-prevents-unseen": true,
                    "test-taker-review-can-collapse": false,
                    "exitButton": false,
                    "next-section": false,
                    "reset-timer-after-resume": false
                }
            });
        },
        getTestContext: function getTestContext() {
            return Promise.resolve({
                "state": 1,
                "navigationMode": 1,
                "submissionMode": 0,
                "remainingAttempts": 0,
                "isAdaptive": false,
                "isTimeout": true,
                "itemIdentifier": "item-1",
                "itemSessionState": 1,
                "isLast": false,
                "itemPosition": 0,
                "timeConstraints": [{
                    "label": "QTI Example Test",
                    "source": "Test-1",
                    "seconds": 0,
                    "allowLateSubmission": false,
                    "qtiClassName": "assessmentTest"
                }],
                "testPartId": "Introduction",
                "sectionTitle": "Section 1",
                "numberItems": 9,
                "numberCompleted": 0,
                "numberPresented": 1,
                "considerProgress": true,
                "isDeepestSectionVisible": true,
                "canMoveBackward": false,
                "allowComment": true,
                "allowSkipping": false,
                "exitButton": false,
                "logoutButton": true,
                "categories": []
            });
        },
        callTestAction: function callTestAction(action, params) {
            return new Promise(function(resolve) {
                resolve();
            });
        },
        getItemData: function getItemData(uri) {
            return new Promise(function(resolve) {
                resolve();
            });
        },
        getItemState: function getItemState(uri) {
            return new Promise(function(resolve) {
                resolve();
            });
        },
        submitItemState: function submitItemState(uri, state) {
            return new Promise(function(resolve) {
                resolve();
            });
        },
        storeItemResponse: function storeItemResponse(uri, response) {
            return new Promise(function(resolve) {
                resolve();
            });
        },
        callItemAction: function callItemAction(uri, action, params) {
            return new Promise(function(resolve) {
                resolve();
            });
        }
    });

    QUnit.test('integration', function(assert){
        assert.ok(true, 'dummy test');
    });


    QUnit.asyncTest('visual integration', function(assert){
        QUnit.expect(1);

        runner('qti', {
            title       : title,
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
