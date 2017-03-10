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
 * A coumpond mask is a mask built with multiple ui/components that interacts with each other.
 *
 * @author Christophe Noël <christophe@taotesting.com>
 */
define([
    'jquery',
    'lodash',
    'core/eventifier',
    'core/statifier',
    'ui/component',
    'ui/component/placeable',
    'ui/component/draggable',
    'ui/component/resizable',
    'tpl!taoQtiTest/runner/plugins/tools/lineReader/tpl/maskPart',
    'tpl!taoQtiTest/runner/plugins/tools/lineReader/tpl/overlayPart'
], function(
    $,
    _,
    eventifier,
    statifier,
    componentFactory,
    makePlaceable,
    makeDraggable,
    makeResizable,
    maskPartTpl,
    overlayPartTpl
) {
    'use strict';

    var defaultConfig = {
        // dimensions
        outerWidth:     500,
        outerHeight:    300,
        innerWidth:     400,
        innerHeight:    50,
        maskMinWidth:   50,
        maskMinHeight:   50,

        // position
        initialX:       100,
        initialY:       100
    };

    //fixme: what is my purpose in this world ?!??
    var overlayOffset = 5;

    return function compoundMaskFactory(config) {
        var compoundMask,
            allParts = {},
            dimensions = {},
            position = {};

        function createCompoundMask() {
            createPart('n', {
                width: dimensions.innerWidth,
                height: dimensions.topHeight,
                initialX: position.x + dimensions.leftWidth,
                initialY: position.y,
                minWidth: dimensions.maskMinWidth,
                minHeight: dimensions.maskMinHeight,
                maxHeight: dimensions.topHeight + (dimensions.innerHeight - dimensions.maskMinHeight),
                borders: ['top', 'bottom'],
                onResize: function onResize(width, height, x, y, fromLeft, fromTop) {
                    var ne = allParts.ne.mask,
                        e  = allParts.e.mask,
                        w  = allParts.w.mask,
                        s  = allParts.s.mask,
                        nw = allParts.nw.mask,
                        innerHeight;

                    nw.resizeTo(nw.getSize().width, height, fromLeft, fromTop);
                    ne.resizeTo(ne.getSize().width, height, fromLeft, fromTop);

                    if (! fromTop) {
                        innerHeight = s.getPosition().y - (y + height);
                        e.resizeTo(e.getSize().width, innerHeight, false, true);
                        w.resizeTo(w.getSize().width, innerHeight, false, true);
                    }
                },
                beforeResize: function beforeResize(width, height, fromLeft, fromTop) {
                    if (! fromTop) {
                        this.config.maxHeight = dimensions.topHeight + (dimensions.innerHeight - dimensions.maskMinHeight);
                    } else {
                        this.config.maxHeight = null;
                    }
                }
            });
            createPart('ne', {
                width: dimensions.rightWidth,
                height: dimensions.topHeight,
                initialX: position.x + dimensions.leftWidth + dimensions.innerWidth,
                initialY: position.y,
                borders: ['top', 'right']
            });
            createPart('e', {
                width: dimensions.rightWidth,
                height: dimensions.innerHeight,
                initialX: position.x + dimensions.leftWidth + dimensions.innerWidth,
                initialY: position.y + dimensions.topHeight,
                borders: ['left', 'right']
            });
            createPart('se', {
                width: dimensions.rightWidth,
                height: dimensions.bottomHeight,
                initialX: position.x + dimensions.leftWidth + dimensions.innerWidth,
                initialY: position.y + dimensions.topHeight + dimensions.innerHeight,
                borders: ['bottom', 'right']
            });
            createPart('s', {
                width: dimensions.innerWidth,
                height: dimensions.bottomHeight,
                initialX: position.x + dimensions.leftWidth,
                initialY: position.y + dimensions.topHeight + dimensions.innerHeight,
                borders: ['top', 'bottom']
            });
            createPart('sw', {
                width: dimensions.leftWidth,
                height: dimensions.bottomHeight,
                initialX: position.x,
                initialY: position.y + dimensions.topHeight + dimensions.innerHeight,
                borders: ['left', 'bottom']
            });
            createPart('w', {
                width: dimensions.leftWidth,
                height: dimensions.innerHeight,
                initialX: position.x,
                initialY: position.y + dimensions.topHeight,
                borders: ['left', 'right']
            });
            createPart('nw', {
                width: dimensions.leftWidth,
                height: dimensions.topHeight,
                initialX: position.x,
                initialY: position.y,
                borders: ['left', 'top']
            });
        }

        function createPart(id, partConfig) {
            allParts[id] = {
                mask: createMask(partConfig),
                overlay: createOverlay(partConfig)
            };
        }

        function createMask(maskConfig) {
            return makeResizable(componentFactory({}, maskConfig))
                .on('render', function() {
                    var $element = this.getElement();

                    if (_.isArray(this.config.borders)) {
                        this.config.borders.forEach(function(borderPosition) {
                            $element.css('border-' + borderPosition + '-width', '1px');
                        });
                    }
                })
                .on('resize', maskConfig.onResize || _.noop)
                .on('resize', updateDimensions) // fixme: hmpf
                .on('beforeresize', maskConfig.beforeResize || _.noop)
                .on('resizeend', function () {
                    resetOverlays();
                })
                .init()
                .setTemplate(maskPartTpl);
        }

        function createOverlay(overlayConfig) {
            var overlay;

            overlayConfig.width     -= (overlayOffset * 2);
            overlayConfig.height    -= (overlayOffset * 2);
            overlayConfig.initialX  += overlayOffset;
            overlayConfig.initialY  += overlayOffset;

            overlay = componentFactory({}, overlayConfig);

            makeDraggable(overlay);

            return overlay
                .on('render', function() {
                    var self = this,
                        $element = this.getElement();

                    $element
                        .on('mousedown', function coverAllCompoundMask() {
                            self.setSize(dimensions.outerWidth, dimensions.outerHeight);
                            self.moveTo(position.x, position.y);
                        })
                        .on('mouseup', function () {
                            resetOverlays(); // todo: mmmmm, doublon
                        });
                })
                .on('dragmove', function moveAllPartsTogether(xOffsetRelative, yOffsetRelative) {
                    _.forOwn(allParts, function(part) {
                        part.mask.moveBy(xOffsetRelative, yOffsetRelative);
                    });
                    updatePosition();
                })
                .on('dragend', function () {
                    resetOverlays();
                })
                .init()
                .setTemplate(overlayPartTpl);
        }

        function updateDimensions() {
            var n = allParts.n.mask.getSize(),
                e = allParts.e.mask.getSize(),
                s = allParts.s.mask.getSize(),
                w = allParts.w.mask.getSize();

            dimensions.outerWidth   = w.width + n.width + e.width;
            dimensions.outerHeight  = n.height + w.height + s.height;
            dimensions.innerWidth   = n.width;
            dimensions.innerHeight  = w.height;
            dimensions.topHeight    = n.height;
            dimensions.rightWidth   = e.width;
            dimensions.bottomHeight = s.height;
            dimensions.leftWidth    = w.width;
        }

        function updatePosition() {
            var nwPosition = allParts.nw.mask.getPosition(); //todo: huh?
            position.x = nwPosition.x;
            position.y = nwPosition.y;
        }

        function resetOverlays() {
            _.forOwn(allParts, function(part) {
                var mask = part.mask,
                    overlay = part.overlay,
                    size = mask.getSize(),
                    pos = mask.getPosition();

                overlay.setSize(
                    size.width - (overlayOffset * 2),
                    size.height - (overlayOffset * 2)
                );
                overlay.moveTo(
                    pos.x + overlayOffset,
                    pos.y + overlayOffset
                );
            });
        }

        config = _.defaults(config || {}, defaultConfig);


        compoundMask = {
            init: function init() {
                position = {
                    x: config.initialX,
                    y: config.initialY
                };
                dimensions = {
                    outerWidth:     config.outerWidth,
                    outerHeight:    config.outerHeight,
                    innerWidth:     config.innerWidth,
                    innerHeight:    config.innerHeight,
                    maskMinWidth:   config.maskMinWidth,
                    maskMinHeight:  config.maskMinHeight
                };
                dimensions.topHeight    =
                dimensions.bottomHeight = (dimensions.outerHeight - dimensions.innerHeight) / 2; //todo: find suitable defauls
                dimensions.rightWidth   =
                dimensions.leftWidth    = (dimensions.outerWidth - dimensions.innerWidth) / 2; //todo: find suitable defauls

                createCompoundMask();
            },

            render: function render($container) {
                _.forOwn(allParts, function(part) {
                    part.mask.render($container);
                });
                _.forOwn(allParts, function(part) {
                    part.overlay.render($container);
                });
            },

            destroy: function destroy() {
                _.forOwn(allParts, function(part) {
                    part.mask.destroy();
                    part.overlay.destroy();
                });
            },

            getDimensions: function getDimensions() {
                return dimensions;
            }
        };

        eventifier(compoundMask);
        statifier(compoundMask);

        return compoundMask;

    };
});