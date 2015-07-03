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
    'taoQtiTest/runner/testReview',
    'json!taoQtiTest/test/samples/json/testContext.json'
], function($, _, testReview, testContextData) {
    'use strict';

    QUnit.module('testReview');


    QUnit.test('module', 3, function(assert) {
        assert.equal(typeof testReview, 'function', "The testReview module exposes a function");
        assert.equal(typeof testReview(), 'object', "The testReview factory produces an object");
        assert.notStrictEqual(testReview(), testReview(), "The testReview factory provides a different object on each call");
    });


    var testReviewApi = [
        { name : 'init', title : 'init' },
        { name : 'update', title : 'update' },
        { name : 'enable', title : 'enable' },
        { name : 'disable', title : 'disable' },
        { name : 'trigger', title : 'trigger' },
        { name : 'on', title : 'on' },
        { name : 'off', title : 'off' }
    ];

    QUnit
        .cases(testReviewApi)
        .test('instance API ', function(data, assert) {
            var instance = testReview();
            assert.equal(typeof instance[data.name], 'function', 'The testReview instance exposes a "' + data.title + '" function');
        });


    QUnit.test('install', function(assert) {
        var $fixture = $('#qti-navigator-1');
        var component;

        component = testReview($fixture.empty());

        assert.equal($fixture.children().length, 1, "The testReview instance installs a DOM structure, and this structure start with a unique element");

        component.init($fixture);

        assert.equal($fixture.children().length, 1, "The testReview instance can be re-initialized, and just overwrite previously installed DOM structure");
        assert.equal($fixture.find('.qti-navigator').length, 1, "The testReview instance install a qti-navigator element");
        assert.equal($fixture.find('.qti-navigator-info').length, 1, "The testReview instance install a qti-navigator-info element");
        assert.equal($fixture.find('.qti-navigator-info .qti-navigator-answered').length, 1, "The testReview instance install an info element for answered items");
        assert.equal($fixture.find('.qti-navigator-info .qti-navigator-unanswered').length, 1, "The testReview instance install an info element for unanswered items");
        assert.equal($fixture.find('.qti-navigator-info .qti-navigator-viewed').length, 1, "The testReview instance install an info element for viewed items");
        assert.equal($fixture.find('.qti-navigator-info .qti-navigator-flagged').length, 1, "The testReview instance install an info element for flagged items");
        assert.equal($fixture.find('.qti-navigator-filters').length, 1, "The testReview instance install a qti-navigator-filters element");
        assert.equal($fixture.find('.qti-navigator-filters [data-mode="all"]').length, 1, "The testReview instance install a filter reset element");
        assert.equal($fixture.find('.qti-navigator-filters [data-mode="unanswered"]').length, 1, "The testReview instance install a filter for unanswered items");
        assert.equal($fixture.find('.qti-navigator-filters [data-mode="flagged"]').length, 1, "The testReview instance install a filter for flagged items");
        assert.equal($fixture.find('.qti-navigator-tree').length, 1, "The testReview instance install a qti-navigator-tree element");
        assert.equal($fixture.find('.qti-navigator-linear').length, 1, "The testReview instance install a qti-navigator-linear element");

        component.update(testContextData);

        assert.equal($fixture.find('.qti-navigator-tree').children().length, 1, "The testReview instance install a navigation map once updated");
        assert.equal($fixture.find('.qti-navigator-part > .qti-navigator-label').length, 2, "The navigation map contains 2 parts");
        assert.equal($fixture.find('.qti-navigator-section > .qti-navigator-label').length, 2, "The navigation map contains 2 sections");
        assert.equal($fixture.find('.qti-navigator-item > .qti-navigator-label').length, 9, "The navigation map contains 9 items");

    });


    QUnit.asyncTest('events', function(assert) {
        var $fixture = $('#qti-navigator-2');
        var expected = 'test';
        var component;

        component = testReview($fixture.empty());

        assert.ok($fixture.children().length === 1, "The testReview instance installs a DOM structure, and this structure start with a unique element");

        component.on('custom', function(event, arg1) {
            assert.ok(true, "The testReview instance can handle custom event");
            assert.equal(arg1, expected, "The testReview instance can handle custom event with parameter");
            QUnit.start();
        });

        component.trigger('custom', [expected]);

        component.off('custom');

        QUnit.stop();
        component.trigger('custom', [expected]);

        _.defer(function() {
            assert.ok(true, "The testReview instance can handle uninstall of custom event");
            QUnit.start();
        }, 250);
    });


    QUnit.asyncTest('jump', function(assert) {
        var $fixture = $('#qti-navigator-3');
        var component = testReview($fixture.empty());

        assert.ok($fixture.children().length === 1, "The testReview instance installs a DOM structure, and this structure start with a unique element");

        component.update(testContextData);
        component.on('jump', function(event, position) {
            assert.ok(true, "The testReview instance throws jump event when the user click on an item in the map");
            assert.equal(position, 0, "The position of the item to reach must comply to the needed value");
            QUnit.start();
        });
        $fixture.find('.qti-navigator-item[data-id="item-1"] .qti-navigator-label').click();
    });


    QUnit.asyncTest('mark', function(assert) {
        var $fixture = $('#qti-navigator-4');
        var component = testReview($fixture.empty());

        assert.ok($fixture.children().length === 1, "The testReview instance installs a DOM structure, and this structure start with a unique element");

        component.update(testContextData);
        component.on('mark', function(event, flag, position) {
            assert.ok(true, "The testReview instance throws mark event when the user click on an item icon in the map");
            assert.equal(flag, true, "The flag value must comply");
            assert.equal(position, 0, "The position of the item to reach must comply to the needed value");
            QUnit.start();
        });
        $fixture.find('.qti-navigator-item[data-id="item-1"] .qti-navigator-icon').click();
    });

});
