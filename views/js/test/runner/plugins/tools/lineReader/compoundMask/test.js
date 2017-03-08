define([
    'jquery',
    'taoQtiTest/runner/plugins/tools/lineReader/compoundMask'
], function ($, compoundMaskFactory) {
    'use strict';

    QUnit.module('plugin');

    QUnit.test('module', function (assert) {
        QUnit.expect(1);

        assert.ok(typeof compoundMaskFactory === 'function', 'The module expose a function');
    });

    QUnit
        .cases([
            { title: 'init',    method: 'init' },
            { title: 'render',  method: 'render' },
            { title: 'destroy', method: 'destroy' },

            { title: 'eventifier.on',       method: 'on' },
            { title: 'eventifier.off',      method: 'off' },
            { title: 'eventifier.trigger',  method: 'trigger' },

            { title: 'statifier.getState',  method: 'getState' },
            { title: 'statifier.setState',  method: 'setState' }
        ])
        .test('API', function (data, assert) {
            var mask = compoundMaskFactory();
            QUnit.expect(1);
            assert.ok(typeof mask[data.method] === 'function', 'mask implements ' + data.title);
        });

    QUnit.module('Behavior');

    QUnit.test('.getDimensions()', function (assert) {
        var mask = compoundMaskFactory({
                outterWidth:  500,
                outterHeight: 300,
                innerWidth:   400,
                innerHeight:  50
            }),
            expectedDimensions = {
                outterWidth:  500,
                outterHeight: 300,
                innerWidth:   400,
                innerHeight:  50,
                topHeight:    125,
                rightWidth:   50,
                bottomHeight: 125,
                leftWidth:    50
            };

        QUnit.expect(1);

        mask.init();
        assert.deepEqual(mask.getDimensions(), expectedDimensions, 'dimensions have computed correctly');
    });

    QUnit.module('Visual test');

    QUnit.asyncTest('display and play', function (assert) {
        var mask = compoundMaskFactory(),
            $container = $('#outside');

        QUnit.expect(1);

        mask.init();
        mask.render($container);

        QUnit.start();

    });
});