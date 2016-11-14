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
 * Copyright (c) 2016 (original work) Open Assessment Technologies SA ;
 */

define([
    'jquery',
    'taoQtiTest/runner/plugins/tools/answerMasking/mask'
], function($, maskComponentFactory) {
    'use strict';

    QUnit.module('API');

    QUnit.test('module', function(assert) {
        QUnit.expect(1);
        assert.equal(typeof maskComponentFactory, 'function', "The module exposes a function");
    });

    QUnit.test('factory', function(assert) {
        QUnit.expect(2);
        assert.equal(typeof maskComponentFactory(), 'object', "The factory creates an object");
        assert.notDeepEqual(maskComponentFactory(), maskComponentFactory(), "The factory creates a new object");
    });

    QUnit.cases([
        {name : 'init',         title : 'init'},
        {name : 'destroy',      title : 'destroy'},
        {name : 'render',       title : 'render'},
        {name : 'show',         title : 'show'},
        {name : 'hide',         title : 'hide'},
        {name : 'enable',       title : 'enable'},
        {name : 'disable',      title : 'disable'},
        {name : 'is',           title : 'is'},
        {name : 'setState',     title : 'setState'},
        {name : 'getContainer', title : 'getContainer'},
        {name : 'getElement',   title : 'getElement'},
        {name : 'getTemplate',  title : 'getTemplate'},
        {name : 'setTemplate',  title : 'setTemplate'}
    ])
    .test('component API contains ', function(data, assert) {
        var component = maskComponentFactory();
        QUnit.expect(1);
        assert.equal(typeof component[data.name], 'function', 'The component has the method ' + data.name);
    });

    QUnit.module('Visual');

    QUnit.asyncTest('visual test', function(assert) {
        var $container = $('#outside');

        QUnit.expect(1);

        maskComponentFactory()
            .on('render', function(){
                assert.ok(true);
                QUnit.start();
            })
            .init({
                x : 0,
                y : 0,
                width: 300,
                height: 200
            })
            .render($container);
    });
});
