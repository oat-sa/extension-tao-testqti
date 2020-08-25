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
define([
    'jquery',
    'core/promise',
    'taoQtiTest/provider/testItems',
    'lib/jquery.mockjax/jquery.mockjax'
], function($, Promise, testItemProviderFactory) {
    'use strict';

    var api;
    var mockConfig = {
        getItemClasses : {
            url : '//getItemClasses'
        },
        getItems : {
            url : '//getItems'
        },
        getItemClassProperties : {
            url : '//getItemClassProperties'
        }
    };
    // a single instance will suffice for these tests as its state cannot change
    var testItemProvider = testItemProviderFactory(mockConfig);

    // prevent the AJAX mocks to pollute the logs
    $.mockjaxSettings.logger = null;
    $.mockjaxSettings.responseTime = 1;


    QUnit.module('testItems');

    QUnit.test('module', function(assert) {
        assert.equal(typeof testItemProvider, 'object', 'The testItems module exposes an object');
    });

    api = [
        {name: 'getItemClasses'},
        {name: 'getItems'},
        {name: 'getItemClassProperties'},
    ];

    QUnit
        .cases.init(api)
        .test('API ', function(data, assert) {
            assert.equal(typeof testItemProvider[data.name], 'function', 'The testItems module exposes a "' + data.name + '" function');
        });

    QUnit.test('getItemClasses', function(assert) {
        var ready = assert.async();
        var theData = {a: 'a'};
        var returnVal;

        assert.expect(4);

        $.mockjax({
            url: mockConfig.getItemClasses.url,
            response: function(settings) {
                assert.equal(settings.url, mockConfig.getItemClasses.url, 'The provider has called the right service');
                assert.notOk(settings.headers.hasOwnProperty('X-CSRF-Token'), 'No CSRF token is set in the request header');
                this.responseText = JSON.stringify({ success: true, data: theData });
            }
        });

        returnVal = testItemProvider.getItemClasses();

        assert.ok(returnVal instanceof Promise, 'the getItemClasses method returns a Promise');
        returnVal.then(function(classes) {
            assert.deepEqual(classes, theData, 'The return value is correct');
            ready();
        });
    });

    QUnit.test('getItems', function(assert) {
        var ready = assert.async();
        var params = {
            classUri: 'http://www.tao.lu/Ontologies/TAOItem.rdf#Item',
            format: 'tree',
            limit: 10
        };
        var itemList = [
            {label: 'Item1'},
            {label: 'Item2'}
        ];
        var returnVal;

        assert.expect(5);

        $.mockjax({
            url: mockConfig.getItems.url,
            response: function(settings) {
                assert.equal(settings.url, mockConfig.getItems.url, 'The provider has called the right service');
                assert.equal(settings.data, params, 'The correct params are in the request data');
                assert.notOk(settings.headers.hasOwnProperty('X-CSRF-Token'), 'No CSRF token is set in the request header');
                this.responseText = JSON.stringify({ success: true, data: itemList });
            }
        });

        returnVal = testItemProvider.getItems(params);

        assert.ok(returnVal instanceof Promise, 'the getItems method returns a Promise');
        returnVal.then(function(items) {
            assert.deepEqual(items, itemList, 'The return value is correct');
            ready();
        });
    });

    QUnit.test('getItemClassProperties', function(assert) {
        var ready = assert.async();
        var classUri = 'http://tao.example/some.rdf';
        var theData = {b: 'b'};
        var returnVal;

        assert.expect(5);

        $.mockjax({
            url: mockConfig.getItemClassProperties.url,
            response: function(settings) {
                assert.equal(settings.url, mockConfig.getItemClassProperties.url, 'The provider has called the right service');
                assert.deepEqual(settings.data, { classUri: classUri }, 'The correct params are in the request data');
                assert.notOk(settings.headers.hasOwnProperty('X-CSRF-Token'), 'No CSRF token is set in the request header');
                this.responseText = JSON.stringify({ success: true, data: theData });
            }
        });

        returnVal = testItemProvider.getItemClassProperties(classUri);

        assert.ok(returnVal instanceof Promise, 'the getItemClassProperties method returns a Promise');
        returnVal.then(function(props) {
            assert.deepEqual(props, theData, 'The return value is correct');
            ready();
        });
    });
});
