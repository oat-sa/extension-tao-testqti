define(['lodash'], function (_) { 'use strict';

    _ = _ && Object.prototype.hasOwnProperty.call(_, 'default') ? _['default'] : _;

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
     * Copyright (c) 2019 (original work) Open Assessment Technologies SA ;
     */
    /**
     * Parses sub branch rules and returns an array of results
     *
     * @param {Object} branchRuleDefinition
     * @param {Object} item
     * @param {Object} navigationParams
     * @param {Function} branchRuleMapper
     * @param {Object} responseStore
     * @returns {Promise<boolean[]>}
     */

    function evaluateSubBranchRules(branchRuleDefinition, item, navigationParams, branchRuleMapper, responseStore) {
      return new Promise(function (resolve, reject) {
        var subBranchRuleResults = [],
            promises = []; // Remove the @attributes from the branch rule definition

        branchRuleDefinition = _.omit(branchRuleDefinition, ['@attributes']);
        promises = _.map(branchRuleDefinition, function (subBranchRule, subBranchRuleName) {
          return branchRuleMapper(subBranchRuleName, branchRuleDefinition[subBranchRuleName], item, navigationParams, responseStore).validate();
        });
        Promise.all(promises).then(function (results) {
          _.forEach(results, function (subBranchRuleResult) {
            // if the result is an array (e.g. in case of NOT), add all elements of it to the results
            if (Array.isArray(subBranchRuleResult)) {
              subBranchRuleResult.forEach(function (value) {
                subBranchRuleResults.push(value);
              }); // otherwise add the single value to the results
            } else {
              subBranchRuleResults.push(subBranchRuleResult);
            }
          });

          resolve(subBranchRuleResults);
        }).catch(function (err) {
          reject(err);
        });
      });
    }

    var branchRuleHelper = {
      evaluateSubBranchRules: evaluateSubBranchRules
    };

    return branchRuleHelper;

});
