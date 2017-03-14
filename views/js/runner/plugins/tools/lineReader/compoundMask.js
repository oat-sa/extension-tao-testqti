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
 * A compound mask is a mask built with multiple ui/components that interacts with each other.
 * The compound mask itself is not a ui/component but mimic most of its API.
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
        outerWidth:  500,
        outerHeight: 300,
        innerWidth:  400,
        innerHeight: 20,

        // position
        outerX: 100,
        outerY: 50,
        innerX: 150,
        innerY: 100,

        // constrains
        minWidth:  30,
        minHeight: 30,
        resizeHandleSize: 10
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

                // move and dimension the overlay
                placeOverlay: function placeOverlay(overlay) {
                    var pos = this.getPosition(),
                        size = this.getSize();
                    overlay.moveTo(
                        pos.x,
                        pos.y + constrains.resizeHandleSize
                    ).setSize(
                        size.width,
                        size.height - (constrains.resizeHandleSize * 2)
                    );
                },

                // set a resize limit whenever resize happens on an inner edge (here, the top inner edge, eg. the bottom of the mask),
                // so the min/max width/height limit for "inner component" is respected
                beforeResize: function beforeResize(width, height, fromLeft, fromTop) {
                    this.config.maxHeight = (fromTop)
                        ? null
                        : dimensions.topHeight + (dimensions.innerHeight - constrains.minHeight);
                },

                // set the new geographics (dimension and position) resulting from the current mask resize, and apply them
                onResize: function onResize(width, height, fromLeft, fromTop, x, y) {
                    setTopHeight(height, y, fromTop);
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

                placeOverlay: function placeOverlay(overlay) {
                    var pos = this.getPosition(),
                        size = this.getSize();
                    overlay.moveTo(
                        pos.x,
                        pos.y + constrains.resizeHandleSize
                    ).setSize(
                        size.width - constrains.resizeHandleSize,
                        size.height - (constrains.resizeHandleSize * 2)
                    );
                },

                onResize: function onResize(width, height, fromLeft, fromTop, x, y) {
                    setTopHeight(height, y, fromTop);
                    setRightWidth(width, x, fromLeft);
                    applyGeographics(); // todo: scope updates?
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

                placeOverlay: function placeOverlay(overlay) {
                    var pos = this.getPosition(),
                        size = this.getSize();
                    overlay.moveTo(
                        pos.x + constrains.resizeHandleSize,
                        pos.y - constrains.resizeHandleSize
                    ).setSize(
                        size.width - (constrains.resizeHandleSize * 2),
                        size.height + (constrains.resizeHandleSize * 2)
                    );
                },

                beforeResize: function beforeResize(width, height, fromLeft) {
                    this.config.maxWidth = (fromLeft)
                        ? dimensions.rightWidth + (dimensions.innerWidth - constrains.minWidth)
                        : null;
                },

                onResize: function onResize(width, height, fromLeft, fromTop, x) {
                    setRightWidth(width, x, fromLeft);
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

                placeOverlay: function placeOverlay(overlay) {
                    var pos = this.getPosition(),
                        size = this.getSize();
                    overlay.moveTo(
                        pos.x,
                        pos.y + constrains.resizeHandleSize
                    ).setSize(
                        size.width - constrains.resizeHandleSize,
                        size.height - (constrains.resizeHandleSize * 2)
                    );
                },

                onResize: function onResize(width, height, fromLeft, fromTop, x, y) {
                    setRightWidth(width, x, fromLeft);
                    setBottomHeight(height, y, fromTop);
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

                placeOverlay: function placeOverlay(overlay) {
                    var pos = this.getPosition(),
                        size = this.getSize();
                    overlay.moveTo(
                        pos.x,
                        pos.y + constrains.resizeHandleSize
                    ).setSize(
                        size.width,
                        size.height - (constrains.resizeHandleSize * 2)
                    );
                },

                beforeResize: function beforeResize(width, height, fromLeft, fromTop) {
                    this.config.maxHeight = (fromTop)
                        ? dimensions.bottomHeight + (dimensions.innerHeight - constrains.minHeight)
                        : null;
                },

                onResize: function onResize(width, height, fromLeft, fromTop, x, y) {
                    setBottomHeight(height, y, fromTop);
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

                placeOverlay: function placeOverlay(overlay) {
                    var pos = this.getPosition(),
                        size = this.getSize();
                    overlay.moveTo(
                        pos.x + constrains.resizeHandleSize,
                        pos.y + constrains.resizeHandleSize
                    ).setSize(
                        size.width - constrains.resizeHandleSize,
                        size.height - (constrains.resizeHandleSize * 2)
                    );
                },

                onResize: function onResize(width, height, fromLeft, fromTop, x, y) {
                    setBottomHeight(height, y, fromTop);
                    setLeftWidth(width, x, fromLeft);
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

                placeOverlay: function placeOverlay(overlay) {
                    var pos = this.getPosition(),
                        size = this.getSize();
                    overlay.moveTo(
                        pos.x + constrains.resizeHandleSize,
                        pos.y - constrains.resizeHandleSize
                    ).setSize(
                        size.width - (constrains.resizeHandleSize * 2),
                        size.height + (constrains.resizeHandleSize * 2)
                    );
                },

                beforeResize: function beforeResize(width, height, fromLeft) {
                    this.config.maxWidth = (fromLeft)
                        ? null
                        : dimensions.leftWidth + (dimensions.innerWidth - constrains.minWidth);
                },

                onResize: function onResize(width, height, fromLeft, fromTop, x) {
                    setLeftWidth(width, x, fromLeft);
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

                placeOverlay: function placeOverlay(overlay) {
                    var pos = this.getPosition(),
                        size = this.getSize();
                    overlay.moveTo(
                        pos.x + constrains.resizeHandleSize,
                        pos.y + constrains.resizeHandleSize
                    ).setSize(
                        size.width - constrains.resizeHandleSize,
                        size.height - (constrains.resizeHandleSize * 2)
                    );
                },

                onResize: function onResize(width, height, fromLeft, fromTop, x, y) {
                    setTopHeight(height, y, fromTop);
                    setLeftWidth(width, x, fromLeft);
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
            var maskAPI;

            maskAPI = {
                place: maskConfig.place,
                placeOverlay: maskConfig.placeOverlay
            };

            return makeResizable(componentFactory(maskAPI, maskConfig))
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
            var overlay = componentFactory({}, overlayConfig);

            return makeDraggable(overlay)
                .on('render', function() {
                    var self = this,
                        $element = this.getElement();

                    $element
                        .on('mousedown', function coverAllCompoundMask() {
                            self.setSize(dimensions.outerWidth, dimensions.outerHeight);
                            self.moveTo(position.outerX, position.outerY);
                        })
                        .on('mouseup', function () {
                            resetOverlays();
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
                minHeight: geoConfig.minHeight,
                resizeHandleSize: geoConfig.resizeHandleSize
            };
        }

        function applyGeographics() {
            _.forOwn(allParts, function(part) {
                part.mask.place.call(part); // todo: needed? use invoke?
            });
            resetOverlays();
        }

        function resetOverlays() {
            _.forOwn(allParts, function(part) {
                // var overlay = part.overlay,
                //     mask    = part.mask,
                //     size    = mask.getSize(),
                //     pos     = mask.getPosition();
                part.mask.placeOverlay(part.overlay);
                // overlay.place(
                //     pos.x,
                //     pos.y,
                //     size.width,
                //     size.height
                // );
            });
        }

        function setTopHeight(height, y, fromTop) {
            dimensions.topHeight = height;

            if (fromTop) {
                dimensions.outerHeight = height + dimensions.innerHeight + dimensions.bottomHeight;
                position.outerY = y;
            } else {
                dimensions.innerHeight = dimensions.outerHeight - height - dimensions.bottomHeight;
                position.innerY = position.outerY + height;
            }
        }

        function setRightWidth(width, x, fromLeft) {
            dimensions.rightWidth = width;

            if (fromLeft) {
                dimensions.innerWidth = x - position.innerX;
            } else {
                dimensions.outerWidth = dimensions.leftWidth + dimensions.innerWidth + width;
            }
        }

        function setBottomHeight(height, y, fromTop) {
            dimensions.bottomHeight = height;

            if (fromTop) {
                dimensions.innerHeight = y - position.innerY;
                dimensions.bottomHeight = height;
            } else {
                dimensions.outerHeight = dimensions.topHeight + dimensions.innerHeight + height;
            }
        }

        function setLeftWidth(width, x, fromLeft) {
            dimensions.leftWidth = width;

            if (fromLeft) {
                dimensions.outerWidth = width + dimensions.innerWidth + dimensions.rightWidth;
                position.outerX = x;
            } else {
                dimensions.innerWidth = dimensions.outerWidth - width - dimensions.rightWidth;
                position.innerX = position.outerX + width;
            }
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