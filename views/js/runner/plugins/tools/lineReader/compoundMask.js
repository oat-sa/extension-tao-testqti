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
    'core/statifier',
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

    /**
     * JsDoc me !!!
     */
    return function compoundMaskFactory(config) {
        var compoundMask,
            allParts     = {},
            dimensions   = {},
            position     = {},
            constrains   = {},
            visualGuides = {
                borderWidth: 2 // this mirror a css property todo: make this better?
            };

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

                // set the new transform values (dimension and position) resulting from the current mask resize, and apply them
                onResize: function onResize(width, height, fromLeft, fromTop, x, y) {
                    setTopHeight(height, y, fromTop);
                    applyTransformToMasks();
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
                    applyTransformToMasks(); // todo: scope updates?
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
                    applyTransformToMasks();
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
                    applyTransformToMasks();
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
                    applyTransformToMasks();
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
                    applyTransformToMasks();
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
                    applyTransformToMasks();
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
                    applyTransformToMasks();
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
                            $element.addClass('border-' + edgeId);
                        }
                    });

                    $element
                        .on('mousedown', function() {
                            invokeOnOverlays('hide');
                            invokeOnMasks('setState', ['resizing', true]);
                        })
                        .on('mouseup', function() {
                            invokeOnOverlays('show');
                            invokeOnMasks('setState', ['resizing', false]);
                        });
                })
                .on('resize', maskConfig.onResize || _.noop)
                .on('beforeresize', maskConfig.beforeResize || _.noop)
                .on('resizeend', function () {
                    applyTranformsToOverlays();
                    invokeOnOverlays('show');
                    invokeOnMasks('setState', ['resizing', false]);
                })
                .init()
                .setTemplate(maskPartTpl);
        }



        function createOverlay(overlayConfig) {
            var overlayAPI = {
                transformOverlay: function transformOverlay() {
                    var $element = this.getElement();

                    this._sizeBackup = this.getSize();
                    this._posBackup = this.getPosition();

                    this.setSize(dimensions.outerWidth, dimensions.outerHeight)
                        .moveTo(position.outerX, position.outerY);
                    $element.addClass('moving');
                },

                restoreOverlay: function restoreOverlay() {
                    var $element = this.getElement();

                    this.setSize(this._sizeBackup.width, this._sizeBackup.height)
                        .moveTo(this._posBackup.x, this._posBackup.y);
                    $element.removeClass('moving');
                },

                appendVisualGuides: function appendVisualGuides() {
                    var $element = this.getElement(),
                        borderOffset = visualGuides.borderWidth * 2;

                    $element.append(visualGuides.$maskBg);
                    $element.append(visualGuides.$innerWindow);

                    visualGuides.$maskBg.css({
                        width: dimensions.outerWidth - borderOffset,
                        height: dimensions.outerHeight - borderOffset,
                        'border-top-width': dimensions.topHeight - borderOffset,
                        'border-right-width': dimensions.rightWidth - borderOffset,
                        'border-bottom-width': dimensions.bottomHeight - borderOffset,
                        'border-left-width': dimensions.leftWidth - borderOffset
                    });

                    visualGuides.$innerWindow.css({
                        width: dimensions.innerWidth,
                        height: dimensions.innerHeight,
                        left: dimensions.leftWidth - borderOffset,
                        top: dimensions.topHeight - borderOffset
                    });
                },

                removeVisualGuides: function removeVisualGuides() {
                    visualGuides.$maskBg.remove();
                    visualGuides.$innerWindow.remove();
                }
            };

            return makeDraggable(componentFactory(overlayAPI, overlayConfig))
                .on('render', function() {
                    var self = this,
                        $element = this.getElement();

                    $element
                        .on('mousedown', function() {
                            self.setState('dragging', true);
                            invokeOnMasks('hide');
                            self.transformOverlay();
                            self.appendVisualGuides();
                        })
                        .on('mouseup', function() {
                            if (self.is('dragging')) {
                                self.removeVisualGuides();
                                self.restoreOverlay();
                                invokeOnMasks('show');
                                self.setState('dragging', false);
                            }
                        });

                    // uncomment this to see what's going on with overlays:
                    // $element.css({ opacity: 0.5, 'background-color': 'yellow', border: '1px solid brown '});
                })
                .on('dragmove', function moveAllPartsTogether(xOffsetRelative, yOffsetRelative) {
                    // update the transform model
                    position.outerX += xOffsetRelative;
                    position.outerY += yOffsetRelative;
                    position.innerX += xOffsetRelative;
                    position.innerY += yOffsetRelative;
                })
                .on('dragend', function() {
                    // we repeat this here in case the mouse drag is not released on the overlay itself
                    this.removeVisualGuides();
                    invokeOnMasks('show');
                    this.setState('dragging', false);

                    // apply the transform model
                    applyTransformToMasks();
                    applyTranformsToOverlays();
                })
                .init()
                .setTemplate(overlayPartTpl);
        }

        function invokeOnMasks(fn, args) {
            invokeOn('mask', fn, args);
        }

        function invokeOnOverlays(fn, args) {
            invokeOn('overlay', fn, args);
        }

        function invokeOn(target, fn, args) {
            _.forOwn(allParts, function(part) {
                if (_.isObject(part[target]) && _.isFunction(part[target][fn])) {
                    part[target][fn].apply(part[target], args);
                }
            });
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

        function setTransforms(geoConfig) {
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

        function applyTransformToMasks() {
            _.forOwn(allParts, function(part) {
                part.mask.place.call(part); // todo: needed? use invoke?
            });
        }

        function applyTranformsToOverlays() {
            _.forOwn(allParts, function(part) {
                part.mask.placeOverlay(part.overlay);
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


        function createVisualGuides() {
            visualGuides.$maskBg = $('<div>', {
                'class': 'mask-bg'
            });
            visualGuides.$innerWindow = $('<div>', {
                'class': 'inner-window'
            });
        }

        config = _.defaults(config || {}, defaultConfig);







        compoundMask = {
            init: function init() {
                setTransforms(config);
                createCompoundMask();
                createVisualGuides();
                return this;
            },

            render: function render($container) {
                _.forOwn(allParts, function(part) {
                    part.mask.render($container);
                });
                _.forOwn(allParts, function(part) {
                    part.overlay.render($container);
                });
                applyTransformToMasks();
                applyTranformsToOverlays();

                return this;
            },

            destroy: function destroy() {
                _.forOwn(allParts, function(part) {
                    part.mask.destroy();
                    part.overlay.destroy();
                });

                return this;
            },

            show: function show() {
                invokeOnMasks('show');
                _.forOwn(allParts, function(part) {
                    part.overlay.show();
                });
                this.setState('hidden', false);

                return this;
            },

            hide: function hide() {
                invokeOnMasks('hide');
                _.forOwn(allParts, function(part) {
                    part.overlay.hide();
                });
                this.setState('hidden', true);

                return this;
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