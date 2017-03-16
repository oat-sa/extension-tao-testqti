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
    'ui/component/stackable',
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
    makeStackable,
    maskPartTpl,
    overlayPartTpl
) {
    'use strict';

    var defaultDimensions = {
        outerWidth:  600,
        outerHeight: 400,
        innerWidth:  500,
        innerHeight: 20
    };
    var defaultPosition = {
        outerX: 0,
        outerY: 0,
        innerX: 50,
        innerY: 50
    };
    var defaultConstrains = {
        minWidth:  30,
        minHeight: 30,
        resizeHandleSize: 10
    };
    var stackingOptions = {
        stackingScope: 'test-runner'
    };

    /**
     * JsDoc me !!!
     */
    return function compoundMaskFactory(dimensions, position, constrains) {
        var compoundMask,
            allParts = {},
            innerDrag = {
                width: 5
            },
            visualGuides = {
                borderWidth: 1 // this mirror the $lrBorderWidth css variable
            };

        /**
         * ============================================
         * Definition of Mask & Overlay component types
         * ============================================
         */

        function createMask(maskConfig) {
            var mask,
                maskAPI = {
                    place: maskConfig.place,
                    placeOverlay: maskConfig.placeOverlay,

                    styleResizableEdges: function styleResizableEdges() {
                        var $element = this.getElement();
                        _.forOwn(this.config.edges, function (isResizable, edgeId) {
                            if (isResizable) {
                                $element.addClass('border-' + edgeId);
                            }
                        });
                    }
                };

            mask = componentFactory(maskAPI, maskConfig);
            makeResizable(mask);
            makeStackable(mask, stackingOptions);

            return mask
                .on('render', function() {
                    var $element = this.getElement();

                    this.styleResizableEdges();

                    $element
                        .on('mousedown', function() {
                            bringAllToFront();
                        });

                    // uncomment this to see what's going on with masks:
                    // $element.css({ border: '1px solid olive'});
                })
                .on('resizestart', function () {
                    innerDrag.handle.hide();
                    invokeOnOverlays('hide');
                    invokeOnMasks('setState', ['resizing', true]);
                })
                .on('beforeresize', maskConfig.beforeResize || _.noop)
                .on('resize', maskConfig.onResize || _.noop)
                .on('resizeend', function () {
                    applyTransformsToOverlays();
                    applyTransformsToInnerDrag();

                    invokeOnMasks('setState', ['resizing', false]);
                    invokeOnOverlays('show');
                    innerDrag.handle.show();
                })
                .init()
                .setTemplate(maskPartTpl);
        }



        function createOverlay(overlayConfig) {
            var overlay,
                overlayAPI = {
                    transformOverlay: function transformOverlay() {
                        var $element = this.getElement();

                        this._sizeBackup = this.getSize();
                        this._posBackup = this.getPosition();

                        this.setSize(dimensions.outerWidth, dimensions.outerHeight)
                            .moveTo(position.outerX, position.outerY);
                        $element.addClass('moving');

                        this.setState('transformed', true);
                    },

                    restoreOverlay: function restoreOverlay() {
                        var $element = this.getElement();

                        if (this.is('transformed')) {

                            this.setSize(this._sizeBackup.width, this._sizeBackup.height)
                                .moveTo(this._posBackup.x, this._posBackup.y);
                            $element.removeClass('moving');

                            this._sizeBackup = null;
                            this._posBackup = null;

                            this.setState('transformed', false);
                        }
                    },

                    appendVisualGuides: function appendVisualGuides() {
                        var $element = this.getElement(),
                            borderOffset = visualGuides.borderWidth * 2;

                        $element.append(visualGuides.$maskBg);
                        $element.append(visualGuides.$innerWindow);

                        visualGuides.$maskBg.css({
                            width:  dimensions.outerWidth - borderOffset,
                            height: dimensions.outerHeight - borderOffset,
                            'border-top-width':     dimensions.topHeight - borderOffset,
                            'border-right-width':   dimensions.rightWidth - borderOffset,
                            'border-bottom-width':  dimensions.bottomHeight - borderOffset,
                            'border-left-width':    dimensions.leftWidth - borderOffset
                        });

                        visualGuides.$innerWindow.css({
                            width:  dimensions.innerWidth,
                            height: dimensions.innerHeight,
                            left:   dimensions.leftWidth - borderOffset,
                            top:    dimensions.topHeight - borderOffset
                        });
                    },

                    removeVisualGuides: function removeVisualGuides() {
                        visualGuides.$maskBg.remove();
                        visualGuides.$innerWindow.remove();
                    }
                };

            overlay = componentFactory(overlayAPI, overlayConfig);
            makeDraggable(overlay);
            makeStackable(overlay, stackingOptions);

            return overlay
                .on('render', function() {
                    var self = this,
                        $element = this.getElement();

                    $element
                        .on('mousedown', function() {
                            bringAllToFront();
                            self.transformOverlay();
                        })
                        .on('mouseup', function() {
                            self.restoreOverlay();
                        });

                    // uncomment this to see what's going on with overlays:
                    // $element.css({ opacity: 0.5, 'background-color': 'yellow', border: '1px solid brown '});
                })
                .on('dragstart', function() {
                    innerDrag.handle.hide();
                    invokeOnMasks('hide');
                    this.appendVisualGuides();
                })
                .on('dragmove', function moveAllPartsTogether(xOffsetRelative, yOffsetRelative) {
                    // update the transform model
                    position.outerX += xOffsetRelative;
                    position.outerY += yOffsetRelative;
                    position.innerX += xOffsetRelative;
                    position.innerY += yOffsetRelative;
                })
                .on('dragend', function() {
                    this.removeVisualGuides();
                    // although they are already display, calling show() again on the overlays
                    // will force their z-Index at the top of the stack
                    invokeOnAll('show');
                    innerDrag.handle.show();

                    // apply the new transform model
                    applyTransforms();
                })
                .init()
                .setTemplate(overlayPartTpl);
        }


        /**
         * =================
         * Inner Drag Handle
         * =================
         */

        function createInnerDragHandle() {
            innerDrag.handle = componentFactory();

            makeStackable(innerDrag.handle, stackingOptions);
            makeDraggable(innerDrag.handle, {
                dragRestriction: function dragRestriction() {
                    var fixedXY = allParts.nw.mask.getElement().offset();

                    return {
                        x: fixedXY.left + (constrains.minWidth - constrains.resizeHandleSize * 2),
                        y: fixedXY.top + constrains.minHeight,
                        width: dimensions.outerWidth
                        - dimensions.innerWidth
                        - constrains.minWidth
                        - constrains.resizeHandleSize - innerDrag.width,
                        height: dimensions.outerHeight - (constrains.minHeight * 2)
                    };
                }
            })
                .on('render', function() {
                    var $element = this.getElement();

                    $element.addClass('line-reader-inner-drag');

                    $element.on('mousedown', function(e) {
                        e.stopPropagation();
                    });
                })
                .on('dragstart', function() {
                    invokeOnOverlays('hide');
                    invokeOnMasks('setState', ['resizing', true]);
                })
                .on('dragmove', function(xOffsetRelative, yOffsetRelative) {
                    position.innerX += xOffsetRelative;
                    position.innerY += yOffsetRelative;

                    dimensions.leftWidth += xOffsetRelative;
                    dimensions.topHeight += yOffsetRelative;

                    dimensions.rightWidth   -= xOffsetRelative;
                    dimensions.bottomHeight -= yOffsetRelative;

                    applyTransformsToMasks();
                })
                .on('dragend', function() {
                    invokeOnOverlays('show');
                    innerDrag.handle.bringToFront();
                    invokeOnMasks('setState', ['resizing', false]);

                    applyTransformsToOverlays();
                })
                .init();

            //todo: enforce minimum size for handler in transform checks

        }

        /**
         * =================
         * Utility functions
         * =================
         */
        function bringAllToFront() {
            invokeOnAll('bringToFront');
            innerDrag.handle.bringToFront();
        }

        function invokeOnAll(fn, args) {
            invokeOnMasks(fn, args);
            invokeOnOverlays(fn, args);
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

        /**
         * =================================
         * Transform model related functions
         * =================================
         */

        function applyTransforms() {
            applyTransformsToMasks();
            applyTransformsToOverlays();
            applyTransformsToInnerDrag();
        }

        function applyTransformsToMasks() {
            invokeOnMasks('place');
        }

        function applyTransformsToOverlays() {
            _.forOwn(allParts, function(part) {
                part.mask.placeOverlay(part.overlay);
            });
        }

        function applyTransformsToInnerDrag() {
            if (innerDrag.handle) {
                innerDrag.handle
                    .setSize(innerDrag.width, dimensions.innerHeight)
                    .moveTo(
                        position.innerX - constrains.resizeHandleSize - innerDrag.width, // todo check minWidth constrain validity
                        position.innerY
                    );
            }
        }

        /**
         * Check that the given dimensions respect the current constrains.
         * If not, correct them
         */
        function correctTransforms() {
            if (dimensions.topHeight < constrains.minHeight) {
                dimensions.topHeight = constrains.minHeight;
                position.innerY = position.outerY + constrains.minHeight;
            }
            if (dimensions.innerHeight < constrains.minHeight) {
                dimensions.innerHeight = constrains.minHeight;
            }
            if (dimensions.bottomHeight < constrains.minHeight) {
                dimensions.bottomHeight = constrains.minHeight;
            }
            dimensions.outerHeight = dimensions.topHeight + dimensions.innerHeight + dimensions.bottomHeight;

            if (dimensions.leftWidth < constrains.minWidth) {
                dimensions.leftWidth = constrains.minWidth;
                position.innerX = position.outerX + constrains.minWidth;
            }
            if (dimensions.innerWidth < constrains.minWidth) {
                dimensions.innerWidth = constrains.minWidth;
            }
            if (dimensions.rightWidth < constrains.minWidth) {
                dimensions.rightWidth = constrains.minWidth;
            }
            dimensions.outerWidth = dimensions.leftWidth + dimensions.innerWidth + dimensions.rightWidth;
        }

        function setTopHeight(newHeight, newY, fromTop) {
            dimensions.topHeight = newHeight;

            if (fromTop) {
                dimensions.outerHeight = newHeight + dimensions.innerHeight + dimensions.bottomHeight;
                position.outerY = newY;
            } else {
                dimensions.innerHeight = dimensions.outerHeight - newHeight - dimensions.bottomHeight;
                position.innerY = position.outerY + newHeight;
            }
        }

        function setRightWidth(newWidth, newX, fromLeft) {
            dimensions.rightWidth = newWidth;

            if (fromLeft) {
                dimensions.innerWidth = newX - position.innerX;
            } else {
                dimensions.outerWidth = dimensions.leftWidth + dimensions.innerWidth + newWidth;
            }
        }

        function setBottomHeight(newHeight, newY, fromTop) {
            dimensions.bottomHeight = newHeight;

            if (fromTop) {
                dimensions.innerHeight = newY - position.innerY;
                dimensions.bottomHeight = newHeight;
            } else {
                dimensions.outerHeight = dimensions.topHeight + dimensions.innerHeight + newHeight;
            }
        }

        function setLeftWidth(newWidth, newX, fromLeft) {
            dimensions.leftWidth = newWidth;

            if (fromLeft) {
                dimensions.outerWidth = newWidth + dimensions.innerWidth + dimensions.rightWidth;
                position.outerX = newX;
            } else {
                dimensions.innerWidth = dimensions.outerWidth - newWidth - dimensions.rightWidth;
                position.innerX = position.outerX + newWidth;
            }
        }


        /**
         * ======================================
         * Mask parts and other elements creation
         * ======================================
         */

        function createCompoundMask() {

            // North
            createPart('n',{
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
                    applyTransformsToMasks();
                }
            });

            // North-east
            createPart('ne',{
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
                    applyTransformsToMasks();
                }
            });

            // East
            createPart('e',{
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
                    applyTransformsToMasks();
                }
            });

            // South east
            createPart('se',{
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
                    applyTransformsToMasks();
                }
            });

            // South
            createPart('s',{
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
                    applyTransformsToMasks();
                }
            });

            // South-west
            createPart('sw',{
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
                    applyTransformsToMasks();
                }
            });

            // West
            createPart('w',{
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
                    applyTransformsToMasks();
                }
            });

            // North-west
            createPart('nw', {
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
                    applyTransformsToMasks();
                }
            });
        }

        // jsdoc me !! or replace me ?
        function createPart(id, partConfig) {
            allParts[id] = {
                mask: createMask(_.assign({}, constrains, partConfig)),
                overlay: createOverlay(partConfig)
            };
        }


        function createVisualGuides() {
            visualGuides.$maskBg = $('<div>', {
                'class': 'mask-bg'
            });
            visualGuides.$innerWindow = $('<div>', {
                'class': 'inner-window'
            });
        }


        /**
         * =========================
         * The compoundMask instance
         * =========================
         */

        dimensions  = _.defaults(dimensions || {}, defaultDimensions);
        position    = _.defaults(position   || {}, defaultPosition);
        constrains  = _.defaults(constrains || {}, defaultConstrains);

        compoundMask = {
            init: function init() {
                this.setTransforms(dimensions, position, constrains);

                createCompoundMask();
                createVisualGuides();
                createInnerDragHandle();
                return this;
            },

            render: function render($container) {
                invokeOnAll('render', [$container]);
                innerDrag.handle.render($container);
                applyTransforms();
                return this;
            },

            destroy: function destroy() {
                invokeOnAll('destroy');
                visualGuides = null;
                return this;
            },

            show: function show() {
                invokeOnAll('show');
                innerDrag.handle.show();
                this.setState('hidden', false);
                return this;
            },

            hide: function hide() {
                invokeOnAll('hide');
                innerDrag.handle.hide();
                this.setState('hidden', true);
                return this;
            },

            // set the transform model
            setTransforms: function setTransforms(dim, pos, cons) {
                dimensions  = _.defaults(dim || {}, dimensions);
                position    = _.defaults(pos || {}, position);
                constrains  = _.defaults(cons || {}, constrains);

                // automatically complete the dimensions
                dimensions.topHeight    = pos.innerY - pos.outerY;
                dimensions.rightWidth   = dim.outerWidth - (pos.innerX - pos.outerX) - dim.innerWidth;
                dimensions.bottomHeight = dim.outerHeight - (pos.innerY - pos.outerY) - dim.innerHeight;
                dimensions.leftWidth    = pos.innerX - pos.outerX;

                correctTransforms();
                applyTransforms();
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