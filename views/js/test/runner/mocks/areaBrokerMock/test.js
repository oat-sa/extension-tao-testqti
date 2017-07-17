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
    'lodash',
    'jquery',
    'taoQtiTest/test/runner/mocks/areaBrokerMock'
], function (_, $, areaBrokerMock) {
    'use strict';

    QUnit.module('API');


    QUnit.test('module', 1, function (assert) {
        assert.equal(typeof areaBrokerMock, 'function', "The module exposes a function");
    });


    QUnit.test('factory', 21, function (assert) {
        var extraArea = 'extra';
        var areas = [
            'content',
            'toolbox',
            'navigation',
            'control',
            'header',
            'panel'
        ];
        var broker = areaBrokerMock();

        assert.equal(typeof broker, 'object', "The factory creates an object");
        assert.equal(broker.getContainer().length, 1, "The container exists");
        assert.equal(broker.getContainer().children().length, areas.length, "The container contains the exact number of areas");

        _.forEach(areas, function (area) {
            assert.equal(broker.getContainer().find('.' + area).length, 1, "The container must contain an area related to " + area);
        });

        broker = areaBrokerMock({ areas: [extraArea] });

        assert.equal(typeof broker, 'object', "The factory creates an object");
        assert.equal(broker.getContainer().length, 1, "The container exists");
        assert.equal(broker.getContainer().children().length, areas.length + 1, "The container contains the exact number of areas");
        assert.equal(broker.getContainer().find('.' + extraArea).length, 1, "The container must contain the extra area");

        _.forEach(areas, function (area) {
            assert.equal(broker.getContainer().find('.' + area).length, 1, "The container must contain an area related to " + area);
        });

        assert.notEqual(areaBrokerMock(), areaBrokerMock(), "The factory creates new instances");
        assert.notEqual(areaBrokerMock().getContainer().get(0), areaBrokerMock().getContainer().get(0), 'The factory creates a new container for each instance');
    });


    QUnit.test('broker api', 5, function (assert) {
        var areas = [
            'content',
            'toolbox',
            'navigation',
            'control',
            'header',
            'panel'
        ];
        var broker = areaBrokerMock({ areas: areas });

        assert.equal(broker.getContainer().length, 1, "The container exists");
        assert.equal(broker.getContainer().children().length, areas.length, "The container contains the exact number of areas");

        assert.equal(typeof broker.defineAreas, 'function', 'The broker has a defineAreas function');
        assert.equal(typeof broker.getContainer, 'function', 'The broker has a getContainer function');
        assert.equal(typeof broker.getArea, 'function', 'The broker has a getArea function');
    });


    QUnit.test('retrieve', 8, function (assert) {
        var areas = [
            'content',
            'toolbox',
            'navigation',
            'control',
            'header',
            'panel'
        ];
        var broker = areaBrokerMock({ areas: areas });

        assert.equal(broker.getContainer().length, 1, "The container exists");
        assert.equal(broker.getContainer().children().length, areas.length, "The container contains the exact number of areas");

        _.forEach(areas, function (area) {
            assert.equal(broker.getArea(area).length, 1, "The container can retrieve the area " + area);
        });
    });


    QUnit.test('custom mapping', function (assert) {
        var $brokerContainer = $('#custom-areas'),
            mapping = {
                'content':      $brokerContainer.find('.custom-content'),
                'actionsbar':   $brokerContainer.find('.custom-actionbars'),
                'toolbox':      $brokerContainer.find('.custom-toolbox'),
                'navigation':   $brokerContainer.find('.custom-nav')
            };

        var broker = areaBrokerMock({
            $brokerContainer: $brokerContainer,
            mapping: mapping,
            areas: ['customArea']
        });

        _.forOwn(mapping, function (area, areaId) {
            assert.equal(broker.getArea(areaId), mapping[areaId], "The area broker contains the right dom element for " + areaId);
        });
        assert.equal(broker.getArea('customArea').length, 1, "The container can retrieve the area customArea");
    });


    QUnit.test('toolbox component', 5, function (assert) {
        var areas = [
            'content',
            'toolbox',
            'navigation',
            'control',
            'header',
            'panel'
        ];
        var broker = areaBrokerMock({ areas: areas }),
            component;

        assert.ok(_.isFunction(broker.getToolbox), 'the broker has a getToolbox() method');

        component = broker.getToolbox();

        assert.ok(_.isObject(component), 'the component is an object');
        assert.ok(_.isFunction(component.init), 'the component has a init() method');
        assert.ok(_.isFunction(component.render), 'the component has a render() method');
        assert.ok(_.isFunction(component.destroy), 'the component has a destroy() method');
    });
});
