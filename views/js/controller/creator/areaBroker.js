/*
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
 * Copyright (c) 2017 (original work) Open Assessment Technlogies SA
 *
 */

/**
 *
 * Defines the test creator areas
 *
 * @author Christophe Noël <christophe@taotesting.com>
 */
define([
    'lodash',
    'core/areaBroker'
], function (_, areaBroker) {
    'use strict';

    var requireAreas = [
        'creator',
        'itemSelectorPanel',
        'contentCreatorPanel',
        'propertyPanel',
        'elementPropertyPanel'
    ];

    /**
     * Creates an area broker with the required areas for the item creator
     *
     * @see core/areaBroker
     *
     * @param {jQueryElement|HTMLElement|String} $container - the main container
     * @param {Object} mapping - keys are the area names, values are jQueryElement
     * @returns {broker} the broker
     * @throws {TypeError} without a valid container
     */
    return _.partial(areaBroker, requireAreas);

});
