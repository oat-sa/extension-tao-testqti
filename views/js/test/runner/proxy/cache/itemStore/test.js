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
    'core/promise',
    'taoQtiTest/runner/proxy/cache/itemStore'
], function(Promise, itemStoreFactory) {
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
        QUnit.expect(6);

        itemStore = itemStoreFactory();

        assert.equal(typeof itemStore.get, 'function', "The store exposes the method get");
        assert.equal(typeof itemStore.has, 'function', "The store exposes the method has");
        assert.equal(typeof itemStore.set, 'function', "The store exposes the method set");
        assert.equal(typeof itemStore.update, 'function', "The store exposes the method update");
        assert.equal(typeof itemStore.remove, 'function', "The store exposes the method remove");
        assert.equal(typeof itemStore.clear, 'function', "The store exposes the method clear");
    });


    QUnit.module('behavior');

    QUnit.asyncTest('basic access', function(assert){
        var itemStore;
        var item = { foo : true };
        var key  = 'item1';

        QUnit.expect(6);

        itemStore = itemStoreFactory();
        assert.equal(typeof itemStore, 'object', "The store is an object");

        assert.equal(itemStore.has(key), false, 'The store does not contains the given item');
        itemStore.get(key)
            .then(function(value){
                assert.equal(typeof value, 'undefined', 'The store does not contains the given item');
            })
            .then(function(){
                return itemStore.set(key, item);
            })
            .then(function(assigned){
                assert.ok(assigned, 'The value assignment is done');
                assert.ok( itemStore.has(key) , 'The store contains the given item');
                return itemStore.get(key);
            })
            .then(function(value){
                assert.deepEqual(value, item, 'The store gives the correct item');

                QUnit.start();
            })
            .catch(function(err){
                assert.ok(false, err.message);
                QUnit.start();
            });
    });

    QUnit.asyncTest('limited size', function(assert){
        var itemStore;
        QUnit.expect(15);

        itemStore = itemStoreFactory(4);
        assert.equal(typeof itemStore, 'object', "The store is an object");

        itemStore.set('item1', { name : 'item1'})
            .then(function(){
                assert.ok(itemStore.has('item1'), 'The store contains the given item');
            })
            .then(function(){
                return itemStore.set('item2', { name : 'item2'});
            })
            .then(function(){
                assert.ok(itemStore.has('item1'), 'The store contains the given item');
                assert.ok(itemStore.has('item2'), 'The store contains the given item');
            })
            .then(function(){
                return itemStore.set('item3', { name : 'item3'});
            })
            .then(function(){
                assert.ok(itemStore.has('item1'), 'The store contains the given item');
                assert.ok(itemStore.has('item2'), 'The store contains the given item');
                assert.ok(itemStore.has('item3'), 'The store contains the given item');
            })
            .then(function(){
                return itemStore.set('item4', { name : 'item4'});
            })
            .then(function(){
                assert.ok(itemStore.has('item1'), 'The store contains the given item');
                assert.ok(itemStore.has('item2'), 'The store contains the given item');
                assert.ok(itemStore.has('item3'), 'The store contains the given item');
                assert.ok(itemStore.has('item4'), 'The store contains the given item');
            })
            .then(function(){
                return itemStore.set('item5', { name : 'item5'});
            })
            .then(function(){
                assert.ok(itemStore.has('item2'), 'The store contains the given item');
                assert.ok(itemStore.has('item3'), 'The store contains the given item');
                assert.ok(itemStore.has('item4'), 'The store contains the given item');
                assert.ok(itemStore.has('item5'), 'The store contains the given item');

                QUnit.start();
            })
            .catch(function(err){
                assert.ok(false, err.message);
                QUnit.start();
            });
    });

    QUnit.asyncTest('remove', function(assert){
        var itemStore;
        QUnit.expect(13);

        itemStore = itemStoreFactory(4);
        assert.equal(typeof itemStore, 'object', "The store is an object");

        Promise
            .all([
                itemStore.set('item1', { name : 'item1'}),
                itemStore.set('item2', { name : 'item2'}),
                itemStore.set('item3', { name : 'item3'}),
                itemStore.set('item4', { name : 'item4'})
            ])
            .then(function(){
                assert.ok(itemStore.has('item1'), 'The store contains the given item');
                assert.ok(itemStore.has('item2'), 'The store contains the given item');
                assert.ok(itemStore.has('item3'), 'The store contains the given item');
                assert.ok(itemStore.has('item4'), 'The store contains the given item');
            })
            .then(function(){
                return itemStore.remove('item3');
            })
            .then(function(removed){
                assert.ok(removed, 'The removal went well');
                assert.ok( ! itemStore.has('item3'), 'The item was removed from the store');
            })
            .then(function(){
                assert.ok( ! itemStore.has('zoobizoob'), 'The item does not exists');
                return itemStore.remove('zoobizoob');
            })
            .then(function(removed){
                assert.ok(!removed, 'Nothing to remove');
            })
            .then(function(){
                return itemStore.set('item5', { name : 'item5'});
            })
            .then(function(){
                assert.ok(itemStore.has('item1'), 'The store contains the given item');
                assert.ok(itemStore.has('item2'), 'The store contains the given item');
                assert.ok(itemStore.has('item4'), 'The store contains the given item');
                assert.ok(itemStore.has('item5'), 'The store contains the given item');

                QUnit.start();
            })
            .catch(function(err){
                assert.ok(false, err.message);
                QUnit.start();
            });
    });

    QUnit.asyncTest('update', function(assert){
        var itemStore;
        QUnit.expect(9);

        itemStore = itemStoreFactory(4);
        assert.equal(typeof itemStore, 'object', "The store is an object");

        Promise
            .all([
                itemStore.set('item1', { name : 'item1'}),
                itemStore.set('item2', {
                    name : 'item2',
                    response: ['choice1', 'choice2'],
                    some: 'data'
                }),
                itemStore.set('item3', { name : 'item3'})
            ])
            .then(function(){
                assert.ok(itemStore.has('item1'), 'The store contains the given item');
                assert.ok(itemStore.has('item2'), 'The store contains the given item');
                assert.ok(itemStore.has('item3'), 'The store contains the given item');
            })
            .then(function(){
                return itemStore.update('item2', 'response', []);
            })
            .then(function(){
                return itemStore.update('item2', 'some', 'thing else');
            })
            .then(function(updated){
                assert.ok(updated, 'The updated went well');
                assert.ok(itemStore.has('item2'), 'The item is still in the store from the store');

                return itemStore.get('item2');
            })
            .then(function(newItem){
                assert.deepEqual(newItem, {
                    name : 'item2',
                    response : [],
                    some : 'thing else'
                }, 'The item has been updated correclty');
            })
            .then(function(){
                assert.ok( ! itemStore.has('zoobizoob'), 'The item does not exists');
                return itemStore.update('zoobizoob', 'nope', true);
            })
            .then(function(updated){
                assert.ok(!updated, 'Nothing to update');
            })
            .then(function(){

                QUnit.start();
            })
            .catch(function(err){
                assert.ok(false, err.message);
                QUnit.start();
            });
    });

    QUnit.asyncTest('clear', function(assert){
        var itemStore;
        QUnit.expect(8);

        itemStore = itemStoreFactory(4);
        assert.equal(typeof itemStore, 'object', "The store is an object");

        Promise
            .all([
                itemStore.set('item1', { name : 'item1'}),
                itemStore.set('item2', { name : 'item2'}),
                itemStore.set('item3', { name : 'item3'})
            ])
            .then(function(){
                assert.ok(itemStore.has('item1'), 'The store contains the given item');
                assert.ok(itemStore.has('item2'), 'The store contains the given item');
                assert.ok(itemStore.has('item3'), 'The store contains the given item');
            })
            .then(function(){
                return itemStore.clear();
            })
            .then(function(cleared){
                assert.ok(cleared, 'The clear wen well');
                assert.ok( ! itemStore.has('item1'), 'The item was removed from the store');
                assert.ok( ! itemStore.has('item2'), 'The item was removed from the store');
                assert.ok( ! itemStore.has('item3'), 'The item was removed from the store');

                QUnit.start();
            })
            .catch(function(err){
                assert.ok(false, err.message);
                QUnit.start();
            });
    });
});
