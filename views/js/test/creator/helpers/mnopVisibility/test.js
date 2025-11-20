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
 * Copyright (c) 2025 (original work) Open Assessment Technologies SA;
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
        var testMeta = {branchRules: false};

        assert.ok(mnopVisibility.shouldShowMNOP(scoring, testMeta), 'MNOP should be visible for total score');
    });

    QUnit.test('visible for Cut score, no branch rules', function(assert) {
        assert.expect(1);

        var scoring = {outcomeProcessing: 'cut'};
        var testMeta = {branchRules: false};

        assert.ok(mnopVisibility.shouldShowMNOP(scoring, testMeta), 'MNOP should be visible for cut score');
    });

    QUnit.test('hidden for None outcome processing', function(assert) {
        assert.expect(1);

        var scoring = {outcomeProcessing: 'none'};
        var testMeta = {branchRules: false};

        assert.notOk(mnopVisibility.shouldShowMNOP(scoring, testMeta), 'MNOP should be hidden for none outcome processing');
    });

    QUnit.test('hidden for Custom outcome processing', function(assert) {
        assert.expect(1);

        var scoring = {outcomeProcessing: 'custom'};
        var testMeta = {branchRules: false};

        assert.notOk(mnopVisibility.shouldShowMNOP(scoring, testMeta), 'MNOP should be hidden for custom outcome processing');
    });

    QUnit.test('hidden for Grade outcome processing', function(assert) {
        assert.expect(1);

        var scoring = {outcomeProcessing: 'grade'};
        var testMeta = {branchRules: false};

        assert.notOk(mnopVisibility.shouldShowMNOP(scoring, testMeta), 'MNOP should be hidden for grade outcome processing');
    });

    QUnit.test('hidden when branch rules present', function(assert) {
        assert.expect(1);

        var scoring = {outcomeProcessing: 'total'};
        var testMeta = {branchRules: true};

        assert.notOk(mnopVisibility.shouldShowMNOP(scoring, testMeta), 'MNOP should be hidden when branch rules are present');
    });

    QUnit.test('visible when only preconditions present', function(assert) {
        assert.expect(2);

        var scoring = {outcomeProcessing: 'total'};
        var testMeta = {branchRules: false, preConditions: true};

        assert.ok(mnopVisibility.shouldShowMNOP(scoring, testMeta), 'MNOP should be visible when only preconditions present');
        assert.equal(mnopVisibility.getHiddenReason(scoring, testMeta), '', 'No hidden reason when visible');
    });

    QUnit.test('getHiddenReason returns correct messages for outcome processing', function(assert) {
        assert.expect(3);

        var scoring1 = {outcomeProcessing: 'none'};
        var testMeta1 = {branchRules: false};
        var reason1 = mnopVisibility.getHiddenReason(scoring1, testMeta1);
        assert.ok(reason1.includes('Total score or Cut score'), 'Reason mentions required outcome processing modes');

        var scoring2 = {outcomeProcessing: 'custom'};
        var testMeta2 = {branchRules: false};
        var reason2 = mnopVisibility.getHiddenReason(scoring2, testMeta2);
        assert.ok(reason2.includes('Total score or Cut score'), 'Reason for custom also mentions required modes');

        var scoring3 = {outcomeProcessing: 'grade'};
        var testMeta3 = {branchRules: false};
        var reason3 = mnopVisibility.getHiddenReason(scoring3, testMeta3);
        assert.ok(reason3.includes('Total score or Cut score'), 'Reason for grade also mentions required modes');
    });

    QUnit.test('getHiddenReason returns correct message for branch rules', function(assert) {
        assert.expect(1);

        var scoring = {outcomeProcessing: 'total'};
        var testMeta = {branchRules: true};
        var reason = mnopVisibility.getHiddenReason(scoring, testMeta);

        assert.ok(reason.includes('branch rules'), 'Reason mentions branch rules when they are present');
    });

    QUnit.test('handles missing scoring object', function(assert) {
        assert.expect(2);

        var testMeta = {branchRules: false};

        assert.notOk(mnopVisibility.shouldShowMNOP(null, testMeta), 'Returns false when scoring is null');
        assert.notOk(mnopVisibility.shouldShowMNOP(undefined, testMeta), 'Returns false when scoring is undefined');
    });

    QUnit.test('handles missing testMeta object', function(assert) {
        assert.expect(2);

        var scoring = {outcomeProcessing: 'total'};

        assert.notOk(mnopVisibility.shouldShowMNOP(scoring, null), 'Returns false when testMeta is null');
        assert.notOk(mnopVisibility.shouldShowMNOP(scoring, undefined), 'Returns false when testMeta is undefined');
    });

    QUnit.test('getHiddenReason handles null/undefined gracefully', function(assert) {
        assert.expect(2);

        var reason1 = mnopVisibility.getHiddenReason(null, null);
        assert.ok(reason1.length > 0, 'Returns a reason message for null inputs');

        var reason2 = mnopVisibility.getHiddenReason(undefined, undefined);
        assert.ok(reason2.length > 0, 'Returns a reason message for undefined inputs');
    });

    QUnit.test('visible when branchRules is undefined (not explicitly set)', function(assert) {
        assert.expect(1);

        var scoring = {outcomeProcessing: 'total'};
        var testMeta = {}; // branchRules not set

        assert.ok(mnopVisibility.shouldShowMNOP(scoring, testMeta), 'MNOP should be visible when branchRules is undefined');
    });
});
