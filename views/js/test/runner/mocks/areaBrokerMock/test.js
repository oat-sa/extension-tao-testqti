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
 * Test the areaBroker
 *
 * @author Bertrand Chevrier <bertrand@taotesting.com>
 */
define([
    'jquery',
    'taoQtiTest/test/runner/mocks/areaBrokerMock',
], function ($, areaBrokerMock){
    'use strict';

    var fixture = '#qunit-fixture';

    QUnit.module('API');


    QUnit.test('module', 1, function (assert){
        assert.equal(typeof areaBrokerMock, 'function', "The module exposes a function");
    });


    QUnit.test('factory', 33, function (assert){
        var $fixture = $(fixture);
        var $container = $('<div />').addClass('test-runner').appendTo($fixture);
        var extraArea = 'extra';
        var areas = [
            'content',
            'toolbox',
            'navigation',
            'control',
            'header',
            'panel'
        ];

        $container.append($('<div />').addClass('dummy'));

        assert.ok($fixture.length,  "The fixture exists");
        assert.ok($container.length,  "The container exists");
        assert.equal($container.children().length, 1, "The container contains an element");

        var areaBroker = areaBrokerMock($container);

        assert.equal(typeof areaBroker, 'object', "The factory creates an object");
        assert.equal($container.find('.dummy').length, 0, "The container must be cleaned before the mocks are added");
        assert.equal($container.children().length, areas.length, "The container contains the exact number of areas");

        _.forEach(areas, function(area) {
            assert.equal($container.find('.' + area).length, 1, "The container must contain an area related to " + area);
        });

        areaBroker = areaBrokerMock($container, [extraArea]);

        assert.equal(typeof areaBroker, 'object', "The factory creates an object");
        assert.equal($container.children().length, areas.length + 1, "The container contains the exact number of areas");
        assert.equal($container.find('.' + extraArea).length, 1, "The container must contain the extra area");

        _.forEach(areas, function(area) {
            assert.equal($container.find('.' + area).length, 1, "The container must contain an area related to " + area);
        });

        assert.notEqual(areaBrokerMock(), areaBrokerMock(), "The factory creates new instances");

        areaBroker = areaBrokerMock();

        assert.notEqual(areaBroker.getContainer().get(0), $container.get(0), 'The factory has created a new container');

        assert.equal(typeof areaBroker, 'object', "The factory creates an object");
        assert.equal(areaBroker.getContainer().children().length, areas.length, "The container contains the exact number of areas");

        _.forEach(areas, function(area) {
            assert.equal(areaBroker.getContainer().find('.' + area).length, 1, "The container must contain an area related to " + area);
        });

        $('<div />').addClass('my-mock').appendTo($fixture);
        areaBroker = areaBrokerMock('.my-mock');
        assert.ok(areaBroker.getContainer().is('.my-mock'), 'The factory has retrieved the container (string)');

        $container = $('<div />').appendTo($fixture);
        areaBroker = areaBrokerMock($container.get(0));
        assert.ok(areaBroker.getContainer().is($container.get(0)), 'The factory has retrieved the container (element)');
    });


    QUnit.test('broker api', 5, function (assert){
        var $fixture = $(fixture);
        var $container = $('<div />').addClass('test-runner').appendTo($fixture);
        var areas = [
            'content',
            'toolbox',
            'navigation',
            'control',
            'header',
            'panel'
        ];

        assert.ok($container.length,  "The container exists");

        var broker = areaBrokerMock($container, areas);
        assert.equal($container.children().length, areas.length, "The container contains the exact number of areas");

        assert.equal(typeof broker.defineAreas, 'function', 'The broker has a defineAreas function');
        assert.equal(typeof broker.getContainer, 'function', 'The broker has a getContainer function');
        assert.equal(typeof broker.getArea, 'function', 'The broker has a getArea function');
    });


    QUnit.test('retrieve', function (assert){
        var $fixture = $(fixture);
        var $container = $('<div />').addClass('test-runner').appendTo($fixture);
        var areas = [
            'content',
            'toolbox',
            'navigation',
            'control',
            'header',
            'panel'
        ];

        assert.ok($container.length,  "The container exists");

        var broker = areaBrokerMock($container, areas);
        assert.equal($container.children().length, areas.length, "The container contains the exact number of areas");

        assert.deepEqual(broker.getContainer(), $container, 'The container match');

        _.forEach(areas, function(area) {
            assert.equal(broker.getArea(area).length, 1, "The container can retrieve the area " + area);
        });
    });
});
