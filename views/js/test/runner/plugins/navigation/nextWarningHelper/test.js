define([
    'lodash',
    'taoQtiTest/runner/plugins/navigation/next/nextWarningHelper'
], function(_, warningHelper){
    'use strict';

    var warnBeforeEndData, warnBeforeNextData;

    QUnit.module('warningHelper');

    QUnit.test('module', function(assert){
        QUnit.expect(1);

        assert.ok(typeof warningHelper === 'function', 'The module expose a function');
    });

    QUnit.module('End test warning');

    warnBeforeEndData = [
        {
            title: 'no warning',
            input:  {},
            output: { warnNext: false, warnEnd: false }
        },
        {
            title: 'End test warning option active, but test is not on the last item',
            input: { endTestWarning: true },
            output: { warnNext: false, warnEnd: false }
        },
        {
            title: 'End test warning active because test is on last item',
            input: {
                endTestWarning: true,
                isLast: true
            },
            output: { warnNext: false, warnEnd: true }
        },
        {
            title: 'Unanswered Items Warning option active, no other conditions fulfilled',
            input: { unansweredWarning: true },
            output: { warnNext: false, warnEnd: false }
        },
        {
            title: 'Unanswered Items Warning option active, test is on the last item, but no stats',
            input: {
                unansweredWarning: true,
                isLast: true
            },
            output: { warnNext: false, warnEnd: false }
        },
        {
            title: 'Unanswered Items warning active, last item, but no unanswered items',
            input: {
                unansweredWarning: true,
                stats: { flagged: 0, questions: 10, answered: 10 },
                isLast: true
            },
            output: { warnNext: false, warnEnd: false }
        },
        {
            title: 'Unanswered Items warning active, last item, flagged items',
            input: {
                unansweredWarning: true,
                stats: { flagged: 5 },
                isLast: true
            },
            output: { warnNext: false, warnEnd: true }
        },
        {
            title: 'Unanswered Items warning active, last item, unanswered items',
            input: {
                unansweredWarning: true,
                stats: { questions: 10, answered: 5 },
                isLast: true
            },
            output: { warnNext: false, warnEnd: true }
        },
        {
            title: 'Unanswered Items warning active, last item, unanswered & flagged items',
            input: {
                unansweredWarning: true,
                stats: { flagged: 5, questions: 10, answered: 5 },
                isLast: true
            },
            output: { warnNext: false, warnEnd: true }
        },
        {
            title: 'End test warning active because of the next item warning being active on the last item',
            input: {
                isLast: true,
                nextItemWarning: true,
                isLinear: true
            },
            output: { warnEnd: true, warnNext: true }
        }
    ];


    QUnit
        .cases(warnBeforeEndData)
        .test('End test warning', function(data, assert){
            var helper = warningHelper(data.input);

            QUnit.expect(2);

            assert.ok(helper.shouldWarnBeforeEnd()  === data.output.warnEnd,  'shouldWarnBeforeEnd returns the correct value');
            assert.ok(helper.shouldWarnBeforeNext() === data.output.warnNext, 'shouldWarnBeforeNext returns the correct value');
        });


    QUnit.module('Next item warning');

    warnBeforeNextData = [
        {
            title: 'no warning',
            input: {},
            output: { warnNext: false, warnEnd: false }
        },
        {
            title: 'Next item warning option is active, but nothing justifies the warning',
            input: { nextItemWarning: true },
            output: { warnNext: false, warnEnd: false }
        },
        {
            title: 'Warning is displayed if current item is the last',
            input: {
                nextItemWarning: true,
                isLast: true
            },
            output: { warnNext: true, warnEnd: true }
        },
        {
            title: 'Warning is always displayed in a linear section',
            input: {
                nextItemWarning: true,
                isLinear: true
            },
            output: { warnNext: true, warnEnd: false }
        },
        {
            title: 'Warning is displayed if on last attempt',
            input: {
                nextItemWarning: true,
                remainingAttempts: 0
            },
            output: { warnNext: true, warnEnd: false }
        },
        {
            title: 'Warning is displayed if item has a limited number of attempts',
            input: {
                nextItemWarning: true,
                remainingAttempts: 12
            },
            output: { warnNext: true, warnEnd: false }
        },
        {
            title: 'Warning is displayed if current part is non linear, but the next part is linear',
            input: {
                nextItemWarning: true,
                isLinear: false,
                nextPart: { id: 'NEXT_PART', isLinear: true }
            },
            output: { warnNext: true, warnEnd: false }
        },
        {
            title: 'Warning is not displayed if current part is non linear, and next part is non linear too',
            input: {
                nextItemWarning: true,
                isLinear: false,
                nextPart: { id: 'NEXT_PART', isLinear: false }
            },
            output: { warnNext: false, warnEnd: false }
        },
        {
            title: 'Warning is displayed if current part is linear, and next part is non linear',
            input: {
                nextItemWarning: true,
                isLinear: true,
                nextPart: { id: 'NEXT_PART', isLinear: false }
            },
            output: { warnNext: true, warnEnd: false }
        },
        {
            title: 'Warning is not displayed if there is no part change on next action',
            input: {
                nextItemWarning: true,
                isLinear: false,
                nextPart: { id: 'CURRENT_PART', isLinear: false }
            },
            output: { warnNext: false, warnEnd: false }
        }
    ];

    QUnit
        .cases(warnBeforeNextData)
        .test('Next item warning', function(data, assert){
            var helper = warningHelper(data.input);

            QUnit.expect(2);

            assert.ok(helper.shouldWarnBeforeEnd()  === data.output.warnEnd,  'shouldWarnBeforeEnd returns the correct value');
            assert.ok(helper.shouldWarnBeforeNext() === data.output.warnNext, 'shouldWarnBeforeNext returns the correct value');
        });

});
