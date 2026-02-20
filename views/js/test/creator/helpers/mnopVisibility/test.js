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
 * Copyright (c) 2025-2026 (original work) Open Assessment Technologies SA;
 */

/**
 * Test MNOP Visibility Gating Helper
 *
 * @author Open Assessment Technologies SA
 */
define([
    'taoQtiTest/controller/creator/helpers/mnopVisibility'
], function(mnopVisibility) {
    'use strict';

    QUnit.module('MNOP Visibility Gating');

    QUnit.test('module', function(assert) {
        assert.expect(2);
        assert.equal(typeof mnopVisibility, 'object', 'The module exposes an object');
        assert.equal(typeof mnopVisibility.shouldShowMNOP, 'function', 'The module exposes shouldShowMNOP method');
    });

    QUnit.test('visible for Total score, no branch rules', function(assert) {
        assert.expect(1);

        var scoring = {outcomeProcessing: 'total'};
        var testModel = {testParts: [{branchRules: []}]};

        assert.ok(mnopVisibility.shouldShowMNOP(scoring, testModel), 'MNOP should be visible for total score');
    });

    QUnit.test('visible for Cut score, no branch rules', function(assert) {
        assert.expect(1);

        var scoring = {outcomeProcessing: 'cut'};
        var testModel = {testParts: [{branchRules: []}]};

        assert.ok(mnopVisibility.shouldShowMNOP(scoring, testModel), 'MNOP should be visible for cut score');
    });

    QUnit.test('hidden for None outcome processing', function(assert) {
        assert.expect(1);

        var scoring = {outcomeProcessing: 'none'};
        var testModel = {testParts: [{branchRules: []}]};

        assert.notOk(mnopVisibility.shouldShowMNOP(scoring, testModel), 'MNOP should be hidden for none outcome processing');
    });

    QUnit.test('hidden for Custom outcome processing', function(assert) {
        assert.expect(1);

        var scoring = {outcomeProcessing: 'custom'};
        var testModel = {testParts: [{branchRules: []}]};

        assert.notOk(mnopVisibility.shouldShowMNOP(scoring, testModel), 'MNOP should be hidden for custom outcome processing');
    });

    QUnit.test('hidden for Grade outcome processing', function(assert) {
        assert.expect(1);

        var scoring = {outcomeProcessing: 'grade'};
        var testModel = {testParts: [{branchRules: []}]};

        assert.notOk(mnopVisibility.shouldShowMNOP(scoring, testModel), 'MNOP should be hidden for grade outcome processing');
    });

    QUnit.test('hidden when branch rules present', function(assert) {
        assert.expect(1);

        var scoring = {outcomeProcessing: 'total'};
        var testModel = {testParts: [{branchRules: [{target: 'tp2', variable: 'SCORE', operator: 'gt', value: 5}]}]};

        assert.notOk(mnopVisibility.shouldShowMNOP(scoring, testModel), 'MNOP should be hidden when branch rules are present');
    });

    QUnit.test('visible when only preconditions present', function(assert) {
        assert.expect(2);

        var scoring = {outcomeProcessing: 'total'};
        var testModel = {testParts: [{branchRules: [], preConditions: [{variable: 'SCORE', operator: 'gt', value: 0}]}]};

        assert.ok(mnopVisibility.shouldShowMNOP(scoring, testModel), 'MNOP should be visible when only preconditions present');
        assert.equal(mnopVisibility.getHiddenReason(scoring, testModel), '', 'No hidden reason when visible');
    });

    QUnit.test('getHiddenReason returns correct messages for outcome processing', function(assert) {
        assert.expect(3);

        var testModel = {testParts: [{branchRules: []}]};

        var reason1 = mnopVisibility.getHiddenReason({outcomeProcessing: 'none'}, testModel);
        assert.ok(reason1.includes('Total score or Cut score'), 'Reason mentions required outcome processing modes');

        var reason2 = mnopVisibility.getHiddenReason({outcomeProcessing: 'custom'}, testModel);
        assert.ok(reason2.includes('Total score or Cut score'), 'Reason for custom also mentions required modes');

        var reason3 = mnopVisibility.getHiddenReason({outcomeProcessing: 'grade'}, testModel);
        assert.ok(reason3.includes('Total score or Cut score'), 'Reason for grade also mentions required modes');
    });

    QUnit.test('getHiddenReason returns correct message for branch rules', function(assert) {
        assert.expect(1);

        var scoring = {outcomeProcessing: 'total'};
        var testModel = {testParts: [{branchRules: [{target: 'tp2', variable: 'SCORE', operator: 'gt', value: 5}]}]};
        var reason = mnopVisibility.getHiddenReason(scoring, testModel);

        assert.ok(reason.includes('branch rules'), 'Reason mentions branch rules when they are present');
    });

    QUnit.test('handles missing scoring object', function(assert) {
        assert.expect(2);

        var testModel = {testParts: [{branchRules: []}]};

        assert.notOk(mnopVisibility.shouldShowMNOP(null, testModel), 'Returns false when scoring is null');
        assert.notOk(mnopVisibility.shouldShowMNOP(undefined, testModel), 'Returns false when scoring is undefined');
    });

    QUnit.test('handles missing testModel object', function(assert) {
        assert.expect(2);

        var scoring = {outcomeProcessing: 'total'};

        assert.ok(mnopVisibility.shouldShowMNOP(scoring, null), 'Returns true when testModel is null (no branch rules)');
        assert.ok(mnopVisibility.shouldShowMNOP(scoring, undefined), 'Returns true when testModel is undefined (no branch rules)');
    });

    QUnit.test('getHiddenReason handles null/undefined gracefully', function(assert) {
        assert.expect(2);

        var reason1 = mnopVisibility.getHiddenReason(null, null);
        assert.ok(reason1.length > 0, 'Returns a reason message for null inputs');

        var reason2 = mnopVisibility.getHiddenReason(undefined, undefined);
        assert.ok(reason2.length > 0, 'Returns a reason message for undefined inputs');
    });

    QUnit.test('visible when testParts have no branchRules arrays', function(assert) {
        assert.expect(1);

        var scoring = {outcomeProcessing: 'total'};
        var testModel = {testParts: [{}]};

        assert.ok(mnopVisibility.shouldShowMNOP(scoring, testModel), 'MNOP should be visible when no branchRules arrays exist');
    });

    QUnit.test('hidden when any testPart has branch rules', function(assert) {
        assert.expect(1);

        var scoring = {outcomeProcessing: 'total'};
        var testModel = {testParts: [
            {branchRules: []},
            {branchRules: [{target: 'tp3', variable: 'SCORE', operator: 'lt', value: 10}]}
        ]};

        assert.notOk(mnopVisibility.shouldShowMNOP(scoring, testModel), 'MNOP should be hidden when any testPart has branch rules');
    });
});
