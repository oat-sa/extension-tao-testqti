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
        outerWidth:     500,
        outerHeight:    300,
        innerWidth:     400,
        innerHeight:    50,
        initialX:       100,
        initialY:       100
    };

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
                borders: ['top', 'bottom']
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
                mask: createMask(id, partConfig),
                overlay: createOverlay(id, partConfig)
            };
        }

        function createMask(id, maskConfig) {
            return makePlaceable(componentFactory({}, maskConfig))
                .on('render', function() {
                    var $element = this.getElement();

                    if (_.isArray(this.config.borders)) {
                        this.config.borders.forEach(function(borderPosition) {
                            $element.css('border-' + borderPosition + '-width', '1px');
                        });
                    }
                })
                .init()
                .setTemplate(maskPartTpl);
        }

        function createOverlay(id, overlayConfig) {
            var overlay = componentFactory({}, overlayConfig);

            return makeDraggable(overlay)
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

                overlay.setSize(size.width, size.height);
                overlay.moveTo(pos.x, pos.y);
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
                    innerHeight:    config.innerHeight
                };
                dimensions.topHeight    =
                dimensions.bottomHeight = (dimensions.outerHeight - dimensions.innerHeight) / 2;
                dimensions.rightWidth   =
                dimensions.leftWidth    = (dimensions.outerWidth - dimensions.innerWidth) / 2;

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