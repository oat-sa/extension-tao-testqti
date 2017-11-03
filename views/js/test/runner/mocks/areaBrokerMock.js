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
 * Copyright (c) 2016 (original work) Open Assessment Technologies SA ;
 */
/**
 * @author Jean-Sébastien Conan <jean-sebastien.conan@vesperiagroup.com>
 */
define([
    'jquery',
    'lodash',
    'tao/test/core/areaBroker/mock/areaBrokerMock',
    'taoQtiTest/runner/ui/toolbox/toolbox'
], function ($, _, areaBrokerMockFactory, toolboxFactory) {
    'use strict';

    /**
     * The mock
     * @type {Object}
     */
    var areaBroker;

    /**
     * The list of default areas
     * @type {String[]}
     */
    var defaultAreas = [
        'content',      //where the content is renderer, for example an item
        'toolbox',      //the place to add arbitrary tools, like a zoom, a comment box, etc.
        'navigation',   //the navigation controls like next, previous, skip
        'control',      //the control center of the test, progress, timers, etc.
        'header',       //the area that could contains the test titles
        'panel'         //a panel to add more advanced GUI (item review, navigation pane, etc.)
    ];

    /**
     * Builds and returns a new areaBroker with dedicated areas.
     * @param config.$brokerContainer - where to create the area broker - default to #qunit-fixture
     * @param {String[]} config.areas - A list of areas to create, or...
     * @param {Object} config.mapping - ... a list of already created areas
     * @returns {areaBroker} - Returns the new areaBroker
     */
    function areaBrokerMock(config) {

        config = _.defaults(config || {}, {
            defaultAreas: defaultAreas,
            id: 'test-runner'
        });

        areaBroker = areaBrokerMockFactory(config);

        areaBroker.setComponent('toolbox', toolboxFactory().init());

        return areaBroker;
    }

    return areaBrokerMock;
});
