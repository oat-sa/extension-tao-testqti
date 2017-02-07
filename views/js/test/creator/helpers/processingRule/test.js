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
    'taoQtiTest/controller/creator/helpers/processingRule'
], function (_, processingRule) {
    'use strict';

    var createCases, createErrorCases;
    var setExpressionCases, setExpressionErrorCases;
    var addExpressionCases, addExpressionErrorCases;
    var setOutcomeValueCases, setOutcomeValueErrorCases;
    var gteCases;
    var lteCases;
    var divideCases;
    var sumCases;
    var testVariablesCases, testVariablesErrorCases;
    var outcomeMaximumCases, outcomeMaximumErrorCases;
    var numberPresentedCases;
    var baseValueCases;
    var variableCases, variableErrorCases;
    var matchCases;
    var isNullCases, isNullErrorCases;
    var outcomeConditionCases, outcomeConditionErrorCases;
    var outcomeIfCases, outcomeIfErrorCases;
    var outcomeElseCases, outcomeElseErrorCases;
    var processingRuleApi = [
        {title: 'create'},
        {title: 'setExpression'},
        {title: 'addExpression'},
        {title: 'setOutcomeValue'},
        {title: 'gte'},
        {title: 'lte'},
        {title: 'divide'},
        {title: 'sum'},
        {title: 'testVariables'},
        {title: 'outcomeMaximum'},
        {title: 'numberPresented'},
        {title: 'baseValue'},
        {title: 'variable'},
        {title: 'match'},
        {title: 'isNull'},
        {title: 'outcomeCondition'},
        {title: 'outcomeIf'},
        {title: 'outcomeElse'}
    ];


    QUnit.module('helpers/processingRule');


    QUnit.test('module', function (assert) {
        QUnit.expect(1);
        assert.equal(typeof processingRule, 'object', "The processingRule helper module exposes an object");
    });


    QUnit
        .cases(processingRuleApi)
        .test('helpers/processingRule API ', function (data, assert) {
            QUnit.expect(1);
            assert.equal(typeof processingRule[data.title], 'function', 'The processingRule helper exposes a "' + data.title + '" function');
        });


    createCases = [{
        title: 'only the type',
        type: 'foo',
        expected: {
            'qti-type': 'foo'
        }
    }, {
        title: 'type and identifier',
        type: 'foo',
        identifier: 'bar',
        expected: {
            'qti-type': 'foo',
            identifier: 'bar'
        }
    }, {
        title: 'type and expression',
        type: 'foo',
        expression: {
            'qti-type': 'expression'
        },
        expected: {
            'qti-type': 'foo',
            expression: {
                'qti-type': 'expression'
            }
        }
    }, {
        title: 'type and array expression',
        type: 'foo',
        expression: [{
            'qti-type': 'expression1'
        }, {
            'qti-type': 'expression2'
        }],
        expected: {
            'qti-type': 'foo',
            expressions: [{
                'qti-type': 'expression1'
            }, {
                'qti-type': 'expression2'
            }]
        }
    }, {
        title: 'type, identifier, expression',
        type: 'foo',
        identifier: 'bar',
        expression: {
            'qti-type': 'expression'
        },
        expected: {
            'qti-type': 'foo',
            identifier: 'bar',
            expression: {
                'qti-type': 'expression'
            }
        }
    }, {
        title: 'type, identifier, array expression',
        type: 'foo',
        identifier: 'bar',
        expression: [{
            'qti-type': 'expression1'
        }, {
            'qti-type': 'expression2'
        }],
        expected: {
            'qti-type': 'foo',
            identifier: 'bar',
            expressions: [{
                'qti-type': 'expression1'
            }, {
                'qti-type': 'expression2'
            }]
        }
    }];

    QUnit
        .cases(createCases)
        .test('helpers/processingRule.create()', function (data, assert) {
            QUnit.expect(1);
            assert.deepEqual(processingRule.create(data.type, data.identifier, data.expression), data.expected, 'The processingRule helper has created the expected processing rule');
        });


    createErrorCases = [{
        title: 'Missing type',
        identifier: 'foo'
    }, {
        title: 'Empty type',
        type: '',
        identifier: 'foo'
    }, {
        title: 'Wrong type',
        type: {foo: 'bar'},
        identifier: 'foo'
    }, {
        title: 'Wrong identifier',
        type: 'foo',
        identifier: {foo: 'bar'}
    }, {
        title: 'Bad identifier',
        type: 'foo',
        identifier: '12 foo bar'
    }, {
        title: 'Invalid expression',
        type: 'foo',
        expression: {}
    }, {
        title: 'Invalid expressions',
        type: 'foo',
        expression: [{}]
    }];

    QUnit
        .cases(createErrorCases)
        .test('helpers/processingRule.create() #error', function (data, assert) {
            QUnit.expect(1);
            assert.throws(function () {
                processingRule.create(data.type, data.identifier, data.expression);
            }, 'The processingRule throws error when the input is wrong');
        });


    setExpressionCases = [{
        title: 'Set expression',
        processingRule: {
            'qti-type': 'foo'
        },
        expression: {
            'qti-type': 'expression'
        },
        expected: {
            'qti-type': 'foo',
            expression: {
                'qti-type': 'expression'
            }
        }
    }, {
        title: 'Set array expression',
        processingRule: {
            'qti-type': 'foo'
        },
        expression: [{
            'qti-type': 'expression1'
        }, {
            'qti-type': 'expression1'
        }],
        expected: {
            'qti-type': 'foo',
            expressions: [{
                'qti-type': 'expression1'
            }, {
                'qti-type': 'expression1'
            }]
        }
    }, {
        title: 'Replace expression',
        processingRule: {
            'qti-type': 'foo',
            expression: {
                'qti-type': 'old'
            }
        },
        expression: {
            'qti-type': 'expression'
        },
        expected: {
            'qti-type': 'foo',
            expression: {
                'qti-type': 'expression'
            }
        }
    }, {
        title: 'Replace array expression',
        processingRule: {
            'qti-type': 'foo',
            expressions: [{
                'qti-type': 'old1'
            }, {
                'qti-type': 'old1'
            }]
        },
        expression: [{
            'qti-type': 'expression1'
        }, {
            'qti-type': 'expression1'
        }],
        expected: {
            'qti-type': 'foo',
            expressions: [{
                'qti-type': 'expression1'
            }, {
                'qti-type': 'expression1'
            }]
        }
    }, {
        title: 'Replace expression, existing array',
        processingRule: {
            'qti-type': 'foo',
            expressions: [{
                'qti-type': 'old1'
            }, {
                'qti-type': 'old1'
            }]
        },
        expression: {
            'qti-type': 'expression'
        },
        expected: {
            'qti-type': 'foo',
            expressions: null,
            expression: {
                'qti-type': 'expression'
            }
        }
    }, {
        title: 'Replace array expression, existing single',
        processingRule: {
            'qti-type': 'foo',
            expression: {
                'qti-type': 'old'
            }
        },
        expression: [{
            'qti-type': 'expression1'
        }, {
            'qti-type': 'expression1'
        }],
        expected: {
            'qti-type': 'foo',
            expression: null,
            expressions: [{
                'qti-type': 'expression1'
            }, {
                'qti-type': 'expression1'
            }]
        }
    }];

    QUnit
        .cases(setExpressionCases)
        .test('helpers/processingRule.setExpression()', function (data, assert) {
            QUnit.expect(1);
            processingRule.setExpression(data.processingRule, data.expression);
            assert.deepEqual(data.processingRule, data.expected, 'The processingRule helper has correctly updated the processing rule');
        });


    setExpressionErrorCases = [{
        title: 'Invalid expression',
        processingRule: {
            'qti-type': 'foo'
        },
        expression: {}
    }, {
        title: 'Invalid expressions',
        processingRule: {
            'qti-type': 'foo'
        },
        expression: [{}]
    }];

    QUnit
        .cases(setExpressionErrorCases)
        .test('helpers/processingRule.setExpression() #error', function (data, assert) {
            QUnit.expect(1);
            assert.throws(function () {
                processingRule.setExpression(data.processingRule, data.expression);
            }, 'The processingRule throws error when the input is wrong');
        });


    addExpressionCases = [{
        title: 'Set expression',
        processingRule: {
            'qti-type': 'foo'
        },
        expression: {
            'qti-type': 'expression'
        },
        expected: {
            'qti-type': 'foo',
            expression: {
                'qti-type': 'expression'
            }
        }
    }, {
        title: 'Set array expression',
        processingRule: {
            'qti-type': 'foo'
        },
        expression: [{
            'qti-type': 'expression1'
        }, {
            'qti-type': 'expression1'
        }],
        expected: {
            'qti-type': 'foo',
            expressions: [{
                'qti-type': 'expression1'
            }, {
                'qti-type': 'expression1'
            }]
        }
    }, {
        title: 'Add expression',
        processingRule: {
            'qti-type': 'foo',
            expression: {
                'qti-type': 'old'
            }
        },
        expression: {
            'qti-type': 'expression'
        },
        expected: {
            'qti-type': 'foo',
            expression: null,
            expressions: [{
                'qti-type': 'old'
            }, {
                'qti-type': 'expression'
            }]
        }
    }, {
        title: 'Add array expression',
        processingRule: {
            'qti-type': 'foo',
            expressions: [{
                'qti-type': 'old1'
            }, {
                'qti-type': 'old1'
            }]
        },
        expression: [{
            'qti-type': 'expression1'
        }, {
            'qti-type': 'expression1'
        }],
        expected: {
            'qti-type': 'foo',
            expressions: [{
                'qti-type': 'old1'
            }, {
                'qti-type': 'old1'
            }, {
                'qti-type': 'expression1'
            }, {
                'qti-type': 'expression1'
            }]
        }
    }, {
        title: 'Add expression, existing array',
        processingRule: {
            'qti-type': 'foo',
            expressions: [{
                'qti-type': 'old1'
            }, {
                'qti-type': 'old1'
            }]
        },
        expression: {
            'qti-type': 'expression'
        },
        expected: {
            'qti-type': 'foo',
            expressions: [{
                'qti-type': 'old1'
            }, {
                'qti-type': 'old1'
            }, {
                'qti-type': 'expression'
            }]
        }
    }, {
        title: 'Add array expression, existing single',
        processingRule: {
            'qti-type': 'foo',
            expression: {
                'qti-type': 'old'
            }
        },
        expression: [{
            'qti-type': 'expression1'
        }, {
            'qti-type': 'expression1'
        }],
        expected: {
            'qti-type': 'foo',
            expression: null,
            expressions: [{
                'qti-type': 'old'
            }, {
                'qti-type': 'expression1'
            }, {
                'qti-type': 'expression1'
            }]
        }
    }];

    QUnit
        .cases(addExpressionCases)
        .test('helpers/processingRule.addExpression()', function (data, assert) {
            QUnit.expect(1);
            processingRule.addExpression(data.processingRule, data.expression);
            assert.deepEqual(data.processingRule, data.expected, 'The processingRule helper has correctly updated the processing rule');
        });


    addExpressionErrorCases = [{
        title: 'Invalid expression',
        processingRule: {
            'qti-type': 'foo'
        },
        expression: {}
    }, {
        title: 'Invalid expressions',
        processingRule: {
            'qti-type': 'foo'
        },
        expression: [{}]
    }];

    QUnit
        .cases(addExpressionErrorCases)
        .test('helpers/processingRule.setExpression() #error', function (data, assert) {
            QUnit.expect(1);
            assert.throws(function () {
                processingRule.addExpression(data.processingRule, data.expression);
            }, 'The processingRule throws error when the input is wrong');
        });


    setOutcomeValueCases = [{
        title: 'Identifier only',
        identifier: 'foo',
        expected: {
            'qti-type': 'setOutcomeValue',
            identifier: 'foo'
        }
    }, {
        title: 'Identifier and expression',
        identifier: 'foo',
        expression: {
            'qti-type': 'expression'
        },
        expected: {
            'qti-type': 'setOutcomeValue',
            identifier: 'foo',
            expression: {
                'qti-type': 'expression'
            }
        }
    }, {
        title: 'Identifier and array expression',
        identifier: 'foo',
        expression: [{
            'qti-type': 'expression1'
        }, {
            'qti-type': 'expression2'
        }],
        expected: {
            'qti-type': 'setOutcomeValue',
            identifier: 'foo',
            expressions: [{
                'qti-type': 'expression1'
            }, {
                'qti-type': 'expression2'
            }]
        }
    }];

    QUnit
        .cases(setOutcomeValueCases)
        .test('helpers/processingRule.setOutcomeValue()', function (data, assert) {
            QUnit.expect(1);
            assert.deepEqual(processingRule.setOutcomeValue(data.identifier, data.expression), data.expected, 'The processingRule helper has created the expected processing rule');
        });


    setOutcomeValueErrorCases = [{
        title: 'Missing identifier'
    }, {
        title: 'Empty identifier',
        identifier: ''
    }, {
        title: 'Wrong identifier',
        identifier: {foo: 'bar'}
    }, {
        title: 'Bad identifier',
        type: 'foo',
        identifier: '12 foo bar'
    }];

    QUnit
        .cases(setOutcomeValueErrorCases)
        .test('helpers/processingRule.setOutcomeValue() #error', function (data, assert) {
            QUnit.expect(1);
            assert.throws(function () {
                processingRule.setOutcomeValue(data.identifier, data.expression);
            }, 'The processingRule throws error when the input is wrong');
        });


    gteCases = [{
        title: 'left and right',
        left: {
            'qti-type': 'left'
        },
        right: {
            'qti-type': 'right'
        },
        expected: {
            'qti-type': 'gte',
            minOperands: 2,
            maxOperands: 2,
            acceptedCardinalities: [0],
            acceptedBaseTypes: [2, 3],
            expressions: [{
                'qti-type': 'left'
            }, {
                'qti-type': 'right'
            }]
        }

    }];

    QUnit
        .cases(gteCases)
        .test('helpers/processingRule.gte()', function (data, assert) {
            QUnit.expect(1);
            assert.deepEqual(processingRule.gte(data.left, data.right), data.expected, 'The processingRule helper has created the expected processing rule');
        });


    lteCases = [{
        title: 'left and right',
        left: {
            'qti-type': 'left'
        },
        right: {
            'qti-type': 'right'
        },
        expected: {
            'qti-type': 'lte',
            minOperands: 2,
            maxOperands: 2,
            acceptedCardinalities: [0],
            acceptedBaseTypes: [2, 3],
            expressions: [{
                'qti-type': 'left'
            }, {
                'qti-type': 'right'
            }]
        }

    }];

    QUnit
        .cases(lteCases)
        .test('helpers/processingRule.lte()', function (data, assert) {
            QUnit.expect(1);
            assert.deepEqual(processingRule.lte(data.left, data.right), data.expected, 'The processingRule helper has created the expected processing rule');
        });


    divideCases = [{
        title: 'left and right',
        left: {
            'qti-type': 'left'
        },
        right: {
            'qti-type': 'right'
        },
        expected: {
            'qti-type': 'divide',
            minOperands: 2,
            maxOperands: 2,
            acceptedCardinalities: [0],
            acceptedBaseTypes: [2, 3],
            expressions: [{
                'qti-type': 'left'
            }, {
                'qti-type': 'right'
            }]
        }

    }];

    QUnit
        .cases(divideCases)
        .test('helpers/processingRule.divide()', function (data, assert) {
            QUnit.expect(1);
            assert.deepEqual(processingRule.divide(data.left, data.right), data.expected, 'The processingRule helper has created the expected processing rule');
        });


    sumCases = [{
        title: 'single term',
        terms: {
            'qti-type': 'term1'
        },
        expected: {
            'qti-type': 'sum',
            minOperands: 1,
            maxOperands: -1,
            acceptedCardinalities: [0, 1, 2],
            acceptedBaseTypes: [2, 3],
            expressions: [{
                'qti-type': 'term1'
            }]
        }
    }, {
        title: 'several terms',
        terms: [{
            'qti-type': 'term1'
        }, {
            'qti-type': 'term2'
        }],
        expected: {
            'qti-type': 'sum',
            minOperands: 1,
            maxOperands: -1,
            acceptedCardinalities: [0, 1, 2],
            acceptedBaseTypes: [2, 3],
            expressions: [{
                'qti-type': 'term1'
            }, {
                'qti-type': 'term2'
            }]
        }
    }];

    QUnit
        .cases(sumCases)
        .test('helpers/processingRule.sum()', function (data, assert) {
            QUnit.expect(1);
            assert.deepEqual(processingRule.sum(data.terms), data.expected, 'The processingRule helper has created the expected processing rule');
        });


    testVariablesCases = [{
        title: 'only identifier',
        identifier: 'foo',
        expected: {
            'qti-type': 'testVariables',
            variableIdentifier: 'foo',
            baseType: -1,
            weightIdentifier: '',
            sectionIdentifier: '',
            includeCategories: [],
            excludeCategories: []
        }
    }, {
        title: 'identifier and type as string',
        identifier: 'foo',
        type: 'integer',
        expected: {
            'qti-type': 'testVariables',
            variableIdentifier: 'foo',
            baseType: 2,
            weightIdentifier: '',
            sectionIdentifier: '',
            includeCategories: [],
            excludeCategories: []
        }
    }, {
        title: 'identifier and type as constant',
        identifier: 'foo',
        type: 3,
        expected: {
            'qti-type': 'testVariables',
            variableIdentifier: 'foo',
            baseType: 3,
            weightIdentifier: '',
            sectionIdentifier: '',
            includeCategories: [],
            excludeCategories: []
        }
    }, {
        title: 'identifier and weight',
        identifier: 'foo',
        weight: 'bar',
        expected: {
            'qti-type': 'testVariables',
            variableIdentifier: 'foo',
            baseType: -1,
            weightIdentifier: 'bar',
            sectionIdentifier: '',
            includeCategories: [],
            excludeCategories: []
        }
    }, {
        title: 'identifier and one category to include as string',
        identifier: 'foo',
        includeCategories: 'bar',
        expected: {
            'qti-type': 'testVariables',
            variableIdentifier: 'foo',
            baseType: -1,
            weightIdentifier: '',
            sectionIdentifier: '',
            includeCategories: ['bar'],
            excludeCategories: []
        }
    }, {
        title: 'identifier and one category to include as array',
        identifier: 'foo',
        includeCategories: ['bar'],
        expected: {
            'qti-type': 'testVariables',
            variableIdentifier: 'foo',
            baseType: -1,
            weightIdentifier: '',
            sectionIdentifier: '',
            includeCategories: ['bar'],
            excludeCategories: []
        }
    }, {
        title: 'identifier and one category to exclude as string',
        identifier: 'foo',
        excludeCategories: 'bar',
        expected: {
            'qti-type': 'testVariables',
            variableIdentifier: 'foo',
            baseType: -1,
            weightIdentifier: '',
            sectionIdentifier: '',
            includeCategories: [],
            excludeCategories: ['bar']
        }
    }, {
        title: 'identifier and one category to exclude as array',
        identifier: 'foo',
        excludeCategories: ['bar'],
        expected: {
            'qti-type': 'testVariables',
            variableIdentifier: 'foo',
            baseType: -1,
            weightIdentifier: '',
            sectionIdentifier: '',
            includeCategories: [],
            excludeCategories: ['bar']
        }
    }];

    QUnit
        .cases(testVariablesCases)
        .test('helpers/processingRule.testVariables()', function (data, assert) {
            QUnit.expect(1);
            assert.deepEqual(processingRule.testVariables(data.identifier, data.type, data.weight, data.includeCategories, data.excludeCategories), data.expected, 'The processingRule helper has created the expected processing rule');
        });


    testVariablesErrorCases = [{
        title: 'Missing identifier'
    }, {
        title: 'Empty identifier',
        identifier: ''
    }, {
        title: 'Wrong identifier',
        identifier: {foo: 'bar'}
    }, {
        title: 'Wrong weight identifier',
        identifier: 'foo',
        weight: {foo: 'bar'}
    }, {
        title: 'Bad weight identifier',
        identifier: 'foo',
        weight: '12 foo bar'
    }];

    QUnit
        .cases(testVariablesErrorCases)
        .test('helpers/processingRule.testVariables() #error', function (data, assert) {
            QUnit.expect(1);
            assert.throws(function () {
                processingRule.testVariables(data.identifier, data.type, data.weight, data.includeCategories, data.excludeCategories);
            }, 'The processingRule throws error when the input is wrong');
        });


    outcomeMaximumCases = [{
        title: 'only identifier',
        identifier: 'foo',
        expected: {
            'qti-type': 'outcomeMaximum',
            outcomeIdentifier: 'foo',
            weightIdentifier: '',
            sectionIdentifier: '',
            includeCategories: [],
            excludeCategories: []
        }
    }, {
        title: 'identifier and weight',
        identifier: 'foo',
        weight: 'bar',
        expected: {
            'qti-type': 'outcomeMaximum',
            outcomeIdentifier: 'foo',
            weightIdentifier: 'bar',
            sectionIdentifier: '',
            includeCategories: [],
            excludeCategories: []
        }
    }, {
        title: 'identifier and one category to include as string',
        identifier: 'foo',
        includeCategories: 'bar',
        expected: {
            'qti-type': 'outcomeMaximum',
            outcomeIdentifier: 'foo',
            weightIdentifier: '',
            sectionIdentifier: '',
            includeCategories: ['bar'],
            excludeCategories: []
        }
    }, {
        title: 'identifier and one category to include as array',
        identifier: 'foo',
        includeCategories: ['bar'],
        expected: {
            'qti-type': 'outcomeMaximum',
            outcomeIdentifier: 'foo',
            weightIdentifier: '',
            sectionIdentifier: '',
            includeCategories: ['bar'],
            excludeCategories: []
        }
    }, {
        title: 'identifier and one category to exclude as string',
        identifier: 'foo',
        excludeCategories: 'bar',
        expected: {
            'qti-type': 'outcomeMaximum',
            outcomeIdentifier: 'foo',
            weightIdentifier: '',
            sectionIdentifier: '',
            includeCategories: [],
            excludeCategories: ['bar']
        }
    }, {
        title: 'identifier and one category to exclude as array',
        identifier: 'foo',
        excludeCategories: ['bar'],
        expected: {
            'qti-type': 'outcomeMaximum',
            outcomeIdentifier: 'foo',
            weightIdentifier: '',
            sectionIdentifier: '',
            includeCategories: [],
            excludeCategories: ['bar']
        }
    }];

    QUnit
        .cases(outcomeMaximumCases)
        .test('helpers/processingRule.outcomeMaximum()', function (data, assert) {
            QUnit.expect(1);
            assert.deepEqual(processingRule.outcomeMaximum(data.identifier, data.weight, data.includeCategories, data.excludeCategories), data.expected, 'The processingRule helper has created the expected processing rule');
        });


    outcomeMaximumErrorCases = [{
        title: 'Missing identifier'
    }, {
        title: 'Empty identifier',
        identifier: ''
    }, {
        title: 'Wrong identifier',
        identifier: {foo: 'bar'}
    }, {
        title: 'Wrong weight identifier',
        identifier: 'foo',
        weight: {foo: 'bar'}
    }, {
        title: 'Bad weight identifier',
        identifier: 'foo',
        weight: '12 foo bar'
    }];

    QUnit
        .cases(outcomeMaximumErrorCases)
        .test('helpers/processingRule.outcomeMaximum() #error', function (data, assert) {
            QUnit.expect(1);
            assert.throws(function () {
                processingRule.outcomeMaximum(data.identifier, data.weight, data.includeCategories, data.excludeCategories);
            }, 'The processingRule throws error when the input is wrong');
        });


    numberPresentedCases = [{
        title: 'no categories',
        expected: {
            'qti-type': 'numberPresented',
            sectionIdentifier: '',
            includeCategories: [],
            excludeCategories: []
        }
    }, {
        title: 'category to include as string',
        includeCategories: 'bar',
        expected: {
            'qti-type': 'numberPresented',
            sectionIdentifier: '',
            includeCategories: ['bar'],
            excludeCategories: []
        }
    }, {
        title: 'category to include as array',
        includeCategories: ['bar'],
        expected: {
            'qti-type': 'numberPresented',
            sectionIdentifier: '',
            includeCategories: ['bar'],
            excludeCategories: []
        }
    }, {
        title: 'category to exclude as string',
        excludeCategories: 'bar',
        expected: {
            'qti-type': 'numberPresented',
            sectionIdentifier: '',
            includeCategories: [],
            excludeCategories: ['bar']
        }
    }, {
        title: 'category to exclude as array',
        excludeCategories: ['bar'],
        expected: {
            'qti-type': 'numberPresented',
            sectionIdentifier: '',
            includeCategories: [],
            excludeCategories: ['bar']
        }
    }];

    QUnit
        .cases(numberPresentedCases)
        .test('helpers/processingRule.numberPresented()', function (data, assert) {
            QUnit.expect(1);
            assert.deepEqual(processingRule.numberPresented(data.includeCategories, data.excludeCategories), data.expected, 'The processingRule helper has created the expected processing rule');
        });


    baseValueCases = [{
        title: 'no input',
        expected: {
            'qti-type': 'baseValue',
            baseType: 3,
            value: 0
        }
    }, {
        title: 'default type',
        value: 50,
        expected: {
            'qti-type': 'baseValue',
            baseType: 3,
            value: 50
        }
    }, {
        title: 'type (string) and value',
        type: 'integer',
        value: 50,
        expected: {
            'qti-type': 'baseValue',
            baseType: 2,
            value: 50
        }
    }, {
        title: 'type (constant) and value',
        type: 1,
        value: 0,
        expected: {
            'qti-type': 'baseValue',
            baseType: 1,
            value: false
        }
    }, {
        title: 'type (wrong) and value',
        type: 100,
        value: 7,
        expected: {
            'qti-type': 'baseValue',
            baseType: 3,
            value: 7
        }
    }];

    QUnit
        .cases(baseValueCases)
        .test('helpers/processingRule.baseValue()', function (data, assert) {
            QUnit.expect(1);
            assert.deepEqual(processingRule.baseValue(data.value, data.type), data.expected, 'The processingRule helper has created the expected processing rule');
        });


    variableCases = [{
        title: 'identifier',
        identifier: 'foo',
        expected: {
            'qti-type': 'variable',
            identifier: 'foo',
            weightIdentifier: ''
        }
    }, {
        title: 'identifier and weight',
        identifier: 'foo',
        weight: 'bar',
        expected: {
            'qti-type': 'variable',
            identifier: 'foo',
            weightIdentifier: 'bar'
        }
    }];

    QUnit
        .cases(variableCases)
        .test('helpers/processingRule.variable()', function (data, assert) {
            QUnit.expect(1);
            assert.deepEqual(processingRule.variable(data.identifier, data.weight), data.expected, 'The processingRule helper has created the expected processing rule');
        });


    variableErrorCases = [{
        title: 'Missing identifier'
    }, {
        title: 'Empty identifier',
        identifier: ''
    }, {
        title: 'Wrong identifier',
        identifier: {foo: 'bar'}
    }, {
        title: 'Wrong weight identifier',
        identifier: 'foo',
        weight: {foo: 'bar'}
    }, {
        title: 'Bad weight identifier',
        identifier: 'foo',
        weight: '12 foo bar'
    }];

    QUnit
        .cases(variableErrorCases)
        .test('helpers/processingRule.variables() #error', function (data, assert) {
            QUnit.expect(1);
            assert.throws(function () {
                processingRule.variable(data.identifier, data.weight);
            }, 'The processingRule throws error when the input is wrong');
        });


    matchCases = [{
        title: 'left and right',
        left: {
            'qti-type': 'left'
        },
        right: {
            'qti-type': 'right'
        },
        expected: {
            'qti-type': 'match',
            minOperands: 2,
            maxOperands: 2,
            acceptedCardinalities: [4],
            acceptedBaseTypes: [4],
            expressions: [{
                'qti-type': 'left'
            }, {
                'qti-type': 'right'
            }]
        }
    }, {
        title: 'left and right, default type',
        left: {
            'qti-type': 'left'
        },
        right: {
            'qti-type': 'right'
        },
        expected: {
            'qti-type': 'match',
            minOperands: 2,
            maxOperands: 2,
            acceptedCardinalities: [4],
            acceptedBaseTypes: [4],
            expressions: [{
                'qti-type': 'left'
            }, {
                'qti-type': 'right'
            }]
        }
    }];

    QUnit
        .cases(matchCases)
        .test('helpers/processingRule.match()', function (data, assert) {
            QUnit.expect(1);
            assert.deepEqual(processingRule.match(data.left, data.right), data.expected, 'The processingRule helper has created the expected processing rule');
        });


    isNullCases = [{
        title: 'with parameter',
        expression: {
            'qti-type': 'foo'
        },
        expected: {
            'qti-type': 'isNull',
            minOperands: 1,
            maxOperands: 1,
            acceptedCardinalities: [5],
            acceptedBaseTypes: [12],
            expressions: [{
                'qti-type': 'foo'
            }]
        }
    }];

    QUnit
        .cases(isNullCases)
        .test('helpers/processingRule.isNull()', function (data, assert) {
            QUnit.expect(1);
            assert.deepEqual(processingRule.isNull(data.expression), data.expected, 'The processingRule helper has created the expected processing rule');
        });


    isNullErrorCases = [{
        title: 'without parameter',
        expected: {
            'qti-type': 'isNull',
            minOperands: 1,
            maxOperands: 1,
            acceptedCardinalities: [5],
            acceptedBaseTypes: [12],
            expressions: []
        }
    }];

    QUnit
        .cases(isNullErrorCases)
        .test('helpers/processingRule.isNull() #error', function (data, assert) {
            QUnit.expect(1);
            assert.throws(function () {
                processingRule.isNull(data.expression);
            }, 'The processingRule throws error when the input is wrong');
        });


    outcomeConditionCases = [{
        title: 'If but no Else',
        outcomeIf: {
            'qti-type': 'outcomeIf'
        },
        expected: {
            'qti-type': 'outcomeCondition',
            outcomeIf: {
                'qti-type': 'outcomeIf'
            },
            outcomeElseIfs: []
        }
    }, {
        title: 'If and Else',
        outcomeIf: {
            'qti-type': 'outcomeIf'
        },
        outcomeElse: {
            'qti-type': 'outcomeElse'
        },
        expected: {
            'qti-type': 'outcomeCondition',
            outcomeIf: {
                'qti-type': 'outcomeIf'
            },
            outcomeElseIfs: [],
            outcomeElse: {
                'qti-type': 'outcomeElse'
            }
        }
    }];

    QUnit
        .cases(outcomeConditionCases)
        .test('helpers/processingRule.outcomeCondition()', function (data, assert) {
            QUnit.expect(1);
            assert.deepEqual(processingRule.outcomeCondition(data.outcomeIf, data.outcomeElse), data.expected, 'The processingRule helper has created the expected processing rule');
        });


    outcomeConditionErrorCases = [{
        title: 'No If nor Else'
    }, {
        title: 'An invalid If',
        outcomeIf: {}
    }, {
        title: 'A wrong If',
        outcomeIf: {
            'qti-type': 'outcomeElse'
        }
    }, {
        title: 'A valid If but an invalid Else',
        outcomeIf: {
            'qti-type': 'outcomeIf'
        },
        outcomeElse: {}
    }, {
        title: 'A valid If but a wrong Else',
        outcomeIf: {
            'qti-type': 'outcomeIf'
        },
        outcomeElse: {
            'qti-type': 'outcomeIf'
        }
    }];

    QUnit
        .cases(outcomeConditionErrorCases)
        .test('helpers/processingRule.outcomeCondition() #error', function (data, assert) {
            QUnit.expect(1);
            assert.throws(function () {
                processingRule.outcomeCondition(data.outcomeIf, data.outcomeElse);
            }, 'The processingRule throws error when the input is wrong');
        });


    outcomeIfCases = [{
        title: 'An Expression, but empty Instruction',
        expression: {
            'qti-type': 'match'
        },
        instruction: [],
        expected: {
            'qti-type': 'outcomeIf',
            expression: {
                'qti-type': 'match'
            },
            outcomeRules: []
        }
    }, {
        title: 'An Expression and an Instruction',
        expression: {
            'qti-type': 'match'
        },
        instruction: {
            'qti-type': 'foo'
        },
        expected: {
            'qti-type': 'outcomeIf',
            expression: {
                'qti-type': 'match'
            },
            outcomeRules: [{
                'qti-type': 'foo'
            }]
        }
    }, {
        title: 'An Expression and a list of Instruction',
        expression: {
            'qti-type': 'match'
        },
        instruction: [{
            'qti-type': 'foo'
        }, {
            'qti-type': 'bar'
        }],
        expected: {
            'qti-type': 'outcomeIf',
            expression: {
                'qti-type': 'match'
            },
            outcomeRules: [{
                'qti-type': 'foo'
            }, {
                'qti-type': 'bar'
            }]
        }
    }];

    QUnit
        .cases(outcomeIfCases)
        .test('helpers/processingRule.outcomeIf()', function (data, assert) {
            QUnit.expect(1);
            assert.deepEqual(processingRule.outcomeIf(data.expression, data.instruction), data.expected, 'The processingRule helper has created the expected processing rule');
        });


    outcomeIfErrorCases = [{
        title: 'No Expression nor Instruction'
    }, {
        title: 'An invalid Expression',
        expression: {},
        instruction: []
    }, {
        title: 'An invalid Instruction',
        expression: {
            'qti-type': 'match'
        },
        instruction: {}
    }, {
        title: 'An invalid Instruction in an array',
        expression: {
            'qti-type': 'match'
        },
        instruction: [{
            'qti-type': 'foo'
        }, {
            foo: 'bar'
        }]
    }];

    QUnit
        .cases(outcomeIfErrorCases)
        .test('helpers/processingRule.outcomeIf() #error', function (data, assert) {
            QUnit.expect(1);
            assert.throws(function () {
                processingRule.outcomeIf(data.expression, data.instruction);
            }, 'The processingRule throws error when the input is wrong');
        });


    outcomeElseCases = [{
        title: 'An empty Instruction',
        instruction: [],
        expected: {
            'qti-type': 'outcomeElse',
            outcomeRules: []
        }
    }, {
        title: 'An Instruction',
        instruction: {
            'qti-type': 'foo'
        },
        expected: {
            'qti-type': 'outcomeElse',
            outcomeRules: [{
                'qti-type': 'foo'
            }]
        }
    }, {
        title: 'A list of Instruction',
        instruction: [{
            'qti-type': 'foo'
        }, {
            'qti-type': 'bar'
        }],
        expected: {
            'qti-type': 'outcomeElse',
            outcomeRules: [{
                'qti-type': 'foo'
            }, {
                'qti-type': 'bar'
            }]
        }
    }];

    QUnit
        .cases(outcomeElseCases)
        .test('helpers/processingRule.outcomeElse()', function (data, assert) {
            QUnit.expect(1);
            assert.deepEqual(processingRule.outcomeElse(data.instruction), data.expected, 'The processingRule helper has created the expected processing rule');
        });


    outcomeElseErrorCases = [{
        title: 'No Instruction'
    }, {
        title: 'An invalid Instruction',
        instruction: {}
    }, {
        title: 'An invalid Instruction in an array',
        instruction: [{
            'qti-type': 'foo'
        }, {
            foo: 'bar'
        }]
    }];

    QUnit
        .cases(outcomeElseErrorCases)
        .test('helpers/processingRule.outcomeElse() #error', function (data, assert) {
            QUnit.expect(1);
            assert.throws(function () {
                processingRule.outcomeElse(data.instruction);
            }, 'The processingRule throws error when the input is wrong');
        });
});
