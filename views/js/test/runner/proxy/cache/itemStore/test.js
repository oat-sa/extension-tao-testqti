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
 * Copyright (c) 2017 Open Assessment Technologies SA ;
 */


/**
 * Test of taoQtiTest/runner/proxy/cache/itemStore
 *
 * @author Bertrand Chevrier <bertrand@taotesting.com>
 */
define([
    'taoQtiTest/runner/proxy/cache/itemStore'
], function(itemStoreFactory) {
    'use strict';

    QUnit.module('API');


    QUnit.test('module', function (assert){
        QUnit.expect(1);

        assert.equal(typeof itemStoreFactory, 'function', "The module exposes a function");
    });

    QUnit.test('factory', function (assert){
        QUnit.expect(2);

        assert.equal(typeof itemStoreFactory(), 'object', "The factory creates an object");
        assert.notDeepEqual(itemStoreFactory(), itemStoreFactory(), "The factory creates a new object");
    });

    QUnit.test('instance', function (assert){
        var itemStore;
        QUnit.expect(5);

        itemStore = itemStoreFactory();

        assert.equal(typeof itemStore.get, 'function', "The store exposes the method get");
        assert.equal(typeof itemStore.has, 'function', "The store exposes the method has");
        assert.equal(typeof itemStore.set, 'function', "The store exposes the method set");
        assert.equal(typeof itemStore.remove, 'function', "The store exposes the method remove");
        assert.equal(typeof itemStore.clear, 'function', "The store exposes the method clear");
    });


    QUnit.module('behavior');

    QUnit.test('basic access', function(assert){
        var itemStore;
        var item = { foo : true };
        var key  = 'item1';
        QUnit.expect(5);

        itemStore = itemStoreFactory();
        assert.equal(typeof itemStore, 'object', "The store is an object");

        assert.equal(itemStore.has(key), false, 'The store does not contains the given item');
        assert.equal(itemStore.get(key), false, 'The store does not contains the given item');

        itemStore.set(key, item);
        assert.ok( itemStore.has(key), 'The store contains the given item');
        assert.deepEqual(itemStore.get(key), item, 'The store gives the correct item');
    });

    QUnit.test('limited size', function(assert){
        var itemStore;
        QUnit.expect(15);

        itemStore = itemStoreFactory(4);
        assert.equal(typeof itemStore, 'object', "The store is an object");

        itemStore.set('item1', { name : 'item1'});
        assert.ok(itemStore.has('item1'), 'The store contains the given item');

        itemStore.set('item2', { name : 'item2'});
        assert.ok(itemStore.has('item1'), 'The store contains the given item');
        assert.ok(itemStore.has('item2'), 'The store contains the given item');

        itemStore.set('item3', { name : 'item3'});
        assert.ok(itemStore.has('item1'), 'The store contains the given item');
        assert.ok(itemStore.has('item2'), 'The store contains the given item');
        assert.ok(itemStore.has('item3'), 'The store contains the given item');

        itemStore.set('item4', { name : 'item4'});
        assert.ok(itemStore.has('item1'), 'The store contains the given item');
        assert.ok(itemStore.has('item2'), 'The store contains the given item');
        assert.ok(itemStore.has('item3'), 'The store contains the given item');
        assert.ok(itemStore.has('item4'), 'The store contains the given item');

        itemStore.set('item5', { name : 'item5'});
        assert.ok(itemStore.has('item2'), 'The store contains the given item');
        assert.ok(itemStore.has('item3'), 'The store contains the given item');
        assert.ok(itemStore.has('item4'), 'The store contains the given item');
        assert.ok(itemStore.has('item5'), 'The store contains the given item');
    });

    QUnit.test('remove', function(assert){
        var itemStore;
        QUnit.expect(10);

        itemStore = itemStoreFactory(4);
        assert.equal(typeof itemStore, 'object', "The store is an object");

        itemStore.set('item1', { name : 'item1'});
        itemStore.set('item2', { name : 'item2'});
        itemStore.set('item3', { name : 'item3'});
        itemStore.set('item4', { name : 'item4'});
        assert.ok(itemStore.has('item1'), 'The store contains the given item');
        assert.ok(itemStore.has('item2'), 'The store contains the given item');
        assert.ok(itemStore.has('item3'), 'The store contains the given item');
        assert.ok(itemStore.has('item4'), 'The store contains the given item');

        itemStore.remove('item3');
        assert.ok( ! itemStore.has('item3'), 'The item was removed from the store');

        itemStore.set('item5', { name : 'item5'});
        assert.ok(itemStore.has('item1'), 'The store contains the given item');
        assert.ok(itemStore.has('item2'), 'The store contains the given item');
        assert.ok(itemStore.has('item4'), 'The store contains the given item');
        assert.ok(itemStore.has('item5'), 'The store contains the given item');

    });

    QUnit.test('clear', function(assert){
        var itemStore;
        QUnit.expect(7);

        itemStore = itemStoreFactory(4);
        assert.equal(typeof itemStore, 'object', "The store is an object");

        itemStore.set('item1', { name : 'item1'});
        itemStore.set('item2', { name : 'item2'});
        itemStore.set('item3', { name : 'item3'});
        assert.ok(itemStore.has('item1'), 'The store contains the given item');
        assert.ok(itemStore.has('item2'), 'The store contains the given item');
        assert.ok(itemStore.has('item3'), 'The store contains the given item');

        itemStore.clear();
        assert.ok( ! itemStore.has('item1'), 'The item was removed from the store');
        assert.ok( ! itemStore.has('item2'), 'The item was removed from the store');
        assert.ok( ! itemStore.has('item3'), 'The item was removed from the store');
    });
});
