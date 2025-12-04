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
 * Copyright (c) 2025
 */

define([
    'taoQtiTest/controller/creator/helpers/operatorMap'
], function (operatorMap) {
    'use strict';

    const operatorMapApi = [
        { title: 'opToQti' },
        { title: 'qtiToOp' }
    ];

    QUnit.module('helpers/operatorMap');

    QUnit.test('module exports object', function (assert) {
        assert.expect(1);
        assert.equal(typeof operatorMap, 'object', 'operatorMap helper should export an object');
    });

    QUnit.cases
        .init(operatorMapApi)
        .test('helpers/operatorMap API', function (data, assert) {
            assert.expect(1);
            assert.ok(
                typeof operatorMap[data.title] === 'object',
                `"${data.title}" should be exported as an object`
            );
        });

    QUnit.module('operatorMap - opToQti');

    QUnit.test('opToQti maps UI → QTI correctly', function (assert) {
        const { opToQti } = operatorMap;

        assert.expect(5);
        assert.equal(opToQti.lt, 'lt', 'lt → lt');
        assert.equal(opToQti.lte, 'lte', 'lte → lte');
        assert.equal(opToQti.eq, 'equal', 'eq → equal');
        assert.equal(opToQti.gt, 'gt', 'gt → gt');
        assert.equal(opToQti.gte, 'gte', 'gte → gte');
    });

    QUnit.test('opToQti does not contain unexpected keys', function (assert) {
        const keys = Object.keys(operatorMap.opToQti);
        assert.deepEqual(
            keys.sort(),
            ['eq', 'gt', 'gte', 'lt', 'lte'],
            'opToQti should contain exactly 5 operators'
        );
    });

    QUnit.module('operatorMap - qtiToOp');

    QUnit.test('qtiToOp maps QTI → UI correctly', function (assert) {
        const { qtiToOp } = operatorMap;

        assert.expect(6);
        assert.equal(qtiToOp.lt, 'lt', 'lt → lt');
        assert.equal(qtiToOp.lte, 'lte', 'lte → lte');
        assert.equal(qtiToOp.eq, 'eq', 'eq → eq');
        assert.equal(qtiToOp.equal, 'eq', 'equal → eq');
        assert.equal(qtiToOp.gt, 'gt', 'gt → gt');
        assert.equal(qtiToOp.gte, 'gte', 'gte → gte');
    });

    QUnit.test('qtiToOp does not contain unexpected keys', function (assert) {
        const keys = Object.keys(operatorMap.qtiToOp);
        assert.deepEqual(
            keys.sort(),
            ['eq', 'equal', 'gt', 'gte', 'lt', 'lte'],
            'qtiToOp should contain all QTI operator names'
        );
    });

    QUnit.module('operatorMap - consistency');

    QUnit.test('Round trip UI → QTI → UI resolves correctly', function (assert) {
        const { opToQti, qtiToOp } = operatorMap;

        const uiOps = ['lt', 'lte', 'eq', 'gt', 'gte'];

        assert.expect(uiOps.length);

        uiOps.forEach(ui => {
            const qti = opToQti[ui];
            const back = qtiToOp[qti];
            assert.equal(back, ui, `${ui} → ${qti} → ${back}`);
        });
    });

    QUnit.test('Unknown QTI operator returns undefined (handled by callers)', function (assert) {
        const { qtiToOp } = operatorMap;
        assert.strictEqual(qtiToOp.UNKNOWN, undefined, 'Unknown QTI operator → undefined');
    });

    QUnit.test('Unknown UI operator returns undefined (handled by callers)', function (assert) {
        const { opToQti } = operatorMap;
        assert.strictEqual(opToQti.UNKNOWN, undefined, 'Unknown UI operator → undefined');
    });
});