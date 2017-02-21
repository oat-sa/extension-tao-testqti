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
    'jquery'
], function($) {
    'use strict';

    function zIndexManagerFactory() {
        var zIndexManager,
            zIndex = 1000;

        zIndexManager = {
            getNext: function getNext() {
                zIndex++;
                return zIndex;
            },

            putOnTop: function putOnTop($element) {
                //todo: find a way to manage this properly
                var $bottomBar = $('.bottom-action-bar');
                $bottomBar.css('z-index', 2000);


                zIndex = zIndex + 1;
                console.log('putting on top with zIndex = ' + zIndex);
                // todo: check if already highest
                $element.css('z-index', zIndex);
            },

            topOnFocus: function topOnFocus($element) {
                var self = this;

                $element.on('mousedown.zIndexManager', function() {
                    self.putOnTop($element);
                });
            }
        };

        return zIndexManager;
    }

    return zIndexManagerFactory();
});