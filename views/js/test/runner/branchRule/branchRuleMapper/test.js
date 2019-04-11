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
 * @author Péter Halász <peter@taotesting.com>
 */
define([
    'taoQtiTest/runner/branchRule/branchRuleMapper'
], function(
    branchRuleMapper
) {
    'use strict';

    var mockBranchRuleDefinition = {
        variable: { '@attributes': { identifier: 'test' } },
        correct:  { '@attributes': { identifier: 'test' } }
    };

    QUnit
        .cases
        .init([
            { branchRuleName: 'match' },
            { branchRuleName: 'or' },
            { branchRuleName: 'and' },
            { branchRuleName: 'not' }
        ])
        .test('it returns the proper branch rule component', function(data, assert) {
            assert.expect(2);
            assert.equal(typeof branchRuleMapper(data.branchRuleName, mockBranchRuleDefinition), 'object');
            assert.equal(typeof branchRuleMapper(data.branchRuleName, mockBranchRuleDefinition)['validate'], 'function');
        });

    QUnit.test('it throws error when it get called with a non-existing branch rule', function(assert) {
        assert.expect(1);
        assert.throws(
            function() {
                branchRuleMapper('foobar');
            },
            new Error('Invalid branch rule name: foobar')
        );
    });
});
