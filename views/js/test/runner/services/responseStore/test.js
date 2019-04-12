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
 * @author Péter Halász <peter@taotesting.com>
 */
define([
    'core/promise',
    'taoQtiTest/runner/services/responseStore'
], function(
    Promise,
    responseStoreFactory
) {
    'use strict';

    var responseStore;

    QUnit.module('responseStore', {
        beforeEach: function(assert) {
            var done = assert.async();

            responseStore = responseStoreFactory();

            Promise.all([
                responseStore.clearResponses(),
                responseStore.clearCorrectResponses()
            ]).then(function() {
                done();
            });
        }
    });

    QUnit.test('it has the required methods', function(assert) {
        assert.expect(8);
        assert.equal(typeof responseStore['getCorrectResponses'], 'function');
        assert.equal(typeof responseStore['getResponses'], 'function');
        assert.equal(typeof responseStore['getCorrectResponse'], 'function');
        assert.equal(typeof responseStore['getResponse'], 'function');
        assert.equal(typeof responseStore['addCorrectResponse'], 'function');
        assert.equal(typeof responseStore['addResponse'], 'function');
        assert.equal(typeof responseStore['clearResponses'], 'function');
        assert.equal(typeof responseStore['clearCorrectResponses'], 'function');
    });

    QUnit.test('it stores the added responses', function(assert) {
        var done = assert.async();

        Promise.all([
            responseStore.addResponse('foo', 'bar'),
            responseStore.getResponse('foo'),
            responseStore.getResponses()
        ]).then(function(result) {
            assert.expect(2);
            assert.equal(result[1], 'bar');
            assert.deepEqual(result[2], {
                foo: 'bar'
            });
            done();
        });
    });

    QUnit.test('it stores the added correct responses', function(assert) {
        var done = assert.async();

        Promise.all([
            responseStore.addCorrectResponse('foo', ['bar', 'beer']),
            responseStore.getCorrectResponse('foo'),
            responseStore.getCorrectResponses()
        ]).then(function(result) {
            assert.expect(2);
            assert.deepEqual(result[1], ['bar', 'beer']);
            assert.deepEqual(result[2], {
                foo: ['bar', 'beer']
            });
            done();
        });
    });


    QUnit.test('it returns an empty array when the correct response is not exist', function(assert) {
        var done = assert.async();

        responseStore.getCorrectResponse('foo').then(function(result) {
            console.log(result);
            assert.expect(1);
            assert.deepEqual(result, []);
            done();
        });
    });
});
