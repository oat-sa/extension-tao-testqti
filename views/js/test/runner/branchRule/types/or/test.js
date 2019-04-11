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
    'taoQtiTest/runner/branchRule/types/or',
    'taoQtiTest/test/runner/branchRule/mockBranchRuleMapper'
], function(
    orBranchRuleFactory,
    mockBranchRuleMapper
) {
    'use strict';

    QUnit
        .cases
        .init([
            { branchRules: [mockBranchRuleMapper.MOCK_TRUE_BRANCH_RULE, mockBranchRuleMapper.MOCK_FALSE_BRANCH_RULE] },
            { branchRules: [mockBranchRuleMapper.MOCK_FALSE_BRANCH_RULE, mockBranchRuleMapper.MOCK_TRUE_BRANCH_RULE] },
            { branchRules: [mockBranchRuleMapper.MOCK_TRUE_BRANCH_RULE, mockBranchRuleMapper.MOCK_TRUE_BRANCH_RULE] },
            { branchRules: [mockBranchRuleMapper.MOCK_TRUE_BRANCH_RULE, mockBranchRuleMapper.MOCK_TRUE_BRANCH_RULE, mockBranchRuleMapper.MOCK_FALSE_BRANCH_RULE] }
        ])
        .test('it returns true if at least one expression is true', function(data, assert) {
            var done = assert.async(),
                branchRuleDefinition = {};

            data.branchRules.forEach(function(branchRule) {
                branchRuleDefinition[branchRule] = {};
            });

            orBranchRuleFactory(branchRuleDefinition, null, null, mockBranchRuleMapper.getMockBranchRuleMapper)
                .validate()
                .then(function(result) {
                    assert.expect(1);
                    assert.equal(result, true);
                    done();
                });
        });

    QUnit
        .cases
        .init([
            { branchRules: [mockBranchRuleMapper.MOCK_FALSE_BRANCH_RULE] },
            { branchRules: [mockBranchRuleMapper.MOCK_FALSE_BRANCH_RULE, mockBranchRuleMapper.MOCK_FALSE_BRANCH_RULE] },
            { branchRules: [mockBranchRuleMapper.MOCK_FALSE_BRANCH_RULE, mockBranchRuleMapper.MOCK_FALSE_BRANCH_RULE, mockBranchRuleMapper.MOCK_FALSE_BRANCH_RULE] }
        ])
        .test('it returns false if all the expressions are false', function(data, assert) {
            var done = assert.async(),
                branchRuleDefinition = {};

            data.branchRules.forEach(function(branchRule) {
                branchRuleDefinition[branchRule] = {};
            });

            orBranchRuleFactory(branchRuleDefinition, null, null, mockBranchRuleMapper.getMockBranchRuleMapper)
                .validate()
                .then(function(result) {
                    assert.expect(1);
                    assert.equal(result, false);
                    done();
                });
        });
});
