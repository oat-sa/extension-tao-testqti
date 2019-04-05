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
 * Copyright (c) 2019 (original work) Open Assessment Technologies SA ;
 */
/**
 * @author Martin Nicholson <martin@taotesting.com>
 */
define([
    'taoQtiTest/runner/plugins/tools/highlighter/collection'
], function(highlighterCollection) {
    'use strict';

    var collection;
    var api;
    var options = [
        {
            id: 'one'
        },
        {
            id: 'two'
        },
        {
            id: 'three'
        }
    ];

    QUnit.module('highlighterCollection');

    QUnit.test('module', function(assert) {
        assert.ok(typeof highlighterCollection === 'function', 'the module expose a function');
    });

    api = [
        {name: 'addHighlighter'},
        {name: 'getHighlighterById'},
        {name: 'getAllHighlighters'},
        {name: 'getItemHighlighter'},
        {name: 'getNonItemHighlighters'},
        {name: 'getLength'},
        {name: 'empty'}
    ];

    QUnit
        .cases.init(api)
        .test('plugin API ', function(data, assert) {
            var coll = highlighterCollection();
            assert.expect(1);

            assert.equal(typeof coll[data.name], 'function', 'The highlighterCollection instances expose a "' + data.name + '" function');
        });


    QUnit.module('collection methods');

    collection = highlighterCollection();

    QUnit.test('addHighlighter / empty', function(assert) {
        var instance = collection.addHighlighter(options[0]);
        assert.ok(typeof instance === 'object', 'An object was returned');
        assert.equal(collection.getLength(), 1, 'Collection size is correct');
        collection.empty();
        assert.equal(collection.getLength(), 0, 'Collection size is correct');
    });

    QUnit.test('get all', function(assert) {
        var all;
        collection.addHighlighter(options[0]);
        collection.addHighlighter(options[1]);
        collection.addHighlighter(options[2]);
        assert.equal(collection.getLength(), 3, 'Collection size is correct');

        all = collection.getAllHighlighters();
        assert.ok(all instanceof Array, 'An array was returned');
        assert.equal(all.length, 3, 'Array size is correct');

        collection.empty();
    });

    QUnit.test('get by id', function(assert) {
        var two;
        collection.addHighlighter(options[0]);
        collection.addHighlighter(options[1]);
        collection.addHighlighter(options[2]);

        two = collection.getHighlighterById('two');
        assert.ok(typeof two === 'object', 'An object was returned');
        assert.equal(two.getId(), 'two', 'The instance has the correct id');

        collection.empty();
    });

    QUnit.test('get item', function(assert) {
        var itemhl;
        collection.addHighlighter(options[0]);
        collection.addHighlighter(options[1]);
        collection.addHighlighter(options[2]);

        itemhl = collection.getItemHighlighter();
        assert.ok(typeof itemhl === 'object', 'An object was returned');
        assert.equal(itemhl.getId(), 'one', 'The instance has the correct id');

        collection.empty();
    });

    QUnit.test('get non-item', function(assert) {
        var nonItem;
        collection.addHighlighter(options[0]);
        collection.addHighlighter(options[1]);
        collection.addHighlighter(options[2]);

        nonItem = collection.getNonItemHighlighters();
        assert.ok(nonItem instanceof Array, 'An array was returned');
        assert.equal(nonItem.length, 2, 'Array size is correct');
        assert.equal(nonItem[0].getId(), 'two', 'The instance has the correct id');
        assert.equal(nonItem[1].getId(), 'three', 'The instance has the correct id');

        collection.empty();
    });

});
