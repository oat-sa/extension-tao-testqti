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
 * Copyright (c) 2019 (original work) Open Assessment Technologies SA ;
 */
/**
 * @author Péter Halász <peter@taotesting.com>
 */
define([
    'taoQtiTest/runner/branchRule/types/match',
    'taoQtiTest/runner/services/responseStore'
], function(
    matchBranchRuleFactory,
    responseStoreFactory
) {
    'use strict';

    QUnit.test('it returns true if the matching is correct', function(assert) {
        var done = assert.async();
        var branchRuleDefinition = {
            'variable': { '@attributes': { 'identifier': 'R1' } },
            'correct':  { '@attributes': { 'identifier': 'R1' } }
        };

        var responseStore = responseStoreFactory();
        responseStore.addResponse('R1', 'test');
        responseStore.addCorrectResponse('R1', ['test', 'foo', 'bar']);

        responseStore.addResponse('R2', 'foo');
        responseStore.addCorrectResponse('R2', ['a', 'b', 'c']);

        matchBranchRuleFactory(branchRuleDefinition, null, null, null, responseStore)
            .validate()
            .then(function(result) {
                assert.expect(1);
                assert.equal(result, true);
                done();
            });

    });

    QUnit.test('it returns true if the matching is correct (different answer)', function(assert) {
        var done = assert.async();
        var branchRuleDefinition = {
            'variable': { '@attributes': { 'identifier': 'R2' } },
            'correct':  { '@attributes': { 'identifier': 'R1' } }
        };

        var responseStore = responseStoreFactory();
        responseStore.addResponse('R1', 'test');
        responseStore.addCorrectResponse('R1', ['test', 'foo', 'bar']);

        responseStore.addResponse('R2', 'foo');
        responseStore.addCorrectResponse('R2', ['a', 'b', 'c']);

        matchBranchRuleFactory(branchRuleDefinition, null, null, null, responseStore)
            .validate()
            .then(function(result) {
                assert.expect(1);
                assert.equal(result, true);
                done();
            });

    });

    QUnit.test('it returns false if the responses are not exist', function(assert) {
        var done = assert.async();
        var branchRuleDefinition = {
            'variable': { '@attributes': { 'identifier': 'test' } },
            'correct':  { '@attributes': { 'identifier': 'test' } }
        };

        var responseStore = responseStoreFactory();
        responseStore.addResponse('R1', 'test');
        responseStore.addCorrectResponse('R1', ['test', 'foo', 'bar']);

        responseStore.addResponse('R2', 'foo');
        responseStore.addCorrectResponse('R2', ['a', 'b', 'c']);

        matchBranchRuleFactory(branchRuleDefinition, null, null, null, responseStore)
            .validate()
            .then(function(result) {
                assert.expect(1);
                assert.equal(result, false);
                done();
            });
    });

    QUnit.test('it returns false if the response is incorrect', function(assert) {
        var done = assert.async();
        var branchRuleDefinition = {
            'variable': { '@attributes': { 'identifier': 'R2' } },
            'correct':  { '@attributes': { 'identifier': 'R2' } }
        };

        var responseStore = responseStoreFactory();
        responseStore.addResponse('R1', 'test');
        responseStore.addCorrectResponse('R1', ['test', 'foo', 'bar']);

        responseStore.addResponse('R2', 'foo');
        responseStore.addCorrectResponse('R2', ['a', 'b', 'c']);

        matchBranchRuleFactory(branchRuleDefinition, null, null, null, responseStore)
            .validate()
            .then(function(result) {
                assert.expect(1);
                assert.equal(result, false);
                done();
            });

    });

    QUnit.test('it returns false if the responses are not matching', function(assert) {
        var done = assert.async();
        var branchRuleDefinition = {
            'variable': { '@attributes': { 'identifier': 'R1' } },
            'correct':  { '@attributes': { 'identifier': 'R2' } }
        };

        var responseStore = responseStoreFactory();
        responseStore.addResponse('R1', 'test');
        responseStore.addCorrectResponse('R1', ['test', 'foo', 'bar']);

        responseStore.addResponse('R2', 'foo');
        responseStore.addCorrectResponse('R2', ['a', 'b', 'c']);

        matchBranchRuleFactory(branchRuleDefinition, null, null, null, responseStore)
            .validate()
            .then(function(result) {
                assert.expect(1);
                assert.equal(result, false);
                done();
            });

    });
});
