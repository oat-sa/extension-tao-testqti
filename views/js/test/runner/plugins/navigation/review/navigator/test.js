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
    'lodash',
    'taoQtiTest/runner/plugins/navigation/review/navigator',
    'json!taoQtiTest/test/runner/plugins/navigation/review/navigator/data.json'
], function($, _, navigatorFactory, sample) {
    'use strict';

    QUnit.module('API');

    QUnit.test('module', function(assert) {
        QUnit.expect(1);
        assert.equal(typeof navigatorFactory, 'function', "The module exposes a function");
    });

    QUnit.test('factory', function(assert) {
        QUnit.expect(2);
        assert.equal(typeof navigatorFactory(sample.config, sample.map, sample.context), 'object', "The factory creates an object");
        assert.notDeepEqual(navigatorFactory(sample.config, sample.map, sample.context), navigatorFactory(sample.config, sample.map, sample.context), "The factory creates a new object");
    });

    QUnit.cases([{
            name: 'init',
            title: 'init'
        }, {
            name: 'destroy',
            title: 'destroy'
        }, {
            name: 'render',
            title: 'render'
        }, {
            name: 'show',
            title: 'show'
        }, {
            name: 'hide',
            title: 'hide'
        }, {
            name: 'enable',
            title: 'enable'
        }, {
            name: 'disable',
            title: 'disable'
        }, {
            name: 'is',
            title: 'is'
        }, {
            name: 'setState',
            title: 'setState'
        }, {
            name: 'getContainer',
            title: 'getContainer'
        }, {
            name: 'getElement',
            title: 'getElement'
        }, {
            name: 'getTemplate',
            title: 'getTemplate'
        }, {
            name: 'setTemplate',
            title: 'setTemplate'
        }])
        .test('component API contains ', function(data, assert) {
            var component = navigatorFactory(sample.config, sample.map, sample.context);
            QUnit.expect(1);
            assert.equal(typeof component[data.name], 'function', 'The component has the method ' + data.name);
        });

    QUnit.cases([{
            name: 'on',
            title: 'on'
        }, {
            name: 'off',
            title: 'off'
        }, {
            name: 'trigger',
            title: 'trigger'
        }, ])
        .test('eventifier API contains ', function(data, assert) {
            var component = navigatorFactory(sample.config, sample.map, sample.context);
            QUnit.expect(1);
            assert.equal(typeof component[data.name], 'function', 'The component has the method ' + data.name);
        });

    QUnit.module('Behavior');

    QUnit.asyncTest('DOM', function(assert) {
        var $container = $('#qunit-fixture');
        var component = navigatorFactory(sample.config, sample.map, sample.context);

        QUnit.expect(8);

        assert.equal($container.length, 1, 'The container exists');
        assert.equal($container.children().length, 0, 'The container is empty');

        assert.equal(typeof component, 'object', 'The component has been created');

        component
            .on('render', function() {
                var $element = $('.qti-navigator', $container);
                assert.equal($element.length, 1, 'The component has been attached to the container');
                assert.ok($element.hasClass('rendered'), 'The component has the rendered class');

                assert.equal($('.qti-navigator-filters', $element).length, 1, 'The component contains a filter section');
                assert.equal($('.qti-navigator-tree', $element).length, 1, 'The component contains a tree section');

                assert.deepEqual($element[0], this.getElement()[0], 'The found element match the one bound to the component');

                QUnit.start();
            })
            .render($container);
    });

    QUnit.asyncTest('item count', function(assert) {
        var $container = $('#qunit-fixture');
        var component = navigatorFactory(sample.config, sample.map, sample.context);

        QUnit.expect(8);

        component
            .on('update', function() {
                var $element = this.getElement();
                assert.equal($element.length, 1, 'The component has been attached to the container');
                assert.ok($element.hasClass('rendered'), 'The component has the rendered class');

                assert.equal($('.qti-navigator-viewed', $element).length, 1, 'The component contains an viewed section');
                assert.equal($('.qti-navigator-answered', $element).length, 1, 'The component contains an answered section');
                assert.equal($('.qti-navigator-unanswered', $element).length, 1, 'The component contains an unanswered section');

                assert.equal($('.qti-navigator-viewed .qti-navigator-counter', $element).text(), '1/10', "The viewed counter is correct");
                assert.equal($('.qti-navigator-answered .qti-navigator-counter', $element).text(), '0/10', "The viewed counter is correct");
                assert.equal($('.qti-navigator-unanswered .qti-navigator-counter', $element).text(), '10/10', "The viewed counter is correct");

                QUnit.start();
            })
            .render($container);
    });

    QUnit.asyncTest('inconsistent item count', function(assert) {
        var component;
        var $container = $('#qunit-fixture');
        var map = _.cloneDeep(sample.map);
        map.parts['testPart-1'].sections['assessmentSection-1'].stats = {
            questions: 0,
            answered: 2,
            viewed: 1,
            total: 2
        };
        map.parts['testPart-1'].sections['assessmentSection-1'].items = {
            "item-1": {
                "id": "item-1",
                "uri": "http://bertaoact/tao.rdf#i1486479622628292",
                "label": "Item 1",
                "position": 0,
                "positionInPart": 0,
                "positionInSection": 0,
                "index": 1,
                "occurrence": 0,
                "remainingAttempts": -1,
                "answered": true,
                "flagged": false,
                "viewed": true,
                "informational": true
            },
            "item-2": {
                "id": "item-2",
                "uri": "http://bertaoact/tao.rdf#i1486479820205295",
                "label": "Item 2",
                "position": 1,
                "positionInPart": 1,
                "positionInSection": 1,
                "index": 2,
                "occurrence": 0,
                "remainingAttempts": -1,
                "answered": true,
                "flagged": false,
                "viewed": false,
                "informational": true
            },
        };
        component = navigatorFactory(sample.config, map, sample.context);

        QUnit.expect(8);

        component
            .on('update', function() {
                var $element = this.getElement();
                assert.equal($element.length, 1, 'The component has been attached to the container');
                assert.ok($element.hasClass('rendered'), 'The component has the rendered class');

                assert.equal($('.qti-navigator-viewed', $element).length, 1, 'The component contains an viewed section');
                assert.equal($('.qti-navigator-answered', $element).length, 1, 'The component contains an answered section');
                assert.equal($('.qti-navigator-unanswered', $element).length, 1, 'The component contains an unanswered section');

                assert.equal($('.qti-navigator-viewed .qti-navigator-counter', $element).text(), '1/2', "The viewed counter is correct");
                assert.equal($('.qti-navigator-answered .qti-navigator-counter', $element).text(), '0', "The viewed counter is correct");
                assert.equal($('.qti-navigator-unanswered .qti-navigator-counter', $element).text(), '0', "The viewed counter is correct");


                QUnit.start();
            })
            .render($container);
    });


    QUnit.module('Visual');

    QUnit.asyncTest('visual test', function(assert) {
        var $container = $('#outside');

        QUnit.expect(1);

        navigatorFactory(sample.config, sample.map, sample.context)
            .on('render', function() {
                assert.ok(true);

                QUnit.start();
            })
            .render($container);
    });
});
