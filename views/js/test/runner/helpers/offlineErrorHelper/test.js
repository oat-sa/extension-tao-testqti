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
