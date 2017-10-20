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
 * This object holds a shared context for all of the test creator modules and allow them to communicate via events.
 * Its lifecycle is bound to the creator controller.
 *
 * @author Christophe Noël <christophe@taotesting.com>
 */
define([
    'jquery',
    'core/eventifier',
    'taoQtiTest/controller/creator/areaBroker',
    'taoQtiTest/controller/creator/modelOverseer'
], function($, eventifier, areaBrokerFactory, modelOverseerFactory) {
    'use strict';

    /**
     * @param {jQuery} $creatorContainer - root DOM element containing the creator
     * @param {Object} config - options that will be forwareded to the modelOverseer Factory
     * @returns {Object}
     */
    function testCreatorFactory($creatorContainer, config) {
        var testCreator;

        var $container,
            model,
            areaBroker,
            modelOverseer;

        /**
         * Create the model overseer with the given model
         * @returns {modelOverseer}
         */
        function loadModelOverseer() {
            if (! modelOverseer && model) {
                modelOverseer = modelOverseerFactory(model, config);
            }
            return modelOverseer;
        }

        /**
         * Set up the areaBroker mapping from the actual DOM
         * @returns {areaBroker} already mapped
         */
        function loadAreaBroker(){
            if (! areaBroker) {
                areaBroker = areaBrokerFactory($container, {
                    'creator': $container,
                    'itemSelectorPanel': $container.find('.test-creator-items'),
                    'contentCreatorPanel': $container.find('.test-creator-content'),
                    'propertyPanel': $container.find('.test-creator-props'),
                    'elementPropertyPanel': $container.find('.qti-widget-properties')
                });
            }
            return areaBroker;
        }

        if (! ($creatorContainer instanceof $)) {
            throw new TypeError('a valid $container must be given');
        }

        $container = $creatorContainer;

        testCreator = {
            setTestModel: function setTestModel(m) {
                model = m;
            },

            getAreaBroker: function getAreaBroker() {
                return loadAreaBroker();
            },

            getModelOverseer: function getModelOverseer() {
                return loadModelOverseer();
            }
        };
        return eventifier(testCreator);
    }

    return testCreatorFactory;
});