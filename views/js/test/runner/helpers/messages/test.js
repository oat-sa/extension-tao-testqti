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

    QUnit.module('helpers/messages');


    QUnit.test('module', function (assert) {
        QUnit.expect(1);
        assert.equal(typeof messagesHelper, 'object', "The messages helper module exposes an object");
    });


    var messagesHelperApi = [
        {title: 'getExitMessage'}
    ];

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

    QUnit.test('helpers/messages.getExitMessage (enabled)', function (assert) {
        var context = {itemPosition: 1};
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
                            stats: {
                                questions: 3,
                                answered: 3,
                                flagged: 0,
                                viewed: 0,
                                total: 3
                            }
                        }
                    },
                    stats: {
                        questions: 3,
                        answered: 3,
                        flagged: 0,
                        viewed: 0,
                        total: 3
                    }
                }
            },
            stats: {
                questions: 3,
                answered: 3,
                flagged: 0,
                viewed: 0,
                total: 3
            }
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
        var responses = {RESPONSE: {base: null}};
        var runner = runnerMock(map, context, data, responses, declarations);
        var message = 'This is a test.';

        QUnit.expect(18);

        // all answered, no flagged
        assert.equal(messagesHelper.getExitMessage(message, 'test', runner), 'You answered all 3 question(s) in this test. ' + message, 'The messages helper return the right message when the scope is "test"');
        assert.equal(messagesHelper.getExitMessage(message, 'part', runner), 'You answered all 3 question(s). ' + message, 'The messages helper return the right message when the scope is "part"');
        assert.equal(messagesHelper.getExitMessage(message, 'section', runner), 'You answered all 3 question(s) in this section. ' + message, 'The messages helper return the right message when the scope is "section"');

        // some answered, no flagged
        map.stats.answered = 2;
        map.parts.part1.stats.answered = 2;
        map.parts.part1.sections.section1.stats.answered = 2;
        assert.equal(messagesHelper.getExitMessage(message, 'test', runner), 'You have 1 unanswered question(s). ' + message, 'The messages helper return the right message when the scope is "test" and there are unanswered items');
        assert.equal(messagesHelper.getExitMessage(message, 'part', runner), 'You have 1 unanswered question(s). ' + message, 'The messages helper return the right message when the scope is "part" and there are unanswered items');
        assert.equal(messagesHelper.getExitMessage(message, 'section', runner), 'You answered only 2 of the 3 question(s) in this section. ' + message, 'The messages helper return the right message when the scope is "section" and there are unanswered items');

        // some answered, some flagged
        map.stats.flagged = 1;
        map.parts.part1.stats.flagged = 1;
        map.parts.part1.sections.section1.stats.flagged = 1;
        assert.equal(messagesHelper.getExitMessage(message, 'test', runner), 'You have 1 unanswered question(s) and you flagged 1 item(s) that you can review now. ' + message, 'The messages helper return the right message when the scope is "test" and there are unanswered and flagged items');
        assert.equal(messagesHelper.getExitMessage(message, 'part', runner), 'You have 1 unanswered question(s) and you flagged 1 item(s) that you can review now. ' + message, 'The messages helper return the right message when the scope is "part" and there are unanswered and flagged items');
        assert.equal(messagesHelper.getExitMessage(message, 'section', runner), 'You answered only 2 of the 3 question(s) in this section, and flagged 1 of them. ' + message, 'The messages helper return the right message when the scope is "section" and there are unanswered and flagged items');


        // all answered, some flagged
        map.stats.answered = 3;
        map.parts.part1.stats.answered = 3;
        map.parts.part1.sections.section1.stats.answered = 3;
        assert.equal(messagesHelper.getExitMessage(message, 'test', runner), 'You answered all 3 question(s) in this test and you flagged 1 item(s) that you can review now. ' + message, 'The messages helper return the right message when the scope is "test" and there are flagged items');
        assert.equal(messagesHelper.getExitMessage(message, 'part', runner), 'You answered all 3 question(s) and you flagged 1 item(s) that you can review now. ' + message, 'The messages helper return the right message when the scope is "part" and there are flagged items');
        assert.equal(messagesHelper.getExitMessage(message, 'section', runner), 'You answered all 3 question(s) in this section, and flagged 1 of them. ' + message, 'The messages helper return the right message when the scope is "section" and there are flagged items');

        // some answered, some flagged, current item answered
        map.stats.answered = 1;
        map.parts.part1.stats.answered = 1;
        map.parts.part1.sections.section1.stats.answered = 1;
        responses.RESPONSE.base = {string: 'test'};
        assert.equal(messagesHelper.getExitMessage(message, 'test', runner), 'You have 1 unanswered question(s) and you flagged 1 item(s) that you can review now. ' + message, 'The messages helper return the right message when the scope is "test" and there are unanswered items');
        assert.equal(messagesHelper.getExitMessage(message, 'part', runner), 'You have 1 unanswered question(s) and you flagged 1 item(s) that you can review now. ' + message, 'The messages helper return the right message when the scope is "part" and there are unanswered items');
        assert.equal(messagesHelper.getExitMessage(message, 'section', runner), 'You answered only 2 of the 3 question(s) in this section, and flagged 1 of them. ' + message, 'The messages helper return the right message when the scope is "section" and there are unanswered items');

        // some answered, no flagged, current item answered
        map.stats.flagged = 0;
        map.parts.part1.stats.flagged = 0;
        map.parts.part1.sections.section1.stats.flagged = 0;
        assert.equal(messagesHelper.getExitMessage(message, 'test', runner), 'You have 1 unanswered question(s). ' + message, 'The messages helper return the right message when the scope is "test" and there are unanswered items');
        assert.equal(messagesHelper.getExitMessage(message, 'part', runner), 'You have 1 unanswered question(s). ' + message, 'The messages helper return the right message when the scope is "part" and there are unanswered items');
        assert.equal(messagesHelper.getExitMessage(message, 'section', runner), 'You answered only 2 of the 3 question(s) in this section. This is a test.', 'The messages helper return the right message when the scope is "section" and there are unanswered items');
    });

    QUnit.test('helpers/messages.getExitMessage (disabled)', function (assert) {
        var context = {itemPosition: 1};
        var data = {
            config: {
                enableUnansweredItemsWarning: false
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
                            stats: {
                                questions: 3,
                                answered: 3,
                                flagged: 0,
                                viewed: 0,
                                total: 3
                            }
                        }
                    },
                    stats: {
                        questions: 3,
                        answered: 3,
                        flagged: 0,
                        viewed: 0,
                        total: 3
                    }
                }
            },
            stats: {
                questions: 3,
                answered: 3,
                flagged: 0,
                viewed: 0,
                total: 3
            }
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
        var responses = {RESPONSE: {base: null}};
        var runner = runnerMock(map, context, data, responses, declarations);
        var message = 'This is a test.';

        QUnit.expect(18);

        // all answered, no flagged
        assert.equal(messagesHelper.getExitMessage(message, 'test', runner), message, 'The messages helper return the right message when the scope is "test"');
        assert.equal(messagesHelper.getExitMessage(message, 'part', runner), message, 'The messages helper return the right message when the scope is "part"');
        assert.equal(messagesHelper.getExitMessage(message, 'section', runner), message, 'The messages helper return the right message when the scope is "section"');

        // some answered, no flagged
        map.stats.answered = 0;
        map.parts.part1.stats.answered = 1;
        map.parts.part1.sections.section1.stats.answered = 2;
        assert.equal(messagesHelper.getExitMessage(message, 'test', runner), message, 'The messages helper return the right message when the scope is "test" and there are unanswered items');
        assert.equal(messagesHelper.getExitMessage(message, 'part', runner), message, 'The messages helper return the right message when the scope is "part" and there are unanswered items');
        assert.equal(messagesHelper.getExitMessage(message, 'section', runner), message, 'The messages helper return the right message when the scope is "section" and there are unanswered items');

        // some answered, some flagged
        map.stats.flagged = 3;
        map.parts.part1.stats.flagged = 2;
        map.parts.part1.sections.section1.stats.flagged = 1;
        assert.equal(messagesHelper.getExitMessage(message, 'test', runner), message, 'The messages helper return the right message when the scope is "test" and there are unanswered and flagged items');
        assert.equal(messagesHelper.getExitMessage(message, 'part', runner), message, 'The messages helper return the right message when the scope is "part" and there are unanswered and flagged items');
        assert.equal(messagesHelper.getExitMessage(message, 'section', runner), message, 'The messages helper return the right message when the scope is "section" and there are unanswered and flagged items');


        // no answered, some flagged
        map.stats.answered = 3;
        map.parts.part1.stats.answered = 3;
        map.parts.part1.sections.section1.stats.answered = 3;
        assert.equal(messagesHelper.getExitMessage(message, 'test', runner), message, 'The messages helper return the right message when the scope is "test" and there are flagged items');
        assert.equal(messagesHelper.getExitMessage(message, 'part', runner), message, 'The messages helper return the right message when the scope is "part" and there are flagged items');
        assert.equal(messagesHelper.getExitMessage(message, 'section', runner), message, 'The messages helper return the right message when the scope is "section" and there are flagged items');

        // some answered, some flagged, current item answered
        map.stats.answered = 0;
        map.parts.part1.stats.answered = 1;
        map.parts.part1.sections.section1.stats.answered = 2;
        responses.RESPONSE.base = {string: 'test'};
        assert.equal(messagesHelper.getExitMessage(message, 'test', runner), message, 'The messages helper return the right message when the scope is "test" and there are unanswered items');
        assert.equal(messagesHelper.getExitMessage(message, 'part', runner), message, 'The messages helper return the right message when the scope is "part" and there are unanswered items');
        assert.equal(messagesHelper.getExitMessage(message, 'section', runner), message, 'The messages helper return the right message when the scope is "section" and there are unanswered items');

        // some answered, no flagged, current item answered
        map.stats.flagged = 0;
        map.parts.part1.stats.flagged = 0;
        map.parts.part1.sections.section1.stats.flagged = 0;
        assert.equal(messagesHelper.getExitMessage(message, 'test', runner), message, 'The messages helper return the right message when the scope is "test" and there are unanswered items');
        assert.equal(messagesHelper.getExitMessage(message, 'part', runner), message, 'The messages helper return the right message when the scope is "part" and there are unanswered items');
        assert.equal(messagesHelper.getExitMessage(message, 'section', runner), message, 'The messages helper return the right message when the scope is "section" and there are unanswered items');
    });

});
