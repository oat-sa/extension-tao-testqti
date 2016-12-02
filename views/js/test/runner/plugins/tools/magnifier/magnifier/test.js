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
    'taoQtiTest/runner/plugins/tools/magnifier/magnifierPanel'
], function ($, magnifierPanelFactory) {
    'use strict';

    QUnit.module('API');


    QUnit.test('module', function (assert) {
        QUnit.expect(1);
        assert.equal(typeof magnifierPanelFactory, 'function', "The module exposes a function");
    });


    QUnit.test('factory', function (assert) {
        QUnit.expect(2);
        assert.equal(typeof magnifierPanelFactory(), 'object', "The factory creates an object");
        assert.notDeepEqual(magnifierPanelFactory(), magnifierPanelFactory(), "The factory creates a new object");
    });


    QUnit.cases([
        {name: 'init', title: 'init'},
        {name: 'destroy', title: 'destroy'},
        {name: 'render', title: 'render'},
        {name: 'show', title: 'show'},
        {name: 'hide', title: 'hide'},
        {name: 'enable', title: 'enable'},
        {name: 'disable', title: 'disable'},
        {name: 'is', title: 'is'},
        {name: 'setState', title: 'setState'},
        {name: 'getContainer', title: 'getContainer'},
        {name: 'getElement', title: 'getElement'},
        {name: 'getTemplate', title: 'getTemplate'},
        {name: 'setTemplate', title: 'setTemplate'},
        {name: 'getZoomLevel', title: 'getZoomLevel'},
        {name: 'getTarget', title: 'getTarget'},
        {name: 'setTarget', title: 'setTarget'},
        {name: 'zoomTo', title: 'zoomTo'},
        {name: 'zoomBy', title: 'zoomBy'},
        {name: 'zoomIn', title: 'zoomIn'},
        {name: 'zoomOut', title: 'zoomOut'},
        {name: 'update', title: 'update'}
    ])
        .test('component API contains ', function (data, assert) {
            var component = magnifierPanelFactory();
            QUnit.expect(1);
            assert.equal(typeof component[data.name], 'function', 'The component has the method ' + data.name);
        });


    QUnit.module('Behavior');


    QUnit.asyncTest('DOM', function (assert) {
        var $container = $('#qunit-fixture');
        var component = magnifierPanelFactory();

        QUnit.expect(9);

        assert.equal($container.length, 1, 'The container exists');
        assert.equal($container.children().length, 0, 'The container is empty');

        assert.equal(typeof component, 'object', 'The component has been created');

        component
            .on('render', function () {
                var $element = $('.magnifier', $container);
                assert.equal($element.length, 1, 'The component has been attached to the container');
                assert.ok($element.hasClass('rendered'), 'The component has the rendered class');
                assert.equal($('.controls', $element).length, 1, 'The controls element is there');
                assert.equal($('.controls [data-control="zoomIn"]', $element).length, 1, 'The zoomIn controls element is there');
                assert.equal($('.controls [data-control="zoomOut"]', $element).length, 1, 'The zoomOut controls element is there');
                assert.deepEqual($element[0], this.getElement()[0], 'The found element match the one bound to the component');

                QUnit.start();
            })
            .render($container);
    });


    QUnit.asyncTest('move', function (assert) {
        var $container = $('#qunit-fixture');
        var component = magnifierPanelFactory({
            x: 5,
            y: 5
        });

        QUnit.expect(6);

        assert.equal($container.length, 1, 'The container exists');
        assert.equal(typeof component, 'object', 'The component has been created');

        component
            .on('render', function () {
                var $element = this.getElement();
                var tr1 = window.getComputedStyle($element[0]).getPropertyValue('transform');
                if (!tr1) {
                    tr1 = window.getComputedStyle($element[0]).getPropertyValue('-webkit-transform');
                }

                assert.equal(tr1, 'matrix(1, 0, 0, 1, 5, 5)', 'The element has been translated to 5,5');

                this
                    .on('move', function () {
                        var tr2 = window.getComputedStyle($element[0]).getPropertyValue('transform');
                        if (!tr2) {
                            tr2 = window.getComputedStyle($element[0]).getPropertyValue('-webkit-transform');
                        }

                        assert.equal(tr2, 'matrix(1, 0, 0, 1, 15, 15)', 'The element has been translated to 15,15');

                        assert.equal(this.config.x, 15, 'The new position for x has been taken in account');
                        assert.equal(this.config.y, 15, 'The new position for y has been taken in account');

                        QUnit.start();
                    })
                    .moveTo(10, 10);
            })
            .render($container);
    });


    QUnit.asyncTest('resize', function (assert) {
        var $container = $('#qunit-fixture');
        var screenRatio = window.screen.width / window.screen.height;

        var zoomLevel = 2;
        var baseSize = 30;
        var expectedWidth = baseSize * zoomLevel;
        var expectedHeight = expectedWidth / screenRatio;
        var component = magnifierPanelFactory({
            level: zoomLevel,
            baseSize: baseSize
        });

        QUnit.expect(6);

        assert.equal($container.length, 1, 'The container exists');
        assert.equal(typeof component, 'object', 'The component has been created');

        component
            .on('render', function () {
                var $element = this.getElement();

                assert.equal($element.width(), expectedWidth, 'The computed width matches');
                assert.equal($element.height(), expectedHeight, 'The computed height matches');

                this
                    .on('resize', function () {
                        assert.equal($element.width(), 100, 'The computed width matches');
                        assert.equal($element.height(), 100, 'The computed height matches');
                        QUnit.start();
                    }).resize(100, 100);
            })
            .render($container);
    });


    QUnit.module('Visual');


    QUnit.asyncTest('visual test', function (assert) {
        var $container = $('#outside');
        var $content = $('.content', $container);

        QUnit.expect(1);

        magnifierPanelFactory()
            .on('render', function () {
                assert.ok(true);
                QUnit.start();
            })
            .render($container)
            .setTarget($content)
            .show();
    });
});
