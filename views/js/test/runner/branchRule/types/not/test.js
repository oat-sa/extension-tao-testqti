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
            var notBranchRule,
                branchRuleDefinition = [];

            data.branchRules.forEach(function(branchRule) {
                var definition = {};

                definition[branchRule] = {};

                branchRuleDefinition.push(definition);
            });

            notBranchRule = notBranchRuleFactory(branchRuleDefinition, null, null, mockBranchRuleMapper.getMockBranchRuleMapper);

            assert.expect(1);
            assert.deepEqual(notBranchRule.validate(), data.result);
        });

    QUnit
        .cases
        .init([
            { branchRule: mockBranchRuleMapper.MOCK_TRUE_BRANCH_RULE, result: [false] },
            { branchRule: mockBranchRuleMapper.MOCK_FALSE_BRANCH_RULE, result: [true] }
        ])
        .test('it casts the non-array definitions into arrays', function(data, assert) {
            var notBranchRule,
                branchRuleDefinition = {};

            branchRuleDefinition[data.branchRule] = {};

            notBranchRule = notBranchRuleFactory(branchRuleDefinition, null, null, mockBranchRuleMapper.getMockBranchRuleMapper);

            assert.expect(1);
            assert.deepEqual(notBranchRule.validate(), data.result);
        });
});
