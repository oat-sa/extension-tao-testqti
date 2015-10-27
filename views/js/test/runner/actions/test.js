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
 * Copyright (c) 2015 (original work) Open Assessment Technologies SA ;
 */
/**
 * @author Jean-Sébastien Conan <jean-sebastien.conan@vesperiagroup.com>
 */
define([
    'jquery',
    'lodash',
    'taoQtiTest/runner/runner',
    'taoQtiTest/runner/actions'
], function($, _, runner, actions) {
    'use strict';

    QUnit.module('actions');


    QUnit.test('module', 3, function(assert) {
        assert.equal(typeof actions, 'function', "The actions module exposes a function");
        assert.equal(typeof actions(), 'object', "The actions factory produces an object");
        assert.notStrictEqual(actions(), actions(), "The actions factory provides a different object on each call");
    });


    var testReviewApi = [
        { name : 'init', title : 'init' },
        { name : 'destroy', title : 'destroy' },
        { name : 'enable', title : 'enable' },
        { name : 'disable', title : 'disable' },
        { name : 'show', title : 'show' },
        { name : 'hide', title : 'hide' },
        { name : 'is', title : 'is' },
        { name : 'setup', title : 'setup' },
        { name : 'tearDown', title : 'tearDown' }
    ];

    QUnit
        .cases(testReviewApi)
        .test('instance API ', function(data, assert) {
            var instance = actions();
            assert.equal(typeof instance[data.name], 'function', 'The actions instance exposes a "' + data.title + '" function');
        });

});
