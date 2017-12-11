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
    'json!taoQtiTest/test/runner/proxy/cache/itemPreloader/item.json'
], function(Promise, itemPreloader, itemData) {
    'use strict';

    QUnit.module('API');


    QUnit.test('module', function (assert){
        QUnit.expect(1);

        assert.equal(typeof itemPreloader, 'object', "The module exposes an object");
    });

    QUnit.test('api', function (assert){
        QUnit.expect(2);

        assert.equal(typeof itemPreloader.preload, 'function', "The module exposes the method preload");
        assert.equal(typeof itemPreloader.unload, 'function', "The  module exposes the method unload");
    });


    QUnit.module('behavior');

    QUnit.cases([{
        title : 'nothing'
    }, {
        title : 'empty object',
        item  : {}
    }, {
        title : 'missing baseUrl',
        item  : {
            itemData : {}
        }
    }, {
        title : 'missing itemData',
        item  : {
            baseUrl : '/taoQtiTest/views'
        }
    }]).asyncTest('preload bad data', function(data, assert){
        var p;
        QUnit.expect(2);

        p = itemPreloader.preload(data.item);

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
        var p;
        var styleSheet;
        QUnit.expect(10);


        //hack the Image element to assert the load
        window.Image = function(){
            assert.ok(true, 'A new image is created');
        };
        Object.defineProperty(window.Image.prototype, 'src',  {
            set: function src(url) {
                assert.equal(url, '/taoQtiTest/views/js/test/runner/proxy/cache/itemPreloader/28-days.jpg');
            }
        });

        styleSheet = document.querySelector('head link[href="/taoQtiTest/views/js/test/runner/proxy/cache/itemPreloader/tao-user-styles.css"]');

        assert.equal(styleSheet, null, 'The item stylesheet is not loaded');

        p = itemPreloader.preload(itemData);
        assert.ok(p instanceof Promise);

        p.then(function(result){
            assert.ok(result, 'Preloaded');

            styleSheet = document.querySelector('head link[href="/taoQtiTest/views/js/test/runner/proxy/cache/itemPreloader/tao-user-styles.css"]');
            assert.ok(styleSheet instanceof HTMLLinkElement, 'The item stylesheet is loaded');
            assert.equal(styleSheet.getAttribute('rel'), 'prefetch', 'The item stylesheet is prefetched');
            assert.equal(styleSheet.getAttribute('disabled'), 'true', 'The item stylesheet is disabled');
        })
        .then(function(){
            return itemPreloader.unload(itemData);
        })
        .then(function(result){
            assert.ok(result, 'Unloaded');

            styleSheet = document.querySelector('head link[href="/taoQtiTest/views/js/test/runner/proxy/cache/itemPreloader/tao-user-styles.css"]');

            assert.equal(styleSheet, null, 'The item stylesheet is now removed');

            QUnit.start();
        })
        .catch(function(err){
            assert.ok(false, err);
            QUnit.start();
        });
    });
});
