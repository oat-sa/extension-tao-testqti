define(['jquery', 'lodash', 'core/statifier', 'core/eventifier', 'ui/component', 'ui/component/placeable', 'ui/component/draggable', 'ui/component/resizable', 'ui/component/stackable'], function ($, _, statifier, eventifier, componentFactory, makePlaceable, makeDraggable, makeResizable, makeStackable) { 'use strict';

  $ = $ && Object.prototype.hasOwnProperty.call($, 'default') ? $['default'] : $;
  _ = _ && Object.prototype.hasOwnProperty.call(_, 'default') ? _['default'] : _;
  statifier = statifier && Object.prototype.hasOwnProperty.call(statifier, 'default') ? statifier['default'] : statifier;
  eventifier = eventifier && Object.prototype.hasOwnProperty.call(eventifier, 'default') ? eventifier['default'] : eventifier;
  componentFactory = componentFactory && Object.prototype.hasOwnProperty.call(componentFactory, 'default') ? componentFactory['default'] : componentFactory;
  makePlaceable = makePlaceable && Object.prototype.hasOwnProperty.call(makePlaceable, 'default') ? makePlaceable['default'] : makePlaceable;
  makeDraggable = makeDraggable && Object.prototype.hasOwnProperty.call(makeDraggable, 'default') ? makeDraggable['default'] : makeDraggable;
  makeResizable = makeResizable && Object.prototype.hasOwnProperty.call(makeResizable, 'default') ? makeResizable['default'] : makeResizable;
  makeStackable = makeStackable && Object.prototype.hasOwnProperty.call(makeStackable, 'default') ? makeStackable['default'] : makeStackable;

  function _toConsumableArray(arr) {
    return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread();
  }

  function _arrayWithoutHoles(arr) {
    if (Array.isArray(arr)) return _arrayLikeToArray(arr);
  }

  function _iterableToArray(iter) {
    if (typeof Symbol !== "undefined" && iter[Symbol.iterator] != null || iter["@@iterator"] != null) return Array.from(iter);
  }

  function _unsupportedIterableToArray(o, minLen) {
    if (!o) return;
    if (typeof o === "string") return _arrayLikeToArray(o, minLen);
    var n = Object.prototype.toString.call(o).slice(8, -1);
    if (n === "Object" && o.constructor) n = o.constructor.name;
    if (n === "Map" || n === "Set") return Array.from(o);
    if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen);
  }

  function _arrayLikeToArray(arr, len) {
    if (len == null || len > arr.length) len = arr.length;

    for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i];

    return arr2;
  }

  function _nonIterableSpread() {
    throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
  }

  var defaultDimensions = {
    outerWidth: 600,
    outerHeight: 400,
    innerWidth: 500,
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

  function compoundMaskFactory(options, dimensions, position) {
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

          _.forOwn(this.config.edgesBorders, function (isResizable, edgeId) {
            if (isResizable) {
              $element.addClass("border-".concat(edgeId));
            }
          });
        },
        addResizeControll: function addResizeControll() {
          var $element = this.getElement();
          var $resizeControll = $('<div>', {
            class: 'resize-control'
          });
          $element.append($resizeControll);
        }
      };
      mask = componentFactory(maskAPI, maskConfig);
      makeResizable(mask);
      makeStackable(mask, stackingOptions);
      return mask.on('render', function () {
        var $element = this.getElement();
        this.styleResizableEdges();

        if (this.config.resizeControll) {
          this.addResizeControll();
        }

        $element.addClass("line-reader-mask ".concat(maskConfig.id)).on('mousedown touchstart', function () {
          bringAllToFront();
        }); // uncomment this to see what's going on with masks:
        // $element.css({ border: '1px solid olive'});
      }).on('resizestart', function () {
        innerDrag.hide();
        closer.hide();
        invokeOnOverlays('hide');
        invokeOnMasks('setState', ['resizing', true]);
        this.setState('resizer', true);
      }).on('beforeresize', maskConfig.beforeResize || _.noop).on('resize', maskConfig.onResize || _.noop).on('resizeend', function () {
        applyTransformsToOverlays();
        applyTransformsToInnerDrag();
        applyTransformsToCloser();
        invokeOnMasks('setState', ['resizing', false]);
        invokeOnOverlays('show');
        innerDrag.show();
        closer.show();
        this.setState('resizer', false);
      }).init();
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
          this.setSize(dimensions.outerWidth, dimensions.outerHeight).moveTo(position.outerX, position.outerY);
          $element.addClass('moving');
          this.setState('transformed', true);
        },
        restoreOverlay: function restoreOverlay() {
          var $element = this.getElement();

          if (this.is('transformed')) {
            this.setSize(this._sizeBackup.width, this._sizeBackup.height).moveTo(this._posBackup.x, this._posBackup.y);
            $element.removeClass('moving');
            this._sizeBackup = null;
            this._posBackup = null;
            this.setState('transformed', false);
          }
        },
        appendVisualGuides: function appendVisualGuides() {
          var $element = this.getElement(),
              borderWidth = 1,
              // this mirror the $lrBorderWidth css variable
          borderOffset = borderWidth * 2;
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
      overlay = componentFactory(overlayAPI, overlayConfig);
      makeDraggable(overlay);
      makeStackable(overlay, stackingOptions);
      return overlay.on('render', function () {
        var self = this,
            $element = this.getElement(),
            // captures touch and mouse
        // also fixes issue with IE not capturing 'mousedown' etc
        pointerEventsPrefix = window.PointerEvent ? 'pointer' : 'mouse',
            $moveIcon = $('<div>', {
          class: 'icon icon-mobile-menu'
        });
        $element.addClass("line-reader-overlay ".concat(overlayConfig.id)).on("".concat(pointerEventsPrefix, "down") + " touchstart", function () {
          bringAllToFront();
          self.transformOverlay();
        }).on("".concat(pointerEventsPrefix, "up") + " touchend", function () {
          self.restoreOverlay();
        }).prepend($moveIcon);
      }).on('dragstart', function () {
        innerDrag.hide();
        closer.hide();
        invokeOnMasks('hide');
        this.appendVisualGuides();
      }).on('dragmove', function moveAllPartsTogether(xOffsetRelative, yOffsetRelative) {
        // update the transform model
        position.outerX += xOffsetRelative;
        position.outerY += yOffsetRelative;
        position.innerX += xOffsetRelative;
        position.innerY += yOffsetRelative;
      }).on('dragend', function () {
        this.removeVisualGuides(); // although they are already display, calling show() again on the overlays
        // will force their z-Index at the top of the stack

        invokeOnAll('show');
        innerDrag.show();
        closer.show(); // apply the new transform model

        applyTransforms();
      }).init();
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
            y: fixedXY.top + (constrains.minTopHeight + dimensions.innerHeight + options.resizeHandleSize),
            width: dimensions.outerWidth - constrains.minWidth * 2,
            height: dimensions.outerHeight - (dimensions.innerHeight + constrains.minTopHeight + constrains.minBottomHeight - options.innerDragHeight)
          }; // uncomment to see what's going on:
          // allParts.ne.mask.getContainer().append($boundingBox);
          // $boundingBox.css({ width: rect.width, height: rect.height, top: rect.y, left: rect.x });

          return rect;
        }
      }).on('render', function () {
        var $element = this.getElement(),
            $dragIcon = $('<div>', {
          class: 'icon icon-move'
        });
        $element.css('touch-action', 'none');
        $element.addClass('line-reader-inner-drag');
        $element.css({
          background: 'none'
        });
        $element.append($dragIcon);
      }).on('dragstart', function () {
        closer.hide();
        bringAllToFront();
        invokeOnMasks('setState', ['resizing', true]);
      }).on('dragmove', function (xOffsetRelative, yOffsetRelative) {
        position.innerX += xOffsetRelative;
        position.innerY += yOffsetRelative;
        dimensions.leftWidth += xOffsetRelative;
        dimensions.topHeight += yOffsetRelative;
        dimensions.rightWidth -= xOffsetRelative;
        dimensions.bottomHeight -= yOffsetRelative;
        applyTransformsToMasks();
      }).on('dragend', function () {
        innerDrag.bringToFront();
        closer.show();
        invokeOnMasks('setState', ['resizing', false]);
        applyTransformsToOverlays();
      }).init();
    }
    /**
     * Close button for the compound mask
     */


    function createCloser() {
      closer = componentFactory();
      makeStackable(closer, stackingOptions);
      makePlaceable(closer).on('render', function () {
        var self = this,
            $element = this.getElement(),
            $closeIcon = $('<div>', {
          class: 'icon icon-result-nok'
        });
        $element.append($closeIcon);
        $element.addClass('line-reader-closer');
        $element.on('mousedown touchstart', function () {
          bringAllToFront();
        });
        $element.on('click', function (e) {
          e.stopPropagation();
          self.trigger('click');
        });
      }).init();
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
      _.forOwn(allParts, function (part) {
        if (_.isObject(part[target]) && _.isFunction(part[target][fn])) {
          var _part$target;

          (_part$target = part[target])[fn].apply(_part$target, _toConsumableArray(args || []));
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
      _.forOwn(allParts, function (part) {
        if (part.overlay) {
          part.mask.placeOverlay(part.overlay);
        }
      });
    }

    function applyTransformsToInnerDrag() {
      if (innerDrag) {
        innerDrag.setSize(dimensions.innerWidth - 20, options.innerDragHeight).moveTo(position.innerX + 10, position.innerY + dimensions.innerHeight + options.resizeHandleSize);
      }
    }

    function applyTransformsToCloser() {
      if (closer) {
        closer.setSize(constrains.minWidth - options.resizeHandleSize, constrains.minHeight - options.resizeHandleSize).moveTo(position.outerX + dimensions.outerWidth - constrains.minWidth - 5, // manual adjustment so it looks better
        position.outerY + options.resizeHandleSize - 4);
      }
    }
    /**
     * Check that the given transform model respect the current constrains.
     * If not, correct them
     */


    function correctTransforms() {
      if (dimensions.topHeight < constrains.minTopHeight) {
        dimensions.topHeight = constrains.minTopHeight;
        position.innerY = position.outerY + constrains.minTopHeight;
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
     * Update the transform model during a resize affecting inner height
     * @param {Number} newHeight
     */


    var setInnerHeight = function setInnerHeight(newHeight) {
      dimensions.innerHeight = newHeight;
      dimensions.bottomHeight = dimensions.outerHeight - dimensions.innerHeight - dimensions.topHeight;
    };
    /**
     * ======================================
     * Mask parts and other elements creation
     * ======================================
     */


    function createCompoundMask() {
      // North
      createPart({
        id: 'n',
        edges: {
          top: false,
          right: false,
          bottom: false,
          left: false
        },
        edgesBorders: {
          top: true,
          right: false,
          bottom: true,
          left: false
        },
        addOverlay: true,
        minHeight: constrains.minTopHeight,
        // move and dimension the mask
        place: function place() {
          this.moveTo(position.innerX, position.outerY).setSize(dimensions.innerWidth, dimensions.topHeight);
        },
        // move and dimension the overlay
        placeOverlay: function placeOverlay(overlay) {
          var pos = this.getPosition(),
              size = this.getSize();
          overlay.moveTo(position.outerX, pos.y).setSize(dimensions.outerWidth, size.height);
        },
        // set a resize limit whenever resize happens on an inner edge (here, the top inner edge, eg. the bottom of the mask),
        // so the min/max width/height limit for "inner component" is respected
        beforeResize: function beforeResize(width, height, fromLeft, fromTop) {
          this.config.maxHeight = fromTop ? null : dimensions.topHeight + (dimensions.innerHeight - constrains.minHeight);
        },
        // set the new transform values (dimension and position) resulting from the current mask resize, and apply them
        onResize: function onResize(width, height, fromLeft, fromTop, x, y) {
          setTopHeight(height, y, fromTop);
          applyTransformsToMasks();
        }
      }); // North-east

      createPart({
        id: 'ne',
        edges: {
          top: false,
          right: false,
          bottom: false,
          left: false
        },
        edgesBorders: {
          top: true,
          right: true,
          bottom: false,
          left: false
        },
        minHeight: constrains.minTopHeight,
        place: function place() {
          this.moveTo(position.innerX + dimensions.innerWidth, position.outerY).setSize(dimensions.rightWidth, dimensions.topHeight);
        },
        placeOverlay: function placeOverlay(overlay) {
          var pos = this.getPosition(),
              size = this.getSize();
          overlay.moveTo(pos.x, pos.y + options.resizeHandleSize).setSize(size.width - options.resizeHandleSize, size.height - options.resizeHandleSize * 2);
        },
        onResize: function onResize(width, height, fromLeft, fromTop, x, y) {
          setTopHeight(height, y, fromTop);
          setRightWidth(width, x, fromLeft);
          applyTransformsToMasks();
        }
      }); // South east

      createPart({
        id: 'se',
        edges: {
          top: false,
          right: '.resize-control',
          bottom: '.resize-control',
          left: false
        },
        edgesBorders: {
          top: false,
          right: true,
          bottom: true,
          left: false
        },
        minHeight: constrains.minBottomHeight,
        resizeControll: true,
        place: function place() {
          this.moveTo(position.innerX + dimensions.innerWidth, position.innerY + dimensions.innerHeight).setSize(dimensions.rightWidth, dimensions.bottomHeight);
        },
        placeOverlay: function placeOverlay(overlay) {
          var pos = this.getPosition(),
              size = this.getSize();
          overlay.moveTo(pos.x, pos.y + options.resizeHandleSize).setSize(size.width - options.resizeHandleSize, size.height - options.resizeHandleSize * 2);
        },
        onResize: function onResize(width, height, fromLeft, fromTop, x, y) {
          setRightWidth(width, x, fromLeft);
          setBottomHeight(height, y, fromTop);
          applyTransformsToMasks();
        }
      }); // South

      createPart({
        id: 's',
        edges: {
          top: false,
          right: false,
          bottom: false,
          left: false
        },
        edgesBorders: {
          top: true,
          right: false,
          bottom: true,
          left: false
        },
        minHeight: constrains.minBottomHeight,
        place: function place() {
          this.moveTo(position.innerX, position.innerY + dimensions.innerHeight).setSize(dimensions.innerWidth, dimensions.bottomHeight);
        },
        placeOverlay: function placeOverlay(overlay) {
          var pos = this.getPosition(),
              size = this.getSize();
          overlay.moveTo(pos.x, pos.y + options.resizeHandleSize).setSize(size.width, size.height - options.resizeHandleSize * 2);
        },
        beforeResize: function beforeResize(width, height, fromLeft, fromTop) {
          this.config.maxHeight = fromTop ? dimensions.bottomHeight + (dimensions.innerHeight - constrains.minHeight) : null;
        },
        onResize: function onResize(width, height, fromLeft, fromTop, x, y) {
          setBottomHeight(height, y, fromTop);
          applyTransformsToMasks();
        }
      }); // East

      createPart({
        id: 'e',
        edges: {
          top: false,
          right: false,
          bottom: '.resize-control',
          left: '.resize-control'
        },
        edgesBorders: {
          top: false,
          right: true,
          bottom: false,
          left: true
        },
        resizeControll: true,
        place: function place() {
          this.moveTo(position.innerX + dimensions.innerWidth, position.innerY).setSize(dimensions.rightWidth, dimensions.innerHeight);
        },
        placeOverlay: function placeOverlay(overlay) {
          var pos = this.getPosition(),
              size = this.getSize();
          overlay.moveTo(pos.x + options.resizeHandleSize, pos.y - options.resizeHandleSize).setSize(size.width - options.resizeHandleSize * 2, size.height + options.resizeHandleSize * 2);
        },
        beforeResize: function beforeResize(width, height, fromLeft) {
          this.config.maxWidth = dimensions.rightWidth + (dimensions.innerWidth - constrains.minWidth);
          this.config.minWidth = constrains.minWidth;
          this.config.maxHeight = dimensions.outerHeight - dimensions.topHeight - constrains.minBottomHeight;
        },
        onResize: function onResize(width, height, fromLeft, fromTop, x) {
          setRightWidth(width, x, fromLeft);
          setInnerHeight(height);
          applyTransformsToMasks();
        }
      }); // South-west

      createPart({
        id: 'sw',
        edges: {
          top: false,
          right: false,
          bottom: false,
          left: false
        },
        edgesBorders: {
          top: false,
          right: false,
          bottom: true,
          left: true
        },
        minHeight: constrains.minBottomHeight,
        place: function place() {
          this.moveTo(position.outerX, position.innerY + dimensions.innerHeight).setSize(dimensions.leftWidth, dimensions.bottomHeight);
        },
        placeOverlay: function placeOverlay(overlay) {
          var pos = this.getPosition(),
              size = this.getSize();
          overlay.moveTo(pos.x + options.resizeHandleSize, pos.y + options.resizeHandleSize).setSize(size.width - options.resizeHandleSize, size.height - options.resizeHandleSize * 2);
        },
        onResize: function onResize(width, height, fromLeft, fromTop, x, y) {
          setBottomHeight(height, y, fromTop);
          setLeftWidth(width, x, fromLeft);
          applyTransformsToMasks();
        }
      }); // West

      createPart({
        id: 'w',
        edges: {
          top: false,
          right: false,
          bottom: false,
          left: false
        },
        edgesBorders: {
          top: false,
          right: true,
          bottom: false,
          left: true
        },
        place: function place() {
          this.moveTo(position.outerX, position.innerY).setSize(dimensions.leftWidth, dimensions.innerHeight);
        },
        placeOverlay: function placeOverlay(overlay) {
          var pos = this.getPosition(),
              size = this.getSize();
          overlay.moveTo(pos.x + options.resizeHandleSize, pos.y - options.resizeHandleSize).setSize(size.width - options.resizeHandleSize * 2, size.height + options.resizeHandleSize * 2);
        },
        beforeResize: function beforeResize(width, height, fromLeft) {
          this.config.maxWidth = fromLeft ? null : dimensions.leftWidth + (dimensions.innerWidth - constrains.minWidth);
        },
        onResize: function onResize(width, height, fromLeft, fromTop, x) {
          setLeftWidth(width, x, fromLeft);
          applyTransformsToMasks();
        }
      }); // North-west

      createPart({
        id: 'nw',
        edges: {
          top: false,
          right: false,
          bottom: false,
          left: false
        },
        edgesBorders: {
          top: true,
          right: false,
          bottom: false,
          left: true
        },
        minHeight: constrains.minTopHeight,
        place: function place() {
          this.moveTo(position.outerX, position.outerY).setSize(dimensions.leftWidth, dimensions.topHeight);
        },
        placeOverlay: function placeOverlay(overlay) {
          var pos = this.getPosition(),
              size = this.getSize();
          overlay.moveTo(pos.x + options.resizeHandleSize, pos.y + options.resizeHandleSize).setSize(size.width - options.resizeHandleSize, size.height - options.resizeHandleSize * 2);
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
        overlay: partConfig.addOverlay ? createOverlay(partConfig) : null
      };
    }

    function createVisualGuides() {
      visualGuides.$maskBg = $('<div>', {
        class: 'mask-bg'
      });
      visualGuides.$innerWindow = $('<div>', {
        class: 'inner-window'
      });
    }
    /**
     * =========================
     * The compoundMask instance
     * =========================
     */


    dimensions = _.defaults(dimensions || {}, defaultDimensions);
    position = _.defaults(position || {}, defaultPosition);
    options = _.defaults(options || {}, defaultOptions);
    constrains = {
      minWidth: options.resizeHandleSize * 2 + options.dragMinWidth,
      minHeight: options.resizeHandleSize * 2 + options.dragMinHeight,
      minBottomHeight: options.resizeHandleSize * 2 + options.innerDragHeight,
      minTopHeight: options.resizeHandleSize * 2 + 18 // make sure that top will fit header size

    };
    compoundMask = {
      init: function init() {
        var self = this;
        this.setTransforms(dimensions, position);
        createCompoundMask();
        createVisualGuides();
        createInnerDragHandle();
        createCloser();
        closer.on('click', function () {
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
        dimensions = _.defaults(dim || {}, dimensions);
        position = _.defaults(pos || {}, position); // automatically complete the dimensions

        dimensions.topHeight = pos.innerY - pos.outerY;
        dimensions.rightWidth = dim.outerWidth - (pos.innerX - pos.outerX) - dim.innerWidth;
        dimensions.bottomHeight = dim.outerHeight - (pos.innerY - pos.outerY) - dim.innerHeight;
        dimensions.leftWidth = pos.innerX - pos.outerX;
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
  }

  return compoundMaskFactory;

});
