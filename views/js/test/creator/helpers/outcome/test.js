/**
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU General Public License
 * as published by the Free Software Foundation; under version 2
 * of the License (non-upgradable).
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program; if not, write to the Free Software
 * Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301, USA.
 *
 * Copyright (c) 2017 (original work) Open Assessment Technologies SA ;
 */
/**
 * @author Jean-Sébastien Conan <jean-sebastien@taotesting.com>
 */
define([
    'lodash',
    'taoQtiTest/controller/creator/helpers/outcome',
    'json!taoQtiTest/test/creator/samples/outcomes.json'
], function (_,
             outcomeHelper,
             testModelSample) {
    'use strict';

    var createOutcomeCases, createOutcomeErrorCases;
    var addOutcomeProcessingCases, addOutcomeProcessingErrorCases;
    var addOutcomeCases, addOutcomeErrorCases;
    var replaceOutcomesCases, replaceOutcomesErrorCases;
    var outcomeHelperApi = [
        {title: 'getProcessingRuleExpression'},
        {title: 'getProcessingRuleProperty'},
        {title: 'getOutcomeDeclarations'},
        {title: 'getOutcomeProcessingRules'},
        {title: 'eachOutcomeDeclarations'},
        {title: 'eachOutcomeProcessingRules'},
        {title: 'eachOutcomeProcessingRuleExpressions'},
        {title: 'listOutcomes'},
        {title: 'removeOutcomes'},
        {title: 'createOutcome'},
        {title: 'addOutcomeProcessing'},
        {title: 'addOutcome'},
        {title: 'replaceOutcomes'}
    ];


    QUnit.module('helpers/outcome');


    QUnit.test('module', function (assert) {
        QUnit.expect(1);
        assert.equal(typeof outcomeHelper, 'object', "The outcome helper module exposes an object");
    });


    QUnit
        .cases(outcomeHelperApi)
        .test('helpers/outcome API ', function (data, assert) {
            QUnit.expect(1);
            assert.equal(typeof outcomeHelper[data.title], 'function', 'The outcome helper exposes a "' + data.title + '" function');
        });


    QUnit.test('helpers/outcome.getProcessingRuleExpression()', function (assert) {
        QUnit.expect(4);
        outcomeHelper.eachOutcomeProcessingRules(testModelSample, function (outcomeRule) {
            var expression = outcomeHelper.getProcessingRuleExpression(outcomeRule, 'setOutcomeValue.gte.divide.sum.testVariables');
            if (expression) {
                assert.equal(typeof expression, 'object', 'An expression has been found from the outcome');
                assert.equal(expression['qti-type'], 'testVariables', 'An expression has been found from the outcome');
            }
        });
    });


    QUnit.test('helpers/outcome.getProcessingRuleProperty()', function (assert) {
        var expectedValues = [70, 70];
        var values = _(outcomeHelper.getOutcomeProcessingRules(testModelSample)).map(function (outcomeRule) {
            return outcomeHelper.getProcessingRuleProperty(outcomeRule, 'setOutcomeValue.gte.baseValue.value');
        }).compact().value();

        QUnit.expect(1);
        assert.deepEqual(values, expectedValues, 'The outcome helper returns the right property value');
    });


    QUnit.test('helpers/outcome.getOutcomeDeclarations()', function (assert) {
        var testModel = _.cloneDeep(testModelSample);
        QUnit.expect(2);
        assert.equal(outcomeHelper.getOutcomeDeclarations(testModel), testModel.outcomeDeclarations, 'The outcome helper returns the right outcome declarations');

        testModel.outcomeDeclarations = null;
        assert.deepEqual(outcomeHelper.getOutcomeDeclarations(testModel), [], 'The outcome helper returns the right outcome declarations');
    });


    QUnit.test('helpers/outcome.getOutcomeProcessingRules()', function (assert) {
        var testModel = _.cloneDeep(testModelSample);
        QUnit.expect(2);
        assert.equal(outcomeHelper.getOutcomeProcessingRules(testModel), testModel.outcomeProcessing.outcomeRules, 'The outcome helper returns the right outcome processing rules');

        testModel.outcomeProcessing.outcomeRules = null;
        assert.deepEqual(outcomeHelper.getOutcomeProcessingRules(testModel), [], 'The outcome helper returns the right outcome processing rules');
    });


    QUnit.test('helpers/outcome.eachOutcomeDeclarations()', function (assert) {
        var path = ['SCORE_MATH', 'SCORE_HISTORY', 'PASS_MATH', 'PASS_HISTORY'];
        var pointer = 0;

        outcomeHelper.eachOutcomeDeclarations(testModelSample, function (outcome) {
            assert.equal(outcome.identifier, path[pointer], 'The outcome helper loop over the right declaration');
            pointer++;
        });

        QUnit.expect(1 + path.length);

        assert.equal(pointer, path.length, 'The outcome helper returns the right declarations');
    });


    QUnit.test('helpers/outcome.eachOutcomeProcessingRules()', function (assert) {
        var path = ['SCORE_MATH', 'SCORE_HISTORY', 'PASS_MATH', 'PASS_HISTORY'];
        var pointer = 0;

        outcomeHelper.eachOutcomeProcessingRules(testModelSample, function (outcome) {
            assert.equal(outcome.identifier, path[pointer], 'The outcome helper loop over the right rule');
            pointer++;
        });

        QUnit.expect(1 + path.length);

        assert.equal(pointer, path.length, 'The outcome helper returns the right rules');
    });


    QUnit.test('helpers/outcome.eachOutcomeProcessingRuleExpressions()', function (assert) {
        var path = [
            'setOutcomeValue', 'sum', 'testVariables',
            'setOutcomeValue', 'sum', 'testVariables',
            'setOutcomeValue', 'gte', 'divide', 'sum', 'testVariables', 'numberPresented', 'baseValue',
            'setOutcomeValue', 'gte', 'divide', 'sum', 'testVariables', 'numberPresented', 'baseValue'
        ];
        var pointer = 0;

        outcomeHelper.eachOutcomeProcessingRuleExpressions(testModelSample, function (outcome) {
            assert.equal(outcome['qti-type'], path[pointer], 'The outcome helper loop over the right rule');
            pointer++;
        });

        QUnit.expect(1 + path.length);

        assert.equal(pointer, path.length, 'The outcome helper returns the right rules');
    });


    QUnit.test('helpers/outcome.listOutcomes()', function (assert) {
        var expectedOutcomes = ['SCORE_MATH', 'SCORE_HISTORY', 'PASS_MATH', 'PASS_HISTORY'];
        var outcomes = outcomeHelper.listOutcomes(testModelSample);

        outcomes.sort();
        expectedOutcomes.sort();

        QUnit.expect(1);

        assert.deepEqual(outcomes, expectedOutcomes, 'The outcome helper returns the right outcomes');
    });


    QUnit.test('helpers/outcome.listOutcomes(callback)', function (assert) {
        var expectedOutcomes = ['SCORE_MATH', 'SCORE_HISTORY'];
        var outcomes = outcomeHelper.listOutcomes(testModelSample, function (outcome) {
            return outcome.identifier.indexOf('SCORE_') === 0;
        });

        outcomes.sort();
        expectedOutcomes.sort();

        QUnit.expect(1);

        assert.deepEqual(outcomes, expectedOutcomes, 'The outcome helper returns the right outcomes');
    });


    QUnit.test('helpers/outcome.removeOutcomes() #list', function (assert) {
        var testModel = _.cloneDeep(testModelSample);
        var outcomeToRemove = 'SCORE_MATH';
        var countDeclarations = testModel.outcomeDeclarations.length;
        var countRules = testModel.outcomeProcessing.outcomeRules.length;

        QUnit.expect(6);

        assert.equal(testModel.outcomeDeclarations[0].identifier, outcomeToRemove, 'There is an outcome declaration');
        assert.equal(testModel.outcomeProcessing.outcomeRules[0].identifier, outcomeToRemove, 'There is an outcome rule');

        outcomeHelper.removeOutcomes(testModel, 'SCORE_MATH');

        assert.notEqual(testModel.outcomeDeclarations[0].identifier, outcomeToRemove, 'The outcome declaration has been removed');
        assert.notEqual(testModel.outcomeProcessing.outcomeRules[0].identifier, outcomeToRemove, 'The outcome rule has been removed');

        assert.equal(testModel.outcomeDeclarations.length, countDeclarations - 1, 'The number of outcomes declarations is accurate');
        assert.equal(testModel.outcomeProcessing.outcomeRules.length, countRules - 1, 'The number of outcomes rules is accurate');
    });


    QUnit.test('helpers/outcome.removeOutcomes() #callback', function (assert) {
        var testModel = _.cloneDeep(testModelSample);
        var outcomeToRemove = 'SCORE_MATH';
        var countDeclarations = testModel.outcomeDeclarations.length;
        var countRules = testModel.outcomeProcessing.outcomeRules.length;

        QUnit.expect(6);

        assert.equal(testModel.outcomeDeclarations[0].identifier, outcomeToRemove, 'There is an outcome declaration');
        assert.equal(testModel.outcomeProcessing.outcomeRules[0].identifier, outcomeToRemove, 'There is an outcome rule');

        outcomeHelper.removeOutcomes(testModel, function(outcome) {
            return outcomeHelper.getOutcomeIdentifier(outcome) === 'SCORE_MATH';
        });

        assert.notEqual(testModel.outcomeDeclarations[0].identifier, outcomeToRemove, 'The outcome declaration has been removed');
        assert.notEqual(testModel.outcomeProcessing.outcomeRules[0].identifier, outcomeToRemove, 'The outcome rule has been removed');

        assert.equal(testModel.outcomeDeclarations.length, countDeclarations - 1, 'The number of outcomes declarations is accurate');
        assert.equal(testModel.outcomeProcessing.outcomeRules.length, countRules - 1, 'The number of outcomes rules is accurate');
    });


    createOutcomeCases = [{
        title: 'default',
        identifier: 'FOO_BAR',
        outcome: {
            'qti-type': 'outcomeDeclaration',
            views: [],
            interpretation: '',
            longInterpretation: '',
            normalMaximum: false,
            normalMinimum: false,
            masteryValue: false,
            identifier: 'FOO_BAR',
            cardinality: 0,
            baseType: 3
        }
    }, {
        title: 'integer',
        identifier: 'FOO_BAR',
        type: 'integer',
        outcome: {
            'qti-type': 'outcomeDeclaration',
            views: [],
            interpretation: '',
            longInterpretation: '',
            normalMaximum: false,
            normalMinimum: false,
            masteryValue: false,
            identifier: 'FOO_BAR',
            cardinality: 0,
            baseType: 2
        }
    }, {
        title: 'cardinality',
        identifier: 'FOO_BAR',
        cardinality: 2,
        outcome: {
            'qti-type': 'outcomeDeclaration',
            views: [],
            interpretation: '',
            longInterpretation: '',
            normalMaximum: false,
            normalMinimum: false,
            masteryValue: false,
            identifier: 'FOO_BAR',
            cardinality: 2,
            baseType: 3
        }
    }, {
        title: 'full',
        identifier: 'FOO_BAR',
        type: 1,
        cardinality: 1,
        outcome: {
            'qti-type': 'outcomeDeclaration',
            views: [],
            interpretation: '',
            longInterpretation: '',
            normalMaximum: false,
            normalMinimum: false,
            masteryValue: false,
            identifier: 'FOO_BAR',
            cardinality: 1,
            baseType: 1
        }
    }, {
        title: 'wrong type',
        identifier: 'FOO_BAR',
        type: 100,
        outcome: {
            'qti-type': 'outcomeDeclaration',
            views: [],
            interpretation: '',
            longInterpretation: '',
            normalMaximum: false,
            normalMinimum: false,
            masteryValue: false,
            identifier: 'FOO_BAR',
            cardinality: 0,
            baseType: 3
        }
    }, {
        title: 'wrong type name',
        identifier: 'FOO_BAR',
        type: 'foo',
        outcome: {
            'qti-type': 'outcomeDeclaration',
            views: [],
            interpretation: '',
            longInterpretation: '',
            normalMaximum: false,
            normalMinimum: false,
            masteryValue: false,
            identifier: 'FOO_BAR',
            cardinality: 0,
            baseType: 3
        }
    }];

    QUnit
        .cases(createOutcomeCases)
        .test('helpers/outcome.createOutcome() ', function (data, assert) {
            QUnit.expect(1);
            assert.deepEqual(outcomeHelper.createOutcome(data.identifier, data.type, data.cardinality), data.outcome, 'The outcome helper has provided the expected outcome declaration');
        });


    createOutcomeErrorCases = [{
        title: 'Missing identifier'
    }, {
        title: 'Empty identifier',
        identifier: ''
    }, {
        title: 'Wrong identifier',
        identifier: {foo: 'bar'}
    }, {
        title: 'Bad identifier',
        identifier: '12 foo bar'
    }];

    QUnit
        .cases(createOutcomeErrorCases)
        .test('helpers/outcome.createOutcome()#error', function (data, assert) {
            QUnit.expect(1);
            assert.throws(function () {
                outcomeHelper.createOutcome(data.identifier);
            }, 'An error must be thrown when the identifier is wrong');
        });


    addOutcomeProcessingCases = [{
        title: 'Create the collection',
        testModel: {},
        processingRule: {
            'qti-type': 'foo'
        },
        expected: {
            outcomeProcessing: {
                'qti-type': 'outcomeProcessing',
                outcomeRules: [{
                    'qti-type': 'foo'
                }]
            }
        }
    }, {
        title: 'Complete the collection',
        testModel: {
            outcomeProcessing: {
                'qti-type': 'outcomeProcessing'
            }
        },
        processingRule: {
            'qti-type': 'foo'
        },
        expected: {
            outcomeProcessing: {
                'qti-type': 'outcomeProcessing',
                outcomeRules: [{
                    'qti-type': 'foo'
                }]
            }
        }
    }, {
        title: 'Update the collection',
        testModel: {
            outcomeProcessing: {
                'qti-type': 'outcomeProcessing',
                outcomeRules: [{
                    'qti-type': 'foo'
                }]
            }
        },
        processingRule: {
            'qti-type': 'bar'
        },
        expected: {
            outcomeProcessing: {
                'qti-type': 'outcomeProcessing',
                outcomeRules: [{
                    'qti-type': 'foo'
                }, {
                    'qti-type': 'bar'
                }]
            }
        }
    }];

    QUnit
        .cases(addOutcomeProcessingCases)
        .test('helpers/outcome.addOutcomeProcessing() ', function (data, assert) {
            QUnit.expect(2);
            assert.deepEqual(outcomeHelper.addOutcomeProcessing(data.testModel, data.processingRule), data.processingRule, 'The outcome helper has returned the outcome processing rule declaration');
            assert.deepEqual(data.testModel, data.expected, 'The outcome helper has added the outcome processing rule declaration');
        });


    addOutcomeProcessingErrorCases = [{
        title: 'Missing processing rule',
        testModel: {}
    }, {
        title: 'Invalid processing rule',
        testModel: {},
        processingRule: {}
    }, {
        title: 'Invalid processing rule type (empty)',
        testModel: {},
        processingRule: {
            'qti-type': ''
        }
    }, {
        title: 'Invalid processing rule type (wrong)',
        testModel: {},
        processingRule: {
            'qti-type': {foo: 'bar'}
        }
    }];

    QUnit
        .cases(addOutcomeProcessingErrorCases)
        .test('helpers/outcome.addOutcomeProcessing()#error', function (data, assert) {
            QUnit.expect(1);
            assert.throws(function () {
                outcomeHelper.addOutcomeProcessing(data.testModel, data.processingRule);
            }, 'An error must be thrown when the input is wrong');
        });


    addOutcomeCases = [{
        title: 'Create the collection',
        testModel: {},
        outcome: {
            'qti-type': 'outcomeDeclaration',
            identifier: 'foo'
        },
        expected: {
            outcomeDeclarations: [{
                'qti-type': 'outcomeDeclaration',
                identifier: 'foo'
            }]
        }
    }, {
        title: 'Update the collection',
        testModel: {
            outcomeDeclarations: [{
                'qti-type': 'outcomeDeclaration',
                identifier: 'foo'
            }]
        },
        outcome: {
            'qti-type': 'outcomeDeclaration',
            identifier: 'bar'
        },
        expected: {
            outcomeDeclarations: [{
                'qti-type': 'outcomeDeclaration',
                identifier: 'foo'
            }, {
                'qti-type': 'outcomeDeclaration',
                identifier: 'bar'
            }]
        }
    }, {
        title: 'Create the collection of processing rules',
        testModel: {},
        outcome: {
            'qti-type': 'outcomeDeclaration',
            identifier: 'foo'
        },
        processingRule: {
            'qti-type': 'foo',
            identifier: 'foo'
        },
        expected: {
            outcomeDeclarations: [{
                'qti-type': 'outcomeDeclaration',
                identifier: 'foo'
            }],
            outcomeProcessing: {
                'qti-type': 'outcomeProcessing',
                outcomeRules: [{
                    'qti-type': 'foo',
                    identifier: 'foo'
                }]
            }
        }
    }, {
        title: 'Update the collection of processing rules',
        testModel: {
            outcomeProcessing: {
                'qti-type': 'outcomeProcessing',
                outcomeRules: [{
                    'qti-type': 'foo'
                }]
            }
        },
        outcome: {
            'qti-type': 'outcomeDeclaration',
            identifier: 'foo'
        },
        processingRule: {
            'qti-type': 'bar',
            identifier: 'foo'
        },
        expected: {
            outcomeDeclarations: [{
                'qti-type': 'outcomeDeclaration',
                identifier: 'foo'
            }],
            outcomeProcessing: {
                'qti-type': 'outcomeProcessing',
                outcomeRules: [{
                    'qti-type': 'foo'
                }, {
                    'qti-type': 'bar',
                    identifier: 'foo'
                }]
            }
        }
    }];

    QUnit
        .cases(addOutcomeCases)
        .test('helpers/outcome.addOutcome() ', function (data, assert) {
            QUnit.expect(2);
            assert.deepEqual(outcomeHelper.addOutcome(data.testModel, data.outcome, data.processingRule), data.outcome, 'The outcome helper has returned the outcome declaration');
            assert.deepEqual(data.testModel, data.expected, 'The outcome helper has added the outcome declaration');
        });


    addOutcomeErrorCases = [{
        title: 'Missing outcome',
        testModel: {}
    }, {
        title: 'Invalid outcome',
        testModel: {},
        outcome: {}
    }, {
        title: 'Invalid outcome type (empty)',
        testModel: {},
        outcome: {
            identifier: 'foo',
            'qti-type': ''
        }
    }, {
        title: 'Invalid outcome type (wrong)',
        testModel: {},
        outcome: {
            identifier: 'foo',
            'qti-type': 'outcome'
        }
    }, {
        title: 'Missing outcome identifier',
        testModel: {},
        outcome: {
            'qti-type': 'outcomeDeclaration'
        }
    }, {
        title: 'Invalid outcome identifier (empty)',
        testModel: {},
        outcome: {
            'qti-type': 'outcomeDeclaration',
            identifier: ''
        }
    }, {
        title: 'Invalid outcome identifier (wrong)',
        testModel: {},
        outcome: {
            'qti-type': 'outcomeDeclaration',
            identifier: '12 foo bar'
        }
    }, {
        title: 'Invalid processing rule',
        testModel: {},
        outcome: {
            'qti-type': 'outcomeDeclaration',
            identifier: 'foo'
        },
        processingRule: {}
    }, {
        title: 'Invalid processing rule type (empty)',
        testModel: {},
        outcome: {
            'qti-type': 'outcomeDeclaration',
            identifier: 'foo'
        },
        processingRule: {
            'qti-type': ''
        }
    }, {
        title: 'Invalid processing rule type (wrong)',
        testModel: {},
        outcome: {
            'qti-type': 'outcomeDeclaration',
            identifier: 'foo'
        },
        processingRule: {
            'qti-type': {foo: 'bar'}
        }
    }, {
        title: 'Invalid processing rule (bad identifier)',
        testModel: {},
        outcome: {
            'qti-type': 'outcomeDeclaration',
            identifier: 'foo'
        },
        processingRule: {
            'qti-type': 'type',
            identifier: 'bar'
        }
    }];

    QUnit
        .cases(addOutcomeErrorCases)
        .test('helpers/outcome.addOutcome()#error', function (data, assert) {
            QUnit.expect(1);
            assert.throws(function () {
                outcomeHelper.addOutcome(data.testModel, data.outcome, data.processingRule);
            }, 'An error must be thrown when the input is wrong');
        });


    replaceOutcomesCases = [{
        title: 'Create the collections',
        testModel: {},
        outcomes: {
            outcomeDeclarations: [{
                'qti-type': 'outcomeDeclaration',
                identifier: 'foo'
            }],
            outcomeProcessing: {
                outcomeRules: [{
                    'qti-type': 'bar'
                }]
            }
        },
        expected: {
            outcomeDeclarations: [{
                'qti-type': 'outcomeDeclaration',
                identifier: 'foo'
            }],
            outcomeProcessing: {
                'qti-type': 'outcomeProcessing',
                outcomeRules: [{
                    'qti-type': 'bar'
                }]
            }
        }
    }, {
        title: 'Replace the collections',
        testModel: {
            outcomeDeclarations: [{
                'qti-type': 'outcomeDeclaration',
                identifier: 'outcome1'
            }, {
                'qti-type': 'outcomeDeclaration',
                identifier: 'outcome2'
            }],
            outcomeProcessing: {
                'qti-type': 'outcomeProcessing',
                outcomeRules: [{
                    'qti-type': 'foo'
                }, {
                    'qti-type': 'foo'
                }]
            }
        },
        outcomes: {
            outcomeDeclarations: [{
                'qti-type': 'outcomeDeclaration',
                identifier: 'foo'
            }],
            outcomeProcessing: {
                outcomeRules: [{
                    'qti-type': 'bar'
                }]
            }
        },
        expected: {
            outcomeDeclarations: [{
                'qti-type': 'outcomeDeclaration',
                identifier: 'foo'
            }],
            outcomeProcessing: {
                'qti-type': 'outcomeProcessing',
                outcomeRules: [{
                    'qti-type': 'bar'
                }]
            }
        }
    }];

    QUnit
        .cases(replaceOutcomesCases)
        .test('helpers/outcome.replaceOutcomes() ', function (data, assert) {
            QUnit.expect(1);
            outcomeHelper.replaceOutcomes(data.testModel, data.outcomes);
            assert.deepEqual(data.testModel, data.expected, 'The outcome helper has replaced the outcome declarations');
        });


    replaceOutcomesErrorCases = [{
        title: 'Wrong outcome declaration',
        testModel: {},
        outcomes: {
            outcomeDeclarations: [{
                'qti-type': 'foo',
                identifier: 'foo'
            }],
            outcomeProcessing: {
                outcomeRules: [{
                    'qti-type': 'bar'
                }]
            }
        }
    }, {
        title: 'Wrong processing rule',
        testModel: {},
        outcomes: {
            outcomeDeclarations: [{
                'qti-type': 'outcomeDeclaration',
                identifier: 'foo'
            }],
            outcomeProcessing: {
                outcomeRules: [{
                    foo: 'bar'
                }]
            }
        }
    }];

    QUnit
        .cases(replaceOutcomesErrorCases)
        .test('helpers/outcome.replaceOutcomes()#error', function (data, assert) {
            QUnit.expect(1);
            assert.throws(function () {
                outcomeHelper.replaceOutcomes(data.testModel, data.outcomes);
            }, 'An error must be thrown when the input is wrong');
        });
});
