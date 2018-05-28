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
 * @author Jean-Sébastien Conan <jean-sebastien@taotesting.com>
 */
define([
    'jquery',
    'taoQtiTest/previewer/adapter/qtiItem',
    'json!taoQtiItem/test/samples/json/space-shuttle.json',
    'lib/jquery.mockjax/jquery.mockjax'
], function ($, previewerAdapter, itemData) {
    'use strict';

    QUnit.module('API');


    // prevent the AJAX mocks to pollute the logs
    $.mockjaxSettings.logger = null;
    $.mockjaxSettings.responseTime = 1;

    // restore AJAX method after each test
    QUnit.testDone(function () {
        $.mockjax.clear();
    });


    QUnit.test('module', function (assert) {
        QUnit.expect(2);
        assert.equal(typeof previewerAdapter, 'object', "The previewerAdapter module exposes an object");
        assert.equal(typeof previewerAdapter.init, 'function', "The previewerAdapter object has a init() method");
    });


    QUnit.asyncTest('integration', function (assert) {
        var serviceCallId = 'previewer';
        var itemRef = {
            resultId: 'http://ce.tao/tao.rdf#i15265414071682172',
            itemDefinition: 'item-2',
            deliveryUri: 'http://ce.tao/tao.rdf#i15265411295469108'
        };
        var state = {"RESPONSE": {"response": {"base": {"identifier": "Atlantis"}}}};
        var config = {
            serviceCallId: serviceCallId,
            fullPage: true,
            readOnly: true
        };

        QUnit.expect(1);

        $.mockjax({
            url: '/init*',
            responseText: {
                success: true
            }
        });
        $.mockjax({
            url: '/getItem*',
            responseText: {
                success: true,
                content: {
                    type: 'qti',
                    data: itemData
                },
                baseUrl: '',
                state: {}
            }
        });

        previewerAdapter.init(itemRef, state, config)
            .before('ready', function (e, runner) {
                runner
                    .before('submititem', function() {
                        $.mockjax({
                            url: '/submitItem*',
                            responseText: {
                                success: true,
                                displayFeedback: true,
                                itemSession: {
                                    SCORE: {
                                        base: {
                                            float: 0
                                        }
                                    }
                                }
                            }
                        });
                    })
                    .after('submititem', function() {
                        $.mockjax.clear();
                    })
                    .after('renderitem.runnerComponent', function () {
                        assert.ok(true, 'The previewer has been rendered');
                        QUnit.start();
                    });
            });
    });
});
