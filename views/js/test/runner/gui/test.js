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
    'taoQtiTest/runner/gui'
], function($, _, runner, gui) {
    'use strict';

    QUnit.module('GUI');


    QUnit.test('module', 3, function(assert) {
        assert.equal(typeof gui, 'function', "The GUI module exposes a function");
        assert.equal(typeof gui(), 'object', "The GUI factory produces an object");
        assert.notStrictEqual(gui(), gui(), "The GUI factory provides a different object on each call");
    });


    var testReviewApi = [
        { name : 'init', title : 'init' },
        { name : 'destroy', title : 'destroy' },
        { name : 'render', title : 'render' },
        { name : 'is', title : 'is' },
        { name : 'enable', title : 'enable' },
        { name : 'disable', title : 'disable' },
        { name : 'show', title : 'show' },
        { name : 'hide', title : 'hide' },
        { name : 'getDom', title : 'getDom' },
        { name : 'trigger', title : 'trigger' },
        { name : 'on', title : 'on' },
        { name : 'off', title : 'off' }
    ];

    QUnit
        .cases(testReviewApi)
        .test('instance API ', function(data, assert) {
            var instance = gui();
            assert.equal(typeof instance[data.name], 'function', 'The GUI instance exposes a "' + data.title + '" function');
        });

});
