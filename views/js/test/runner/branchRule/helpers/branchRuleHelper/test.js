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
        var branchRuleDefinition = {};

        branchRuleDefinition['@attributes'] = {};
        branchRuleDefinition[mockBranchRuleMapper.MOCK_TRUE_BRANCH_RULE] = {};

        assert.expect(1);
        assert.deepEqual(
            branchRuleHelper.evaluateSubBranchRules(
                branchRuleDefinition,
                null,
                null,
                mockBranchRuleMapper.getMockBranchRuleMapper
            ), [true]
        );
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
            var branchRuleDefinition = {};

            data.branchRules.forEach(function(branchRule) {
                branchRuleDefinition[branchRule] = {};
            });

            assert.expect(1);
            assert.deepEqual(
                branchRuleHelper.evaluateSubBranchRules(
                    branchRuleDefinition,
                    null,
                    null,
                    mockBranchRuleMapper.getMockBranchRuleMapper
                ), data.result
            );
        });
});
