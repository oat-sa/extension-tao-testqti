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
        innerHeight:    20,

        // position
        outerX:         100,
        outerY:         50,
        innerX:         150,
        innerY:         100,

        // constrains
        maskMinWidth:   20,
        maskMinHeight:  20
    };

    //fixme: what is my purpose in this world ?!??
    var overlayOffset = 5;

    return function compoundMaskFactory(config) {
        var compoundMask,
            allParts    = {},
            dimensions  = {},
            position    = {},
            constrains  = {};

        function createCompoundMask() {
            createPart('n', {
                width: dimensions.innerWidth,
                height: dimensions.topHeight,
                initialX: position.outerX + dimensions.leftWidth,
                initialY: position.outerY,
                minWidth: dimensions.maskMinWidth,
                minHeight: dimensions.maskMinHeight,
                borders: ['top', 'bottom'],
                edges: { top: true, right: false, bottom: true, left: false },
                beforeResize: function beforeResize(width, height, fromLeft, fromTop) {
                    if (fromTop) {
                        this.config.maxHeight = null;
                    } else {
                        this.config.maxHeight = dimensions.topHeight + (dimensions.innerHeight - constrains.maskMinHeight);
                    }
                },
                onResize: function onResize(width, height, fromLeft, fromTop, x, y) {
                    if (fromTop) {
                        dimensions.outerHeight = (y + height) + dimensions.innerHeight + dimensions.bottomHeight;
                        position.outerY = y;
                    } else {
                        dimensions.innerHeight = dimensions.outerHeight - height - dimensions.bottomHeight;
                        position.innerY = position.outerY + height;
                    }
                    dimensions.topHeight = height;
                    applyGeographics();
                }
            });
            createPart('ne', {
                width: dimensions.rightWidth,
                height: dimensions.topHeight,
                initialX: position.innerX + dimensions.innerWidth,
                initialY: position.outerY,
                borders: ['top', 'right'],
                edges: { top: true, right: true, bottom: false, left: false },
                onResize: function onResize(width, height, fromLeft, fromTop, x, y) {
                    if (! fromLeft) {
                        dimensions.outerWidth = (x + width) - position.outerX;
                        dimensions.rightWidth = width;
                    }
                    if (fromTop) {
                        position.outerY = y;
                        dimensions.topHeight = height;
                    }
                    applyGeographics(); // todo: scope updates
                }
            });
            createPart('e', {
                width: dimensions.rightWidth,
                height: dimensions.innerHeight,
                initialX: position.innerX + dimensions.innerWidth,
                initialY: position.innerY,
                borders: ['left', 'right'],
                edges: { top: false, right: true, bottom: false, left: true },
                beforeResize: function beforeResize(width, height, fromLeft) {
                    if (fromLeft) {
                        this.config.maxWidth = dimensions.rightWidth + (dimensions.innerWidth - constrains.maskMinWidth);
                    } else {
                        this.config.maxWidth = null;
                    }
                },
                onResize: function onResize(width, height, fromLeft, fromTop, x) {
                    if (! fromLeft) {
                        dimensions.outerWidth = (x + width) - position.outerX;
                    } else {
                        dimensions.innerWidth = x - position.innerX;
                    }
                    dimensions.rightWidth = width;
                    applyGeographics();
                }
            });
            createPart('se', {
                width: dimensions.rightWidth,
                height: dimensions.bottomHeight,
                initialX: position.innerX + dimensions.innerWidth,
                initialY: position.innerY + dimensions.innerHeight,
                borders: ['bottom', 'right'],
                edges: { top: false, right: true, bottom: true, left: false },
                onResize: function onResize(width, height, fromLeft, fromTop, x) {
                    if (! fromLeft) {
                        dimensions.outerWidth = (x + width) - position.outerX;
                        dimensions.rightWidth = width;
                    }
                    if (! fromTop) {
                        dimensions.bottomHeight = height;
                    }
                    applyGeographics();
                }
            });
            createPart('s', {
                width: dimensions.innerWidth,
                height: dimensions.bottomHeight,
                initialX: position.outerX + dimensions.leftWidth,
                initialY: position.innerY + dimensions.innerHeight,
                borders: ['top', 'bottom'],
                edges: { top: true, right: false, bottom: true, left: false },
                beforeResize: function beforeResize(width, height, fromLeft, fromTop) {
                    if (fromTop) {
                        this.config.maxHeight = dimensions.bottomHeight + (dimensions.innerHeight - constrains.maskMinHeight);
                    } else {
                        this.config.maxHeight = null;
                    }
                },
                onResize: function onResize(width, height, fromLeft, fromTop, x, y) {
                    if (fromTop) {
                        dimensions.innerHeight = y - position.innerY;
                    } else {
                        dimensions.outerHeight = (y + height) - position.outerY;
                    }
                    dimensions.bottomHeight = height;
                    applyGeographics();
                }
            });
            createPart('sw', {
                width: dimensions.leftWidth,
                height: dimensions.bottomHeight,
                initialX: position.outerX,
                initialY: position.innerY + dimensions.innerHeight,
                borders: ['left', 'bottom'],
                edges: { top: false, right: false, bottom: true, left: true },
                onResize: function onResize(width, height, fromLeft, fromTop, x) {
                    if (fromLeft) {
                        dimensions.outerWidth = width + dimensions.innerWidth + dimensions.leftWidth;
                        dimensions.leftWidth = width;
                        position.outerX = x;
                    }
                    if (! fromTop) {
                        dimensions.bottomHeight = height;
                    }
                    applyGeographics();
                }
            });
            createPart('w', {
                width: dimensions.leftWidth,
                height: dimensions.innerHeight,
                initialX: position.outerX,
                initialY: position.innerY,
                borders: ['left', 'right'],
                edges: { top: false, right: true, bottom: false, left: true },
                beforeResize: function beforeResize(width, height, fromLeft) {
                    if (fromLeft) {
                        this.config.maxWidth = null;
                    } else {
                        this.config.maxWidth = dimensions.leftWidth + (dimensions.innerWidth - constrains.maskMinWidth);
                    }
                },
                onResize: function onResize(width, height, fromLeft, fromTop, x) {
                    if (fromLeft) {
                        dimensions.outerWidth = width + dimensions.innerWidth + dimensions.rightWidth;
                        position.outerX = x;
                    } else {
                        dimensions.innerWidth = dimensions.outerWidth - width - dimensions.rightWidth;
                        position.innerX = position.outerX + width;
                    }
                    dimensions.leftWidth = width;
                    applyGeographics();
                }
            });
            createPart('nw', {
                width: dimensions.leftWidth,
                height: dimensions.topHeight,
                initialX: position.outerX,
                initialY: position.outerY,
                borders: ['left', 'top'],
                edges: { top: true, right: false, bottom: false, left: true },
                onResize: function onResize(width, height, fromLeft, fromTop, x, y) {
                    if (fromLeft) {
                        dimensions.outerWidth = width + dimensions.innerWidth + dimensions.leftWidth;
                        dimensions.leftWidth = width;
                        position.outerX = x;
                    }
                    if (fromTop) {
                        position.outerY = y;
                        dimensions.topHeight = height;
                    }
                    applyGeographics();
                }
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
                .on('resize', function(width, height, fromLeft, fromTop) {
                    if (fromTop || fromLeft) {
                        updatePosition(); // fixme: hmpf?!
                    }
                })
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
                            self.moveTo(position.outerX, position.outerY);
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
            var nwPosition  = allParts.nw.mask.getPosition(),
                nwSize      = allParts.nw.mask.getSize();

            position.outerX = nwPosition.x;
            position.outerY = nwPosition.y;
            position.innerX = nwPosition.x + nwSize.width;
            position.innerY = nwPosition.y + nwSize.height;
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

        function setGeographics(geoConfig) {
            dimensions = {
                outerWidth:     geoConfig.outerWidth,
                outerHeight:    geoConfig.outerHeight,
                innerWidth:     geoConfig.innerWidth,
                innerHeight:    geoConfig.innerHeight,

                topHeight:      geoConfig.innerY - geoConfig.outerY,
                rightWidth:     geoConfig.outerWidth - (geoConfig.innerX - geoConfig.outerX) - geoConfig.innerWidth,
                bottomHeight:   geoConfig.outerHeight - (geoConfig.innerY - geoConfig.outerY) - geoConfig.innerHeight,
                leftWidth:      geoConfig.innerX - geoConfig.outerX
            };

            position = {
                outerX: geoConfig.outerX,
                outerY: geoConfig.outerY,
                innerX: geoConfig.innerX,
                innerY: geoConfig.innerY
            };

            constrains = {
                maskMinWidth: geoConfig.maskMinWidth,
                maskMinHeight: geoConfig.maskMinHeight
            };
        }

        function applyGeographics() {
            allParts.n.mask
                .moveTo(
                    position.innerX,
                    position.outerY
                ).setSize(
                    dimensions.innerWidth,
                    dimensions.topHeight
                );

            allParts.ne.mask
                .moveTo(
                    position.innerX + dimensions.innerWidth,
                    position.outerY
                ).setSize(
                    dimensions.rightWidth,
                    dimensions.topHeight
                );

            allParts.e.mask
                .moveTo(
                    position.innerX + dimensions.innerWidth,
                    position.innerY
                ).setSize(
                    dimensions.rightWidth,
                    dimensions.innerHeight
                );

            allParts.se.mask
                .moveTo(
                    position.innerX + dimensions.innerWidth,
                    position.innerY + dimensions.innerHeight
                ).setSize(
                    dimensions.rightWidth,
                    dimensions.bottomHeight
                );

            allParts.s.mask
                .moveTo(
                    position.innerX ,
                    position.innerY + dimensions.innerHeight
                ).setSize(
                    dimensions.innerWidth,
                    dimensions.bottomHeight
                );

            allParts.sw.mask
                .moveTo(
                    position.outerX,
                    position.innerY + dimensions.innerHeight
                ).setSize(
                    dimensions.leftWidth,
                    dimensions.bottomHeight
                );

            allParts.w.mask
                .moveTo(
                    position.outerX,
                    position.innerY
                ).setSize(
                    dimensions.leftWidth,
                    dimensions.innerHeight
                );

            allParts.nw.mask
                .moveTo(
                    position.outerX,
                    position.outerY
                ).setSize(
                    dimensions.leftWidth,
                    dimensions.topHeight
                );

        }

        config = _.defaults(config || {}, defaultConfig);







        compoundMask = {
            init: function init() {

                setGeographics(config);

                createCompoundMask();
                // applyGeographics();
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
            },

            getPosition: function getPosition() {
                return position;
            },

            getConstrains: function getConstrains() {
                return constrains;
            },

            getParts: function getParts() {
                return allParts;
            }
        };

        eventifier(compoundMask);
        statifier(compoundMask);

        return compoundMask;

    };
});