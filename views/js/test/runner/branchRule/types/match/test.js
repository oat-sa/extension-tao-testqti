define([
    'taoQtiTest/runner/branchRule/types/match',
    'taoQtiTest/runner/proxy/offline/responseStore',
], function(
    matchBranchRuleFactory,
    responseStore
) {
    responseStore.addResponse('R1', 'test');
    responseStore.addCorrectResponse('R1', ['test', 'foo', 'bar']);

    responseStore.addResponse('R2', 'foo');
    responseStore.addCorrectResponse('R2', ['a', 'b', 'c']);

    QUnit.test('it returns true if the matching is correct', function(assert) {
        QUnit.expect(1);

        var branchRuleDefintion = {
            'variable': { '@attributes': { 'identifier': 'R1' } },
            'match':    { '@attributes': { 'identifier': 'R1' } },
        };

        var matchBranchRule = matchBranchRuleFactory(branchRuleDefintion, null, null, null, responseStore);

        assert.equal(true, matchBranchRule.validate());
    });

    QUnit.test('it returns true if the matching is correct (different answer)', function(assert) {
        QUnit.expect(1);

        var branchRuleDefintion = {
            'variable': { '@attributes': { 'identifier': 'R2' } },
            'match':    { '@attributes': { 'identifier': 'R1' } },
        };

        var matchBranchRule = matchBranchRuleFactory(branchRuleDefintion, null, null, null, responseStore);

        assert.equal(true, matchBranchRule.validate());
    });

    QUnit.test('it returns false if the responses are not exist', function(assert) {
        QUnit.expect(1);

        var branchRuleDefintion = {
            'variable': { '@attributes': { 'identifier': 'test' } },
            'match':    { '@attributes': { 'identifier': 'test' } },
        };

        var matchBranchRule = matchBranchRuleFactory(branchRuleDefintion, null, null, null, responseStore);

        assert.equal(false, matchBranchRule.validate());
    });

    QUnit.test('it returns false if the response is incorrect', function(assert) {
        QUnit.expect(1);

        var branchRuleDefintion = {
            'variable': { '@attributes': { 'identifier': 'R2' } },
            'match':    { '@attributes': { 'identifier': 'R2' } },
        };

        var matchBranchRule = matchBranchRuleFactory(branchRuleDefintion, null, null, null, responseStore);

        assert.equal(false, matchBranchRule.validate());
    });

    QUnit.test('it returns false if the responses are not matching', function(assert) {
        QUnit.expect(1);

        var branchRuleDefintion = {
            'variable': { '@attributes': { 'identifier': 'R1' } },
            'match':    { '@attributes': { 'identifier': 'R2' } },
        };

        var matchBranchRule = matchBranchRuleFactory(branchRuleDefintion, null, null, null, responseStore);

        assert.equal(false, matchBranchRule.validate());
    });
});
