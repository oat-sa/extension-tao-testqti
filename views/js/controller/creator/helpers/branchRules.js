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
    'jquery',
    'lodash',
    'i18n',
    'taoQtiTest/controller/creator/helpers/baseType',
    'taoQtiTest/controller/creator/helpers/operatorMap'
], function ($, _, __, baseTypeHelper, operatorMap) {
    'use strict';

    const { opToQti, qtiToOp } = operatorMap;
    
    /**
     * Check whether a given node is a QTI BranchRule element.
     * @param {*} node - Any node to inspect.
     * @returns {boolean} True if node represents a QTI branchRule.
     */
    function isQtiBranchRule(node) {
        return node && typeof node === 'object' && node['qti-type'] === 'branchRule';
    }

    /**
     * Convert a UI branch rule row into a QTI-compatible branchRule object.
     *
     * @param {Object} row - The flat UI rule object.
     * @param {string} row.target - The target testPart identifier.
     * @param {string} row.variable - The variable (outcome identifier).
     * @param {string} row.operator - The operator code (lt, lte, eq, gt, gte).
     * @param {number|string} row.value - The comparison value.
     * @returns {Object} A QTI branchRule object ready for serialization.
     */
    function buildQtiBranchRule(row) {
        const op = opToQti[row.operator] || 'lt';
        let n = Number(row.value);
        if (!Number.isFinite(n)) n = 0;

        const type = Number.isInteger(n) ? baseTypeHelper.INTEGER : baseTypeHelper.FLOAT;
        const baseType = baseTypeHelper.getValid(type, baseTypeHelper.FLOAT);

        return {
        'qti-type': 'branchRule',
        target: row.target || '',
        expression: {
            'qti-type': op,
            expressions: [
            { 'qti-type': 'variable', identifier: row.variable || '', weightIdentifier: '' },
            { 'qti-type': 'baseValue', baseType, value: n }
            ]
        }
        };
    }

    /**
     * Parse a QTI branchRule into a flat UI row structure.
     *
     * @param {Object} qtiRule - The QTI branchRule node.
     * @returns {Object} The normalized UI branch rule row.
     */
    function parseQtiBranchRule(qtiRule) {
        const expr = (qtiRule && qtiRule.expression) || {};
        const op = qtiToOp[expr['qti-type']] || 'lt';
        const parts = expr.expressions || [];

        const varExpr = parts.find(p => p && p['qti-type'] === 'variable') || {};
        const valueExpr = parts.find(p => p && p['qti-type'] === 'baseValue') || {};

        const raw = valueExpr.value;
        const num = raw === '' || raw === undefined ? 0 : Number(raw);
        const value = Number.isFinite(num) ? num : 0;

        return {
        target: qtiRule.target || '',
        variable: varExpr.identifier || '',
        operator: op,
        value,
        __qti: qtiRule
        };
    }

    /**
     * Convert all QTI-formatted branchRules within a test model
     * into UI-friendly flat objects (used on load or re-entry).
     *
     * @param {Object} testModel - The assessment test model.
     */
    function normalizeModel(testModel) {
        if (!testModel || !Array.isArray(testModel.testParts)) return;

        testModel.testParts.forEach(tp => {
        if (!tp) return;

        if (!Array.isArray(tp.branchRules)) {
            tp.branchRules = [];
            return;
        }

        if (tp.branchRules.length && isQtiBranchRule(tp.branchRules[0])) {
            tp.branchRules = tp.branchRules.map(parseQtiBranchRule);
        }
        });
    }

    /**
     * Serialize all UI-formatted branchRules in a test model
     * back to QTI branchRule objects (used before save).
     *
     * @param {Object} testModel - The assessment test model.
     */
    function serializeModel(testModel) {
        if (!testModel || !Array.isArray(testModel.testParts)) return;

        testModel.testParts.forEach(tp => {
        if (!tp || !Array.isArray(tp.branchRules)) return;
        if (tp.branchRules.length && isQtiBranchRule(tp.branchRules[0])) return;
        tp.branchRules = tp.branchRules.map(buildQtiBranchRule);
        });
    }

    /**
     * Build global branch rule options (targets, variables, operators)
     * based on the current test model.
     *
     * @param {Object} testModel - The full test model.
     * @returns {Object} branchOptions containing targets, variables, operators arrays.
     */
    function buildGlobalBranchOptions(testModel) {
        const targets = [
        ...(testModel.testParts || []).map(tp => ({ value: tp.identifier, label: tp.identifier })),
        { value: 'EXIT_TEST', label: __('Test end') }
        ];

        const variables = (testModel.outcomeDeclarations || [])
        .map(o => ({ value: o.identifier, label: o.identifier }));

        const operators = [
        { value: 'lt',  label: '<'  },
        { value: 'lte', label: '≤'  },
        { value: 'eq',  label: '='  },
        { value: 'gt',  label: '>'  },
        { value: 'gte', label: '≥'  }
        ];

        return { targets, variables, operators };
    }

    /**
     * Refresh and broadcast global branch options if they changed.
     * Triggers 'branch-options-update' on modelOverseer when updated.
     *
     * @param {Object} modelOverseer - The test creator model overseer.
     * @returns {Object} The updated branchOptions configuration.
     */
    function refreshOptions(modelOverseer) {
        const cfg = modelOverseer.getConfig();
        const mdl = modelOverseer.getModel();

        const next = buildGlobalBranchOptions(mdl);
        const prev = cfg.branchOptions;

        const changed =
        !prev ||
        prev.targets.length   !== next.targets.length   ||
        prev.variables.length !== next.variables.length ||
        prev.operators.length !== next.operators.length ||
        prev.targets.some((t, i)   => !next.targets[i]   || next.targets[i].value   !== t.value) ||
        prev.variables.some((v, i) => !next.variables[i] || next.variables[i].value !== v.value);

        if (changed) {
            cfg.branchOptions = next;
            modelOverseer.trigger('branch-options-update');
        }

        return cfg.branchOptions;
    }

    /**
     * Bind live synchronization of branch options with model changes.
     * Handles adds, deletes, renames, and outcome updates.
     *
     * @param {Object} modelOverseer - The model overseer instance to observe.
     */
    function bindSync(modelOverseer) {
        const ns = '.branchOptions-sync';
        const debounced = _.debounce(() => refreshOptions(modelOverseer), 0);

        // testPart add (adder fires add.binder on .testparts)
        $(document)
        .off(`add.binder${ns}`, '.testparts')
        .on(`add.binder${ns}`, '.testparts', function (e, $node /* , added */) {
            if (e.namespace !== 'binder') return;
            if ($node && $node.hasClass('testpart')) {
            setTimeout(debounced, 0);
            }
        });

        // testPart delete / undo
        $('.testparts')
        .off(`deleted.deleter${ns} undo.deleter${ns}`)
        .on(`deleted.deleter${ns} undo.deleter${ns}`, debounced);

        // testPart rename (identifier change)
        $(document)
        .off(`change.binder${ns}`)
        .on(`change.binder${ns}`, (e, model) => {
            if (e.namespace !== 'binder') return;
            if (model && model['qti-type'] === 'testPart') debounced();
        });

        // outcome add / rename
        $(document)
        .off(`change.binder.branchOutcomes${ns}`)
        .on(`change.binder.branchOutcomes${ns}`, (e, model) => {
            if (e.namespace !== 'binder') return;
            if (model && model['qti-type'] === 'outcomeDeclaration') debounced();
        });

        // outcome delete / undo
        $(document)
        .off(`deleted.deleter.branchOutcomes${ns} undo.deleter.branchOutcomes${ns}`, '.outcome-declarations-manual')
        .on(`deleted.deleter.branchOutcomes${ns} undo.deleter.branchOutcomes${ns}`, '.outcome-declarations-manual', () => {
            setTimeout(debounced, 0);
        });
    }

    /**
     * Find all branch rules that target a given testPart id.
     * @param {Object} testModel
     * @param {string} targetId
     * @returns {{count:number, samples:Array<{part:string,index:number}>}} 
     *   count: total matches; samples: up to 5 refs (part identifier and rule index within that part).
     */
    function collectBranchRuleRefsByTarget(testModel, targetId) {
        const out = [];
        (testModel.testParts || []).forEach(tp => {
            (tp.branchRules || []).forEach((r, idx) => {
                if (r && r.target === targetId) {
                    out.push({ part: tp.identifier, index: idx });
                }
            });
        });
        return {
            count: out.length,
            samples: out.slice(0, 5)
        };
    }

    /**
     * Find all branch rules that reference a given outcome variable id.
     * @param {Object} testModel
     * @param {string} variableId
     * @returns {{count:number, samples:Array<{part:string,index:number}>}}
     *   count: total matches; samples: up to 5 refs (part identifier and rule index within that part).
     */
    function collectBranchRuleRefsByVariable(testModel, variableId) {
        const out = [];
        (testModel.testParts || []).forEach(tp => {
            (tp.branchRules || []).forEach((r, idx) => {
                if (r && r.variable === variableId) {
                    out.push({ part: tp.identifier, index: idx });
                }
            });
        });
        return { count: out.length, samples: out.slice(0, 5) };
    }

    /**
     * Remove all branch rules across the test that target a given testPart id.
     * Typically called when that testPart is being deleted/renamed.
     * @param {Object} testModel
     * @param {string} targetId
     */
    function purgeRulesWithMissingTargets(testModel, targetId) {
        (testModel.testParts || []).forEach(tp => {
            if (Array.isArray(tp.branchRules)) {
                tp.branchRules = tp.branchRules.filter(r => r && r.target !== targetId);
            }
        });
    }

    /**
     * Remove any branch rules whose variable no longer exists in outcomeDeclarations.
     * Useful right after "regenerate outcomes".
     * @param {Object} testModel
     */
    function purgeRulesWithMissingVariables(testModel) {
        const existing = new Set(
            (testModel.outcomeDeclarations || []).map(o => o && o.identifier).filter(Boolean)
        );
        (testModel.testParts || []).forEach(tp => {
            if (Array.isArray(tp.branchRules)) {
                tp.branchRules = tp.branchRules.filter(r => r && existing.has(r.variable));
            }
        });
    }

  // ---------- public API ----------
  return {
    /** Convert all QTI branch rules in the model to flat rows. */
    normalizeModel,
    /** Convert all flat branch rules in the model to QTI objects. */
    serializeModel,
    /** Build a single QTI branchRule from a flat row. */
    buildQtiBranchRule,
    /** Parse a single QTI branchRule into a flat row. */
    parseQtiBranchRule,
    /** Refresh global branch options from the model. */
    refreshOptions,
    /** Bind event listeners to auto-refresh branch options. */
    bindSync,
    /** Find all branch rules that target a given testPart id */
    collectBranchRuleRefsByTarget,
    /** Find all branch rules that reference a given outcome variable id. */
    collectBranchRuleRefsByVariable,
    /** Remove all rules across the test that target a given testPart id. */
    purgeRulesWithMissingTargets,
    /** Remove all rules whose variable no longer exists in outcomeDeclarations. */
    purgeRulesWithMissingVariables
  };
});