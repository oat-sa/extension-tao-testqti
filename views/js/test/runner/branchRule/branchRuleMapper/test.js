define([
    'taoQtiTest/runner/branchRule/branchRuleMapper',
], function(
    branchRuleMapper
) {

    QUnit
        .cases([
            { branchRule: 'match', expectedResult: 'match' },
            { branchRule: 'and', expectedResult: 'and' },
            { branchRule: 'or', expectedResult: 'or' },
            { branchRule: 'not', expectedResult: 'not' },
        ])
        .test('it returns the proper branch rule', function(params, assert) {
            QUnit.expect(1);
            assert.equal(branchRuleMapper(params.branchRule), params.expectedResult);
        });

    QUnit.test('it returns error in case of non-existing branch rule', function(assert) {
        QUnit.expect(1);
        assert.throws(
            function() {
                branchRuleMapper('test');
            }
        );
    });
});
