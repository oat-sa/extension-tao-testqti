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
    'core/statifier', // todo: needed ?
    'ui/component',
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
        minWidth:   20,
        minHeight:  20
    };

    //fixme: what is my purpose in this world ?!??
    var overlayOffset = 5;

    /**
     * JsDoc me !!!
     */
    return function compoundMaskFactory(config) {
        var compoundMask,
            allParts    = {},
            dimensions  = {},
            position    = {},
            constrains  = {};

        function createCompoundMask() {

            // North
            createPart('n', _.assign({}, constrains, {
                edges: { top: true, right: false, bottom: true, left: false },

                // move and dimension the mask
                place: function place() {
                    this.moveTo(
                        position.innerX,
                        position.outerY
                    ).setSize(
                        dimensions.innerWidth,
                        dimensions.topHeight
                    );
                },

                // set a resize limit whenever resize happens on an inner edge (here, the top inner edge),
                // so the min/max width/height limit for adjacent components are respected
                beforeResize: function beforeResize(width, height, fromLeft, fromTop) {
                    if (fromTop) {
                        this.config.maxHeight = null;
                    } else {
                        this.config.maxHeight = dimensions.topHeight + (dimensions.innerHeight - constrains.minHeight);
                    }
                },

                // set the new dimension and position of the whole following this specific mask resize
                onResize: function onResize(width, height, fromLeft, fromTop, x, y) {
                    if (fromTop) {
                        dimensions.outerHeight = height + dimensions.innerHeight + dimensions.bottomHeight;
                        position.outerY = y;
                    } else {
                        dimensions.innerHeight = dimensions.outerHeight - height - dimensions.bottomHeight;
                        position.innerY = position.outerY + height;
                    }
                    dimensions.topHeight = height;
                    applyGeographics();
                }
            }));

            // North-east
            createPart('ne', _.assign({}, constrains, {
                edges: { top: true, right: true, bottom: false, left: false },

                place: function place() {
                    this.moveTo(
                        position.innerX + dimensions.innerWidth,
                        position.outerY
                    ).setSize(
                        dimensions.rightWidth,
                        dimensions.topHeight
                    );
                },

                onResize: function onResize(width, height, fromLeft, fromTop, x, y) {
                    if (! fromLeft) {
                        dimensions.outerWidth = (x + width) - position.outerX;
                        dimensions.rightWidth = width;
                    }
                    if (fromTop) {
                        position.outerY = y;
                        dimensions.outerHeight = height + dimensions.innerHeight + dimensions.bottomHeight;
                        dimensions.topHeight = height;
                    }
                    applyGeographics(); // todo: scope updates
                }
            }));

            // East
            createPart('e', _.assign({}, constrains, {
                edges: { top: false, right: true, bottom: false, left: true },

                place: function place() {
                    this.moveTo(
                        position.innerX + dimensions.innerWidth,
                        position.innerY
                    ).setSize(
                        dimensions.rightWidth,
                        dimensions.innerHeight
                    );
                },

                beforeResize: function beforeResize(width, height, fromLeft) {
                    if (fromLeft) {
                        this.config.maxWidth = dimensions.rightWidth + (dimensions.innerWidth - constrains.minWidth);
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
            }));

            // South east
            createPart('se', _.assign({}, constrains, {
                edges: { top: false, right: true, bottom: true, left: false },

                place: function place() {
                    this.moveTo(
                        position.innerX + dimensions.innerWidth,
                        position.innerY + dimensions.innerHeight
                    ).setSize(
                        dimensions.rightWidth,
                        dimensions.bottomHeight
                    );
                },

                onResize: function onResize(width, height, fromLeft, fromTop, x) {
                    if (! fromLeft) {
                        dimensions.outerWidth = (x + width) - position.outerX;
                        dimensions.rightWidth = width;
                    }
                    if (! fromTop) {
                        dimensions.outerHeight = dimensions.topHeight + dimensions.innerHeight + height;
                        dimensions.bottomHeight = height;
                    }
                    applyGeographics();
                }
            }));

            // South
            createPart('s', _.assign({}, constrains, {
                edges: { top: true, right: false, bottom: true, left: false },

                place: function place() {
                    this.moveTo(
                        position.innerX ,
                        position.innerY + dimensions.innerHeight
                    ).setSize(
                        dimensions.innerWidth,
                        dimensions.bottomHeight
                    );
                },

                beforeResize: function beforeResize(width, height, fromLeft, fromTop) {
                    if (fromTop) {
                        this.config.maxHeight = dimensions.bottomHeight + (dimensions.innerHeight - constrains.minHeight);
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
            }));

            // South-west
            createPart('sw', _.assign({}, constrains, {
                edges: { top: false, right: false, bottom: true, left: true },

                place: function place() {
                    this.moveTo(
                        position.outerX,
                        position.innerY + dimensions.innerHeight
                    ).setSize(
                        dimensions.leftWidth,
                        dimensions.bottomHeight
                    );
                },

                onResize: function onResize(width, height, fromLeft, fromTop, x) {
                    if (fromLeft) {
                        dimensions.outerWidth = width + dimensions.innerWidth + dimensions.rightWidth;
                        dimensions.leftWidth = width;
                        position.outerX = x;
                    }
                    if (! fromTop) {
                        dimensions.outerHeight = dimensions.topHeight + dimensions.innerHeight + height;
                        dimensions.bottomHeight = height;
                    }
                    applyGeographics();
                }
            }));

            // West
            createPart('w', _.assign({}, constrains, {
                edges: { top: false, right: true, bottom: false, left: true },

                place: function place() {
                    this.moveTo(
                        position.outerX,
                        position.innerY
                    ).setSize(
                        dimensions.leftWidth,
                        dimensions.innerHeight
                    );
                },

                beforeResize: function beforeResize(width, height, fromLeft) {
                    if (fromLeft) {
                        this.config.maxWidth = null;
                    } else {
                        this.config.maxWidth = dimensions.leftWidth + (dimensions.innerWidth - constrains.minWidth);
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
            }));

            // North-west
            createPart('nw', _.assign({}, constrains, {
                edges: { top: true, right: false, bottom: false, left: true },

                place: function place() {
                    this.moveTo(
                        position.outerX,
                        position.outerY
                    ).setSize(
                        dimensions.leftWidth,
                        dimensions.topHeight
                    );
                },

                onResize: function onResize(width, height, fromLeft, fromTop, x, y) {
                    if (fromLeft) {
                        dimensions.outerWidth = width + dimensions.innerWidth + dimensions.rightWidth;
                        dimensions.leftWidth = width;
                        position.outerX = x;
                    }
                    if (fromTop) {
                        dimensions.outerHeight = height + dimensions.innerHeight + dimensions.bottomHeight;
                        dimensions.topHeight = height;
                        position.outerY = y;
                    }
                    applyGeographics();
                }
            }));
        }

        // jsdoc me !!
        function createPart(id, partConfig) {
            allParts[id] = {
                mask: createMask(partConfig),
                overlay: createOverlay(partConfig)
            };
        }

        function createMask(maskConfig) {
            return makeResizable(componentFactory({
                place: maskConfig.place
            }, maskConfig))
                .on('render', function() {
                    var $element = this.getElement();

                    // style each resizable edge
                    _.forOwn(this.config.edges, function (isResizable, edgeId) {
                        if (isResizable) {
                            $element.css('border-' + edgeId + '-width', '1px'); // todo: create style
                        }
                    });
                })
                .on('resize', maskConfig.onResize || _.noop)
                .on('beforeresize', maskConfig.beforeResize || _.noop)
                .on('resizeend', function () {
                    resetOverlays();
                })
                .init()
                .setTemplate(maskPartTpl);
        }

        function createOverlay(overlayConfig) {
            var overlay,
                overlayAPI;

            overlayAPI = {
                place: function place(maskX, maskY, maskWidth, maskHeight) {
                    this.setSize(
                        maskWidth - this._widthOffset,
                        maskHeight - this._heightOffset
                    );
                    this.moveTo(
                        maskX + this._xOffset,
                        maskY + this._yOffset
                    );
                }
            };

            overlay = componentFactory(overlayAPI, overlayConfig);

            return makeDraggable(overlay)
                .on('init', function() {
                    this._widthOffset = 0;
                    this._heightOffset = 0;
                    this._xOffset = 0;
                    this._yOffset = 0;

                    if (this.config.edges.top) {
                        this._heightOffset += overlayOffset;
                        this._yOffset += overlayOffset;
                    }
                    if (this.config.edges.right) {
                        this._widthOffset += overlayOffset;
                    }
                    if (this.config.edges.bottom) {
                        this._heightOffset += overlayOffset;
                    }
                    if (this.config.edges.left) {
                        this._widthOffset += overlayOffset;
                        this._xOffset += overlayOffset;
                    }
                })
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
                var overlay = part.overlay,
                    mask    = part.mask,
                    size    = mask.getSize(),
                    pos     = mask.getPosition();

                overlay.place(
                    pos.x,
                    pos.y,
                    size.width,
                    size.height
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
                minWidth: geoConfig.minWidth,
                minHeight: geoConfig.minHeight
            };
        }

        function applyGeographics() {
            _.forOwn(allParts, function(part) {
                part.mask.place.call(part);
            });

            resetOverlays();
        }

        config = _.defaults(config || {}, defaultConfig);







        compoundMask = {
            init: function init() {
                setGeographics(config);
                createCompoundMask();
            },

            render: function render($container) {
                _.forOwn(allParts, function(part) {
                    part.mask.render($container);
                });
                _.forOwn(allParts, function(part) {
                    part.overlay.render($container);
                });
                applyGeographics();
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