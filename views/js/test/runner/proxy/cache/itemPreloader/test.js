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
 * Test of taoQtiTest/runner/proxy/cache/itemPreloader
 *
 * @author Bertrand Chevrier <bertrand@taotesting.com>
 */
define([
    'core/promise',
    'taoQtiTest/runner/proxy/cache/itemPreloader',
    'taoQtiTest/runner/config/assetManager',
    'json!taoQtiTest/test/runner/proxy/cache/itemPreloader/item1/item.json',
    'json!taoQtiTest/test/runner/proxy/cache/itemPreloader/item2/item.json'
], function(Promise, itemPreloaderFactory, getAssetManager, itemData, itemData2) {
    'use strict';

    var options = {
        testId : 'test-foo'
    };

    QUnit.module('API');


    QUnit.test('module', function (assert){
        QUnit.expect(3);

        assert.equal(typeof itemPreloaderFactory, 'function', "The module exposes a function");
        assert.equal(typeof itemPreloaderFactory(options), 'object', "The module is a factory");
        assert.notDeepEqual(itemPreloaderFactory(options), itemPreloaderFactory(options), "The factory creates new instances");
    });

    QUnit.test('api', function (assert){
        var itemPreloader;

        QUnit.expect(3);

        assert.throws(function(){
            itemPreloaderFactory();
        }, TypeError, 'The testId option is mandatory');

        itemPreloader = itemPreloaderFactory(options);

        assert.equal(typeof itemPreloader.preload, 'function', "The module exposes the method preload");
        assert.equal(typeof itemPreloader.unload, 'function', "The  module exposes the method unload");
    });


    QUnit.module('behavior');

    QUnit.cases([{
        title : 'nothing'
    }, {
        title : 'empty object',
        item  : {},
        itemIdentifier : 'item-1'
    }, {
        title : 'missing baseUrl',
        item  : {
            itemIdentifier : 'item-1',
            itemData : {}
        }
    }, {
        title : 'missing itemData',
        item  : {
            itemIdentifier : 'item-1',
            baseUrl : '/taoQtiTest/views'
        }
    }, {
        title : 'empty itemIdentifier',
        item  : {
            itemIdentifier : '',
            baseUrl : '/taoQtiTest/views',
            itemData : {}
        }
    }]).asyncTest('preload bad data ', function(data, assert){
        var p;
        QUnit.expect(2);

        p = itemPreloaderFactory(options).preload(data.item);

        assert.ok(p instanceof Promise);
        p.then(function(result){
            assert.ok(!result, 'No preload, no result');
            QUnit.start();
        })
        .catch(function(err){
            assert.ok(false, err);
            QUnit.start();
        });
    });

    QUnit.asyncTest('preload and unload an item', function(assert){
        var itemPreloader;
        var p;
        var styleSheet;
        var assetManager = getAssetManager(options.testId);

        QUnit.expect(11);

        //hack the Image element to assert the load
        window.Image = function(){
            assert.ok(true, 'A new image is created');
        };
        Object.defineProperty(window.Image.prototype, 'src',  {
            set: function src(url) {
                assert.equal(url, '/taoQtiTest/views/js/test/runner/proxy/cache/itemPreloader/item1/28-days.jpg');
            }
        });

        styleSheet = document.querySelector('head link[href="/taoQtiTest/views/js/test/runner/proxy/cache/itemPreloader/item1/tao-user-styles.css"]');

        assert.equal(styleSheet, null, 'The item stylesheet is not loaded');
        assert.ok( ! /^blob/.test(assetManager.resolve('sample.mp3')), 'The mp3 sample does not resolve as a blob');

        itemPreloader = itemPreloaderFactory(options);
        p = itemPreloader.preload(itemData);
        assert.ok(p instanceof Promise);

        p.then(function(result){
            assert.ok(result, 'Preloaded');

            styleSheet = document.querySelector('head link[href="/taoQtiTest/views/js/test/runner/proxy/cache/itemPreloader/item1/tao-user-styles.css"]');
            assert.ok(styleSheet instanceof HTMLLinkElement, 'The item stylesheet is loaded');

            assetManager.setData('itemIdentifier', itemData.itemIdentifier);
            assert.ok(/^blob/.test(assetManager.resolve('sample.mp3')), 'The mp3 sample resolves through a blob');
        })
        .then(function(){
            return itemPreloader.unload(itemData);
        })
        .then(function(result){
            assert.ok(result, 'Unloaded');

            styleSheet = document.querySelector('head link[href="/taoQtiTest/views/js/test/runner/proxy/cache/itemPreloader/item1/tao-user-styles.css"]');

            assert.equal(styleSheet, null, 'The item stylesheet is now removed');

            assetManager.setData('itemIdentifier', itemData.itemIdentifier);
            assert.ok( ! /^blob/.test(assetManager.resolve('sample.mp3')), 'The mp3 sample does not resolve as a blob');

            QUnit.start();
        })
        .catch(function(err){
            assert.ok(false, err);
            QUnit.start();
        });
    });


    QUnit.asyncTest('preload multiple items with an identic source URL asset', function(assert){
        var itemPreloader;
        var p;
        var styleSheet;
        var assetManager = getAssetManager(options.testId);
        var secondItem = false;

        QUnit.expect(5);

        //hack the Image element to assert the load
        window.Image = function(){
            //called twice
            assert.ok(true, 'A new image is created');
        };
        Object.defineProperty(window.Image.prototype, 'src',  {
            set: function src(url) {
                if(secondItem){
                    assert.equal(url, '/taoQtiTest/views/js/test/runner/proxy/cache/itemPreloader/item2/28-days.jpg');
                } else {
                    assert.equal(url, '/taoQtiTest/views/js/test/runner/proxy/cache/itemPreloader/item1/28-days.jpg');
                }
            }
        });

        itemPreloader = itemPreloaderFactory(options);

        itemPreloader.preload(itemData)
        .then(function(result){
            assert.ok(result, 'Preloaded');

            secondItem = true;
            return itemPreloader.preload(itemData2);
        })
        .then(function(){
            return itemPreloader.unload(itemData);
        })
        .then(function(){
            return itemPreloader.unload(itemData2);
        })
        .then(function(result){
            QUnit.start();
        })
        .catch(function(err){
            assert.ok(false, err);
            QUnit.start();
        });
    });

});
