define([
    'taoQtiTest/runner/proxy/offline/responseStore'
], function(
    responseStore
) {
    'use strict';

    QUnit.module('responseStore', {
        beforeEach: function() {
            responseStore.clearStorage();
        }
    });

    QUnit.test('it has the required methods', function(assert) {
        assert.expect(7);
        assert.equal(typeof responseStore['getCorrectResponses'], 'function');
        assert.equal(typeof responseStore['getResponses'], 'function');
        assert.equal(typeof responseStore['getCorrectResponse'], 'function');
        assert.equal(typeof responseStore['getResponse'], 'function');
        assert.equal(typeof responseStore['addCorrectResponse'], 'function');
        assert.equal(typeof responseStore['addResponse'], 'function');
        assert.equal(typeof responseStore['clearStorage'], 'function');
    });

    QUnit.test('it stores the added responses', function(assert) {
        responseStore.addResponse('foo', 'bar');

        assert.expect(2);
        assert.equal(responseStore.getResponse('foo'), 'bar');
        assert.deepEqual(responseStore.getResponses(), {
            foo: 'bar'
        });
    });

    QUnit.test('it stores the added correct responses', function(assert) {
        responseStore.addCorrectResponse('foo', ['bar', 'beer']);

        assert.expect(2);
        assert.deepEqual(responseStore.getCorrectResponse('foo'), ['bar', 'beer']);
        assert.deepEqual(responseStore.getCorrectResponses(), {
            foo: ['bar', 'beer']
        });
    });


    QUnit.test('it returns an empty array when the correct response is not exist', function(assert) {
        assert.expect(1);
        assert.deepEqual(responseStore.getCorrectResponse('foo'), []);
    });
});
