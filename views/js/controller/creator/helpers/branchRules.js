define([
  'jquery',
  'lodash',
  'taoQtiTest/controller/creator/helpers/baseType'
], function ($, _, baseTypeHelper) {
  'use strict';

  // ---------- operator maps ----------
  const opToQti = { lt: 'lt', lte: 'lte', eq: 'equal', gt: 'gt', gte: 'gte' };
  const qtiToOp = { lt: 'lt', lte: 'lte', eq: 'eq', equal: 'eq', gt: 'gt', gte: 'gte' };

  // ---------- guards ----------
  function isQtiBranchRule(node) {
    return node && typeof node === 'object' && node['qti-type'] === 'branchRule';
  }

  // ---------- converters ----------
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

  function parseQtiBranchRule(qtiRule) {
    const expr = (qtiRule && qtiRule.expression) || {};
    const op = qtiToOp[expr['qti-type']] || 'lt';
    const parts = expr.expressions || [];

    const varExpr   = parts.find(p => p && p['qti-type'] === 'variable')   || {};
    const valueExpr = parts.find(p => p && p['qti-type'] === 'baseValue') || {};

    const raw = valueExpr.value;
    const num = raw === '' || raw === undefined ? 0 : Number(raw);
    const value = Number.isFinite(num) ? num : 0;

    return {
      target:   qtiRule.target || '',
      variable: varExpr.identifier || '',
      operator: op,
      value,
      __qti: qtiRule
    };
  }

  // ---------- normalize/serialize the whole model ----------
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

  function serializeModel(testModel) {
    if (!testModel || !Array.isArray(testModel.testParts)) return;

    testModel.testParts.forEach(tp => {
      if (!tp || !Array.isArray(tp.branchRules)) return;

      // Already QTI? leave as is.
      if (tp.branchRules.length && isQtiBranchRule(tp.branchRules[0])) return;

      tp.branchRules = tp.branchRules.map(buildQtiBranchRule);
    });
  }

  // ---------- options (targets/variables/operators) ----------
  function buildGlobalBranchOptions(testModel) {
    const targets = [
      ...(testModel.testParts || []).map(tp => ({ value: tp.identifier, label: tp.identifier })),
      { value: 'EXIT_TEST', label: 'End of the test' }
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

  function bindSync(modelOverseer) {
    const ns = '.branchOptions-sync';
    const debounced = _.debounce(() => refreshOptions(modelOverseer), 0);

    // testPart add (adder fires add.binder on .testparts)
    $(document)
    .off(`add.binder${ns}`, '.testparts')
    .on(`add.binder${ns}`, '.testparts', function (e, $node /*, added */) {
        if (e.namespace !== 'binder') return;
        if ($node && $node.hasClass('testpart')) {
        // let binder update the model first, then refresh
        setTimeout(debounced, 0);
        }
    });

    // testPart delete/undo
    $('.testparts')
      .off(`deleted.deleter${ns} undo.deleter${ns}`)
      .on(`deleted.deleter${ns} undo.deleter${ns}`, debounced);

    // testPart rename (identifier changed by binder)
    $(document)
      .off(`change.binder${ns}`)
      .on(`change.binder${ns}`, (e, model) => {
        if (e.namespace !== 'binder') return;
        if (model && model['qti-type'] === 'testPart') debounced();
      });

    // outcomes add/rename (binder change)
    $(document)
      .off(`change.binder.branchOutcomes${ns}`)
      .on(`change.binder.branchOutcomes${ns}`, (e, model) => {
        if (e.namespace !== 'binder') return;
        if (model && model['qti-type'] === 'outcomeDeclaration') debounced();
      });

    // outcomes delete/undo (deleter)
    $(document)
      .off(`deleted.deleter.branchOutcomes${ns} undo.deleter.branchOutcomes${ns}`, '.outcome-declarations-manual')
      .on(`deleted.deleter.branchOutcomes${ns} undo.deleter.branchOutcomes${ns}`, '.outcome-declarations-manual', () => {
        setTimeout(debounced, 0);
      });
  }

  // ---------- public API ----------
  return {
    // conversions
    normalizeModel,
    serializeModel,
    buildQtiBranchRule,
    parseQtiBranchRule,

    // options
    refreshOptions,
    bindSync
  };
});