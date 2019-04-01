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
            var orBranchRule,
                branchRuleDefinition = {};

            data.branchRules.forEach(function(branchRule) {
                branchRuleDefinition[branchRule] = {};
            });

            orBranchRule = orBranchRuleFactory(branchRuleDefinition, null, null, mockBranchRuleMapper.getMockBranchRuleMapper);

            assert.expect(1);
            assert.equal(orBranchRule.validate(), true);
        });

    QUnit
        .cases
        .init([
            { branchRules: [mockBranchRuleMapper.MOCK_FALSE_BRANCH_RULE] },
            { branchRules: [mockBranchRuleMapper.MOCK_FALSE_BRANCH_RULE, mockBranchRuleMapper.MOCK_FALSE_BRANCH_RULE] },
            { branchRules: [mockBranchRuleMapper.MOCK_FALSE_BRANCH_RULE, mockBranchRuleMapper.MOCK_FALSE_BRANCH_RULE, mockBranchRuleMapper.MOCK_FALSE_BRANCH_RULE] }
        ])
        .test('it returns false if all the expressions are false', function(data, assert) {
            var orBranchRule,
                branchRuleDefinition = {};

            data.branchRules.forEach(function(branchRule) {
                branchRuleDefinition[branchRule] = {};
            });

            orBranchRule = orBranchRuleFactory(branchRuleDefinition, null, null, mockBranchRuleMapper.getMockBranchRuleMapper);

            assert.expect(1);
            assert.equal(orBranchRule.validate(), false);
        });
});
