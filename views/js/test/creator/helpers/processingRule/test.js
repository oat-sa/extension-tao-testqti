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
    var setExpressionCases;
    var addExpressionCases;
    var setOutcomeValueCases, setOutcomeValueErrorCases;
    var gteCases;
    var lteCases;
    var divideCases;
    var sumCases;
    var testVariablesCases, testVariablesErrorCases;
    var numberPresentedCases;
    var baseValueCases;
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
        {title: 'numberPresented'},
        {title: 'baseValue'}
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
            value: 0
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

});
