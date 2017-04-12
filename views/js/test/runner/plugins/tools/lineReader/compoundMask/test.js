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
 * Copyright (c) 2017 (original work) Open Assessment Technologies SA;
 */
/**
 * @author Christophe Noël <christophe@taotesting.com>
 */
define([
    'jquery',
    'lodash',
    'taoQtiTest/runner/plugins/tools/lineReader/compoundMask'
], function ($, _, compoundMaskFactory) {
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

            { title: 'statifier.getState',  method: 'getState' },
            { title: 'statifier.setState',  method: 'setState' }
        ])
        .test('API', function (data, assert) {
            var mask = compoundMaskFactory();
            QUnit.expect(1);
            assert.ok(typeof mask[data.method] === 'function', 'mask implements ' + data.title);
        });

    QUnit.module('Behavior');


    QUnit.test('setTransforms / applyTransforms', function (assert) {
        var $container = $('#qunit-fixture'),
            mask = compoundMaskFactory({
                dragMinWidth: 4,
                dragMinHeight: 4,
                resizeHandleSize: 7,
                innerDragHeight: 20
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
                outerX: 50,
                outerY: 50,
                innerX: 100,
                innerY: 100
            },
            allParts = mask.getParts(),
            $innerDrag;

        QUnit.expect(36);

        mask.init();
        mask.render($container);

        mask.setTransforms({
            outerWidth:  500,
            outerHeight: 300,
            innerWidth:  350,
            innerHeight: 50
        }, {
            outerX: 50,
            outerY: 50,
            innerX: 100,
            innerY: 100
        });

        assert.deepEqual(mask.getDimensions(),  expectedDimensions, 'dimensions have been correctly set');
        assert.deepEqual(mask.getPosition(),    expectedPosition,   'position have been correctly set');

        assert.deepEqual(allParts.n.mask.getSize(),         { width: 350,   height: 50 },   'north mask has the right dimensions');
        assert.deepEqual(allParts.n.mask.getPosition(),     { x: 100,       y: 50 },        'north mask has the right position');
        assert.deepEqual(allParts.n.overlay.getSize(),      { width: 350,   height: 50-14 },'north overlay has the right dimensions');
        assert.deepEqual(allParts.n.overlay.getPosition(),  { x: 100,       y: 50 + 7 },    'north overlay has the right position');

        assert.deepEqual(allParts.ne.mask.getSize(),        { width: 100,   height: 50 },   'north-east mask has the right dimensions');
        assert.deepEqual(allParts.ne.mask.getPosition(),    { x: 450,       y: 50 },        'north-east mask has the right position');
        assert.deepEqual(allParts.ne.overlay.getSize(),     { width: 100-7, height: 50-14 },'north-east overlay has the right dimensions');
        assert.deepEqual(allParts.ne.overlay.getPosition(), { x: 450,       y: 50 + 7 },    'north-east overlay has the right position');

        assert.deepEqual(allParts.e.mask.getSize(),         { width: 100,   height: 50 },   'east mask has the right dimensions');
        assert.deepEqual(allParts.e.mask.getPosition(),     { x: 450,       y: 100 },       'east mask has the right position');
        assert.deepEqual(allParts.e.overlay.getSize(),      { width: 100-14,height: 50+14 },'east overlay has the right dimensions');
        assert.deepEqual(allParts.e.overlay.getPosition(),  { x: 450 + 7,   y: 100 - 7 },   'east overlay has the right position');

        assert.deepEqual(allParts.se.mask.getSize(),        { width: 100,   height: 200 },  'south-east mask has the right dimensions');
        assert.deepEqual(allParts.se.mask.getPosition(),    { x: 450,       y: 150 },       'south-east mask has the right position');
        assert.deepEqual(allParts.se.overlay.getSize(),     { width: 100-7, height:200-14 },'south-east overlay has the right dimensions');
        assert.deepEqual(allParts.se.overlay.getPosition(), { x: 450,       y: 150+7 },     'south-east overlay has the right position');

        assert.deepEqual(allParts.s.mask.getSize(),         { width: 350,   height: 200 },  'south mask has the right dimensions');
        assert.deepEqual(allParts.s.mask.getPosition(),     { x: 100,       y: 150 },       'south mask has the right position');
        assert.deepEqual(allParts.s.overlay.getSize(),      { width: 350,   height:200-14 },'south overlay has the right dimensions');
        assert.deepEqual(allParts.s.overlay.getPosition(),  { x: 100,       y: 150+7 },     'south overlay has the right position');

        assert.deepEqual(allParts.sw.mask.getSize(),        { width: 50,   height: 200 },   'south-west mask has the right dimensions');
        assert.deepEqual(allParts.sw.mask.getPosition(),    { x: 50,       y: 150 },        'south-west mask has the right position');
        assert.deepEqual(allParts.sw.overlay.getSize(),     { width: 50-7, height: 200-14 },'south-west overlay has the right dimensions');
        assert.deepEqual(allParts.sw.overlay.getPosition(), { x: 50+7,     y: 150+7 },      'south-west overlay has the right position');

        assert.deepEqual(allParts.w.mask.getSize(),         { width: 50,   height: 50 },    'west mask has the right dimensions');
        assert.deepEqual(allParts.w.mask.getPosition(),     { x: 50,       y: 100 },        'west mask has the right position');
        assert.deepEqual(allParts.w.overlay.getSize(),      { width:50-14, height: 50+14 }, 'west overlay has the right dimensions');
        assert.deepEqual(allParts.w.overlay.getPosition(),  { x: 50+7,     y: 100-7 },      'west overlay has the right position');

        assert.deepEqual(allParts.nw.mask.getSize(),        { width: 50,   height: 50 },    'north-west mask has the right dimensions');
        assert.deepEqual(allParts.nw.mask.getPosition(),    { x: 50,       y: 50 },         'north-west mask has the right position');
        assert.deepEqual(allParts.nw.overlay.getSize(),     { width: 50-7, height: 50-14 }, 'north-west overlay has the right dimensions');
        assert.deepEqual(allParts.nw.overlay.getPosition(), { x: 50+7,     y: 50+7 },       'north-west overlay has the right position');

        $innerDrag = $container.find('.line-reader-inner-drag');
        assert.equal($innerDrag.position().left, 100, 'inner drag has the correct x position');
        assert.equal($innerDrag.position().top, 157, 'inner drag has the correct y position');
    });



    QUnit
        .cases([

            // North
            {   title: 'north / shrink 20 from top',
                maskId: 'n', width: 350, height: 50 - 20, fromTop: true,
                dimensions: { outerHeight: 300 - 20, topHeight: 30 }, position: { outerY: 50 + 20 }         },

            {   title: 'north / shrink 40 from top, capped to 30',
                maskId: 'n', width: 350, height: 50 - 40, fromTop: true,
                dimensions: { outerHeight: 300 - 30, topHeight: 20 }, position: { outerY: 50 + 30 }         },

            {   title: 'north / expand 20 from top',
                maskId: 'n', width: 350, height: 50 + 20, fromTop: true,
                dimensions: { outerHeight: 300 + 20, topHeight: 50 + 20 }, position: { outerY: 50 - 20 }    },

            {   title: 'north / shrink 20 from bottom',
                maskId: 'n', width: 350, height: 50 - 20, fromTop: false,
                dimensions: { innerHeight: 50 + 20, topHeight: 50 - 20 }, position: { innerY: 100 - 20 }    },

            {   title: 'north / shrink 40 from bottom, capped to 30',
                maskId: 'n', width: 350, height: 50 - 40, fromTop: false,
                dimensions: { innerHeight: 50 + 30, topHeight: 50 - 30 }, position: { innerY: 100 - 30 }    },

            {   title: 'north / expand 20 from bottom',
                maskId: 'n', width: 350, height: 50 + 20, fromTop: false,
                dimensions: { innerHeight: 50 - 20, topHeight: 50 + 20 }, position: { innerY: 100 + 20 }    },

            {   title: 'north / expand 50 from bottom, capped to 30',
                maskId: 'n', width: 350, height: 50 + 50, fromTop: false,
                dimensions: { innerHeight: 50 - 30, topHeight: 50 + 30 }, position: { innerY: 100 + 30 }    },

            // North-east
            {   title: 'north-east / shrink 20 from top',
                maskId: 'ne', width: 100, height: 50 - 20, fromTop: true,
                dimensions: { outerHeight: 300 - 20, topHeight: 30 }, position: { outerY: 50 + 20 }         },

            {   title: 'north-east / shrink 40 from top, capped to 30',
                maskId: 'ne', width: 100, height: 50 - 40, fromTop: true,
                dimensions: { outerHeight: 300 - 30, topHeight: 20 }, position: { outerY: 50 + 30 }         },

            {   title: 'north-east / expand 20 from top',
                maskId: 'ne', width: 100, height: 50 + 20, fromTop: true,
                dimensions: { outerHeight: 300 + 20, topHeight: 50 + 20 }, position: { outerY: 50 - 20 }    },

            {   title: 'north-east / shrink 20 from right',
                maskId: 'ne', width: 100 - 20, height: 50,
                dimensions: { outerWidth: 500 - 20, rightWidth: 100 - 20 }                                  },

            {   title: 'north-east / shrink 90 from right, capped to 80',
                maskId: 'ne', width: 100 - 90, height: 50,
                dimensions: { outerWidth: 500 - 80, rightWidth: 100 - 80 }                                  },

            {   title: 'north-east / expand 20 from right',
                maskId: 'ne', width: 100 + 20, height: 50,
                dimensions: { outerWidth: 500 + 20, rightWidth: 100 + 20 }                                  },

            // East
            {   title: 'east / shrink 20 from right',
                maskId: 'e', width: 100 - 20, height: 50,
                dimensions: { outerWidth: 500 - 20, rightWidth: 100 - 20 }                                  },

            {   title: 'east / shrink 90 from right, capped to 80',
                maskId: 'e', width: 100 - 90, height: 50,
                dimensions: { outerWidth: 500 - 80, rightWidth: 100 - 80 }                                  },

            {   title: 'east / expand 20 from right',
                maskId: 'e', width: 100 + 20, height: 50,
                dimensions: { outerWidth: 500 + 20, rightWidth: 100 + 20 }                                  },

            {   title: 'east / shrink 20 from left',
                maskId: 'e', width: 100 - 20, height: 50, fromLeft: true,
                dimensions: { innerWidth: 350 + 20, rightWidth: 100 - 20 }                                  },

            {   title: 'east / shrink 90 from left, capped to 80',
                maskId: 'e', width: 100 - 90, height: 50, fromLeft: true,
                dimensions: { innerWidth: 350 + 80, rightWidth: 100 - 80 }                                  },

            {   title: 'east / expand 20 from left',
                maskId: 'e', width: 100 + 20, height: 50, fromLeft: true,
                dimensions: { innerWidth: 350 - 20, rightWidth: 100 + 20 }                                  },

            {   title: 'east / expand 340 from left, capped to 330',
                maskId: 'e', width: 100 + 340, height: 50, fromLeft: true,
                dimensions: { innerWidth: 350 - 330, rightWidth: 100 + 330 }                                },

            // South-east
            {   title: 'south-east / shrink 20 from right',
                maskId: 'se', width: 100 - 20, height: 200,
                dimensions: { outerWidth: 500 - 20, rightWidth: 100 - 20 }                                  },

            {   title: 'south-east / shrink 90 from right, capped to 80',
                maskId: 'se', width: 100 - 90, height: 200,
                dimensions: { outerWidth: 500 - 80, rightWidth: 100 - 80 }                                  },

            {   title: 'south-east / expand 20 from right',
                maskId: 'se', width: 100 + 20, height: 200,
                dimensions: { outerWidth: 500 + 20, rightWidth: 100 + 20 }                                  },

            {   title: 'south-east / shrink 20 from bottom',
                maskId: 'se', width: 100, height: 200 - 20,
                dimensions: { outerHeight: 300 - 20, bottomHeight: 200 - 20 }                               },

            {   title: 'south-east / shrink 190 from bottom, capped to 160',
                maskId: 'se', width: 100, height: 200 - 190,
                dimensions: { outerHeight: 300 - 160, bottomHeight: 200 - 160 }                             },

            {   title: 'south-east / expand 20 from bottom',
                maskId: 'se', width: 100, height: 200 + 20,
                dimensions: { outerHeight: 300 + 20, bottomHeight: 200 + 20 }                               },

            // South
            {   title: 'south / shrink 20 from bottom',
                maskId: 's', width: 350, height: 200 - 20,
                dimensions: { outerHeight: 300 - 20, bottomHeight: 200 - 20 }                               },

            {   title: 'south / shrink 190 from bottom, capped to 160',
                maskId: 's', width: 350, height: 200 - 190,
                dimensions: { outerHeight: 300 - 160, bottomHeight: 200 - 160 }                             },

            {   title: 'south / expand 20 from bottom',
                maskId: 's', width: 350, height: 200 + 20,
                dimensions: { outerHeight: 300 + 20, bottomHeight: 200 + 20 }                               },

            {   title: 'south / shrink 20 from top',
                maskId: 's', width: 350, height: 200 - 20, fromTop: true,
                dimensions: { innerHeight: 50 + 20, bottomHeight: 200 - 20 }                                },

            {   title: 'south / shrink 190 from top, capped to 160',
                maskId: 's', width: 350, height: 200 - 190, fromTop: true,
                dimensions: { innerHeight: 50 + 160, bottomHeight: 200 - 160 }                              },

            {   title: 'south / expand 20 from top',
                maskId: 's', width: 350, height: 200 + 20, fromTop: true,
                dimensions: { innerHeight: 50 - 20, bottomHeight: 200 + 20 }                                },

            {   title: 'south / expand 40 from top, capped to 30',
                maskId: 's', width: 350, height: 200 + 40, fromTop: true,
                dimensions: { innerHeight: 50 - 30, bottomHeight: 200 + 30 }                                },

            // South-west
            {   title: 'south-west / shrink 20 from bottom',
                maskId: 'sw', width: 50, height: 200 - 20,
                dimensions: { outerHeight: 300 - 20, bottomHeight: 200 - 20 }                               },

            {   title: 'south-west / shrink 190 from bottom, capped to 160',
                maskId: 'sw', width: 50, height: 200 - 190,
                dimensions: { outerHeight: 300 - 160, bottomHeight: 200 - 160 }                             },

            {   title: 'south-west / expand 20 from bottom',
                maskId: 'sw', width: 50, height: 200 + 20,
                dimensions: { outerHeight: 300 + 20, bottomHeight: 200 + 20 }                               },

            {   title: 'south-west / shrink 20 from left',
                maskId: 'sw', width: 50 - 20, height: 200, fromLeft: true,
                dimensions: { outerWidth: 500 - 20, leftWidth: 50 - 20 }, position: { outerX: 50 + 20 }     },

            {   title: 'south-west / shrink 40 from left, capped to 30',
                maskId: 'sw', width: 50 - 40, height: 200, fromLeft: true,
                dimensions: { outerWidth: 500 - 30, leftWidth: 50 - 30 }, position: { outerX: 50 + 30 }     },

            {   title: 'south-west / expand 20 from left',
                maskId: 'sw', width: 50 + 20, height: 200, fromLeft: true,
                dimensions: { outerWidth: 500 + 20, leftWidth: 50 + 20 }, position: { outerX: 50 - 20 }     },

            // West
            {   title: 'west / shrink 20 from left',
                maskId: 'w', width: 50 - 20, height: 50, fromLeft: true,
                dimensions: { outerWidth: 500 - 20, leftWidth: 50 - 20 }, position: { outerX: 50 + 20 }     },

            {   title: 'west / shrink 40 from left, capped to 30',
                maskId: 'w', width: 50 - 40, height: 50, fromLeft: true,
                dimensions: { outerWidth: 500 - 30, leftWidth: 50 - 30 }, position: { outerX: 50 + 30 }     },

            {   title: 'west / expand 20 from left',
                maskId: 'w', width: 50 + 20, height: 50, fromLeft: true,
                dimensions: { outerWidth: 500 + 20, leftWidth: 50 + 20 }, position: { outerX: 50 - 20 }     },

            {   title: 'west / shrink 20 from right',
                maskId: 'w', width: 50 - 20, height: 50,
                dimensions: { innerWidth: 350 + 20, leftWidth: 50 - 20 }, position: { innerX: 100 - 20 }    },

            {   title: 'west / shrink 40 from right, capped to 30',
                maskId: 'w', width: 50 - 40, height: 50,
                dimensions: { innerWidth: 350 + 30, leftWidth: 50 - 30 }, position: { innerX: 100 - 30 }    },

            {   title: 'west / expand 20 from right',
                maskId: 'w', width: 50 + 20, height: 50,
                dimensions: { innerWidth: 350 - 20, leftWidth: 50 + 20 }, position: { innerX: 100 + 20 }    },

            {   title: 'west / expand 340 from right, capped to 330',
                maskId: 'w', width: 50 + 340, height: 50,
                dimensions: { innerWidth: 350 - 330, leftWidth: 50 + 330 }, position: { innerX: 100 + 330 } },

            // North-west
            {   title: 'north-west / shrink 20 from left',
                maskId: 'nw', width: 50 - 20, height: 50, fromLeft: true,
                dimensions: { outerWidth: 500 - 20, leftWidth: 50 - 20 }, position: { outerX: 50 + 20 }     },

            {   title: 'north-west / shrink 40 from left, capped to 30',
                maskId: 'nw', width: 50 - 40, height: 50, fromLeft: true,
                dimensions: { outerWidth: 500 - 30, leftWidth: 50 - 30 }, position: { outerX: 50 + 30 }     },

            {   title: 'north-west / expand 20 from left',
                maskId: 'nw', width: 50 + 20, height: 50, fromLeft: true,
                dimensions: { outerWidth: 500 + 20, leftWidth: 50 + 20 }, position: { outerX: 50 - 20 }     },

            {   title: 'north-west / shrink 20 from top',
                maskId: 'nw', width: 50, height: 50 - 20, fromTop: true,
                dimensions: { outerHeight: 300 - 20, topHeight: 30 }, position: { outerY: 50 + 20 }         },

            {   title: 'north-west / shrink 40 from top, capped to 30',
                maskId: 'nw', width: 50, height: 50 - 40, fromTop: true,
                dimensions: { outerHeight: 300 - 30, topHeight: 20 }, position: { outerY: 50 + 30 }         },

            {   title: 'north-west / expand 20 from top',
                maskId: 'nw', width: 50, height: 50 + 20, fromTop: true,
                dimensions: { outerHeight: 300 + 20, topHeight: 50 + 20 }, position: { outerY: 50 - 20 }    }
        ])
        .test('Resize', function (data, assert) {
            var $container = $('#qunit-fixture'),
                dimensions = {
                    innerWidth:     350,
                    innerHeight:    50,
                    outerWidth:     500,
                    outerHeight:    300,

                    topHeight:      50,
                    rightWidth:     100,
                    bottomHeight:   200,
                    leftWidth:      50
                },
                position = {
                    outerX:         50,
                    outerY:         50,
                    innerX:         100,
                    innerY:         100
                },
                mask = compoundMaskFactory({
                    resizeHandleSize: 10,
                    dragMinWidth: 0,
                    dragMinHeight: 0,
                    innerDragHeight: 20

                }, dimensions, position),
                allParts = mask.getParts();

            QUnit.expect(2);

            mask.init()
                .render($container);

            allParts[data.maskId].mask.resizeTo(
                data.width,
                data.height,
                data.fromLeft || false,
                data.fromTop || false
            );

            // we only check that the resize triggers the correct dimension and position changes in the model
            // the actual check of whether those values are correctly translated in each component is made by set/applyTransform test
            assert.deepEqual(mask.getDimensions(), _.assign({}, dimensions, data.dimensions), 'dimensions after resize are correct');
            assert.deepEqual(mask.getPosition(), _.assign({}, position, data.position), 'positions after resize are correct');
        });

    QUnit
        .cases([
            {
                title: 'topHeight too short',
                positionIn: { innerY: 10 },
                positionOut: { innerY: 20 },
                dimensionsOut: { topHeight: 20, outerHeight: 210, bottomHeight: 200 - (50 + 10) }
            }, {
                title: 'innerHeight too short',
                dimensionsIn: { innerHeight: 10 },
                dimensionsOut: { innerHeight: 20, outerHeight: 210, bottomHeight: 200 - (50 + 10) }
            }, {
                title: 'bottom Height too short',
                dimensionsIn: { outerHeight: 110 },
                dimensionsOut: { outerHeight: 140, bottomHeight: 40 }
            }, {
                title: 'leftWith too short',
                positionIn: { innerX: 10 },
                positionOut: { innerX: 20 },
                dimensionsOut: { outerWidth: 210, leftWidth: 20, rightWidth: 200 - (100 + 10) }
            }, {
                title: 'innerWidth too short',
                dimensionsIn: { innerWidth: 10 },
                dimensionsOut: { outerWidth: 210, innerWidth: 20, rightWidth: 200 - (50 + 10) }
            }, {
                title: 'leftWidth too short',
                dimensionsIn: { outerWidth: 160 },
                dimensionsOut: { outerWidth: 170, rightWidth: 20 }
            }, {
                title: 'innerWidth too big',
                dimensionsIn: { innerWidth: 300 },
                dimensionsOut: { innerWidth: 300, outerWidth: 300 + 50 + 20, rightWidth: 20 }
            }, {
                title: 'innerHeight too big',
                dimensionsIn: { innerHeight: 300 },
                dimensionsOut: { innerHeight: 300, outerHeight: 300 + 50 + 40, bottomHeight: 40 }
            }
        ])
        .test('correctTransforms()', function(data, assert) {
            var $container = $('#qunit-fixture'),
                dimensions = {
                    innerWidth:  100,
                    innerHeight: 50,
                    outerWidth:  200,
                    outerHeight: 200
                },
                position = {
                    outerX:         0,
                    outerY:         0,
                    innerX:         50,
                    innerY:         50
                },
                compDimensions = {
                    topHeight:   50,
                    rightWidth:  50,
                    bottomHeight:100,
                    leftWidth:   50
                },
                mask = compoundMaskFactory({
                    resizeHandleSize: 10,
                    dragMinWidth: 0,
                    dragMinHeight: 0,
                    innerDragHeight: 20
                });

            QUnit.expect(2);

            mask.init()
                .render($container)
                .setTransforms(
                    _.assign({}, dimensions, data.dimensionsIn || {}),
                    _.assign({}, position, data.positionIn || {})
                );

            assert.deepEqual(
                mask.getDimensions(),
                _.assign({}, dimensions, compDimensions, data.dimensionsOut || {}),
                'dimensions have been corrected'
            );
            assert.deepEqual(
                mask.getPosition(),
                _.assign({}, position, data.positionOut || {}),
                'position have been corrected'
            );

        });

    QUnit.module('Visual test');

    QUnit.asyncTest('display and play', function (assert) {
        var mask = compoundMaskFactory({
                dragMinHeight: 5,
                dragMinWidth: 5,
                innerDragHeight: 20,
                resizeHandleSize: 7
            }),
            $container = $('#outside');

        QUnit.expect(1);

        mask.init();
        mask.render($container);

        assert.ok(true);
        QUnit.start();

    });
});