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
], function (_, baseType) {
    'use strict';

    var baseTypeApi = [
        {title: 'asArray'},
        {title: 'validOrDefault'},
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
        {title: 'coords', key: 'COORDS', value: 12}
    ];


    QUnit.module('helpers/baseType');


    QUnit.test('module', function (assert) {
        QUnit.expect(1);
        assert.equal(typeof baseType, 'object', "The baseType helper module exposes an object");
    });


    QUnit
        .cases(baseTypeApi)
        .test('helpers/baseType API ', function (data, assert) {
            QUnit.expect(1);
            assert.equal(typeof baseType[data.title], 'function', 'The baseType helper exposes a "' + data.title + '" function');
        });


    QUnit.test('helpers/baseType.asArray()', function (assert) {
        QUnit.expect(3);

        assert.equal(typeof baseType.asArray(), 'object', 'The baseType helper asArray() provides a list');
        assert.equal(_.size(baseType.asArray()), 13, 'The baseType helper asArray() provides a list of base types');
        assert.deepEqual(_.values(baseType.asArray()), _.range(0, 13), 'The baseType helper asArray() provides the base types as a list of index');
    });


    QUnit
        .cases(baseTypeList)
        .test('helpers/baseType.asArray() ', function (data, assert) {
            QUnit.expect(1);
            assert.equal(baseType.asArray()[data.key], data.value, 'The type ' + data.title + ' has index ' + data.value);
        });

    QUnit.test('helpers/baseType.validOrDefault()', function (assert) {
        QUnit.expect(7);

        assert.equal(baseType.validOrDefault(100), -1, 'The baseType helper validOrDefault() provides a default type');
        assert.equal(baseType.validOrDefault(1), 1, 'The baseType helper validOrDefault() provides the type if valid');
        assert.equal(baseType.validOrDefault('float'), 3, 'The baseType helper validOrDefault() provides the type if valid');
        assert.equal(baseType.validOrDefault('foo', 2), 2, 'The baseType helper validOrDefault() provides the default type');
        assert.equal(baseType.validOrDefault('foo', 'integer'), 2, 'The baseType helper validOrDefault() provides the default type');
        assert.equal(baseType.validOrDefault('foo', 'bar'), -1, 'The baseType helper validOrDefault() provides a default type');
        assert.equal(baseType.validOrDefault('foo', 100), -1, 'The baseType helper validOrDefault() provides a default type');
    });


    QUnit
        .cases(baseTypeList)
        .test('helpers/baseType.getConstantByName() ', function (data, assert) {
            QUnit.expect(1);
            assert.equal(baseType.getConstantByName(data.title.toLowerCase()), data.value, 'The type ' + data.title + ' has index ' + data.value);
        });


    QUnit
        .cases(baseTypeList)
        .test('helpers/baseType.getNameByConstant() ', function (data, assert) {
            QUnit.expect(1);
            assert.equal(baseType.getNameByConstant(data.value), data.title, 'The constant ' + data.value + ' refers to type ' + data.title);
        });


    QUnit.test('helpers/baseType.getConstantByName(unknown)', function (assert) {
        QUnit.expect(1);
        assert.equal(baseType.getConstantByName('foo'), false, 'An unknown type has not index');
    });


    QUnit.test('helpers/baseType.getNameByConstant(100)', function (assert) {
        QUnit.expect(1);
        assert.equal(baseType.getNameByConstant(100), false, 'A constant out the type range does not mean anything');
    });
});
