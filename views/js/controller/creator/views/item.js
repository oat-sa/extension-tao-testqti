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
 * Copyright (c) 2014 (original work) Open Assessment Technologies SA (under the project TAO-PRODUCT);
 */

/**
 * @author Bertrand Chevrier <bertrand@taotesting.com>
 */
define([
    'module',
    'jquery',
    'i18n',
    'core/logger',
    'taoQtiTest/provider/testItems',
    'ui/resource/selector',
    'ui/feedback'
], function (module, $, __, loggerFactory, testItemProviderFactory, resourceSelectorFactory, feedback) {
    'use strict';

    /**
     * Create a dedicated logger
     */
    const logger = loggerFactory('taoQtiTest/creator/views/item');

    /**
     * Let's you access the data
     */
    const testItemProvider = testItemProviderFactory();

    /**
     * Handles errors
     * @param {Error} err
     */
    const onError = function onError(err) {
        logger.error(err);
        feedback.error(err.message || __('An error occured while retrieving items'));
    };

    const ITEM_URI = 'http://www.tao.lu/Ontologies/TAOItem.rdf#Item';

    /**
     * The ItemView setup items related components
     * @exports taoQtiTest/controller/creator/views/item
     * @param {jQueryElement} $container - where to append the view
     */
    return function itemView($container) {
        const filters = module.config().BRS || false; // feature flag BRS (search by metadata) in Test Authoring
        const selectorConfig = {
            type: __('items'),
            selectionMode: resourceSelectorFactory.selectionModes.multiple,
            selectAllPolicy: resourceSelectorFactory.selectAllPolicies.visible,
            classUri: ITEM_URI,
            classes: [
                {
                    label: 'Item',
                    uri: ITEM_URI,
                    type: 'class'
                }
            ],
            filters
        };

        //set up the resource selector with one root class Item in classSelector
        const resourceSelector = resourceSelectorFactory($container, selectorConfig)
            .on('render', function () {
                $container.on('itemselected.creator', () => {
                    this.clearSelection();
                });
            })
            .on('query', function (params) {
                //ask the server the item from the component query
                testItemProvider
                    .getItems(params)
                    .then(items => {
                        //and update the item list
                        this.update(items, params);
                    })
                    .catch(onError);
            })
            .on('classchange', function (classUri) {
                //by changing the class we need to change the
                //properties filters
                testItemProvider
                    .getItemClassProperties(classUri)
                    .then(filters => {
                        this.updateFilters(filters);
                    })
                    .catch(onError);
            })
            .on('change', function (values) {
                /**
                 * We've got a selection, triggered on the view container
                 *
                 * TODO replace jquery events by the eventifier
                 *
                 * @event jQuery#itemselect.creator
                 * @param {Object[]} values - the selection
                 */
                $container.trigger('itemselect.creator', [values]);
            });

        //load the classes hierarchy
        testItemProvider
            .getItemClasses()
            .then(function (classes) {
                selectorConfig.classes = classes;
                selectorConfig.classUri = classes[0].uri;
            })
            .then(function () {
                //load the class properties
                return testItemProvider.getItemClassProperties(selectorConfig.classUri);
            })
            .then(function (filters) {
                //set the filters from the properties
                selectorConfig.filters = filters;
            })
            .then(function () {
                // add classes in classSelector
                selectorConfig.classes[0].children.forEach(node => {
                    resourceSelector.addClassNode(node, selectorConfig.classUri);
                });
                resourceSelector.updateFilters(selectorConfig.filters);
            })
            .catch(onError);
    };
});
