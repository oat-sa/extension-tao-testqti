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


    QUnit.test('Geographics', function (assert) {
        var $container = $('#qunit-fixture'),
            mask = compoundMaskFactory({
                outerX:         50,
                outerY:         50,
                outerWidth:     500,
                outerHeight:    300,

                innerX:         100,
                innerY:         100,
                innerWidth:     350,
                innerHeight:    50,

                maskMinWidth:   20,
                maskMinHeight:  20
            }),
            expectedDimensions = {
                outerWidth:     500,
                outerHeight:    300,
                innerWidth:     350,
                innerHeight:    50,
                topHeight:      50,
                rightWidth:     100,
                bottomHeight:   200,
                leftWidth:      50
            },
            expectedPosition = {
                outerX:         50,
                outerY:         50,
                innerX:         100,
                innerY:         100
            },
            expectedConstrains = {
                maskMinWidth:   20,
                maskMinHeight:  20
            },
            allParts = mask.getParts(),
            $element;

        // QUnit.expect(1);

        mask.init();
        mask.render($container);

        assert.deepEqual(mask.getDimensions(), expectedDimensions, 'dimensions have been correctly set');
        assert.deepEqual(mask.getPosition(), expectedPosition, 'position have been correctly set');
        assert.deepEqual(mask.getConstrains(), expectedConstrains, 'constrains have been correctly set');

        assert.deepEqual(allParts.n.mask.getPosition(), { x: 100,       y: 50 },        'north mask has the right position');
        assert.deepEqual(allParts.n.mask.getSize(),     { width: 350,   height: 50 },   'north mask has the right dimensions');
        // $element = allParts.n.mask.getElement();
        // assert.equal(,     { width: 350,   height: 50 },   'north mask has the right dimensions');

        assert.deepEqual(allParts.ne.mask.getSize(),    { width: 100,   height: 50 },   'north-east mask has the right dimensions');
        assert.deepEqual(allParts.ne.mask.getPosition(),{ x: 450,       y: 50 },        'north-east mask has the right position');

        assert.deepEqual(allParts.e.mask.getSize(),     { width: 100,   height: 50 },   'east mask has the right dimensions');
        assert.deepEqual(allParts.e.mask.getPosition(), { x: 450,       y: 100 },       'east mask has the right position');

        assert.deepEqual(allParts.se.mask.getSize(),    { width: 100,   height: 200 },  'south-east mask has the right dimensions');
        assert.deepEqual(allParts.se.mask.getPosition(),{ x: 450,       y: 150 },       'south-east mask has the right position');

        assert.deepEqual(allParts.s.mask.getSize(),     { width: 350,   height: 200 },  'south mask has the right dimensions');
        assert.deepEqual(allParts.s.mask.getPosition(), { x: 100,       y: 150 },       'south mask has the right position');

        assert.deepEqual(allParts.sw.mask.getSize(),    { width: 50,   height: 200 },   'south-west mask has the right dimensions');
        assert.deepEqual(allParts.sw.mask.getPosition(),{ x: 50,       y: 150 },        'south-west mask has the right position');

        assert.deepEqual(allParts.w.mask.getSize(),     { width: 50,   height: 50 },    'west mask has the right dimensions');
        assert.deepEqual(allParts.w.mask.getPosition(), { x: 50,       y: 100 },        'west mask has the right position');

        assert.deepEqual(allParts.nw.mask.getSize(),    { width: 50,   height: 50 },    'north-west mask has the right dimensions');
        assert.deepEqual(allParts.nw.mask.getPosition(),{ x: 50,       y: 50 },         'north-west mask has the right position');


    });




    QUnit.module('Visual test');

    QUnit.asyncTest('display and play', function (assert) {
        var mask = compoundMaskFactory({
                outerX:         50,
                outerY:         50,
                outerWidth:     500,
                outerHeight:    300,

                innerX:         100,
                innerY:         100,
                innerWidth:     350,
                innerHeight:    50,

                maskMinWidth:   20,
                maskMinHeight:  20
            }),
            $container = $('#outside');

        QUnit.expect(1);

        mask.init();
        mask.render($container);

        assert.ok(true);
        QUnit.start();

    });
});