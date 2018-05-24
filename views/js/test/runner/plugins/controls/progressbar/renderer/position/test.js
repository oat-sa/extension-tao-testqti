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
 * Copyright (c) 2018 (original work) Open Assessment Technologies SA ;
 */
/**
 * Test the progressbar's plugin percentage renderer
 */
define([
    'jquery',
    'taoQtiTest/runner/plugins/controls/progressbar/renderer/position'
], function ($, positionRendererFactory) {
    'use strict';


    QUnit.module('API');

    QUnit.test('module', function (assert) {
        QUnit.expect(3);

        assert.equal(typeof positionRendererFactory, 'function', "The positionRendererFactory module exposes a function");
        assert.equal(typeof positionRendererFactory(), 'object', "The positionRendererFactory factory produces an object");
        assert.notStrictEqual(positionRendererFactory(), positionRendererFactory(), "The positionRendererFactory factory provides a different object on each call");
    });

    QUnit.cases([
        {title: 'init'},
        {title: 'destroy'},
        {title: 'render'},
        {title: 'show'},
        {title: 'hide'},
        {title: 'enable'},
        {title: 'disable'},
        {title: 'is'},
        {title: 'setState'},
        {title: 'getContainer'},
        {title: 'getElement'},
        {title: 'getTemplate'},
        {title: 'setTemplate'}
    ]).test('Component API ', function (data, assert) {
        var instance = positionRendererFactory();
        assert.equal(typeof instance[data.title], 'function', 'The positionRendererFactory exposes the component method "' + data.title);
    });

    QUnit.cases([
        {title: 'on'},
        {title: 'off'},
        {title: 'trigger'},
        {title: 'before'},
        {title: 'after'},
    ]).test('Eventifier API ', function (data, assert) {
        var instance = positionRendererFactory();
        assert.equal(typeof instance[data.title], 'function', 'The positionRendererFactory exposes the eventifier method "' + data.title);
    });

    QUnit.cases([
        {title: 'update'}
    ]).test('Instance API ', function (data, assert) {
        var instance = positionRendererFactory();
        assert.equal(typeof instance[data.title], 'function', 'The positionRendererFactory exposes the method "' + data.title);
    });


    QUnit.module('Behavior');

    QUnit.asyncTest('Lifecycle', function (assert) {
        var $container = $('#qunit-fixture');

        QUnit.expect(1);

        positionRendererFactory()
            .on('render', function () {

                assert.ok(this.is('rendered'), 'The component is now rendered');
                this.destroy();

            })
            .on('destroy', function () {

                QUnit.start();

            })
            .render($container);
    });


    QUnit.asyncTest('Rendering hidden', function (assert) {
        var $container = $('#qunit-fixture');

        QUnit.expect(3);

        positionRendererFactory()
            .on('render', function () {

                assert.ok(this.is('rendered'), 'The component is now rendered');
                assert.ok(this.is('hidden'), 'The component is hidden');
                assert.ok(this.getElement().is(':hidden'), 'The component is rendered hidden');
                this.destroy();

            })
            .on('destroy', function () {

                QUnit.start();

            })
            .hide()
            .render($container);
    });


    QUnit.asyncTest('Rendering with label', function (assert) {
        var $container = $('#qunit-fixture');
        var data = {
            total: 3,
            position: 1,
            label: 'Item 1 of 3',
            ratio: 33
        };

        QUnit.expect(9);

        assert.equal($('[data-control="progress-label"]', $container).length, 0, 'The component label does not exists yet');
        assert.equal($('[data-control="progress-bar"]', $container).length, 0, 'The component bar does not exists yet');

        positionRendererFactory({}, data)
            .on('update', function () {

                assert.equal($('[data-control="progress-label"]', $container).length, 1, 'The component label has been inserted');
                assert.equal($('[data-control="progress-bar"]', $container).length, 1, 'The component bar has been inserted');

                assert.equal($('[data-control="progress-label"]', $container).text().trim(), data.label, 'The component label is correct');
                assert.equal($('[data-control="progress-bar"] .progressbar-point', $container).length, data.total, 'The component bar has the expected number of points');
                assert.equal($('[data-control="progress-bar"] .progressbar-point.reached', $container).length, data.position, 'The component bar displays the correct position');
                assert.equal($('[data-control="progress-bar"] .progressbar-point:eq(' + (data.position - 1) + ')', $container).hasClass('current'), true, 'The component bar displays the current position');

                assert.equal($('[data-control="progress-label"]:visible', $container).length, 1, 'The component label is visible');

                this.destroy();

            })
            .on('destroy', function () {

                QUnit.start();
            })
            .render($container);
    });


    QUnit.asyncTest('Rendering without label', function (assert) {
        var $container = $('#qunit-fixture');
        var data = {
            total: 3,
            position: 1,
            label: 'Item 1 of 3',
            ratio: 33
        };

        QUnit.expect(9);

        assert.equal($('[data-control="progress-label"]', $container).length, 0, 'The component label does not exists yet');
        assert.equal($('[data-control="progress-bar"]', $container).length, 0, 'The component bar does not exists yet');

        positionRendererFactory({showLabel: false}, data)
            .on('update', function () {

                assert.equal($('[data-control="progress-label"]', $container).length, 1, 'The component label has been inserted');
                assert.equal($('[data-control="progress-bar"]', $container).length, 1, 'The component bar has been inserted');

                assert.equal($('[data-control="progress-label"]', $container).text().trim(), data.label, 'The component label is correct');
                assert.equal($('[data-control="progress-bar"] .progressbar-point', $container).length, data.total, 'The component bar has the expected number of points');
                assert.equal($('[data-control="progress-bar"] .progressbar-point.reached', $container).length, data.position, 'The component bar displays the correct position');
                assert.equal($('[data-control="progress-bar"] .progressbar-point:eq(' + (data.position - 1) + ')', $container).hasClass('current'), true, 'The component bar displays the current position');

                assert.equal($('[data-control="progress-label"]:visible', $container).length, 0, 'The component label is not visible');

                this.destroy();

            })
            .on('destroy', function () {

                QUnit.start();
            })
            .render($container);
    });


    QUnit.asyncTest('Update progression', function (assert) {
        var $container = $('#qunit-fixture');
        var data = {
            total: 3,
            position: 1,
            label: 'Item 1 of 3',
            ratio: 33
        };

        QUnit.expect(14);

        assert.equal($('[data-control="progress-label"]', $container).length, 0, 'The component label does not exists yet');
        assert.equal($('[data-control="progress-bar"]', $container).length, 0, 'The component bar does not exists yet');

        positionRendererFactory({}, data)
            .on('render', function () {
                var self = this;
                setTimeout(function () {
                    data.label = 'Item 2 of 3';
                    data.ratio = 66;
                    self.update(data);
                }, 250);
            })
            .on('update', function () {

                assert.equal($('[data-control="progress-label"]', $container).length, 1, 'The component label has been inserted');
                assert.equal($('[data-control="progress-bar"]', $container).length, 1, 'The component bar has been inserted');

                assert.equal($('[data-control="progress-label"]', $container).text().trim(), data.label, 'The component label is correct');
                assert.equal($('[data-control="progress-bar"] .progressbar-point', $container).length, data.total, 'The component bar has the expected number of points');
                assert.equal($('[data-control="progress-bar"] .progressbar-point.reached', $container).length, data.position, 'The component bar displays the correct position');
                assert.equal($('[data-control="progress-bar"] .progressbar-point:eq(' + (data.position - 1) + ')', $container).hasClass('current'), true, 'The component bar displays the current position');

                if (data.ratio > 50) {
                    this.destroy();
                }
            })
            .on('destroy', function () {
                QUnit.start();
            })
            .render($container);
    });


    QUnit.module('Visual test');

    QUnit.asyncTest('Show', function (assert) {
        var $container = document.querySelector('#visual');

        QUnit.expect(1);

        positionRendererFactory({}, {
            total: 5,
            position: 3,
            label: 'Item 3 of 5',
            ratio: 60
        })
            .on('render', function () {
                assert.ok(true);
                QUnit.start();
            })
            .render($container);
    });

});
