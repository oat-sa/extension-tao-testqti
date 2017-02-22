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
 * Helper to manages z-indexes within the same stacking context.
 * It can be use to ensure a given element will be rendered on top of the others
 *
 * @author Christophe Noël <christophe@taotesting.com>
 */
define([], function() {
    'use strict';

    function stackerFactory() {
        var stacker,
            zIndex = 1000,
            max = 0;

        function isHighest($element) {
            return ($element.css('zIndex') >= zIndex);
        }

        function getNext() {
            return ++zIndex;
        }

        stacker = {
            bringToFront: function bringToFront($element) {
                if (! isHighest($element)) {
                    zIndex = getNext();
                    console.log('putting on top with zIndex = ' + zIndex);
                    $element.css('z-index', zIndex);
                }
            },

            autoBringToFront: function autoBringToFront($element) {
                var self = this;

                $element.on('mousedown.stacker', function() {
                    self.bringToFront($element);
                });
            }
        };

        return stacker;
    }

    return stackerFactory();
});