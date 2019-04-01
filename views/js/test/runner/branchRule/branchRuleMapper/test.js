define([
    'taoQtiTest/runner/branchRule/branchRuleMapper'
], function(
    branchRuleMapper
) {
    'use strict';

    var mockBranchRuleDefinition = {
        variable: { '@attributes': { identifier: 'test' } },
        correct:  { '@attributes': { identifier: 'test' } }
    };

    QUnit
        .cases
        .init([
            { branchRuleName: 'match' },
            { branchRuleName: 'or' },
            { branchRuleName: 'and' },
            { branchRuleName: 'not' }
        ])
        .test('it returns the proper branch rule component', function(data, assert) {
            assert.expect(2);
            assert.equal(typeof branchRuleMapper(data.branchRuleName, mockBranchRuleDefinition), 'object');
            assert.equal(typeof branchRuleMapper(data.branchRuleName, mockBranchRuleDefinition)['validate'], 'function');
        });

    QUnit.test('it throws error when it get called with a non-existing branch rule', function(assert) {
        assert.expect(1);
        assert.throws(
            function() {
                branchRuleMapper('foobar');
            },
            new Error('Invalid branch rule name: foobar')
        );
    });
});
