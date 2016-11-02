define([
    'lodash',
    'taoQtiTest/runner/plugins/navigation/nextWarningHelper'
], function(_, warningHelper){
    'use strict';

    var defaultInput, defaultOutput, warnBeforeEndData, warnBeforeNextData;

    QUnit.module('warningHelper');

    QUnit.test('module', function(assert){
        QUnit.expect(1);

        assert.ok(typeof warningHelper === 'function', 'The module expose a function');
    });

    QUnit.test('bad parameters', function(assert){
        var validOptions = {
            endTestWarning:     false,
            isLast:             false,
            isLinear:           false,
            nextItemWarning:    false,
            nextPart:           { id: 'NEXT_PART', isLinear: false },
            remainingAttempts:  -1,
            testPartId:         'CURRENT_PART'
        };
        var invalidOptions;

        QUnit.expect(7);

        // check that options are valid
        warningHelper(validOptions);

        // remove each option at a time and try constructing the object
        invalidOptions = _.cloneDeep(validOptions);
        invalidOptions.endTestWarning = void 0;
        assert.throws(function () { warningHelper(invalidOptions); });

        invalidOptions = _.cloneDeep(validOptions);
        invalidOptions.isLast = void 0;
        assert.throws(function () { warningHelper(invalidOptions); });

        invalidOptions = _.cloneDeep(validOptions);
        invalidOptions.isLinear = void 0;
        assert.throws(function () { warningHelper(invalidOptions); });

        invalidOptions = _.cloneDeep(validOptions);
        invalidOptions.nextItemWarning = void 0;
        assert.throws(function () { warningHelper(invalidOptions); });

        invalidOptions = _.cloneDeep(validOptions);
        invalidOptions.nextPart = void 0;
        assert.throws(function () { warningHelper(invalidOptions); });

        invalidOptions = _.cloneDeep(validOptions);
        invalidOptions.remainingAttempts = void 0;
        assert.throws(function () { warningHelper(invalidOptions); });

        invalidOptions = _.cloneDeep(validOptions);
        invalidOptions.testPartId = void 0;
        assert.throws(function () { warningHelper(invalidOptions); });
    });

    QUnit.module('End test warning');

    defaultInput = {
        endTestWarning:     false,
        isLast:             false,
        isLinear:           false,
        nextItemWarning:    false,
        nextPart:           { id: 'NEXT_PART', isLinear: false },
        remainingAttempts:  -1,
        testPartId:         'CURRENT_PART'
    };

    defaultOutput = { warnNext: false, warnEnd: false };

    warnBeforeEndData = [
        {
            title: 'no warning',
            input:  defaultInput,
            output: defaultOutput
        },
        {
            title: 'End test warning option active, but test is not on the last item',
            input:  _.defaults({ endTestWarning: true }, defaultInput),
            output: defaultOutput
        },
        {
            title: 'End test warning active because test is on last item',
            input:  _.defaults({
                endTestWarning: true,
                isLast: true
            }, defaultInput),
            output: { warnNext: false, warnEnd: true }
        },
        {
            title: 'End test warning active because of the next item warning being active on the last item',
            input:  _.defaults({
                isLast: true,
                nextItemWarning: true,
                isLinear: true
            }, defaultInput),
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
            input:  defaultInput,
            output: { warnNext: false, warnEnd: false }
        },
        {
            title: 'Next item warning option is active, but nothing justifies the warning',
            input:  _.defaults({ nextItemWarning: true }, defaultInput),
            output: { warnNext: false, warnEnd: false }
        },
        {
            title: 'Warning is displayed if current item is the last',
            input:  _.defaults({
                nextItemWarning: true,
                isLast: true
            }, defaultInput),
            output: { warnNext: true, warnEnd: true }
        },
        {
            title: 'Warning is always displayed in a linear section',
            input:  _.defaults({
                nextItemWarning: true,
                isLinear: true
            }, defaultInput),
            output: { warnNext: true, warnEnd: false }
        },
        {
            title: 'Warning is displayed if on last attempt',
            input:  _.defaults({
                nextItemWarning: true,
                remainingAttempts: 0
            }, defaultInput),
            output: { warnNext: true, warnEnd: false }
        },
        {
            title: 'Warning is displayed if item has a limited number of attempts',
            input:  _.defaults({
                nextItemWarning: true,
                remainingAttempts: 12
            }, defaultInput),
            output: { warnNext: true, warnEnd: false }
        },
        {
            title: 'Warning is displayed if current part is non linear, but the next part is linear',
            input:  _.defaults({
                nextItemWarning: true,
                isLinear: false,
                nextPart: { id: 'NEXT_PART', isLinear: true }
            }, defaultInput),
            output: { warnNext: true, warnEnd: false }
        },
        {
            title: 'Warning is not displayed if current part is non linear, and next part is non linear too',
            input:  _.defaults({
                nextItemWarning: true,
                isLinear: false,
                nextPart: { id: 'NEXT_PART', isLinear: false }
            }, defaultInput),
            output: { warnNext: false, warnEnd: false }
        },
        {
            title: 'Warning is displayed if current part is linear, and next part is non linear',
            input:  _.defaults({
                nextItemWarning: true,
                isLinear: true,
                nextPart: { id: 'NEXT_PART', isLinear: false }
            }, defaultInput),
            output: { warnNext: true, warnEnd: false }
        },
        {
            title: 'Warning is not displayed if there is no part change on next action',
            input:  _.defaults({
                nextItemWarning: true,
                isLinear: false,
                nextPart: { id: 'CURRENT_PART', isLinear: false }
            }, defaultInput),
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
