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
     * NOT branching rule
     *
     * @param {Object} branchRuleDefinition       the definition object of the branch rule, which contains additional branching rules, and also the target
     * @param {Object} item                       item object from the itemStore
     * @param {Object} navigationParams           object of navigation parameters which got passed to the navigation action
     * @param {branchRuleMapper} branchRuleMapper
     * @param {responseStore} responseStore
     */

    function notBranchRuleFactory(branchRuleDefinition, item, navigationParams, branchRuleMapper, responseStore) {
      // If the NOT branching rule has only one child, cast it as an array
      if (!Array.isArray(branchRuleDefinition)) {
        branchRuleDefinition = [branchRuleDefinition];
      }

      return {
        /**
         * Evaluates a NOT expression on the given expressions and returns an array of results
         * @returns {Promise<boolean[]>}
         */
        validate: function validate() {
          var promises = branchRuleDefinition.map(function (expression) {
            var subBranchRuleName = _.head(_.keys(expression)),
                subBranchRuleDefinition = expression[subBranchRuleName];

            return branchRuleMapper(subBranchRuleName, subBranchRuleDefinition, item, navigationParams, responseStore).validate();
          });
          return Promise.all(promises).then(function (results) {
            return _.map(results, function (result) {
              return !result;
            });
          });
        }
      };
    }

    return notBranchRuleFactory;

});
