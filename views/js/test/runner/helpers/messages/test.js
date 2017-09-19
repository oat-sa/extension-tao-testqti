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
    'lodash',
    'helpers',
    'taoQtiTest/runner/helpers/messages'
], function (_, helpers, messagesHelper) {
    'use strict';

    var messagesHelperApi = [
        { title: 'getExitMessage' }
    ];

    QUnit.module('helpers/messages');


    QUnit.test('module', function (assert) {
        QUnit.expect(1);
        assert.equal(typeof messagesHelper, 'object', "The messages helper module exposes an object");
    });

    QUnit
        .cases(messagesHelperApi)
        .test('helpers/messages API ', function (data, assert) {
            QUnit.expect(1);
            assert.equal(typeof messagesHelper[data.title], 'function', 'The messages helper expose a "' + data.title + '" function');
        });

    /**
     * Build a fake test runner
     * @param {Object} map
     * @param {Object} context
     * @param {Object} data
     * @param {Object} responses
     * @param {Object} declarations
     * @returns {Object}
     */
    function runnerMock(map, context, data, responses, declarations) {
        return {
            getTestContext: function () {
                return context;
            },
            getTestMap: function () {
                return map;
            },
            getTestData: function () {
                return data;
            },
            itemRunner: {
                _item: {
                    responses: declarations
                },
                getResponses: function () {
                    return responses;
                }
            }
        };
    }

    QUnit
        .cases([
            {
                title: 'all answered, none flagged',
                testStats:      { answered: 3 },
                partStats:      { answered: 3 },
                sectionStats:   { answered: 3 },
                currentItemResponse: { string: 'test' },
                currentItemAnswered: true,
                testMessage:    'You answered all 3 question(s) in this test.',
                partMessage:    'You answered all 3 question(s).',
                sectionMessage: 'You answered all 3 question(s) in this section.'
            }, {
                title: 'current not answered, none flagged',
                testStats:      { answered: 2 },
                partStats:      { answered: 2 },
                sectionStats:   { answered: 2 },
                currentItemResponse: null,
                currentItemAnswered: false,
                testMessage:    'You have 1 unanswered question(s).',
                partMessage:    'You have 1 unanswered question(s).',
                sectionMessage: 'You answered only 2 of the 3 question(s) in this section.'
            }, {
                title: 'current not answered, none flagged',
                testStats:      { answered: 2 },
                partStats:      { answered: 2 },
                sectionStats:   { answered: 2 },
                currentItemResponse: null,
                currentItemAnswered: false,
                testMessage:    'You have 1 unanswered question(s).',
                partMessage:    'You have 1 unanswered question(s).',
                sectionMessage: 'You answered only 2 of the 3 question(s) in this section.'
            }, {
                title: 'current not answered, one flagged',
                testStats:      { answered: 2, flagged: 1 },
                partStats:      { answered: 2, flagged: 1 },
                sectionStats:   { answered: 2, flagged: 1 },
                currentItemResponse: null,
                currentItemAnswered: false,
                testMessage:    'You have 1 unanswered question(s) and you flagged 1 item(s) that you can review now.',
                partMessage:    'You have 1 unanswered question(s) and you flagged 1 item(s) that you can review now.',
                sectionMessage: 'You answered only 2 of the 3 question(s) in this section, and flagged 1 of them.'
            }, {
                title: 'all answered, one flagged',
                testStats:      { answered: 3, flagged: 1 },
                partStats:      { answered: 3, flagged: 1 },
                sectionStats:   { answered: 3, flagged: 1 },
                currentItemResponse: { string: 'test' },
                currentItemAnswered: true,
                testMessage:    'You answered all 3 question(s) in this test and you flagged 1 item(s) that you can review now.',
                partMessage:    'You answered all 3 question(s) and you flagged 1 item(s) that you can review now.',
                sectionMessage: 'You answered all 3 question(s) in this section, and flagged 1 of them.'
            }, {
                title: 'one flagged, test taker has just answered to the current item, but without moving from it yet',
                testStats:      { answered: 1, flagged: 1 },
                partStats:      { answered: 1, flagged: 1 },
                sectionStats:   { answered: 1, flagged: 1 },
                currentItemResponse: { string: 'test' },
                currentItemAnswered: false,
                testMessage:    'You have 1 unanswered question(s) and you flagged 1 item(s) that you can review now.',
                partMessage:    'You have 1 unanswered question(s) and you flagged 1 item(s) that you can review now.',
                sectionMessage: 'You answered only 2 of the 3 question(s) in this section, and flagged 1 of them.'
            }, {
                title: 'none flagged, test taker has just answered to the current item, but without moving from it yet',
                testStats:      { answered: 1 },
                partStats:      { answered: 1 },
                sectionStats:   { answered: 1 },
                currentItemResponse: { string: 'test' },
                currentItemAnswered: false,
                testMessage:    'You have 1 unanswered question(s).',
                partMessage:    'You have 1 unanswered question(s).',
                sectionMessage: 'You answered only 2 of the 3 question(s) in this section.'
            }, {
                title: 'none flagged, all answered, test taker has just moved to an already answered item',
                testStats:      { answered: 3 },
                partStats:      { answered: 3 },
                sectionStats:   { answered: 3 },
                currentItemResponse: { string: 'test' },
                currentItemAnswered: true,
                testMessage:    'You answered all 3 question(s) in this test.',
                partMessage:    'You answered all 3 question(s).',
                sectionMessage: 'You answered all 3 question(s) in this section.'
            }, {
                title: 'none flagged, all answered, test taker removes answer from a previously answered item',
                testStats:      { answered: 3 },
                partStats:      { answered: 3 },
                sectionStats:   { answered: 3 },
                currentItemResponse: null,
                currentItemAnswered: true,
                testMessage:    'You have 1 unanswered question(s).',
                partMessage:    'You have 1 unanswered question(s).',
                sectionMessage: 'You answered only 2 of the 3 question(s) in this section.'
            }
        ])
        .test('helpers/messages.getExitMessage (enabled)', function (testData, assert) {
            var context = {
                itemPosition: 1,
                itemAnswered: testData.currentItemAnswered
            };
            var data = {
                config: {
                    enableUnansweredItemsWarning: true
                }
            };
            var map = {
                jumps: [
                    {position: 0, identifier: 'item1', section: 'section1', part: 'part1'},
                    {position: 1, identifier: 'item2', section: 'section1', part: 'part1'},
                    {position: 2, identifier: 'item3', section: 'section1', part: 'part1'}
                ],
                parts: {
                    part1: {
                        sections: {
                            section1: {
                                items: {
                                    item1: {},
                                    item2: {},
                                    item3: {}
                                },
                                stats: _.defaults(testData.sectionStats, {
                                    questions: 3,
                                    answered: 3,
                                    flagged: 0,
                                    viewed: 0,
                                    total: 3
                                })
                            }
                        },
                        stats: _.defaults(testData.partStats, {
                            questions: 3,
                            answered: 3,
                            flagged: 0,
                            viewed: 0,
                            total: 3
                        })
                    }
                },
                stats: _.defaults(testData.testStats, {
                    questions: 3,
                    answered: 3,
                    flagged: 0,
                    viewed: 0,
                    total: 3
                })
            };
            var declarations = {
                "responsedeclaration": {
                    "identifier": "RESPONSE",
                    "serial": "responsedeclaration",
                    "qtiClass": "responseDeclaration",
                    "attributes": {
                        "identifier": "RESPONSE", "cardinality": "single", "baseType": "string"
                    },
                    "defaultValue": []
                }
            };
            var responses = {
                RESPONSE: {
                    base: testData.currentItemResponse
                }
            };
            var runner = runnerMock(map, context, data, responses, declarations);
            var message = 'This is a test.';

            QUnit.expect(6);

            assert.equal(messagesHelper.getExitMessage(message, 'test', runner), testData.testMessage + ' ' + message, 'message include the right stats for test scope');
            assert.equal(messagesHelper.getExitMessage(message, 'part', runner), testData.partMessage + ' ' + message, 'message include the right stats for part scope');
            assert.equal(messagesHelper.getExitMessage(message, 'section', runner), testData.sectionMessage + ' ' + message, 'message include the right stats for section scope');

            data.config.enableUnansweredItemsWarning = false;

            assert.equal(messagesHelper.getExitMessage(message, 'test', runner), message, 'no stats in test scope when option is disabled');
            assert.equal(messagesHelper.getExitMessage(message, 'part', runner), message, 'no stats in part scope when option is disabled');
            assert.equal(messagesHelper.getExitMessage(message, 'section', runner), message, 'no stats in session scope when option is disabled');
        });

});
