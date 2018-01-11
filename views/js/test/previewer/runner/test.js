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
 * Copyright (c) 2018 (original work) Open Assessment Technologies SA ;
 */

/**
 * @author Jean-Sébastien Conan <jean-sebastien@taotesting.com>
 */
define([
    'jquery',
    'lodash',
    'test/mocks/ajax',
    'taoQtiTest/previewer/runner',
    'json!taoQtiItem/test/samples/json/space-shuttle.json'
], function ($, _, ajaxMock, previewerFactory, itemData) {
    'use strict';

    QUnit.module('API');

    // backup/restore ajax method between each test
    QUnit.testStart(function () {
        ajaxMock.push();
    });
    QUnit.testDone(function () {
        ajaxMock.pop();
    });

    QUnit.test('module', function (assert) {
        QUnit.expect(3);
        assert.equal(typeof previewerFactory, 'function', "The previewer module exposes a function");
        assert.equal(typeof previewerFactory(), 'object', "The previewer factory returns an object");
        assert.notEqual(previewerFactory(), previewerFactory(), "The previewer factory returns a different instance on each call");
    });

    QUnit.asyncTest('integration', function (assert) {
        var $container = $('#previewer');
        var config = {};

        QUnit.expect(1);

        ajaxMock.mock(true, function(req) {
            if (req.url.match(/\/getItem[\/?]/)) {
                return {
                    success: true,
                    itemData: {
                        type: 'qti',
                        data: itemData
                    },
                    baseUrl: window.location.href,
                    itemState: {}
                };
            }
        });

        previewerFactory($container, config)
            .on('error', function (err) {
                assert.ok(false, 'An error has occurred');
                console.error(err);
                QUnit.start();
            })
            .on('ready', function (runner) {
                runner
                    .after('renderitem.runnerComponent', function () {
                        assert.ok(true, 'The previewer has been rendered');
                        QUnit.start();
                    })
                    .loadItem('item-1');
            });
    });
});
