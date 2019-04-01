define([
    'taoQtiTest/runner/branchRule/types/and',
    'taoQtiTest/test/runner/branchRule/mockBranchRuleMapper'
], function(
    andBranchRuleFactory,
    mockBranchRuleMapper
) {
    'use strict';

    QUnit
        .cases
        .init([
            { branchRules: [mockBranchRuleMapper.MOCK_TRUE_BRANCH_RULE] },
            { branchRules: [mockBranchRuleMapper.MOCK_TRUE_BRANCH_RULE, mockBranchRuleMapper.MOCK_TRUE_BRANCH_RULE] },
            { branchRules: [mockBranchRuleMapper.MOCK_TRUE_BRANCH_RULE, mockBranchRuleMapper.MOCK_TRUE_BRANCH_RULE, mockBranchRuleMapper.MOCK_TRUE_BRANCH_RULE] }
        ])
        .test('it returns true if all expressions are true', function(data, assert) {
            var orBranchRule,
                branchRuleDefinition = {};

            data.branchRules.forEach(function(branchRule) {
                branchRuleDefinition[branchRule] = {};
            });

            orBranchRule = andBranchRuleFactory(branchRuleDefinition, null, null, mockBranchRuleMapper.getMockBranchRuleMapper);

            assert.expect(1);
            assert.equal(orBranchRule.validate(), true);
        });

    QUnit
        .cases
        .init([
            { branchRules: [mockBranchRuleMapper.MOCK_TRUE_BRANCH_RULE, mockBranchRuleMapper.MOCK_FALSE_BRANCH_RULE] },
            { branchRules: [mockBranchRuleMapper.MOCK_FALSE_BRANCH_RULE, mockBranchRuleMapper.MOCK_TRUE_BRANCH_RULE] },
            { branchRules: [mockBranchRuleMapper.MOCK_TRUE_BRANCH_RULE, mockBranchRuleMapper.MOCK_TRUE_BRANCH_RULE, mockBranchRuleMapper.MOCK_FALSE_BRANCH_RULE] }
        ])
        .test('it returns false if at least one expression is false', function(data, assert) {
            var orBranchRule,
                branchRuleDefinition = {};

            data.branchRules.forEach(function(branchRule) {
                branchRuleDefinition[branchRule] = {};
            });

            orBranchRule = andBranchRuleFactory(branchRuleDefinition, null, null, mockBranchRuleMapper.getMockBranchRuleMapper);

            assert.expect(1);
            assert.equal(orBranchRule.validate(), false);
        });
});
