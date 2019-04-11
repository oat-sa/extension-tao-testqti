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
    'taoQtiTest/runner/helpers/offlineErrorHelper'
], function(
    offlineErrorHelper
) {
    'use strict';

    QUnit.test('it has the required methods', function(assert) {
        assert.expect(3);
        assert.equal(typeof offlineErrorHelper['getOfflineNavError'], 'function');
        assert.equal(typeof offlineErrorHelper['getOfflineExitError'], 'function');
        assert.equal(typeof offlineErrorHelper['getOfflinePauseError'], 'function');
    });

    QUnit
        .cases
        .init([ 'getOfflineNavError', 'getOfflineExitError', 'getOfflinePauseError' ])
        .test('it returns the proper object', function(method, assert) {
            assert.deepEqual(Object.keys(offlineErrorHelper[method]()), ['message', 'data']);
        });
});
