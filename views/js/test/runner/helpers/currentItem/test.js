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
    'taoQtiTest/runner/helpers/currentItem'
], function (_, helpers, currentItemHelper) {
    'use strict';

    var messagesHelperApi = [
        {title: 'getDeclarations'},
        {title: 'getResponseDeclaration'},
        {title: 'toResponse'},
        {title: 'isQtiValueNull'},
        {title: 'isQuestionAnswered'},
        {title: 'isAnswered'}
    ];

    /**
     * Build a fake test runner with embedded item runner
     * @param {Object} responses
     * @param {Object} declarations
     * @returns {Object}
     */
    function runnerMock(responses, declarations) {
        return {
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


    QUnit.module('helpers/currentItem');


    QUnit.test('module', function (assert) {
        QUnit.expect(1);

        assert.equal(typeof currentItemHelper, 'object', "The currentItem helper module exposes an object");
    });


    QUnit
        .cases(messagesHelperApi)
        .test('helpers/currentItem API ', function (data, assert) {
            QUnit.expect(1);

            assert.equal(typeof currentItemHelper[data.title], 'function', 'The currentItem helper expose a "' + data.title + '" function');
        });


    QUnit.test('helpers/currentItem.getDeclarations', function (assert) {
        var declarations = {
            "responsedeclaration1": {
                "identifier": "RESPONSE1",
                "serial": "responsedeclaration1",
                "qtiClass": "responseDeclaration",
                "attributes": {
                    "identifier": "RESPONSE1", "cardinality": "single", "baseType": "string"
                },
                "defaultValue": []
            },
            "responsedeclaration2": {
                "identifier": "RESPONSE2",
                "serial": "responsedeclaration2",
                "qtiClass": "responseDeclaration",
                "attributes": {
                    "identifier": "RESPONSE2", "cardinality": "single", "baseType": "string"
                },
                "defaultValue": []
            }
        };
        var runner = runnerMock({}, declarations);

        QUnit.expect(1);

        assert.equal(currentItemHelper.getDeclarations(runner), declarations, 'The helper has returned the right list of responses declarations');

    });


    QUnit.test('helpers/currentItem.getResponseDeclaration', function (assert) {
        var declarations = {
            "responsedeclaration1": {
                "identifier": "RESPONSE1",
                "serial": "responsedeclaration1",
                "qtiClass": "responseDeclaration",
                "attributes": {
                    "identifier": "RESPONSE1", "cardinality": "single", "baseType": "string"
                },
                "defaultValue": []
            },
            "responsedeclaration2": {
                "identifier": "RESPONSE2",
                "serial": "responsedeclaration2",
                "qtiClass": "responseDeclaration",
                "attributes": {
                    "identifier": "RESPONSE2", "cardinality": "single", "baseType": "string"
                },
                "defaultValue": []
            }
        };
        var runner = runnerMock({}, declarations);

        QUnit.expect(2);

        assert.equal(currentItemHelper.getResponseDeclaration(runner, "RESPONSE1"), declarations.responsedeclaration1, 'The helper has returned the first declaration');
        assert.equal(currentItemHelper.getResponseDeclaration(runner, "RESPONSE2"), declarations.responsedeclaration2, 'The helper has returned the second declaration');

    });


    QUnit.test('helpers/currentItem.toResponse', function (assert) {
        QUnit.expect(5);

        assert.deepEqual(currentItemHelper.toResponse(null, 'string', 'single'), {base: null}, 'The helper has built the right response');
        assert.deepEqual(currentItemHelper.toResponse('foo', 'string', 'single'), {base: {string: 'foo'}}, 'The helper has built the right response');
        assert.deepEqual(currentItemHelper.toResponse(['foo'], 'string', 'single'), {base: {string: 'foo'}}, 'The helper has built the right response');
        assert.deepEqual(currentItemHelper.toResponse(['foo'], 'string', 'multiple'), {list: {string: ['foo']}}, 'The helper has built the right response');
        assert.deepEqual(currentItemHelper.toResponse(null, 'string', 'multiple'), {list: {string: []}}, 'The helper has built the right response');
    });


    QUnit.test('helpers/currentItem.isQtiValueNull', function (assert) {
        QUnit.expect(5);

        assert.equal(currentItemHelper.isQtiValueNull(null, 'string', 'single'), true, 'The response should be null');
        assert.equal(currentItemHelper.isQtiValueNull({base: {string: null}}, 'string', 'single'), true, 'The response should be null');
        assert.equal(currentItemHelper.isQtiValueNull({base: {string: 'foo'}}, 'string', 'single'), false, 'The response should not be null');
        assert.equal(currentItemHelper.isQtiValueNull({list: {string: ['foo']}}, 'string', 'multiple'), false, 'The response should not be null');
        assert.equal(currentItemHelper.isQtiValueNull({list: {string: []}}, 'string', 'multiple'), true, 'The response should be null');
    });


    QUnit.test('helpers/currentItem.isQuestionAnswered', function (assert) {
        QUnit.expect(11);

        // null
        assert.equal(currentItemHelper.isQuestionAnswered(null, 'string', 'single'), false, 'The question should not be answered');
        assert.equal(currentItemHelper.isQuestionAnswered({base: null}, 'string', 'single'), false, 'The question should not be answered');
        assert.equal(currentItemHelper.isQuestionAnswered({base: {string: null}}, 'string', 'single'), false, 'The question should not be answered');

        // default
        assert.equal(currentItemHelper.isQuestionAnswered({base: {string: 'foo'}}, 'string', 'single', 'foo'), false, 'The question should not be answered');
        assert.equal(currentItemHelper.isQuestionAnswered({list: {string: ['foo']}}, 'string', 'multiple', ['foo']), false, 'The question should not be answered');

        // null and not default
        assert.equal(currentItemHelper.isQuestionAnswered(null, 'string', 'single', 'foo'), false, 'The question should not be answered');
        assert.equal(currentItemHelper.isQuestionAnswered({base: null}, 'string', 'single', 'foo'), false, 'The question should not be answered');
        assert.equal(currentItemHelper.isQuestionAnswered({base: {string: null}}, 'string', 'single', 'foo'), false, 'The question should not be answered');

        // not null or default
        assert.equal(currentItemHelper.isQuestionAnswered({base: {string: 'foo'}}, 'string', 'single'), true, 'The question should be answered');
        assert.equal(currentItemHelper.isQuestionAnswered({list: {string: ['foo']}}, 'string', 'multiple'), true, 'The question should be answered');
        assert.equal(currentItemHelper.isQuestionAnswered({list: {string: []}}, 'string', 'multiple'), false, 'The question should not be answered');
    });


    QUnit.test('helpers/currentItem.isAnswered', function (assert) {
        var declarations = {
            "responsedeclaration1": {
                "identifier": "RESPONSE1",
                "serial": "responsedeclaration1",
                "qtiClass": "responseDeclaration",
                "attributes": {
                    "identifier": "RESPONSE1", "cardinality": "single", "baseType": "string"
                },
                "defaultValue": []
            },
            "responsedeclaration2": {
                "identifier": "RESPONSE2",
                "serial": "responsedeclaration2",
                "qtiClass": "responseDeclaration",
                "attributes": {
                    "identifier": "RESPONSE2", "cardinality": "single", "baseType": "string"
                },
                "defaultValue": []
            }
        };
        var responded = {RESPONSE1: {base: null}, RESPONSE2: {base: {string: 'foo'}}};
        var notResponded = {RESPONSE1: {base: null}, RESPONSE2: {base: null}};
        var respondedRunner = runnerMock(responded, declarations);
        var notRespondedRunner = runnerMock(notResponded, declarations);

        QUnit.expect(2);

        assert.equal(currentItemHelper.isAnswered(respondedRunner), true, 'The item should be answered');
        assert.equal(currentItemHelper.isAnswered(notRespondedRunner), false, 'The item should not be answered');
    });
});
