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
 * Most mask transformations (resize, drag) are achieved by updating a very simple transform model (position, dimensions)
 * which is latter applied to the actual individual components at a proper time
 *
 * @author Christophe Noël <christophe@taotesting.com>
 */
define([
    'jquery',
    'lodash',
    'core/statifier',
    'core/eventifier',
    'ui/component',
    'ui/component/placeable',
    'ui/component/draggable',
    'ui/component/resizable',
    'ui/component/stackable'
], function(
    $,
    _,
    statifier,
    eventifier,
    componentFactory,
    makePlaceable,
    makeDraggable,
    makeResizable,
    makeStackable
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
    var defaultOptions = {
        dragMinWidth: 10,
        dragMinHeight: 10,
        resizeHandleSize: 10,
        innerDragHeight: 20
    };
    var stackingOptions = {
        stackingScope: 'test-runner'
    };
    var constrains;

    /**
     * @param {Object} options
     * @param {Number} options.resizeHandleSize - size of the resize handlers on each resizable edge
     * @param {Number} options.dragMinWidth - minimal width for the draggable area of each component.
     * @param {Number} options.dragMinHeight - minimal height for the draggable area of each component.
     * @param {Number} options.innerDragHeight - height of the inner window drag handle
     * @param {Object} dimensions
     * @param {Number} dimensions.outerWidth - overall mask width
     * @param {Number} dimensions.outerHeight - overall mask height
     * @param {Number} dimensions.innerWidth - inner window width
     * @param {Number} dimensions.innerHeight - inner window height
     * @param {Number} position
     * @param {Number} position.outerX - overall mask x
     * @param {Number} position.outerY - overall mask y
     * @param {Number} position.innerX - inner window mask x
     * @param {Number} position.innerY - inner window mask y
     */
    return function compoundMaskFactory(options, dimensions, position) {
        var compoundMask,
            allParts = {},
            innerDrag,
            closer,
            visualGuides = {};

        /**
         * ============================================
         * Definition of Mask & Overlay component types
         * ============================================
         */

        /**
         * Create a mask component. They are used for masking (obviously) but also resizing the compound mask
         * @param {Object} maskConfig
         * @param {String} maskConfig.id
         * @param {Function} maskConfig.place - size and position the mask according to the transform model
         * @param {Function} maskConfig.placeOverlay - size and position the overlay according to the transform model
         * @param {Function} maskConfig.beforeResize - used to set the resize limit depending on which edge the resizing occurs
         * @param {Function} maskConfig.onResize - how the resize affect the transform model
         * @param {Object} maskConfig.edges - Interact configuration to specify which edges can be used for resizing
         * @param {Number} maskConfig.minWidth
         * @param {Number} maskConfig.minHeight
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
                        .addClass('line-reader-mask ' + maskConfig.id)
                        .on('mousedown', function() {
                            bringAllToFront();
                        });

                    // uncomment this to see what's going on with masks:
                    // $element.css({ border: '1px solid olive'});
                })
                .on('resizestart', function () {
                    innerDrag.hide();
                    closer.hide();
                    invokeOnOverlays('hide');
                    invokeOnMasks('setState', ['resizing', true]);
                })
                .on('beforeresize', maskConfig.beforeResize || _.noop)
                .on('resize', maskConfig.onResize || _.noop)
                .on('resizeend', function () {
                    applyTransformsToOverlays();
                    applyTransformsToInnerDrag();
                    applyTransformsToCloser();

                    invokeOnMasks('setState', ['resizing', false]);
                    invokeOnOverlays('show');
                    innerDrag.show();
                    closer.show();
                })
                .init();
        }


        /**
         * Create a overlay component. Overlay are invisible and are used for dragging.
         * When clicked, the whole mask is hidden and only the overlay is displayed, after being resized to fit the whole mask surface
         * this allows for performance improvement as well as giving the dragged element proper dragging boundaries.
         * Also, visual guides are added, like a fake inner window, during the drag
         * @param {Object} overlayConfig
         * @param {String} overlayConfig.id
         */
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
                            borderWidth = 1, // this mirror the $lrBorderWidth css variable
                            borderOffset = borderWidth * 2;

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
                        $element = this.getElement(),
                        // captures touch and mouse
                        // also fixes issue with IE not capturing 'mousedown' etc
                        pointerEventsPrefix = window.PointerEvent ? 'pointer' : 'mouse';


                    $element
                        .addClass('line-reader-overlay ' + overlayConfig.id)
                        .on(pointerEventsPrefix + 'down', function() {
                            bringAllToFront();
                            self.transformOverlay();
                        })
                        .on(pointerEventsPrefix + 'up', function() {
                            self.restoreOverlay();
                        });

                    // uncomment this to see what's going on with overlays:
                    // $element.css({ opacity: 0.5, 'background-color': 'yellow', border: '1px solid brown '});
                })
                .on('dragstart', function() {
                    innerDrag.hide();
                    closer.hide();
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
                    innerDrag.show();
                    closer.show();

                    // apply the new transform model
                    applyTransforms();
                })
                .init();
        }


        /**
         * ==========================
         * Inner Drag Handle & Closer
         * ==========================
         */

        /**
         * This handle allows to drag the inner window
         */
        function createInnerDragHandle() {
            // uncomment this (and a few lines below) if debugging is needed:
            // var $boundingBox = $('<div>').css({ position: 'fixed', 'box-sizing': 'border-box', border: '1px solid red' });

            innerDrag = componentFactory();

            makeStackable(innerDrag, stackingOptions);
            makeDraggable(innerDrag, {
                dragRestriction: function dragRestriction() {
                    var fixedXY = allParts.nw.mask.getElement().offset(),
                        rect;

                    rect = {
                        x: fixedXY.left + constrains.minWidth,
                        y: fixedXY.top + (constrains.minHeight + dimensions.innerHeight + options.resizeHandleSize),
                        width: dimensions.outerWidth - (constrains.minWidth * 2 ),
                        height: dimensions.outerHeight -
                            (dimensions.innerHeight + constrains.minHeight + constrains.minBottomHeight - options.innerDragHeight)
                    };

                    // uncomment to see what's going on:
                    // allParts.ne.mask.getContainer().append($boundingBox);
                    // $boundingBox.css({ width: rect.width, height: rect.height, top: rect.y, left: rect.x });

                    return rect;
                }
            })
                .on('render', function() {
                    var $element = this.getElement(),
                        $dragIcon = $('<div>', {
                            'class': 'icon icon-move'
                        });

                    $element.addClass('line-reader-inner-drag');
                    $element.append($dragIcon);
                    $element.on('mousedown', function(e) {
                        e.stopPropagation();
                        bringAllToFront();
                    });
                })
                .on('dragstart', function() {
                    closer.hide();
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
                    innerDrag.bringToFront();
                    closer.show();
                    invokeOnMasks('setState', ['resizing', false]);

                    applyTransformsToOverlays();
                })
                .init();
        }

        /**
         * Close button for the compound mask
         */
        function createCloser() {
            closer = componentFactory();

            makeStackable(closer, stackingOptions);
            makePlaceable(closer)
                .on('render', function() {
                    var self = this,
                        $element = this.getElement(),
                        $closeIcon = $('<div>', {
                            'class': 'icon icon-result-nok'
                        });

                    $element.append($closeIcon);
                    $element.addClass('line-reader-closer');

                    $element.on('mousedown', function() {
                        bringAllToFront();
                    });

                    $element.on('click', function(e) {
                        e.stopPropagation();
                        self.trigger('click');
                    });
                })
                .init();
        }

        /**
         * =================
         * Utility functions
         * =================
         */
        function bringAllToFront() {
            invokeOnAll('bringToFront');
            innerDrag.bringToFront();
            closer.bringToFront();
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

        /**
         * Invoke a method on all compound mask parts, whether mask or overlays
         * @param {String} target - mask | overlay
         * @param {String} fn - the name of the method to invoke
         * @param {*[]} args - arguments passed on invoke
         */
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
            applyTransformsToCloser();
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
            if (innerDrag) {
                innerDrag
                    .setSize(dimensions.innerWidth, options.innerDragHeight)
                    .moveTo(
                        position.innerX,
                        position.innerY + dimensions.innerHeight + options.resizeHandleSize
                    );
            }
        }

        function applyTransformsToCloser() {
            if (closer) {
                closer
                    .setSize(
                        constrains.minWidth - options.resizeHandleSize,
                        constrains.minHeight - options.resizeHandleSize
                    )
                    .moveTo(
                        position.outerX + dimensions.outerWidth - constrains.minWidth + 3, // manual adjustment so it looks better
                        position.outerY + options.resizeHandleSize
                    );
            }
        }

        /**
         * Check that the given transform model respect the current constrains.
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
            if (dimensions.bottomHeight < constrains.minBottomHeight) {
                dimensions.bottomHeight = constrains.minBottomHeight;
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

        /**
         * Update the transform model during a resize affecting the top height
         * @param {Number} newHeight
         * @param {Number} newY
         * @param {Boolean} fromTop - if the resize occurs from the top
         */
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

        /**
         * Update the transform model during a resize affecting the right width
         * @param {Number} newWidth
         * @param {Number} newX
         * @param {Boolean} fromLeft - if the resize occurs from the left
         */
        function setRightWidth(newWidth, newX, fromLeft) {
            dimensions.rightWidth = newWidth;

            if (fromLeft) {
                dimensions.innerWidth = newX - position.innerX;
            } else {
                dimensions.outerWidth = dimensions.leftWidth + dimensions.innerWidth + newWidth;
            }
        }

        /**
         * Update the transform model during a resize affecting the bottom height
         * @param {Number} newHeight
         * @param {Number} newY
         * @param {Boolean} fromTop - if the resize occurs from the top
         */
        function setBottomHeight(newHeight, newY, fromTop) {
            dimensions.bottomHeight = newHeight;

            if (fromTop) {
                dimensions.innerHeight = newY - position.innerY;
                dimensions.bottomHeight = newHeight;
            } else {
                dimensions.outerHeight = dimensions.topHeight + dimensions.innerHeight + newHeight;
            }
        }

        /**
         * Update the transform model during a resize affecting the left width
         * @param {Number} newWidth
         * @param {Number} newX
         * @param {Boolean} fromLeft - if the resize occurs from the left
         */
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
            createPart({
                id: 'n',
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
                        pos.y + options.resizeHandleSize
                    ).setSize(
                        size.width,
                        size.height - (options.resizeHandleSize * 2)
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
            createPart({
                id: 'ne',
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
                        pos.y + options.resizeHandleSize
                    ).setSize(
                        size.width - options.resizeHandleSize,
                        size.height - (options.resizeHandleSize * 2)
                    );
                },

                onResize: function onResize(width, height, fromLeft, fromTop, x, y) {
                    setTopHeight(height, y, fromTop);
                    setRightWidth(width, x, fromLeft);
                    applyTransformsToMasks();
                }
            });

            // East
            createPart({
                id: 'e',
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
                        pos.x + options.resizeHandleSize,
                        pos.y - options.resizeHandleSize
                    ).setSize(
                        size.width - (options.resizeHandleSize * 2),
                        size.height + (options.resizeHandleSize * 2)
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
            createPart({
                id: 'se',
                edges: { top: false, right: true, bottom: true, left: false },
                minHeight: constrains.minBottomHeight,

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
                        pos.y + options.resizeHandleSize
                    ).setSize(
                        size.width - options.resizeHandleSize,
                        size.height - (options.resizeHandleSize * 2)
                    );
                },

                onResize: function onResize(width, height, fromLeft, fromTop, x, y) {
                    setRightWidth(width, x, fromLeft);
                    setBottomHeight(height, y, fromTop);
                    applyTransformsToMasks();
                }
            });

            // South
            createPart({
                id: 's',
                edges: { top: true, right: false, bottom: true, left: false },
                minHeight: constrains.minBottomHeight,

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
                        pos.y + options.resizeHandleSize
                    ).setSize(
                        size.width,
                        size.height - (options.resizeHandleSize * 2)
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
            createPart({
                id: 'sw',
                edges: { top: false, right: false, bottom: true, left: true },
                minHeight: constrains.minBottomHeight,

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
                        pos.x + options.resizeHandleSize,
                        pos.y + options.resizeHandleSize
                    ).setSize(
                        size.width - options.resizeHandleSize,
                        size.height - (options.resizeHandleSize * 2)
                    );
                },

                onResize: function onResize(width, height, fromLeft, fromTop, x, y) {
                    setBottomHeight(height, y, fromTop);
                    setLeftWidth(width, x, fromLeft);
                    applyTransformsToMasks();
                }
            });

            // West
            createPart({
                id: 'w',
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
                        pos.x + options.resizeHandleSize,
                        pos.y - options.resizeHandleSize
                    ).setSize(
                        size.width - (options.resizeHandleSize * 2),
                        size.height + (options.resizeHandleSize * 2)
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
            createPart({
                id: 'nw',
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
                        pos.x + options.resizeHandleSize,
                        pos.y + options.resizeHandleSize
                    ).setSize(
                        size.width - options.resizeHandleSize,
                        size.height - (options.resizeHandleSize * 2)
                    );
                },

                onResize: function onResize(width, height, fromLeft, fromTop, x, y) {
                    setTopHeight(height, y, fromTop);
                    setLeftWidth(width, x, fromLeft);
                    applyTransformsToMasks();
                }
            });
        }

        function createPart(partConfig) {
            allParts[partConfig.id] = {
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
        options     = _.defaults(options    || {}, defaultOptions);

        constrains = {
            minWidth:           (options.resizeHandleSize * 2) + options.dragMinWidth,
            minHeight:          (options.resizeHandleSize * 2) + options.dragMinHeight,
            minBottomHeight:    (options.resizeHandleSize * 2) + options.innerDragHeight
        };

        compoundMask = {
            init: function init() {
                var self = this;

                this.setTransforms(dimensions, position);

                createCompoundMask();
                createVisualGuides();
                createInnerDragHandle();
                createCloser();

                closer.on('click', function() {
                    self.hide();
                    self.trigger('close');
                });

                return this;
            },

            render: function render($container) {
                invokeOnAll('render', [$container]);
                innerDrag.render($container);
                closer.render($container);
                applyTransforms();
                return this;
            },

            destroy: function destroy() {
                invokeOnAll('destroy');
                visualGuides = null;
                innerDrag = null;
                closer = null;
                return this;
            },

            show: function show() {
                invokeOnAll('show');
                innerDrag.show();
                closer.show();
                this.setState('hidden', false);
                return this;
            },

            hide: function hide() {
                invokeOnAll('hide');
                innerDrag.hide();
                closer.hide();
                this.setState('hidden', true);
                return this;
            },

            /**
             * Allow updating the transform model
             * @param {Object} dim
             * @param {Number} dim.outerWidth - overall mask width
             * @param {Number} dim.outerHeight - overall mask height
             * @param {Number} dim.innerWidth - inner window width
             * @param {Number} dim.innerHeight - inner window height
             * @param {Number} pos
             * @param {Number} pos.outerX - overall mask x
             * @param {Number} pos.outerY - overall mask y
             * @param {Number} pos.innerX - inner window x
             * @param {Number} pos.innerY - inner window y
             */
            setTransforms: function setTransforms(dim, pos) {
                dimensions  = _.defaults(dim || {}, dimensions);
                position    = _.defaults(pos || {}, position);

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

            getParts: function getParts() {
                return allParts;
            }
        };

        statifier(compoundMask);
        eventifier(compoundMask);

        return compoundMask;
    };
});