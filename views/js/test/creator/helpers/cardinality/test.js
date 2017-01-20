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
    'taoQtiTest/controller/creator/helpers/cardinality'
], function (_, cardinalityHelper) {
    'use strict';

    var cardinalityApi = [
        {title: 'asArray'},
        {title: 'getValid'},
        {title: 'getConstantByName'},
        {title: 'getNameByConstant'}
    ];

    var cardinalityList = [
        {title: 'single', key: 'SINGLE', value: 0},
        {title: 'multiple', key: 'MULTIPLE', value: 1},
        {title: 'ordered', key: 'ORDERED', value: 2},
        {title: 'record', key: 'RECORD', value: 3},
        {title: 'same', key: 'SAME', value: 4},
        {title: 'any', key: 'ANY', value: 5}
    ];


    QUnit.module('helpers/cardinality');


    QUnit.test('module', function (assert) {
        QUnit.expect(1);
        assert.equal(typeof cardinalityHelper, 'object', "The cardinality helper module exposes an object");
    });


    QUnit
        .cases(cardinalityApi)
        .test('helpers/cardinality API ', function (data, assert) {
            QUnit.expect(1);
            assert.equal(typeof cardinalityHelper[data.title], 'function', 'The cardinality helper exposes a "' + data.title + '" function');
        });


    QUnit.test('helpers/cardinality.asArray()', function (assert) {
        QUnit.expect(3);

        assert.equal(typeof cardinalityHelper.asArray(), 'object', 'The cardinality helper asArray() provides a list');
        assert.equal(_.size(cardinalityHelper.asArray()), 6, 'The cardinality helper asArray() provides a list of base cardinalitys');
        assert.deepEqual(_.values(cardinalityHelper.asArray()), _.range(0, 6), 'The cardinality helper asArray() provides the base cardinalitys as a list of index');
    });


    QUnit
        .cases(cardinalityList)
        .test('helpers/cardinality.asArray() ', function (data, assert) {
            QUnit.expect(1);
            assert.equal(cardinalityHelper.asArray()[data.key], data.value, 'The cardinality ' + data.title + ' has index ' + data.value);
        });

    QUnit.test('helpers/cardinality.getValid()', function (assert) {
        QUnit.expect(7);

        assert.equal(cardinalityHelper.getValid(100), 0, 'The cardinality helper getValid() provides a default cardinality');
        assert.equal(cardinalityHelper.getValid(1), 1, 'The cardinality helper getValid() provides the cardinality if valid');
        assert.equal(cardinalityHelper.getValid('multiple'), 1, 'The cardinality helper getValid() provides the cardinality if valid');
        assert.equal(cardinalityHelper.getValid('foo', 2), 2, 'The cardinality helper getValid() provides the default cardinality');
        assert.equal(cardinalityHelper.getValid('foo', 'ordered'), 2, 'The cardinality helper getValid() provides the default cardinality');
        assert.equal(cardinalityHelper.getValid('foo', 'bar'), 0, 'The cardinality helper getValid() provides a default cardinality');
        assert.equal(cardinalityHelper.getValid('foo', 100), 0, 'The cardinality helper getValid() provides a default cardinality');
    });


    QUnit
        .cases(cardinalityList)
        .test('helpers/cardinality.getConstantByName() ', function (data, assert) {
            QUnit.expect(1);
            assert.equal(cardinalityHelper.getConstantByName(data.title.toLowerCase()), data.value, 'The cardinality ' + data.title + ' has index ' + data.value);
        });


    QUnit
        .cases(cardinalityList)
        .test('helpers/cardinality.getNameByConstant() ', function (data, assert) {
            QUnit.expect(1);
            assert.equal(cardinalityHelper.getNameByConstant(data.value), data.title, 'The constant ' + data.value + ' refers to cardinality ' + data.title);
        });


    QUnit.test('helpers/cardinality.getConstantByName(unknown)', function (assert) {
        QUnit.expect(1);
        assert.equal(cardinalityHelper.getConstantByName('foo'), false, 'An unknown cardinality has not index');
    });


    QUnit.test('helpers/cardinality.getNameByConstant(100)', function (assert) {
        QUnit.expect(1);
        assert.equal(cardinalityHelper.getNameByConstant(100), false, 'A constant out the cardinality range does not mean anything');
    });
});
