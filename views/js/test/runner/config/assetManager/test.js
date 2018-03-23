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
 * Copyright (c) 2017 (original work) Open Assessment Technologies SA ;
 */

/**
 * Test the module {@link taoQtiTest/runner/config/assetManager}
 *
 * @author Bertrand Chevrier <bertrand@taotesting.com>
 */
define([
    'taoQtiTest/runner/config/assetManager'
], function(getAssetManager) {
    'use strict';

    QUnit.module('API');

    QUnit.test('module', function(assert) {
        QUnit.expect(1);

        assert.equal(typeof getAssetManager, 'function', 'The module exposes a function');
    });

    QUnit.module('Behavior');

    QUnit.test('retrieval', function(assert) {

        QUnit.expect(4);

        assert.equal(typeof getAssetManager('foo'), 'object', 'The function returns an object');
        assert.equal(typeof getAssetManager('bar'), 'object', 'The function returns an object');
        assert.deepEqual(getAssetManager('foo'), getAssetManager('foo'), 'The function returns the same object from the same id');
        assert.notDeepEqual(getAssetManager('foo'), getAssetManager('bar'), 'The function returns different objects from the differents id');
    });

    QUnit.test('asset manager', function(assert) {
        var assetManager;

        QUnit.expect(4);

        assetManager = getAssetManager('noz');

        assert.equal(typeof assetManager, 'object', 'The asset manager is an object');
        assert.equal(typeof assetManager.addStrategy, 'function', 'The asset manager has the correct methods');
        assert.equal(typeof assetManager.resolve, 'function', 'The asset manager has the correct methods');
        assert.equal(assetManager._strategies.length, 5, 'The asset manager comes with configured strategies');
    });
});
