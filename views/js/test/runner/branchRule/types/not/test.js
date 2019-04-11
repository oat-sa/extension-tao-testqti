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
    'taoQtiTest/runner/branchRule/types/not',
    'taoQtiTest/test/runner/branchRule/mockBranchRuleMapper'
], function(
    notBranchRuleFactory,
    mockBranchRuleMapper
) {
    'use strict';

    QUnit
        .cases
        .init([
            { branchRules: [mockBranchRuleMapper.MOCK_TRUE_BRANCH_RULE], result: [false] },
            { branchRules: [mockBranchRuleMapper.MOCK_FALSE_BRANCH_RULE], result: [true] },
            { branchRules: [mockBranchRuleMapper.MOCK_TRUE_BRANCH_RULE,  mockBranchRuleMapper.MOCK_FALSE_BRANCH_RULE], result: [false, true] },
            { branchRules: [mockBranchRuleMapper.MOCK_FALSE_BRANCH_RULE, mockBranchRuleMapper.MOCK_TRUE_BRANCH_RULE],  result: [true, false] },
            { branchRules: [mockBranchRuleMapper.MOCK_TRUE_BRANCH_RULE,  mockBranchRuleMapper.MOCK_TRUE_BRANCH_RULE],  result: [false, false] },
            { branchRules: [mockBranchRuleMapper.MOCK_FALSE_BRANCH_RULE, mockBranchRuleMapper.MOCK_FALSE_BRANCH_RULE], result: [true, true] },
            {
                branchRules: [mockBranchRuleMapper.MOCK_TRUE_BRANCH_RULE, mockBranchRuleMapper.MOCK_TRUE_BRANCH_RULE, mockBranchRuleMapper.MOCK_FALSE_BRANCH_RULE],
                result: [false, false, true]
            }
        ])
        .test('it will return an array with the negated value of the branch rule expressions', function(data, assert) {
            var done = assert.async(),
                branchRuleDefinition = [];

            data.branchRules.forEach(function(branchRule) {
                var definition = {};

                definition[branchRule] = {};

                branchRuleDefinition.push(definition);
            });

            notBranchRuleFactory(branchRuleDefinition, null, null, mockBranchRuleMapper.getMockBranchRuleMapper)
                .validate()
                .then(function(result) {
                    assert.expect(1);
                    assert.deepEqual(result, data.result);
                    done();
                });
        });

    QUnit
        .cases
        .init([
            { branchRule: mockBranchRuleMapper.MOCK_TRUE_BRANCH_RULE, result: [false] },
            { branchRule: mockBranchRuleMapper.MOCK_FALSE_BRANCH_RULE, result: [true] }
        ])
        .test('it casts the non-array definitions into arrays', function(data, assert) {
            var done = assert.async(),
                branchRuleDefinition = {};

            branchRuleDefinition[data.branchRule] = {};

            notBranchRuleFactory(branchRuleDefinition, null, null, mockBranchRuleMapper.getMockBranchRuleMapper)
                .validate()
                .then(function(result) {
                    assert.expect(1);
                    assert.deepEqual(result, data.result);
                    done();
                });
        });
});
