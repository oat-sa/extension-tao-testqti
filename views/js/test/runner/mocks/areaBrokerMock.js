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
 * Copyright (c) 2016-2019 (original work) Open Assessment Technologies SA ;
 */
/**
 * @author Jean-Sébastien Conan <jean-sebastien.conan@vesperiagroup.com>
 * @author Christophe Noël <christophe@taotesting.com>
 */
define(['jquery', 'lodash', 'ui/areaBroker', 'taoQtiTest/runner/ui/toolbox/toolbox'], function(
    $,
    _,
    areaBrokerFactory,
    toolboxFactory
) {
    'use strict';

    /**
     * A counter utilised to generate the mock identifiers
     * @type {Number}
     */
    let mockId = 0;

    const classes = {
        areaBroker: 'area-broker-mock',
        area: 'test-area'
    };

    const defaultContainerSelector = '#qunit-fixture';

    /**
     * Builds and returns a new areaBroker with dedicated areas.
     * @param {Object} [config]
     * @param {String} config.id - area broker id, will be used as a class on container
     * @param {String[]} config.defaultAreas - mandatory areas to create
     * @param {jQuery} config.$brokerContainer - where to create the area broker - default to #qunit-fixture
     * @param {String[]} config.areas - A list of areas to create, or...
     * @param {Object} config.mapping - ... a list of already created areas
     * @returns {areaBroker} - Returns the new areaBroker
     */
    function areaBrokerMock(config) {
        config = _.defaults(config || {}, {
            defaultAreas: [
                'content', //where the content is renderer, for example an item
                'toolbox', //the place to add arbitrary tools, like a zoom, a comment box, etc.
                'navigation', //the navigation controls like next, previous, skip
                'control', //the control center of the test, progress, timers, etc.
                'header', //the area that could contains the test titles
                'panel' //a panel to add more advanced GUI (item review, navigation pane, etc.)
            ],
            id: 'test-runner'
        });

        const $areaBrokerDom = $('<div />')
            .attr('id', `area-broker-mock-${mockId++}`)
            .addClass(config.id || classes.areaBroker);

        // Create all areas from scratch
        if (!config.mapping) {
            config.mapping = {};
            if (!config.areas) {
                config.areas = config.defaultAreas;
            } else {
                config.areas = _.keys(_.merge(_.fromPairs(config.areas), _.fromPairs(config.defaultAreas)));
            }

            _.forEach(config.areas, areaId => {
                config.mapping[areaId] = $('<div />')
                    .addClass('test-area')
                    .addClass(areaId)
                    .appendTo($areaBrokerDom);
            });

            // Create only missing areas
        } else {
            _.union(config.defaultAreas, config.areas || []).forEach(areaId => {
                // create missing areas
                if (!config.mapping[areaId]) {
                    config.mapping[areaId] = $('<div />')
                        .addClass('test-area')
                        .addClass(areaId)
                        .appendTo($areaBrokerDom);
                }
            });
        }

        if (!config.$brokerContainer) {
            config.$brokerContainer = $(defaultContainerSelector);
        }
        config.$brokerContainer.append($areaBrokerDom);

        const areaBroker = areaBrokerFactory(config.defaultAreas, $areaBrokerDom, config.mapping);
        areaBroker.setComponent('toolbox', toolboxFactory().init());

        return areaBroker;
    }

    return areaBrokerMock;
});
