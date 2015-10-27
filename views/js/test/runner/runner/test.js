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
    'taoQtiTest/runner/runner'
], function($, _, runner) {
    'use strict';

    QUnit.module('runner');


    QUnit.test('module', 3, function(assert) {
        assert.equal(typeof runner, 'function', "The runner module exposes a function");
        assert.equal(typeof runner(), 'object', "The runner factory produces an object");
        assert.notStrictEqual(runner(), runner(), "The runner factory provides a different object on each call");
    });


    var testReviewApi = [
        { name : 'init', title : 'init' },
        { name : 'ready', title : 'ready' },
        { name : 'load', title : 'load' },
        { name : 'terminate', title : 'terminate' },
        { name : 'endAttempt', title : 'endAttempt' },
        { name : 'next', title : 'next' },
        { name : 'previous', title : 'previous' },
        { name : 'exit', title : 'exit' },
        { name : 'skip', title : 'skip' },
        { name : 'jump', title : 'jump' },
        { name : 'registerAction', title : 'registerAction' },
        { name : 'execute', title : 'execute' },
        { name : 'request', title : 'request' },
        { name : 'beforeRequest', title : 'beforeRequest' },
        { name : 'processRequest', title : 'processRequest' },
        { name : 'afterRequest', title : 'afterRequest' },
        { name : 'is', title : 'is' },
        { name : 'trigger', title : 'trigger' },
        { name : 'on', title : 'on' },
        { name : 'off', title : 'off' }
    ];

    QUnit
        .cases(testReviewApi)
        .test('instance API ', function(data, assert) {
            var instance = runner();
            assert.equal(typeof instance[data.name], 'function', 'The runner instance exposes a "' + data.title + '" function');
        });

});
