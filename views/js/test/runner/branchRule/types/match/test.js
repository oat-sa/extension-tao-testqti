define([
    'taoQtiTest/runner/branchRule/types/match',
    'taoQtiTest/runner/proxy/offline/responseStore'
], function(
    matchBranchRuleFactory,
    responseStore
) {
    'use strict';

    responseStore.addResponse('R1', 'test');
    responseStore.addCorrectResponse('R1', ['test', 'foo', 'bar']);

    responseStore.addResponse('R2', 'foo');
    responseStore.addCorrectResponse('R2', ['a', 'b', 'c']);

    QUnit.test('it returns true if the matching is correct', function(assert) {
        var branchRuleDefinition = {
            'variable': { '@attributes': { 'identifier': 'R1' } },
            'correct':  { '@attributes': { 'identifier': 'R1' } }
        };
        var matchBranchRule = matchBranchRuleFactory(branchRuleDefinition, null, null, null, responseStore);

        assert.expect(1);
        assert.equal(true, matchBranchRule.validate());
    });

    QUnit.test('it returns true if the matching is correct (different answer)', function(assert) {
        var branchRuleDefinition = {
            'variable': { '@attributes': { 'identifier': 'R2' } },
            'correct':  { '@attributes': { 'identifier': 'R1' } }
        };
        var matchBranchRule = matchBranchRuleFactory(branchRuleDefinition, null, null, null, responseStore);

        assert.expect(1);
        assert.equal(true, matchBranchRule.validate());
    });

    QUnit.test('it returns false if the responses are not exist', function(assert) {
        var branchRuleDefinition = {
            'variable': { '@attributes': { 'identifier': 'test' } },
            'correct':  { '@attributes': { 'identifier': 'test' } }
        };
        var matchBranchRule = matchBranchRuleFactory(branchRuleDefinition, null, null, null, responseStore);

        assert.expect(1);
        assert.equal(false, matchBranchRule.validate());
    });

    QUnit.test('it returns false if the response is incorrect', function(assert) {
        var branchRuleDefinition = {
            'variable': { '@attributes': { 'identifier': 'R2' } },
            'correct':  { '@attributes': { 'identifier': 'R2' } }
        };
        var matchBranchRule = matchBranchRuleFactory(branchRuleDefinition, null, null, null, responseStore);

        assert.expect(1);
        assert.equal(false, matchBranchRule.validate());
    });

    QUnit.test('it returns false if the responses are not matching', function(assert) {
        var branchRuleDefinition = {
            'variable': { '@attributes': { 'identifier': 'R1' } },
            'correct':  { '@attributes': { 'identifier': 'R2' } }
        };
        var matchBranchRule = matchBranchRuleFactory(branchRuleDefinition, null, null, null, responseStore);

        assert.expect(1);
        assert.equal(false, matchBranchRule.validate());
    });
});
