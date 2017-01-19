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
    'taoQtiTest/controller/creator/helpers/qtiElement'
], function (_,
             qtiElementHelper) {
    'use strict';

    var createCases, createErrorCases;
    var qtiElementLookupCases;
    var qtiElementPropertyCases;
    var qtiElementHelperApi = [
        {title: 'create'},
        {title: 'find'},
        {title: 'lookupElement'},
        {title: 'lookupProperty'}
    ];


    QUnit.module('helpers/qtiElement');


    QUnit.test('module', function (assert) {
        QUnit.expect(1);
        assert.equal(typeof qtiElementHelper, 'object', "The qtiElement helper module exposes an object");
    });


    QUnit
        .cases(qtiElementHelperApi)
        .test('helpers/qtiElement API ', function (data, assert) {
            QUnit.expect(1);
            assert.equal(typeof qtiElementHelper[data.title], 'function', 'The qtiElement helper exposes a "' + data.title + '" function');
        });


    createCases = [{
        title: 'simple',
        type: 'foo',
        expected: {
            'qti-type': 'foo'
        }
    }, {
        title: 'with identifier',
        type: 'foo',
        identifier: 'FOO_BAR',
        expected: {
            'qti-type': 'foo',
            identifier: 'FOO_BAR'
        }
    }, {
        title: 'with properties',
        type: 'foo',
        properties: {
            prop1: 123,
            prop2: 'bar'
        },
        expected: {
            'qti-type': 'foo',
            prop1: 123,
            prop2: 'bar'
        }
    }, {
        title: 'with properties instead of identifier',
        type: 'foo',
        identifier: {
            prop1: 123,
            prop2: 'bar'
        },
        expected: {
            'qti-type': 'foo',
            prop1: 123,
            prop2: 'bar'
        }
    }, {
        title: 'full',
        type: 'foo',
        identifier: 'FOO_BAR',
        properties: {
            prop1: 123,
            prop2: 'bar'
        },
        expected: {
            'qti-type': 'foo',
            identifier: 'FOO_BAR',
            prop1: 123,
            prop2: 'bar'
        }
    }];

    QUnit
        .cases(createCases)
        .test('helpers/qtiElement.create() ', function (data, assert) {
            QUnit.expect(1);
            assert.deepEqual(qtiElementHelper.create(data.type, data.identifier, data.properties), data.expected, 'The qtiElement helper has created the expected element');
        });


    createErrorCases = [{
        title: 'Missing type'
    }, {
        title: 'Empty type',
        type: ''
    }, {
        title: 'Wrong type',
        type: {foo: 'bar'}
    }, {
        title: 'Bad type',
        type: '12 foo bar'
    }, {
        title: 'Bad identifier',
        type: 'foo',
        identifier: '12 foo bar'
    }];

    QUnit
        .cases(createErrorCases)
        .test('helpers/qtiElement.create()#error', function (data, assert) {
            QUnit.expect(1);
            assert.throws(function () {
                qtiElementHelper.create(data.type, data.identifier, data.properties);
            }, 'An error must be thrown when the type or the identifier is wrong');
        });


    QUnit.test('helpers/qtiElement.find()', function (assert) {
        var expression = [{
            'qti-type': 'foo',
            identifier: 'FOO'
        }, {
            'qti-type': 'bar',
            identifier: 'BAR'
        }];

        QUnit.expect(5);
        assert.equal(qtiElementHelper.find(expression, 'foo'), expression[0], 'The qtiElement helper has found the right expression');
        assert.equal(qtiElementHelper.find(expression, 'bar'), expression[1], 'The qtiElement helper has found the right expression');
        assert.equal(qtiElementHelper.find(expression, 'baz'), null, 'The qtiElement helper has not found any expression');
        assert.equal(qtiElementHelper.find(expression[0], 'foo'), expression[0], 'The qtiElement helper has found the right expression');
        assert.equal(qtiElementHelper.find(expression[0], 'baz'), null, 'The qtiElement helper has not found any expression');
    });


    qtiElementLookupCases = [{
        title: 'Gets an element by its path, multiple nodes',
        tree: {
            "qti-type": "setOutcomeValue",
            "expression": {
                "qti-type": "gte",
                "expressions": [{
                    "qti-type": "divide",
                    "expressions": [{
                        "qti-type": "sum",
                        "expression": {
                            "qti-type": "testVariables"
                        }
                    }, {
                        "qti-type": "numberPresented"
                    }]
                }, {
                    "qti-type": "baseValue"
                }]
            }
        },
        path: 'setOutcomeValue.gte.divide.sum.testVariables',
        nodes: ['expression', 'expressions'],
        expected: {
            "qti-type": "testVariables"
        }
    }, {
        title: 'Gets an element by its path, single node',
        tree: {
            "qti-type": "setOutcomeValue",
            "expression": {
                "qti-type": "gte",
                "expression": [{
                    "qti-type": "divide",
                    "expression": [{
                        "qti-type": "sum",
                        "expression": {
                            "qti-type": "testVariables"
                        }
                    }, {
                        "qti-type": "numberPresented"
                    }]
                }, {
                    "qti-type": "baseValue"
                }]
            }
        },
        path: 'setOutcomeValue.gte.divide.sum.testVariables',
        nodes: 'expression',
        expected: {
            "qti-type": "testVariables"
        }
    }, {
        title: 'Gets an unknown element by its path',
        tree: {
            "qti-type": "setOutcomeValue",
            "expression": {
                "qti-type": "gte",
                "expression": [{
                    "qti-type": "divide",
                    "expression": [{
                        "qti-type": "sum",
                        "expression": {
                            "qti-type": "testVariables"
                        }
                    }, {
                        "qti-type": "numberPresented"
                    }]
                }, {
                    "qti-type": "baseValue"
                }]
            }
        },
        path: 'setOutcomeValue.gte.divide.testVariables',
        nodes: 'expression',
        expected: null
    }, {
        title: 'Gets an element by its path, missing node list',
        tree: {
            "qti-type": "setOutcomeValue",
            "expression": {
                "qti-type": "gte",
                "expression": [{
                    "qti-type": "divide",
                    "expression": [{
                        "qti-type": "sum",
                        "expression": {
                            "qti-type": "testVariables"
                        }
                    }, {
                        "qti-type": "numberPresented"
                    }]
                }, {
                    "qti-type": "baseValue"
                }]
            }
        },
        path: 'setOutcomeValue.gte.divide.sum.testVariables',
        expected: null
    }];

    QUnit
        .cases(qtiElementLookupCases)
        .test('helpers/qtiElement.lookupElement() ', function (data, assert) {
            QUnit.expect(1);
            assert.deepEqual(qtiElementHelper.lookupElement(data.tree, data.path, data.nodes), data.expected, 'The request element has been found');
        });


    qtiElementPropertyCases = [{
        title: 'Gets a property by its path, multiple nodes',
        tree: {
            "qti-type": "setOutcomeValue",
            "value": "0",
            "expression": {
                "qti-type": "gte",
                "value": "1",
                "expressions": [{
                    "qti-type": "divide",
                    "value": "2",
                    "expressions": [{
                        "qti-type": "sum",
                        "value": "3",
                        "expression": {
                            "qti-type": "testVariables",
                            "value": "4"
                        }
                    }, {
                        "qti-type": "numberPresented",
                        "value": "5"
                    }]
                }, {
                    "qti-type": "baseValue",
                    "value": "6"
                }]
            }
        },
        path: 'setOutcomeValue.gte.divide.sum.testVariables.value',
        nodes: ['expression', 'expressions'],
        expected: "4"
    }, {
        title: 'Gets a property by its path, single node',
        tree: {
            "qti-type": "setOutcomeValue",
            "value": "0",
            "expression": {
                "qti-type": "gte",
                "value": "1",
                "expression": [{
                    "qti-type": "divide",
                    "value": "2",
                    "expression": [{
                        "qti-type": "sum",
                        "value": "3",
                        "expression": {
                            "qti-type": "testVariables",
                            "value": "4"
                        }
                    }, {
                        "qti-type": "numberPresented",
                        "value": "5"
                    }]
                }, {
                    "qti-type": "baseValue",
                    "value": "6"
                }]
            }
        },
        path: 'setOutcomeValue.gte.divide.sum.testVariables.value',
        nodes: 'expression',
        expected: "4"
    }, {
        title: 'Gets a property element by its path',
        tree: {
            "qti-type": "setOutcomeValue",
            "value": "0",
            "expression": {
                "qti-type": "gte",
                "value": "1",
                "expressions": [{
                    "qti-type": "divide",
                    "value": "2",
                    "expressions": [{
                        "qti-type": "sum",
                        "value": "3",
                        "expression": {
                            "qti-type": "testVariables",
                            "value": "4"
                        }
                    }, {
                        "qti-type": "numberPresented",
                        "value": "5"
                    }]
                }, {
                    "qti-type": "baseValue",
                    "value": "6"
                }]
            }
        },
        path: 'setOutcomeValue.gte.divide.testVariables.value',
        nodes: 'expression',
        expected: null
    }, {
        title: 'Gets a property by its path, missing node list',
        tree: {
            "qti-type": "setOutcomeValue",
            "value": "0",
            "expression": {
                "qti-type": "gte",
                "value": "1",
                "expressions": [{
                    "qti-type": "divide",
                    "value": "2",
                    "expressions": [{
                        "qti-type": "sum",
                        "value": "3",
                        "expression": {
                            "qti-type": "testVariables",
                            "value": "4"
                        }
                    }, {
                        "qti-type": "numberPresented",
                        "value": "5"
                    }]
                }, {
                    "qti-type": "baseValue",
                    "value": "6"
                }]
            }
        },
        path: 'setOutcomeValue.gte.divide.sum.testVariables.value',
        expected: null
    }];

    QUnit
        .cases(qtiElementPropertyCases)
        .test('helpers/qtiElement.lookupProperty() ', function (data, assert) {
            QUnit.expect(1);
            assert.deepEqual(qtiElementHelper.lookupProperty(data.tree, data.path, data.nodes), data.expected, 'The request property has been found');
        });
});
