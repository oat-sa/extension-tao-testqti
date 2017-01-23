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
    'taoQtiTest/controller/creator/helpers/baseType'
], function (_, baseTypeHelper) {
    'use strict';

    var baseTypeApi = [
        {title: 'asArray'},
        {title: 'getValid'},
        {title: 'getValue'},
        {title: 'getConstantByName'},
        {title: 'getNameByConstant'}
    ];

    var baseTypeList = [
        {title: 'identifier', key: 'IDENTIFIER', value: 0},
        {title: 'boolean', key: 'BOOLEAN', value: 1},
        {title: 'integer', key: 'INTEGER', value: 2},
        {title: 'float', key: 'FLOAT', value: 3},
        {title: 'string', key: 'STRING', value: 4},
        {title: 'point', key: 'POINT', value: 5},
        {title: 'pair', key: 'PAIR', value: 6},
        {title: 'directedPair', key: 'DIRECTED_PAIR', value: 7},
        {title: 'duration', key: 'DURATION', value: 8},
        {title: 'file', key: 'FILE', value: 9},
        {title: 'uri', key: 'URI', value: 10},
        {title: 'intOrIdentifier', key: 'INT_OR_IDENTIFIER', value: 11},
        {title: 'coords', key: 'COORDS', value: 12},
        {title: 'any', key: 'ANY', value: 12, operator: true},
        {title: 'same', key: 'SAME', value: 13, operator: true}
    ];

    var baseTypeValues = [
        {title: 'identifier', type: baseTypeHelper.IDENTIFIER, value: 10, expected: '10'},
        {title: 'identifier', type: baseTypeHelper.IDENTIFIER, value: 'foo', expected: 'foo'},
        {title: 'boolean', type: baseTypeHelper.BOOLEAN, value: 10, expected: true},
        {title: 'boolean', type: baseTypeHelper.BOOLEAN, value: 0, expected: false},
        {title: 'boolean', type: baseTypeHelper.BOOLEAN, value: "TRUE", expected: true},
        {title: 'boolean', type: baseTypeHelper.BOOLEAN, value: "False", expected: false},
        {title: 'boolean', type: baseTypeHelper.BOOLEAN, value: "", expected: false},
        {title: 'integer', type: baseTypeHelper.INTEGER, value: 2, expected: 2},
        {title: 'integer', type: baseTypeHelper.INTEGER, value: 3.14, expected: 3},
        {title: 'integer', type: baseTypeHelper.INTEGER, value: "10", expected: 10},
        {title: 'integer', type: baseTypeHelper.INTEGER, value: "foo", expected: 0},
        {title: 'float', type: baseTypeHelper.FLOAT, value: 3, expected: 3},
        {title: 'float', type: baseTypeHelper.FLOAT, value: 3.14, expected: 3.14},
        {title: 'float', type: baseTypeHelper.FLOAT, value: "3.14", expected: 3.14},
        {title: 'float', type: baseTypeHelper.FLOAT, value: "foo", expected: 0.0},
        {title: 'string', type: baseTypeHelper.STRING, value: 4, expected: "4"},
        {title: 'string', type: baseTypeHelper.STRING, value: "foo", expected: "foo"},
        {title: 'uri', type: baseTypeHelper.URI, value: 10, expected: "10"},
        {title: 'uri', type: baseTypeHelper.URI, value: "http://tao.dev/123", expected: "http://tao.dev/123"},
        {title: 'intOrIdentifier', type: baseTypeHelper.INT_OR_IDENTIFIER, value: 11, expected: 11},
        {title: 'intOrIdentifier', type: baseTypeHelper.INT_OR_IDENTIFIER, value: "11", expected: 11},
        {title: 'intOrIdentifier', type: baseTypeHelper.INT_OR_IDENTIFIER, value: "foo", expected: "foo"},

        {title: 'identifier', type: 'identifier', value: 10, expected: '10'},
        {title: 'identifier', type: 'identifier', value: 'foo', expected: 'foo'},
        {title: 'boolean', type: 'boolean', value: 10, expected: true},
        {title: 'boolean', type: 'boolean', value: 0, expected: false},
        {title: 'boolean', type: 'boolean', value: "TRUE", expected: true},
        {title: 'boolean', type: 'boolean', value: "False", expected: false},
        {title: 'boolean', type: 'boolean', value: "", expected: false},
        {title: 'integer', type: 'integer', value: 2, expected: 2},
        {title: 'integer', type: 'integer', value: 3.14, expected: 3},
        {title: 'integer', type: 'integer', value: "10", expected: 10},
        {title: 'integer', type: 'integer', value: "foo", expected: 0},
        {title: 'float', type: 'float', value: 3, expected: 3},
        {title: 'float', type: 'float', value: 3.14, expected: 3.14},
        {title: 'float', type: 'float', value: "3.14", expected: 3.14},
        {title: 'float', type: 'float', value: "foo", expected: 0.0},
        {title: 'string', type: 'string', value: 4, expected: "4"},
        {title: 'string', type: 'string', value: "foo", expected: "foo"},
        {title: 'uri', type: 'uri', value: 10, expected: "10"},
        {title: 'uri', type: 'uri', value: "http://tao.dev/123", expected: "http://tao.dev/123"},
        {title: 'intOrIdentifier', type: 'intOrIdentifier', value: 11, expected: 11},
        {title: 'intOrIdentifier', type: 'intOrIdentifier', value: "11", expected: 11},
        {title: 'intOrIdentifier', type: 'intOrIdentifier', value: "foo", expected: "foo"},
        {title: 'coords', type: 'coords', value: [0, 1], expected: [0, 1]}
    ];


    QUnit.module('helpers/baseType');


    QUnit.test('module', function (assert) {
        QUnit.expect(1);
        assert.equal(typeof baseTypeHelper, 'object', "The baseType helper module exposes an object");
    });


    QUnit
        .cases(baseTypeApi)
        .test('helpers/baseType API ', function (data, assert) {
            QUnit.expect(1);
            assert.equal(typeof baseTypeHelper[data.title], 'function', 'The baseType helper exposes a "' + data.title + '" function');
        });


    QUnit.test('helpers/baseType.asArray()', function (assert) {
        QUnit.expect(3);

        assert.equal(typeof baseTypeHelper.asArray(), 'object', 'The baseType helper asArray() provides a list');
        assert.equal(_.size(baseTypeHelper.asArray()), 15, 'The baseType helper asArray() provides a list of base types');
        assert.deepEqual(_.values(baseTypeHelper.asArray()), _.range(0, 13).concat([12, 13]), 'The baseType helper asArray() provides the base types as a list of index');
    });


    QUnit
        .cases(baseTypeList)
        .test('helpers/baseType.asArray() ', function (data, assert) {
            QUnit.expect(1);
            assert.equal(baseTypeHelper.asArray()[data.key], data.value, 'The type ' + data.title + ' has index ' + data.value);
        });

    QUnit.test('helpers/baseType.getValid()', function (assert) {
        QUnit.expect(7);

        assert.equal(baseTypeHelper.getValid(100), -1, 'The baseType helper getValid() provides a default type');
        assert.equal(baseTypeHelper.getValid(1), 1, 'The baseType helper getValid() provides the type if valid');
        assert.equal(baseTypeHelper.getValid('float'), 3, 'The baseType helper getValid() provides the type if valid');
        assert.equal(baseTypeHelper.getValid('foo', 2), 2, 'The baseType helper getValid() provides the default type');
        assert.equal(baseTypeHelper.getValid('foo', 'integer'), 2, 'The baseType helper getValid() provides the default type');
        assert.equal(baseTypeHelper.getValid('foo', 'bar'), -1, 'The baseType helper getValid() provides a default type');
        assert.equal(baseTypeHelper.getValid('foo', 100), -1, 'The baseType helper getValid() provides a default type');
    });


    QUnit
        .cases(baseTypeValues)
        .test('helpers/baseType.getValue() ', function (data, assert) {
            QUnit.expect(1);
            assert.deepEqual(baseTypeHelper.getValue(data.type, data.value), data.expected, 'The value ' + data.value + ' should be adjusted to ' + data.expected + ' with the type ' + data.type);
        });


    QUnit
        .cases(baseTypeList)
        .test('helpers/baseType.getConstantByName() ', function (data, assert) {
            QUnit.expect(1);
            assert.equal(baseTypeHelper.getConstantByName(data.title.toLowerCase()), data.value, 'The type ' + data.title + ' has index ' + data.value);
        });


    QUnit
        .cases(baseTypeList)
        .test('helpers/baseType.getNameByConstant() ', function (data, assert) {
            QUnit.expect(1);
            assert.equal(baseTypeHelper.getNameByConstant(data.value, data.operator), data.title, 'The constant ' + data.value + ' refers to type ' + data.title);
        });


    QUnit.test('helpers/baseType.getConstantByName(unknown)', function (assert) {
        QUnit.expect(1);
        assert.equal(baseTypeHelper.getConstantByName('foo'), false, 'An unknown type has not index');
    });


    QUnit.test('helpers/baseType.getNameByConstant(100)', function (assert) {
        QUnit.expect(1);
        assert.equal(baseTypeHelper.getNameByConstant(100), false, 'A constant out the type range does not mean anything');
    });
});
