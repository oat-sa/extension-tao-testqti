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
    'taoQtiTest/runner/branchRule/helpers/branchRuleHelper',
    'taoQtiTest/test/runner/branchRule/mockBranchRuleMapper'
], function(
    branchRuleHelper,
    mockBranchRuleMapper
) {
    'use strict';

    QUnit.test('it has evaluateSubBranchRules() function', function(assert) {
        assert.expect(1);
        assert.equal(typeof branchRuleHelper['evaluateSubBranchRules'], 'function');
    });

    QUnit.test('it omits the @attributes', function(assert) {
        var done = assert.async();
        var branchRuleDefinition = {};

        branchRuleDefinition['@attributes'] = {};
        branchRuleDefinition[mockBranchRuleMapper.MOCK_TRUE_BRANCH_RULE] = {};

        branchRuleHelper.evaluateSubBranchRules(
            branchRuleDefinition,
            null,
            null,
            mockBranchRuleMapper.getMockBranchRuleMapper
        ).then(function(result) {
            assert.expect(1);
            assert.deepEqual(result, [true]);
            done();
        });
    });

    QUnit
        .cases
        .init([
            { branchRules: [mockBranchRuleMapper.MOCK_TRUE_BRANCH_RULE], result: [true] },
            { branchRules: [mockBranchRuleMapper.MOCK_FALSE_BRANCH_RULE], result: [false] },
            { branchRules: [mockBranchRuleMapper.MOCK_TRUE_BRANCH_RULE, mockBranchRuleMapper.MOCK_FALSE_BRANCH_RULE], result: [true, false] },
            { branchRules: [mockBranchRuleMapper.MOCK_ARRAY_BRANCH_RULE], result: [true, false] }
        ])
        .test('it returns the proper branching rule', function(data, assert) {
            var done = assert.async();
            var branchRuleDefinition = {};

            data.branchRules.forEach(function(branchRule) {
                branchRuleDefinition[branchRule] = {};
            });

            branchRuleHelper.evaluateSubBranchRules(
                branchRuleDefinition,
                null,
                null,
                mockBranchRuleMapper.getMockBranchRuleMapper
            ).then(function(result) {
                assert.expect(1);
                assert.deepEqual(result, data.result);
                done();
            });
        });
});
