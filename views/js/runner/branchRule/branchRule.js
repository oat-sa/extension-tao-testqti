define(['taoQtiTest/runner/branchRule/helpers/branchRuleHelper', 'taoQtiTest/runner/branchRule/branchRuleMapper'], function (branchRuleHelper, branchRuleMapper) { 'use strict';

    branchRuleHelper = branchRuleHelper && Object.prototype.hasOwnProperty.call(branchRuleHelper, 'default') ? branchRuleHelper['default'] : branchRuleHelper;
    branchRuleMapper = branchRuleMapper && Object.prototype.hasOwnProperty.call(branchRuleMapper, 'default') ? branchRuleMapper['default'] : branchRuleMapper;

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
     * Evaluates all the branch rules and returns the `@attributes.target` if the evaluation returns true, null otherwise
     *
     * @param {Object} branchRuleDefinition the definition object of the branch rule, which contains additional branching rules, and also the target
     * @param {Object} item                 item object from the itemStore
     * @param {Object} navigationParams     object of navigation parameters which got passed to the navigation action
     * @param {responseStore} responseStore
     * @returns {Promise<string|null>}
     */

    function branchRuleFactory(branchRuleDefinition, item, navigationParams, responseStore) {
      return new Promise(function (resolve) {
        var result;

        if (typeof branchRuleDefinition['@attributes'] === 'undefined' || typeof branchRuleDefinition['@attributes']['target'] === 'undefined') {
          return resolve(null);
        }

        branchRuleHelper.evaluateSubBranchRules(branchRuleDefinition, item, navigationParams, branchRuleMapper, responseStore).then(function (branchRuleResults) {
          result = branchRuleResults.every(function (branchRuleResult) {
            return branchRuleResult;
          });

          if (result) {
            return resolve(branchRuleDefinition['@attributes']['target']);
          }

          resolve(null);
        });
      });
    }

    return branchRuleFactory;

});
