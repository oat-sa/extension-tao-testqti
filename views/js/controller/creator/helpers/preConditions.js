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
 * Copyright (c) 2025 (original work) Open Assessment Technologies SA;
 */

define([
    'lodash',
    'taoQtiTest/controller/creator/helpers/baseType',
    'taoQtiTest/controller/creator/helpers/operatorMap'
], function (_, baseTypeHelper, operatorMap) {
    'use strict';

    const { opToQti, qtiToOp } = operatorMap;
    
    /**
     * Check whether a given node is a QTI preCondition element.
     * @param {*} node - Any node to inspect.
     * @returns {boolean} True if node represents a QTI preCondition.
     */
    function isQtiPreCondition(node) {
        return node && typeof node === 'object' && node['qti-type'] === 'preCondition';
    }

    /**
     * Convert a UI precondition row into a QTI-compatible preCondition object.
     *
     * @param {Object} row - The flat UI precondition object.
     * @param {string} row.variable - The variable (outcome identifier).
     * @param {string} row.operator - The operator code (lt, lte, eq, gt, gte).
     * @param {number|string} row.value - The comparison value.
     * @returns {Object} A QTI preCondition object ready for serialization.
     */
    function buildQtiPreCondition(row) {
        const op = opToQti[row.operator] || 'lt';
        let n = Number(row.value);
        if (!Number.isFinite(n)) {
            n = 0;
        }

        const type = Number.isInteger(n) ? baseTypeHelper.INTEGER : baseTypeHelper.FLOAT;
        const baseType = baseTypeHelper.getValid(type, baseTypeHelper.FLOAT);

        return {
            'qti-type': 'preCondition',
            expression: {
                'qti-type': op,
                expressions: [
                    { 'qti-type': 'variable', identifier: row.variable || '', weightIdentifier: '' },
                    { 'qti-type': 'baseValue', baseType: baseType, value: n }
                ]
            }
        };
    }

    /**
     * Parse a QTI preCondition into a flat UI row structure.
     *
     * @param {Object} qtiPreCond - The QTI preCondition node.
     * @returns {Object} The normalized UI precondition row.
     */
    function parseQtiPreCondition(qtiPreCond) {
        const expr = (qtiPreCond && qtiPreCond.expression) || {};
        const op = qtiToOp[expr['qti-type']] || 'lt';
        const parts = expr.expressions || [];

        const varExpr = parts.find(function (p) { return p && p['qti-type'] === 'variable'; }) || {};
        const valueExpr = parts.find(function (p) { return p && p['qti-type'] === 'baseValue'; }) || {};

        const raw = valueExpr.value;
        const num = raw === '' || raw === undefined ? 0 : Number(raw);
        const value = Number.isFinite(num) ? num : 0;

        return {
            variable: varExpr.identifier || '',
            operator: op,
            value: value,
            __qti: qtiPreCond
        };
    }

    /**
     * Convert all QTI-formatted preConditions within a test model
     * into UI-friendly flat objects (used on load or re-entry).
     *
     * @param {Object} testModel - The assessment test model.
     */
    function normalizeModel(testModel) {
        if (!testModel || !Array.isArray(testModel.testParts)) {
            return;
        }

        testModel.testParts.forEach(function (tp) {
            if (!tp) {
                return;
            }

            if (!Array.isArray(tp.preConditions)) {
                tp.preConditions = [];
                return;
            }

            if (tp.preConditions.length && isQtiPreCondition(tp.preConditions[0])) {
                tp.preConditions = tp.preConditions.map(parseQtiPreCondition);
            }
        });
    }

    /**
     * Serialize all UI-formatted preConditions in a test model
     * back to QTI preCondition objects (used before save).
     *
     * @param {Object} testModel - The assessment test model.
     */
    function serializeModel(testModel) {
        if (!testModel || !Array.isArray(testModel.testParts)) {
            return;
        }

        testModel.testParts.forEach(function (tp) {
            if (!tp || !Array.isArray(tp.preConditions)) {
                return;
            }
            // already in QTI form
            if (tp.preConditions.length && isQtiPreCondition(tp.preConditions[0])) {
                return;
            }
            tp.preConditions = tp.preConditions.map(buildQtiPreCondition);
        });
    }

    /**
     * Remove any preconditions whose variable no longer exists in outcomeDeclarations.
     * Useful right after "regenerate outcomes".
     * @param {Object} testModel
     */
    function purgeConditionsWithMissingVariables(testModel) {
        const existing = new Set(
            (testModel.outcomeDeclarations || [])
                .map(o => o && o.identifier)
                .filter(Boolean)
        );

        (testModel.testParts || []).forEach(tp => {
            if (Array.isArray(tp.preConditions)) {
                tp.preConditions = tp.preConditions.filter(r => r && existing.has(r.variable));
            }
        });
    }

    // ---------- public API ----------
    return {
        /** Convert all QTI preConditions in the model to flat rows. */
        normalizeModel: normalizeModel,
        /** Convert all flat preConditions in the model to QTI objects. */
        serializeModel: serializeModel,
        /** Build a single QTI preCondition from a flat row. */
        buildQtiPreCondition: buildQtiPreCondition,
        /** Parse a single QTI preCondition into a flat row. */
        parseQtiPreCondition: parseQtiPreCondition,
        /** Remove preconditions with variables missing from outcomeDeclarations. */
        purgeConditionsWithMissingVariables
    };
});