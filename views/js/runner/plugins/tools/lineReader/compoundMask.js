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
    'core/eventifier',
    'core/statifier',
    'ui/component',
    'ui/component/draggable',
    'ui/component/resizable',
    'tpl!taoQtiTest/runner/plugins/tools/lineReader/tpl/maskPart'
], function(
    $,
    _,
    eventifier,
    statifier,
    componentFactory,
    makeDraggable,
    makeResizable,
    maskPartTpl
) {
    'use strict';

    var defaultConfig = {
        outterWidth:    500,
        outterHeight:   300,
        innerWidth:     400,
        innerHeight:    50,
        initialX:       100,
        initialY:       100
    };

    function createPart(allParts, id, config) {
        var part = componentFactory({}, config);

        makeDraggable(part);

        part
            .on('render', function() {
                var $element = this.getElement();

                if (_.isArray(this.config.borders)) {
                    this.config.borders.forEach(function(borderPosition) {
                        $element.css('border-' + borderPosition, '1px solid black'); // todo: improve this. consider box model to take border width into account in dimensions
                    });
                }
            })
            .on('dragmove', function moveAllPartsTogether(xOffset, yOffset) {
                _.forOwn(allParts, function(current, currentId) {
                    if (currentId !== id) {
                        current.moveBy(xOffset, yOffset);
                    }
                });
            })
            .init()
            .setTemplate(maskPartTpl);

        allParts[id] = part;
    }

    return function compoundMaskFactory(config) {
        var compoundMask,
            maskParts = {},
            dimensions;

        config = _.defaults(config || {}, defaultConfig);

        compoundMask = {
            init: function init() {
                dimensions = {
                    outterWidth:    config.outterWidth,
                    outterHeight:   config.outterHeight,
                    innerWidth:     config.innerWidth,
                    innerHeight:    config.innerHeight
                };
                dimensions.topHeight    =
                dimensions.bottomHeight = (dimensions.outterHeight - dimensions.innerHeight) / 2;
                dimensions.rightWidth   =
                dimensions.leftWidth    = (dimensions.outterWidth - dimensions.innerWidth) / 2;

                createPart(maskParts, 'n', {
                    width: dimensions.innerWidth,
                    height: dimensions.topHeight,
                    initialX: config.initialX + dimensions.leftWidth,
                    initialY: config.initialY,
                    borders: ['top', 'bottom']
                });
                createPart(maskParts, 'ne', {
                    width: dimensions.rightWidth,
                    height: dimensions.topHeight,
                    initialX: config.initialX + dimensions.leftWidth + dimensions.innerWidth,
                    initialY: config.initialY,
                    borders: ['top', 'right']
                });
                createPart(maskParts, 'e', {
                    width: dimensions.rightWidth,
                    height: dimensions.innerHeight,
                    initialX: config.initialX + dimensions.leftWidth + dimensions.innerWidth,
                    initialY: config.initialY + dimensions.topHeight,
                    borders: ['left', 'right']
                });
                createPart(maskParts, 'se', {
                    width: dimensions.rightWidth,
                    height: dimensions.bottomHeight,
                    initialX: config.initialX + dimensions.leftWidth + dimensions.innerWidth,
                    initialY: config.initialY + dimensions.topHeight + dimensions.innerHeight,
                    borders: ['bottom', 'right']
                });
                createPart(maskParts, 's', {
                    width: dimensions.innerWidth,
                    height: dimensions.bottomHeight,
                    initialX: config.initialX + dimensions.leftWidth,
                    initialY: config.initialY + dimensions.topHeight + dimensions.innerHeight,
                    borders: ['top', 'bottom']
                });
                createPart(maskParts, 'sw', {
                    width: dimensions.leftWidth,
                    height: dimensions.bottomHeight,
                    initialX: config.initialX,
                    initialY: config.initialY + dimensions.topHeight + dimensions.innerHeight,
                    borders: ['left', 'bottom']
                });
                createPart(maskParts, 'w', {
                    width: dimensions.leftWidth,
                    height: dimensions.innerHeight,
                    initialX: config.initialX,
                    initialY: config.initialY + dimensions.topHeight,
                    borders: ['left', 'right']
                });
                createPart(maskParts, 'nw', {
                    width: dimensions.leftWidth,
                    height: dimensions.topHeight,
                    initialX: config.initialX,
                    initialY: config.initialY,
                    borders: ['left', 'top']
                });
            },

            render: function render($container) {
                _.forOwn(maskParts, function(part) {
                    part.render($container);
                });
            },

            destroy: function destroy() {
                _.forOwn(maskParts, function(part) {
                    part.destroy();
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